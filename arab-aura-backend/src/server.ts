// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import apiRoutes from "./routes";
import errorHandler from "./middleware/errorHandler";
import { securityHeaders, globalRateLimiter } from "./middleware/security";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// الاتصال بقاعدة بيانات مونجو
connectDB();

// 🛡️ ترويسات الأمان ومحدد الطلبات العالمي
app.use(securityHeaders);
app.use(globalRateLimiter);

// إعدادات CORS المتوافقة مع الويب وتطبيقات الموبايل
app.use(
  cors({
    origin: (origin, callback) => {
      // السماح لتطبيقات الموبايل وأدوات مثل Postman (origin === undefined) ومتصفح الويب
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// تسجيل الطلبات في بيئة التطوير
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// المسارات الأساسية للـ API
app.use("/api", apiRoutes);

// المسار الترحيبي عند فتح الرابط المباشر
app.get("/", (_req, res) => {
  res.json({
    platform: "عرب أورا - المنصة المصرية للملابس والشحن بالحي",
    version: "1.0.0",
    apiDocumentation: "/api/health",
    status: "Active",
  });
});

// معالج الأخطاء المركزي
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
  ══════════════════════════════════════════════════════════
  🚀 [Arab Aura Backend Server Running]
  📡 Local API URL:  http://localhost:${PORT}/api
  🏥 Health Check:   http://localhost:${PORT}/api/health
  🌐 CORS Allowed:   Web SPA (5173) + Mobile App Clients
  ══════════════════════════════════════════════════════════
  `);
  });
}

export default app;
