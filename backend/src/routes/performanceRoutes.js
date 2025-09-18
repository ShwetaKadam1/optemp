import { Router } from "express";
import { createReview, myPerformance, listPerformance } from "../controllers/performanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.post("/", requireRole(["hr"]), createReview);
router.get("/me", myPerformance);
router.get("/", requireRole(["hr"]), listPerformance);
export default router;
