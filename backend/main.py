"""
THREXIA — FastAPI Backend
AI-Powered Insider Threat Intelligence Platform
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import joblib
import numpy as np
import os
import random
import secrets
import string
from datetime import datetime, timedelta
import asyncio
import jwt
import csv
from io import StringIO
from dotenv import load_dotenv

load_dotenv()

# ── Normalise Atlas URI if malformed ──────────────────────────────────────────
def _normalize_mongo_uri(uri: str | None) -> str | None:
    if not uri:
        return uri
    if "mongodb+srv://" in uri and "?appName=" in uri and "?retryWrites=" in uri:
        return uri.replace("?retryWrites=", "&retryWrites=")
    return uri

_raw_uri = os.getenv("MONGO_URI")
if _raw_uri:
    os.environ["MONGO_URI"] = _normalize_mongo_uri(_raw_uri)

# ── DB & email imports ────────────────────────────────────────────────────────
from database import (
    get_user_by_username,
    get_user_by_email,
    verify_password,
    hash_password,
    get_all_users,
    get_pending_users,
    create_user,
    update_user_status,
    update_user_password,
    delete_user,
    log_operation,
    get_audit_logs,
    create_password_reset_request,
    get_pending_password_resets,
    resolve_password_reset,
    save_telemetry_log,
    get_telemetry_logs,
    update_log_action,
    mongodb_connected,
    ROLE_ACCESS_MAP,
)
from email_service import (
    notify_admin_new_request,
    notify_user_approved,
    notify_user_rejected,
    notify_admin_password_reset,
    notify_user_password_reset_fulfilled,
)

# ─────────────────────────────────────────────
#  App Bootstrap
# ─────────────────────────────────────────────
app = FastAPI(
    title="THREXIA — AI Threat Intelligence API",
    description="Backend for the THREXIA insider-threat detection platform.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://threxia.work.gd",
        "https://threxia.vercel.app",
        "https://threxia-anasnaveed69s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Security / JWT
# ─────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "threxia-secure-key-2024")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
security   = HTTPBearer()


def create_access_token(data: dict, expires_minutes: int = 60) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload      = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str     = payload.get("sub")
        role: str         = payload.get("role")
        access_level: list = payload.get("access_level", [])
        if not username or not role:
            raise HTTPException(status_code=401, detail="Invalid token payload.")
        return {"username": username, "role": role, "access_level": access_level}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")


def require_permission(permission: str):
    """Dependency factory — checks that current user has a specific permission."""
    def _check(current_user: dict = Depends(verify_token)):
        if permission not in current_user.get("access_level", []):
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Your role '{current_user['role']}' does not have '{permission}' clearance.",
            )
        return current_user
    return _check


# ─────────────────────────────────────────────
#  ML Model Loading
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "threxia_model.joblib")
SCALER_PATH = os.path.join(BASE_DIR, "models", "threxia_scaler.joblib")

try:
    model  = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print(f"[SUCCESS] ML model loaded from {MODEL_PATH}")
except Exception as e:
    model = scaler = None
    print(f"[WARNING] ML model offline: {e}")

# ─────────────────────────────────────────────
#  Live State
# ─────────────────────────────────────────────
state = {
    "total_logs_analyzed":  5420,
    "total_anomalies":      0,
    "system_activity_chart": [],
    "users":                [],
    "live_alerts":          [],
    "all_logs":             [],
    "active_sessions":      {},   # username -> {role, login_time, ip, full_name}
}

_now = datetime.now()
for _i in range(24):
    _dt = _now - timedelta(hours=23 - _i)
    state["system_activity_chart"].append({
        "time":               _dt.strftime("%H:00"),
        "normal_activity":    random.randint(50, 150),
        "suspicious_activity": random.randint(0, 2),
    })


# ─────────────────────────────────────────────
#  ML Helpers
# ─────────────────────────────────────────────
def _generate_synthetic_features(anomalous: bool = False) -> list:
    if not anomalous:
        return [
            random.choice([0, 1]), random.choice([1, 2, 3]),
            0, 0, 0, random.randint(0, 10), 0, 0, 0, 0, 0,
            random.randint(1, 5), 1, 0,
        ]
    return [
        1, 3, 0, 0, 0,
        random.randint(50, 500), random.randint(10, 100),
        random.randint(5, 50),   random.randint(0, 10),
        0, random.randint(0, 2), random.randint(15, 50),
        random.randint(1, 3),    1,
    ]


def _interpret_anomaly(features: list) -> list[str]:
    msgs = []
    if features[6] > 0:   msgs.append("Abnormal off-hours system activity and document access.")
    elif features[5] > 20: msgs.append("Sudden increase in system data extraction/printing.")
    if features[7] > 0:   msgs.append("Unusual file transfer frequency to external drives.")
    if features[11] > 10: msgs.append("Abnormal login access patterns and high frequency entries.")
    if features[13] == 1: msgs.append("Deviation from normal user behaviour: Logging in late at night.")
    return msgs or ["General deviation from normal user baseline activity."]


# ─────────────────────────────────────────────
#  Background Simulator
# ─────────────────────────────────────────────
async def _event_stream_simulator():
    while True:
        await asyncio.sleep(3)
        anomalous = random.random() < 0.2
        features  = _generate_synthetic_features(anomalous)

        state["total_logs_analyzed"] += 1
        log_id    = f"LOG-{random.randint(10000,99999)}"
        timestamp = datetime.utcnow().isoformat() + "Z"
        user      = random.choice(state["users"]) if state["users"] else "system"

        # Determine threat status (use model if available, otherwise random fallback)
        if model and scaler:
            try:
                arr        = np.array(features).reshape(1, -1)
                scaled     = scaler.transform(arr)
                prediction = int(model.predict(scaled)[0])
                raw_score  = model.score_samples(scaled)[0]
                is_threat  = (prediction == -1)
                confidence = round(min(99.9, 85.0 + abs(raw_score) * 0.5) if is_threat else min(99.9, max(50.0, (raw_score / 350.0) * 100)), 1)
            except Exception as e:
                is_threat = anomalous
                confidence = 85.0 if is_threat else 95.0
        else:
            is_threat = anomalous
            confidence = 0.0 # Indication that AI model is offline (fallback active)

        explanations = _interpret_anomaly(features) if is_threat else ["Behavior falls within normal operational parameters."]

        entry = {
            "id":               log_id,
            "time":             timestamp,
            "user":             user,
            "confidence_score": confidence,
            "explanations":     explanations,
            "type":             "threat" if is_threat else "safe",
            "status":           "Suspicious" if is_threat else "Normal",
            "features":         features,
        }

        state["all_logs"].insert(0, entry)
        if len(state["all_logs"]) > 100:
            state["all_logs"].pop()

        # Persist to database
        save_telemetry_log(entry)

        state["system_activity_chart"][-1]["normal_activity"] += 1

        if is_threat:
            state["total_anomalies"] += 1
            state["system_activity_chart"][-1]["suspicious_activity"] += 1
            state["live_alerts"].insert(0, entry)
            if len(state["live_alerts"]) > 50:
                state["live_alerts"].pop()


@app.on_event("startup")
async def startup_event():
    if not mongodb_connected:
        print("[WARNING] Running in FALLBACK MODE — MongoDB unavailable.")

    # Auto-seed if the database is completely empty
    if not get_all_users():
        print("[INFO] No users found. Running seed script...")
        try:
            from seed_data import seed_database
            seed_database()
        except Exception as e:
            print(f"[ERROR] Seeding failed: {e}")

    # Populate state with active-user list for the simulator
    state["users"] = [u["username"] for u in get_all_users() if u.get("status") == "active"]
    if not state["users"]:
        state["users"] = ["system_internal"]

    asyncio.create_task(_event_stream_simulator())
    print("[READY] THREXIA API is live.")


# ─────────────────────────────────────────────
#  Pydantic Schemas
# ─────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username:  str
    full_name: str
    email:     str
    role:      str
    reason:    str

class ApproveRequest(BaseModel):
    username: str

class RejectRequest(BaseModel):
    username: str
    reason:   str | None = None

class ManualLog(BaseModel):
    features: list[float]

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password:     str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordAdminRequest(BaseModel):
    username: str

class LogActionRequest(BaseModel):
    log_id: str
    action: str  # "resolved" | "escalated"


# ─────────────────────────────────────────────
#  ① Authentication Endpoints
# ─────────────────────────────────────────────

@app.post("/api/login", tags=["Auth"])
def login(request: LoginRequest):
    """Authenticate a user and return a JWT access token."""
    user = get_user_by_username(request.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    status = user.get("status", "active")
    if status == "pending":
        raise HTTPException(
            status_code=403,
            detail="Your account is pending administrator approval. You will be notified by email once clearance is granted.",
        )
    if status == "rejected":
        raise HTTPException(
            status_code=403,
            detail="Your access request has been declined. Contact buttanas813@gmail.com for further information.",
        )

    token = create_access_token({
        "sub":          request.username,
        "role":         user["role"],
        "access_level": user.get("access_level", []),
    })

    log_operation(request.username, "LOGIN", {"role": user["role"]})

    # Record active session
    state["active_sessions"][request.username] = {
        "username":   request.username,
        "full_name":  user.get("full_name", request.username),
        "role":       user["role"],
        "login_time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "login_ts":   datetime.utcnow().isoformat(),
    }

    return {
        "access_token": token,
        "token_type":   "bearer",
        "role":         user["role"],
        "full_name":    user.get("full_name", request.username),
        "access_level": user.get("access_level", []),
    }


@app.post("/api/auth/forgot-password", tags=["Auth"])
def forgot_password(request: ForgotPasswordRequest):
    """Submit a password reset request to the administrator."""
    user = get_user_by_email(request.email)
    if not user:
        # For security, we return the same message even if email doesn't exist
        return {"message": "If your account exists, a reset request has been logged for the administrator."}
    
    create_password_reset_request(user["username"], user["email"])
    
    # Log the event
    log_operation(user["username"], "FORGOT_PASSWORD_REQUEST", {"email": request.email})
    
    # Trigger Admin Notification
    notify_admin_password_reset(user["username"], user["email"])
    
    return {"message": "Your reset request has been sent to the system administrator."}


# ─────────────────────────────────────────────
#  ② Public Registration Endpoint
# ─────────────────────────────────────────────

# Roles that can be publicly requested (System Administrator is hidden)
PUBLIC_ROLES = {"Security Analyst", "IT Manager", "Student/Researcher"}

@app.post("/api/register", tags=["Auth"], status_code=201)
def register(request: RegisterRequest, background_tasks: BackgroundTasks):
    """
    Submit an access request.
    The account is created with status='pending' and an empty access level.
    The System Administrator role is blocked from public registration.
    """
    # ── Validate role ─────────────────────────────────────────────────────────
    if request.role not in PUBLIC_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Role '{request.role}' is not available for public registration.",
        )

    # ── Sanitise inputs ───────────────────────────────────────────────────────
    username = request.username.strip().lower()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if len(request.reason.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide a more detailed justification (min 20 characters).")

    # ── Check duplicates ──────────────────────────────────────────────────────
    if get_user_by_username(username):
        raise HTTPException(status_code=409, detail=f"Username '{username}' is already taken.")
    if get_user_by_email(request.email):
        raise HTTPException(status_code=409, detail="An account with this email address already exists.")

    # ── Generate a temporary placeholder password (not usable until approved) ─
    _temp_placeholder = secrets.token_hex(24)

    result = create_user(
        username=username,
        password=_temp_placeholder,
        full_name=request.full_name.strip(),
        role=request.role,
        access_level=[],          # no access until approved
        email=request.email.strip().lower(),
        status="pending",
        reason=request.reason.strip(),
    )

    if result is None:
        raise HTTPException(status_code=409, detail="Username or email already registered.")

    # ── Fire-and-forget email to admin ────────────────────────────────────────
    background_tasks.add_task(
        notify_admin_new_request,
        full_name=request.full_name,
        username=username,
        email=request.email,
        role=request.role,
        reason=request.reason,
    )

    log_operation(username, "REGISTER_REQUEST", {"role": request.role, "email": request.email})

    return {
        "message": "Access request submitted successfully. You will receive an email once your clearance is granted.",
        "username": username,
        "role":     request.role,
        "status":   "pending",
    }


# ─────────────────────────────────────────────
#  ③ Admin — Access Control Endpoints
# ─────────────────────────────────────────────

def _require_admin(current_user: dict = Depends(verify_token)) -> dict:
    if "Access Control" not in current_user.get("access_level", []):
        raise HTTPException(
            status_code=403,
            detail="Access Denied: System Administrator clearance required.",
        )
    return current_user


@app.get("/api/admin/pending", tags=["Admin"])
def get_pending_requests(current_user: dict = Depends(_require_admin)):
    """Return all pending access requests (System Administrator only)."""
    pending = get_pending_users()
    # Ensure datetime objects are serialisable
    for u in pending:
        if hasattr(u.get("created_at"), "strftime"):
            u["created_at"] = u["created_at"].strftime("%Y-%m-%d %H:%M:%S")
    return {"pending": pending, "count": len(pending)}


@app.post("/api/admin/approve", tags=["Admin"])
def approve_user(request: ApproveRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(_require_admin)):
    """
    Approve a pending user.
    - Generates a secure temporary password.
    - Updates user status to 'active' with the correct access level.
    - Emails the credentials to the user.
    """
    user = get_user_by_username(request.username)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{request.username}' not found.")
    if user.get("status") != "pending":
        raise HTTPException(status_code=400, detail=f"User '{request.username}' is not in a pending state.")

    # ── Generate a strong temporary password ─────────────────────────────────
    alphabet   = string.ascii_letters + string.digits + "!@#$%"
    temp_pass  = "".join(secrets.choice(alphabet) for _ in range(14))

    # Update password hash in DB
    from database import _users_col, hash_password as _hash
    col = _users_col()
    if col is not None:
        col.update_one(
            {"username": request.username},
            {"$set": {"password": _hash(temp_pass)}}
        )
    else:
        from database import _fallback_users, hash_password as _hash2
        if request.username in _fallback_users:
            _fallback_users[request.username]["password"] = _hash2(temp_pass)

    # Activate the account
    update_user_status(request.username, "active", approved_by=current_user["username"])

    # Refresh live simulator user list
    state["users"] = [u["username"] for u in get_all_users() if u.get("status") == "active"]

    # Email the user their credentials (background)
    background_tasks.add_task(
        notify_user_approved,
        full_name=user.get("full_name", request.username),
        email=user.get("email", ""),
        username=request.username,
        role=user["role"],
        temp_password=temp_pass,
    )

    log_operation(
        current_user["username"], "APPROVE_USER",
        {"approved_user": request.username, "role": user["role"]},
    )

    return {
        "message":   f"User '{request.username}' has been approved and notified by email.",
        "username":  request.username,
        "role":      user["role"],
        "temp_pass": temp_pass,   # shown once in the API response for the admin
    }


@app.post("/api/admin/reject", tags=["Admin"])
def reject_user(request: RejectRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(_require_admin)):
    """Reject and delete a pending user's access request."""
    user = get_user_by_username(request.username)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{request.username}' not found.")
    if user.get("status") != "pending":
        raise HTTPException(status_code=400, detail=f"User '{request.username}' is not in a pending state.")

    # Notify the user first (we need their email before deleting)
    background_tasks.add_task(
        notify_user_rejected,
        full_name=user.get("full_name", request.username),
        email=user.get("email", ""),
        role=user["role"],
        reason=request.reason,
    )

    # Delete their record
    delete_user(request.username)

    log_operation(
        current_user["username"], "REJECT_USER",
        {"rejected_user": request.username, "role": user["role"], "reason": request.reason},
    )

    return {"message": f"User '{request.username}' has been rejected and their record removed."}


