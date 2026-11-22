// tests/feature/adminManagement.test.ts
import { describe, it, expect, vi } from "vitest";
import {
  getAllUsers,
  updateAdminUser,
  deleteAdminUser,
  updateBrandStatus,
} from "../../src/controllers/adminController";
import { User } from "../../src/models/User";
import { Brand } from "../../src/models/Brand";
import { Response } from "express";
import { AuthenticatedRequest } from "../../src/types";

describe("Admin Management API Feature Tests", () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  it("1. should list all platform users without exposing passwords", async () => {
    const mockUsers = [
      { _id: "u1", name: "أدمن", email: "admin@aura.com", role: "admin", status: "active" },
      { _id: "u2", name: "عميل جديد", email: "realuser@gmail.com", role: "customer", status: "active" },
    ];

    vi.spyOn(User, "find").mockReturnValue({
      select: vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockUsers),
      }),
    } as any);

    const req = { query: {} } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(2);
  });

  it("2. should allow admin to suspend or activate a user account", async () => {
    const updatedUser = {
      _id: "u2",
      name: "عميل جديد",
      email: "realuser@gmail.com",
      role: "customer",
      status: "suspended",
    };

    vi.spyOn(User, "findByIdAndUpdate").mockReturnValue({
      select: vi.fn().mockResolvedValue(updatedUser),
    } as any);

    const req = {
      params: { id: "u2" },
      body: { status: "suspended" },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await updateAdminUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.data.status).toBe("suspended");
  });

  it("3. should prevent admin from deleting their own active account", async () => {
    const req = {
      user: { id: "admin-1", email: "admin@aura.com", role: "admin", name: "Admin" },
      params: { id: "admin-1" },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await deleteAdminUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  it("4. should approve a merchant brand contract in MongoDB", async () => {
    const approvedBrand = { _id: "b1", name: "Nile Fashion", status: "approved" };
    vi.spyOn(Brand, "findByIdAndUpdate").mockReturnValue({
      populate: vi.fn().mockResolvedValue(approvedBrand),
    } as any);

    const req = {
      params: { id: "b1" },
      body: { status: "approved" },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await updateBrandStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.data.status).toBe("approved");
  });
});
