// models/Goal.js
import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    deadline: { type: String }, // keep string to match UI like "2025-09-30" :contentReference[oaicite:3]{index=3}
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