@app.get("/api/admin/audit-logs", tags=["Admin"])
def get_system_audit_logs(limit: int = 100, current_user: dict = Depends(_require_admin)):
    """Return system audit logs (System Administrator only)."""
    return {"logs": get_audit_logs(limit=limit), "count": limit}


@app.get("/api/users", tags=["Admin"])
def list_all_users(current_user: dict = Depends(_require_admin)):
    """Return all users with sensitive fields stripped (System Administrator only)."""
    users = get_all_users()
    for u in users:
        u.pop("password", None)
        if hasattr(u.get("created_at"), "strftime"):
            u["created_at"] = u["created_at"].strftime("%Y-%m-%d %H:%M:%S")
        if hasattr(u.get("approved_at"), "strftime"):
            u["approved_at"] = u["approved_at"].strftime("%Y-%m-%d %H:%M:%S")
    return {"users": users, "total": len(users)}


@app.get("/api/admin/reset-requests", tags=["Admin"])
def get_reset_requests(current_user: dict = Depends(_require_admin)):
    """Return all pending password reset requests (System Administrator only)."""
    return {"requests": get_pending_password_resets()}


@app.post("/api/admin/reset-password", tags=["Admin"])
def reset_user_password(request: ResetPasswordAdminRequest, current_user: dict = Depends(_require_admin)):
    """Reset a user's password and send them a new temporary one (System Administrator only)."""
    user = get_user_by_username(request.username)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{request.username}' not found.")
    
    # Generate a temporary password
    temp_pass = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    hashed = hash_password(temp_pass)
    
    # Update DB
    update_user_password(request.username, hashed)
    resolve_password_reset(request.username)
    
    # Log the action
    log_operation(current_user["username"], "ADMIN_RESET_PASSWORD", {"target_user": request.username})
    
    # Trigger User Notification
    notify_user_password_reset_fulfilled(user.get("email", ""), temp_pass)
    
    return {
        "message":   f"Password for '{request.username}' has been reset.",
        "temp_pass": temp_pass
    }


