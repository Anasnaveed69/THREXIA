# THREXIA MongoDB Setup - Quick Start Guide

## ✅ Setup Complete!

Your MongoDB user management system is now configured with **11 users across 4 roles**.

## 📋 Quick Summary

### Files Created:
- **`database.py`** - MongoDB connection and user management
- **`seed_data.py`** - Demo users for all 4 roles
- **`.env`** - Environment configuration
- **`test_mongodb.py`** - Connection test script
- **`MONGODB_SETUP.md`** - Full documentation
- **`main.py`** - Updated with MongoDB integration

### Users Created (11 Total):

**Security Analyst (Full Access)** - 3 users
- `analyst_james` / SecurePass123!
- `analyst_emily` / SecurePass123!
- `analyst_david` / SecurePass123!

**IT Manager (Summaries Only)** - 2 users
- `manager_alex` / ManagerPass123!
- `manager_sarah` / ManagerPass123!

**System Administrator (Monitoring)** - 3 users
- `admin_robert` / AdminPass123!
- `admin_jessica` / AdminPass123!
- `admin_michael` / AdminPass123!

**Student/Researcher (Testing)** - 3 users
- `student_mark` / StudentPass123!
- `student_lisa` / StudentPass123!
- `student_james` / StudentPass123!

## 🚀 Getting Started

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows: Start the MongoDB service
# Open Services and find "MongoDB Server" and start it
# Or from admin PowerShell:
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get the connection string
5. Update `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Verify MongoDB Connection
```bash
cd backend
python test_mongodb.py
```

You should see: `✓ MongoDB connection successful!`

### Step 3: Seed the Database

**Option A: Run seed script**
```bash
python seed_data.py
```

**Option B: Use API endpoint** (after starting server)
```bash
curl -X POST http://localhost:8000/api/seed-database \
  -H "Authorization: Bearer <analyst_token>"
```

### Step 4: Start the Backend

```bash
cd backend
uvicorn main:app --reload
```

The server will start at: `http://localhost:8000`

### Step 5: Test Login

Try logging in with different users to see their access levels:

**Security Analyst (Full Access)**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"analyst_james","password":"SecurePass123!"}'
```

**IT Manager (Limited Access)**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager_alex","password":"ManagerPass123!"}'
```

**System Administrator**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_robert","password":"AdminPass123!"}'
```

**Student/Researcher**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student_mark","password":"StudentPass123!"}'
```

## 📊 Access Control Matrix

| Feature | Security Analyst | IT Manager | System Admin | Student |
|---------|:---------------:|:----------:|:------------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ | ❌ |
| Logs | ✅ | ❌ | ✅ | ❌ |
| Overview | ✅ | ✅ | ❌ | ✅ |
| Manual Analysis | ✅ | ❌ | ❌ | ✅ |

## 🔑 API Endpoints for User Management

### Get All Users
```bash
GET /api/users
Authorization: Bearer <token>
```

### Login
```bash
POST /api/login
Content-Type: application/json

{
  "username": "username",
  "password": "password"
}
```

### Protected Endpoints (with Access Control)
- `GET /api/dashboard` - Requires "Dashboard"
- `GET /api/logs` - Requires "Logs"
- `POST /api/analyze_manual` - Requires "Manual Analysis"
- `GET /api/download_csv_template` - Requires "Overview"

## 🧪 Testing Different Roles

### 1. Login as Security Analyst
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"analyst_james","password":"SecurePass123!"}' \
  | jq -r '.access_token')

# Can access all endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/dashboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/logs
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/analyze_manual
```

### 2. Login as IT Manager
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager_alex","password":"ManagerPass123!"}' \
  | jq -r '.access_token')

# Can access dashboard and overview
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/dashboard ✓

# Cannot access logs (403 Forbidden)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/logs ✗
```

### 3. Login as System Administrator
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_robert","password":"AdminPass123!"}' \
  | jq -r '.access_token')

# Can access dashboard and logs
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/dashboard ✓
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/logs ✓
```

## 📚 More Information

For detailed documentation, see: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

## ⚠️ Important Notes

1. **Passwords**: All demo passwords follow the pattern `RolePass123!` or similar
2. **Token Expiry**: JWT tokens expire after 30 minutes
3. **Security**: Change `SECRET_KEY` in `.env` for production
4. **MongoDB**: For production, use MongoDB Atlas with proper credentials
5. **First Run**: Run `seed_data.py` to populate with demo users

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Or use MongoDB Atlas and update `MONGO_URI` in `.env`

### pymongo Module Not Found
```bash
pip install pymongo
```

### Still Getting Connection Errors?
1. Check `.env` file has correct MONGO_URI
2. Verify MongoDB is running and accessible
3. Check network connectivity if using remote database
4. Review logs in test_mongodb.py output

## 🎯 Next Steps

1. ✅ MongoDB setup complete
2. ✅ Users and roles configured
3. ✅ API endpoints ready
4. 📝 Update frontend to use login endpoints
5. 📝 Implement role-based UI changes
6. 📝 Add more users as needed

---

**Status**: ✅ Ready for testing!

Start the backend and begin testing with different user roles.
