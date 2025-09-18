import Goal from "../models/Goal.js";
import User from "../models/User.js";

/**
 * Employee: create a goal
 * HR/Admin cannot create goals for themselves
 */
export const createGoal = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admin cannot create goals" });
    }

    const me = await User.findOne({ uid: req.user.uid });
    if (!me) return res.status(404).json({ message: "User not found" });

    const goal = await Goal.create({ ...req.body, user: me._id });
    res.status(201).json(goal);
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Employee: fetch own goals
 */
export const myGoals = async (req, res) => {
  try {
    const me = await User.findOne({ uid: req.user.uid });
    if (!me) return res.status(404).json({ message: "User not found" });

    const goals = await Goal.find({ user: me._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Employee: update own goal
 */
export const updateGoal = async (req, res) => {
  try {
    const me = await User.findOne({ uid: req.user.uid });
    if (!me) return res.status(404).json({ message: "User not found" });

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: me._id },
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found or not owned by user" });
    }

    res.json(goal);
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Employee: delete own goal
 */
export const deleteGoal = async (req, res) => {
  try {
    const me = await User.findOne({ uid: req.user.uid });
    if (!me) return res.status(404).json({ message: "User not found" });

    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: me._id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found or not owned by user" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ message: err.message });
  }
};
