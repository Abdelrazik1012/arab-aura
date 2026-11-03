import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";
import { LogoutIcon, SunIcon, MoonIcon } from "../components/Icons";

export const CollectorLayout: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const isRtl = lang === "ar";

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const t = {
    title: isRtl ? "مركز عمليات المُجمّع" : "Collector Operations Center",
    dashboard: isRtl ? "لوحة التحكم" : "Dashboard",
    map: isRtl ? "خريطة النطاق" : "Zone Map",
    orders: isRtl ? "الطلبات المتاحة" : "Available Orders",
    packages: isRtl ? "الحزم والشحن" : "Packages & Shipping",
    profile: isRtl ? "الملف الشخصي" : "Profile",
    logout: isRtl ? "خروج" : "Logout",
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-black"
      }`}
    >
      {/* 🔹 شريط التنقل العلوي للمُجمّع */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo showText={true} />
            <span
              className={`text-xs font-black px-3 py-1 rounded-lg border hidden md:inline-block ${
                isDarkMode
                  ? "bg-slate-800 text-indigo-400 border-slate-700"
                  : "bg-indigo-50 text-indigo-950 border-indigo-200"
              }`}
            >
              {t.title}
            </span>
          </div>

          {/* روابط التنقل للشاشات الكبيرة */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-black">
            <button
              onClick={() => navigate("/collector/dashboard")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                window.location.pathname.includes("dashboard")
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "hover:bg-slate-800 text-white"
                    : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => navigate("/collector/map")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                window.location.pathname.includes("map")
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "hover:bg-slate-800 text-white"
                    : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.map}
            </button>
            <button
              onClick={() => navigate("/collector/orders")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                window.location.pathname.includes("orders")
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "hover:bg-slate-800 text-white"
                    : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.orders}
            </button>
            <button
              onClick={() => navigate("/collector/packages")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                window.location.pathname.includes("packages")
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "hover:bg-slate-800 text-white"
                    : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.packages}
            </button>
            <button
              onClick={() => navigate("/collector/profile")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                window.location.pathname.includes("profile")
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "hover:bg-slate-800 text-white"
                    : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.profile}
            </button>
          </nav>

          {/* الأزرار والإعدادات */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-amber-400"
                  : "bg-white border-slate-300 text-black hover:bg-slate-100"
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  : "bg-white border-slate-300 text-black hover:bg-slate-100"
              }`}
            >
              {isRtl ? "English" : "عربي"}
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* شريط التنقل السفلي/المصغر للشاشات الصغيرة والمتنقلة */}
      <div
        className={`lg:hidden border-b px-4 py-2.5 flex items-center justify-around text-xs font-black ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-black"
        }`}
      >
        <button
          onClick={() => navigate("/collector/dashboard")}
          className="cursor-pointer"
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => navigate("/collector/map")}
          className="cursor-pointer"
        >
          {t.map}
        </button>
        <button
          onClick={() => navigate("/collector/orders")}
          className="cursor-pointer"
        >
          {t.orders}
        </button>
        <button
          onClick={() => navigate("/collector/packages")}
          className="cursor-pointer"
        >
          {t.packages}
        </button>
        <button
          onClick={() => navigate("/collector/profile")}
          className="cursor-pointer"
        >
          {t.profile}
        </button>
      </div>

      {/* محتوى الصفحات الفرعية (Outlet) */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CollectorLayout;
