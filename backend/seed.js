const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const hrPassword = await bcrypt.hash("Admin@123", 10);
  const employeePassword = await bcrypt.hash("Employee@123", 10);

  await User.findOneAndUpdate(
    { email: "hr@example.com" },
    {
      name: "HR Admin",
      email: "hr@example.com",
      password: hrPassword,
      role: "hr",
      monthlySalary: 60000
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: "employee@example.com" },
    {
      name: "Demo Employee",
      email: "employee@example.com",
      password: employeePassword,
      role: "employee",
      monthlySalary: 35000
    },
    { upsert: true, new: true }
  );

  console.log("Demo users created");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.log(error);
  process.exit(1);
});
