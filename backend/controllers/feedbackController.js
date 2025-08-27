// controllers/feedbackController.js
import Feedback from "../models/Feedback.js";
import User from "../models/User.js";

export const sendFeedback = async (req, res) => {
  const { employeeId, feedback, fromUserId } = req.body; // aligns with HR dashboard call :contentReference[oaicite:7]{index=7}
  const employee = await User.findOne({ employeeId });
  const fromUser = await User.findOne({ employeeId: fromUserId }) || req.user;
  if (!employee || !fromUser) return res.status(404).json({ message: "User not found" });

  const doc = await Feedback.create({ employee: employee._id, fromUser: fromUser._id, message: feedback });
  res.status(201).json(doc);
};

export const listFeedback = async (req, res) => {
  const employee = await User.findOne({ employeeId: req.params.employeeId });
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  const items = await Feedback.find({ employee: employee._id })
    .sort({ createdAt: -1 })
    .populate("fromUser", "name role employeeId");
  res.json(items);
};
