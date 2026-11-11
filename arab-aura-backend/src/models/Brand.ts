// src/models/Brand.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBrand extends Document {
  brandId?: number;
  name: string;
  nameAr: string;
  brandType?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  country?: string;
  website?: string;
  status?: string;
  notes?: string;
  bgImage?: string;
  logoText?: string;
  seller: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    brandId: { type: Number, index: true },
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    brandType: { type: String, default: "Fashion" },
    descriptionAr: { type: String },
    descriptionEn: { type: String },
    country: { type: String, default: "Egypt" },
    website: { type: String },
    status: { type: String, default: "active" },
    notes: { type: String },
    bgImage: { type: String },
    logoText: { type: String },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<IBrand>("Brand", BrandSchema);
export default Brand;
