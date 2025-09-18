import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    budget: { type: Number, default: 0 } // new field
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
