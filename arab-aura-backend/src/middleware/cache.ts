// src/middleware/cache.ts
import { Request, Response, NextFunction } from "express";

interface CacheEntry {
  body: any;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * ⚡ In-Memory Response Caching Middleware
 * Caches GET requests for public endpoints (e.g. products, categories)
 * @param ttlSeconds Time-to-live in seconds (defaults to 60 seconds)
 */
export const cacheResponse = (ttlSeconds = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // التخزين المؤقت لطلبات GET فقط وفي غير بيئة الاختبار
    if (req.method !== "GET" || process.env.NODE_ENV === "test") {
      next();
      return;
    }

    const cacheKey = `${req.originalUrl || req.url}`;
    const now = Date.now();
    const cached = memoryCache.get(cacheKey);

    if (cached && now < cached.expiry) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("X-Cache-TTL", Math.ceil((cached.expiry - now) / 1000));
      res.json(cached.body);
      return;
    }

    res.setHeader("X-Cache", "MISS");

    // اعتراض دالة res.json لحفظ الرد في الكاش
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, {
          body,
          expiry: Date.now() + ttlSeconds * 1000,
        });
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * 🧹 مسح الكاش عند إضافة أو تعديل المنتجات
 */
export const clearProductCache = () => {
  for (const key of memoryCache.keys()) {
    if (key.includes("/products")) {
      memoryCache.delete(key);
    }
  }
};
