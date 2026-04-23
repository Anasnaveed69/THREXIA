"""
THREXIA — One-time migration script.
Adds 'status', 'reason', 'approved_by', 'approved_at', 'email' fields
to any existing users that were seeded before the schema update.
Also corrects access_level values to match ROLE_ACCESS_MAP.
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from database import db, ROLE_ACCESS_MAP

if db is None:
    print("[MIGRATE] No MongoDB connection — nothing to do.")
    sys.exit(0)

col = db["users"]

# Step 0 — Drop the old non-sparse email index if it exists, recreate as sparse
try:
    col.drop_index("email_1")
    print("[MIGRATE] Dropped old email index.")
except Exception:
    pass

from pymongo import ASCENDING
col.create_index([("email", ASCENDING)], unique=True, sparse=True, name="email_1")
print("[MIGRATE] Recreated sparse unique email index.")

# Step 1 — Add missing schema fields to old user docs
# We only add status/reason/approved fields. We leave 'email' absent (not null)
# so the sparse unique index allows multiple docs without email.
result = col.update_many(
    {"status": {"$exists": False}},
    {"$set": {
        "status":      "active",
        "reason":      "Seeded system account",
        "approved_by": None,
        "approved_at": None,
    }}
)
print(f"[MIGRATE] Added 'status=active' to {result.modified_count} existing users.")



# Step 2 — Correct access_level to match the canonical ROLE_ACCESS_MAP
fixed = 0
for user in col.find({}):
    correct = ROLE_ACCESS_MAP.get(user.get("role", ""), [])
    current = user.get("access_level", [])
    if set(current) != set(correct):
        col.update_one({"_id": user["_id"]}, {"$set": {"access_level": correct}})
        print(f"  Fixed access for {user['username']} ({user.get('role','?')})")
        fixed += 1

print(f"[MIGRATE] Access levels corrected for {fixed} user(s).")
print("[MIGRATE] Done.")
