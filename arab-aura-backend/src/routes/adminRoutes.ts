// src/routes/adminRoutes.ts
import { Router } from "express";
import {
  getAdminStats,
  getAllUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAllAdminOrders,
  updateAdminOrder,
  deleteAdminOrder,
  getAllBrands,
  createAdminBrand,
  updateBrandStatus,
} from "../controllers/adminController";
import { authenticate, authorizeRoles } from "../middleware/auth";

const router = Router();

// حماية جميع مسارات الأدمن بالتوكن وصلاحية الأدمن
router.use(authenticate, authorizeRoles("admin"));

router.get("/stats", getAdminStats);

router.get("/users", getAllUsers);
router.post("/users", createAdminUser);
router.patch("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);

router.get("/orders", getAllAdminOrders);
router.put("/orders/:id", updateAdminOrder);
router.delete("/orders/:id", deleteAdminOrder);

router.get("/brands", getAllBrands);
router.post("/brands", createAdminBrand);
router.patch("/brands/:id/status", updateBrandStatus);

export default router;
