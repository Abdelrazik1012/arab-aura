// src/types/index.ts
import { Request } from "express";

export type UserRole = "customer" | "seller" | "collector" | "driver" | "admin";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  username?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
