import Department from "../models/Department.js";

/**
 * HR/Admin: create a new department
 */
export const createDepartment = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) 
      return res.status(403).json({ message: "Forbidden" });

    const dep = await Department.create(req.body);
    res.status(201).json(dep);
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * List all departments
 * Accessible by anyone (employee, HR, admin)
 */
export const listDepartments = async (req, res) => {
  try {
    const deps = await Department.find().sort("name");
    res.json(deps);
  } catch (err) {
    console.error("Error listing departments:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: update a department
 */
export const updateDepartment = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) 
      return res.status(403).json({ message: "Forbidden" });

    const dep = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dep) return res.status(404).json({ message: "Department not found" });

    res.json(dep);
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ message: err.message });
  }
};
