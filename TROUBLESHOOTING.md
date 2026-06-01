# 🔧 EduSync ERP - Troubleshooting Guide

## ⚠️ Common Errors & Solutions

---

## 1. "Signal Timed Out" Error

### ❌ Error Message:
```
TimeoutError: signal timed out
AbortError: The operation was aborted
```

### 🔍 **Causes:**
1. **Backend is not running** (most common)
2. **Backend takes too long to start** (Spring Boot initialization)
3. **Slow network connection**
4. **Wrong backend URL configured**

### ✅ **Solutions:**

#### **Solution 1: Check if Backend is Running**
```powershell
# Windows - Check if port 8080 is in use
netstat -ano | findstr :8080

# If nothing shows, backend is NOT running
# Start the backend:
cd backend
mvn spring-boot:run
```

#### **Solution 2: Increase Timeout**
Create/edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000  # 30 seconds (increase if needed)
```

Then restart frontend:
```powershell
cd frontend
npm run dev
```

#### **Solution 3: Wait for Backend to Fully Start**
Spring Boot takes 10-30 seconds to start. Look for this message:
```
Started CollegeErpApplication in X.XXX seconds
```

#### **Solution 4: Use Offline Mode**
The app automatically falls back to local authentication if backend is unavailable.
- Default credentials still work
- Data stored in browser localStorage
- Perfect for development/testing

---

## 2. "Failed to Fetch" Error

### ❌ Error Message:
```
TypeError: Failed to fetch
Network request failed
```

### 🔍 **Causes:**
1. Backend not running
2. Wrong API URL
3. CORS issues
4. Firewall blocking connection

### ✅ **Solutions:**

#### **Check Backend URL**
Frontend `.env`:
```env
VITE_API_URL=http://localhost:8080  # Must match backend port
```

Backend `application.properties`:
```properties
server.port=8080  # Must match frontend URL
```

#### **Fix CORS Issues**
Backend `application.properties`:
```properties
cors.allowed.origins=http://localhost:5173,http://localhost:3000
```

#### **Check Firewall**
```powershell
# Windows - Allow port 8080
netsh advfirewall firewall add rule name="EduSync Backend" dir=in action=allow protocol=TCP localport=8080
```

---

## 3. "Invalid Credentials" Error

### ❌ Error Message:
```
Invalid username or password
Backend unavailable. Invalid credentials for offline mode.
```

### ✅ **Solutions:**

#### **Default Credentials:**
- **Admin**: `admin` / `ChangeMe@First1`
- **Staff**: Create via Admin Dashboard
- **Student**: Create via Admin Dashboard

#### **Check Password in .env:**
```env
VITE_ADMIN_DEFAULT_PASSWORD=ChangeMe@First1
```

#### **Reset Admin Password:**
If you changed it and forgot:
1. Clear browser localStorage (F12 → Application → Local Storage → Clear)
2. Restart frontend
3. Use default password again

---

## 4. Backend Won't Start

### ❌ Error Messages:
```
Port 8080 already in use
Could not connect to database
```

### ✅ **Solutions:**

#### **Port Already in Use:**
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F

# Or change backend port in application.properties:
server.port=8081
```

#### **Database Connection Failed:**
```powershell
# Check if MySQL is running
net start MySQL80

# If not installed, install MySQL 8.0
# Then create database:
mysql -u root -p
CREATE DATABASE college_erp;
EXIT;

# Import schema:
mysql -u root -p college_erp < database\schema.sql
```

#### **Check Database Credentials:**
`backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/college_erp
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD  # Update this!
```

---

## 5. Frontend Won't Start

### ❌ Error Messages:
```
Module not found
Port 5173 already in use
```

### ✅ **Solutions:**

#### **Module Not Found:**
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### **Port Already in Use:**
```powershell
# Use different port
npm run dev -- --port 3000
```

