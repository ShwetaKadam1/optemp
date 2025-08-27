// routes/leaveRoutes.js
import { Router } from "express";
import { submitLeave, listLeaves, updateLeaveStatus } from "../controllers/leaveController.js";
import { protect, isHR } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, submitLeave);                           // used by employee dashboard :contentReference[oaicite:10]{index=10}
router.get("/:employeeId", protect, listLeaves);
router.patch("/:id/status", protect, isHR, updateLeaveStatus);
export default router;
