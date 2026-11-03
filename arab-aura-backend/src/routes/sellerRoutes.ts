// src/routes/sellerRoutes.ts
import { Router } from "express";
import {
  getDashboardMetrics,
  getSellerProducts,
} from "../controllers/sellerController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/metrics", authenticate, getDashboardMetrics);
router.get("/products", authenticate, getSellerProducts);

export default router;
