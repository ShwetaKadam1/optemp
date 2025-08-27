// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import payrollRoutes, { webhook as stripeWebhook } from "./routes/payrollRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

dotenv.config();
connectDB();

const app = express();

// Stripe webhook must use raw body BEFORE json middleware
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Regular middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/", (_req, res) => res.send("✅ HRMS API running"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payments", payrollRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/performance", performanceRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on :${PORT}`));
