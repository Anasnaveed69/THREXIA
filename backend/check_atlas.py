import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "Cluster0")

try:
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    
    print(f"Connected to DB: {MONGO_DB_NAME}")
    print(f"Collections: {db.list_collection_names()}")
    
    for coll in db.list_collection_names():
        count = db[coll].count_documents({})
        print(f"Collection '{coll}' count: {count}")

except Exception as e:
    print(f"Error: {e}")
