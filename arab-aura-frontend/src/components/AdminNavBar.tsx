import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import BrandLogo from "./BrandLogo";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  BarChartIcon,
  PackageIcon,
  UsersIcon,
  DocumentTextIcon,
} from "./Icons";

interface AdminNavBarProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({
  isDarkMode = true,
  toggleTheme,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLanguage } = useLanguage();
  const isRtl = lang === "ar";

  const currentRole = localStorage.getItem("user_role") || "admin";

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    if (currentRole === "admin" || !localStorage.getItem("original_admin")) {
      localStorage.setItem("original_admin", "true");
    }
    localStorage.setItem("user_role", selectedRole);

    switch (selectedRole) {
      case "user":
        navigate("/customer/products");
        break;
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "driver":
        navigate("/driver/dashboard");
        break;
      case "collector":
        navigate("/collector/dashboard");
        break;
      default:
        navigate("/admin/dashboard");
        break;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActive = (path: string) => location.pathname === path;

  const t = {
    superAdmin: isRtl ? "وضع الأدمن الشامل" : "Super Admin Mode",
    switchRole: isRtl ? "تبديل الحساب:" : "Role:",
    dashboard: isRtl ? "الرئيسية" : "Dashboard",
    orders: isRtl ? "الطلبات" : "Orders",
    users: isRtl ? "المستخدمين" : "Users",
    approvals: isRtl ? "العقود والاعتمادات" : "Approvals",
    logout: isRtl ? "خروج" : "Logout",
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo & Super Admin Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="cursor-pointer"
              onClick={() => navigate("/admin/dashboard")}
            >
              <BrandLogo showText={true} />
            </div>
            <span
              className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg border transition ${
                isDarkMode
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <ShieldCheckIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.superAdmin}</span>
            </span>
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <label
              className={`text-xs font-black hidden lg:inline-block ${
                isDarkMode ? "text-amber-400" : "text-amber-600"
              }`}
            >
              {t.switchRole}
            </label>
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black outline-none cursor-pointer transition ${
                isDarkMode
                  ? "bg-slate-950 border-amber-500/50 text-amber-400 hover:border-amber-400"
                  : "bg-amber-50 border-amber-300 text-amber-900 hover:border-amber-500"
              }`}
            >
              <option value="admin">Admin / الأدمن الرئيسي</option>
              <option value="user">Customer / مستهلك</option>
              <option value="seller">Seller / بائع</option>
              <option value="driver">Driver / سائق</option>
              <option value="collector">Collector / مُجمّع</option>
            </select>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-black">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                isActive("/admin/dashboard")
                  ? "bg-rose-600 text-white shadow-xs"
                  : isDarkMode
                    ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => navigate("/admin/orders")}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                isActive("/admin/orders")
                  ? "bg-rose-600 text-white shadow-xs"
                  : isDarkMode
                    ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {t.orders}
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                isActive("/admin/users")
                  ? "bg-rose-600 text-white shadow-xs"
                  : isDarkMode
                    ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {t.users}
            </button>
            <button
              onClick={() => navigate("/admin/approvals")}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer ${
                isActive("/admin/approvals")
                  ? "bg-rose-600 text-white shadow-xs"
                  : isDarkMode
                    ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {t.approvals}
            </button>
          </nav>

          {/* Action Buttons: Dark mode, Lang toggle, Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border text-sm transition cursor-pointer flex items-center justify-center ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-700" />}
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className={`px-3 py-1.5 border text-xs font-black rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                  : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800"
              }`}
            >
              {isRtl ? "English" : "عربي"}
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-4 py-2.5 flex items-center justify-around text-xs font-black transition-colors ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-lg"
        }`}
      >
        <button
          onClick={() => navigate("/admin/dashboard")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            isActive("/admin/dashboard")
              ? "text-rose-500"
              : isDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <BarChartIcon className="w-4 h-4" />
          <span>{t.dashboard}</span>
        </button>
        <button
          onClick={() => navigate("/admin/orders")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            isActive("/admin/orders")
              ? "text-rose-500"
              : isDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          <span>{t.orders}</span>
        </button>
        <button
          onClick={() => navigate("/admin/users")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            isActive("/admin/users")
              ? "text-rose-500"
              : isDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <UsersIcon className="w-4 h-4" />
          <span>{t.users}</span>
        </button>
        <button
          onClick={() => navigate("/admin/approvals")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            isActive("/admin/approvals")
              ? "text-rose-500"
              : isDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <DocumentTextIcon className="w-4 h-4" />
          <span>{t.approvals}</span>
        </button>
      </div>
    </>
  );
};

export default AdminNavBar;
