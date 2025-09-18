import Feedback from "../models/Feedback.js";
import User from "../models/User.js";

/**
 * Employee: view own feedback
 */
export const myFeedback = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const feedbacks = await Feedback.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: send feedback to an employee
 */
export const sendFeedback = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });

    const { userId, message } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Employee not found" });

    const feedback = await Feedback.create({
      user: user._id,
      sender: req.user.name || req.user.role.toUpperCase(),
      senderRole: req.user.role,
      senderId: req.user.role === "admin" ? "admin" : req.user.id,
      message,
    });

    res.status(201).json(feedback);
  } catch (err) {
    console.error("Error sending feedback:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: list only THEIR feedbacks
 */
export const listFeedbacks = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });

    let filter;

    if (req.user.role === "admin") {
      filter = { senderId: "admin", senderRole: "admin" };
    } else {
      filter = { senderId: req.user.id, senderRole: "hr" };
    }

    const feedbacks = await Feedback.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    console.error("Error listing feedbacks:", err);
    res.status(500).json({ message: err.message });
  }
};
