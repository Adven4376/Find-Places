# 🌍 Find-Places Community Maps

A full-stack, responsive web application for exploring, discovering, and contributing to a community-driven map.

🔗 **Live Demo:** [https://find-places-cyan.vercel.app/]  
*(Note: As the backend is deployed on Render's free tier, the initial load may take ~50 seconds to spin up from sleep mode.)*

---

## 🚀 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS 4 (Glassmorphism, Responsive UI)
- React Router v7
- Leaflet & React Leaflet (Map Integration)
- Axios & React Hook Form

**Backend**
- Java 21
- Spring Boot 4.0.3
- Spring Security (JWT)
- Spring Data JPA
- Hibernate

**Database & Deployment**
- PostgreSQL (Database)
- Docker (Containerization)
- Backend Deployment: Render
- Frontend Deployment: Render / Vercel

---

## ✨ Features

- 🗺️ **Interactive Maps:** Smooth polyline navigation and smart auto-recentering.
- 📍 **Community Contributions:** Authenticated users can drop pins and add new places.
- 🛡️ **Admin Dashboard:** Review, manage, and curate submitted places.
- 💎 **Premium UI:** Glassmorphism aesthetics, dynamic gradients, and modern design.
- 📱 **Fully Responsive:** Optimized for both desktop and mobile devices.
- 🖼️ **Image Uploads:** Secure storage and delivery of place images.
- 🔐 **Secure Authentication:** JWT-based stateless login and Role-Based Access Control (RBAC).
- ⚡ **Map Optimization:** Marker clustering for high performance with numerous points.

---

## 🏗️ Architecture Overview

React (Vite) -> REST API (Axios) -> Spring Boot Backend -> JPA / Hibernate -> PostgreSQL Database

- **Frontend** handles UI, map interactions, place submissions, routing, and token decoding.
- **Backend** exposes REST APIs for authentication, place management, and static file serving.
- **Database** stores user credentials, place coordinates, and metadata.
- **JWT Authentication** ensures secure and stateless session management across requests.

---

## 🧠 Core Logics & Handling

- 🗺️ **Map Optimization:** Utilizes `react-leaflet-cluster` so the browser remains smooth even when loading thousands of points.
- 🖼️ **Image Handling Workflow:** File uploads are managed by Spring's Multipart capability, saved securely to a local `uploads/places` directory, and served as static resources.
- 🔐 **Role-Based Routing:** `jwt-decode` dynamically unpacks tokens on the frontend to direct users to protected Main Layouts or Admin Dashboards based on their roles.

---

## 🔌 API Endpoints (Highlights)

- `POST /auth/login` ➝ Authenticate user and receive JWT
- `POST /auth/register` ➝ Register a new user
- `GET /places` ➝ Fetch all approved community places
- `POST /places` ➝ Submit a new place (Authenticated)
- `GET /admin/places/pending` ➝ Fetch pending places for review
- `PUT /admin/places/{id}/approve` ➝ Approve a submitted place

---

## 🛠️ Run Locally

**Backend (Spring Boot)**

```bash
cd "FindPlaces - Backend/FindPlaces"
# Configure application.properties with your PostgreSQL details
mvnw spring-boot:run
```

**Frontend (React)**

```bash
cd "FindPlaces_UI/community-map-ui"
# Create a .env file with VITE_API_BASE_URL=http://localhost:9090
npm install
npm run dev
```