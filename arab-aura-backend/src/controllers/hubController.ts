// src/controllers/hubController.ts
import { Request, Response } from "express";
import { Hub } from "../models/Hub";
import { Order } from "../models/Order";
import { sendSuccess, sendError } from "../utils/response";

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
