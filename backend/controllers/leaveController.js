// controllers/leaveController.js
import Leave from "../models/Leave.js";
import User from "../models/User.js";

export const submitLeave = async (req, res) => {
  const { employeeId, type, reason, startDate, endDate } = req.body; // matches mock submitLeaveRequest :contentReference[oaicite:5]{index=5}
  const user = await User.findOne({ employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });

  const leave = await Leave.create({
    employee: user._id,
    type,
    reason,
    startDate,
    endDate,
  });

  res.status(201).json({ success: true, leave });
};

export const listLeaves = async (req, res) => {
  const user = await User.findOne({ employeeId: req.params.employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });
  const leaves = await Leave.find({ employee: user._id }).sort({ createdAt: -1 });
  res.json(leaves);
};

export const updateLeaveStatus = async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: "Leave not found" });
  leave.status = req.body.status;
  await leave.save();
  res.json(leave);
};
