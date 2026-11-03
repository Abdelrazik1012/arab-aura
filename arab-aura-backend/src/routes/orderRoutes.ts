// src/routes/orderRoutes.ts
import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  verifyOtp,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticate, optionalAuth } from "../middleware/auth";

const router = Router();

// إنشاء طلب جديد (يدعم كلاً من الضيوف والمستخدمين المسجلين)
router.post("/", optionalAuth, createOrder);
router.get("/my-orders", authenticate, getMyOrders);
router.get("/:id", getOrderById);
router.post("/:id/verify-otp", verifyOtp);
router.put("/:id/status", updateOrderStatus);

export default router;
