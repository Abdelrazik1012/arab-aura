// src/routes/productRoutes.ts
import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductReviews,
  createProductReview,
} from "../controllers/productController";
import { authenticate, authorizeRoles } from "../middleware/auth";
import { cacheResponse, clearProductCache } from "../middleware/cache";

const router = Router();

router.get("/categories", cacheResponse(300), getCategories);
router.get("/", cacheResponse(60), getProducts);
router.get("/:id", cacheResponse(120), getProductById);
router.get("/:id/reviews", cacheResponse(60), getProductReviews);
router.post("/:id/reviews", authenticate, createProductReview);
router.post("/", authenticate, authorizeRoles("seller", "admin"), (req, res) => {
  clearProductCache();
  createProduct(req, res);
});
router.put("/:id", authenticate, authorizeRoles("seller", "admin"), (req, res) => {
  clearProductCache();
  updateProduct(req, res);
});
router.delete("/:id", authenticate, authorizeRoles("seller", "admin"), (req, res) => {
  clearProductCache();
  deleteProduct(req, res);
});

export default router;
