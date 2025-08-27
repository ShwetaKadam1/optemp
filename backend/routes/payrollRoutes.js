// routes/payrollRoutes.js
import { Router } from "express";
import { createPaymentIntent, webhook, listPayroll, getPayslipPDF } from "../controllers/payrollController.js";
import { protect, isHR } from "../middleware/auth.js";

const router = Router();
router.post("/create-intent", protect, isHR, createPaymentIntent); // HR "Pay Salary" button flow :contentReference[oaicite:13]{index=13}
router.get("/:employeeId", protect, listPayroll);
router.get("/payslip/:id", protect, getPayslipPDF);

export { webhook };
export default router;
