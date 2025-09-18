// routes/adminRoutes.js
import { Router } from "express";
import { loginAdmin, meAdmin } from "../controllers/adminController.js";

const router = Router();

router.post("/login", loginAdmin); // admin login
router.get("/me", meAdmin);        // admin profile

export default router;
