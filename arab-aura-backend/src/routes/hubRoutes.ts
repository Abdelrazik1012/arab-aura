// src/routes/hubRoutes.ts
import { Router } from "express";
import { getAllHubs, getHubPackages, getHubMetrics } from "../controllers/hubController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", getAllHubs);
router.get("/metrics", optionalAuth, getHubMetrics);
router.get("/:code/packages", getHubPackages);

export default router;
