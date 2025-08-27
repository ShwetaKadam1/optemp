// routes/departmentRoutes.js
import { Router } from "express";
import { listDepartments, createDepartment } from "../controllers/departmentController.js";
import { protect, isHR } from "../middleware/auth.js";

const router = Router();
router.get("/", protect, listDepartments);                        // feeds HR charts & cards :contentReference[oaicite:11]{index=11}
router.post("/", protect, isHR, createDepartment);
export default router;
