// tests/unit/aiService.test.ts
import { describe, it, expect } from "vitest";
import { analyzeProductForEgyptianConsumer, runVirtualTryOn } from "../../src/services/aiService";

describe("Frontend AI Consumer & Vision Service Unit Tests", () => {
  it("should calculate correct Egyptian size recommendation for wide-fit preference", async () => {
    const result = await analyzeProductForEgyptianConsumer({
      productId: "p-1",
      productTitle: "تيشيرت بولو قطن مصري",
      category: "tshirt",
      brandName: "Town Team",
      price: 490,
      height: "182",
      weight: "82",
      age: "26",
      skinTone: "wheat",
      fitPreference: "wide",
    });

    expect(result.recommendedSize).toBe("XL");
    expect(result.sizeConfidence).toBe("96%");
    expect(result.trendingScore).toBeGreaterThanOrEqual(90);
  });

  it("should provide contextual advice for Egyptian wheat skin tone", async () => {
    const result = await analyzeProductForEgyptianConsumer({
      productId: "p-2",
      productTitle: "قميص كاجوال كتان",
      category: "shirt",
      brandName: "Concrete",
      price: 890,
      height: "175",
      weight: "74",
      age: "24",
      skinTone: "wheat",
      fitPreference: "regular",
    });

    expect(result.skinAndToneAdviceAr).toContain("البشرة القمحية");
    expect(result.skinAndToneAdviceAr).toContain("الكحلي");
    expect(result.careInstructionsAr.washing).toContain("القطن");
  });

  it("should generate matched outfit combinations for Egyptian occasions", async () => {
    const result = await analyzeProductForEgyptianConsumer({
      productId: "p-3",
      productTitle: "بنطلون جينز كاجوال سليم فيت",
      category: "pants",
      brandName: "RAVIN",
      price: 690,
      height: "178",
      weight: "72",
      age: "22",
      skinTone: "bronze",
      fitPreference: "slim",
    });

    expect(result.outfits).toBeDefined();
    expect(result.outfits.length).toBeGreaterThan(0);
    expect(result.outfits[0].itemsAr.length).toBeGreaterThan(0);
  });

  it("should generate complete virtual try-on outfit simulation with 3 accessory pieces", async () => {
    const tryOn = await runVirtualTryOn({
      productTitle: "تيشيرت بولو Town Team",
      price: 450,
      height: "178",
      weight: "76",
      skinTone: "wheat",
      fitPreference: "regular",
    });

    expect(tryOn.recommendedSize).toBe("L");
    expect(tryOn.fitScore).toBeDefined();
    expect(tryOn.completeOutfitLook).toHaveLength(3);
    expect(tryOn.totalLookPrice).toBe(2160);
    expect(tryOn.bundleDiscount).toContain("15%");
  });
});
