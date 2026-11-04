// src/routes/aiRoutes.ts
import { Router } from "express";
import {
  getProductAiInsights,
  queryMarketAssistant,
  generateSellerPost,
} from "../controllers/aiController";
import { aiRateLimiter } from "../middleware/security";

const router = Router();

router.post("/product-insights", aiRateLimiter, getProductAiInsights);
router.post("/market-assistant", aiRateLimiter, queryMarketAssistant);
router.post("/generate-post", aiRateLimiter, generateSellerPost);

export default router;
