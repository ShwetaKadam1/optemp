// controllers/departmentController.js
import Department from "../models/Department.js";
import User from "../models/User.js";

export const listDepartments = async (_req, res) => {
  const depts = await Department.find({}).sort({ name: 1 });
  // Add counts dynamically to match dashboard distribution :contentReference[oaicite:6]{index=6}
  const withCounts = await Promise.all(
    depts.map(async (d) => {
      const count = await User.countDocuments({ department: d.name, role: "employee" });
      return { _id: d._id, name: d.name, budget: d.budget, count };
    })
  );
  res.json(withCounts);
};

export const createDepartment = async (req, res) => {
  const d = await Department.create(req.body);
  res.status(201).json(d);
};
