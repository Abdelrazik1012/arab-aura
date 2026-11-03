// src/routes/productRoutes.ts
import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { authenticate, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, authorizeRoles("seller", "admin"), createProduct);
router.put("/:id", authenticate, authorizeRoles("seller", "admin"), updateProduct);
router.delete("/:id", authenticate, authorizeRoles("seller", "admin"), deleteProduct);

export default router;
