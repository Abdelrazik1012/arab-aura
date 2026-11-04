// src/routes/walletRoutes.ts
import { Router } from "express";
import { getMyWallet, deposit, withdraw } from "../controllers/walletController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/my-wallet", authenticate, getMyWallet);
router.post("/deposit", authenticate, deposit);
router.post("/withdraw", authenticate, withdraw);

export default router;
