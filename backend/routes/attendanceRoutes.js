// routes/attendanceRoutes.js
import { Router } from "express";
import { markAttendance, getAttendance } from "../controllers/attendanceController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.post("/mark", protect, markAttendance);                    // used by employee dashboard :contentReference[oaicite:9]{index=9}
router.get("/:employeeId", protect, getAttendance);
export default router;
