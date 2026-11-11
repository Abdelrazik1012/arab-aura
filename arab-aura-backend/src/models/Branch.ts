// src/models/Branch.ts - مطابق لكيان BRANCH في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBranch extends Document {
  branchId?: number;
  business: Types.ObjectId;
  branchName: string;
  address: string;
  phone?: string;
  openingHours?: string;
  status: "active" | "inactive";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    branchId: { type: Number, index: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    branchName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    openingHours: { type: String, default: "10:00 AM - 11:00 PM" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Branch = mongoose.model<IBranch>("Branch", BranchSchema);
export default Branch;
