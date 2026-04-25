"""
THREXIA — Database Layer
Handles all MongoDB operations for users, access requests, and audit logs.
"""

from pymongo import MongoClient, DESCENDING
from pymongo.errors import ServerSelectionTimeoutError, DuplicateKeyError
from passlib.context import CryptContext
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
#  Configuration
# ─────────────────────────────────────────────
MONGO_URI     = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "Cluster0")

def _normalize_mongo_uri(uri: str) -> str:
    """Normalize common malformed Atlas URI query-string patterns."""
    if "mongodb+srv://" in uri and "?appName=" in uri and "?retryWrites=" in uri:
        return uri.replace("?retryWrites=", "&retryWrites=")
    return uri

MONGO_URI = _normalize_mongo_uri(MONGO_URI)

db              = None
mongodb_connected = False
users_col         = None
audit_logs_col    = None
telemetry_logs_col = None
password_resets_col = None

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    db = client[MONGO_DB_NAME]
    mongodb_connected = True

    # ── Ensure indexes for fast lookups and uniqueness ──
    db["users"].create_index("username",  unique=True)
    db["users"].create_index("email",     unique=True, sparse=True)
    db["users"].create_index("status")
    db["audit_logs"].create_index([("timestamp", DESCENDING)])
    db["audit_logs"].create_index("username")

    # ── Initialize Collection References ──
    users_col           = db["users"]
    audit_logs_col      = db["audit_logs"]
    telemetry_logs_col  = db["telemetry_logs"]
    password_resets_col = db["password_resets"]

    print("[SUCCESS] Connected to MongoDB — indexes verified.")
except (ServerSelectionTimeoutError, Exception) as e:
    print(f"[WARNING] MongoDB not available: {type(e).__name__}")
    print(f"  Reason: {e}")
    print("  Running in FALLBACK MODE (in-memory storage)")
    db = None
    mongodb_connected = False

# ─────────────────────────────────────────────
#  Password Hashing
# ─────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ─────────────────────────────────────────────
#  In-Memory Fallback Storage
# ─────────────────────────────────────────────
_fallback_users:      dict[str, dict] = {}
_fallback_audit_logs: list[dict]      = []

# ─────────────────────────────────────────────
#  Collection Helpers
# ─────────────────────────────────────────────
def _users_col():
    return db["users"] if (db is not None and mongodb_connected) else None

def _audit_col():
    return db["audit_logs"] if (db is not None and mongodb_connected) else None

# ─────────────────────────────────────────────
#  Role Access Map  (single source of truth)
# ─────────────────────────────────────────────
ROLE_ACCESS_MAP: dict[str, list[str]] = {
    "Security Analyst":   ["Overview", "Dashboard", "Logs", "Manual Analysis"],
    "IT Manager":         ["Overview", "Dashboard"],
    "System Administrator": ["Dashboard", "Logs", "Access Control"],
    "Student/Researcher": ["Overview", "Manual Analysis"],
}

# ─────────────────────────────────────────────
#  User CRUD
# ─────────────────────────────────────────────

def get_user_by_username(username: str) -> dict | None:
    col = _users_col()
    if col is not None:
        return col.find_one({"username": username})
    return _fallback_users.get(username)


def get_user_by_email(email: str) -> dict | None:
    col = _users_col()
    if col is not None:
        return col.find_one({"email": email})
    for u in _fallback_users.values():
        if u.get("email") == email:
            return u
    return None


def create_user(
    username:     str,
    password:     str,
    full_name:    str,
    role:         str,
    access_level: list[str],
    email:        str  = "",
    status:       str  = "active",   # "pending" | "active" | "rejected"
    reason:       str  = "",
) -> str | None:
    """
    Create a user record.  Returns the inserted id (or username for fallback).
    Returns None on duplicate-key violation.
    """
    user = {
        "username":     username,
        "password":     hash_password(password),
        "full_name":    full_name,
        "role":         role,
        "access_level": access_level,
        "email":        email,
        "status":       status,
        "reason":       reason,
        "approved_by":  None,
        "created_at":   datetime.utcnow(),
        "approved_at":  None,
    }
    col = _users_col()
    if col is not None:
        try:
            result = col.insert_one(user)
            return str(result.inserted_id)
        except DuplicateKeyError:
            return None
    else:
        if username in _fallback_users:
            return None
        _fallback_users[username] = user
        return username


def update_user_status(
    username:    str,
    status:      str,
    approved_by: str | None = None,
) -> bool:
    """Update a user's approval status and optionally record who approved them."""
    update_fields = {
        "status":      status,
        "approved_by": approved_by,
        "approved_at": datetime.utcnow() if status == "active" else None,
    }
    # When approving, grant the correct access level for the stored role
    col = _users_col()
    if col is not None:
        user = col.find_one({"username": username})
        if user and status == "active":
            update_fields["access_level"] = ROLE_ACCESS_MAP.get(user["role"], [])
        result = col.update_one({"username": username}, {"$set": update_fields})
        return result.modified_count > 0
    else:
        return False


