// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🔥 [Error Handler]:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً";

  return sendError(res, message, statusCode, process.env.NODE_ENV === "development" ? err.stack : undefined);
};

export default errorHandler;
