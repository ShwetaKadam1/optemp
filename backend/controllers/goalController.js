// controllers/goalController.js
import Goal from "../models/Goal.js";
import User from "../models/User.js";

export const listGoals = async (req, res) => {
  const user = await User.findOne({ employeeId: req.params.employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });
  const goals = await Goal.find({ employee: user._id }).sort({ createdAt: -1 });
  res.json(goals);
};

export const createGoal = async (req, res) => {
  const { employeeId, title, deadline } = req.body;
  const user = await User.findOne({ employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });
  const g = await Goal.create({ employee: user._id, title, deadline, status: "in-progress", progress: 0 });
  res.status(201).json(g);
};

export const updateGoal = async (req, res) => {
  const { status, progress } = req.body;
  const g = await Goal.findByIdAndUpdate(req.params.id, { status, progress }, { new: true });
  if (!g) return res.status(404).json({ message: "Goal not found" });
  res.json(g);
};
