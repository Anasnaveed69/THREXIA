import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "Cluster0")

print(f"Connecting to: {MONGO_URI}")
print(f"Database: {MONGO_DB_NAME}")

try:
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    
    col = db["telemetry_logs"]
    total = col.count_documents({})
    threats = col.count_documents({"type": "threat"})
    safe = col.count_documents({"type": "safe"})
    
    print(f"Total Telemetry Logs: {total}")
    print(f"Threats: {threats}")
    print(f"Safe: {safe}")
    
    users = db["users"].count_documents({})
    print(f"Users: {users}")

except Exception as e:
    print(f"Error: {e}")
