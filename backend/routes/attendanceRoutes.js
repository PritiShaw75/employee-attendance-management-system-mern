const express = require("express");
const Attendance = require("../models/Attendance");
const { auth } = require("../middleware/auth");

const router = express.Router();

function today() {
  return new Date().toISOString().slice(0, 10);
}

router.post("/check-in", auth, async (req, res) => {
  try {
    const date = today();

    let attendance = await Attendance.findOne({
      employee: req.user.id,
      date
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    if (!attendance) {
      attendance = new Attendance({
        employee: req.user.id,
        date,
        checkIn: new Date(),
        status: "Present"
      });
    } else {
      attendance.checkIn = new Date();
      attendance.status = "Present";
    }

    await attendance.save();

    res.json({ message: "Check-in successful", attendance });
  } catch (error) {
    res.status(500).json({ message: "Check-in failed" });
  }
});

router.post("/check-out", auth, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today()
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "Please check in first" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    attendance.checkOut = new Date();

    const milliseconds =
      attendance.checkOut.getTime() - attendance.checkIn.getTime();

    attendance.workingHours = Number(
      (milliseconds / (1000 * 60 * 60)).toFixed(2)
    );

    attendance.status = "Completed";

    await attendance.save();

    res.json({ message: "Check-out successful", attendance });
  } catch (error) {
    res.status(500).json({ message: "Check-out failed" });
  }
});

router.get("/my", auth, async (req, res) => {
  const records = await Attendance.find({ employee: req.user.id })
    .sort({ date: -1 })
    .limit(100);

  res.json(records);
});

module.exports = router;
