// tests/unit/rbac.test.ts
import { describe, it, expect, vi } from "vitest";
import { authorizeRoles, authenticate } from "../../src/middleware/auth";
import { generateToken } from "../../src/utils/jwt";
import { AuthenticatedRequest } from "../../src/types";
import { Response } from "express";

describe("RBAC & Authentication Middleware Unit Tests", () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  it("should reject unauthenticated requests without Authorization header", async () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = createMockResponse();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "غير مصرح: يرجى تسجيل الدخول أولاً" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject requests with invalid or tampered JWT token", async () => {
    const req = {
      headers: { authorization: "Bearer invalid_token_xyz_123" },
    } as AuthenticatedRequest;
    const res = createMockResponse();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "انتهت صلاحية جلسة الدخول أو التوكن غير صالح" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should successfully authenticate valid JWT and populate req.user", async () => {
    const token = generateToken({
      id: "6aea72b0998c0bf001694c7b",
      email: "customer@aura.com",
      role: "customer",
      name: "أحمد عبد العزيز",
      username: "customer",
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthenticatedRequest;
    const res = createMockResponse();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.email).toBe("customer@aura.com");
    expect(req.user?.role).toBe("customer");
  });

  it("should prevent Customer from accessing Seller protected routes", () => {
    const req = {
      user: {
        id: "cust-1",
        email: "customer@aura.com",
        role: "customer",
        name: "Customer User",
      },
    } as AuthenticatedRequest;
    const res = createMockResponse();
    const next = vi.fn();

    const sellerGuard = authorizeRoles("seller", "admin");
    sellerGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should grant Admin super-access to Seller routes", () => {
    const req = {
      user: {
        id: "admin-1",
        email: "admin@aura.com",
        role: "admin",
        name: "Admin Executive",
      },
    } as AuthenticatedRequest;
    const res = createMockResponse();
    const next = vi.fn();

    const sellerGuard = authorizeRoles("seller", "admin");
    sellerGuard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should prevent Driver from accessing Collector route", () => {
    const req = {
      user: {
        id: "driver-1",
        email: "driver@aura.com",
        role: "driver",
        name: "Driver Captain",
      },
    } as AuthenticatedRequest;
    const res = createMockResponse();
    const next = vi.fn();

    const collectorGuard = authorizeRoles("collector");
    collectorGuard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
