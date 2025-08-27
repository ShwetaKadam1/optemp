// controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export const markAttendance = async (req, res) => {
  const { employeeId, status, date, hours } = req.body; // matches mock `markAttendance` usage :contentReference[oaicite:4]{index=4}
  const user = await User.findOne({ employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });

  const day = date ? new Date(date) : new Date();
  day.setHours(0, 0, 0, 0);

  const record = await Attendance.findOneAndUpdate(
    { employee: user._id, date: day },
    { status, hours: hours ?? 8 },
    { new: true, upsert: true }
  );

  res.status(201).json({ success: true, record });
};

export const getAttendance = async (req, res) => {
  const user = await User.findOne({ employeeId: req.params.employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });
  const records = await Attendance.find({ employee: user._id }).sort({ date: -1 });
  res.json(records);
};
