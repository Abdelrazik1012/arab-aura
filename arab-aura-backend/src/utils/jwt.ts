// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

const JWT_SECRET =
  process.env.JWT_SECRET || "arab_aura_super_secure_jwt_secret_key_2026";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as any;

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
