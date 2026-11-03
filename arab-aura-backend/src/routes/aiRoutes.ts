// src/routes/aiRoutes.ts
import { Router } from "express";
import {
  getProductAiInsights,
  generateSellerPost,
} from "../controllers/aiController";

const router = Router();

router.post("/product-insights", getProductAiInsights);
router.post("/generate-post", generateSellerPost);

export default router;
