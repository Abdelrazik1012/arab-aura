// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("app_theme") || localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // الوضع الافتراضي للمنصة هو الداكن العصري
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("app_theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("app_theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTheme = (theme: "dark" | "light") => {
    setIsDarkMode(theme === "dark");
  };

  const theme = isDarkMode ? "dark" : "light";

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
