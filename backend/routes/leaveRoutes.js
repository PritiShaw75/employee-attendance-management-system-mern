const express = require("express");
const Leave = require("../models/Leave");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!startDate || !endDate || end < start) {
      return res.status(400).json({ message: "Please enter valid dates" });
    }

    const days =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    const leave = await Leave.create({
      employee: req.user.id,
      startDate,
      endDate,
      days,
      reason
    });

    res.status(201).json({
      message: "Leave request submitted",
      leave
    });
  } catch (error) {
    res.status(500).json({ message: "Leave request failed" });
  }
});

router.get("/my", auth, async (req, res) => {
  const leaves = await Leave.find({ employee: req.user.id }).sort({
    createdAt: -1
  });

  res.json(leaves);
});

module.exports = router;
