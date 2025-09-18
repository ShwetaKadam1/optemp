import { Router } from "express";
import { createDepartment, listDepartments, updateDepartment } from "../controllers/departmentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", listDepartments);
router.post("/", requireRole(["hr"]), createDepartment);
router.put("/:id", requireRole(["admin"]), updateDepartment);
export default router;
