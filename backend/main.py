from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import joblib
import numpy as np
import os
import random
from datetime import datetime, timedelta
import asyncio
import jwt
import csv
from io import StringIO
from dotenv import load_dotenv

load_dotenv()

def _normalize_mongo_uri(uri: str | None) -> str | None:
    """Normalize common malformed Atlas URI query-string patterns."""
    if not uri:
        return uri
    # Fix malformed pattern: ...?appName=Cluster0?retryWrites=true&w=majority
    if "mongodb+srv://" in uri and "?appName=" in uri and "?retryWrites=" in uri:
        return uri.replace("?retryWrites=", "&retryWrites=")
    return uri

normalized_mongo_uri = _normalize_mongo_uri(os.getenv("MONGO_URI"))
if normalized_mongo_uri:
    os.environ["MONGO_URI"] = normalized_mongo_uri

from database import (
    get_user_by_username,
    verify_password,
    hash_password,
    get_all_users,
    mongodb_connected,
)

app = FastAPI(title="THREXIA AI Threat Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        access_level: list = payload.get("access_level", [])
        if username is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "role": role, "access_level": access_level}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- ML Loading ---

# --- ML Loading ---
# Load the real ML models (they have been moved to the models/ subdirectory)
try:
    model = joblib.load("models/threxia_model.joblib")
    scaler = joblib.load("models/threxia_scaler.joblib")
    print("SUCCESS: Loaded ML model and scaler from models/ directory.")
except Exception as e:
    model = None
    scaler = None
    print("WARNING: Could not load the model from models/ directory.", e)

# --- In-Memory State ---
state = {
    "total_logs_analyzed": 5420,
    "total_anomalies": 0,
    "system_activity_chart": [], # Replaces "chart_data" for clarity
    "users": [u["username"] for u in get_all_users()],
    "live_alerts": [],
    "all_logs": [] # Full audit trail (last 100 entries)
}

# Pre-fill system activity summary chart
now = datetime.now()
for i in range(24):
    dt = now - timedelta(hours=23 - i)
    state["system_activity_chart"].append({
        "time": dt.strftime("%H:00"),
        "normal_activity": random.randint(50, 150),
        "suspicious_activity": random.randint(0, 2)
    })

def generate_synthetic_features(is_anomalous=False):
    # Features order based on THREXIA model requirements:
    # 0: is_contractor, 1: emp_class, 2: foreign, 3: criminal, 4: medical, 
    # 5: printed, 6: printed off_hours, 7: burned, 8: burned_other, 
    # 9: abroad, 10: hostility, 11: entries, 12: campus, 13: late
    if not is_anomalous:
        return [
            random.choice([0, 1]), # is_contractor
            random.choice([1, 2, 3]), # emp_class
            0, # foreign
            0, # criminal
            0, # medical
            random.randint(0, 10), # printed
            0, # printed off_hours
            0, # burned (USB)
            0, # burned_other
            0, # abroad
            0, # hostility
            random.randint(1, 5), # normal system entries
            1, # campus
            0  # late
        ]
    else:
        return [
            1, # is_contractor
            3, # emp_class
            0, # foreign
            0, # criminal
            0, # medical
            random.randint(50, 500), # Sudden increase in printing
            random.randint(10, 100), # Abnormal off-hours activity
            random.randint(5, 50), # Unusual file transfers/ burned to USB
            random.randint(0, 10), # burned other
            0, # abroad
            random.randint(0, 2), # hostility
            random.randint(15, 50), # High frequency of system entries
            random.randint(1, 3), # campus
            1 # Abnormal login times (late)
        ]

def interpret_anomaly(features):
    explanations = []
    
    # 5: printed, 6: printed off_hours
    if features[6] > 0:
        explanations.append("Abnormal off-hours system activity and document access.")
    elif features[5] > 20:
        explanations.append("Sudden increase in system data extraction/printing.")
        
    # 7: burned
    if features[7] > 0:
        explanations.append("Unusual file transfer frequency to external drives.")
        
    # 11: entries
    if features[11] > 10:
        explanations.append("Abnormal login access patterns and high frequency entries.")
        
    # 13: late
    if features[13] == 1:
        explanations.append("Deviation from normal user behaviour: Logging in late at night.")
        
    if not explanations:
        explanations.append("General deviation from normal user baseline activity.")
        
    return explanations

