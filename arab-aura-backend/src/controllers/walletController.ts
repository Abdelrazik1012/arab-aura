// src/controllers/walletController.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { User } from "../models/User";
import { WalletTransaction } from "../models/WalletTransaction";
import { sendSuccess, sendError } from "../utils/response";

export const getMyWallet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, "المستخدم غير موجود", 404);

    const transactions = await WalletTransaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, "بيانات المحفظة", {
      balance: user.walletBalance || 0,
      transactions: transactions.map((t) => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        titleAr: t.titleAr,
        titleEn: t.titleEn,
        status: t.status,
        paymentMethod: t.paymentMethod,
        date: t.createdAt,
      })),
    });
  } catch (err: any) {
    return sendError(res, err.message || "حدث خطأ أثناء جلب بيانات المحفظة", 500);
  }
};

export const deposit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    const { amount, paymentMethod, reference } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return sendError(res, "المبلغ يجب أن يكون أكبر من 0", 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, "المستخدم غير موجود", 404);

    user.walletBalance = (user.walletBalance || 0) + numAmount;
    await user.save();

    const transaction = new WalletTransaction({
      user: user._id,
      type: "deposit",
      amount: numAmount,
      titleAr: `شحن رصيد المحفظة عبر ${paymentMethod || "InstaPay"}`,
      titleEn: `Wallet deposit via ${paymentMethod || "InstaPay"}`,
      status: "completed",
      paymentMethod: paymentMethod || "instapay",
      reference: reference || `DEP-${Date.now()}`,
    });
    await transaction.save();

    return sendSuccess(res, "تم شحن المحفظة بنجاح", {
      balance: user.walletBalance,
      transaction,
    });
  } catch (err: any) {
    return sendError(res, err.message || "فشل شحن المحفظة", 500);
  }
};

export const withdraw = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, "غير مصرح", 401);

    const { amount, paymentMethod, accountDetail } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return sendError(res, "المبلغ يجب أن يكون أكبر من 0", 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, "المستخدم غير موجود", 404);

    if ((user.walletBalance || 0) < numAmount) {
      return sendError(
        res,
        `رصيدك الحالي (${user.walletBalance || 0} ج.م) لا يكفي لسحب مبلغ ${numAmount} ج.م`,
        400
      );
    }

    user.walletBalance -= numAmount;
    await user.save();

    const transaction = new WalletTransaction({
      user: user._id,
      type: "withdrawal",
      amount: -numAmount,
      titleAr: `طلب سحب أرباح إلى حساب (${accountDetail || "المسجل"})`,
      titleEn: `Withdrawal request to account (${accountDetail || "Registered"})`,
      status: "completed",
      paymentMethod: paymentMethod || "instapay",
      reference: `WTH-${Date.now()}`,
    });
    await transaction.save();

    return sendSuccess(res, "تم تسجيل طلب السحب بنجاح", {
      balance: user.walletBalance,
      transaction,
    });
  } catch (err: any) {
    return sendError(res, err.message || "فشل سحب الرصيد", 500);
  }
};