@app.get("/api/admin/sessions", tags=["Admin"])
def get_active_sessions(current_user: dict = Depends(_require_admin)):
    """Return all currently active login sessions (System Administrator only)."""
    sessions = list(state["active_sessions"].values())
    # Sort by most recent login
    sessions.sort(key=lambda s: s.get("login_ts", ""), reverse=True)
    return {
        "sessions":     sessions,
        "total_active": len(sessions),
    }


class TerminateSessionRequest(BaseModel):
    username: str


@app.post("/api/admin/sessions/terminate", tags=["Admin"])
def terminate_session(request: TerminateSessionRequest, current_user: dict = Depends(_require_admin)):
    """Remove a user's active session record (force logout on next request)."""
    if request.username == current_user["username"]:
        raise HTTPException(status_code=400, detail="You cannot terminate your own session.")
    if request.username not in state["active_sessions"]:
        raise HTTPException(status_code=404, detail=f"No active session found for '{request.username}'.")

    state["active_sessions"].pop(request.username, None)
    log_operation(current_user["username"], "TERMINATE_SESSION", {"target_user": request.username})
    return {"message": f"Session for '{request.username}' has been terminated."}


# ─────────────────────────────────────────────
#  ⑥ User Settings & Password Management
# ─────────────────────────────────────────────

