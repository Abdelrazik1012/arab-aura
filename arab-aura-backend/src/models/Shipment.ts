// src/models/Shipment.ts - مطابق لكيان SHIPMENT في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IShipment extends Document {
  shipmentId?: number;
  order: Types.ObjectId;
  shippingCompany?: Types.ObjectId;
  driver?: Types.ObjectId;
  vehicle?: Types.ObjectId;
  trackingNumber: string;
  shippingStatus:
    | "pending"
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "returned";
  shippingFee: number;
  pickupLocation: string;
  deliveryLocation: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    shipmentId: { type: Number, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    shippingCompany: { type: Schema.Types.ObjectId, ref: "ShippingCompany" },
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    trackingNumber: { type: String, required: true, unique: true },
    shippingStatus: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "returned",
      ],
      default: "pending",
    },
    shippingFee: { type: Number, default: 35.0 },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Shipment = mongoose.model<IShipment>("Shipment", ShipmentSchema);
export default Shipment;
