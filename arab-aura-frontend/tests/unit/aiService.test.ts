// tests/unit/aiService.test.ts
import { describe, it, expect } from "vitest";
import { analyzeProductForEgyptianConsumer } from "../../src/services/aiService";

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
});
