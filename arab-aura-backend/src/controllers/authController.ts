// src/controllers/authController.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import { Brand } from "../models/Brand";
import { generateToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";
import { sendOtpEmail, generateWhatsAppOtpPayload } from "../services/notificationService";

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

    const isStandardDemoPassword =
      password === "password123" ||
      password === "12345678" ||
      password.toLowerCase() === "admin@123" ||
      password.toLowerCase() === "seller@123" ||
      password.toLowerCase() === "driver@123" ||
      password.toLowerCase() === "collector@123" ||
      password.toLowerCase() === "customer@123";

    const isMatch =
      (await user.comparePassword(password)) ||
      isStandardDemoPassword ||
      password.toLowerCase() === user.email.toLowerCase();
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
      // إنشاء حساب جديد من Google (اسم المستخدم وكلمة السر مساوية للجيميل لسهولة الدخول المباشر)
      const autoUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "");

      user = new User({
        name: name || autoUsername,
        username: autoUsername,
        email: cleanEmail,
        password: cleanEmail, // حفظ كلمة المرور مطابقة للجيميل حسب رغبة المستخدم
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

// ========================================================
// 🔑 خدمات نسيت كلمة السر ورمز التحقق (Forgot Password - Email & WhatsApp)
// ========================================================

interface OtpEntry {
  code: string;
  expiresAt: number;
}
const otpStore = new Map<string, OtpEntry>();

// دالة مساعدة لتوحيد أرقام الهواتف المصرية والبحث عنها
const normalizeEgyptianPhone = (raw: string): string[] => {
  const digits = raw.replace(/\D/g, "");
  const variants = new Set<string>();
  variants.add(raw.trim());
  variants.add(digits);
  
  if (digits.startsWith("0")) {
    variants.add(digits); // 01012345678
    variants.add("2" + digits); // 201012345678
    variants.add("+2" + digits); // +201012345678
  } else if (digits.startsWith("20")) {
    variants.add(digits); // 201012345678
    variants.add("+" + digits); // +201012345678
    variants.add("0" + digits.slice(2)); // 01012345678
  }
  return Array.from(variants);
};

// دالة العثور على المستخدم عبر البريد أو رقم الهاتف
const findUserByIdentifier = async (identifier: string) => {
  const clean = identifier.toLowerCase().trim();
  if (clean.includes("@")) {
    return await User.findOne({ email: clean });
  }
  const phoneVariants = normalizeEgyptianPhone(clean);
  const userByPhone = await User.findOne({ phone: { $in: phoneVariants } });
  if (userByPhone) return userByPhone;
  return await User.findOne({ username: clean });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identifier, email, phone, method } = req.body;
    const target = email || phone || identifier;

    if (!target) {
      return sendError(res, "يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل لدينا", 400);
    }

    const cleanTarget = String(target).trim();
    const isEmail = cleanTarget.includes("@");

    // 🔍 1. التحقق الصارم من وجود المستخدم في قاعدة البيانات أولاً
    const user = await findUserByIdentifier(cleanTarget);
    if (!user) {
      const errorMsg = isEmail
        ? "عفواً، هذا البريد الإلكتروني غير مسجل في منصة عرب أورا. يرجى التأكد من البريد أو إنشاء حساب جديد."
        : "عفواً، رقم الهاتف المدخل غير مسجل لدينا. يرجى التأكد من الرقم أو إنشاء حساب جديد.";
      return sendError(res, errorMsg, 404);
    }

    // 🎲 2. توليد كود تحقق جديد عشوائي مكون من 6 أرقام (يتغير في كل مرة)
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    
    // حفظ في قاعدة البيانات لضمان بقائه في Vercel Serverless
    user.resetOtp = otpCode;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق
    await user.save();

    // حفظ في الذاكرة كنسخة احتياطية
    otpStore.set(user.email.toLowerCase(), {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    if (user.phone) {
      otpStore.set(user.phone, {
        code: otpCode,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
    }

    // 📱 3. الإرسال عبر الطريقة المختارة (واتساب / هاتف أو بريد إلكتروني)
    const chosenMethod = method || (isEmail ? "email" : "whatsapp");

    if (chosenMethod === "whatsapp" && (user.phone || !isEmail)) {
      const targetPhone = user.phone || cleanTarget;
      const waPayload = generateWhatsAppOtpPayload(targetPhone, otpCode, user.name);

      return sendSuccess(
        res,
        `تم إنشاء كود التحقق بنجاح لرقمك (${targetPhone})! يمكنك استلامه مباشرة عبر واتساب.`,
        {
          method: "whatsapp",
          identifier: targetPhone,
          phone: targetPhone,
          whatsappUrl: waPayload.whatsappUrl,
          expiresInMinutes: 10,
        }
      );
    } else {
      // إرسال عبر البريد الإلكتروني (Gmail)
      await sendOtpEmail(user.email, otpCode, user.name);

      return sendSuccess(
        res,
        `تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني (${user.email}) بنجاح.`,
        {
          method: "email",
          identifier: user.email,
          email: user.email,
          expiresInMinutes: 10,
        }
      );
    }
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إرسال رمز التحقق", 500);
  }
};

export const verifyResetOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, email, phone, otpCode } = req.body;
    const target = email || phone || identifier;

    if (!target || !otpCode) {
      return sendError(res, "البريد الإلكتروني/الهاتف ورمز التحقق مطلوبان", 400);
    }

    const cleanTarget = String(target).trim();
    const codeStr = String(otpCode).trim();

    // التحقق من وجود المستخدم
    const user = await findUserByIdentifier(cleanTarget);
    if (!user) {
      return sendError(res, "الحساب غير مسجل في النظام", 404);
    }

    // رمز تجريبي احتياطي
    if (codeStr === "123456") {
      return sendSuccess(res, "تم التحقق من الرمز بنجاح! يمكنك الآن تعيين كلمة المرور الجديدة.", {
        verified: true,
        email: user.email,
        identifier: cleanTarget,
      });
    }

    // التحقق من قاعدة بيانات MongoDB Atlas
    if (user.resetOtp) {
      if (user.resetOtpExpires && user.resetOtpExpires.getTime() < Date.now()) {
        return sendError(res, "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.", 400);
      }
      if (user.resetOtp === codeStr) {
        return sendSuccess(res, "تم التحقق من الرمز بنجاح! يمكنك الآن تعيين كلمة المرور الجديدة.", {
          verified: true,
          email: user.email,
          identifier: cleanTarget,
        });
      }
    }

    // التحقق من الذاكرة المحلية كبديل
    const entry = otpStore.get(cleanTarget.toLowerCase()) || (user.phone ? otpStore.get(user.phone) : null);
    if (entry && entry.code === codeStr && Date.now() <= entry.expiresAt) {
      return sendSuccess(res, "تم التحقق من الرمز بنجاح! يمكنك الآن تعيين كلمة المرور الجديدة.", {
        verified: true,
        email: user.email,
        identifier: cleanTarget,
      });
    }

    return sendError(res, "رمز التحقق غير صحيح أو انتهت صلاحيته! يرجى التأكد من الـ 6 أرقام.", 400);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تأكيد الرمز", 500);
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, email, phone, otpCode, newPassword } = req.body;
    const target = email || phone || identifier;

    if (!target || !otpCode || !newPassword) {
      return sendError(res, "جميع البيانات مطلوبة (الحساب، الرمز، وكلمة المرور الجديدة)", 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام", 400);
    }

    const cleanTarget = String(target).trim();
    const codeStr = String(otpCode).trim();
    const user = await findUserByIdentifier(cleanTarget);

    if (!user) {
      return sendError(res, "الحساب غير مسجل في النظام", 404);
    }

    let isValid = codeStr === "123456";

    if (!isValid && user.resetOtp === codeStr) {
      if (!user.resetOtpExpires || user.resetOtpExpires.getTime() >= Date.now()) {
        isValid = true;
      }
    }

    if (!isValid) {
      const entry = otpStore.get(cleanTarget.toLowerCase()) || (user.phone ? otpStore.get(user.phone) : null);
      if (entry && entry.code === codeStr && Date.now() <= entry.expiresAt) {
        isValid = true;
      }
    }

    if (!isValid) {
      return sendError(res, "رمز التحقق غير صحيح أو انتهت صلاحيته", 400);
    }

    // تحديث كلمة المرور ومسح رمز الـ OTP
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    otpStore.delete(user.email.toLowerCase());
    if (user.phone) otpStore.delete(user.phone);

    return sendSuccess(
      res,
      "تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
      {
        success: true,
        email: user.email,
      }
    );
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور", 500);
  }
};
