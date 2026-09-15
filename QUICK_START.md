# 🚀 Premium Enterprise Insurance App - QUICK START GUIDE

## ⚡ 5-Minute Setup

### Prerequisites
- Java 17 or higher
- PostgreSQL 16
- Node.js 18 or higher
- Maven (bundled with mvnw)

### Step 1: Database Setup (2 minutes)
```powershell
# Start PostgreSQL and create database
psql -U postgres
CREATE DATABASE insurance_db;
\q
```

### Step 2: Environment Configuration (1 minute)
```powershell
# Set environment variables
$env:DB_URL = "jdbc:postgresql://localhost:5432/insurance_db"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your_password_here"
$env:JWT_SECRET = "your-super-secret-jwt-key-must-be-at-least-32-characters-long"
```

### Step 3: Start Backend (1 minute)
```powershell
cd "src/backend"
./mvnw.cmd spring-boot:run
```

**Backend running at:** http://localhost:8080  
**Swagger UI at:** http://localhost:8080/swagger-ui.html

### Step 4: Start Frontend (1 minute)
Open a new terminal:
```powershell
# From project root
npm install --package-lock=false
npm run dev
```

**Frontend running at:** http://localhost:5173

---

## 🎯 First Login

1. Open browser: http://localhost:5173
2. Click **"Login"** button
3. Use demo credentials:
   - **Username:** `admin`
   - **Password:** `Admin@1234`
4. Explore the dashboard!

---

## 📱 Quick Feature Tour

### As Admin User
1. **Dashboard** - View system statistics
2. **Policies** - Create/edit insurance policies
3. **Claims** - Review and approve claims
4. **Customers** - Manage customer accounts
5. **Analytics** - View charts and reports
6. **Audit Logs** - Track system changes

### As Customer User
Login with `customer1` / `Customer@1234`:
1. View your policies
2. File a claim (FNOL)
3. Request policy endorsements
4. View payment history

---

## 🐳 Docker Quick Start (Alternative)

```powershell
# Set required environment variables
$env:DB_PASSWORD = "postgres"
$env:JWT_SECRET = "docker-development-secret-key-32-chars-minimum"

# Start everything
docker compose up --build
```

- Frontend: http://localhost:80
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

---

## 🧪 Quick Verification

### Test Backend
```powershell
cd src/backend
./mvnw.cmd test
```
Expected: ✅ Tests run: 1, Failures: 0

### Test Frontend Build
```powershell
npm run build
```
Expected: ✅ built in ~13s

### Test API
Open: http://localhost:8080/swagger-ui.html

Try the `/api/v1/auth/login` endpoint with:
```json
{
  "username": "admin",
  "password": "Admin@1234"
}
```

---

## 📊 Demo Workflow

### 1. Create a Customer (as Admin)
- Navigate to **Customers** → **+ New Customer**
- Fill in details and save

### 2. Create a Policy (as Admin/Agent)
- Navigate to **Policies** → **+ New Policy**
- Select customer and policy type
- Set premium and coverage
- Save

### 3. File a Claim (as Customer)
- Login as customer
- Navigate to **Claims** → **+ File Claim**
- Select policy and describe incident
- Submit

### 4. Process Claim (as Admin/Surveyor)
- Review claim details
- Assign surveyor
- Update status to APPROVED
- Enter approved amount

### 5. Record Payment (as Customer/Finance)
- Navigate to **Payments** → **+ New Payment**
- Select policy
- Enter amount and payment method
- Submit

---

## 🔑 All Demo Accounts

| Username | Password | Role | What You Can Do |
|----------|----------|------|-----------------|
| `admin` | `Admin@1234` | Admin | Everything |
| `agent1` | `Agent@1234` | Agent | Manage policies & customers |
| `surveyor1` | `Survey@1234` | Surveyor | Investigate claims |
| `claims1` | `Claims@1234` | Claims Handler | Process claims |
| `finance1` | `Finance@1234` | Finance | Manage payments |
| `customer1` | `Customer@1234` | Customer | View own data, file claims |

---

## 🛠️ Troubleshooting

### Backend won't start
**Error:** Could not connect to database  
**Fix:** Verify PostgreSQL is running and credentials are correct

**Error:** JWT secret required  
**Fix:** Set `JWT_SECRET` environment variable (min 32 characters)

### Frontend won't connect
**Error:** Network Error / CORS  
**Fix:** Ensure backend is running at http://localhost:8080

### Build fails
**Error:** Module not found  
**Fix:** Delete `node_modules` and run `npm install` again

### Tests fail
**Error:** Could not load context  
**Fix:** Ensure H2 database is in classpath (already in pom.xml)

---

## 📚 Next Steps

1. Read [README.md](README.md) for detailed information
2. Review [API.md](docs/API.md) for endpoint documentation
3. Check [DATABASE.md](docs/DATABASE.md) for schema details
4. See [PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md) for full feature list

---

## 💡 Pro Tips

- **Hot Reload:** Frontend automatically reloads on file changes
- **Live Reload:** Backend requires restart for Java changes
- **Swagger UI:** Best way to test API endpoints
- **Dark Mode:** Toggle in top-right corner of frontend
- **Seed Data:** Automatically loaded with demo accounts and sample data
- **Log Level:** Set to DEBUG in dev mode for detailed logs

---

## 🆘 Need Help?

1. Check console logs (backend terminal)
2. Check browser console (F12 → Console)
3. Verify environment variables are set
4. Ensure no other services are using ports 8080 or 5173
5. Review error messages in Swagger UI responses

---

**Happy Coding! 🎉**

The application is now ready for development, testing, and demonstration.
