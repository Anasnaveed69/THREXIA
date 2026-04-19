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
from passlib.context import CryptContext
import csv
from io import StringIO

app = FastAPI(title="THREXIA AI Threat Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# --- Users Database ---
users_db = {
    "Emp_John": {"password": pwd_context.hash("password123"), "role": "employee"},
    "Emp_Sarah": {"password": pwd_context.hash("password123"), "role": "employee"},
    "Emp_Michael": {"password": pwd_context.hash("password123"), "role": "employee"},
    "Contractor_Alex": {"password": pwd_context.hash("password123"), "role": "contractor"},
}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

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
        if username is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "role": role}
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
    "users": list(users_db.keys()),
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
        user = random.choice(state["users"])
        
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
    asyncio.create_task(event_stream_simulator())

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest):
    user = users_db.get(request.username)
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": request.username, "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}

@app.get("/api/dashboard")
def get_dashboard_data(current_user: dict = Depends(verify_token)):
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
    if current_user["role"] == "contractor":
        # Contractors see only their own logs or limited
        user_logs = [log for log in state["all_logs"] if log["user"] == current_user["username"]]
        return user_logs[:20]  # Limited
    return state["all_logs"]

class ManualLog(BaseModel):
    features: list[float]

@app.post("/api/analyze_manual")
def analyze_manual_log(log: ManualLog, current_user: dict = Depends(verify_token)):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Access denied")
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
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Access denied")
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
def download_csv_template(current_user: dict = Depends(verify_token)):
    """Returns a CSV template with sample data"""
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Sample template with 5 rows
    template_data = [
        ["contractor", "emp_class", "foreign", "criminal", "medical", "printed", "off_hours", "burned", "burned_other", "abroad", "hostility", "entries", "campus", "late"],
        ["0", "1", "0", "0", "0", "5", "0", "0", "0", "0", "0", "2", "1", "0"],  # Normal
        ["0", "2", "0", "0", "0", "8", "0", "0", "0", "0", "0", "3", "1", "0"],  # Normal
        ["1", "3", "0", "0", "0", "500", "50", "45", "0", "0", "2", "40", "2", "1"],  # Anomaly
        ["0", "1", "0", "0", "0", "150", "30", "20", "0", "0", "1", "25", "1", "1"],  # Anomaly
    ]
    
    csv_output = StringIO()
    writer = csv.writer(csv_output)
    writer.writerows(template_data)
    
    return {
        "template": csv_output.getvalue(),
        "filename": "threxia_template.csv"
    }
