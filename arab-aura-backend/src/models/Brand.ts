// src/models/Brand.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBrand extends Document {
  name: string;
  nameAr: string;
  descriptionAr?: string;
  descriptionEn?: string;
  bgImage?: string;
  logoText?: string;
  seller: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    descriptionAr: { type: String },
    descriptionEn: { type: String },
    bgImage: { type: String },
    logoText: { type: String },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<IBrand>("Brand", BrandSchema);
export default Brand;
