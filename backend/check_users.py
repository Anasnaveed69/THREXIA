import os
import sys
from dotenv import load_dotenv

# Add backend to sys.path to import database
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import get_all_users

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

users = get_all_users()
print(f"Found {len(users)} users.")
for user in users:
    print(f"Username: {user.get('username')}, Role: {user.get('role')}, Access: {user.get('access_level')}")
