// src/controllers/productController.ts
import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Brand } from "../models/Brand";
import { Category } from "../models/Category";
import { Review } from "../models/Review";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, brand, search, minPrice, maxPrice, page = 1, limit = 20 } =
      req.query;

    const filter: any = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), "i");
      filter.$or = [
        { titleAr: searchRegex },
        { titleEn: searchRegex },
        { descriptionAr: searchRegex },
        { brandName: searchRegex },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("brand", "name nameAr logoText bgImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      "تم جلب المنتجات بنجاح",
      products,
      200,
      { page: pageNum, limit: limitNum, total }
    );
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب المنتجات", 500);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("brand");

    if (!product) {
      return sendError(res, "المنتج غير موجود", 404);
    }

    return sendSuccess(res, "تفاصيل المنتج", product);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب المنتج", 500);
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    // التحقق من وجود براند مسجل للتاجر
    let brand = await Brand.findOne({ seller: req.user.id });
    if (!brand) {
      brand = new Brand({
        name: req.body.brandName || req.user.name,
        nameAr: req.body.brandName || req.user.name,
        seller: req.user.id,
      });
      await brand.save();
    }

    const {
      titleAr,
      titleEn,
      category,
      price,
      oldPrice,
      sizes,
      colors,
      image,
      additionalImages,
      badgeAr,
      badgeEn,
      descriptionAr,
      descriptionEn,
      stock,
      deliveryTime,
      material,
    } = req.body;

    const product = new Product({
      brand: brand._id,
      brandName: brand.name,
      titleAr,
      titleEn: titleEn || titleAr,
      category,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      sizes: sizes || ["S", "M", "L", "XL", "XXL"],
      colors: colors || [{ nameAr: "أسود", nameEn: "Black", hex: "#000000" }],
      image,
      additionalImages: additionalImages || [],
      badgeAr,
      badgeEn,
      descriptionAr,
      descriptionEn: descriptionEn || descriptionAr,
      stock: stock ? Number(stock) : 50,
      deliveryTime: deliveryTime || "خلال 24 ساعة",
      city: "6 أكتوبر",
      material: material || "قطن مصري 100%",
    });

    await product.save();

    return sendSuccess(res, "تمت إضافة المنتج بنجاح إلى المنصة", product, 201);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إضافة المنتج", 500);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return sendError(res, "المنتج غير موجود", 404);
    }

    return sendSuccess(res, "تم تحديث بيانات المنتج بنجاح", updated);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تحديث المنتج", 500);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return sendError(res, "المنتج غير موجود", 404);
    }

    return sendSuccess(res, "تم حذف المنتج بنجاح");
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء حذف المنتج", 500);
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ status: "active" }).sort({
      categoryId: 1,
    });
    return sendSuccess(res, "تم جلب التصنيفات بنجاح", categories);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب التصنيفات", 500);
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ product: id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    return sendSuccess(res, "تم جلب تقييمات المنتج", reviews);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب التقييمات", 500);
  }
};

export const createProductReview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return sendError(res, "التقييم والتعليق مطلوبان", 400);
    }

    const review = await Review.create({
      product: id,
      user: req.user.id,
      rating: Number(rating),
      comment: String(comment).trim(),
    });

    return sendSuccess(res, "تمت إضافة التقييم بنجاح", review, 201);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إضافة التقييم", 500);
  }
};
