import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // employee
    sender: { type: String, required: true }, // HR/Admin name
    senderRole: { type: String, enum: ["hr", "admin"], required: true }, // role
    senderId: { type: String, required: true }, // HR’s MongoID OR "admin"
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true } // ✅ gives you createdAt + updatedAt
);

export default mongoose.model("Feedback", feedbackSchema);
