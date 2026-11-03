import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  CrownIcon,
  UserIcon,
  StoreIcon,
  TruckIcon,
  PackageIcon,
} from "./Icons";

export const AdminFloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const currentRole = localStorage.getItem("user_role");
  const isSuperAdmin =
    localStorage.getItem("original_admin") === "true" ||
    currentRole === "admin";

  // يظهر الزر فقط إذا كان المستخدم أدمن رئيسي وهو خارج صفحات الأدمن لتمكينه من العودة والتنقل
  if (!isSuperAdmin || location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleSwitchToAdmin = () => {
    localStorage.setItem("user_role", "admin");
    navigate("/admin/dashboard");
  };

  const handleSwitchRole = (role: string, targetPath: string) => {
    localStorage.setItem("user_role", role);
    navigate(targetPath);
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed bottom-6 left-6 z-50 bg-slate-900/95 border-2 border-amber-400 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md transition"
    >
      <div className="flex flex-col">
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

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleSwitchRole("user", "/customer/products")}
          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
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
          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
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
          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
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
          className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
            currentRole === "collector"
              ? "bg-emerald-500 text-white"
              : "bg-slate-800 hover:bg-emerald-600 text-slate-200"
          }`}
          title="معاينة المُجمّع"
        >
          <PackageIcon className="w-3.5 h-3.5" />
          <span>{isRtl ? "مُجمّع" : "Collector"}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminFloatingWidget;
