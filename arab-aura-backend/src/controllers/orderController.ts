// src/controllers/orderController.ts
import { Request, Response } from "express";
import { Order, IOrderItem } from "../models/Order";
import { Hub } from "../models/Hub";
import { User } from "../models/User";
import { Brand } from "../models/Brand";
import { WalletTransaction } from "../models/WalletTransaction";
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

    // التحقق من الدفع عبر المحفظة
    if (paymentMethod === "wallet") {
      if (!req.user) {
        return sendError(res, "يجب تسجيل الدخول للدفع عن طريق المحفظة", 401);
      }
      const buyer = await User.findById(req.user.id);
      if (!buyer || buyer.walletBalance < totalAmount) {
        return sendError(
          res,
          `رصيد المحفظة الحالي (${buyer?.walletBalance || 0} ج.م) غير كافٍ لتغطية إجمالي الطلب (${totalAmount} ج.م). يرجى شحن المحفظة أولاً أو اختيار الدفع عند الاستلام.`,
          400
        );
      }
      // خصم المبلغ من المحفظة
      buyer.walletBalance -= totalAmount;
      await buyer.save();

      await WalletTransaction.create({
        user: buyer._id,
        amount: totalAmount,
        type: "payment",
        paymentMethod: "instapay",
        titleAr: "سداد قيمة الطلب الشامل الشحن المجمع",
        titleEn: "Order payment with consolidated delivery",
        status: "completed",
      });
    }

    // توليد رقم أوردر فريد ورقم كود OTP سري من 4 أرقام
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}${randNum.toString().slice(-2)}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const packageId = `PKG-OCT-${randNum}`;

    // ربط تلقائي بأقرب مركز تجميع في المنطقة
    const hub = await Hub.findOne({ active: true });

    // البحث عن السائق المتاح
    const driverUser = await User.findOne({ role: "driver", isOnline: true }) || await User.findOne({ role: "driver" });

    const formattedItems: IOrderItem[] = items.map((i: any) => ({
      product: i.productId || i.id,
      productTitle: i.productTitle || i.titleAr || i.title,
      brandName: i.brandName || "Town Team",
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
      status: "ready_for_collection", // جاهزة بانتظار استلام المُجمّع
      otpCode,
      packageId,
      hub: hub ? hub._id : undefined,
      driver: driverUser ? driverUser._id : undefined,
      driverName: driverUser ? driverUser.name : "الكابتن أحمد محمود",
      driverPhone: driverUser ? (driverUser.phone || "+201092242607") : "+201092242607",
      driverVehicle: "سيارة فان دايو كاري",
      driverPlate: "أ ب جـ 4589",
      items: formattedItems,
    });

    await order.save();

    return sendSuccess(
      res,
      `تم تأكيد طلبك بنجاح برقم: (${order.orderNumber})! كود استلامك هو (${otpCode}).`,
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

    // 💸 تسوية المستحقات المالية فورياً عند التسليم:
    // 1. إضافة أرباح التاجر في محفظته
    for (const item of order.items) {
      const brand = await Brand.findOne({ name: item.brandName });
      if (brand && brand.seller) {
        const netItemRevenue = Math.round(item.unitPrice * item.quantity * 0.92);
        const sellerUser = await User.findById(brand.seller);
        if (sellerUser) {
          sellerUser.walletBalance = (sellerUser.walletBalance || 0) + netItemRevenue;
          await sellerUser.save();

          await WalletTransaction.create({
            user: sellerUser._id,
            amount: netItemRevenue,
            type: "deposit",
            paymentMethod: "card",
            titleAr: `أرباح مبيعات الطلب (${order.orderNumber}) بعد خصم عمولة 8%`,
            titleEn: `Sales payout for order (${order.orderNumber}) after 8% platform fee`,
            status: "completed",
          });
        }
      }
    }

    // 2. إضافة عمولة التوصيل للكابتن (25 ج.م)
    if (order.driver) {
      const driverUser = await User.findById(order.driver);
      if (driverUser) {
        driverUser.walletBalance = (driverUser.walletBalance || 0) + 25;
        await driverUser.save();

        await WalletTransaction.create({
          user: driverUser._id,
          amount: 25,
          type: "deposit",
          paymentMethod: "card",
          titleAr: `عمولة تسليم الشحنة (${order.orderNumber})`,
          titleEn: `Delivery fee for order (${order.orderNumber})`,
          status: "completed",
        });
      }
    }

    return sendSuccess(res, "تم التحقق من الـ OTP وتسليم الشحنة وتسوية الأرباح بنجاح!", order);
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
