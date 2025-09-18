import mongoose from "mongoose";
import User from "../models/User.js";

// helper: decide if param is ObjectId or employeeId
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Get logged-in user's profile (employee, HR only)
 * Admins are blocked here (they have a separate /api/admin/me)
 */
export const me = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot access employee profile. Use /api/admin/me",
      });
    }

    const user = await User.findOne({ uid: req.user.uid }).select(
      "employeeId name department position email joinedOn contact role salary"
    );

    if (!user) return res.status(404).json({ message: "Profile not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create or update logged-in user's profile (employee/HR only)
 */
export const upsertMe = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin cannot create/update a profile" });
    }

    const update = {
      ...req.body,
      uid: req.user.uid,
      email: req.user.email || req.body.email,
    };

    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      update,
      { new: true, upsert: true, runValidators: true }
    ).select("employeeId name department position email joinedOn contact role salary");

    res.json(user);
  } catch (err) {
    console.error("Error upserting profile:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * List all users
 * Admin: full access
 * HR: view only
 */
export const listUsers = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const users = await User.find()
      .sort("-createdAt")
      .select("employeeId name department position email joinedOn contact role salary")
      .lean();

    res.json(users);
  } catch (err) {
    console.error("listUsers error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get single user by ID (Admin: all, HR: view only)
 */
export const getUser = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const filter = isObjectId(req.params.id)
      ? { _id: req.params.id }
      : { employeeId: req.params.id };

    const user = await User.findOne(filter).select(
      "employeeId name department position email joinedOn contact role salary"
    );

    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch (err) {
    console.error("getUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create new user (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update user by ID or employeeId (Admin only)
 */
export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    let user;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      user = await User.findOneAndUpdate({ employeeId: id }, req.body, {
        new: true,
        runValidators: true,
      });
    }

    if (!user) return res.status(404).json({ message: "Not found" });

    res.json(user);
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete user by ID or employeeId (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    let user;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findByIdAndDelete(id);
    } else {
      user = await User.findOneAndDelete({ employeeId: id });
    }

    if (!user) return res.status(404).json({ message: "Not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: err.message });
  }
};
