import { Router } from "express";
import { applyLeave, myLeaves, approveLeave, listAll } from "../controllers/leaveController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.post("/", applyLeave);
router.get("/me", myLeaves);
router.put("/:id/approval", requireRole(["hr"]), approveLeave);
router.get("/", requireRole(["hr"]), listAll);
export default router;
