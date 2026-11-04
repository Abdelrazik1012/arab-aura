// src/controllers/hubController.ts
import { Request, Response } from "express";
import { Hub } from "../models/Hub";
import { Order } from "../models/Order";
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
