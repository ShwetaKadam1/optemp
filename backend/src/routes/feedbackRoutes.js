import { Router } from "express";
import { myFeedback, sendFeedback, listFeedbacks } from "../controllers/feedbackController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Employee: read own feedback
router.get("/me", myFeedback);

// HR/Admin: send feedback to employee
router.post("/", requireRole(["hr", "admin"]), sendFeedback);

// HR/Admin: list only THEIR feedbacks
router.get("/", requireRole(["hr", "admin"]), listFeedbacks);

export default router;
