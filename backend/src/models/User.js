import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    uid: { type: String, index: true, unique: true }, // Firebase UID
    name: String,
    email: { type: String, index: true },
    contact: String,
    employeeId: { type: String, index: true },
    department: { type: String, index: true },
    role: { type: String,  lowercase: true, enum: ["hr", "employee"], default: "employee" },
    position: { type: String,  lowercase: true, enum: ["senior", "junior", "intern"],required: true },
    salary: {
      base: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 }
    },
    joinedOn: { type: Date, default: Date.now }
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
