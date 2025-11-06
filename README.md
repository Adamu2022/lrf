# Lecture Reminder System - Frontend

This is the frontend for the Lecture Reminder System built with Next.js.

## Features

- User authentication (Login)
- Role-based dashboard (Super Admin, Lecturer, Student)
- Schedule management
- Course management (Super Admin only)
- Enrollment management (Super Admin only)
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Folder Structure

```
app/
  ├── components/          # Reusable components
  ├── login/               # Login page
  ├── dashboard/           # Dashboard page
  ├── schedules/           # Schedules management
  ├── courses/             # Courses management
  ├── enrollments/         # Enrollments management
  ├── unauthorized/        # Unauthorized access page
  ├── layout.js            # Root layout
  └── page.js              # Home page
```

## Pages

### Login Page
- Path: `/login`
- Allows users to log in with their credentials
- Redirects to dashboard upon successful login

### Dashboard
- Path: `/dashboard`
- Shows a welcome message and navigation options based on user role

### Schedules
- Path: `/schedules`
- Shows lecture schedules
- Lecturers can create and delete schedules
- Students can view schedules

### Courses
- Path: `/courses`
- Super Admin only
- Manage courses (create, delete)

### Enrollments
- Path: `/enrollments`
- Super Admin only
- Manage student enrollments (create, delete)

## Role-Based Access

- **Super Admin**: Full access to all features
- **Lecturer**: Can view and manage schedules
- **Student**: Can view schedules

## Environment Variables

The frontend communicates with the backend API at `http://localhost:3001`. Make sure the backend is running on this port.

## License

This project is licensed under the MIT License.