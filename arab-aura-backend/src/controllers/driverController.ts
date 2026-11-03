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
    const filter: any = {
      status: { $in: ["collected_in_hub", "out_for_delivery"] },
    };

    if (driverId) {
      filter.$or = [{ driver: driverId }, { driver: null }];
    }

    const orders = await Order.find(filter)
      .populate("hub", "name nameAr code address")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "قائمة الشحنات المكلف بها الكابتن", orders);
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب شحنات السائق", 500);
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
