import { Router } from "express";
import { setSalary } from "../controllers/salaryController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole(["hr"]));
router.put("/:id", setSalary);
export default router;
