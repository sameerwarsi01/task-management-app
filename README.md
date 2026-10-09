# TaskFlow - Full-Stack Task Management Application

A full-stack collaborative task management platform built with Next.js, Flask, and Supabase. The application features real-time OAuth authentication, structured task workflows, database constraint integrity, and asynchronous email notifications.

---

## Features

- **Google OAuth Authentication**: Secure login handled via Supabase Auth with automatic session persistence and token refreshes.
- **Task Management (CRUD)**: Create, view, delete, and cyclic status toggling (`todo` → `in_progress` → `done`).
- **Dynamic Task Assignment**: Assign tasks to registered workspace members.
- **Asynchronous Email Alerts**: Background non-blocking email notifications sent directly to assignees via Gmail SMTP.
- **Robust Database Validation**: Strict PostgreSQL check constraints on task status values.
- **Responsive Interface**: Tailwind CSS UI with status-driven styling (subtle line-through for completed tasks).

---

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React, Axios
- **Backend**: Python, Flask, Flask-CORS, Gunicorn
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth)
- **Email Service**: Python `smtplib` with daemon thread execution

---

## Project Structure

```text
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   └── lib/
│   │       ├── api.ts              # Axios interceptor for JWT auto-refresh
│   │       └── supabaseClient.ts  # Browser client initialization
│   └── package.json
│
├── backend/
│   ├── app.py                      # Flask REST API routes & business logic
│   ├── email_service.py            # Asynchronous SMTP mailing utility
│   ├── requirements.txt            # Python dependencies
│   └── .env.example
└── README.md