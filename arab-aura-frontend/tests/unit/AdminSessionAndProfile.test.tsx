import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "../../src/context/LanguageContext";
import { ThemeProvider } from "../../src/context/ThemeContext";
import AdminFloatingWidget from "../../src/components/AdminFloatingWidget";
import AdminProfilePage from "../../src/pages/admin/AdminProfilePage";
import { authService } from "../../src/services/authService";

describe("Admin Mode Isolation, Logout Cleanup & Admin Profile Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("app_lang", "ar");
    vi.restoreAllMocks();
  });

  it("1. hides AdminFloatingWidget on public routes like Landing (/) and Login (/login)", () => {
    localStorage.setItem("original_admin", "true");
    localStorage.setItem("user_role", "user");

    const { container } = render(
      <ThemeProvider>
        <LanguageProvider>
          <MemoryRouter initialEntries={["/"]}>
            <AdminFloatingWidget />
          </MemoryRouter>
        </LanguageProvider>
      </ThemeProvider>,
    );

    expect(container.textContent).toBe("");
  });

  it("2. shows AdminFloatingWidget on protected role screens for logged-in admin, and hides immediately upon logout", async () => {
    localStorage.setItem("original_admin", "true");
    localStorage.setItem("user_role", "user");
    localStorage.setItem("user_name", "أحمد عبد العزيز");

    render(
      <ThemeProvider>
        <LanguageProvider>
          <MemoryRouter initialEntries={["/customer/products"]}>
            <AdminFloatingWidget />
          </MemoryRouter>
        </LanguageProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText("وضع الأدمن")).toBeTruthy();

    // تسجيل الخروج من زر الخروج في الشريط العائم
    const exitBtn = screen.getByText("خروج");
    fireEvent.click(exitBtn);

    await waitFor(() => {
      expect(localStorage.getItem("original_admin")).toBeNull();
      expect(localStorage.getItem("user_role")).toBeNull();
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(screen.queryByText("وضع الأدمن")).toBeNull();
    });
  });

  it("3. allows Admin to edit personal profile name and fully exit Admin Mode from AdminProfilePage", async () => {
    localStorage.setItem("original_admin", "true");
    localStorage.setItem("user_role", "admin");
    localStorage.setItem("user_name", "عبد الرازق بدر");
    localStorage.setItem("user_email", "admin@aura.com");
    localStorage.setItem("user_phone", "01092242607");

    vi.spyOn(authService, "getMe").mockResolvedValue(null);
    const updateSpy = vi.spyOn(authService, "updateProfile").mockResolvedValue({
      name: "عبد الرازق بدر - المدير العام",
      email: "admin@aura.com",
      phone: "01092242607",
      avatar: "",
    });

    render(
      <ThemeProvider>
        <LanguageProvider>
          <MemoryRouter initialEntries={["/admin/profile"]}>
            <Routes>
              <Route path="/admin/profile" element={<AdminProfilePage />} />
              <Route path="/login" element={<div>Login Screen</div>} />
            </Routes>
          </MemoryRouter>
        </LanguageProvider>
      </ThemeProvider>,
    );

    const nameInput = screen.getByDisplayValue("عبد الرازق بدر");
    fireEvent.change(nameInput, { target: { value: "عبد الرازق بدر - المدير العام" } });

    const saveBtn = screen.getByText("حفظ التعديلات");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "عبد الرازق بدر - المدير العام",
        }),
      );
    });

    // الضغط على زر تسجيل الخروج وإغلاق وضع الأدمن
    const logoutBtn = screen.getByText("تسجيل الخروج الآن");
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(localStorage.getItem("original_admin")).toBeNull();
      expect(localStorage.getItem("user_role")).toBeNull();
      expect(localStorage.getItem("admin_profile")).toBeNull();
      expect(screen.getByText("Login Screen")).toBeTruthy();
    });
  });
});
