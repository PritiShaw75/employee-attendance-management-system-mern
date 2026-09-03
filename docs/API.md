# API Documentation

Base URL:

`http://localhost:5000/api`

## Auth

### Register
`POST /auth/register`

Example:

```json
{
  "name": "Kunal",
  "email": "kunal@example.com",
  "password": "123456"
}
```

### Login
`POST /auth/login`

## Attendance

`POST /attendance/check-in`

`POST /attendance/check-out`

`GET /attendance/my`

## Leaves

`POST /leaves`

`GET /leaves/my`

## HR

`GET /hr/dashboard`

`GET /hr/employees`

`GET /hr/attendance`

`GET /hr/leave-deductions`

`PATCH /hr/leaves/:id`

Protected APIs require:

```text
Authorization: Bearer JWT_TOKEN
```
