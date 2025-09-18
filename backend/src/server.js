import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import goalRoutes from "./routes/goalRoutes.js"; 
import attendanceRoutes from "./routes/attendanceRoutes.js"; 
import feedbackRoutes from "./routes/feedbackRoutes.js"; 

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => res.send("HRMS API is running"));

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/performances", performanceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/feedbacks", feedbackRoutes);

// Stripe webhook placeholder (optional): add raw body parser if used.

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
});
