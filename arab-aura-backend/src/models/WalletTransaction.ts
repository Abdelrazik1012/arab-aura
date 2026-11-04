// src/models/WalletTransaction.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IWalletTransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: "deposit" | "payment" | "refund" | "withdrawal";
  amount: number;
  titleAr: string;
  titleEn: string;
  status: "completed" | "pending" | "failed";
  paymentMethod: "instapay" | "card" | "vodafone_cash" | "hub";
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["deposit", "payment", "refund", "withdrawal"],
      required: true,
    },
    amount: { type: Number, required: true },
    titleAr: { type: String, required: true },
    titleEn: { type: String, required: true },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    paymentMethod: {
      type: String,
      enum: ["instapay", "card", "vodafone_cash", "hub"],
      default: "instapay",
    },
    reference: { type: String },
  },
  { timestamps: true }
);

export const WalletTransaction = mongoose.model<IWalletTransaction>(
  "WalletTransaction",
  WalletTransactionSchema
);
export default WalletTransaction;
