// routes/employeeRoutes.js
import { Router } from "express";
import { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from "../controllers/employeeController.js";
import { protect, isHR } from "../middleware/auth.js";

const router = Router();
router.get("/", protect, isHR, listEmployees);
router.get("/:id", protect, getEmployee);
router.post("/", protect, isHR, createEmployee);
router.patch("/:id", protect, isHR, updateEmployee);
router.delete("/:id", protect, isHR, deleteEmployee);
export default router;
