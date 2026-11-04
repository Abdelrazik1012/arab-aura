// src/controllers/sellerController.ts
import { Response } from "express";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Brand } from "../models/Brand";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export const getDashboardMetrics = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    // التحقق من براند التاجر
    const brand = await Brand.findOne({ seller: req.user.id });
    
    // إذا كان المستخدم حساب تجريبي مخصص للتاجر أو مرتبط بتاون تيم
    const isDemoSeller =
      req.user.email === "seller@aura.com" ||
      req.user.email === "seller@townteam.com" ||
      req.user.username === "seller";

    const brandName = brand ? brand.name : isDemoSeller ? "Town Team" : null;

    if (!brandName) {
      // مستخدم تاجر جديد تماماً لم ينشئ براند أو متجر بعد
      const emptyDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          day: d.toLocaleDateString("ar-EG", { weekday: "short" }),
          date: d.toISOString().split("T")[0],
          sales: 0,
          ordersCount: 0,
          heightPercent: 0,
        };
      });

      return sendSuccess(res, "مؤشرات أداء متجر التاجر والمصنع", {
        grossSales: 0,
        netSales: 0,
        ordersCount: 0,
        unitsSold: 0,
        avgOrderValue: 0,
        conversionRate: "0%",
        estimatedProfit: 0,
        pendingOrders: 0,
        readyForCollection: 0,
        outForDelivery: 0,
        lowStockAlerts: 0,
        returnRate: "0%",
        availablePayout: 0,
        dailyAnalytics: emptyDays,
        brandName: "متجر جديد",
      });
    }

    // جلب طلبات البراند الفعلية من قاعدة البيانات
    const orders = await Order.find({ "items.brandName": brandName });

    let grossSales = 0;
    let unitsSold = 0;

    for (const o of orders) {
      for (const item of o.items) {
        if (item.brandName === brandName) {
          grossSales += item.unitPrice * item.quantity;
          unitsSold += item.quantity;
        }
      }
    }

    const netSales = Math.round(grossSales * 0.92); // خصم عمولة المنصة المخفضة 8%
    const ordersCount = orders.length;
    const avgOrderValue = unitsSold > 0 ? Math.round(grossSales / unitsSold) : 0;
    const conversionRate = ordersCount > 0 ? "3.8%" : "0.0%";
    const estimatedProfit = Math.round(netSales * 0.35); // متوسط هامش ربح التاجر 35%

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const readyForCollection = orders.filter((o) => o.status === "ready_for_collection").length;
    const outForDelivery = orders.filter((o) => o.status === "out_for_delivery").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    
    // الرصيد القابل للسحب = صافي مبيعات الشحنات التي تم تسليمها بنجاح للعميل
    let deliveredGross = 0;
    for (const o of deliveredOrders) {
      for (const item of o.items) {
        if (item.brandName === brandName) {
          deliveredGross += item.unitPrice * item.quantity;
        }
      }
    }
    const availablePayout = Math.round(deliveredGross * 0.92);

    // 📊 حساب أعمدة التحليلات اليومية الحقيقية لآخر 7 أيام
    const dailyAnalytics = [];
    const now = new Date();
    let maxDaySales = 0;

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toISOString().split("T")[0];
      const dayLabel = targetDate.toLocaleDateString("ar-EG", { weekday: "short" });

      let daySales = 0;
      let dayOrders = 0;

      for (const o of orders) {
        const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
        if (orderDate === dateStr) {
          dayOrders++;
          for (const item of o.items) {
            if (item.brandName === brandName) {
              daySales += item.unitPrice * item.quantity;
            }
          }
        }
      }

      if (daySales > maxDaySales) maxDaySales = daySales;

      dailyAnalytics.push({
        day: dayLabel,
        date: dateStr,
        sales: daySales,
        ordersCount: dayOrders,
        heightPercent: 0, // سنحسبها بالأسفل نسبة لأعلى يوم
      });
    }

    // حساب نسبة ارتفاع الأعمدة
    for (const d of dailyAnalytics) {
      d.heightPercent = maxDaySales > 0 ? Math.max(15, Math.round((d.sales / maxDaySales) * 100)) : 10;
    }

    return sendSuccess(res, "مؤشرات أداء متجر التاجر والمصنع", {
      grossSales,
      netSales,
      ordersCount,
      unitsSold,
      avgOrderValue,
      conversionRate,
      estimatedProfit,
      pendingOrders,
      readyForCollection,
      outForDelivery,
      lowStockAlerts: 0,
      returnRate: "0.0%",
      availablePayout,
      dailyAnalytics,
      brandName,
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب المؤشرات", 500);
  }
};

export const getSellerProducts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    const brand = await Brand.findOne({ seller: req.user.id });
    const isDemoSeller =
      req.user.email === "seller@aura.com" ||
      req.user.email === "seller@townteam.com" ||
      req.user.username === "seller";

    const filter = brand ? { brand: brand._id } : isDemoSeller ? {} : { seller: req.user.id };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, "منتجات التاجر", products);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب منتجات التاجر", 500);
  }
};
