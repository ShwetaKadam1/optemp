import mongoose from "mongoose";
const performanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, required: true }, // e.g., "2025-08"
    score: { type: Number, min: 0, max: 100 },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: String
  },
  { timestamps: true }
);
export default mongoose.model("Performance", performanceSchema);
