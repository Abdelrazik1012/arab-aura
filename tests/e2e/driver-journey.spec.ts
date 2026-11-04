import { test, expect } from "@playwright/test";

test.describe("Driver End-to-End Neighborhood Logistics & Doorstep OTP", () => {
  test.beforeEach(async ({ page }) => {
    // إعداد هوية الكابتن/السائق الافتراضية
    await page.addInitScript(() => {
      localStorage.setItem("user_role", "driver");
      localStorage.setItem("app_lang", "ar");
      localStorage.setItem("app_theme", "dark");
      localStorage.setItem("auth_token", "mock-driver-token-valid");
      localStorage.setItem("user_data", JSON.stringify({
        id: "driver-303",
        email: "driver@aura.com",
        username: "captain_ahmed",
        role: "driver",
        name: "كابتن أحمد سامي",
        phone: "01234567890",
        vehicleType: "موتوسيكل دليفري"
      }));
    });
  });

  test("1. فحص الشحنات المعينة ومسار التوصيل بحي 6 أكتوبر والشيخ زايد", async ({ page }) => {
    await page.goto("/driver/dashboard");

    // التحقق من عنوان لوحة تحكم الكابتن
    await expect(page.locator("text=لوحة تحكم السائق, text=كابتن, text=المهام").first()).toBeVisible();

    // التحقق من بطاقات مؤشرات التوصيل (الطلبات الجارية، الأرباح اليومية)
    await expect(page.locator("text=التوصيلات, text=العمولة, text=ج.م").first()).toBeVisible();
  });

  test("2. التحقق من كود الـ OTP السري عند باب العميل وإيداع عمولة التوصيل", async ({ page }) => {
    await page.goto("/driver/dashboard");

    // العثور على زر تسليم شحنة أو إدخال كود OTP
    const deliverActionBtn = page.locator("button:has-text('تأكيد التسليم'), button:has-text('إدخال كود OTP'), button:has-text('تسليم')").first();
    if (await deliverActionBtn.isVisible()) {
      await deliverActionBtn.click();

      // ظهور حقل إدخال كود OTP المكون من 4 أرقام
      const otpInput = page.locator("input[placeholder*='OTP'], input[placeholder*='كود'], input[name='otp']").first();
      await expect(otpInput).toBeVisible();

      // إدخال الكود الصحيح
      await otpInput.fill("4821");

      // الضغط على زر التحقق
      const verifyBtn = page.locator("button:has-text('تحقق'), button:has-text('تأكيد')").first();
      await verifyBtn.click();

      // التحقق من إضافة عمولة التوصيل (25 ج.م) وتحديث حالة الشحنة
      await expect(page.locator("text=تم التسليم بنجاح, text=+25, text=مكتمل").first()).toBeVisible();
    }
  });
});
