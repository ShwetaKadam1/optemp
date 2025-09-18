import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, required: true }, // e.g., "2025-08"
    base: { type: Number, required: true },   // ✅ store base instead of gross
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net: Number,  // ✅ store computed net
    stripePaymentIntentId: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);
