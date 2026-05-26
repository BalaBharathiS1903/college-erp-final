# EduSync ERP — College Management System

Full-stack web application for managing college operations including attendance, marks, fees, and administration.

## Tech Stack
- **Frontend**: React 18 + Vite + React Router 6
- **Backend**: Java 17 + Spring Boot 3.2 + Spring Security
- **Database**: MySQL 8
- **Auth**: JWT (JJWT) + BCrypt

## Quick Start (development)

Prerequisites: Java 17+, Node.js 18+, npm, and Maven (or use the included Maven in `backend/apache-maven-3.9.6`).

1) Database (MySQL)

```powershell
mysql -u root -p
CREATE DATABASE college_erp;
exit;
mysql -u root -p college_erp < database/schema.sql
```

2) Backend

```powershell
cd backend
# Update src/main/resources/application.properties with your MySQL credentials
mvn spring-boot:run
# If you prefer the included Maven on Windows:
# apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
# Backend listens on http://localhost:8080
```

3) Frontend

```powershell
cd frontend
npm install
npm run dev
# Frontend dev server: http://localhost:5173
```

Build frontend for production:

```powershell
cd frontend
npm run build
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
└── docs/             # Documentation
```

## Contributing
- Open an issue or submit a pull request. Keep UI changes in `frontend/src/` and backend work under `backend/src/`.

## License
Educational project © 2025
