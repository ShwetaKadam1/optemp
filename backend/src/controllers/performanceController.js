// controllers/performanceController.js
import Performance from "../models/Performance.js";
import User from "../models/User.js";

/**
 * HR/Admin: create a performance review
 */
export const createReview = async (req, res) => {
  try {
    let reviewerId;

    if (req.user.role === "admin") {
      // Admin can create reviews without having a UID in DB
      reviewerId = null; // or you can assign a fixed admin ObjectId if you want
    } else {
      const reviewer = await User.findOne({ uid: req.user.uid });
      if (!reviewer) return res.status(404).json({ message: "Reviewer not found" });
      reviewerId = reviewer._id;
    }

    const review = await Performance.create({ ...req.body, reviewer: reviewerId });
    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Employee: view own performance
 */
export const myPerformance = async (req, res) => {
  try {
    const me = await User.findOne({ uid: req.user.uid });
    if (!me) return res.status(404).json({ message: "User not found" });

    const data = await Performance.find({ user: me._id }).sort({ period: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error fetching performance:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: list all performance reviews
 */
export const listPerformance = async (req, res) => {
  try {
    if (!["hr", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = await Performance.find().populate("user reviewer").sort({ period: -1 });
    res.json(data);
  } catch (err) {
    console.error("Error listing performance:", err.message);
    res.status(500).json({ message: err.message });
  }
};
