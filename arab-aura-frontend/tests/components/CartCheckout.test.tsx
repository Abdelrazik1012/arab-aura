// tests/components/CartCheckout.test.tsx
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerCartPage from "../../src/pages/customer/CustomerCartPage";
import { LanguageProvider } from "../../src/context/LanguageContext";
import { ThemeProvider } from "../../src/context/ThemeContext";
import { PlatformProvider } from "../../src/context/PlatformContext";
import { BrowserRouter } from "react-router-dom";

describe("CustomerCartPage & Payment Validation Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("user_wallet_balance", "0");
    localStorage.setItem("user_name", "عميل تجريبي");
    localStorage.setItem("user_phone", "01012345678");
  });

  const renderCartPage = () => {
    return render(
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <PlatformProvider>
              <CustomerCartPage />
            </PlatformProvider>
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    );
  };

  it("should render cart items and display cart title", () => {
    renderCartPage();

    expect(screen.getByText(/عربة التسوق والدفع الذكي/i)).toBeDefined();
    expect(screen.getByText(/تيشيرت بولو/i)).toBeDefined();
  });

  it("should navigate to checkout step when clicking proceed", async () => {
    renderCartPage();

    const proceedBtn = screen.getByText(/متابعة العنوان وطريقة الدفع/i);
    fireEvent.click(proceedBtn);

    await waitFor(() => {
      expect(screen.getByText(/بيانات العنوان المصري/i)).toBeDefined();
      expect(screen.getByText(/اختر وسيلة الدفع المعتمدة/i)).toBeDefined();
    });
  });

  it("should reject checkout if user selects wallet payment but has insufficient wallet balance", async () => {
    renderCartPage();

    // 1. Go to checkout
    const proceedBtn = screen.getByText(/متابعة العنوان وطريقة الدفع/i);
    fireEvent.click(proceedBtn);

    // 2. Select wallet method
    const walletOption = await screen.findByText(/رصيد محفظة عرب أورا الرقمية/i);
    fireEvent.click(walletOption);

    // 3. Click final confirm button
    const confirmBtn = screen.getByRole("button", { name: /تأكيد الطلب/i });
    fireEvent.click(confirmBtn);

    // 4. Assert error message appears
    await waitFor(() => {
      expect(screen.getByText(/رصيد محفظتك الحالي \(0.00 ج.م\) غير كافٍ/i)).toBeDefined();
    });
  });
});
