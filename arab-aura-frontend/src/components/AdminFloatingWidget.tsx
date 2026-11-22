import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { authService } from "../services/authService";
import {
  CrownIcon,
  UserIcon,
  StoreIcon,
  TruckIcon,
  PackageIcon,
  LogoutIcon,
} from "./Icons";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/register-form",
  "/forgot-password",
  "/about",
];

export const AdminFloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const [, setTick] = useState(0);

  useEffect(() => {
    const syncState = () => setTick((t) => t + 1);
    window.addEventListener("auth-state-changed", syncState);
    window.addEventListener("storage", syncState);
    return () => {
      window.removeEventListener("auth-state-changed", syncState);
      window.removeEventListener("storage", syncState);
    };
  }, []);

  const currentRole = localStorage.getItem("user_role");
  const isOriginalAdmin = localStorage.getItem("original_admin") === "true";
  const isLoggedIn = Boolean(currentRole);
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);

  // 🛡️ يظهر الشريط فقط للأدمن الرئيسي المُسجّل دخوله، وخارج الشاشات العامة وشاشات الأدمن
  if (
    !isLoggedIn ||
    !isOriginalAdmin ||
    isPublicPage ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  const getSavedAdminPreset = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("admin_profile") || "{}");
      return {
        role: "admin",
        name: saved.name || "عبد الرازق بدر (المدير التنفيذي)",
        email: saved.email || "admin@aura.com",
        username: saved.username || "admin",
        phone: saved.phone || "01092242607",
        avatar: saved.avatar || "",
        nationalId: saved.nationalId || "",
        birthDate: saved.birthDate || "",
        path: "/admin/dashboard",
      };
    } catch {
      return {
        role: "admin",
        name: "عبد الرازق بدر (المدير التنفيذي)",
        email: "admin@aura.com",
        username: "admin",
        phone: "01092242607",
        avatar: "",
        nationalId: "",
        birthDate: "",
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

  const handleSwitchToAdmin = () => {
    const preset = getSavedAdminPreset();
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
    navigate(preset.path);
  };

  const handleSwitchRole = (role: string, targetPath: string) => {
    const preset = ROLE_PRESETS[role] || ROLE_PRESETS.user;
    localStorage.setItem("user_role", preset.role);
    localStorage.setItem("user_name", preset.name);
    localStorage.setItem("user_email", preset.email);
    localStorage.setItem("user_phone", preset.phone);
    localStorage.setItem("user_data", JSON.stringify(preset));
    navigate(targetPath);
  };

  const handleExitAdminMode = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed bottom-16 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-6 z-50 bg-slate-900/95 border-2 border-amber-400 text-white px-3 py-2.5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between sm:justify-start gap-2.5 backdrop-blur-md transition max-w-full"
    >
      <div className="flex flex-col shrink-0">
        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
          <CrownIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{isRtl ? "وضع الأدمن" : "Admin Mode"}</span>
        </span>
        <button
          onClick={handleSwitchToAdmin}
          className="text-xs font-black text-rose-400 hover:text-rose-300 underline cursor-pointer text-start"
        >
          {isRtl ? "← عودة للداشبورد" : "← Back to Admin"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => handleSwitchRole("user", "/customer/products")}
          className={`px-2 py-1 text-[11px] sm:text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
            currentRole === "user"
              ? "bg-cyan-500 text-white"
              : "bg-slate-800 hover:bg-cyan-600 text-slate-200"
          }`}
          title="معاينة المستهلك"
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>{isRtl ? "مستهلك" : "User"}</span>
        </button>

        <button
          onClick={() => handleSwitchRole("seller", "/seller/dashboard")}
          className={`px-2 py-1 text-[11px] sm:text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
            currentRole === "seller"
              ? "bg-amber-500 text-white"
              : "bg-slate-800 hover:bg-amber-600 text-slate-200"
          }`}
          title="معاينة البائع"
        >
          <StoreIcon className="w-3.5 h-3.5" />
          <span>{isRtl ? "بائع" : "Seller"}</span>
        </button>

        <button
          onClick={() => handleSwitchRole("driver", "/driver/dashboard")}
          className={`px-2 py-1 text-[11px] sm:text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
            currentRole === "driver"
              ? "bg-blue-500 text-white"
              : "bg-slate-800 hover:bg-blue-600 text-slate-200"
          }`}
          title="معاينة السائق"
        >
          <TruckIcon className="w-3.5 h-3.5" />
          <span>{isRtl ? "سائق" : "Driver"}</span>
        </button>

        <button
          onClick={() => handleSwitchRole("collector", "/collector/dashboard")}
          className={`px-2 py-1 text-[11px] sm:text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
            currentRole === "collector"
              ? "bg-emerald-500 text-white"
              : "bg-slate-800 hover:bg-emerald-600 text-slate-200"
          }`}
          title="معاينة المُجمّع"
        >
          <PackageIcon className="w-3.5 h-3.5" />
          <span>{isRtl ? "مُجمّع" : "Collector"}</span>
        </button>

        <button
          onClick={handleExitAdminMode}
          className="px-2 py-1 text-[11px] sm:text-xs rounded-lg font-black bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer flex items-center gap-1"
          title={isRtl ? "تسجيل الخروج وإغلاق وضع الأدمن" : "Logout & Exit Admin Mode"}
        >
          <LogoutIcon className="w-3.5 h-3.5" />
          <span>{isRtl ? "خروج" : "Exit"}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminFloatingWidget;
