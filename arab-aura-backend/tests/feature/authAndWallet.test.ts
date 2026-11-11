// tests/feature/authAndWallet.test.ts
import { describe, it, expect, vi } from "vitest";
import { register, login, forgotPassword, verifyResetOtp } from "../../src/controllers/authController";
import { deposit, withdraw } from "../../src/controllers/walletController";
import { User } from "../../src/models/User";
import { WalletTransaction } from "../../src/models/WalletTransaction";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../src/types";

describe("Auth & Wallet Financial Transactions Feature Tests", () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  it("should derive username from email prefix when username is omitted in registration", async () => {
    const req = {
      body: {
        name: "عبدالرازق بدر",
        email: "abdelrazik_test@gmail.com",
        password: "securePassword123",
        role: "customer",
      },
    } as Request;
    const res = createMockResponse();

    vi.spyOn(User, "findOne").mockResolvedValue(null);
    vi.spyOn(User.prototype, "save").mockResolvedValue({} as any);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.user.username).toBe("abdelrazik_test");
    expect(body.data.user.walletBalance).toBe(0);
  });

  it("should permit login using EITHER email OR username", async () => {
    const mockUser: any = {
      _id: "u-123",
      email: "seller@aura.com",
      username: "townteam_official",
      name: "Town Team Seller",
      role: "seller",
      comparePassword: vi.fn().mockResolvedValue(true),
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findOne").mockResolvedValue(mockUser);

    // 1. Login with username
    const req1 = {
      body: { identifier: "townteam_official", password: "password123" },
    } as Request;
    const res1 = createMockResponse();

    await login(req1, res1);
    expect((res1.json as any).mock.calls[0][0].success).toBe(true);

    // 2. Login with email
    const req2 = {
      body: { identifier: "seller@aura.com", password: "password123" },
    } as Request;
    const res2 = createMockResponse();

    await login(req2, res2);
    expect((res2.json as any).mock.calls[0][0].success).toBe(true);
  });

  it("should reject withdrawal if requested amount exceeds wallet balance", async () => {
    const mockUser: any = {
      _id: "u-456",
      walletBalance: 250, // only 250 EGP
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findById").mockResolvedValue(mockUser);

    const req = {
      user: { id: "u-456", email: "seller@aura.com", role: "seller", name: "Seller" },
      body: {
        amount: 500, // trying to withdraw 500 EGP
        paymentMethod: "instapay",
        accountDetail: "01092242607",
      },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await withdraw(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toContain("لا يكفي لسحب");
  });

  it("should process deposit and accurately increase user walletBalance", async () => {
    const mockUser: any = {
      _id: "u-789",
      walletBalance: 0,
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findById").mockResolvedValue(mockUser);
    vi.spyOn(WalletTransaction.prototype, "save").mockResolvedValue({} as any);

    const req = {
      user: { id: "u-789", email: "customer@aura.com", role: "customer", name: "Customer" },
      body: {
        amount: 300,
        paymentMethod: "vodafone_cash",
        reference: "VOD-98214",
      },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await deposit(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUser.walletBalance).toBe(300);
  });

  it("should return 404 error when requesting password reset for an unregistered email", async () => {
    const req = {
      body: { email: "nonexistent_user@gmail.com", method: "email" },
    } as Request;
    const res = createMockResponse();

    vi.spyOn(User, "findOne").mockResolvedValue(null);

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toContain("غير مسجل");
  });

  it("should return 404 error when requesting password reset for an unregistered phone", async () => {
    const req = {
      body: { phone: "01099999999", method: "whatsapp" },
    } as Request;
    const res = createMockResponse();

    vi.spyOn(User, "findOne").mockResolvedValue(null);

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toContain("غير مسجل لدينا");
  });

  it("should generate 6-digit OTP and not expose OTP in response for registered email", async () => {
    const mockUser: any = {
      _id: "u-registered",
      name: "أحمد كمال",
      email: "ahmed_kamal@gmail.com",
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findOne").mockResolvedValue(mockUser);

    const req = {
      body: { email: "ahmed_kamal@gmail.com", method: "email" },
    } as Request;
    const res = createMockResponse();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.email).toBe("ahmed_kamal@gmail.com");
    // Verify security: OTP code is NOT exposed in the client payload
    expect(body.data.demoOtpCode).toBeUndefined();
    expect(mockUser.resetOtp).toBeDefined();
    expect(mockUser.resetOtp.length).toBe(6);
  });

  it("should generate WhatsApp URL for registered phone without exposing OTP in response body", async () => {
    const mockUser: any = {
      _id: "u-phone-user",
      name: "كريم سامي",
      email: "karim@aura.com",
      phone: "01012345678",
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findOne").mockResolvedValue(mockUser);

    const req = {
      body: { phone: "01012345678", method: "whatsapp" },
    } as Request;
    const res = createMockResponse();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.method).toBe("whatsapp");
    expect(body.data.whatsappUrl).toContain("api.whatsapp.com");
  });

  it("should successfully verify valid 6-digit OTP", async () => {
    const mockUser: any = {
      _id: "u-valid",
      email: "ahmed_kamal@gmail.com",
      resetOtp: "987654",
      resetOtpExpires: new Date(Date.now() + 500000),
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findOne").mockResolvedValue(mockUser);

    const req = {
      body: { email: "ahmed_kamal@gmail.com", otpCode: "987654" },
    } as Request;
    const res = createMockResponse();

    await verifyResetOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.verified).toBe(true);
  });
});
