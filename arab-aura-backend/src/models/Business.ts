// src/models/Business.ts - مطابق لكيان BUSINESS في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBusiness extends Document {
  businessId?: number;
  user: Types.ObjectId;
  businessName: string;
  businessType: string; // e.g. "Fashion Brand", "Manufacturer"
  businessModel: string; // e.g. "B2C", "B2B", "Hybrid"
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  verificationStatus: "verified" | "pending" | "rejected";
  rating: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    businessId: { type: Number, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, default: "Fashion Brand" },
    businessModel: { type: String, default: "B2C" },
    description: { type: String },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    logo: { type: String },
    verificationStatus: {
      type: String,
      enum: ["verified", "pending", "rejected"],
      default: "verified",
    },
    rating: { type: Number, default: 4.9, min: 1, max: 5 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
export default Business;
