// tests/feature/orderLifecycle.test.ts
import { describe, it, expect, vi } from "vitest";
import { createOrder, verifyOtp } from "../../src/controllers/orderController";
import { Order } from "../../src/models/Order";
import { User } from "../../src/models/User";
import { Brand } from "../../src/models/Brand";
import { Hub } from "../../src/models/Hub";
import { WalletTransaction } from "../../src/models/WalletTransaction";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../src/types";

describe("Micro-Hub Logistics & Order Lifecycle Feature Tests", () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  it("should create order with flat 35 EGP neighborhood fee and 4-digit secret OTP", async () => {
    const req = {
      user: { id: "cust-1", email: "customer@aura.com", role: "customer", name: "Ahmed" },
      body: {
        items: [
          {
            productId: "p-1",
            productTitle: "تيشيرت بولو قطن فاخر",
            brandName: "Town Team",
            unitPrice: 450,
            quantity: 2,
            size: "L",
            color: "كحلي",
          },
        ],
        shippingType: "standard",
        shippingAddress: {
          fullName: "محمود عبد الفتاح",
          phone: "01012345678",
          governorate: "المنوفية",
          city: "شبين الكوم",
          address: "شارع الجلاء",
        },
        paymentMethod: "cod",
      },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    vi.spyOn(Hub, "findOne").mockResolvedValue({ _id: "hub-1" } as any);
    vi.spyOn(User, "findOne").mockResolvedValue({ _id: "driver-1", name: "أحمد محمود", phone: "01092242607" } as any);
    vi.spyOn(Order.prototype, "save").mockResolvedValue({} as any);

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.shippingFee).toBe(35);
    expect(body.data.totalAmount).toBe(935); // (450 * 2) + 35
    expect(body.data.otpCode).toMatch(/^[0-9]{4}$/); // 4-digit numeric OTP
    expect(body.data.status).toBe("ready_for_collection");
  });

  it("should block wallet checkout if customer has insufficient funds", async () => {
    const mockBuyer: any = {
      _id: "cust-2",
      walletBalance: 200, // order is 485 EGP
      save: vi.fn(),
    };

    vi.spyOn(User, "findById").mockResolvedValue(mockBuyer);

    const req = {
      user: { id: "cust-2", email: "cust2@aura.com", role: "customer", name: "Buyer" },
      body: {
        items: [
          {
            productTitle: "تيشيرت كاجوال",
            unitPrice: 450,
            quantity: 1,
            brandName: "Town Team",
          },
        ],
        shippingType: "standard",
        shippingAddress: {
          fullName: "سامي عادل",
          phone: "01099887766",
        },
        paymentMethod: "wallet",
      },
    } as AuthenticatedRequest;
    const res = createMockResponse();

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toContain("رصيد المحفظة الحالي (200 ج.م) غير كافٍ");
  });

  it("should verify OTP on doorstep, mark order delivered, and pay out driver and seller", async () => {
    const mockOrder: any = {
      _id: "ord-9821",
      orderNumber: "ORD-9821",
      otpCode: "4821",
      status: "out_for_delivery",
      paymentMethod: "cod",
      totalAmount: 1035,
      driver: "driver-123",
      items: [
        {
          brandName: "Town Team",
          unitPrice: 500,
          quantity: 2,
        },
      ],
      save: vi.fn().mockResolvedValue(true),
    };

    const mockSellerUser: any = {
      _id: "seller-123",
      walletBalance: 0,
      save: vi.fn().mockResolvedValue(true),
    };

    const mockDriverUser: any = {
      _id: "driver-123",
      walletBalance: 50,
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Order, "findOne").mockResolvedValue(mockOrder);
    vi.spyOn(Brand, "findOne").mockResolvedValue({ name: "Town Team", seller: "seller-123" } as any);
    vi.spyOn(User, "findById").mockImplementation(async (id: any) => {
      if (id === "seller-123") return mockSellerUser;
      if (id === "driver-123") return mockDriverUser;
      return null;
    });
    vi.spyOn(WalletTransaction, "create").mockResolvedValue({} as any);

    // 1. Wrong OTP attempt
    const reqWrong = {
      params: { id: "ORD-9821" },
      body: { otpCode: "9999" },
    } as unknown as Request;
    const resWrong = createMockResponse();

    await verifyOtp(reqWrong, resWrong);
    expect(resWrong.status).toHaveBeenCalledWith(400);
    expect((resWrong.json as any).mock.calls[0][0].message).toContain("كود الـ OTP غير صحيح");

    // 2. Correct OTP attempt
    const reqCorrect = {
      params: { id: "ORD-9821" },
      body: { otpCode: "4821" },
    } as unknown as Request;
    const resCorrect = createMockResponse();

    await verifyOtp(reqCorrect, resCorrect);

    expect(resCorrect.status).not.toHaveBeenCalledWith(400);
    expect(mockOrder.status).toBe("delivered");
    expect(mockOrder.paymentStatus).toBe("paid");

    // Net seller revenue = (500 * 2) * 0.92 = 920 EGP
    expect(mockSellerUser.walletBalance).toBe(920);

    // Driver fee = 50 + 25 = 75 EGP
    expect(mockDriverUser.walletBalance).toBe(75);
  });
});
