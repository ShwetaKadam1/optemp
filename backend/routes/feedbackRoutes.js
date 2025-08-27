// routes/feedbackRoutes.js
import { Router } from "express";
import { sendFeedback, listFeedback } from "../controllers/feedbackController.js";
import { protect, isHR } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, isHR, sendFeedback);                    // HR sends feedback :contentReference[oaicite:12]{index=12}
router.get("/:employeeId", protect, listFeedback);
export default router;
