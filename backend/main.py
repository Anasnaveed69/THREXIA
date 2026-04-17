from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
import random
from datetime import datetime, timedelta
import asyncio

app = FastAPI(title="THREXIA AI Threat Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    "users": ["Emp_John", "Emp_Sarah", "Emp_Michael", "Contractor_Alex"],
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
                "status": "Suspicious" if is_threat else "Normal"
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

@app.get("/api/dashboard")
def get_dashboard_data():
    return {
        "status": "Running AI Model" if model else "Model Offline",
        "total_logs": state["total_logs_analyzed"],
        "total_anomalies": state["total_anomalies"],
        "chart_data": state["system_activity_chart"],
        "latest_alerts": state["live_alerts"][:5] # Send only the 5 most recent for the dashboard feed
    }
    
@app.get("/api/logs")
def get_all_logs():
    return state["all_logs"]

class ManualLog(BaseModel):
    features: list[float]

@app.post("/api/analyze_manual")
def analyze_manual_log(log: ManualLog):
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
