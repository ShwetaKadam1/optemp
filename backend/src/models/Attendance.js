import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "half-day", "work-from-home"],
      default: "present",
    },
    hours: { type: Number, default: 8 },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
