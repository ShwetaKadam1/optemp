import { Router } from "express";
import {
  me,
  upsertMe,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Employee/HR profile routes
router.get("/me", me);
router.put("/me", upsertMe);

// Admin routes
router.post("/", requireRole(["admin"]), createUser);
router.put("/:id", requireRole(["admin"]), updateUser);
router.delete("/:id", requireRole(["admin"]), deleteUser);

// HR/Admin routes (view only)
router.get("/all", requireRole(["hr", "admin"]), listUsers);
router.get("/:id", requireRole(["hr", "admin"]), getUser);

export default router;
