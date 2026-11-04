// src/routes/aiRoutes.ts
import { Router } from "express";
import {
  getProductAiInsights,
  queryMarketAssistant,
  generateSellerPost,
} from "../controllers/aiController";

const router = Router();

router.post("/product-insights", getProductAiInsights);
router.post("/market-assistant", queryMarketAssistant);
router.post("/generate-post", generateSellerPost);

export default router;
