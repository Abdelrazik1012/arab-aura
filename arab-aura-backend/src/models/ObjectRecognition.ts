// src/models/ObjectRecognition.ts - مطابق لكيان ObjectRecognition في مخطط الفئات (Figure 4.3)
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IObjectRecognition extends Document {
  recognitionId?: number;
  product?: Types.ObjectId;
  user?: Types.ObjectId;
  objectName: string;
  confidence: number;
  imageUrl?: string;
  detectedLabels?: string[];
  attributes?: Record<string, any>;
  createdAt: Date;
}

const ObjectRecognitionSchema = new Schema<IObjectRecognition>(
  {
    recognitionId: { type: Number, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    objectName: { type: String, required: true },
    confidence: { type: Number, required: true },
    imageUrl: { type: String },
    detectedLabels: { type: [String], default: [] },
    attributes: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ObjectRecognition = mongoose.model<IObjectRecognition>(
  "ObjectRecognition",
  ObjectRecognitionSchema
);
export default ObjectRecognition;
