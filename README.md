# EduSync ERP — College Management System

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow?style=flat-square)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=flat-square&logo=vercel)](https://college-erp-final.vercel.app)

> A production-grade, full-stack College ERP system built to digitize
> campus operations — attendance, marks, fees, and administration.

🌐 **Live Demo**: https://college-erp-final.vercel.app

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18 + Vite + React Router 6            |
| Backend    | Java 17 + Spring Boot 3.2 + Spring Security |
| Database   | MySQL 8                                     |
| Auth       | JWT (JJWT) + BCrypt                         |
| Build Tool | Maven                                       |
| Deployment | Vercel (frontend)                           |

---

## Features by Role

| Feature                        | Admin | Staff | Student |
|-------------------------------|:-----:|:-----:|:-------:|
| Manage students & staff        |  ✅   |       |         |
| Attendance entry               |  ✅   |  ✅   |         |
| View own attendance            |       |       |   ✅    |
| CIA & Semester marks entry     |  ✅   |  ✅   |         |
| View own marks + GPA/CGPA      |       |       |   ✅    |
| Fee payment & tracking         |  ✅   |       |   ✅    |
| PDF receipt / marks download   |  ✅   |  ✅   |   ✅    |
| Role-based dashboard themes    |  ✅   |  ✅   |   ✅    |

---

## Architecture

```
Browser (React 18 + Vite)
        │
        │  HTTP/REST + JWT
        ▼
Spring Boot 3.2 (REST API)
  ├── Spring Security (JWT filter)
  ├── Controllers → Services → Repositories
  └── MySQL 8 (JPA/Hibernate)
```

---

## Project Structure

```
college-erp-final/
├── backend/          # Spring Boot API (Java 17)
│   └── src/main/
│       ├── java/     # Controllers, Services, Models
│       └── resources/application.properties
├── frontend/         # React app (Vite)
│   └── src/
│       ├── pages/    # Role-based page components
│       └── api/      # Axios API calls
├── database/         # MySQL schema (schema.sql)
└── docs/             # EduSync_ERP_Documentation.docx
```

---

## Quick Start

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+, npm
- MySQL 8

### 1. Database Setup

```shell
mysql -u root -p
CREATE DATABASE college_erp;
exit;
mysql -u root -p college_erp < database/schema.sql
```

### 2. Backend

```shell
cd backend
# Edit src/main/resources/application.properties:
# spring.datasource.url=jdbc:mysql://localhost:3306/college_erp
# spring.datasource.username=YOUR_USERNAME
# spring.datasource.password=YOUR_PASSWORD
./mvnw spring-boot:run
# API runs on http://localhost:8080
```

### 3. Frontend

```shell
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

> ⚠️ Default login credentials are documented in `docs/EduSync_ERP_Documentation.docx`.
> Change the admin password immediately after first login.

---

## Key API Endpoints

| Method | Endpoint                        | Description               | Auth     |
|--------|---------------------------------|---------------------------|----------|
| POST   | /api/auth/login                 | Login & get JWT token     | Public   |
| GET    | /api/students                   | List all students         | Admin    |
| POST   | /api/attendance                 | Mark attendance           | Staff    |
| GET    | /api/attendance/{studentId}     | Get student attendance    | All      |
| POST   | /api/marks                      | Enter CIA/semester marks  | Staff    |
| GET    | /api/marks/{studentId}          | Get marks + GPA/CGPA      | All      |
| POST   | /api/fees/pay                   | Record fee payment        | Admin    |
| GET    | /api/fees/{studentId}/receipt   | Download PDF receipt      | All      |

---

## Documentation

Full setup guide and API reference: `docs/EduSync_ERP_Documentation.docx`

---

## Author

**Bala Bharathi S**
- 💼 LinkedIn: https://www.linkedin.com/in/balabharathi617
- 🐙 GitHub: https://github.com/BalaBharathiS1903

---

## License

Educational project © 2025 Bala Bharathi S
