# 🎯 Premium Enterprise Insurance App - Usage Guide

## ⚠️ IMPORTANT: Authentication Required

**All pages except the landing page require you to be logged in first!**

If you see "No data" or empty charts, it means you need to log in.

---

## 🚀 Quick Start Steps

### 1. Open the Application
- Navigate to: http://localhost:5173
- You'll see the landing page

### 2. Log In
- Click the **"Login"** button in the top right
- Or click **"Get Started"**
- Enter credentials:
  - **Username:** `admin`
  - **Password:** `Admin@1234`
- Click **"Sign In to Dashboard"**

### 3. You're In!
Now you can access all features:
- ✅ Dashboard (statistics and charts)
- ✅ Policies
- ✅ Claims
- ✅ Payments
- ✅ Analytics
- ✅ Customers/Agents/Surveyors (Admin only)
- ✅ Audit Logs (Admin only)

---

## 📊 Viewing Analytics

**The Analytics page will show "No data" if:**
1. You're not logged in → **Solution: Log in first!**
2. There's no demo data → **Solution: Demo data is automatically loaded**
3. Your session expired → **Solution: Log in again**

**To view Analytics with data:**

1. **Log in** with admin credentials
2. Click **"Analytics"** in the sidebar
3. You should see:
   - Policies by type (pie chart)
   - Claims by status (bar chart)
   - Payment revenue (total amount)

---

## 🎭 Different User Roles

Try logging in as different users to see different permissions:

### Admin (`admin` / `Admin@1234`)
- Full access to everything
- Can create/edit/delete all entities
- Can view audit logs
- Can approve endorsements

### Agent (`agent1` / `Agent@1234`)
- Can manage policies
- Can manage customers
- Can view own assigned policies
- Can approve endorsements

### Customer (`customer1` / `Customer@1234`)
- Can view own policies
- Can file claims
- Can submit endorsement requests
- Can view own payments
- **Cannot** see other customers' data

### Surveyor (`surveyor1` / `Survey@1234`)
- Can view assigned claims
- Can update claim status
- Can add assessment notes

### Claims Handler (`claims1` / `Claims@1234`)
- Can process claims
- Can update claim status
- Can approve/reject claims

### Finance Officer (`finance1` / `Finance@1234`)
- Can record payments
- Can view payment analytics
- Can manage transactions

---

## 🔍 Testing Features

### Test Policy Management
1. Log in as `admin`
2. Go to **Policies**
3. Click **"+ New Policy"**
4. Fill in:
   - Policy Name: "Test Motor Insurance"
   - Policy Type: "MOTOR"
   - Premium Amount: 15000
   - Duration: 12 months
   - Customer: Select any customer
5. Click **Save**
6. ✅ Policy created!

### Test Claim Filing (FNOL)
1. Log in as `customer1`
2. Go to **Claims**
3. Click **"+ File Claim"**
4. Fill in:
   - Select an ACTIVE policy
   - Claim Amount: 50000
   - Description: "Vehicle accident"
   - Incident Location: "Mumbai"
5. Click **Submit**
6. ✅ Claim filed!

### Test Validations
1. Try creating a policy with **negative premium** → ❌ Rejected!
2. Try creating a claim with **$0 amount** → ❌ Validation error!
3. Try logging in with **wrong password** → ❌ Login fails!
4. Try registering with **weak password** → ❌ Password requirements shown!

---

## 🛠️ Troubleshooting

### "No data" on Analytics page
**Problem:** Not logged in or session expired  
**Solution:** 
1. Click your profile icon (top right)
2. Log out
3. Log in again

### Can't see certain menu items
**Problem:** User role doesn't have permission  
**Solution:** Log in as `admin` to see all features

### API errors (403 Forbidden)
**Problem:** JWT token expired or missing  
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (F5)
3. Log in again

### Charts not loading
**Problem:** Analytics data not fetching  
**Solution:**
1. Open browser console (F12)
2. Check for network errors
3. Verify you're logged in
4. Check backend is running (http://localhost:8080)

---

## 🎨 Features to Explore

### Dashboard
- View total counts (customers, policies, claims)
- See active vs expired policies
- Check pending vs approved claims
- View payment statistics

### Policies
- Create new insurance policies
- View all policies (filtered by role)
- Edit policy details (Admin/Agent only)
- Delete policies (Admin only)
- See policy status (ACTIVE, EXPIRED, CANCELLED)

### Claims
- File new claims (FNOL)
- View claim status
- Assign surveyors (Admin/Surveyor)
- Approve/reject claims (Admin/Claims Handler)
- Add assessment notes

### Payments
- Record new payments
- View payment history
- Filter by method (Credit Card, UPI, etc.)
- See transaction IDs

### Endorsements
- Submit policy modification requests (Customer)
- View endorsement status
- Approve/reject endorsements (Admin/Agent)

### Analytics
- View policies by type (pie chart)
- View claims by status (bar chart)
- View payment revenue trends
- Monthly revenue breakdown

### Audit Logs (Admin only)
- View all system actions
- See who did what and when
- Filter by action type
- Track changes

---

## 💡 Tips

1. **Use Swagger UI** for API testing: http://localhost:8080/swagger-ui.html
2. **Check backend logs** if something doesn't work
3. **Use browser DevTools** (F12) to see network requests
4. **Try different roles** to understand permissions
5. **Test validations** to see error handling

---

## 🚨 Common Mistakes

❌ **Opening Analytics without logging in** → You'll see "No data"  
✅ **Log in first**, then go to Analytics

❌ **Using wrong credentials** → Login will fail  
✅ **Use exact credentials** from the guide (case-sensitive!)

❌ **Trying to access Admin features as Customer** → 403 Forbidden  
✅ **Log in as admin** to access admin features

❌ **Expecting real payment processing** → This is demo/sandbox mode  
✅ **Payments are recorded** but not processed through real gateway

---

## 📞 Quick Reference

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:8080  
**Swagger:** http://localhost:8080/swagger-ui.html  

**Admin Login:** `admin` / `Admin@1234`  
**Test Customer:** `customer1` / `Customer@1234`

**Demo Data:** Automatically loaded on startup  
**Seed Data Flag:** `SEED_DATA_ENABLED=true` (in environment)

---

## ✨ Now You're Ready!

1. Log in with `admin` / `Admin@1234`
2. Explore the dashboard
3. Create some policies
4. File a claim
5. View analytics
6. Test validations

**Enjoy using your Premium Enterprise Insurance App!** 🎉
