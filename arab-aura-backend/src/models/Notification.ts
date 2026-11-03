// src/models/Notification.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: "order" | "delivery" | "promotion" | "system";
  read: boolean;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "delivery", "promotion", "system"],
      default: "order",
    },
    read: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
export default Notification;
