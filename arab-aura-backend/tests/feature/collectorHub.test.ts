// tests/feature/collectorHub.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/server";
import { generateToken } from "../../src/utils/jwt";
import { Order } from "../../src/models/Order";
import { User } from "../../src/models/User";
import { Hub } from "../../src/models/Hub";

describe("Collector & Micro-Hub Logistics Workflow Tests", () => {
  const collectorToken = generateToken({
    id: "collector-oct-555",
    email: "collector@aura.com",
    role: "collector",
    name: "محمود حسن (مشرف مركز أكتوبر)",
  });

  const customerToken = generateToken({
    id: "customer-101",
    email: "customer@aura.com",
    role: "customer",
    name: "أحمد عبد العزيز",
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. should fetch hub performance metrics for collector", async () => {
    const res = await request(app)
      .get("/api/hubs/metrics")
      .set("Authorization", `Bearer ${collectorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalHandled");
    expect(res.body.data).toHaveProperty("receivedInHub");
    expect(res.body.data).toHaveProperty("consolidationSavings");
  });

  it("2. should allow collector to retrieve all hub orders", async () => {
    const res = await request(app)
      .get("/api/hubs/collector/orders")
      .set("Authorization", `Bearer ${collectorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("3. should successfully consolidate multiple orders into a smart batch package", async () => {
    vi.spyOn(Order, "updateMany").mockResolvedValue({
      acknowledged: true,
      matchedCount: 2,
      modifiedCount: 2,
      upsertedCount: 0,
      upsertedId: null,
    } as any);

    const res = await request(app)
      .post("/api/hubs/consolidate")
      .set("Authorization", `Bearer ${collectorToken}`)
      .send({
        packageId: "PKG-TEST-OCT-99",
        orderIds: ["ORD-9824", "ORD-9821"],
        targetZone: "6 أكتوبر والشيخ زايد",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.packageId).toBe("PKG-TEST-OCT-99");
    expect(res.body.data.status).toBe("collected_in_hub");
  });

  it("4. should reject consolidation if packageId or orderIds are missing", async () => {
    const res = await request(app)
      .post("/api/hubs/consolidate")
      .set("Authorization", `Bearer ${collectorToken}`)
      .send({
        orderIds: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("5. should reject non-collector and non-admin users from consolidating packages", async () => {
    const res = await request(app)
      .post("/api/hubs/consolidate")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        packageId: "PKG-HACK-01",
        orderIds: ["ORD-9824"],
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
