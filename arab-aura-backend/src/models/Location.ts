// src/models/Location.ts - مطابق لكيان LOCATION في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILocation extends Document {
  locationId?: number;
  user: Types.ObjectId;
  address: string;
  city: string;
  governorate: string;
  latitude?: number;
  longitude?: number;
  locationType: "home" | "work" | "hub" | "warehouse" | "other";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    locationId: { type: Number, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    governorate: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    locationType: {
      type: String,
      enum: ["home", "work", "hub", "warehouse", "other"],
      default: "home",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Location = mongoose.model<ILocation>("Location", LocationSchema);
export default Location;
