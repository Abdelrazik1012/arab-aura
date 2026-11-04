// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import orderRoutes from "./orderRoutes";
import hubRoutes from "./hubRoutes";
import sellerRoutes from "./sellerRoutes";
import driverRoutes from "./driverRoutes";
import aiRoutes from "./aiRoutes";
import walletRoutes from "./walletRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/hubs", hubRoutes);
router.use("/seller", sellerRoutes);
router.use("/driver", driverRoutes);
router.use("/ai", aiRoutes);
router.use("/wallet", walletRoutes);

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    message: "🚀 Arab Aura Backend API is online and operational",
    timestamp: new Date().toISOString(),
    supportedClients: ["Web React SPA", "Mobile React Native / Flutter", "Postman"],
  });
});

export default router;
