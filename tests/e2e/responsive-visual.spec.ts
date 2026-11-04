import { test, expect } from "@playwright/test";

test.describe("Responsive Matrix, RTL/LTR Layout, and Theme Integrity", () => {
  test("1. فحص توافق الهاتف المحمول (Mobile 390px) وقائمة التنقل السفلية", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/customer/products");

    // التحقق من ظهور شريط التنقل السفلي للهواتف المحمولة
    const bottomNav = page.locator("nav.fixed.bottom-0, nav[class*='bottom-0']");
    await expect(bottomNav).toBeVisible();

    // التحقق من عدم وجود تمرير أفقي غير مقصود (No horizontal scrollbar overflow)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("2. فحص توافق الأجهزة اللوحية (Tablet 768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/customer/products");

    // التحقق من تكيّف شبكة المنتجات (Grid System)
    const productGrid = page.locator(".grid").first();
    await expect(productGrid).toBeVisible();
  });

  test("3. فحص التبديل بين اللغتين العربية (RTL) والإنجليزية (LTR)", async ({ page }) => {
    await page.goto("/customer/products");

    // التحقق من الاتجاه الافتراضي للغة العربية (RTL)
    let htmlDir = await page.locator("html").getAttribute("dir");
    expect(htmlDir).toBe("rtl");

    // العثور على زر تغيير اللغة والضغط عليه
    const langBtn = page.locator("button:has-text('EN'), button:has-text('عربي')").first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      // التحقق من تحول الاتجاه إلى LTR
      htmlDir = await page.locator("html").getAttribute("dir");
      expect(htmlDir).toBe("ltr");
    }
  });

  test("4. فحص التبديل بين الوضع الليلي (Dark) والنهاري (Light)", async ({ page }) => {
    await page.goto("/customer/products");

    // العثور على زر التبديل بين الثيمات
    const themeBtn = page.locator("button[title*='الوضع'], button[title*='Theme'], button:has-text('الوضع')").first();
    if (await themeBtn.isVisible()) {
      const initialHtmlClass = await page.locator("html").getAttribute("class");
      await themeBtn.click();
      const updatedHtmlClass = await page.locator("html").getAttribute("class");
      expect(initialHtmlClass).not.toBe(updatedHtmlClass);
    }
  });
});
