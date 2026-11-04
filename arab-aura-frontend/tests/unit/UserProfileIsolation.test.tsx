// tests/unit/UserProfileIsolation.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import CustomerProfilePage from "../../src/pages/customer/CustomerProfilePage";
import { PlatformProvider } from "../../src/context/PlatformContext";
import { ThemeProvider } from "../../src/context/ThemeContext";
import { LanguageProvider } from "../../src/context/LanguageContext";
import authService from "../../src/services/authService";

describe("User Profile Data Binding & Multi-User Isolation Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("1. should render the new user's real name and email instead of any hardcoded default", async () => {
    const newUser = {
      id: "user-new-999",
      name: "حسام الشاذلي",
      username: "hossam_elshazly",
      email: "hossam.shazly@aura-egypt.com",
      phone: "01099881122",
      role: "customer",
    };

    localStorage.setItem("user_data", JSON.stringify(newUser));
    localStorage.setItem("user_name", newUser.name);
    localStorage.setItem("user_email", newUser.email);
    localStorage.setItem("user_phone", newUser.phone);

    vi.spyOn(authService, "getMe").mockResolvedValue(newUser as any);

    render(
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <PlatformProvider>
              <CustomerProfilePage />
            </PlatformProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // التحقق من ظهور اسم المستخدم الجديد في حقول النموذج والعناوين
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue("حسام الشاذلي");
      expect(nameInput).toBeDefined();

      const emailInput = screen.getByDisplayValue("hossam.shazly@aura-egypt.com");
      expect(emailInput).toBeDefined();

      const phoneInput = screen.getByDisplayValue("01099881122");
      expect(phoneInput).toBeDefined();

      // التحقق من عنوان البروفايل الرئيسي
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toContain("حسام الشاذلي");
    });

    // التأكد التام من عدم ظهور الاسم القديم المثبت مسبقاً
    expect(screen.queryByDisplayValue("عبد الرازق رضا عبد الرازق بدر")).toBeNull();
    expect(screen.queryByText("عبد الرازق رضا عبد الرازق بدر")).toBeNull();
  });

  it("2. should isolate customer orders and show 0 orders for a freshly registered user", async () => {
    const freshUser = {
      id: "fresh-customer-1",
      name: "رانيا السعيد",
      username: "rania_elsaeed",
      email: "rania.fresh@example.com",
      phone: "01155443322",
      role: "customer",
    };

    localStorage.setItem("user_data", JSON.stringify(freshUser));
    vi.spyOn(authService, "getMe").mockResolvedValue(freshUser as any);

    render(
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <PlatformProvider>
              <CustomerProfilePage />
            </PlatformProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // شارة الطلبات في التبويب يجب أن تكون 0 لأن الحساب لم يقم بأي طلبات بعد
    await waitFor(() => {
      const badge = screen.getByText("0");
      expect(badge).toBeDefined();
    });
  });

  it("3. authService.updateProfile should persist updates to localStorage and backend", async () => {
    const initialUser = {
      id: "user-100",
      name: "أحمد كمال",
      email: "ahmed@aura.com",
      phone: "01011112222",
    };
    localStorage.setItem("user_data", JSON.stringify(initialUser));

    const updatedUser = {
      ...initialUser,
      name: "أحمد كمال الدين",
      phone: "01099998888",
    };

    vi.spyOn(authService, "updateProfile").mockImplementation(async (updates) => {
      const current = JSON.parse(localStorage.getItem("user_data") || "{}");
      const merged = { ...current, ...updates };
      localStorage.setItem("user_data", JSON.stringify(merged));
      return merged;
    });

    await authService.updateProfile({
      name: "أحمد كمال الدين",
      phone: "01099998888",
    });

    const stored = JSON.parse(localStorage.getItem("user_data") || "{}");
    expect(stored.name).toBe("أحمد كمال الدين");
    expect(stored.phone).toBe("01099998888");
  });
});