@app.post("/api/user/change-password", tags=["User Settings"])
def change_password(request: ChangePasswordRequest, current_user: dict = Depends(verify_token)):
    """Allow an authenticated user to change their own password."""
    user = get_user_by_username(current_user["username"])
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")
    
    # Verify current password
    if not verify_password(request.current_password, user["password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")
    
    # Hash and save new password
    hashed = hash_password(request.new_password)
    update_user_password(current_user["username"], hashed)
    
    log_operation(current_user["username"], "CHANGE_PASSWORD", {"details": "User changed their own password."})
    
    return {"message": "Password updated successfully."}


# ─────────────────────────────────────────────
#  ⑦ Dashboard / Analytics Endpoints
# ─────────────────────────────────────────────

@app.get("/api/dashboard", tags=["Analytics"])
def get_dashboard_data(current_user: dict = Depends(verify_token)):
    user_access = current_user.get("access_level", [])
    if "Dashboard" not in user_access and "Overview" not in user_access and current_user.get("role") != "Security Analyst":
        raise HTTPException(status_code=403, detail="Access Denied: No intelligence clearance.")

    log_operation(current_user["username"], "VIEW_DASHBOARD")

    # Direct sync with MongoDB (same as Logs page)
    try:
        from database import telemetry_logs
        total_logs = telemetry_logs.count_documents({})
        total_anomalies = telemetry_logs.count_documents({"type": "threat"})
        
        # Absolute safety: If DB is fresh, use seeded baseline
        if total_logs < 100:
            total_logs = state["total_logs_analyzed"]
            total_anomalies = state["total_anomalies"]
    except Exception as e:
        total_logs      = state["total_logs_analyzed"]
        total_anomalies = state["total_anomalies"]

    # ── Executive Metrics (for IT Manager / SysAdmin) ─────────────────────────
    neutralization_rate = round(100.0 - ((total_anomalies / max(total_logs, 1)) * 100), 2)
    neutralization_rate = max(0.0, min(100.0, neutralization_rate))

    # System integrity score: A+ → F based on anomaly density
    anomaly_pct = (total_anomalies / max(total_logs, 1)) * 100
    if anomaly_pct < 2:   integrity_score = "A+"
    elif anomaly_pct < 5: integrity_score = "A"
    elif anomaly_pct < 10: integrity_score = "B"
    elif anomaly_pct < 20: integrity_score = "C"
    else:                  integrity_score = "D"

    all_users     = get_all_users()
    active_users  = [u for u in all_users if u.get("status") == "active"]
    pending_users = [u for u in all_users if u.get("status") == "pending"]

    # Breakdown by role
    role_breakdown = {}
    for u in active_users:
        role = u.get("role", "Unknown")
        role_breakdown[role] = role_breakdown.get(role, 0) + 1

    # Recent 7-day alert trend (simulated from chart data)
    recent_chart = state["system_activity_chart"][-7:] if len(state["system_activity_chart"]) >= 7 else state["system_activity_chart"]
    weekly_threats = sum(p.get("suspicious_activity", 0) for p in recent_chart)

    return {
        "status":               "Running AI Model" if model else "Model Offline",
        "total_logs":           total_logs,
        "total_anomalies":      total_anomalies,
        "chart_data":           state["system_activity_chart"],
        "latest_alerts":        state["live_alerts"][:5],
        "user":                 current_user,
        # Executive intelligence fields
        "neutralization_rate":  neutralization_rate,
        "integrity_score":      integrity_score,
        "active_users_count":   len(active_users),
        "pending_users_count":  len(pending_users),
        "role_breakdown":       role_breakdown,
        "weekly_threats":       weekly_threats,
        "model_status":         "ONLINE" if model else "OFFLINE",
    }


# ─────────────────────────────────────────────
#  ⑧ Intelligence Report Generation
# ─────────────────────────────────────────────

def _require_manager(current_user: dict = Depends(verify_token)) -> dict:
    """Allow IT Managers and System Administrators to access reporting endpoints."""
    role = current_user.get("role", "")
    if role not in ("IT Manager", "System Administrator"):
        raise HTTPException(
            status_code=403,
            detail="Access Denied: Intelligence reporting requires IT Manager or System Administrator clearance.",
        )
    return current_user


@app.get("/api/intelligence/report", tags=["Intelligence"])
def generate_intelligence_report(current_user: dict = Depends(_require_manager)):
    """
    Generate a comprehensive security intelligence report for IT Managers and System Administrators.
    Returns structured data for dashboard display and CSV export.
    """
    # Sync with MongoDB for accurate counts
    from database import telemetry_logs
    if telemetry_logs is not None:
        try:
            total_logs = telemetry_logs.count_documents({})
            total_anomalies = telemetry_logs.count_documents({"type": "threat"})
            
            # Fallback to state if DB is empty (initial deployment)
            if total_logs == 0:
                total_logs = state["total_logs_analyzed"]
                total_anomalies = state["total_anomalies"]
        except:
            total_logs = state["total_logs_analyzed"]
            total_anomalies = state["total_anomalies"]
    else:
        total_logs      = state["total_logs_analyzed"]
        total_anomalies = state["total_anomalies"]

    total_normal    = total_logs - total_anomalies

    anomaly_pct         = round((total_anomalies / max(total_logs, 1)) * 100, 2)
    neutralization_rate = round(100.0 - anomaly_pct, 2)

    if anomaly_pct < 2:    integrity_score, integrity_color = "A+", "#10B981"
    elif anomaly_pct < 5:  integrity_score, integrity_color = "A",  "#22C55E"
    elif anomaly_pct < 10: integrity_score, integrity_color = "B",  "#EAB308"
    elif anomaly_pct < 20: integrity_score, integrity_color = "C",  "#F97316"
    else:                  integrity_score, integrity_color = "D",  "#EF4444"

    all_users    = get_all_users()
    active_users = [u for u in all_users if u.get("status") == "active"]

    role_breakdown = {}
    for u in active_users:
        role = u.get("role", "Unknown")
        role_breakdown[role] = role_breakdown.get(role, 0) + 1

    # Analyse chart for peak threat hour
    chart = state["system_activity_chart"]
    peak_hour_entry = max(chart, key=lambda x: x.get("suspicious_activity", 0)) if chart else {}
    peak_hour       = peak_hour_entry.get("time", "N/A")

    # Recent critical threats from live_alerts
    recent_threats = [
        {
            "id":         a.get("id"),
            "time":       a.get("time"),
            "user":       a.get("user"),
            "confidence": a.get("confidence_score"),
            "reason":     a.get("explanations", ["N/A"])[0],
        }
        for a in state["live_alerts"][:10]
    ]

    # Weekly trend (last 7 points from chart)
    weekly_data = chart[-7:] if len(chart) >= 7 else chart

    # Audit log summary (last 20 operations)
    audit_logs   = get_audit_logs(limit=20)
    op_frequency = {}
    for log in audit_logs:
        op = log.get("operation", "UNKNOWN")
        op_frequency[op] = op_frequency.get(op, 0) + 1

    log_operation(current_user["username"], "GENERATE_REPORT", {"report_type": "intelligence_summary"})

    report_generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    return {
        "report_metadata": {
            "generated_at":    report_generated_at,
            "generated_by":    current_user["username"],
            "role":            current_user["role"],
            "classification":  "CONFIDENTIAL — INTERNAL USE ONLY",
            "platform":        "THREXIA AI Threat Intelligence Platform v2.0",
        },
        "executive_summary": {
            "total_logs_analyzed":  total_logs,
            "total_anomalies":      total_anomalies,
            "total_normal":         total_normal,
            "anomaly_rate_pct":     anomaly_pct,
            "neutralization_rate":  neutralization_rate,
            "integrity_score":      integrity_score,
            "integrity_color":      integrity_color,
            "peak_threat_hour":     peak_hour,
            "active_users":         len(active_users),
            "total_users":          len(all_users),
        },
        "personnel_intelligence": {
            "role_breakdown":   role_breakdown,
            "active_usernames": [u["username"] for u in active_users],
        },
        "threat_intelligence": {
            "recent_critical_threats": recent_threats,
            "weekly_activity_trend":   weekly_data,
            "operation_frequency":     op_frequency,
        },
        "recommendations": _generate_recommendations(anomaly_pct, total_anomalies),
    }


def _generate_recommendations(anomaly_pct: float, total_anomalies: int) -> list[dict]:
    """Generate strategic security recommendations based on current threat posture."""
    recs = []

    if anomaly_pct > 10:
        recs.append({
            "priority": "CRITICAL",
            "category": "Threat Response",
            "action":   "Anomaly rate exceeds 10%. Initiate immediate incident response protocol and escalate to the Security Analyst team.",
            "icon":     "shield-alert",
        })
    elif anomaly_pct > 5:
        recs.append({
            "priority": "HIGH",
            "category": "Risk Management",
            "action":   "Elevated anomaly detection. Schedule a security review with department heads and review recent log entries.",
            "icon":     "alert-triangle",
        })
    else:
        recs.append({
            "priority": "LOW",
            "category": "Maintenance",
            "action":   "System operating within safe parameters. Continue standard monitoring cadence.",
            "icon":     "check-circle",
        })

    if total_anomalies > 50:
        recs.append({
            "priority": "HIGH",
            "category": "Access Review",
            "action":   "High cumulative anomaly count detected. Conduct a quarterly access rights review for all personnel.",
            "icon":     "users",
        })

    recs.append({
        "priority": "ROUTINE",
        "category": "Compliance",
        "action":   "Ensure all active personnel have completed mandatory security awareness training for this quarter.",
        "icon":     "book-open",
    })

    return recs


@app.get("/api/intelligence/export-csv", tags=["Intelligence"])
def export_report_csv(current_user: dict = Depends(_require_manager)):
    """Export the intelligence report as a downloadable CSV string."""
    total_logs      = state["total_logs_analyzed"]
    total_anomalies = state["total_anomalies"]
    anomaly_pct     = round((total_anomalies / max(total_logs, 1)) * 100, 2)

    out = StringIO()
    writer = csv.writer(out)

    # Header section
    writer.writerow(["THREXIA SECURITY INTELLIGENCE REPORT"])
    writer.writerow([f"Generated At: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}"])
    writer.writerow([f"Generated By: {current_user['username']} ({current_user['role']})"])
    writer.writerow(["Classification: CONFIDENTIAL — INTERNAL USE ONLY"])
    writer.writerow([])

    # Executive Summary
    writer.writerow(["--- EXECUTIVE SUMMARY ---"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Logs Analyzed", total_logs])
    writer.writerow(["Total Anomalies Detected", total_anomalies])
    writer.writerow(["Total Normal Activity", total_logs - total_anomalies])
    writer.writerow(["Anomaly Rate (%)", f"{anomaly_pct}%"])
    writer.writerow(["Threat Neutralization Rate", f"{round(100 - anomaly_pct, 2)}%"])
    writer.writerow([])

    # Recent Threats
    writer.writerow(["--- RECENT CRITICAL THREATS ---"])
    writer.writerow(["Log ID", "Timestamp", "User", "AI Confidence (%)", "Reason"])
    for alert in state["live_alerts"][:10]:
        writer.writerow([
            alert.get("id"),
            alert.get("time"),
            alert.get("user"),
            alert.get("confidence_score"),
            alert.get("explanations", ["N/A"])[0],
        ])
    writer.writerow([])

    # Weekly Activity
    writer.writerow(["--- WEEKLY ACTIVITY TREND ---"])
    writer.writerow(["Hour", "Normal Activity", "Suspicious Activity"])
    for entry in state["system_activity_chart"][-7:]:
        writer.writerow([entry.get("time"), entry.get("normal_activity"), entry.get("suspicious_activity")])

    log_operation(current_user["username"], "EXPORT_REPORT_CSV", {})
    return {"csv_data": out.getvalue(), "filename": f"threxia_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"}


@app.get("/api/logs", tags=["Analytics"])
def get_all_logs(current_user: dict = Depends(require_permission("Logs"))):
    log_operation(current_user["username"], "VIEW_LOGS")
    # Fetch from DB for persistence, fallback to state
    db_logs = get_telemetry_logs(limit=100)
    if db_logs:
        return db_logs
    return state["all_logs"]


@app.post("/api/logs/action", tags=["Analytics"])
def log_action(request: LogActionRequest, current_user: dict = Depends(require_permission("Logs"))):
    """Save an analyst action (Resolve/Escalate) to the database."""
    success = update_log_action(request.log_id, request.action)
    
    # Also update in-memory state for immediate feedback
    for log in state["all_logs"]:
        if log["id"] == request.log_id:
            log["action_status"] = request.action
            break

    log_operation(current_user["username"], f"LOG_ACTION_{request.action.upper()}", {"log_id": request.log_id})
    
    return {"message": f"Log {request.log_id} marked as {request.action}", "success": success}


@app.get("/api/overview/audit", tags=["Analytics"])
def get_overview_audit(current_user: dict = Depends(require_permission("Overview"))):
    """Return the real audit log feed for the Overview page."""
    return {"logs": get_audit_logs(limit=50)}


# ─────────────────────────────────────────────
#  ⑤ Manual Analysis Endpoints
# ─────────────────────────────────────────────

@app.post("/api/analyze_manual", tags=["Analysis"])
def analyze_manual_log(log: ManualLog, current_user: dict = Depends(require_permission("Manual Analysis"))):
    if not model or not scaler:
        return {"error": "ML model is currently offline."}
    try:
        arr        = np.array(log.features).reshape(1, -1)
        scaled     = scaler.transform(arr)
        prediction = int(model.predict(scaled)[0])
        raw_score  = model.score_samples(scaled)[0]
        confidence = (
            min(99.9, 85.0 + abs(raw_score) * 0.5 + random.uniform(0, 5))
            if prediction == -1
            else min(99.9, max(50.0, (raw_score / 350.0) * 100))
        )
        explanations = _interpret_anomaly(log.features) if prediction == -1 else ["Behavior falls within normal operational parameters."]

        log_operation(current_user["username"], "ANALYZE_LOG", {"prediction": "Threat" if prediction == -1 else "Normal"})

        return {
            "prediction":  "Threat" if prediction == -1 else "Normal",
            "confidence":  round(confidence, 1),
            "explanations": explanations,
        }
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/upload_csv", tags=["Analysis"])
async def upload_csv(file: UploadFile = File(...), current_user: dict = Depends(require_permission("Manual Analysis"))):
    if not model or not scaler:
        return {"error": "ML model is currently offline."}
    try:
        contents   = await file.read()
        csv_data   = contents.decode("utf-8")
        csv_reader = csv.reader(StringIO(csv_data))
        results    = []
        for row_idx, row in enumerate(csv_reader):
            if row_idx == 0:
                try:
                    [float(x) for x in row]
                except ValueError:
                    continue
            try:
                features = [float(x.strip()) for x in row if x.strip()]
                if len(features) != 14:
                    results.append({"row": row_idx, "error": f"Expected 14 features, got {len(features)}"})
                    continue
                arr        = np.array(features).reshape(1, -1)
                scaled     = scaler.transform(arr)
                prediction = int(model.predict(scaled)[0])
                raw_score  = model.score_samples(scaled)[0]
                confidence = (
                    min(99.9, 85.0 + abs(raw_score) * 0.5 + random.uniform(0, 5))
                    if prediction == -1
                    else min(99.9, max(50.0, (raw_score / 350.0) * 100))
                )
                results.append({
                    "row":          row_idx,
                    "features":     features,
                    "prediction":   "Threat" if prediction == -1 else "Normal",
                    "confidence":   round(confidence, 1),
                    "explanations": _interpret_anomaly(features) if prediction == -1 else ["Normal."],
                })
            except ValueError as e:
                results.append({"row": row_idx, "error": f"Invalid data: {e}"})

        log_operation(current_user["username"], "UPLOAD_CSV", {"filename": file.filename, "rows": len(results)})
        return {"filename": file.filename, "rows_processed": len(results), "results": results}
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/download_csv_template", tags=["Analysis"])
def download_csv_template(current_user: dict = Depends(require_permission("Overview"))):
    headers = ["is_contractor","emp_class","foreign","criminal","medical",
               "printed","printed_off_hours","burned","burned_other","abroad",
               "hostility","entries","campus","late"]
    rows = [
        headers,
        ["0","1","0","0","0","5","0","0","0","0","0","2","1","0"],
        ["1","3","0","0","0","500","50","45","0","0","2","40","2","1"],
    ]
    out = StringIO()
    csv.writer(out).writerows(rows)
    return {"template": out.getvalue(), "filename": "threxia_template.csv"}


# ─────────────────────────────────────────────
#  ⑥ Health Check
# ─────────────────────────────────────────────

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status":    "operational",
        "mongodb":   "connected" if mongodb_connected else "fallback",
        "ml_model":  "loaded"    if model else "offline",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
    }
