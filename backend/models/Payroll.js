// models/Payroll.js
import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "inr" },
    month: String, // e.g., "July 2025" (to match UI) :contentReference[oaicite:2]{index=2}
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    stripePaymentIntentId: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);
