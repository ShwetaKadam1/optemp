import Leave from "../models/Leave.js";
import User from "../models/User.js";

/**
 * Employee: apply leave
 * Requires uid
 */
export const applyLeave = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admin cannot apply leaves" });
    }

    const me = await User.findOne({ uid: req.user.uid });
    if (!me) return res.status(404).json({ message: "User not found" });

    const leave = await Leave.create({ ...req.body, user: me._id });
    res.status(201).json(leave);
  } catch (err) {
    console.error("Error applying leave:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Employee: view own leaves
 * Requires uid
 */
export const myLeaves = async (req, res) => {
  try {
    const me = await User.findOne({ uid: req.user.uid });
    if (!me) return res.status(404).json({ message: "User not found" });

    const leaves = await Leave.find({ user: me._id }).sort("-createdAt");
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching my leaves:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: approve or reject leave
 * HR requires uid, Admin does not
 */
export const approveLeave = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let approverId = null;
    if (req.user.role === "hr") {
      const hrUser = await User.findOne({ uid: req.user.uid });
      if (!hrUser) return res.status(404).json({ message: "HR not found" });
      approverId = hrUser._id;
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, approver: approverId },
      { new: true }
    );

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.json(leave);
  } catch (err) {
    console.error("Error approving leave:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: list all leaves
 * Admin does not require uid, HR uses their uid
 */
export const listAll = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const leaves = await Leave.find().populate("user approver").sort("-createdAt");
    res.json(leaves);
  } catch (err) {
    console.error("Error listing all leaves:", err);
    res.status(500).json({ message: err.message });
  }
};
