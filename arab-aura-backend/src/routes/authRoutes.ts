// src/routes/authRoutes.ts
import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
  updateDeviceToken,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/security";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/google", authRateLimiter, googleAuth);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.put("/device-token", authenticate, updateDeviceToken);

export default router;
