// src/controllers/driverController.ts
import { Response } from "express";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export const getAssignedDeliveries = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const driverId = req.user ? req.user.id : null;
    const isDemoDriver =
      req.user?.email === "driver@aura.com" ||
      req.user?.username === "driver" ||
      !req.user;

    const filter: any = {};
    if (isDemoDriver) {
      // السائق التجريبي يرى الشحنات الموكلة له أو الشحنات الجاهزة
      filter.status = { $in: ["collected_in_hub", "out_for_delivery", "delivered"] };
    } else {
      // سائق جديد يرى الشحنات المخصصة له فقط
      filter.driver = driverId;
    }

    const orders = await Order.find(filter)
      .populate("hub", "name nameAr code address")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "قائمة الشحنات المكلف بها الكابتن", orders);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب شحنات السائق", 500);
  }
};

export const getDriverMetrics = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const driverId = req.user ? req.user.id : null;
    const isDemoDriver =
      req.user?.email === "driver@aura.com" ||
      req.user?.username === "driver" ||
      !req.user;

    const filter: any = {};
    if (isDemoDriver) {
      filter.$or = [{ driver: driverId }, { driver: { $exists: true } }, { status: { $in: ["out_for_delivery", "delivered"] } }];
    } else {
      filter.driver = driverId;
    }

    const orders = await Order.find(filter);

    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const activeDeliveries = orders.filter((o) => o.status === "out_for_delivery" || o.status === "collected_in_hub").length;

    // تحصيل كاش COD من العملاء
    let codCollected = 0;
    for (const o of deliveredOrders) {
      if (o.paymentMethod === "cod") {
        codCollected += o.totalAmount;
      }
    }

    // عمولة الكابتن الثابتة لكل رحلة توصيل ناجحة (25 ج.م)
    const earnedDeliveryFees = deliveredOrders.length * 25;
    const successRate = orders.length > 0 ? `${Math.round((deliveredOrders.length / orders.length) * 100)}%` : "100%";

    // 📊 إحصائيات التوصيل اليومية لآخر 7 أيام
    const dailyAnalytics = [];
    const now = new Date();
    let maxDeliveries = 0;

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toISOString().split("T")[0];
      const dayLabel = targetDate.toLocaleDateString("ar-EG", { weekday: "short" });

      const dayCount = deliveredOrders.filter(
        (o) => new Date(o.updatedAt || o.createdAt).toISOString().split("T")[0] === dateStr
      ).length;

      if (dayCount > maxDeliveries) maxDeliveries = dayCount;

      dailyAnalytics.push({
        day: dayLabel,
        date: dateStr,
        deliveries: dayCount,
        heightPercent: 0,
      });
    }

    for (const d of dailyAnalytics) {
      d.heightPercent = maxDeliveries > 0 ? Math.max(20, Math.round((d.deliveries / maxDeliveries) * 100)) : 15;
    }

    return sendSuccess(res, "مؤشرات أداء الكابتن والتوصيل", {
      totalDelivered: deliveredOrders.length,
      activeDeliveries,
      codCollected,
      earnedDeliveryFees,
      successRate,
      rating: "4.9",
      dailyAnalytics,
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب مؤشرات السائق", 500);
  }
};

export const updateLocation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { lat, lng, isOnline } = req.body;
    if (!req.user) return sendError(res, "غير مصرح", 401);

    await User.findByIdAndUpdate(req.user.id, {
      currentLat: Number(lat),
      currentLng: Number(lng),
      isOnline: isOnline !== undefined ? Boolean(isOnline) : true,
    });

    return sendSuccess(res, "تم تحديث موقع الكابتن المباشر GPS بنجاح");
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في تحديث إحداثيات السائق", 500);
  }
};
