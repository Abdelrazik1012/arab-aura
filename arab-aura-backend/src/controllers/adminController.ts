// src/controllers/adminController.ts
import { Response } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Brand } from "../models/Brand";
import { Hub } from "../models/Hub";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

/**
 * 📊 إحصائيات لوحة تحكم الأدمن الحية من MongoDB
 */
export const getAdminStats = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalUsers,
      sellersCount,
      driversCount,
      collectorsCount,
      customersCount,
      totalProducts,
      totalOrders,
      deliveredOrders,
      activeOrders,
      totalHubs,
      brands,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "driver" }),
      User.countDocuments({ role: "collector" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({
        status: { $in: ["pending", "processing", "ready_for_collection", "collected_in_hub", "out_for_delivery"] },
      }),
      Hub.countDocuments({ active: true }),
      Brand.find().select("status"),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const activeBrands = brands.filter((b) => b.status === "active" || b.status === "approved").length;
    const pendingBrands = brands.filter((b) => b.status === "pending").length;

    return sendSuccess(res, "إحصائيات المنصة الحية", {
      totalUsers,
      sellersCount,
      driversCount,
      collectorsCount,
      customersCount,
      totalProducts,
      totalOrders,
      deliveredOrders,
      activeOrders,
      totalHubs,
      activeBrands,
      pendingBrands,
      totalRevenue,
      platformCommission: Math.round(totalRevenue * 0.08),
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في جلب إحصائيات الأدمن", 500);
  }
};

/**
 * 👥 جلب جميع مستخدمي المنصة من قاعدة البيانات
 */
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, search } = req.query;
    const filter: any = {};

    if (role && role !== "all") {
      filter.role = role === "user" ? "customer" : role;
    }

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { username: regex }];
    }

    const users = await User.find(filter).select("-password -resetOtp -resetOtpExpires").sort({ createdAt: -1 });
    return sendSuccess(res, "قائمة مستخدمي المنصة", users);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في جلب المستخدمين", 500);
  }
};

/**
 * ➕ إنشاء مستخدم جديد من لوحة الأدمن
 */
export const createAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, role, password } = req.body;
    if (!name || !email) {
      return sendError(res, "الاسم والبريد الإلكتروني مطلوبان", 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return sendError(res, "هذا البريد الإلكتروني مسجل بالفعل", 409);
    }

    const mappedRole = role === "user" ? "customer" : role || "customer";
    const baseUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "");
    const existingUsername = await User.findOne({ username: baseUsername });
    const username = existingUsername
      ? `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`
      : baseUsername;

    const newUser = new User({
      name: String(name).trim(),
      username,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : "",
      role: mappedRole,
      status: "active",
      password: password && String(password).length >= 6 ? String(password) : "password123",
    });

    await newUser.save();
    const safeUser = await User.findById(newUser._id).select("-password -resetOtp -resetOtpExpires");

    return sendSuccess(res, "تم إنشاء المستخدم بنجاح في قاعدة البيانات", safeUser, 201);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إنشاء المستخدم", 500);
  }
};

/**
 * 🔄 تحديث دور أو حالة المستخدم (تفعيل / إيقاف / ترقية)
 */
export const updateAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status, name, phone } = req.body;

    const updates: any = {};
    if (role) updates.role = role === "user" ? "customer" : role;
    if (status) updates.status = status;
    if (name) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select(
      "-password -resetOtp -resetOtpExpires"
    );
    if (!updated) {
      return sendError(res, "المستخدم غير موجود", 404);
    }

    return sendSuccess(res, "تم تحديث بيانات المستخدم بنجاح", updated);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تحديث المستخدم", 500);
  }
};

/**
 * 🗑️ حذف مستخدم من قاعدة البيانات
 */
export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user && req.user.id === id) {
      return sendError(res, "لا يمكنك حذف حساب الأدمن الحالي أثناء تسجيل الدخول به", 400);
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, "المستخدم غير موجود", 404);
    }

    return sendSuccess(res, "تم حذف المستخدم من قاعدة البيانات بنجاح");
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء حذف المستخدم", 500);
  }
};

/**
 * 📦 جلب جميع طلبات المنصة من قاعدة البيانات
 */
export const getAllAdminOrders = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("hub", "name nameAr code address")
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .limit(200);

    return sendSuccess(res, "جميع طلبات المنصة", orders);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب الطلبات", 500);
  }
};

/**
 * ✏️ تعديل تفاصيل أو حالة طلب من لوحة الأدمن
 */
export const updateAdminOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, customerName, phone, customerPhone, address, totalAmount, driverName } = req.body;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const updates: any = {};
    if (status) updates.status = status;
    if (customerName) updates.customerName = customerName;
    if (phone || customerPhone) updates.customerPhone = phone || customerPhone;
    if (address) updates.address = address;
    if (totalAmount !== undefined) updates.totalAmount = Number(totalAmount);
    if (driverName) updates.driverName = driverName;
    if (status === "delivered") updates.paymentStatus = "paid";

    const updated = await Order.findOneAndUpdate(query, updates, { new: true });
    if (!updated) {
      return sendError(res, "الطلب غير موجود", 404);
    }

    return sendSuccess(res, "تم تحديث الطلب بنجاح في قاعدة البيانات", updated);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تحديث الطلب", 500);
  }
};

/**
 * 🗑️ حذف طلب من قاعدة البيانات
 */
export const deleteAdminOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const deleted = await Order.findOneAndDelete(query);
    if (!deleted) {
      return sendError(res, "الطلب غير موجود", 404);
    }

    return sendSuccess(res, "تم حذف الطلب نهائياً من قاعدة البيانات");
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء حذف الطلب", 500);
  }
};

/**
 * 🏪 جلب جميع البراندات وعقود المتاجر للاعتماد
 */
export const getAllBrands = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const brands = await Brand.find()
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });
    return sendSuccess(res, "قائمة المتاجر والبراندات المسجلة", brands);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب البراندات", 500);
  }
};

/**
 * ➕ إنشاء عقد براند جديد من الأدمن
 */
export const createAdminBrand = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { storeName, name, nameAr, contractType, brandType, notes, commissionRate } = req.body;
    const finalName = storeName || name || nameAr;
    if (!finalName) {
      return sendError(res, "اسم المتجر أو البراند مطلوب", 400);
    }

    const seller = (await User.findOne({ role: "seller" })) || (await User.findById(req.user?.id));
    if (!seller) {
      return sendError(res, "لا يوجد حساب بائع لربط العقد به", 400);
    }

    const brand = new Brand({
      name: String(finalName).trim(),
      nameAr: String(nameAr || finalName).trim(),
      brandType: contractType || brandType || "شراكة تجارية ولوجستية",
      status: "pending",
      notes: notes || `نسبة العمولة: ${commissionRate || "10%"}`,
      seller: seller._id,
    });

    await brand.save();
    const populated = await Brand.findById(brand._id).populate("seller", "name email phone");

    return sendSuccess(res, "تم تسجيل عقد المتجر بنجاح", populated, 201);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إضافة العقد", 500);
  }
};

/**
 * ✅ اعتماد أو إنهاء عقد براند
 */
export const updateBrandStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "active", "terminated"].includes(status)) {
      return sendError(res, "حالة العقد غير صالحة", 400);
    }

    const updated = await Brand.findByIdAndUpdate(id, { status }, { new: true }).populate(
      "seller",
      "name email phone"
    );
    if (!updated) {
      return sendError(res, "العقد أو المتجر غير موجود", 404);
    }

    return sendSuccess(res, "تم تحديث حالة اعتماد المتجر بنجاح", updated);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تحديث حالة المتجر", 500);
  }
};
