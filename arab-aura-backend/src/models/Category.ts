// src/models/Category.ts - مطابق للمخطط المرجعي في كتاب المشروع (Figure 4.2)
import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  categoryId?: number;
  name: string;
  nameAr?: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    categoryId: { type: Number, index: true },
    name: { type: String, required: true, trim: true, unique: true },
    nameAr: { type: String, trim: true },
    description: { type: String },
    image: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
