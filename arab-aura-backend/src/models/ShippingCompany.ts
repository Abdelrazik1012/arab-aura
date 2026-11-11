// src/models/ShippingCompany.ts - مطابق لكيان SHIPPING_COMPANY في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema } from "mongoose";

export interface IShippingCompany extends Document {
  shippingCompanyId?: number;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  rating: number;
  status: "active" | "inactive";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingCompanySchema = new Schema<IShippingCompany>(
  {
    shippingCompanyId: { type: Number, index: true },
    companyName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String },
    rating: { type: Number, default: 4.8 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ShippingCompany = mongoose.model<IShippingCompany>(
  "ShippingCompany",
  ShippingCompanySchema
);
export default ShippingCompany;
