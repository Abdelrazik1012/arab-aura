// src/config/db.ts
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  // تجنب إعادة الاتصال إذا كان الاتصال نشطاً بالفعل في بيئة Serverless
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI;

  // 1. محاولة الاتصال بالرابط المعرف في .env (سواء كان محلياً أو كلاود Atlas)
  if (mongoURI) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (err: any) {
      console.warn("⚠️ [MongoDB Local/Atlas Unreachable]:", err.message);
    }
  }

  // 2. Fallback: تشغيل خادم مونجو داخلي تلقائياً (In-Memory MongoDB) للعمل الفوري بدون أي تعقيد
  try {
    console.log("🔄 جاري تهيئة خادم مونجو مدمج (In-Memory MongoDB) للتشغيل الفوري والتجربة...");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ [In-Memory MongoDB Ready]: متصل بخادم مونجو المدمج بنجاح!`);
    console.log(`💡 [ملاحظة]: يمكنك في أي وقت وضع رابط كلاود دائم من MongoDB Atlas في ملف .env`);
  } catch (fallbackErr: any) {
    console.error("❌ تعذر بدء خادم مونجو الداخلي:", fallbackErr.message);
  }
};

export default connectDB;
