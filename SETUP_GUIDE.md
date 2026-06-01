# EduSync ERP - Complete Setup Guide (v3.1.0 - Security Hardened)

## 🎯 What's New in v3.1.0

✅ **All Security Vulnerabilities Fixed** (SSRF, timing attacks, null pointer issues)  
✅ **All Runtime Bugs Resolved** (hook order, division by zero, undefined access)  
✅ **Professional Icon System** (replaced all emojis with SVG icons)  
✅ **Motion Theme System** (smooth animations with Framer Motion)  
✅ **Enhanced Accessibility** (WCAG 2.1 compliant)  
✅ **Production Ready** (comprehensive error handling)

---

## 📋 Prerequisites

### Required Software:
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **Java**: JDK 17 or higher ([Download](https://adoptium.net/))
- **MySQL**: 8.0 or higher ([Download](https://dev.mysql.com/downloads/))
- **Maven**: 3.9+ (included in `backend/apache-maven-3.9.6/`)

### Verify Installation:
```powershell
node --version    # Should show v18.x.x or higher
java --version    # Should show Java 17 or higher
mysql --version   # Should show MySQL 8.0 or higher
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone & Navigate
```powershell
cd d:\EduSync_ERP_Complete\college-erp-final
```

### Step 2: Database Setup
```powershell
# Start MySQL and create database
mysql -u root -p
```

```sql
CREATE DATABASE college_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```powershell
# Import schema
mysql -u root -p college_erp < database\schema.sql
```

### Step 3: Backend Configuration
```powershell
cd backend
```

Edit `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/college_erp?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Server Configuration
server.port=8080

# Security
jwt.secret=YOUR_SECURE_JWT_SECRET_KEY_HERE_MINIMUM_256_BITS
jwt.expiration=86400000

# CORS (adjust for production)
cors.allowed.origins=http://localhost:5173,https://your-domain.com
```

**🔒 Security Note**: 
- Generate a strong JWT secret: `openssl rand -base64 32`
- Never commit secrets to version control
- Use environment variables in production

### Step 4: Start Backend
```powershell
# Using included Maven (Windows)
apache-maven-3.9.6\bin\mvn.cmd clean install
apache-maven-3.9.6\bin\mvn.cmd spring-boot:run

# OR using system Maven
mvn clean install
mvn spring-boot:run
```

Backend will start on: `http://localhost:8080`

### Step 5: Frontend Setup
```powershell
cd ..\frontend
npm install
```

Create `.env` file in `frontend/` directory:
```env
VITE_API_URL=http://localhost:8080
VITE_ADMIN_DEFAULT_PASSWORD=ChangeMe@First1
```

### Step 6: Start Frontend
```powershell
npm run dev
```

Frontend will start on: `http://localhost:5173`

---

## 🔐 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `ChangeMe@First1` (or value from `.env`)
- **Role**: ADMIN

**⚠️ CRITICAL**: Change the admin password immediately after first login!

### Creating Additional Users
1. Login as admin
2. Navigate to "User Management"
3. Click "+ Add User"
4. Fill in details and assign role (STAFF/STUDENT)

---

## 🏗️ Project Structure

```
college-erp-final/
├── backend/                    # Spring Boot API (Java 17)
│   ├── src/main/
│   │   ├── java/              # Controllers, Services, Models
│   │   └── resources/
│   │       └── application.properties
│   ├── apache-maven-3.9.6/    # Bundled Maven
│   └── pom.xml
│
├── frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Icons.jsx      # ✨ Icon system (30+ icons)
│   │   │   ├── IconSystem.jsx # Extended icon library
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # 🔒 Security hardened
│   │   ├── pages/             # Dashboard components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── utils/             # Helper functions
│   │   │   ├── motionTheme.js # ✨ Animation system
│   │   │   ├── userStore.js
│   │   │   ├── feeStore.js
│   │   │   ├── staffStore.js
│   │   │   └── collegeStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql             # MySQL database schema
│
├── docs/
│   └── EduSync_ERP_Documentation.docx
│
├── SECURITY_FIXES.md          # ✨ Security audit report
├── SETUP_GUIDE.md             # This file
└── README.md
```

---

## 🎨 New Features in v3.1.0

### 1. Professional Icon System
All emojis replaced with scalable SVG icons:

```jsx
import { Icon } from './components/Icons';

// Usage
<Icon name="dashboard" size={20} />
<Icon name="user" size={16} />
<Icon name="logout" size={18} />
```

**Available Icons**: dashboard, users, fees, timetable, attendance, marks, profile, logout, menu, save, refresh, add, check, warning, info, search, download, student, staff, money, pending, close, book, chart, arrow

### 2. Motion Theme System
Smooth animations powered by Framer Motion:

```jsx
import { motion } from 'framer-motion';
import { motionVariants } from './utils/motionTheme';

// Page transition
<motion.div {...motionVariants.pageTransition}>
  <YourComponent />
</motion.div>

// Card hover effect
<motion.div {...motionVariants.cardHover}>
  <Card />
</motion.div>
```

**Available Animations**:
- Page transitions (fade, slide, scale)
- Modal animations
- List stagger effects
- Hover effects (lift, scale, glow)
- Loading animations (spinner, pulse, dots)

### 3. Enhanced Security
- ✅ SSRF protection with URL allowlisting
- ✅ Timing-safe password comparison
- ✅ Input validation and sanitization
- ✅ Comprehensive error handling
- ✅ Null safety checks

---

## 🧪 Testing the Application

### 1. Test Admin Features
```
Login as admin → User Management → Add a student
Navigate to Fees Management → Allocate fees
Check Timetable → Edit schedule
Test Staff Allocation → Assign subjects
```

### 2. Test Staff Features
```
Create a staff user → Login as staff
Mark Attendance → Save session
Enter CIA Marks → Verify calculations
(If COE) Enter Semester Marks
View My Students → Check statistics
```

### 3. Test Student Features
```
Create a student → Login as student
View Dashboard → Check subjects
View Mark Statement → Download PDF
Check Attendance → Verify records
Pay Fees → Download receipt
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue**: Port 8080 already in use
```powershell
# Find process using port 8080
netstat -ano | findstr :8080
# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Issue**: Database connection failed
- Verify MySQL is running: `net start MySQL80`
- Check credentials in `application.properties`
- Ensure database `college_erp` exists

### Frontend Won't Start

**Issue**: Module not found
```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Vite port conflict
```powershell
# Use different port
npm run dev -- --port 3000
```

### Login Issues

**Issue**: "Invalid credentials"
- Verify you're using correct default password
- Check `.env` file for `VITE_ADMIN_DEFAULT_PASSWORD`
- Ensure backend is running

**Issue**: "Network error"
- Verify backend is running on port 8080
- Check CORS configuration in backend
- Verify `VITE_API_URL` in frontend `.env`

---

## 📦 Building for Production

### Frontend Build
```powershell
cd frontend
npm run build
```

Output: `frontend/dist/` (deploy to Vercel, Netlify, etc.)

### Backend Build
```powershell
cd backend
mvn clean package
```

Output: `backend/target/college-erp-0.0.1-SNAPSHOT.jar`

Run JAR:
```powershell
java -jar target/college-erp-0.0.1-SNAPSHOT.jar
```

---

## 🌐 Deployment

### Frontend (Vercel)
```powershell
cd frontend
npm install -g vercel
vercel --prod
```

### Backend (AWS/Heroku/Railway)
1. Set environment variables:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET`

2. Deploy JAR file or use Docker

### Database (Production)
- Use managed MySQL (AWS RDS, Google Cloud SQL)
- Enable SSL connections
- Set up automated backups
- Configure firewall rules

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Generate strong JWT secret (256-bit minimum)
- [ ] Configure CORS for production domain only
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Review and update `application.properties`
- [ ] Remove development credentials
- [ ] Enable SQL injection protection
- [ ] Configure session timeout
- [ ] Set up intrusion detection

---

## 📊 Performance Optimization

### Frontend
- ✅ Code splitting enabled (React Router)
- ✅ Lazy loading for routes
- ✅ Optimized bundle size
- ✅ GPU-accelerated animations
- ✅ Debounced search inputs

### Backend
- Configure connection pooling
- Enable query caching
- Add database indexes
- Implement pagination
- Use CDN for static assets

---

## 🆘 Support & Resources

### Documentation
- Full API docs: `docs/EduSync_ERP_Documentation.docx`
- Security fixes: `SECURITY_FIXES.md`
- README: `README.md`

### Community
- GitHub Issues: [Report bugs]
- Email: support@edusync-erp.com

### Learning Resources
- React: https://react.dev
- Spring Boot: https://spring.io/projects/spring-boot
- Framer Motion: https://www.framer.com/motion/
- MySQL: https://dev.mysql.com/doc/

---

## 📝 Changelog

### v3.1.0 (Current) - Security & UX Update
- 🔒 Fixed SSRF vulnerability (CWE-918)
- 🐛 Fixed 8 critical runtime bugs
- 🎨 Replaced emojis with professional icons
- ✨ Added motion theme system
- ♿ Improved accessibility (WCAG 2.1)
- 📦 Enhanced error handling
- 🚀 Production-ready optimizations

### v3.0.0 - Initial Release
- Basic ERP functionality
- Admin, Staff, Student portals
- Attendance, Marks, Fees management

---

## ⚖️ License

Educational project © 2025 Bala Bharathi S

---

**Setup Time**: ~5 minutes  
**Difficulty**: Beginner-friendly  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-01-XX
