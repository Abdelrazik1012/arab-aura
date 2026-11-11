// src/routes/hubRoutes.ts
import { Router } from "express";
import {
  getAllHubs,
  getHubPackages,
  getHubMetrics,
  getCollectorOrders,
  consolidateOrdersIntoPackage,
  assignDriverToPackage,
} from "../controllers/hubController";
import { authenticate, optionalAuth, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/", getAllHubs);
router.get("/metrics", optionalAuth, getHubMetrics);
router.get(
  "/collector/orders",
  optionalAuth,
  getCollectorOrders
);
router.post(
  "/consolidate",
  authenticate,
  authorizeRoles("collector", "admin"),
  consolidateOrdersIntoPackage
);
router.post(
  "/assign-driver",
  authenticate,
  authorizeRoles("collector", "admin"),
  assignDriverToPackage
);
router.get("/:code/packages", getHubPackages);

export default router;
