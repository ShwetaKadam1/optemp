import { Router } from "express";
import { markAttendance, myAttendance, listAttendance } from "../controllers/attendanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Apply auth middleware globally to all attendance routes
router.use(requireAuth);

// Employee marks attendance
router.post("/", markAttendance);

// Employee views own attendance
router.get("/me", myAttendance);

// Admin: view all attendance (only accessible to 'hr' or 'admin' roles)
router.get("/", requireRole(["hr"]), listAttendance);

export default router;
