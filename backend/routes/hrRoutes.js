const express = require("express");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const { auth, hrOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", auth, hrOnly, async (req, res) => {
  const employees = await User.countDocuments({ role: "employee", active: true });

  const today = new Date().toISOString().slice(0, 10);
  const presentToday = await Attendance.countDocuments({
    date: today,
    status: { $in: ["Present", "Completed"] }
  });

  const attendance = await Attendance.find({});
  const monthlyHours = attendance.reduce(
    (total, item) => total + (item.workingHours || 0),
    0
  );

  const approvedLeaves = await Leave.find({ status: "Approved" });
  const leaveDays = approvedLeaves.reduce(
    (total, item) => total + item.days,
    0
  );

  res.json({
    employees,
    presentToday,
    monthlyHours: Number(monthlyHours.toFixed(2)),
    approvedLeaveDays: leaveDays
  });
});

router.get("/employees", auth, hrOnly, async (req, res) => {
  const employees = await User.find(
    { role: "employee" },
    "-password"
  ).sort({ name: 1 });

  res.json(employees);
});

router.get("/attendance", auth, hrOnly, async (req, res) => {
  const records = await Attendance.find({})
    .populate("employee", "name email")
    .sort({ date: -1 });

  res.json(records);
});

router.get("/leave-deductions", auth, hrOnly, async (req, res) => {
  const employees = await User.find({ role: "employee" });
  const leaves = await Leave.find({ status: "Approved" });

  const result = employees.map((employee) => {
    const employeeLeaves = leaves
      .filter((leave) => String(leave.employee) === String(employee._id))
      .reduce((sum, leave) => sum + leave.days, 0);

    const deduction = Number(
      ((employee.monthlySalary / 26) * employeeLeaves).toFixed(2)
    );

    return {
      name: employee.name,
      email: employee.email,
      monthlySalary: employee.monthlySalary,
      leaveDays: employeeLeaves,
      deduction
    };
  });

  res.json(result);
});

router.patch("/leaves/:id", auth, hrOnly, async (req, res) => {
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid leave status" });
  }

  const leave = await Leave.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(leave);
});

module.exports = router;
