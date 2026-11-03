import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";
import { SunIcon, MoonIcon } from "../components/Icons";

type RoleType = "user" | "seller" | "driver" | "collector" | null;

const RegisterRoleScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);

  const t = {
    ar: {
      headerTitle: "إنشاء حساب",
      loginBtn: "دخول",
      slogan: "كل البراندات في مكان واحد",
      nextBtn: "التالي",
      selectBtn: "إختر",
      selectedBtn: "تم الاختيار ✓",
      roles: [
        { id: "user" as RoleType, title: "حساب شخصي" },
        { id: "seller" as RoleType, title: "حساب بائع" },
        { id: "driver" as RoleType, title: "حساب سائق" },
        { id: "collector" as RoleType, title: "حساب مجمّع" },
      ],
    },
    en: {
      headerTitle: "Create Account",
      loginBtn: "Login",
      slogan: "All brands in one place",
      nextBtn: "Next",
      selectBtn: "Select",
      selectedBtn: "Selected ✓",
      roles: [
        { id: "user" as RoleType, title: "Personal Account" },
        { id: "seller" as RoleType, title: "Seller Account" },
        { id: "driver" as RoleType, title: "Driver Account" },
        { id: "collector" as RoleType, title: "Collector Account" },
      ],
    },
  };

  const currentData = t[lang];

  const handleNext = () => {
    if (selectedRole) {
      navigate(`/register-form?role=${selectedRole}`);
    }
  };

  const renderRoleIcon = (roleId: RoleType) => {
    switch (roleId) {
      case "user":
        return (
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        );
      case "seller":
        return (
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 6H6v-4h6v4z" />
          </svg>
        );
      case "driver":
        return (
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        );
      case "collector":
        return (
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a3 3 0 0 1 3 3c0 .74-.27 1.42-.72 1.95L15 8h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h4l.72-1.05A2.99 2.99 0 0 1 9 5a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1c0 .55.45 1 1 1s1-.45 1-1a1 1 0 0 0-1-1zm-3 8v5h2v-5H9zm4 0v5h2v-5h-2zm-8-2v9h14v-9H5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-500 overflow-x-hidden ${
        isDarkMode
          ? "bg-[#0B0F19] text-[#F8FAFC]"
          : "bg-[#FDFBF7] text-[#2A363D]"
      }`}
    >
      <header
        className={`px-4 md:px-8 py-3 flex flex-wrap gap-2 justify-between items-center shadow-md border-b transition-colors duration-500 ${
          isDarkMode
            ? "bg-[#131C2E] border-cyan-500/20 text-white"
            : "bg-[#41535D] text-white"
        }`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <BrandLogo />
          <span className="text-xs font-light text-cyan-100 hidden md:inline">
            {currentData.slogan}
          </span>
        </div>

        <h1 className="text-base sm:text-lg md:text-xl font-black text-center order-first w-full md:w-auto md:order-none">
          {currentData.headerTitle}
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className={`text-[11px] sm:text-xs px-3 py-1.5 rounded-full font-bold transition border cursor-pointer ${
              isDarkMode
                ? "bg-[#1E293B] text-slate-200 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-xs"
            }`}
          >
            {lang === "ar" ? "English" : "عربي"}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`text-[11px] sm:text-xs p-1.5 px-3 rounded-full transition border cursor-pointer flex items-center gap-1.5 ${
              isDarkMode
                ? "bg-[#1E293B] text-amber-400 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs"
            }`}
          >
            {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            <span className="text-[11px] font-bold">{isDarkMode ? "فاتح" : "داكن"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className={`px-3 sm:px-4 py-1 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer ${
              isDarkMode
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "bg-white text-[#41535D]"
            }`}
          >
            {currentData.loginBtn}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full my-auto">
          {currentData.roles.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 cursor-pointer shadow-md ${
                  isSelected
                    ? isDarkMode
                      ? "border-amber-400 bg-[#1A263D] ring-2 ring-amber-400/40 scale-[1.02]"
                      : "border-amber-500 bg-white ring-2 ring-amber-400/30 scale-[1.02]"
                    : isDarkMode
                      ? "border-gray-800 bg-[#131C2E] text-gray-300 hover:border-amber-400/40"
                      : "border-gray-200 bg-white text-[#41535D] hover:border-amber-400/50"
                }`}
                style={{ minHeight: "220px" }}
              >
                <div
                  className={`mt-2 sm:mt-4 transition-all duration-300 ${
                    isSelected
                      ? "text-amber-400 scale-110"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-[#41535D]"
                  }`}
                >
                  {renderRoleIcon(role.id)}
                </div>

                <h3
                  className={`text-base sm:text-lg font-bold my-2 sm:my-3 text-center ${
                    isSelected
                      ? "text-amber-400"
                      : isDarkMode
                        ? "text-gray-200"
                        : "text-[#41535D]"
                  }`}
                >
                  {role.title}
                </h3>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRole(role.id);
                  }}
                  className={`w-full py-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-amber-400 hover:bg-amber-500 text-black font-black shadow-md"
                      : isDarkMode
                        ? "bg-[#1E293B] text-gray-300 border border-gray-700"
                        : "bg-[#41535D] text-white"
                  }`}
                >
                  {isSelected ? currentData.selectedBtn : currentData.selectBtn}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 w-full flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedRole}
            className={`w-full sm:w-auto px-12 py-3 rounded-full font-black text-base sm:text-lg transition-all duration-300 shadow-xl ${
              selectedRole
                ? isDarkMode
                  ? "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20 cursor-pointer"
                  : "bg-[#387B8A] hover:bg-[#2A5E6A] text-white cursor-pointer"
                : isDarkMode
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
            }`}
          >
            {currentData.nextBtn}
          </button>
        </div>
      </main>

      <footer className="text-center py-2.5 text-[11px] sm:text-xs font-semibold text-gray-500 border-t border-gray-800/60">
        © 2026 3ARB AURA - جميع الحقوق محفوظة لمشروع التخرج.
      </footer>
    </div>
  );
};

export default RegisterRoleScreen;
