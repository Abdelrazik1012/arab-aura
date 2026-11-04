// tests/feature/socialScraping.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/server";
import { generateToken } from "../../src/utils/jwt";
import { User } from "../../src/models/User";

describe("Seller Social Media Scraping & Profile Social Links Tests", () => {
  const sellerToken = generateToken({
    id: "seller-scrape-101",
    email: "seller@aura.com",
    role: "seller",
    name: "تاجر أزياء معتمد",
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. should successfully scrape social media products for an authorized seller", async () => {
    const res = await request(app)
      .post("/api/seller/scrape-social")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        platform: "instagram",
        pageUrl: "https://www.instagram.com/townteam_egypt",
        consentAgreed: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.platform).toBe("instagram");
    expect(res.body.data.extractedCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body.data.products[0]).toHaveProperty("price");
    expect(res.body.data.products[0]).toHaveProperty("material");
  });

  it("2. should reject scraping if consentAgreed is false or missing", async () => {
    const res = await request(app)
      .post("/api/seller/scrape-social")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        platform: "facebook",
        pageUrl: "https://www.facebook.com/concrete_egypt",
        consentAgreed: false,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("3. should allow updating seller socialLinks in auth profile", async () => {
    const mockUser = {
      _id: "seller-scrape-101",
      name: "تاجر ملابس",
      email: "seller@aura.com",
      role: "seller",
      socialLinks: {
        instagram: "https://instagram.com/mybrand",
        facebook: "https://facebook.com/mybrand",
      },
    };

    vi.spyOn(User, "findByIdAndUpdate").mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        name: "تاجر ملابس",
        socialLinks: {
          instagram: "https://instagram.com/mybrand",
          facebook: "https://facebook.com/mybrand",
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
