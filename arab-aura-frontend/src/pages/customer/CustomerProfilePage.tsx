import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import type { OrderStatus, PlatformOrder } from "../../context/PlatformContext";
import BrandLogo from "../../components/BrandLogo";
import { LeafletJourneyTracker } from "../../components/LeafletJourneyTracker";
import authService from "../../services/authService";
import {
  LogoutIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CameraIcon,
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapIcon,
  MapPinIcon,
  LightningIcon,
  CloseIcon,
  StarIcon,
  ChatIcon,
  StoreIcon,
  InfoIcon,
} from "../../components/Icons";

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { orders } = usePlatform();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "security">(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "orders" || tabParam === "security" || tabParam === "info") {
      return tabParam;
    }
    return "info";
  });

  // حالة فتح نافذة تتبع مسار الرحلة الحية للطلب
  const [trackingOrder, setTrackingOrder] = useState<PlatformOrder | null>(null);

  // 👤 دالة تهيئة بيانات المستخدم ديناميكياً من التخزين المحلي
  const getInitialUserData = () => {
    try {
      const stored = localStorage.getItem("user_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          fullName: parsed.name || parsed.fullName || localStorage.getItem("user_name") || "",
          username: parsed.username || (parsed.email ? parsed.email.split("@")[0] : ""),
          email: parsed.email || localStorage.getItem("user_email") || "",
          phone: parsed.phone || localStorage.getItem("user_phone") || "",
          secondaryPhone: parsed.secondaryPhone || "",
          primaryAddress: parsed.address || parsed.primaryAddress || "مدينة 6 أكتوبر - الجيزة",
          secondaryAddress: parsed.secondaryAddress || "",
          preferredPayment: parsed.preferredPayment || "wallet",
          avatarUrl: parsed.avatar || parsed.avatarUrl || "",
        };
      }
    } catch (e) {
      console.warn("Failed to parse stored user_data", e);
    }
    return {
      fullName: localStorage.getItem("user_name") || "",
      username: "",
      email: localStorage.getItem("user_email") || "",
      phone: localStorage.getItem("user_phone") || "",
      secondaryPhone: "",
      primaryAddress: "مدينة 6 أكتوبر - الجيزة",
      secondaryAddress: "",
      preferredPayment: "wallet",
      avatarUrl: "",
    };
  };

  // 👤 بيانات المستخدم الحية المرتبطة بالحساب
  const [userInfo, setUserInfo] = useState(getInitialUserData);

  // 🔄 مزامنة بيانات الحساب الحية مباشرة من الباك إند
  useEffect(() => {
    let isMounted = true;
    const fetchFreshProfile = async () => {
      try {
        const me = await authService.getMe();
        if (me && isMounted) {
          setUserInfo((prev) => ({
            ...prev,
            fullName: me.name || prev.fullName,
            username: me.username || prev.username,
            email: me.email || prev.email,
            phone: me.phone || prev.phone,
            avatarUrl: me.avatar || prev.avatarUrl,
          }));
        }
      } catch (err) {
        console.warn("Backend /auth/me sync skipped:", err);
      }
    };
    fetchFreshProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // 📦 تصفية الطلبات الخاصة بهذا المستخدم فقط لمنع ظهور طلبات مستخدمين آخرين
  const userOrders = useMemo(() => {
    const userPhone = (userInfo.phone || "").trim().replace(/\D/g, "");
    const userName = (userInfo.fullName || "").trim().toLowerCase();
    
    // إذا كان الحساب جديداً تماماً ولم يطلب بعد
    if (!userPhone && !userName) return [];

    return orders.filter((ord) => {
      const orderPhone = (ord.phone || "").trim().replace(/\D/g, "");
      const orderName = (ord.customerName || "").trim().toLowerCase();
      const orderEmail = (ord.customerEmail || "").trim().toLowerCase();
      
      const phoneMatch = Boolean(userPhone && orderPhone && (orderPhone.includes(userPhone) || userPhone.includes(orderPhone)));
      const nameMatch = Boolean(userName && orderName && orderName.includes(userName));
      const emailMatch = Boolean(userInfo.email && orderEmail && orderEmail === userInfo.email.toLowerCase());
      
      return phoneMatch || nameMatch || emailMatch;
    });
  }, [orders, userInfo.phone, userInfo.fullName]);

  // 🔒 بيانات الأمان وكلمة المرور
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const subTextColor = isDarkMode ? "#CBD5E1" : "#334155";

  // 🚪 دالة تسجيل الخروج المسئولة عن تنظيف الـ Storage والتوجيه لصفحة اللوجن
  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return 0;
      case "processing":
        return 1;
      case "ready_for_collection":
      case "collected_in_hub":
        return 2;
      case "out_for_delivery":
        return 3;
      case "delivered":
        return 4;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return lang === "ar" ? "قيد الانتظار" : "Pending";
      case "processing":
        return lang === "ar" ? "قيد التجهيز من البائع" : "Processing";
      case "ready_for_collection":
        return lang === "ar" ? "جاهز لاستلام المُجمّع" : "Ready for Hub";
      case "collected_in_hub":
        return lang === "ar" ? "في مركز التجميع (Hub)" : "At Hub";
      case "out_for_delivery":
        return lang === "ar" ? "في الطريق مع السائق" : "Out for Delivery";
      case "delivered":
        return lang === "ar" ? "تم التسليم بنجاح" : "Delivered";
      case "cancelled":
        return lang === "ar" ? "تم الإلغاء" : "Cancelled";
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUserInfo({ ...userInfo, avatarUrl: URL.createObjectURL(file) });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authService.updateProfile({
        name: userInfo.fullName,
        username: userInfo.username,
        phone: userInfo.phone,
        avatar: userInfo.avatarUrl,
        primaryAddress: userInfo.primaryAddress,
        secondaryAddress: userInfo.secondaryAddress,
        secondaryPhone: userInfo.secondaryPhone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        isDarkMode ? "bg-[#0F172A]" : "bg-[#F8FAFC]"
      }`}
      style={{ color: textColor }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: ${lang === "ar" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"}; }
      `}</style>

      {/* 🔝 النافبار العلوي */}
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isDarkMode
            ? "bg-[#1E293B] border-slate-700 shadow-2xs"
            : "bg-white border-slate-200 shadow-2xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => navigate("/customer/products")}
          >
            <BrandLogo showText={true} />
            <span
              className="text-[11px] sm:text-xs font-black hidden md:inline"
              style={{ color: textColor }}
            >
              | {lang === "ar" ? "الملف الشخصي والحساب" : "Profile & Account"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 px-2.5 sm:px-3 border rounded-full text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? "bg-[#0F172A] border-slate-700 text-amber-400"
                  : "bg-slate-100 border-slate-300 text-black"
              }`}
            >
              {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`px-2.5 sm:px-3 py-1 border rounded-full text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? "bg-[#0F172A] border-slate-700 text-slate-300"
                  : "bg-slate-100 border-slate-300 text-black"
              }`}
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <button
              onClick={() => navigate("/customer/notifications")}
              className={`p-1.5 px-2.5 sm:px-3 border rounded-full text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-[#0F172A] border-slate-700 text-slate-300"
                  : "bg-slate-100 border-slate-300 text-black"
              }`}
            >
              <BellIcon className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* 🚪 زرار تسجيل الخروج المباشر في النافبار */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-full text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
              title={lang === "ar" ? "تسجيل الخروج" : "Logout"}
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {lang === "ar" ? "خروج" : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* كارت البروفايل */}
        <div
          className={`p-6 rounded-3xl border shadow-2xs flex flex-col items-center text-center space-y-4 ${
            isDarkMode
              ? "bg-[#1E293B] border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-amber-400 text-[#0E172A] font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md overflow-hidden">
              {userInfo.avatarUrl ? (
                <img
                  src={userInfo.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                userInfo.fullName.charAt(0)
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-slate-800 transition shadow-md border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <CameraIcon className="w-3.5 h-3.5 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="space-y-1">
            <h1
              className="text-lg sm:text-xl font-black"
              style={{ color: textColor }}
            >
              {userInfo.fullName}
            </h1>
            <p
              className="text-xs sm:text-sm font-bold opacity-80"
              style={{ color: subTextColor }}
            >
              {userInfo.email}
            </p>
            <p
              className="text-xs sm:text-sm font-bold pt-0.5 inline-flex items-center gap-1.5"
              style={{ color: subTextColor }}
            >
              <PhoneIcon className="w-3.5 h-3.5" />
              <span>{userInfo.phone}</span>
            </p>
            <div className="pt-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-700 dark:text-amber-400 text-xs font-black rounded-full border border-amber-400/30 inline-flex items-center gap-1.5">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {lang === "ar"
                    ? "حساب عميل موثق"
                    : "Verified Customer Account"}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm pt-2">
            <button
              onClick={() => navigate("/customer/wallet")}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-[#0E172A] text-xs font-black rounded-2xl transition cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              <span>💳</span>
              <span>{lang === "ar" ? "المحفظة الرصيدية" : "My Wallet"}</span>
            </button>
            <button
              onClick={() => navigate("/customer/reviews")}
              className={`py-2.5 px-4 border text-xs font-black rounded-2xl transition cursor-pointer shadow-2xs flex items-center justify-center gap-2 ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  : "bg-slate-100 border-slate-300 text-black hover:bg-slate-200"
              }`}
            >
              <span>⭐</span>
              <span>{lang === "ar" ? "سجل التقييمات" : "My Reviews"}</span>
            </button>
          </div>
        </div>

        {/* أزرار التبويبات */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer border ${
              activeTab === "info"
                ? "bg-amber-400 text-[#0E172A] border-amber-400 shadow-2xs"
                : isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white hover:border-slate-600"
                  : "bg-white border-slate-300 text-black hover:border-slate-400 shadow-2xs"
            }`}
          >
            {lang === "ar"
              ? "البيانات الشخصية والعناوين"
              : "Personal Info & Addresses"}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-amber-400 text-[#0E172A] border-amber-400 shadow-2xs"
                : isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white hover:border-slate-600"
                  : "bg-white border-slate-300 text-black hover:border-slate-400 shadow-2xs"
            }`}
          >
            <PackageIcon className="w-4 h-4" />
            <span>
              {lang === "ar" ? "طلباتي وتتبع الشحنات" : "My Orders & Tracking"}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/10 dark:bg-white/10 text-[10px]">
              {userOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer border ${
              activeTab === "security"
                ? "bg-amber-400 text-[#0E172A] border-amber-400 shadow-2xs"
                : isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white hover:border-slate-600"
                  : "bg-white border-slate-300 text-black hover:border-slate-400 shadow-2xs"
            }`}
          >
            {lang === "ar"
              ? "أمان الحساب وكلمة المرور"
              : "Account Security & Password"}
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-black text-center">
            {lang === "ar"
              ? "تم حفظ وتحديث بيانات حسابك بنجاح!"
              : "Account details updated successfully!"}
          </div>
        )}

        {/* 📝 1. تبويب البيانات الشخصية */}
        {activeTab === "info" && (
          <form
            onSubmit={handleSaveProfile}
            className={`p-4 sm:p-6 rounded-3xl border space-y-5 shadow-2xs ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200"}`}
          >
            <h3
              className="text-xs font-black border-b pb-2 border-slate-200 dark:border-slate-700"
              style={{ color: textColor }}
            >
              {lang === "ar"
                ? "معلومات الحساب والتواصل"
                : "Account & Contact Information"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "الاسم الكامل:" : "Full Name:"}
                </label>
                <input
                  type="text"
                  value={userInfo.fullName}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, fullName: e.target.value })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar"
                    ? "البريد الإلكتروني المسجل:"
                    : "Registered Email:"}
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, email: e.target.value })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "رقم الهاتف الرئيسي:" : "Primary Phone:"}
                </label>
                <input
                  type="text"
                  value={userInfo.phone}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, phone: e.target.value })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar"
                    ? "رقم هاتف إضافي (اختياري):"
                    : "Secondary Phone (Optional):"}
                </label>
                <input
                  type="text"
                  value={userInfo.secondaryPhone}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, secondaryPhone: e.target.value })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar"
                    ? "عنوان الشحن الرئيسي (6 أكتوبر):"
                    : "Primary Delivery Address:"}
                </label>
                <input
                  type="text"
                  value={userInfo.primaryAddress}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, primaryAddress: e.target.value })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar"
                    ? "العنوان الثاني (المنوفية / منزل العائلة):"
                    : "Secondary Delivery Address:"}
                </label>
                <input
                  type="text"
                  value={userInfo.secondaryAddress}
                  onChange={(e) =>
                    setUserInfo({
                      ...userInfo,
                      secondaryAddress: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar"
                    ? "طريقة الدفع الافتراضية المفضلة:"
                    : "Preferred Default Payment Method:"}
                </label>
                <select
                  value={userInfo.preferredPayment}
                  onChange={(e) =>
                    setUserInfo({
                      ...userInfo,
                      preferredPayment: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none cursor-pointer ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                >
                  <option value="wallet">
                    {lang === "ar"
                      ? "رصيد المحفظة الإلكترونية (السريع)"
                      : "Electronic Wallet Balance"}
                  </option>
                  <option value="card">
                    {lang === "ar"
                      ? "بطاقات الدفع (Visa / MasterCard)"
                      : "Debit / Credit Cards (Visa / MasterCard)"}
                  </option>
                  <option value="cod">
                    {lang === "ar"
                      ? "الدفع نقداً عند الاستلام (COD)"
                      : "Cash on Delivery (COD)"}
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-[#0E172A] font-black rounded-xl transition shadow-2xs cursor-pointer text-xs"
            >
              {isSaving
                ? lang === "ar"
                  ? "جاري التحديث..."
                  : "Updating..."
                : lang === "ar"
                  ? "حفظ البيانات الشخصية"
                  : "Save Personal Details"}
            </button>
          </form>
        )}

        {/* 📦 2. تبويب متابعة الطلبات والشحنات الحية */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {userOrders.length === 0 ? (
              <div
                className={`p-10 rounded-3xl border text-center space-y-3 ${
                  isDarkMode
                    ? "bg-[#1E293B] border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mx-auto">
                  <PackageIcon className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold opacity-60">
                  {lang === "ar"
                    ? "لم تقم بإنشاء أي طلبات حتى الآن"
                    : "You haven't placed any orders yet"}
                </p>
                <button
                  onClick={() => navigate("/customer/products")}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-[#0E172A] font-black rounded-xl text-xs transition cursor-pointer"
                >
                  {lang === "ar" ? "تصفح المنتجات الآن" : "Shop Now"}
                </button>
              </div>
            ) : (
              userOrders.map((ord) => {
                const stepIdx = getStepIndex(ord.status);
                const stepsLabels = [
                  lang === "ar" ? "تأكيد الطلب" : "Placed",
                  lang === "ar" ? "تجهيز البائع" : "Processing",
                  lang === "ar" ? "مركز التجميع" : "In Hub",
                  lang === "ar" ? "مع السائق" : "On the way",
                  lang === "ar" ? "تم التسليم" : "Delivered",
                ];

                return (
                  <div
                    key={ord.id}
                    className={`p-5 sm:p-6 rounded-3xl border space-y-4 shadow-sm transition ${
                      isDarkMode
                        ? "bg-[#1E293B] border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Header of Order Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-500 text-sm">
                            {ord.id}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 inline-flex items-center gap-1">
                            <StoreIcon className="w-3 h-3" />
                            <span>{ord.sellerName || (lang === "ar" ? "متجر معتمد" : "Verified Store")}</span>
                          </span>
                        </div>
                        <span className="text-[11px] opacity-60 font-mono block mt-0.5">
                          {ord.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-emerald-500">
                          {ord.totalAmount} EGP
                        </span>
                        <span className="px-3 py-1 rounded-xl text-xs font-bold border bg-amber-500/10 text-amber-500 border-amber-500/30">
                          {getStatusText(ord.status)}
                        </span>
                      </div>
                    </div>

                    {/* Live Progress Bar Stepper */}
                    {ord.status !== "cancelled" ? (
                      <div className="pt-2 pb-2">
                        <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold mb-2">
                          {stepsLabels.map((lbl, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col items-center text-center ${
                                idx <= stepIdx
                                  ? "text-amber-500 font-black"
                                  : "opacity-40"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 font-bold ${
                                  idx <= stepIdx
                                    ? "bg-amber-400 text-slate-900"
                                    : isDarkMode
                                      ? "bg-slate-800 text-slate-400"
                                      : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {idx < stepIdx ? "✓" : idx + 1}
                              </div>
                              <span className="hidden sm:inline">{lbl}</span>
                            </div>
                          ))}
                        </div>

                        {/* Progress Line */}
                        <div
                          className={`w-full h-2 rounded-full overflow-hidden ${
                            isDarkMode ? "bg-slate-800" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(15, (stepIdx / 4) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold text-center">
                        {lang === "ar"
                          ? "تم إلغاء هذا الطلب من قِبل إدارة المنصة"
                          : "This order has been cancelled by administration"}
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-black opacity-70 block">
                        {lang === "ar" ? "المنتجات المطلوبة:" : "Order Items:"}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ord.items.map((it) => (
                          <div
                            key={it.id}
                            className={`p-2.5 rounded-2xl border flex items-center gap-3 ${
                              isDarkMode
                                ? "bg-[#0F172A] border-slate-700"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            {it.imageUrl && (
                              <img
                                src={it.imageUrl}
                                alt={it.productTitle}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs truncate">
                                {it.productTitle}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] opacity-60">
                                <span>الكمية: {it.qty}</span>
                                <span>•</span>
                                <span className="font-mono text-amber-500">
                                  {it.unitPrice} EGP
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline History */}
                    <div
                      className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                        isDarkMode
                          ? "bg-slate-900/60 border-slate-800"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="font-black text-[11px] opacity-60 flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === "ar" ? "سجل حركة الشحنة المباشر:" : "Live Tracking Log:"}</span>
                      </div>
                      {ord.timeline.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span className="font-bold">
                              {lang === "ar" ? step.titleAr : step.titleEn}
                            </span>
                            {step.actor && (
                              <span className="text-[10px] opacity-60">
                                ({step.actor})
                              </span>
                            )}
                          </div>
                          <span className="font-mono opacity-50 text-[10px] shrink-0">
                            {step.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* زر تتبع مسار الرحلة والخريطة الحية للمستهلك */}
                    <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <MapPinIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{lang === "ar" ? `عنوان التسليم: ${ord.city}` : `Delivery: ${ord.city}`}</span>
                        {ord.otpCode && (
                          <span className="mx-2 font-mono font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            OTP: {ord.otpCode}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setTrackingOrder(ord)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
                      >
                        <MapIcon className="w-4 h-4" />
                        <span>
                          {lang === "ar"
                            ? "تتبع مسار الرحلة والخريطة الحية"
                            : "Live GPS Journey & Route Map"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 🔒 3. تبويب الأمان */}
        {activeTab === "security" && (
          <form
            onSubmit={handleSaveProfile}
            className={`p-4 sm:p-6 rounded-3xl border space-y-4 shadow-2xs ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200"}`}
          >
            <h3
              className="text-xs font-black border-b pb-2 border-slate-200 dark:border-slate-700"
              style={{ color: textColor }}
            >
              {lang === "ar"
                ? "تعديل اسم المستخدم وكلمة المرور"
                : "Username & Password Settings"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "اسم المستخدم (Username):" : "Username:"}
                </label>
                <input
                  type="text"
                  value={userInfo.username}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, username: e.target.value })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "كلمة المرور الحالية:" : "Current Password:"}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={securityData.currentPassword}
                  onChange={(e) =>
                    setSecurityData({
                      ...securityData,
                      currentPassword: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "كلمة المرور الجديدة:" : "New Password:"}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={securityData.newPassword}
                  onChange={(e) =>
                    setSecurityData({
                      ...securityData,
                      newPassword: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar"
                    ? "تأكيد كلمة المرور الجديدة:"
                    : "Confirm New Password:"}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={securityData.confirmPassword}
                  onChange={(e) =>
                    setSecurityData({
                      ...securityData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-[#0E172A] font-black rounded-xl transition shadow-2xs cursor-pointer text-xs"
            >
              {lang === "ar"
                ? "تحديث بيانات الأمان وكلمة المرور"
                : "Update Security Settings"}
            </button>
          </form>
        )}

        {/* زرار تسجيل الخروج الواضح والواسع في أسفل الصفحة */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/30 font-black rounded-2xl transition duration-200 cursor-pointer text-xs flex items-center justify-center gap-2 shadow-2xs"
          >
            <LogoutIcon className="w-4 h-4" />
            <span>
              {lang === "ar" ? "تسجيل الخروج من الحساب" : "Logout from Account"}
            </span>
          </button>
        </div>
      </main>

      {/* مودال تتبع مسار الرحلة والخريطة الحية للمستهلك (Live GPS Journey Tracker) */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className={`max-w-2xl w-full p-5 sm:p-6 rounded-3xl border shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            {/* الهيدر */}
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-xs">
                  {trackingOrder.shippingType === "express" ? (
                    <LightningIcon className="w-5 h-5 text-slate-950" />
                  ) : (
                    <TruckIcon className="w-5 h-5 text-slate-950" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-indigo-500">
                      {lang === "ar"
                        ? `تتبع مسار الشحنة (${trackingOrder.id})`
                        : `Live Journey Tracking (${trackingOrder.id})`}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-black inline-flex items-center gap-1 ${
                        trackingOrder.shippingType === "express"
                          ? "bg-rose-500/20 text-rose-500"
                          : "bg-indigo-500/20 text-indigo-500"
                      }`}
                    >
                      {trackingOrder.shippingType === "express" ? (
                        <>
                          <LightningIcon className="w-3 h-3" />
                          <span>{lang === "ar" ? "فوري Express" : "Instant Express"}</span>
                        </>
                      ) : (
                        <>
                          <PackageIcon className="w-3 h-3" />
                          <span>{lang === "ar" ? "مجمع بالهب" : "Hub Consolidated"}</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-60">
                    {trackingOrder.sellerName} ➔ {trackingOrder.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTrackingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 font-black cursor-pointer text-sm transition"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* خريطة المسار الحي الحقيقية بواسطة Leaflet & OpenStreetMap */}
            <LeafletJourneyTracker order={trackingOrder} heightClass="h-60 sm:h-72" />

            {/* كارت الكابتن وأزرار الاتصال المباشرة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shrink-0">
                    <TruckIcon className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs">
                      {trackingOrder.driverName || "الكابتن أحمد محمود"}
                    </h4>
                    <span className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5">
                      <StarIcon className="w-3 h-3 text-amber-400" filled />
                      <span>4.9 (142 {lang === "ar" ? "رحلة ناجحة" : "trips"}) • {lang === "ar" ? "فان لوجستية" : "Logistics Van"}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href="tel:+201092242607"
                    className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center"
                    title="اتصال هاتف"
                  >
                    <PhoneIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/201092242607"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center"
                    title="محادثة مباشر"
                  >
                    <ChatIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* كود التحقق السري للعميل عند الاستلام (OTP) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                    {lang === "ar" ? "كود الاستلام السري الخاص بك (OTP):" : "Your Security OTP Code:"}
                  </span>
                  <span className="font-mono text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950">
                    {trackingOrder.otpCode || "4821"}
                  </span>
                </div>
                <div className="text-[10px] opacity-70 mt-1 leading-snug flex items-center gap-1">
                  <InfoIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {lang === "ar"
                      ? "يرجى إعطاء هذا الكود المكون من 4 أرقام للكابتن عند استلام الطرد لتأكيد إتمام التسليم."
                      : "Please give this 4-digit OTP code to the driver upon package delivery."}
                  </span>
                </div>
              </div>
            </div>

            {/* محطات الرحلة وسجل التتبع التفصيلي */}
            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="font-black text-xs text-indigo-500 flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "محطات خط سير الشحنة:" : "Delivery Milestones:"}</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs font-bold">
                {trackingOrder.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{lang === "ar" ? step.titleAr : step.titleEn}</span>
                      {step.actor && (
                        <span className="text-[10px] opacity-60">
                          ({step.actor})
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] opacity-60">
                      {step.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-black rounded-xl text-xs cursor-pointer transition"
            >
              {lang === "ar" ? "إغلاق نافذة التتبع" : "Close Tracker"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfilePage;
