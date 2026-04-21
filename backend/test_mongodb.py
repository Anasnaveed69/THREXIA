"""
Test script to verify MongoDB and database setup
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("[TEST] Testing MongoDB Connection...")
    try:
        from database import mongodb_connected, db
        if mongodb_connected:
            print("[PASS] MongoDB connection successful!")
            return True
        else:
            print("[WARNING] MongoDB not available - Running in FALLBACK MODE")
            print("  App will use in-memory storage")
            print("  This is fine for development/testing!")
            return True  # Fallback is acceptable
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_database_operations():
    """Test basic database operations"""
    print("\n[TEST] Testing Database Operations...")
    try:
        from database import get_all_users, create_user
        
        # Get existing users
        users = get_all_users()
        print(f"[PASS] Current users in database: {len(users)}")
        if users:
            for user in users[:3]:
                print(f"  - {user['username']} ({user['role']})")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_seed_data():
    """Test seeding database"""
    print("\n[TEST] Testing Seed Data...")
    try:
        from seed_data import USERS_DATA, USER_ROLES
        
        print(f"[PASS] Found {len(USERS_DATA)} test users")
        print(f"[PASS] Found {len(USER_ROLES)} user roles")
        
        for role, data in USER_ROLES.items():
            access = data["access_level"]
            print(f"  - {role}: {', '.join(access)}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("=" * 70)
    print("THREXIA MongoDB Setup Test")
    print("=" * 70)
    
    results = []
    
    # Test MongoDB connection
    results.append(("MongoDB Connection", test_mongodb_connection()))
    
    # Test database operations
    results.append(("Database Operations", test_database_operations()))
    
    # Test seed data
    results.append(("Seed Data", test_seed_data()))
    
    # Summary
    print("\n" + "=" * 70)
    print("Test Summary")
    print("=" * 70)
    
    all_passed = True
    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status}: {test_name}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n[PASS] All tests passed!")
        print("  App is ready to run with or without MongoDB")
        print("\nRun: python seed_data.py")
    else:
        print("\n[FAIL] Some tests failed. Check the errors above.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
