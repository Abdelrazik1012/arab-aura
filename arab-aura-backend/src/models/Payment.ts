// src/models/Payment.ts - مطابق لكيان PAYMENT في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  paymentId?: number;
  order: Types.ObjectId;
  paymentMethod: "cod" | "instapay" | "wallet" | "card";
  transactionId?: string;
  amount: number;
  paymentDate: Date;
  status: "pending" | "completed" | "failed" | "refunded";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: Number, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "instapay", "wallet", "card"],
      default: "cod",
    },
    transactionId: { type: String },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
