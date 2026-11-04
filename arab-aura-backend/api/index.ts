// api/index.ts - Vercel Serverless Function entrypoint
import app from "../src/server";
import connectDB from "../src/config/db";

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection error in serverless handler:", err);
  }
  return app(req, res);
}
