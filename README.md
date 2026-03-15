# EduSync ERP — College Management System

Full-stack web application for managing college operations including attendance, marks, fees, and administration.

## Tech Stack
- **Frontend**: React 18 + Vite + React Router 6
- **Backend**: Java 17 + Spring Boot 3.2 + Spring Security
- **Database**: MySQL 8
- **Auth**: JWT (JJWT) + BCrypt

## Quick Start

### 1. Database Setup
```bash
mysql -u root -p
CREATE DATABASE college_erp;
exit;
mysql -u root -p college_erp < database/schema.sql
```

### 2. Backend
```bash
cd backend
# Update src/main/resources/application.properties with your MySQL credentials
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Default Login
- **Username**: admin
- **Password**: admin@123
- **Role**: ADMIN

⚠️ Change default password immediately!

## Features
- ✅ Role-based access (Admin/Staff/Student)
- ✅ Hour-based attendance tracking
- ✅ CIA + Semester marks management
- ✅ Fee payment & receipt generation
- ✅ PDF downloads for marks & receipts
- ✅ GPA/CGPA auto-calculation
- ✅ Responsive UI with distinct themes per role

## Documentation
See `docs/EduSync_ERP_Documentation.docx` for complete setup guide and API reference.

## Project Structure
```
college-erp-final/
├── database/         # MySQL schema
├── backend/          # Spring Boot API (Java)
├── frontend/         # React app (Vite)
└── docs/            # Documentation
```

## License
Educational project © 2025
