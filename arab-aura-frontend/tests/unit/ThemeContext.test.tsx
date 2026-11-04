// tests/unit/ThemeContext.test.tsx
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../src/context/ThemeContext";

const TestThemeComponent: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-status">{isDarkMode ? "dark" : "light"}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe("ThemeContext Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("should initialize with default dark modern theme when localStorage is empty", () => {
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-status").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should toggle to light mode, persist in localStorage, and remove html dark class", () => {
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByTestId("toggle-btn");
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId("theme-status").textContent).toBe("light");
    expect(localStorage.getItem("app_theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should toggle back to dark mode upon second click", () => {
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByTestId("toggle-btn");
    fireEvent.click(toggleBtn); // switches to light
    fireEvent.click(toggleBtn); // switches back to dark

    expect(screen.getByTestId("theme-status").textContent).toBe("dark");
    expect(localStorage.getItem("app_theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
