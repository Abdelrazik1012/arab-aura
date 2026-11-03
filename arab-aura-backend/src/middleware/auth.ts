// src/middleware/auth.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest, UserRole } from "../types";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "غير مصرح: يرجى تسجيل الدخول أولاً", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    return sendError(res, "انتهت صلاحية جلسة الدخول أو التوكن غير صالح", 401);
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch {
      // Ignored for guest mode
    }
  }
  next();
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "غير مصرح: يرجى تسجيل الدخول", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `غير مصرح لهذا الحساب بالوصول لهذه الخدمة (${req.user.role})`,
        403
      );
    }

    next();
  };
};
