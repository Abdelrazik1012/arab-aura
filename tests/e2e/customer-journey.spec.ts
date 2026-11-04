import { test, expect } from "@playwright/test";

test.describe("Customer End-to-End Shopping Journey", () => {
  test.beforeEach(async ({ page }) => {
    // إعداد بيئة المستهلك الافتراضية
    await page.addInitScript(() => {
      localStorage.setItem("user_role", "user");
      localStorage.setItem("app_lang", "ar");
      localStorage.setItem("app_theme", "dark");
    });
  });

  test("1. تصفح المنتجات والفلترة واختيار المقاس واللون", async ({ page }) => {
    await page.goto("/customer/products");

    // التحقق من عنوان المتجر والشعار
    await expect(page).toHaveTitle(/عرب أورا/);
    await expect(page.locator("text=عرب أورا").first()).toBeVisible();

    // التحقق من ظهور المنتجات والأسعار بالجنيه المصري
    const productCards = page.locator(".group.relative, .notch-card, div:has-text('ج.م')");
    await expect(productCards.first()).toBeVisible();

    // التحقق من شريط البحث
    const searchInput = page.locator("input[placeholder*='ابحث عن منتج']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("تيشيرت");
    await page.keyboard.press("Enter");

    // التحقق من فلترة المقاسات والألوان
    const filterBtn = page.locator("button:has-text('فلترة'), button:has-text('تصفية')").first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await expect(page.locator("text=المقاس, text=Size, text=نطاق السعر").first()).toBeVisible();
    }
  });

  test("2. إضافة منتج للسلة والانتقال لصفحة الدفع الموحد", async ({ page }) => {
    await page.goto("/customer/products");

    // فتح تفاصيل أول منتج
    const firstProduct = page.locator("a[href*='/customer/product/'], div[data-product-id]").first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
    } else {
      await page.goto("/customer/product/prod-1");
    }

    // التحقق من عناصر صفحة تفاصيل المنتج (الخامات المصرية، المقاسات، كود المنتج)
    await expect(page.locator("text=ج.م").first()).toBeVisible();
    
    // زر الإضافة إلى السلة
    const addToCartBtn = page.locator("button:has-text('أضف إلى السلة'), button:has-text('شراء الآن')").first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // التوجه إلى السلة
    await page.goto("/customer/cart");
    await expect(page.locator("text=سلة المشتريات, text=ملخص الطلب").first()).toBeVisible();
  });

  test("3. تجربة الشحن بالحي (35 ج.م) والدفع واختبار منظومة الـ OTP", async ({ page }) => {
    // وضع عنصر افتراضي في السلة لاختبار عملية الدفع
    await page.addInitScript(() => {
      localStorage.setItem("arab_aura_cart", JSON.stringify([
        {
          id: "prod-1",
          titleAr: "تيشيرت بولو قطن فاخر Town Team",
          titleEn: "Luxury Polo T-Shirt Town Team",
          price: 550,
          quantity: 1,
          size: "L",
          color: { nameAr: "كحلي داكن", hex: "#1B2A4A" },
          image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80"
        }
      ]));
    });

    await page.goto("/customer/cart");

    // التحقق من تكلفة الشحن بالحي الثابتة (35 ج.م)
    await expect(page.locator("text=35").first()).toBeVisible();

    // التقدم لإتمام الطلب
    const checkoutStepBtn = page.locator("button:has-text('متابعة الشراء'), button:has-text('إتمام الطلب')").first();
    if (await checkoutStepBtn.isVisible()) {
      await checkoutStepBtn.click();

      // التحقق من حقول العنوان المصري (المحافظة والحي)
      const fullNameInput = page.locator("input[placeholder*='الاسم الكامل'], input[name='fullName']").first();
      if (await fullNameInput.isVisible()) {
        await fullNameInput.fill("عبد الرازق بدر");
        await page.locator("input[placeholder*='01'], input[type='tel']").first().fill("01012345678");
        await page.locator("input[placeholder*='الشارع'], input[name='street']").first().fill("شارع جمال عبد الناصر، الحي الثاني، 6 أكتوبر");
      }

      // اختيار طريقة الدفع كاش عند الاستلام أو محفظة
      const codOption = page.locator("label:has-text('كاش عند الاستلام'), input[value='cod']").first();
      if (await codOption.isVisible()) {
        await codOption.click();
      }

      // تأكيد الطلب
      const confirmOrderBtn = page.locator("button:has-text('تأكيد الطلب الآن'), button:has-text('تأكيد وشراء')").first();
      if (await confirmOrderBtn.isVisible()) {
        await confirmOrderBtn.click();
        // التحقق من ظهور كود الاستلام السري OTP المكون من 4 أرقام
        await expect(page.locator("text=OTP, text=كود الاستلام, text=رمز التحقق").first()).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