#### **Vite Build Errors:**
```powershell
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## 6. "Cannot Read Properties of Null" Error

### ❌ Error Message:
```
TypeError: Cannot read properties of null (reading 'document')
```

### 🔍 **Cause:**
Browser is blocking popups (PDF downloads)

### ✅ **Solution:**
1. Allow popups for `localhost:5173`
2. Click the popup icon in address bar
3. Select "Always allow popups from this site"

---

## 7. Data Not Persisting

### ❌ Issue:
Changes disappear after refresh

### 🔍 **Causes:**
1. Backend not running (using localStorage only)
2. Database not configured
3. Browser in incognito mode

### ✅ **Solutions:**

#### **Check Backend Connection:**
Open browser console (F12) and look for:
```
Backend connection timeout - falling back to local authentication
```
If you see this, backend is not running.

#### **Start Backend:**
```powershell
cd backend
mvn spring-boot:run
```

#### **Check Browser Storage:**
- Don't use incognito mode
- Check localStorage isn't full
- Clear cache if needed

---

## 8. Slow Performance

### ❌ Issue:
App is slow or laggy

### ✅ **Solutions:**

#### **Increase Backend Memory:**
```powershell
# Run with more memory
java -Xmx1024m -jar target/college-erp-0.0.1-SNAPSHOT.jar
```

#### **Clear Browser Cache:**
```
F12 → Application → Clear Storage → Clear site data
```

#### **Optimize Database:**
```sql
-- Add indexes for better performance
USE college_erp;
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_student_id ON attendance(student_id);
```

---

## 9. PDF Download Not Working

### ❌ Issue:
PDF doesn't download or shows blank page

### ✅ **Solutions:**

1. **Allow Popups** (see #6 above)
2. **Check Browser Compatibility:**
   - Chrome 90+ ✅
   - Firefox 88+ ✅
   - Safari 14+ ✅
   - Edge 90+ ✅
3. **Try Different Browser** if issue persists

---

## 10. "Division by Zero" Error (Fixed in v3.1.0)

### ❌ Error Message:
```
NaN
Infinity
```

### ✅ **Solution:**
Update to v3.1.0 - this bug is fixed!

---

## 🔍 Debug Mode

### Enable Detailed Logging:

#### **Frontend:**
Open browser console (F12) to see:
- Network requests
- Error messages
- Warning logs

#### **Backend:**
Edit `application.properties`:
```properties
logging.level.root=DEBUG
logging.level.com.college.erp=DEBUG
```

---

## 📞 Still Having Issues?

### Checklist:
- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 5173
- [ ] MySQL database is running
- [ ] Database `college_erp` exists
- [ ] Schema is imported
- [ ] `.env` file is configured
- [ ] No firewall blocking ports
- [ ] Browser allows popups
- [ ] Using supported browser

### Get Help:
1. Check `SETUP_GUIDE.md` for detailed setup
2. Check `SECURITY_FIXES.md` for known issues
3. Open GitHub issue with:
   - Error message
   - Browser console logs
   - Backend logs
   - Steps to reproduce

---

## 🚀 Quick Reset (Nuclear Option)

If nothing works, start fresh:

```powershell
# 1. Stop everything
# Press Ctrl+C in all terminals

# 2. Clear database
mysql -u root -p
DROP DATABASE college_erp;
CREATE DATABASE college_erp;
EXIT;
mysql -u root -p college_erp < database\schema.sql

# 3. Clear frontend
cd frontend
rm -rf node_modules package-lock.json .env
npm install
copy .env.example .env
# Edit .env with your settings

# 4. Clear backend cache
cd ..\backend
mvn clean

# 5. Start fresh
# Terminal 1:
cd backend
mvn spring-boot:run

# Terminal 2:
cd frontend
npm run dev
```

---

## 📊 System Requirements

### Minimum:
- RAM: 4GB
- CPU: Dual-core 2GHz
- Disk: 2GB free space
- Internet: Not required (offline mode)

### Recommended:
- RAM: 8GB+
- CPU: Quad-core 2.5GHz+
- Disk: 5GB free space
- Internet: Stable connection for backend

---

**Last Updated**: 2025-01-XX  
**Version**: 3.1.0  
**Status**: All known issues documented