def update_user_password(username: str, new_password_hashed: str) -> bool:
    """Update a user's password."""
    col = _users_col()
    if col is not None:
        result = col.update_one({"username": username}, {"$set": {"password": new_password_hashed}})
        return result.modified_count > 0
    else:
        if username in _fallback_users:
            _fallback_users[username]["password"] = new_password_hashed
            return True
        return False


def get_all_users() -> list[dict]:
    """Return all users (passwords stripped)."""
    col = _users_col()
    if col is not None:
        users = list(col.find({}, {"password": 0}))
        for u in users:
            u.pop("_id", None)
        return users
    return [
        {k: v for k, v in u.items() if k != "password"}
        for u in _fallback_users.values()
    ]


def get_pending_users() -> list[dict]:
    """Return all users whose status is 'pending' (passwords stripped)."""
    col = _users_col()
    if col is not None:
        users = list(col.find({"status": "pending"}, {"password": 0}))
        for u in users:
            u.pop("_id", None)
        return users
    return [
        {k: v for k, v in u.items() if k != "password"}
        for u in _fallback_users.values()
        if u.get("status") == "pending"
    ]


def delete_user(username: str) -> bool:
    col = _users_col()
    if col is not None:
        result = col.delete_one({"username": username})
        return result.deleted_count > 0
    if username in _fallback_users:
        del _fallback_users[username]
        return True
    return False


def delete_all_users() -> int:
    col = _users_col()
    if col is not None:
        result = col.delete_many({})
        return result.deleted_count
    count = len(_fallback_users)
    _fallback_users.clear()
    return count

# ─────────────────────────────────────────────
#  Audit Logs
# ─────────────────────────────────────────────

def log_operation(username: str, operation: str, details: dict | None = None) -> None:
    """
    Persist a user-action record to the audit_logs collection.
    operations examples: "LOGIN", "LOGOUT", "APPROVE_USER", "REJECT_USER",
                         "ANALYZE_LOG", "VIEW_DASHBOARD", "REGISTER_REQUEST"
    """
    entry = {
        "username":  username,
        "operation": operation,
        "details":   details or {},
        "timestamp": datetime.utcnow(),
    }
    col = _audit_col()
    if col is not None:
        col.insert_one(entry)
    else:
        _fallback_audit_logs.insert(0, entry)
        if len(_fallback_audit_logs) > 500:
            _fallback_audit_logs.pop()


def get_audit_logs(limit: int = 100) -> list[dict]:
    """Return the most recent audit log entries."""
    col = _audit_col()
    if col is not None:
        logs = list(col.find({}, {"_id": 0}).sort("timestamp", DESCENDING).limit(limit))
        for log in logs:
            if isinstance(log.get("timestamp"), datetime):
                log["timestamp"] = log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        return logs
    return [
        {k: v for k, v in log.items()}
        for log in _fallback_audit_logs[:limit]
    ]


# ─────────────────────────────────────────────
#  Password Reset Requests
# ─────────────────────────────────────────────

def create_password_reset_request(username: str, email: str) -> bool:
    """Store a record that a user has requested a password reset."""
    col = db["password_resets"] if (db is not None and mongodb_connected) else None
    request = {
        "username":  username,
        "email":     email,
        "status":    "pending",
        "timestamp": datetime.utcnow()
    }
    if col is not None:
        col.insert_one(request)
        return True
    return True # In fallback we just print/log


def get_pending_password_resets() -> list[dict]:
    """Retrieve all reset requests for the admin to review."""
    col = db["password_resets"] if (db is not None and mongodb_connected) else None
    if col is not None:
        resets = list(col.find({"status": "pending"}, {"_id": 0}).sort("timestamp", DESCENDING))
        return resets
    return []


def resolve_password_reset(username: str) -> bool:
    """Mark a reset request as completed."""
    col = db["password_resets"] if (db is not None and mongodb_connected) else None
    if col is not None:
        col.delete_many({"username": username})
        return True
    return True

# ─────────────────────────────────────────────
#  Telemetry Logs (Persisted)
# ─────────────────────────────────────────────

def save_telemetry_log(entry: dict) -> None:
    """Persist a simulated telemetry log to MongoDB."""
    col = db["telemetry_logs"] if (db is not None and mongodb_connected) else None
    if col is not None:
        # Check if log already exists by ID to avoid duplicates in loops
        if not col.find_one({"id": entry["id"]}):
            col.insert_one(entry)
    else:
        # Fallback to state (handled in main.py)
        pass

def get_telemetry_logs(limit: int = 100) -> list[dict]:
    """Retrieve telemetry logs from the database."""
    col = db["telemetry_logs"] if (db is not None and mongodb_connected) else None
    if col is not None:
        logs = list(col.find({}, {"_id": 0}).sort("time", DESCENDING).limit(limit))
        return logs
    return []

def update_log_action(log_id: str, action: str) -> bool:
    """Update the action status (Resolved/Escalated) for a telemetry log."""
    col = db["telemetry_logs"] if (db is not None and mongodb_connected) else None
    if col is not None:
        result = col.update_one({"id": log_id}, {"$set": {"action_status": action}})
        return result.modified_count > 0
    return False

