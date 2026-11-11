// tests/unit/aiPipeline.test.ts
import { describe, it, expect, vi } from "vitest";
import { getProductAiInsights, queryMarketAssistant, virtualTryOn } from "../../src/controllers/aiController";
import { Request, Response } from "express";

describe("AI & Computer Vision Pipeline Unit Tests", () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  it("should handle empty or corrupt product insights payload gracefully without crashing", async () => {
    const req = { body: {} } as Request;
    const res = createMockResponse();

    await getProductAiInsights(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          fitAdvisor: expect.any(Object),
          fabricCare: expect.any(Object),
          marketStats: expect.any(Object),
        }),
      })
    );
  });

  it("should accurately calculate BMI and recommend appropriate Egyptian size", async () => {
    const req = {
      body: {
        title: "تيشيرت بولو قطن مصري",
        category: "tshirt",
        height: "185",
        weight: "95", // BMI ~ 27.7 => L / XL
      },
    } as Request;
    const res = createMockResponse();

    await getProductAiInsights(req, res);

    const callArgs = (res.json as any).mock.calls[0][0];
    expect(callArgs.success).toBe(true);
    expect(callArgs.data.fitAdvisor.recommendedSize).toBe("L");
  });

  it("should provide specialized Egyptian cotton care guidelines for pure cotton items", async () => {
    const req = {
      body: {
        title: "قميص قطن جيزة 94",
        material: "قطن مصري 100%",
        price: 550,
      },
    } as Request;
    const res = createMockResponse();

    await getProductAiInsights(req, res);

    const responseData = (res.json as any).mock.calls[0][0].data;
    expect(responseData.fabricCare.wash).toContain("30° مئوية");
    expect(responseData.fabricCare.wash).toContain("الصبغات القطنية المصرية");
  });

  it("should reject empty query to AI market assistant with HTTP 400", async () => {
    const req = { body: { query: "" } } as Request;
    const res = createMockResponse();

    await queryMarketAssistant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "يرجى كتابة سؤال أو استفسار للذكاء الاصطناعي" })
    );
  });

  it("should return resilient domain insights on sales & October/Menoufia demand when external API is offline", async () => {
    const req = {
      body: {
        query: "ما هي المنتجات الأعلى مبيعاً في 6 أكتوبر والمنوفية؟",
        storeName: "Town Team",
        city: "مدينة 6 أكتوبر",
      },
    } as Request;
    const res = createMockResponse();

    await queryMarketAssistant(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const result = (res.json as any).mock.calls[0][0];
    expect(result.data.reply).toContain("6 أكتوبر");
    expect(result.data.reply).toContain("المنوفية");
    expect(result.data.source).toBe("egypt-fashion-ai-engine");
  });

  it("should process AI virtual try-on with body metrics, skin tone, and complete outfit bundle", async () => {
    const req = {
      body: {
        productTitle: "Town Team Polo",
        productImage: "https://example.com/polo.jpg",
        height: "178",
        weight: "76",
        skinTone: "wheat",
        fitPreference: "regular",
      },
    } as Request;
    const res = createMockResponse();

    await virtualTryOn(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const callArgs = (res.json as any).mock.calls[0][0];
    expect(callArgs.success).toBe(true);
    expect(callArgs.data.recommendedSize).toBe("L");
    expect(callArgs.data.fitScore).toBeDefined();
    expect(callArgs.data.completeOutfitLook).toHaveLength(3);
    expect(callArgs.data.skinToneHarmony.toneNameAr).toContain("قمحية");
  });

  it("should support slim fit preference and calculate accurate BMI category in virtual try-on", async () => {
    const req = {
      body: {
        productTitle: "Classic Cotton Shirt",
        height: "185",
        weight: "70",
        fitPreference: "slim",
        skinTone: "fair",
      },
    } as Request;
    const res = createMockResponse();

    await virtualTryOn(req, res);

    const callArgs = (res.json as any).mock.calls[0][0];
    expect(callArgs.success).toBe(true);
    expect(callArgs.data.recommendedSize).toBe("M");
    expect(callArgs.data.bodyMetrics.bmiCategory).toContain("متناسق");
    expect(callArgs.data.skinToneHarmony.contrastRating).toContain("98%");
  });
});
