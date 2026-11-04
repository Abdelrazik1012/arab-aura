// src/middleware/security.ts
import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const authLimiterStore: RateLimitStore = {};
const aiLimiterStore: RateLimitStore = {};
const globalLimiterStore: RateLimitStore = {};

/**
 * 🛡️ Security Headers Middleware
 * Adds essential HTTP security headers to protect against common web vulnerabilities
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(self), camera=(), microphone=()");
  next();
};

/**
 * ⏱️ Lightweight Sliding Window Rate Limiter
 */
const createRateLimiter = (
  store: RateLimitStore,
  maxRequests: number,
  windowMs: number,
  limitMessage: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // تخطي الفحص في بيئة الاختبار لتجنب التأثير على اختبارات Vitest / Supertest
    if (process.env.NODE_ENV === "test") {
      next();
      return;
    }

    const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const now = Date.now();

    if (!store[ip] || now > store[ip].resetTime) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      next();
      return;
    }

    store[ip].count += 1;

    if (store[ip].count > maxRequests) {
      const retryAfterSec = Math.ceil((store[ip].resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSec);
      res.status(429).json({
        success: false,
        message: limitMessage,
        retryAfter: `${retryAfterSec} ثانية`,
      });
      return;
    }

    next();
  };
};

// 🔒 محدد طلبات تسجيل الدخول والإنشاء: أقصى حد 20 محاولة كل 5 دقائق لمنع Brute Force
export const authRateLimiter = createRateLimiter(
  authLimiterStore,
  20,
  5 * 60 * 1000,
  "تم تجاوز الحد المسموح لمحاولات تسجيل الدخول، يرجى الانتظار قليلاً لحماية حسابك"
);

// 🤖 محدد طلبات الذكاء الاصطناعي: أقصى حد 15 طلب بالدقيقة لحماية حصة الـ API
export const aiRateLimiter = createRateLimiter(
  aiLimiterStore,
  15,
  60 * 1000,
  "تم تجاوز حد استشارات الذكاء الاصطناعي المسموح بها في الدقيقة، يرجى الانتظار ثوانٍ معدودة"
);

// 🌐 محدد الطلبات العام للمنصة: 200 طلب بالدقيقة
export const globalRateLimiter = createRateLimiter(
  globalLimiterStore,
  200,
  60 * 1000,
  "تجاوزت المنظومة معدل الطلبات المسموح، يرجى تهدئة معدل التصفح"
);
