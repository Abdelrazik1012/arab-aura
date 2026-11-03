// src/utils/response.ts
import { Response } from "express";
import { ApiResponse } from "../types";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  meta?: any
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any
): Response => {
  const payload: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(payload);
};
