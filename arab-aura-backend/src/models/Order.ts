// src/models/Order.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrderItem {
  product?: Types.ObjectId;
  productTitle: string;
  brandName: string;
  unitPrice: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl?: string;
}

export type OrderStatus =
  | "pending"
  | "ready_for_collection"
  | "collected_in_hub"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface IOrder extends Document {
  orderNumber: string;
  customer?: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  governorate: string;
  city: string;
  address: string;
  deliveryLat?: number;
  deliveryLng?: number;
  shippingType: "standard" | "express";
  shippingFee: number;
  itemsTotal: number;
  totalAmount: number;
  paymentMethod: "cod" | "instapay" | "wallet" | "card";
  paymentStatus: "unpaid" | "paid";
  status: OrderStatus;
  otpCode: string;
  packageId?: string;
  qrCode?: string;
  barcode?: string;
  hub?: Types.ObjectId;
  driver?: Types.ObjectId;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  driverPlate?: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.Mixed },
    productTitle: { type: String, required: true },
    brandName: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    size: { type: String, default: "L" },
    color: { type: String, default: "أزرق" },
    imageUrl: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    governorate: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    deliveryLat: { type: Number },
    deliveryLng: { type: Number },
    shippingType: { type: String, enum: ["standard", "express"], default: "standard" },
    shippingFee: { type: Number, default: 35.0 },
    itemsTotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "instapay", "wallet", "card"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "ready_for_collection",
        "collected_in_hub",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "collected_in_hub",
      index: true,
    },
    otpCode: { type: String, required: true },
    packageId: { type: String, index: true },
    qrCode: { type: String },
    barcode: { type: String },
    hub: { type: Schema.Types.ObjectId, ref: "Hub" },
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    driverName: { type: String },
    driverPhone: { type: String },
    driverVehicle: { type: String },
    driverPlate: { type: String },
    items: { type: [OrderItemSchema], required: true },
  },
  { timestamps: true }
);

// ⚡ فهارس مركبة لتسريع استعلامات الطلبات واللوجستيات
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ driver: 1, status: 1 });
OrderSchema.index({ hub: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
