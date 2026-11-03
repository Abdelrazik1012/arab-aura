// src/models/Product.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IColorOption {
  nameAr: string;
  nameEn: string;
  hex: string;
}

export interface IProduct extends Document {
  brand: Types.ObjectId;
  brandName: string;
  titleAr: string;
  titleEn: string;
  category: string;
  price: number;
  oldPrice?: number;
  sizes: string[];
  colors: IColorOption[];
  rating: number;
  image: string;
  additionalImages: string[];
  badgeAr?: string;
  badgeEn?: string;
  descriptionAr: string;
  descriptionEn: string;
  stock: number;
  deliveryTime: string;
  city: string;
  material: string;
  createdAt: Date;
  updatedAt: Date;
}

const ColorOptionSchema = new Schema<IColorOption>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    brandName: { type: String, required: true },
    titleAr: { type: String, required: true, trim: true },
    titleEn: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number },
    sizes: { type: [String], default: ["S", "M", "L", "XL", "XXL"] },
    colors: { type: [ColorOptionSchema], default: [] },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    image: { type: String, required: true },
    additionalImages: { type: [String], default: [] },
    badgeAr: { type: String },
    badgeEn: { type: String },
    descriptionAr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    stock: { type: Number, default: 50, min: 0 },
    deliveryTime: { type: String, default: "خلال 24 ساعة" },
    city: { type: String, default: "6 أكتوبر" },
    material: { type: String, default: "قطن مصري 100%" },
  },
  { timestamps: true }
);

ProductSchema.index({ titleAr: "text", titleEn: "text", descriptionAr: "text" });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
