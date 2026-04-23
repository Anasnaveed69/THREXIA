"""
THREXIA — Seed Data
Populates the database with default demo users across all 4 roles.
All seeded users are given status='active' so they can log in immediately.
The System Administrator role is NOT exposed on the public registration form.
"""

from database import create_user, delete_all_users, get_all_users, ROLE_ACCESS_MAP

# ─────────────────────────────────────────────
#  Canonical user seed definitions
# ─────────────────────────────────────────────
SEED_USERS = [
    # ── Security Analysts ──
    {"username": "analyst_james",  "password": "SecurePass123!", "full_name": "James Carter",    "role": "Security Analyst",    "email": "james.carter@threxia.io"},
    {"username": "analyst_emily",  "password": "SecurePass123!", "full_name": "Emily Rodriguez",  "role": "Security Analyst",    "email": "emily.rodriguez@threxia.io"},
    {"username": "analyst_david",  "password": "SecurePass123!", "full_name": "David Kim",        "role": "Security Analyst",    "email": "david.kim@threxia.io"},

    # ── IT Managers ──
    {"username": "manager_alex",   "password": "ManagerPass123!", "full_name": "Alex Thompson",  "role": "IT Manager",          "email": "alex.thompson@threxia.io"},
    {"username": "manager_sarah",  "password": "ManagerPass123!", "full_name": "Sarah Mitchell",  "role": "IT Manager",          "email": "sarah.mitchell@threxia.io"},

    # ── System Administrators ──
    {"username": "admin_anas",     "password": "AdminPass123!",   "full_name": "Anas Naveed Butt",  "role": "System Administrator", "email": "buttanas813@gmail.com"},
    {"username": "admin_usman",    "password": "AdminPass123!",   "full_name": "Muhammad Usman",    "role": "System Administrator", "email": "admin.usman@threxia.io"},

    # ── Students / Researchers ──
    {"username": "student_mark",   "password": "StudentPass123!", "full_name": "Mark Jensen",    "role": "Student/Researcher",  "email": "mark.jensen@threxia.io"},
    {"username": "student_lisa",   "password": "StudentPass123!", "full_name": "Lisa Nguyen",    "role": "Student/Researcher",  "email": "lisa.nguyen@threxia.io"},
    {"username": "student_james",  "password": "StudentPass123!", "full_name": "James Wilson",   "role": "Student/Researcher",  "email": "james.wilson@threxia.io"},
]


def seed_database(clear_existing: bool = False) -> dict:
    """
    Seed the database with demo users.
    - clear_existing=True  → wipe all users first (dev/reset mode)
    - clear_existing=False → skip users that already exist (safe re-run)
    """
    if clear_existing:
        deleted = delete_all_users()
        print(f"[SEED] Cleared {deleted} existing user(s).")

    created = 0
    skipped = 0

    for u in SEED_USERS:
        role         = u["role"]
        access_level = ROLE_ACCESS_MAP.get(role, [])

        result = create_user(
            username=u["username"],
            password=u["password"],
            full_name=u["full_name"],
            role=role,
            access_level=access_level,
            email=u.get("email", ""),
            status="active",
            reason="Seeded system account",
        )

        if result:
            created += 1
            print(f"  [+] Created : {u['username']} ({role})")
        else:
            skipped += 1
            print(f"  [~] Skipped : {u['username']} (already exists)")

    print(f"\n[SEED] Done — {created} created, {skipped} skipped.")
    return {"created": created, "skipped": skipped}


if __name__ == "__main__":
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    print("\n====================================")
    print("   THREXIA -- Database Seed Script")
    print("====================================\n")

    all_users = get_all_users()
    print(f"[INFO] Users currently in DB: {len(all_users)}")

    result = seed_database(clear_existing=False)

    print("\n[VERIFICATION] Active users after seeding:")
    for user in get_all_users():
        print(f"  - {user['username']:<20} {user['role']:<25} status={user.get('status','?')}")
    print()
