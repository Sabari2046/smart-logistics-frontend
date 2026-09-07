# TransBayX — Intelligent Logistics & Fleet Management System

A modern, enterprise-grade full-stack logistics SaaS platform designed to manage shipments, vehicles, certified drivers, transit routes, regional warehouses, maintenance lifecycles, and executive analytics.

---

## 🏗️ Architecture

- **Frontend**: React 19, Vite, Ant Design (v5), Redux Toolkit, React Router DOM v7, Axios, Recharts.
- **Backend**: Spring Boot 3.4.3, Java 21, Spring Security with JWT, Spring Data JPA, Hibernate, Bean Validation.
- **Database**: MySQL.

---

## 🚀 Getting Started

### 1. Database Setup
Make sure MySQL is running on `localhost:3306` (or configure DB_URL environment variable).
Create database:
```sql
CREATE DATABASE IF NOT EXISTS smart_logistics_db;
```

### 2. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will start on `http://localhost:8081` and initialize the TransBayX Super Admin account.

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev -- --port 3000 --host
```
Frontend will be live at `http://localhost:3000`.

---

## 👥 System Access Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admintransbayx@gmail.com` | `Admin@123` |

*Note: New customers can register at `/register`, while drivers and fleet resources are provisioned directly by the Administrator through the console.*
