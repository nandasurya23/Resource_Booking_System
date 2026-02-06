# Resource Booking System

A fullstack **resource booking system** built with **Next.js (frontend)** and **Golang + Gin (backend)**, using **PostgreSQL** for database and **Redis** for caching/session management. The project is fully containerized with **Docker Compose**.

---

## Features

### Authentication
- JWT-based login
- Role-based access: `user` and `admin`
- Protected routes

### Booking Management
- Users can create, view, and cancel bookings
- Admins can approve or cancel bookings
- Booking status: `pending`, `approved`, `cancelled`
- Booking time validation (end must be after start)

### Resources
- Manage multiple resources (e.g., Meeting Room A/B, Projector)

### Admin Dashboard
- View all bookings
- Approve or cancel bookings

### Tech & Tools
- Frontend: Next.js 13, React 18, TypeScript, Tailwind CSS, Sonner (toast notifications)
- Backend: Golang 1.24+, Gin, PostgreSQL, Redis
- DevOps: Docker & Docker Compose
- API: RESTful

### Database
- PostgreSQL stores users, resources, and bookings
- Example tables:
  - `users` (id, email, password, role)
  - `resources` (id, name)
  - `bookings` (id, resource_id, start_time, end_time, status)

---

## Getting Started

### Clone Repo
```bash
git clone <repo-url>
cd New_Portofolio

Challenges Faced

  Handling JWT auth in both frontend (auto logout) and backend (middleware)
  Database migrations & initial seeding with Docker volume
  CORS & Authorization headers for Next.js + Gin
  Containerizing fullstack app with Docker Compose
  Retry connection for backend until Postgres is ready
  Role-based access and protecting admin routes

##Notes

Make sure to insert at least one user manually into PostgreSQL:

INSERT INTO users (email, password, role) VALUES ('admin@example.com', '<hashed-password>', 'admin');


