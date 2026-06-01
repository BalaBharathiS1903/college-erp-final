# ⚡ Quick Fix Reference Card

## 🔥 Most Common Issues (90% of problems)

### 1️⃣ "Signal Timed Out" → Backend Not Running
```powershell
cd backend
mvn spring-boot:run
```
**Wait 30 seconds for "Started CollegeErpApplication"**

---

### 2️⃣ Increase Timeout → Create `.env` file
```env
# frontend/.env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_ADMIN_DEFAULT_PASSWORD=ChangeMe@First1
```
**Restart frontend after creating .env**

---

### 3️⃣ Database Not Found → Create Database
```powershell
mysql -u root -p
CREATE DATABASE college_erp;
EXIT;
mysql -u root -p college_erp < database\schema.sql
```

---

### 4️⃣ Port Already in Use → Kill Process
```powershell
# Find process on port 8080
netstat -ano | findstr :8080

# Kill it (replace <PID>)
taskkill /PID <PID> /F
```

---

### 5️⃣ Module Not Found → Reinstall
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Default Credentials
- **Admin**: `admin` / `ChangeMe@First1`
- **Backend**: `http://localhost:8080`
- **Frontend**: `http://localhost:5173`

---

## ✅ Startup Checklist
1. [ ] MySQL running → `net start MySQL80`
2. [ ] Database created → `college_erp`
3. [ ] Backend running → Port 8080
4. [ ] Frontend running → Port 5173
5. [ ] `.env` file created → With timeout setting

---

## 🔧 Configuration Files

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_ADMIN_DEFAULT_PASSWORD=ChangeMe@First1
```

### Backend `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/college_erp
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
server.port=8080
```

---

## 🚀 Start Commands

### Backend
```powershell
cd backend
mvn spring-boot:run
```

### Frontend
```powershell
cd frontend
npm run dev
```

---

## 📞 Need More Help?
- Full Guide: `TROUBLESHOOTING.md`
- Setup: `SETUP_GUIDE.md`
- Security: `SECURITY_FIXES.md`

---

**Pro Tip**: The app works offline! If backend is down, it uses localStorage for authentication.
