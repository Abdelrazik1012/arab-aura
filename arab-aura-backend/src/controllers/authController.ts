// src/controllers/authController.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import { Brand } from "../models/Brand";
import { generateToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, brandName, deviceToken, deviceType } =
      req.body;

    if (!name || !email || !password) {
      return sendError(res, "يرجى إدخال جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور)", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, "هذا البريد الإلكتروني مسجل بالفعل", 409);
    }

    const assignedRole = role || "customer";

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: assignedRole,
      deviceToken,
      deviceType: deviceType || "web",
    });

    await user.save();

    // إذا كان الحساب لبراند / تاجر، نقوم بإنشاء سجل البراند له تلقائياً
    if (assignedRole === "seller" && brandName) {
      const brand = new Brand({
        name: brandName,
        nameAr: brandName,
        seller: user._id,
        descriptionAr: `براند مصري مسجل على منصة عرب أورا للملابس.`,
        descriptionEn: `Official Egyptian fashion brand on Arab Aura.`,
      });
      await brand.save();
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return sendSuccess(
      res,
      "تم إنشاء الحساب بنجاح",
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
      201
    );
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إنشاء الحساب", 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, deviceToken, deviceType } = req.body;

    if (!email || !password) {
      return sendError(res, "يرجى إدخال البريد الإلكتروني وكلمة المرور", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, "البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    // تحديث توكن الموبايل إن وجد
    if (deviceToken) {
      user.deviceToken = deviceToken;
      user.deviceType = deviceType || user.deviceType;
      await user.save();
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return sendSuccess(res, "تم تسجيل الدخول بنجاح", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تسجيل الدخول", 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, "غير مصرح", 401);
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return sendError(res, "المستخدم غير موجود", 404);
    }

    return sendSuccess(res, "بيانات المستخدم الحالي", user);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في جلب بيانات الحساب", 500);
  }
};

export const updateDeviceToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { deviceToken, deviceType } = req.body;
    if (!req.user) return sendError(res, "غير مصرح", 401);

    await User.findByIdAndUpdate(req.user.id, {
      deviceToken,
      deviceType: deviceType || "android",
    });

    return sendSuccess(res, "تم تحديث توكن إشعارات الموبايل بنجاح");
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تحديث توكن الإشعارات", 500);
  }
};
