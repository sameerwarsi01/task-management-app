# TaskFlow - Full-Stack Task Management Application

A full-stack collaborative task management platform built with Next.js, Flask, and Supabase. The application features real-time OAuth authentication, structured task workflows, database constraint integrity, and asynchronous email notifications.

---

## Live Deployments & Repository

- **Live Application (Frontend)**: [https://task-management-app-sable-eight.vercel.app](https://task-management-app-sable-eight.vercel.app)
- **API Service (Backend)**: [https://task-management-app-thsv.onrender.com](https://task-management-app-thsv.onrender.com)
- **GitHub Repository**: [https://github.com/sameerwarsi1/task-management-app](https://github.com/sameerwarsi1/task-management-app)

---

## System Architecture

```text
+---------------------------------------------------------------+
|                   Next.js Frontend (Vercel)                   |
|   - Supabase Client SDK (Google OAuth 2.0 Auth Flow)          |
|   - Task Creation, Dynamic User Assignment, Status Toggling   |
|   - Axios Interceptor with automatic JWT Session Management   |
+-------------------------------+-------------------------------+
                                |
                    HTTPS / Bearer Auth Token
                                v
+---------------------------------------------------------------+
|                     Flask Backend (Render)                    |
|   - Token Validation against Supabase Auth                    |
|   - RESTful Endpoints (/api/tasks, /api/users)                |
|   - Auto-sync User Profile Metadata (/profiles table)          |
+---------------+-------------------------------+---------------+
                |                               |
     PostgREST SDK Operations          Async Background Worker
                v                               v
+-------------------------------+   +---------------------------+
|      Supabase (Database)      |   |      Resend HTTP API      |
|   - PostgreSQL Relational DB  |   |   - Task Assigned Alert   |
|   - Foreign Keys & Constraints|   |   - Task Completed Alert  |
|   - Migrations (/migrations)  |   |   - Non-blocking Thread   |
+-------------------------------+   +---------------------------+