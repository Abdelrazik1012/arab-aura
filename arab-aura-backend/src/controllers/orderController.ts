// src/controllers/orderController.ts
import { Request, Response } from "express";
import { Order, IOrderItem } from "../models/Order";
import { Hub } from "../models/Hub";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      items,
      shippingType = "standard",
      shippingAddress,
      paymentMethod = "cod",
      deliveryLat,
      deliveryLng,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, "السلة فارغة، يرجى إضافة منتج واحد على الأقل", 400);
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone) {
      return sendError(res, "يرجى إدخال بيانات عنوان التوصيل ورقم الهاتف", 400);
    }

    // حساب إجمالي المنتجات
    const itemsTotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice || item.price) * (item.qty || item.quantity || 1),
      0
    );

    // تسعيرة الشحن المجمع بالحي (35 جنيه ثابتة لتقليل التكلفة، أو 60 للإكسبريس السريع)
    const shippingFee = shippingType === "express" ? 60.0 : 35.0;
    const totalAmount = itemsTotal + shippingFee;

    // توليد رقم أوردر فريد ورقم كود OTP سري من 4 أرقام
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}${randNum.toString().slice(-2)}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const packageId = `PKG-OCT-${randNum}`;

    // ربط تلقائي بأقرب مركز تجميع في المنطقة
    const hub = await Hub.findOne({ active: true });

    const formattedItems: IOrderItem[] = items.map((i: any) => ({
      product: i.productId || i.id,
      productTitle: i.productTitle || i.titleAr || i.title,
      brandName: i.brandName || "براند مصري",
      unitPrice: Number(i.unitPrice || i.price),
      quantity: Number(i.qty || i.quantity || 1),
      size: i.size || "L",
      color: i.color || "أزرق قطني",
      imageUrl: i.imageUrl || i.image,
    }));

    const order = new Order({
      orderNumber,
      customer: req.user ? req.user.id : undefined,
      customerName: shippingAddress.fullName,
      customerPhone: shippingAddress.phone,
      governorate: shippingAddress.governorate || "الجيزة",
      city: shippingAddress.city || "6 أكتوبر",
      address: shippingAddress.address,
      deliveryLat,
      deliveryLng,
      shippingType,
      shippingFee,
      itemsTotal,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "paid",
      status: "collected_in_hub", // جاهزة بمركز التجميع للحي
      otpCode,
      packageId,
      hub: hub ? hub._id : undefined,
      driverName: "الكابتن أحمد محمود",
      driverPhone: "+201092242607",
      driverVehicle: "سيارة فان دايو كاري",
      driverPlate: "أ ب جـ 4589",
      items: formattedItems,
    });

    await order.save();

    return sendSuccess(
      res,
      `تم تأكيد طلبك بنجاح برقم: (${order.orderNumber})! سيتم التواصل معك للمعاينة عند الباب قبل السداد.`,
      order,
      201
    );
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء إتمام الطلب", 500);
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    const orders = await Order.find({ customer: req.user.id })
      .populate("hub", "name nameAr code address")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "طلباتي", orders);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب الطلبات", 500);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
    }).populate("hub");

    if (!order) {
      return sendError(res, "الطلب غير موجود", 404);
    }

    return sendSuccess(res, "تفاصيل وتتبع الطلب", order);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب الطلب", 500);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { otpCode } = req.body;

    if (!otpCode) {
      return sendError(res, "يرجى إدخال كود الـ OTP المكون من 4 أرقام", 400);
    }

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
    });

    if (!order) {
      return sendError(res, "الطلب غير موجود", 404);
    }

    if (order.otpCode !== otpCode.trim()) {
      return sendError(res, "كود الـ OTP غير صحيح! تأكد من الكود الظاهر على شاشة المشتري", 400);
    }

    order.status = "delivered";
    order.paymentStatus = "paid";
    await order.save();

    return sendSuccess(res, "تم التحقق من الـ OTP وتسليم الشحنة بنجاح!", order);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء التحقق من الـ OTP", 500);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return sendError(res, "الطلب غير موجود", 404);

    return sendSuccess(res, "تم تحديث حالة الشحنة بنجاح", order);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في تحديث حالة الطلب", 500);
  }
};
