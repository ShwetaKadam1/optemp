import { Router } from "express";
import { createGoal, myGoals, updateGoal, deleteGoal } from "../controllers/goalController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// Employee routes
router.get("/me", myGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
