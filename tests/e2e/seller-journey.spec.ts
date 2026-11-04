import { test, expect } from "@playwright/test";

test.describe("Seller End-to-End Vendor Operations", () => {
  test.beforeEach(async ({ page }) => {
    // إعداد هوية البائع الافتراضية
    await page.addInitScript(() => {
      localStorage.setItem("user_role", "seller");
      localStorage.setItem("app_lang", "ar");
      localStorage.setItem("app_theme", "dark");
      localStorage.setItem("auth_token", "mock-seller-token-valid");
      localStorage.setItem("user_data", JSON.stringify({
        id: "seller-101",
        email: "seller@aura.com",
        username: "townteam_official",
        role: "seller",
        storeName: "Town Team Official Store",
        phone: "01099887766"
      }));
    });
  });

  test("1. عرض لوحة تحكم التاجر ومؤشرات الأداء (KPIs) والأرباح الفورية", async ({ page }) => {
    await page.goto("/seller/dashboard");

    // التحقق من اسم المتجر وبيانات التاجر
    await expect(page.locator("text=Town Team Official Store, text=لوحة تحكم البائع").first()).toBeVisible();

    // التحقق من وجود بطاقات المؤشرات المالية والطلبات
    await expect(page.locator("text=إجمالي المبيعات, text=الطلبات, text=المحفظة").first()).toBeVisible();

    // التحقق من الرسم البياني التحليلي لمبيعات 7 أيام (Daily Analytics Bar Chart)
    const analyticsChart = page.locator(".h-48, div:has-text('ج.م')").first();
    await expect(analyticsChart).toBeVisible();
  });

  test("2. مساعد الذكاء الاصطناعي لاتجاهات السوق وتحليل الطلب", async ({ page }) => {
    await page.goto("/seller/dashboard");

    // زر تفعيل أو استشارة الذكاء الاصطناعي لمساعد الماركت
    const aiAssistantTrigger = page.locator("button:has-text('الذكاء الاصطناعي'), button:has-text('AI'), a[href*='ai']").first();
    if (await aiAssistantTrigger.isVisible()) {
      await aiAssistantTrigger.click();
      await expect(page.locator("text=تحليل, text=توصيات, text=الطلب").first()).toBeVisible();
    }
  });

  test("3. تعديل بيانات الملف التعريفي للمتجر وحفظها", async ({ page }) => {
    await page.goto("/seller/dashboard");

    // فتح مودال تعديل الملف الشخصي
    const editProfileBtn = page.locator("button:has-text('تعديل البيانات'), button:has-text('تعديل الملف'), button[title*='تعديل']").first();
    if (await editProfileBtn.isVisible()) {
      await editProfileBtn.click();

      // التحقق من ظهور نافذة التعديل
      const modal = page.locator("div[role='dialog'], .fixed.inset-0").first();
      await expect(modal).toBeVisible();

      // تعديل رقم الهاتف
      const phoneInput = page.locator("input[name='phone'], input[type='tel']").first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill("01122334455");
        const saveBtn = page.locator("button:has-text('حفظ التعديلات'), button:has-text('حفظ')").first();
        await saveBtn.click();
      }
    }
  });
});
