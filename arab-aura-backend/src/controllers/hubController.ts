// src/controllers/hubController.ts
import { Request, Response } from "express";
import { Hub } from "../models/Hub";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Vehicle } from "../models/Vehicle";
import { Shipment } from "../models/Shipment";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest } from "../types";

export const getAllHubs = async (_req: Request, res: Response) => {
  try {
    const hubs = await Hub.find({ active: true }).populate("collector", "name email phone");
    return sendSuccess(res, "قائمة مراكز التجميع بالأحياء (Micro-Hubs)", hubs);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب مراكز التجميع", 500);
  }
};

export const getHubPackages = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const hub = await Hub.findOne({ code: code.toUpperCase() });
    if (!hub) return sendError(res, "مركز التجميع غير موجود", 404);

    const orders = await Order.find({ hub: hub._id }).sort({ createdAt: -1 });

    // تجميع الشحنات حسب الحزم
    const packagesMap = new Map<string, any[]>();
    for (const order of orders) {
      const pkgId = order.packageId || "UNASSIGNED";
      if (!packagesMap.has(pkgId)) packagesMap.set(pkgId, []);
      packagesMap.get(pkgId)!.push(order);
    }

    const packages = Array.from(packagesMap.entries()).map(([packageId, items]) => ({
      packageId,
      ordersCount: items.length,
      destinationArea: items[0]?.city || hub.city,
      totalRevenue: items.reduce((sum, o) => sum + o.totalAmount, 0),
      status: items[0]?.status,
      orders: items,
    }));

    return sendSuccess(res, "حزم وشحنات المركز", {
      hub,
      totalPackages: packages.length,
      packages,
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب حزم المركز", 500);
  }
};

export const getHubMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isDemoCollector =
      req.user?.email === "collector@aura.com" ||
      req.user?.username === "collector" ||
      !req.user;

    const allOrders = await Order.find({});
    const orders = isDemoCollector
      ? allOrders
      : allOrders.filter((o) => (o as any).collector?.toString() === req.user?.id);

    const pendingCollection = orders.filter((o) => o.status === "ready_for_collection").length;
    const receivedInHub = orders.filter((o) => o.status === "collected_in_hub").length;
    const dispatchedToDrivers = orders.filter((o) => o.status === "out_for_delivery").length;
    const completedDelivered = orders.filter((o) => o.status === "delivered").length;

    return sendSuccess(res, "مؤشرات أداء مركز التجميع (Micro-Hub)", {
      totalHandled: orders.length,
      pendingCollection,
      receivedInHub,
      dispatchedToDrivers,
      completedDelivered,
      consolidationSavings: "65% توفير في انبعاثات وتكاليف الوقود",
      hubCapacityUsed: `${Math.min(95, orders.length * 12)}%`,
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ في مؤشرات مركز التجميع", 500);
  }
};

/**
 * جلب جميع طلبات مركز التجميع لمسؤول التجميع (Collector)
 */
export const getCollectorOrders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const isDemoCollector =
      req.user?.email === "collector@aura.com" ||
      req.user?.username === "collector" ||
      !req.user;

    let filter: any = {};
    if (!isDemoCollector && req.user) {
      const hub = await Hub.findOne({ collector: req.user.id });
      if (hub) {
        filter = { $or: [{ hub: hub._id }, { city: hub.city }] };
      }
    }

    const orders = await Order.find(filter)
      .populate("hub", "name nameAr code address city")
      .populate("driver", "name phone")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "طلبات مركز التجميع (Micro-Hub Orders)", orders);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب طلبات المركز", 500);
  }
};

/**
 * تجميع عدة طلبات في حزمة ذكية موحدة (Smart Batch Consolidation)
 */
export const consolidateOrdersIntoPackage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { packageId, orderIds, targetZone } = req.body;
    if (!packageId || !Array.isArray(orderIds) || orderIds.length === 0) {
      return sendError(res, "يرجى تحديد كود الحزمة والطلبات المراد تجميعها", 400);
    }

    await Order.updateMany(
      {
        $or: [
          { _id: { $in: orderIds.filter((id: string) => id.match(/^[0-9a-fA-F]{24}$/)) } },
          { orderNumber: { $in: orderIds } },
        ],
      },
      {
        $set: {
          packageId,
          status: "collected_in_hub",
        },
      }
    );

    return sendSuccess(
      res,
      `تم تجميع عدد (${orderIds.length}) طلب في الحزمة الذكية (${packageId}) بنجاح!`,
      {
        packageId,
        ordersCount: orderIds.length,
        status: "collected_in_hub",
        targetZone: targetZone || "6 أكتوبر والمنوفية",
      }
    );
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تجميع الشحنات", 500);
  }
};

/**
 * تسليم حزمة مجمعة لسائق توصيل وتحديث الحالة لخروج التسليم
 */
export const assignDriverToPackage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { packageId, driverId } = req.body;
    if (!packageId || !driverId) {
      return sendError(res, "يرجى تحديد كود الحزمة وسائق التوصيل", 400);
    }

    let driverUser = await User.findOne({
      $or: [
        { _id: driverId.match(/^[0-9a-fA-F]{24}$/) ? driverId : null },
        { email: driverId },
        { username: driverId },
      ],
    });

    if (!driverUser) {
      driverUser = await User.findOne({ role: "driver" });
    }

    if (!driverUser) {
      return sendError(res, "السائق غير موجود في النظام", 404);
    }

    const vehicle = await Vehicle.findOne({ driver: driverUser._id });

    await Order.updateMany(
      { packageId },
      {
        $set: {
          driver: driverUser._id,
          driverName: driverUser.name,
          driverPhone: driverUser.phone,
          driverVehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : "سيارة فان دايو كاري",
          driverPlate: vehicle ? vehicle.plateNumber : "أ ب جـ 4589",
          status: "out_for_delivery",
        },
      }
    );

    // تحديث سجلات الشحنات (Shipment)
    const orders = await Order.find({ packageId });
    for (const ord of orders) {
      await Shipment.findOneAndUpdate(
        { order: ord._id },
        {
          driver: driverUser._id,
          vehicle: vehicle?._id,
          shippingStatus: "in_transit",
        },
        { upsert: true }
      );
    }

    return sendSuccess(
      res,
      `تم تسليم الحزمة (${packageId}) للكابتن (${driverUser.name}) بنجاح، وخرجت للتوصيل المباشر!`,
      {
        packageId,
        driver: { id: driverUser._id, name: driverUser.name, phone: driverUser.phone },
        status: "out_for_delivery",
      }
    );
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء تسليم الحزمة للسائق", 500);
  }
};
