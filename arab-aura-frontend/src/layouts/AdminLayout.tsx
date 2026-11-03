import React from "react";
import { Outlet } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import AdminNavBar from "../components/AdminNavBar";

export interface AdminLayoutContextType {
  isDarkMode: boolean;
}

export const AdminLayout: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"
      }`}
    >
      <AdminNavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="pb-20 md:pb-8">
        <Outlet context={{ isDarkMode } satisfies AdminLayoutContextType} />
      </div>
    </div>
  );
};

export default AdminLayout;
