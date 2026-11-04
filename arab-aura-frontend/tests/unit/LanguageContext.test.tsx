// tests/unit/LanguageContext.test.tsx
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "../../src/context/LanguageContext";

const TestLanguageComponent: React.FC = () => {
  const { lang, toggleLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="lang-status">{lang}</span>
      <button data-testid="lang-btn" onClick={toggleLanguage}>
        Toggle Language
      </button>
    </div>
  );
};

describe("LanguageContext & RTL/LTR Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("should default to Arabic (ar) with RTL direction", () => {
    render(
      <LanguageProvider>
        <TestLanguageComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("lang-status").textContent).toBe("ar");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    expect(document.documentElement.getAttribute("lang")).toBe("ar");
  });

  it("should toggle to English (en) with LTR direction and save preference", () => {
    render(
      <LanguageProvider>
        <TestLanguageComponent />
      </LanguageProvider>
    );

    const toggleBtn = screen.getByTestId("lang-btn");
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId("lang-status").textContent).toBe("en");
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(localStorage.getItem("app_lang")).toBe("en");
  });
});
