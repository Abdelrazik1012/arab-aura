// src/config/db.ts
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`✅ [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (err: any) {
      console.warn("⚠️ [MongoDB Atlas Unreachable]:", err.message);
      if (process.env.VERCEL) {
        throw new Error(`MongoDB Atlas Connection Failed: ${err.message}. Please ensure 0.0.0.0/0 is whitelisted in Atlas Network Access.`);
      }
    }
  }

  // Fallback for local development only
  if (!process.env.VERCEL) {
    try {
      console.log("🔄 جاري تهيئة خادم مونجو مدمج (In-Memory MongoDB) محلياً...");
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ [In-Memory MongoDB Ready]`);
    } catch (fallbackErr: any) {
      console.error("❌ تعذر بدء خادم مونجو الداخلي:", fallbackErr.message);
    }
  }
};

export default connectDB;
