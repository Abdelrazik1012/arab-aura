import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { authService } from "../services/authService";
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
  UserIcon,
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

  const readAdminDisplay = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      const adminBackup = JSON.parse(localStorage.getItem("admin_profile") || "{}");
      return {
        name:
          localStorage.getItem("user_name") ||
          userData.name ||
          adminBackup.name ||
          "عبد الرازق بدر",
        avatar:
          localStorage.getItem("user_avatar") ||
          userData.avatar ||
          adminBackup.avatar ||
          "",
      };
    } catch {
      return { name: "عبد الرازق بدر", avatar: "" };
    }
  };

  const [adminDisplay, setAdminDisplay] = useState(readAdminDisplay);

  useEffect(() => {
    const syncDisplay = () => setAdminDisplay(readAdminDisplay());
    window.addEventListener("admin-profile-updated", syncDisplay);
    window.addEventListener("auth-state-changed", syncDisplay);
    window.addEventListener("storage", syncDisplay);
    return () => {
      window.removeEventListener("admin-profile-updated", syncDisplay);
      window.removeEventListener("auth-state-changed", syncDisplay);
      window.removeEventListener("storage", syncDisplay);
    };
  }, []);

  const currentRole = localStorage.getItem("user_role") || "admin";

  const getSavedAdminPreset = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("admin_profile") || "{}");
      return {
        role: "admin",
        name: saved.name || "عبد الرازق بدر (المدير التنفيذي)",
        email: saved.email || "admin@aura.com",
        phone: saved.phone || "01092242607",
        avatar: saved.avatar || "",
        path: "/admin/dashboard",
      };
    } catch {
      return {
        role: "admin",
        name: "عبد الرازق بدر (المدير التنفيذي)",
        email: "admin@aura.com",
        phone: "01092242607",
        avatar: "",
        path: "/admin/dashboard",
      };
    }
  };

  const ROLE_PRESETS: Record<
    string,
    { role: string; name: string; email: string; phone: string; avatar?: string; path: string }
  > = {
    admin: getSavedAdminPreset(),
    seller: {
      role: "seller",
      name: "مهندس كريم شريف (Town Team)",
      email: "seller@aura.com",
      phone: "01122334455",
      path: "/seller/dashboard",
    },
    driver: {
      role: "driver",
      name: "الكابتن أحمد محمود",
      email: "driver@aura.com",
      phone: "01092242607",
      path: "/driver/dashboard",
    },
    collector: {
      role: "collector",
      name: "محمود حسن (مُجمّع)",
      email: "collector@aura.com",
      phone: "01233445566",
      path: "/collector/dashboard",
    },
    user: {
      role: "user",
      name: "أحمد عبد العزيز (عميل)",
      email: "customer@aura.com",
      phone: "01012345678",
      path: "/customer/products",
    },
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    if (currentRole === "admin" || !localStorage.getItem("original_admin")) {
      localStorage.setItem("original_admin", "true");
    }

    const preset = ROLE_PRESETS[selectedRole] || ROLE_PRESETS.user;
    localStorage.setItem("user_role", preset.role);
    localStorage.setItem("user_name", preset.name);
    localStorage.setItem("user_email", preset.email);
    localStorage.setItem("user_phone", preset.phone);
    if (preset.avatar) {
      localStorage.setItem("user_avatar", preset.avatar);
    } else {
      localStorage.removeItem("user_avatar");
    }
    localStorage.setItem("user_data", JSON.stringify(preset));
    window.dispatchEvent(new Event("auth-state-changed"));

    navigate(preset.path);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const t = {
    superAdmin: isRtl ? "وضع الأدمن الشامل" : "Super Admin Mode",
    switchRole: isRtl ? "تبديل الحساب:" : "Role:",
    dashboard: isRtl ? "الرئيسية" : "Dashboard",
    orders: isRtl ? "الطلبات" : "Orders",
    users: isRtl ? "المستخدمين" : "Users",
    approvals: isRtl ? "الاعتمادات" : "Approvals",
    profile: isRtl ? "حسابي" : "Profile",
    logout: isRtl ? "خروج" : "Logout",
  };

  const shortName = (adminDisplay.name || "Admin").split(" ").slice(0, 2).join(" ");
  const initials = shortName
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Super Admin Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="cursor-pointer"
              onClick={() => navigate("/admin/dashboard")}
            >
              <BrandLogo showText={true} />
            </div>
            <span
              className={`hidden xl:inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg border transition ${
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
          <div className="flex items-center gap-1.5">
            <label
              className={`text-xs font-black hidden xl:inline-block ${
                isDarkMode ? "text-amber-400" : "text-amber-600"
              }`}
            >
              {t.switchRole}
            </label>
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-black outline-none cursor-pointer transition max-w-[130px] sm:max-w-none ${
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
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
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
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
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
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
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
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
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

          {/* Action Buttons: Profile Pill, Dark mode, Lang toggle, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => navigate("/admin/profile")}
              className={`flex items-center gap-2 ps-1.5 pe-2.5 py-1 rounded-xl border text-xs font-black transition cursor-pointer ${
                isActive("/admin/profile")
                  ? "bg-rose-600 border-rose-500 text-white"
                  : isDarkMode
                    ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200"
              }`}
              title={isRtl ? "الملف الشخصي للأدمن" : "Admin Profile"}
            >
              <div className="w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                {adminDisplay.avatar ? (
                  <img
                    src={adminDisplay.avatar}
                    alt={shortName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <span className="hidden lg:inline max-w-[100px] truncate">{shortName}</span>
            </button>

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
                {isDarkMode ? (
                  <SunIcon className="w-4 h-4 text-amber-400" />
                ) : (
                  <MoonIcon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className={`px-2.5 py-1.5 border text-xs font-black rounded-xl transition cursor-pointer hidden sm:inline-flex ${
                isDarkMode
                  ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                  : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800"
              }`}
            >
              {isRtl ? "EN" : "عربي"}
            </button>

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
              title={t.logout}
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-2 py-2 flex items-center justify-around text-[11px] font-black transition-colors ${
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
        <button
          onClick={() => navigate("/admin/profile")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${
            isActive("/admin/profile")
              ? "text-rose-500"
              : isDarkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{t.profile}</span>
        </button>
      </div>
    </>
  );
};

export default AdminNavBar;
