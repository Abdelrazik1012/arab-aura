// src/routes/sellerRoutes.ts
import { Router } from "express";
import {
  getDashboardMetrics,
  getSellerProducts,
  scrapeSocialCatalog,
} from "../controllers/sellerController";
import { authenticate, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/metrics", authenticate, getDashboardMetrics);
router.get("/products", authenticate, getSellerProducts);
router.post("/scrape-social", authenticate, authorizeRoles("seller", "admin"), scrapeSocialCatalog);

export default router;
