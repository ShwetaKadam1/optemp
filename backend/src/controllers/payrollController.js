import Stripe from "stripe";
import User from "../models/User.js";
import Payroll from "../models/Payroll.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);

const computeAmounts = ({ base = 0, bonus = 0, deductions = 0 }) => {
  const gross = base + bonus;   // ✅ gross computed internally
  const net = gross - deductions;
  return { gross, net };
};


/**
 * HR/Admin: run payroll for a user
 * HR uses this to actually pay the employee
 */
export const runPayrollForUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { period, base = 0, bonus = 0, deductions = 0 } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existing = await Payroll.findOne({ user: user._id, period });
    if (existing) {
      return res
        .status(400)
        .json({ message: `Salary for ${user.name} for ${period} already exists.` });
    }

    const { net } = computeAmounts({ base, bonus, deductions });

    const payroll = await Payroll.create({
      user: user._id,
      period,
      base,
      bonus,
      deductions,
      net,
      status: "pending",
    });

    res.status(201).json({ payroll });
  } catch (err) {
    console.error("Error setting payroll:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * Admin: add/set salary for a user
 */
export const addSalary = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { userId, base = 0, bonus = 0, deductions = 0, period } = req.body;
    if (!userId || !period) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { net } = computeAmounts({ base, bonus, deductions });

    const payroll = await Payroll.create({
      user: userId,
      period,
      base,
      bonus,
      deductions,
      net,
      status: "pending",
    });

    res.status(201).json(payroll);
  } catch (err) {
    console.error("Add salary error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * HR/Admin: list all payrolls
 */
// controllers/payrollController.js
export const listPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("user", "name email employeeId department");
    res.json(payrolls);
  } catch (err) {
    console.error("Error listing payrolls:", err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/payroll/:id/pay
export const paySalary = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate("user");
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    payroll.status = "paid";
    payroll.updatedAt = new Date();
    await payroll.save();

    res.status(200).json({ message: "Salary paid", payroll });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Employee: view own payrolls
 */
export const myPayroll = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const payrolls = await Payroll.find({ user: user._id })
    .populate("user", "name employeeId department email")
    .sort({ createdAt: -1 });
    res.json(payrolls);
  } catch (err) {
    console.error("Error fetching my payrolls:", err);
    res.status(500).json({ message: err.message });
  }
};
