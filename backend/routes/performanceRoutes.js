import { Router } from "express";
import { addOrUpdatePerformance, getPerformance } from "../controllers/performanceController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Add or update performance (used by HR/admin)
router.post("/add", protect, addOrUpdatePerformance);

// Get performance of a specific employee
router.get("/:employeeId", protect, getPerformance);

export default router;
