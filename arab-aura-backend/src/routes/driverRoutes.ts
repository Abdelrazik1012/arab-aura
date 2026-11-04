// src/routes/driverRoutes.ts
import { Router } from "express";
import {
  getAssignedDeliveries,
  getDriverMetrics,
  updateLocation,
} from "../controllers/driverController";
import { optionalAuth, authenticate } from "../middleware/auth";

const router = Router();

router.get("/deliveries", optionalAuth, getAssignedDeliveries);
router.get("/metrics", optionalAuth, getDriverMetrics);
router.put("/location", authenticate, updateLocation);

export default router;
