import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

/**
 * Employee: mark attendance for today
 */
export const markAttendance = async (req, res) => {
  try {
    if (!["employee", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only employees or HR can mark attendance" });
    }

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existing = await Attendance.findOne({
      user: user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existing) return res.status(400).json({ error: "Attendance already marked today" });

    const status = req.body.status || "present";

    // Set hours based on status
    let hours;
    switch (status) {
      case "present":
        hours = 8;
        break;
      case "absent":
        hours = 0;
        break;
      case "half-day":
        hours = 5;
        break;
      case "work-from-home":
        hours = 7;
        break;
      default:
        hours = 8; // default to 8 if unknown
    }

    const attendance = await Attendance.create({
      user: user._id,
      date: new Date(),
      status,
      hours
    });
    
    res.status(201).json(attendance);
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Employee: get own attendance
 */
export const myAttendance = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const data = await Attendance.find({ user: user._id }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: list all attendance
 */
export const listAttendance = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });

    const data = await Attendance.find().populate("user").sort({ date: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error listing attendance:", err);
    res.status(500).json({ message: err.message });
  }
};
