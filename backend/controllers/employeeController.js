// controllers/employeeController.js
import User from "../models/User.js";

export const listEmployees = async (_req, res) => {
  const users = await User.find({ role: { $in: ["employee"] } }).select("-password");
  res.json(users);
};

export const getEmployee = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
};

export const createEmployee = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

export const updateEmployee = async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
};

export const deleteEmployee = async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  await employee.deleteOne();
  res.json({ message: "Employee removed successfully" });
};
