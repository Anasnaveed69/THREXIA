"""
Seed data for THREXIA MongoDB database
Four user roles with different access levels:
1. Security Analyst - Full Access
2. IT Manager - Summaries Only
3. System Administrator - Monitoring & Records
4. Student/Researcher - Background & Testing
"""

from database import create_user, delete_all_users, get_all_users

# Define user roles and their access levels
USER_ROLES = {
    "Security Analyst": {
        "access_level": ["Overview", "Dashboard", "Logs", "Manual Analysis"],
        "description": "Full Access to all features"
    },
    "IT Manager": {
        "access_level": ["Overview", "Dashboard"],
        "description": "Summaries Only"
    },
    "System Administrator": {
        "access_level": ["Dashboard", "Logs"],
        "description": "Monitoring & Records"
    },
    "Student/Researcher": {
        "access_level": ["Overview", "Manual Analysis"],
        "description": "Background & Testing"
    }
}

# Users data for each role
USERS_DATA = [
    # Security Analysts - 3 users
    {
        "username": "analyst_james",
        "password": "SecurePass123!",
        "full_name": "James Wilson",
        "role": "Security Analyst",
        "access_level": USER_ROLES["Security Analyst"]["access_level"]
    },
    {
        "username": "analyst_emily",
        "password": "SecurePass123!",
        "full_name": "Emily Rodriguez",
        "role": "Security Analyst",
        "access_level": USER_ROLES["Security Analyst"]["access_level"]
    },
    {
        "username": "analyst_david",
        "password": "SecurePass123!",
        "full_name": "David Chen",
        "role": "Security Analyst",
        "access_level": USER_ROLES["Security Analyst"]["access_level"]
    },
    
    # IT Managers - 2 users
    {
        "username": "manager_alex",
        "password": "ManagerPass123!",
        "full_name": "Alex Thompson",
        "role": "IT Manager",
        "access_level": USER_ROLES["IT Manager"]["access_level"]
    },
    {
        "username": "manager_sarah",
        "password": "ManagerPass123!",
        "full_name": "Sarah Johnson",
        "role": "IT Manager",
        "access_level": USER_ROLES["IT Manager"]["access_level"]
    },
    
    # System Administrators - 3 users
    {
        "username": "admin_robert",
        "password": "AdminPass123!",
        "full_name": "Robert Kumar",
        "role": "System Administrator",
        "access_level": USER_ROLES["System Administrator"]["access_level"]
    },
    {
        "username": "admin_jessica",
        "password": "AdminPass123!",
        "full_name": "Jessica Lee",
        "role": "System Administrator",
        "access_level": USER_ROLES["System Administrator"]["access_level"]
    },
    {
        "username": "admin_michael",
        "password": "AdminPass123!",
        "full_name": "Michael Brown",
        "role": "System Administrator",
        "access_level": USER_ROLES["System Administrator"]["access_level"]
    },
    
    # Student/Researchers - 3 users
    {
        "username": "student_mark",
        "password": "StudentPass123!",
        "full_name": "Mark Patterson",
        "role": "Student/Researcher",
        "access_level": USER_ROLES["Student/Researcher"]["access_level"]
    },
    {
        "username": "student_lisa",
        "password": "StudentPass123!",
        "full_name": "Lisa Wang",
        "role": "Student/Researcher",
        "access_level": USER_ROLES["Student/Researcher"]["access_level"]
    },
    {
        "username": "student_james",
        "password": "StudentPass123!",
        "full_name": "James Martinez",
        "role": "Student/Researcher",
        "access_level": USER_ROLES["Student/Researcher"]["access_level"]
    }
]

def seed_database():
    """Clear existing users and populate with new roles"""
    print("[RESET] Clearing existing users...")
    deleted_count = delete_all_users()
    print(f"   Deleted {deleted_count} users")
    
    print("\n[CREATE] Creating new users...")
    for user_data in USERS_DATA:
        user_id = create_user(
            username=user_data["username"],
            password=user_data["password"],
            full_name=user_data["full_name"],
            role=user_data["role"],
            access_level=user_data["access_level"]
        )
        if user_id:
            print(f"   [OK] Created {user_data['full_name']} ({user_data['role']})")
    
    print("\n[SUMMARY] Final User Summary:")
    print("=" * 70)
    users = get_all_users()
    
    if not users:
        print("No users found. Check database connection.")
        return
    
    # Group by role
    by_role = {}
    for user in users:
        role = user.get("role", "Unknown")
        if role not in by_role:
            by_role[role] = []
        by_role[role].append(user)
    
    for role, role_users in sorted(by_role.items()):
        access = USER_ROLES[role]["access_level"]
        print(f"\n{role} ({len(role_users)} users)")
        print(f"  Access: {', '.join(access)}")
        for user in role_users:
            print(f"  - {user['username']} - {user['full_name']}")

if __name__ == "__main__":
    seed_database()
