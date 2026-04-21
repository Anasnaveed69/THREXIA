from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "Cluster0")

def _normalize_mongo_uri(uri: str) -> str:
    """Normalize common malformed Atlas URI query-string patterns."""
    if "mongodb+srv://" in uri and "?appName=" in uri and "?retryWrites=" in uri:
        return uri.replace("?retryWrites=", "&retryWrites=")
    return uri

MONGO_URI = _normalize_mongo_uri(MONGO_URI)

db = None
mongodb_connected = False

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    db = client[MONGO_DB_NAME]
    mongodb_connected = True
    print("[SUCCESS] Connected to MongoDB")
except (ServerSelectionTimeoutError, Exception) as e:
    print(f"[WARNING] MongoDB not available: {type(e).__name__}")
    print(f"  Reason: {str(e)}")
    print("  Running in FALLBACK MODE (in-memory storage)")
    db = None
    mongodb_connected = False

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FALLBACK: In-memory storage for when MongoDB is unavailable
fallback_users = {}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# User Collection
def get_users_collection():
    if db is not None and mongodb_connected:
        return db["users"]
    return None

def get_user_by_username(username: str):
    """Get user from MongoDB or fallback"""
    collection = get_users_collection()
    if collection is not None:
        return collection.find_one({"username": username})
    else:
        # Use fallback storage
        return fallback_users.get(username)

def create_user(username: str, password: str, full_name: str, role: str, access_level: list):
    """Create a new user in MongoDB or fallback"""
    collection = get_users_collection()
    
    user = {
        "username": username,
        "password": hash_password(password),
        "full_name": full_name,
        "role": role,
        "access_level": access_level,
        "created_at": __import__('datetime').datetime.utcnow()
    }
    
    if collection is not None:
        # Store in MongoDB
        result = collection.insert_one(user)
        return result.inserted_id
    else:
        # Store in fallback
        fallback_users[username] = user
        return username

def get_all_users():
    """Get all users (excluding passwords for security)"""
    collection = get_users_collection()
    if collection is not None:
        users = list(collection.find({}, {"password": 0}))
    else:
        # Get from fallback storage
        users = [
            {k: v for k, v in user.items() if k != "password"}
            for user in fallback_users.values()
        ]
    return users

def delete_all_users():
    """Delete all users from the database"""
    collection = get_users_collection()
    if collection is not None:
        result = collection.delete_many({})
        return result.deleted_count
    else:
        # Delete from fallback storage
        count = len(fallback_users)
        fallback_users.clear()
        return count
