// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "customer" | "seller" | "collector" | "driver" | "admin";

export interface IUser extends Document {
  name: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  nationalId?: string;
  birthDate?: string;
  walletBalance: number;
  googleId?: string;
  // 📱 دعم تطبيقات الموبايل
  deviceToken?: string;
  deviceType?: "ios" | "android" | "web";
  // 📍 تتبع الكابتن المباشر في الموبايل
  currentLat?: number;
  currentLng?: number;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["customer", "seller", "collector", "driver", "admin"],
      default: "customer",
    },
    avatar: { type: String },
    nationalId: { type: String, trim: true },
    birthDate: { type: String, trim: true },
    walletBalance: { type: Number, default: 0 },
    googleId: { type: String, sparse: true },
    deviceToken: { type: String },
    deviceType: {
      type: String,
      enum: ["ios", "android", "web"],
      default: "web",
    },
    currentLat: { type: Number },
    currentLng: { type: Number },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ⚡ فهرس مركب لتسريع تعيين وفرز السائقين النشطين
UserSchema.index({ role: 1, isOnline: 1 });

// تشفير كلمة المرور قبل الحفظ
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
export default User;
