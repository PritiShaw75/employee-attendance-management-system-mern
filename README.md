# Employee Attendance Management System (MERN)

A simple Employee Attendance Management System made using the MERN.

## Tech Stack
- MongoDB
- Express.js
- React.js
- Node.js
- JWT
- CSS

## Main Features
- Employee registration and login
- HR login
- Employee check-in and check-out
- Working hours calculation
- Leave request
- Leave deduction calculation
- Employee dashboard
- HR dashboard
- Attendance status
- Employee list

## Project Structure

```text
employee-attendance-management-system-mern/
├── backend/
├── frontend/
├── database/
├── docs/
└── README.md
```

## Requirements
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection

## Run Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendance_db
JWT_SECRET=mysecretkey
```

Then:

```bash
npm run dev
```

Backend: `http://localhost:5000`

## Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: normally `http://localhost:5173`

## Demo Accounts

### HR
```text
Email: hr@example.com
Password: Admin@123
```

### Employee
```text
Email: employee@example.com
Password: Employee@123
```

Run the seed script first:

```bash
cd backend
node seed.js
```

## Attendance Logic

- An employee can check in once per day.
- Check-out calculates the working hours.
- Working hours are calculated from check-in time to check-out time.
- Standard working time is 8 hours.
- Leave deduction uses:

```text
monthly salary / 26 * approved leave days
```

## Assignment Coverage

The project covers the requirements given in the assignment:
- Employee Login & Registration
- Attendance Check-In / Check-Out
- Working Hours Calculation
- Leave Deduction Calculation
- HR Dashboard
- Employee Dashboard
- Attendance Status Tracking

