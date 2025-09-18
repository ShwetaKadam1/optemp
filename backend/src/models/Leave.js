import mongoose from "mongoose";
const leaveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["sick", "vacation", "personal", "emergency"], default: "casual" },
    from: Date,
    to: Date,
    reason: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);
export default mongoose.model("Leave", leaveSchema);
