// src/models/Hub.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IHub extends Document {
  name: string;
  nameAr: string;
  code: string;
  governorate: string;
  city: string;
  address: string;
  collector?: Types.ObjectId;
  latitude?: number;
  longitude?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HubSchema = new Schema<IHub>(
  {
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    governorate: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    collector: { type: Schema.Types.ObjectId, ref: "User" },
    latitude: { type: Number },
    longitude: { type: Number },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Hub = mongoose.model<IHub>("Hub", HubSchema);
export default Hub;