async def event_stream_simulator():
    while True:
        await asyncio.sleep(3) # new batch every 3 seconds
        
        # Determine if this batch contains a malicious action
        is_anomaly = random.random() < 0.2
        features = generate_synthetic_features(is_anomalous=is_anomaly)
        
        state["total_logs_analyzed"] += 1
        log_id = f"LOG-{random.randint(10000, 99999)}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user = random.choice(state["users"]) if state["users"] else "system"
        
        if model and scaler:
            input_arr = np.array(features).reshape(1, -1)
            scaled = scaler.transform(input_arr)
            prediction = int(model.predict(scaled)[0])
            raw_score = model.score_samples(scaled)[0]
            
            if prediction == -1:
                base_conf = 85.0 + abs(raw_score) * 0.5 + random.uniform(0, 5)
                confidence = min(99.9, base_conf)
            else:
                confidence = min(99.9, max(50.0, (raw_score / 350.0) * 100))
            
            is_threat = (prediction == -1)
            
            # Update the current hour's chart data
            current_hour_idx = -1
            state["system_activity_chart"][current_hour_idx]["normal_activity"] += 1
            
            explanations = interpret_anomaly(features) if is_threat else ["Behavior falls within normal operational parameters."]
            
            log_entry = {
                "id": log_id,
                "time": timestamp,
                "user": user,
                "confidence_score": round(confidence, 1),
                "explanations": explanations,
                "type": "threat" if is_threat else "safe",
                "status": "Suspicious" if is_threat else "Normal",
                "features": features
            }
            
            # Add to full audit trail
            state["all_logs"].insert(0, log_entry)
            if len(state["all_logs"]) > 100:
                state["all_logs"].pop()

            if is_threat: # Model predicted Anomaly!
                state["total_anomalies"] += 1
                state["system_activity_chart"][current_hour_idx]["suspicious_activity"] += 1
                state["live_alerts"].insert(0, log_entry)
                if len(state["live_alerts"]) > 50:
                    state["live_alerts"].pop()

@app.on_event("startup")
async def startup_event():
    mongo_uri = os.getenv("MONGO_URI", "")
    if mongo_uri.startswith("mongodb+srv://") and not mongodb_connected:
        print("WARNING: MongoDB Atlas connection failed. Running in FALLBACK MODE.")
    
    # Ensure we have users in the system (especially for fallback mode)
    if not get_all_users():
        print("INFO: Database is empty. Seeding with default users...")
        try:
            from seed_data import seed_database
            seed_database()
            print("SUCCESS: Database seeded.")
        except Exception as e:
            print(f"ERROR: Could not seed database: {e}")
    
    # Refresh the users in state
    state["users"] = [u["username"] for u in get_all_users()]
    if not state["users"]:
        # Add a dummy user if still empty to prevent crash
        state["users"] = ["system_internal"]
        print("WARNING: No users found even after seeding. Using dummy user for simulator.")

    asyncio.create_task(event_stream_simulator())

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest):
    user = get_user_by_username(request.username)
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={
        "sub": request.username, 
        "role": user["role"],
        "access_level": user.get("access_level", [])
    })
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user["role"],
        "full_name": user.get("full_name", request.username),
        "access_level": user.get("access_level", [])
    }

@app.get("/api/dashboard")
def get_dashboard_data(current_user: dict = Depends(verify_token)):
    # Check if user has access to Dashboard stats (either via Dashboard or Overview permission)
    user_access = current_user.get("access_level", [])
    if "Dashboard" not in user_access and "Overview" not in user_access:
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Role '{current_user['role']}' does not have Intelligence clearance."
        )
    return {
        "status": "Running AI Model" if model else "Model Offline",
        "total_logs": state["total_logs_analyzed"],
        "total_anomalies": state["total_anomalies"],
        "chart_data": state["system_activity_chart"],
        "latest_alerts": state["live_alerts"][:5], # Send only the 5 most recent for the dashboard feed
        "user": current_user
    }
    
@app.get("/api/logs")
def get_all_logs(current_user: dict = Depends(verify_token)):
    # Check if user has access to Logs
    if "Logs" not in current_user.get("access_level", []):
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Role '{current_user['role']}' does not have Audit Trail clearance."
        )
    return state["all_logs"]

class ManualLog(BaseModel):
    features: list[float]

