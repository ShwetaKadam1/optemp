// routes/goalRoutes.js
import { Router } from "express";
import { listGoals, createGoal, updateGoal } from "../controllers/goalController.js";
import { protect, isHR } from "../middleware/auth.js";

const router = Router();
router.get("/:employeeId", protect, listGoals);                   // employee dashboard goals :contentReference[oaicite:14]{index=14}
router.post("/", protect, isHR, createGoal);
router.patch("/:id", protect, updateGoal);
export default router;
