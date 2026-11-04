// src/controllers/authController.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import { Brand } from "../models/Brand";
import { generateToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      username,
      email,
      password,
      phone,
      role,
      nationalId,
      birthDate,
      brandName,
      deviceToken,
      deviceType,
    } = req.body;

    if (!name || !email || !password) {
      return sendError(
        res,
        "يرجى إدخال جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور)",
        400
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return sendError(res, "هذا البريد الإلكتروني مسجل بالفعل", 409);
    }

    // استخراج أو تنظيف اسم المستخدم
    let finalUsername = username ? username.trim().toLowerCase() : cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "");
    if (!finalUsername) {
      finalUsername = `user_${Date.now().toString().slice(-6)}`;
    }

    // التحقق من تكرار اسم المستخدم
    const existingUsername = await User.findOne({ username: finalUsername });
    if (existingUsername) {
      if (username) {
        return sendError(res, "اسم المستخدم هذا مأخوذ بالفعل، يرجى اختيار اسم مستخدم آخر", 409);
      }
      finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const assignedRole = role || "customer";

    const user = new User({
      name,
      username: finalUsername,
      email: cleanEmail,
      password,
      phone,
      nationalId,
      birthDate,
      walletBalance: 0, // كل حساب جديد يبدأ برصيد 0.00 EGP
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

    const profileCompleted = Boolean(user.phone && user.nationalId);

    return sendSuccess(
      res,
      "تم إنشاء الحساب بنجاح",
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          nationalId: user.nationalId,
          birthDate: user.birthDate,
          walletBalance: user.walletBalance,
          profileCompleted,
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
    const { email, username, identifier, password, deviceToken, deviceType } = req.body;

    const loginId = (identifier || username || email || "").trim().toLowerCase();

    if (!loginId || !password) {
      return sendError(
        res,
        "يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور",
        400
      );
    }

    // البحث إما بالبريد الإلكتروني أو اسم المستخدم
    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });

    if (!user) {
      return sendError(res, "بيانات الدخول غير صحيحة", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "بيانات الدخول غير صحيحة", 401);
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

    const profileCompleted = Boolean(user.phone && user.nationalId);

    return sendSuccess(res, "تم تسجيل الدخول بنجاح", {
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        nationalId: user.nationalId,
        birthDate: user.birthDate,
        walletBalance: user.walletBalance || 0,
        profileCompleted,
      },
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تسجيل الدخول", 500);
  }
};

// 🌐 تسجيل الدخول عبر Google (Continue with Google)
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { email, name, avatar, googleId, role } = req.body;

    if (!email) {
      return sendError(res, "البريد الإلكتروني مطلوب للمتابعة باستخدام Google", 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // إنشاء حساب جديد من Google
      const autoUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "");
      const finalUsername = `${autoUsername}_${Math.floor(100 + Math.random() * 900)}`;

      user = new User({
        name: name || autoUsername,
        username: finalUsername,
        email: cleanEmail,
        password: `google_auth_${Date.now()}_${Math.random()}`,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || autoUsername)}&background=2B7A78&color=fff`,
        googleId: googleId || `g_${Date.now()}`,
        role: role || "customer",
        walletBalance: 0,
      });

      await user.save();
    } else {
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const profileCompleted = Boolean(user.phone && user.nationalId);

    return sendSuccess(res, "تم تسجيل الدخول بحساب Google بنجاح", {
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        nationalId: user.nationalId,
        birthDate: user.birthDate,
        walletBalance: user.walletBalance || 0,
        profileCompleted,
      },
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تسجيل الدخول بـ Google", 500);
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

    const profileCompleted = Boolean(user.phone && user.nationalId);

    return sendSuccess(res, "بيانات المستخدم الحالي", {
      ...user.toObject(),
      profileCompleted,
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في جلب بيانات الحساب", 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    const { name, phone, nationalId, birthDate, username, avatar, socialLinks } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (nationalId) updates.nationalId = nationalId;
    if (birthDate) updates.birthDate = birthDate;
    if (avatar) updates.avatar = avatar;
    if (socialLinks) updates.socialLinks = socialLinks;

    if (username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await User.findOne({ username: cleanUsername, _id: { $ne: req.user.id } });
      if (existing) {
        return sendError(res, "اسم المستخدم مستخدم بالفعل من قبل شخص آخر", 409);
      }
      updates.username = cleanUsername;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    const profileCompleted = Boolean(updatedUser?.phone && updatedUser?.nationalId);

    const userObj = updatedUser?.toObject ? updatedUser.toObject() : updatedUser;

    return sendSuccess(res, "تم استكمال وتحديث الملف الشخصي بنجاح", {
      ...userObj,
      profileCompleted,
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في تحديث الملف الشخصي", 500);
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
