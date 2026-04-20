# THREXIA MongoDB User Management Setup

## Overview

This document explains the MongoDB database setup for THREXIA with four user roles and their access levels.

## Four User Roles

### 1. **Security Analyst** - Full Access
- **Access Level**: Overview, Dashboard, Logs, Manual Analysis
- **Description**: Full access to all features
- **Users Created**:
  - `analyst_james` / SecurePass123! (James Wilson)
  - `analyst_emily` / SecurePass123! (Emily Rodriguez)
  - `analyst_david` / SecurePass123! (David Chen)

### 2. **IT Manager** - Summaries Only
- **Access Level**: Overview, Dashboard
- **Description**: Summaries and dashboards only
- **Users Created**:
  - `manager_alex` / ManagerPass123! (Alex Thompson)
  - `manager_sarah` / ManagerPass123! (Sarah Johnson)

### 3. **System Administrator** - Monitoring & Records
- **Access Level**: Dashboard, Logs
- **Description**: Monitoring and system records
- **Users Created**:
  - `admin_robert` / AdminPass123! (Robert Kumar)
  - `admin_jessica` / AdminPass123! (Jessica Lee)
  - `admin_michael` / AdminPass123! (Michael Brown)

### 4. **Student/Researcher** - Background & Testing
- **Access Level**: Overview, Manual Analysis
- **Description**: Background research and testing
- **Users Created**:
  - `student_mark` / StudentPass123! (Mark Patterson)
  - `student_lisa` / StudentPass123! (Lisa Wang)
  - `student_james` / StudentPass123! (James Martinez)

## Access Level Breakdown

| Feature | Security Analyst | IT Manager | System Admin | Student/Researcher |
|---------|------------------|-----------|-----------------|-----------------|
| Overview | ✓ | ✓ | ✗ | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✗ |
| Logs | ✓ | ✗ | ✓ | ✗ |
| Manual Analysis | ✓ | ✗ | ✗ | ✓ |

## Installation & Setup

### 1. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Follow the installer
- Start MongoDB service

**Or use MongoDB Atlas (Cloud):**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and add to `.env`

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment

Update `.env` file:
```
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=threxia
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
```

For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 4. Seed the Database

Run the seed script to populate with demo users:

```bash
python seed_data.py
```

Or call the API endpoint after logging in as a Security Analyst:
```bash
POST /api/seed-database
Authorization: Bearer <security_analyst_token>
```

## API Endpoints

### Authentication

**Login**
```bash
POST /api/login
Content-Type: application/json

{
  "username": "analyst_james",
  "password": "SecurePass123!"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "role": "Security Analyst",
  "full_name": "James Wilson",
  "access_level": ["Overview", "Dashboard", "Logs", "Manual Analysis"]
}
```

### User Management

**Get All Users**
```bash
GET /api/users
Authorization: Bearer <token>

Response:
{
  "users": [
    {
      "username": "analyst_james",
      "full_name": "James Wilson",
      "role": "Security Analyst",
      "access_level": ["Overview", "Dashboard", "Logs", "Manual Analysis"],
      "created_at": "2024-01-15T10:30:00"
    },
    ...
  ],
  "total": 11
}
```

**Seed Database**
```bash
POST /api/seed-database
Authorization: Bearer <security_analyst_token>

Response:
{
  "message": "Database seeded successfully",
  "users_count": 11
}
```

### Protected Endpoints

**Dashboard** - Requires "Dashboard" in access_level
```bash
GET /api/dashboard
Authorization: Bearer <token>
```

**Logs** - Requires "Logs" in access_level
```bash
GET /api/logs
Authorization: Bearer <token>
```

**Manual Analysis** - Requires "Manual Analysis" in access_level
```bash
POST /api/analyze_manual
Authorization: Bearer <token>
Content-Type: application/json

{
  "features": [0.5, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 1, 0]
}
```

## Database Schema

### Users Collection

```json
{
  "_id": ObjectId,
  "username": "string",
  "password": "hashed_string",
  "full_name": "string",
  "role": "Security Analyst | IT Manager | System Administrator | Student/Researcher",
  "access_level": ["string"],
  "created_at": ISODate
}
```

## Testing with Different User Roles

### Test Security Analyst (Full Access)
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"analyst_james","password":"SecurePass123!"}'

# Can access all endpoints
- GET /api/dashboard
- GET /api/logs
- POST /api/analyze_manual
```

### Test IT Manager (Limited Access)
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager_alex","password":"ManagerPass123!"}'

# Can only access
- GET /api/dashboard  ✓
# Cannot access
- GET /api/logs       ✗ (403 Forbidden)
- POST /api/analyze_manual ✗ (403 Forbidden)
```

### Test System Administrator (Monitoring Only)
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_robert","password":"AdminPass123!"}'

# Can access
- GET /api/dashboard  ✓
- GET /api/logs       ✓
# Cannot access
- POST /api/analyze_manual ✗ (403 Forbidden)
```

### Test Student/Researcher (Research Access)
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student_mark","password":"StudentPass123!"}'

# Can access
- POST /api/analyze_manual ✓
# Cannot access
- GET /api/logs ✗ (403 Forbidden)
```

## Migration from Old System

The old in-memory users database has been replaced with MongoDB. No additional migration needed - just run the seed script to populate with the new roles.

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 30 minutes
- All access is controlled via access_level arrays
- Never commit `.env` with real credentials
- Use strong SECRET_KEY in production

## Running the Backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

Swagger documentation: `http://localhost:8000/docs`
