// src/models/Vehicle.ts - مطابق لكيان VEHICLE في كتاب التخرج (Figure 4.2)
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVehicle {
  vehicleId?: number;
  driver?: Types.ObjectId;
  vehicleType: string; // e.g. "Van", "Motorcycle", "Car"
  plateNumber: string;
  brand: string; // e.g. "Daewoo", "Chevrolet"
  model: string; // e.g. "Damas / Carry"
  modelYear: number;
  color: string;
  capacity: number; // in kilograms or volume
  license: string;
  status: "active" | "maintenance" | "inactive";
  currentLocation?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vehicleId: { type: Number, index: true },
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    vehicleType: { type: String, default: "Van" },
    plateNumber: { type: String, required: true },
    brand: { type: String, default: "Daewoo" },
    model: { type: String, default: "Carry" },
    modelYear: { type: Number, default: 2022 },
    color: { type: String, default: "أبيض" },
    capacity: { type: Number, default: 600 },
    license: { type: String, default: "نقل خفيف سارية" },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },
    currentLocation: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
export default Vehicle;
