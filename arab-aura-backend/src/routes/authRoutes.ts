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

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.put("/device-token", authenticate, updateDeviceToken);

export default router;
