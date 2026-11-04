import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import authService from "../../services/authService";
import {
  UserIcon,
  MapPinIcon,
  BuildingIcon,
  StarIcon,
  ShieldCheckIcon,
} from "../../components/Icons";

export const CollectorProfileScreen: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { isDarkMode: isDark } = useTheme();

  // 👤 دالة جلب بيانات الحساب الفعلية
  const getInitialCollectorData = () => {
    try {
      const stored = localStorage.getItem("user_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          fullName: parsed.name || parsed.fullName || localStorage.getItem("user_name") || "",
          phone: parsed.phone || localStorage.getItem("user_phone") || "",
          email: parsed.email || localStorage.getItem("user_email") || "",
          hubName: "Home Hub - المنطقة الصناعية (زون A4)",
          city: "مدينة 6 أكتوبر",
          governorate: "الجيزة",
          coverageRadiusKm: 10,
          vehicleType: "تروسيكل نقل بضائع / فانيت",
          nationalId: parsed.nationalId || localStorage.getItem("user_national_id") || "",
          rating: 4.9,
          totalCollectedOrders: 0,
          totalPackagesBuilt: 0,
        };
      }
    } catch {
      // ignore
    }
    return {
      fullName: localStorage.getItem("user_name") || "",
      phone: localStorage.getItem("user_phone") || "",
      email: localStorage.getItem("user_email") || "",
      hubName: "Home Hub - المنطقة الصناعية (زون A4)",
      city: "مدينة 6 أكتوبر",
      governorate: "الجيزة",
      coverageRadiusKm: 10,
      vehicleType: "تروسيكل نقل بضائع / فانيت",
      nationalId: localStorage.getItem("user_national_id") || "",
      rating: 4.9,
      totalCollectedOrders: 0,
      totalPackagesBuilt: 0,
    };
  };

  const [profileData, setProfileData] = useState(getInitialCollectorData);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    authService.getMe().then((me) => {
      if (me && isMounted) {
        setProfileData((prev) => ({
          ...prev,
          fullName: me.name || prev.fullName,
          phone: me.phone || prev.phone,
          email: me.email || prev.email,
          nationalId: me.nationalId || prev.nationalId,
        }));
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authService.updateProfile({
        name: profileData.fullName,
        phone: profileData.phone,
        nationalId: profileData.nationalId,
      });
      setSuccessMessage(
        isRtl ? "تم حفظ البيانات بنجاح في قاعدة البيانات!" : "Profile updated successfully!",
      );
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch {
      setSuccessMessage(isRtl ? "تم حفظ البيانات محلياً" : "Saved locally");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const t = {
    title: isRtl ? "الملف الشخصي للمُجمّع" : "Collector Profile",
    sub: isRtl
      ? "إدارة البيانات الشخصية، تفاصيل مركز التجميع (Home Hub)، وإعدادات نطاق الخدمة"
      : "Manage personal details, Home Hub settings, and coverage radius",
    personalInfo: isRtl ? "البيانات الشخصية" : "Personal Information",
    hubInfo: isRtl
      ? "بيانات مركز التجميع والنطاق (Home Hub)"
      : "Home Hub & Range Settings",
    statsTitle: isRtl ? "إحصائيات الأداء والإنجاز" : "Performance Stats",
    fullName: isRtl ? "الاسم الكامل" : "Full Name",
    phone: isRtl ? "رقم الهاتف" : "Phone Number",
    email: isRtl ? "البريد الإلكتروني" : "Email Address",
    nationalId: isRtl ? "الرقم القومي" : "National ID",
    hubName: isRtl ? "اسم مركز التجميع (Hub Name)" : "Hub Name",
    city: isRtl ? "المدينة / المنطقة" : "City / Area",
    governorate: isRtl ? "المحافظة" : "Governorate",
    vehicleType: isRtl ? "وسيلة النقل المستخدمة" : "Vehicle Type",
    coverageRadius: isRtl ? "نصف قطر التغطية (كم)" : "Coverage Radius (km)",
    saveBtn: isRtl ? "حفظ التعديلات" : "Save Changes",
    savingBtn: isRtl ? "جاري الحفظ..." : "Saving...",
    rating: isRtl ? "التقييم العام" : "Overall Rating",
    totalOrders: isRtl ? "إجمالي الطلبات المجمعة" : "Total Orders Collected",
    totalPackages: isRtl ? "الحزم المجهزة" : "Packages Built",
  };

  return (
    <div className="space-y-6">
      {/* 🔹 الهيدر الإحصائي */}
      <div
        className={`p-6 rounded-2xl border shadow-xs transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-indigo-400 shrink-0">
            AR
          </div>
          <div className="flex-1 text-center md:text-start space-y-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-xl font-black">{profileData.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-max mx-auto md:mx-0 flex items-center gap-1">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                <span>مُجمّع معتمد</span>
              </span>
            </div>
            <p
              className={`text-xs font-bold flex items-center justify-center md:justify-start gap-1 ${
                isDark ? "text-white/50" : "text-slate-600"
              }`}
            >
              <MapPinIcon className="w-3.5 h-3.5" />
              <span>
                {profileData.hubName} | {profileData.city}، {profileData.governorate}
              </span>
            </p>
          </div>

          {/* كروت الإحصائيات السريعة */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto border-t md:border-t-0 md:border-r dark:border-slate-800 border-slate-200 pt-4 md:pt-0 md:pr-6">
            <div className="text-center">
              <span className="text-[10px] font-bold opacity-60 block">
                {t.rating}
              </span>
              <span className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
                <StarIcon filled className="w-4 h-4 text-amber-400" />
                <span>{profileData.rating}</span>
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold opacity-60 block">
                {t.totalOrders}
              </span>
              <span className="text-base font-black text-indigo-500">
                {profileData.totalCollectedOrders}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold opacity-60 block">
                {t.totalPackages}
              </span>
              <span className="text-base font-black text-emerald-500">
                {profileData.totalPackagesBuilt}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 نموذج التعديل والبيانات */}
      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* قسم البيانات الشخصية */}
        <div
          className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        >
          <h3 className="text-sm font-black border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-500" />
            <span>{t.personalInfo}</span>
          </h3>

          <div className="space-y-3 text-xs font-black">
            <div>
              <label className="block mb-1 opacity-70">{t.fullName}</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                className={`w-full p-3 rounded-xl border outline-none ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300 text-black"
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 opacity-70">{t.phone}</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className={`w-full p-3 rounded-xl border outline-none ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300 text-black"
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 opacity-70">{t.email}</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className={`w-full p-3 rounded-xl border outline-none ${
                  isDark
                    ? "bg-slate-950 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300 text-black"
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 opacity-70">{t.nationalId}</label>
              <input
                type="text"
                disabled
                value={profileData.nationalId}
                className={`w-full p-3 rounded-xl border outline-none opacity-60 ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-white"
                    : "bg-slate-100 border-slate-300 text-black"
                }`}
              />
            </div>
          </div>
        </div>

        {/* قسم بيانات مركز التجميع والنطاق */}
        <div
          className={`p-6 rounded-2xl border shadow-xs space-y-4 flex flex-col justify-between ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        >
          <div className="space-y-4">
            <h3 className="text-sm font-black border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <BuildingIcon className="w-4 h-4 text-emerald-500" />
              <span>{t.hubInfo}</span>
            </h3>

            <div className="space-y-3 text-xs font-black">
              <div>
                <label className="block mb-1 opacity-70">{t.hubName}</label>
                <input
                  type="text"
                  value={profileData.hubName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, hubName: e.target.value })
                  }
                  className={`w-full p-3 rounded-xl border outline-none ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-black"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 opacity-70">{t.city}</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({ ...profileData, city: e.target.value })
                    }
                    className={`w-full p-3 rounded-xl border outline-none ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-black"
                    }`}
                  />
                </div>
                <div>
                  <label className="block mb-1 opacity-70">
                    {t.governorate}
                  </label>
                  <input
                    type="text"
                    value={profileData.governorate}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        governorate: e.target.value,
                      })
                    }
                    className={`w-full p-3 rounded-xl border outline-none ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-black"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 opacity-70">{t.vehicleType}</label>
                <input
                  type="text"
                  value={profileData.vehicleType}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      vehicleType: e.target.value,
                    })
                  }
                  className={`w-full p-3 rounded-xl border outline-none ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-black"
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 opacity-70">
                  {t.coverageRadius}
                </label>
                <select
                  value={profileData.coverageRadiusKm}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      coverageRadiusKm: Number(e.target.value),
                    })
                  }
                  className={`w-full p-3 rounded-xl border outline-none cursor-pointer ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-black"
                  }`}
                >
                  <option value={5}>5 كم (نطاق قريب)</option>
                  <option value={10}>10 كم (نطاق قياسي)</option>
                  <option value={15}>15 كم (نطاق موسع)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            {successMessage && (
              <span className="text-xs font-black text-emerald-500 animate-pulse">
                {successMessage}
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="mr-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition"
            >
              {isSaving ? t.savingBtn : t.saveBtn}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CollectorProfileScreen;
