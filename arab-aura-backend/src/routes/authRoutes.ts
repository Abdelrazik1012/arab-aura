// src/routes/authRoutes.ts
import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateDeviceToken,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/device-token", authenticate, updateDeviceToken);

export default router;
