// src/models/Zone.ts - مطابق لكيان ZONE في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema } from "mongoose";

export interface IZone extends Document {
  zoneId?: number;
  zoneName: string;
  city: string;
  governorate: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  status: "active" | "inactive";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema = new Schema<IZone>(
  {
    zoneId: { type: Number, index: true },
    zoneName: { type: String, required: true },
    city: { type: String, required: true },
    governorate: { type: String, required: true },
    deliveryFee: { type: Number, default: 35.0 }, // Flat 35 EGP delivery fee
    estimatedDeliveryTime: { type: String, default: "خلال 24 ساعة" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Zone = mongoose.model<IZone>("Zone", ZoneSchema);
export default Zone;