@app.post("/api/analyze_manual")
def analyze_manual_log(log: ManualLog, current_user: dict = Depends(verify_token)):
    # Check if user has access to Manual Analysis
    if "Manual Analysis" not in current_user.get("access_level", []):
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Role '{current_user['role']}' cannot perform manual analysis."
        )
    if not model or not scaler:
        return {"error": "Model offline"}
    
    try:
        input_arr = np.array(log.features).reshape(1, -1)
        scaled = scaler.transform(input_arr)
        prediction = int(model.predict(scaled)[0])
        raw_score = model.score_samples(scaled)[0]
        if prediction == -1:
            base_conf = 85.0 + abs(raw_score) * 0.5 + random.uniform(0, 5)
            confidence = min(99.9, base_conf)
        else:
            confidence = min(99.9, max(50.0, (raw_score / 350.0) * 100))
        explanations = interpret_anomaly(log.features) if prediction == -1 else ["Behavior falls strictly within normal operational parameters."]
        
        return {
            "prediction": "Threat" if prediction == -1 else "Normal",
            "confidence": round(confidence, 1),
            "explanations": explanations
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/upload_csv")
async def upload_csv(file: UploadFile = File(...), current_user: dict = Depends(verify_token)):
    # Check if user has access to Manual Analysis
    if "Manual Analysis" not in current_user.get("access_level", []):
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Role '{current_user['role']}' cannot upload or batch process logs."
        )
    if not model or not scaler:
        return {"error": "Model offline"}
    
    try:
        # Read the uploaded file
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        csv_reader = csv.reader(StringIO(csv_data))
        
        results = []
        headers = None
        
        for row_idx, row in enumerate(csv_reader):
            # Skip header row if it exists
            if row_idx == 0:
                headers = row
                # Check if first row looks like a header (contains non-numeric values)
                try:
                    [float(x) for x in row]
                except ValueError:
                    # This is a header, skip it
                    continue
            
            # Try to parse row as features
            try:
                features = [float(x.strip()) for x in row if x.strip()]
                
                # Ensure we have exactly 14 features
                if len(features) != 14:
                    results.append({
                        "row": row_idx,
                        "error": f"Expected 14 features, got {len(features)}"
                    })
                    continue
                
                # Run prediction
                input_arr = np.array(features).reshape(1, -1)
                scaled = scaler.transform(input_arr)
                prediction = int(model.predict(scaled)[0])
                raw_score = model.score_samples(scaled)[0]
                
                if prediction == -1:
                    base_conf = 85.0 + abs(raw_score) * 0.5 + random.uniform(0, 5)
                    confidence = min(99.9, base_conf)
                else:
                    confidence = min(99.9, max(50.0, (raw_score / 350.0) * 100))
                
                explanations = interpret_anomaly(features) if prediction == -1 else ["Behavior falls within normal operational parameters."]
                
                results.append({
                    "row": row_idx,
                    "features": features,
                    "prediction": "Threat" if prediction == -1 else "Normal",
                    "confidence": round(confidence, 1),
                    "explanations": explanations
                })
            except ValueError as e:
                results.append({
                    "row": row_idx,
                    "error": f"Invalid numeric data: {str(e)}"
                })
        
        return {
            "filename": file.filename,
            "rows_processed": len(results),
            "results": results
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/download_csv_template")
def download_csv_template_endpoint(current_user: dict = Depends(verify_token)):
    """Returns a CSV template with sample data (Overview access required)"""
    if "Overview" not in current_user.get("access_level", []):
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Role '{current_user['role']}' does not have sufficient clearance to download templates."
        )
    
    # Headers for the CSV
    headers = ["is_contractor", "emp_class", "foreign", "criminal", "medical", 
               "printed", "printed_off_hours", "burned", "burned_other", "abroad", 
               "hostility", "entries", "campus", "late"]
    
    # Sample template with 3 rows
    template_data = [
        headers,
        ["0", "1", "0", "0", "0", "5", "0", "0", "0", "0", "0", "2", "1", "0"],  # Normal
        ["1", "3", "0", "0", "0", "500", "50", "45", "0", "0", "2", "40", "2", "1"],  # Anomaly
    ]
    
    csv_output = StringIO()
    writer = csv.writer(csv_output)
    writer.writerows(template_data)
    
    return {
        "template": csv_output.getvalue(),
        "filename": "threxia_template.csv"
    }

# =============== USER MANAGEMENT ENDPOINTS ===============

@app.get("/api/users")
def get_all_users_endpoint(current_user: dict = Depends(verify_token)):
    """Get all users (admin only - users with full access)"""
    if "Overview" not in current_user.get("access_level", []):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    users = get_all_users()
    # Remove sensitive data
    for user in users:
        user.pop("password", None)
        user.pop("_id", None)
    return {"users": users, "total": len(users)}

@app.post("/api/seed-database")
def seed_database_endpoint(current_user: dict = Depends(verify_token)):
    """Seed the database with default users (admin only)"""
    # Only Security Analysts should be able to seed
    if current_user["role"] != "Security Analyst":
        raise HTTPException(status_code=403, detail="Only Security Analysts can seed the database")
    
    try:
        from seed_data import seed_database
        seed_database()
        
        # Update state with new users
        state["users"] = [u["username"] for u in get_all_users()]
        
        return {
            "message": "Database seeded successfully",
            "users_count": len(state["users"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error seeding database: {str(e)}")
