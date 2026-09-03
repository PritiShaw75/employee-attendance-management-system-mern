# Database

This project uses MongoDB.

Database name:

`attendance_db`

Collections are created automatically by Mongoose:

- `users`
- `attendances`
- `leaves`

## Local MongoDB

Use:

```text
mongodb://127.0.0.1:27017/attendance_db
```

## MongoDB Atlas

Create a MongoDB Atlas cluster and put its connection string in:

```text
backend/.env
```

No SQL script is required because MongoDB is a NoSQL database and Mongoose creates the collections from the schemas.
