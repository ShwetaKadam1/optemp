import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true }, // e.g., "2025-08"
    productivity: { type: Number, required: true },
    goalsCompleted: { type: Number, required: true },
    goalsAssigned: { type: Number, required: true },
  },
  { timestamps: true }
);

performanceSchema.index({ employee: 1, month: 1 }, { unique: true });

export default mongoose.model("Performance", performanceSchema);
