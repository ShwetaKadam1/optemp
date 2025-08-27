// controllers/payrollController.js
import Stripe from "stripe";
import Payroll from "../models/Payroll.js";
import User from "../models/User.js";
import { generatePayslipPDFBuffer } from "../utils/payslip.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const createPaymentIntent = async (req, res) => {
  const { employeeId, amount, currency = "inr", month } = req.body; // aligns w/ HR "Pay Salary" flow :contentReference[oaicite:8]{index=8}
  const user = await User.findOne({ employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });

  const pi = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    payment_method_types: ["card"],
    metadata: { employeeId, month },
  });

  const payroll = await Payroll.create({
    employee: user._id,
    amount,
    currency,
    month,
    status: "pending",
    stripePaymentIntentId: pi.id,
  });

  res.json({ clientSecret: pi.client_secret, payrollId: payroll._id });
};

// Stripe Webhook (route registered in server.js before JSON middleware)
export const webhook = async (req, res) => {
  let event = req.body;
  const sig = req.headers["stripe-signature"];
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      const payroll = await Payroll.findOne({ stripePaymentIntentId: pi.id });
      if (payroll) {
        payroll.status = "paid";
        payroll.paidAt = new Date();
        await payroll.save();
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;
      const payroll = await Payroll.findOne({ stripePaymentIntentId: pi.id });
      if (payroll) {
        payroll.status = "failed";
        await payroll.save();
      }
    }
    res.json({ received: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listPayroll = async (req, res) => {
  const user = await User.findOne({ employeeId: req.params.employeeId });
  if (!user) return res.status(404).json({ message: "Employee not found" });
  const items = await Payroll.find({ employee: user._id }).sort({ createdAt: -1 });
  res.json(items);
};

export const getPayslipPDF = async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate("employee", "-password");
  if (!payroll) return res.status(404).json({ message: "Payroll not found" });

  const pdfBuffer = await generatePayslipPDFBuffer(payroll.employee, payroll);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="payslip-${payroll._id}.pdf"`);
  res.send(Buffer.from(pdfBuffer));
};
