# Simple MERN Architecture

## Frontend

React handles:
- Login and registration
- Employee dashboard
- Attendance page
- Leave page
- HR dashboard
- Employee list
- Leave deduction view

## Backend

Express handles:
- Authentication
- JWT token generation
- Attendance
- Leave requests
- HR APIs

## Database

MongoDB stores:

### User
Name, email, password, role, salary and active status.

### Attendance
Employee, date, check-in, check-out, working hours and status.

### Leave
Employee, dates, number of days, reason and status.

## Flow

```text
React
  |
  | HTTP / JSON
  v
Express + Node.js
  |
  | Mongoose
  v
MongoDB
```

The code is intentionally simple so a fresher can understand and explain the project.
