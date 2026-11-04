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
import { cacheResponse, clearProductCache } from "../middleware/cache";

const router = Router();

router.get("/", cacheResponse(60), getProducts);
router.get("/:id", cacheResponse(120), getProductById);
router.post("/", authenticate, authorizeRoles("seller", "admin"), (req, res, next) => {
  clearProductCache();
  createProduct(req, res, next);
});
router.put("/:id", authenticate, authorizeRoles("seller", "admin"), (req, res, next) => {
  clearProductCache();
  updateProduct(req, res, next);
});
router.delete("/:id", authenticate, authorizeRoles("seller", "admin"), (req, res, next) => {
  clearProductCache();
  deleteProduct(req, res, next);
});

export default router;
