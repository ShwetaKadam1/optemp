import Performance from "../models/Performance.js";
import User from "../models/User.js";

// Add or update performance record
export const addOrUpdatePerformance = async (req, res) => {
  const { employeeId, month, productivity, goalsCompleted, goalsAssigned } = req.body;

  const user = await User.findOne({ employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });

  const record = await Performance.findOneAndUpdate(
    { employee: user._id, month },
    { productivity, goalsCompleted, goalsAssigned },
    { new: true, upsert: true }
  );

  res.status(201).json({ success: true, record });
};

// Get performance records for an employee
export const getPerformance = async (req, res) => {
  const user = await User.findOne({ employeeId: req.params.employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });

  const records = await Performance.find({ employee: user._id }).sort({ month: 1 });
  res.json(records);
};
