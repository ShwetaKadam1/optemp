import { Router } from "express";
import {
  myPayroll,
  runPayrollForUser,
  listPayrolls,
  paySalary,
  addSalary
} from "../controllers/payrollController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Employee: view own payroll
router.get("/me", myPayroll);

// Admin: set salary
router.post("/add", requireRole(["admin"]), addSalary);
// Only admin can set salary
router.post("/run/:id", requireRole(["admin"]), runPayrollForUser);

// HR: run payroll
router.post("/run/:id", requireRole(["hr"]), runPayrollForUser);

// HR/Admin: list all payrolls
router.get("/", requireRole(["hr", "admin"]), listPayrolls);

// HR: mark payroll as paid
router.patch("/:id/pay", requireRole(["hr"]), paySalary);

export default router;
