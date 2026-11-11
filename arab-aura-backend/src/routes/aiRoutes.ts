// src/routes/aiRoutes.ts
import { Router } from "express";
import {
  getProductAiInsights,
  queryMarketAssistant,
  generateSellerPost,
  recognizeProductObject,
  virtualTryOn,
} from "../controllers/aiController";
import { aiRateLimiter } from "../middleware/security";

const router = Router();

router.post("/product-insights", aiRateLimiter, getProductAiInsights);
router.post("/market-assistant", aiRateLimiter, queryMarketAssistant);
router.post("/generate-post", aiRateLimiter, generateSellerPost);
router.post("/recognize-object", aiRateLimiter, recognizeProductObject);
router.post("/virtual-tryon", aiRateLimiter, virtualTryOn);

export default router;
