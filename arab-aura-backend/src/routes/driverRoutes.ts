// src/routes/driverRoutes.ts
import { Router } from "express";
import {
  getAssignedDeliveries,
  updateLocation,
} from "../controllers/driverController";
import { optionalAuth, authenticate } from "../middleware/auth";

const router = Router();

router.get("/deliveries", optionalAuth, getAssignedDeliveries);
router.put("/location", authenticate, updateLocation);

export default router;
