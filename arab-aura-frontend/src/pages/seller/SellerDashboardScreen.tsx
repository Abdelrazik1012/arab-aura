import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import InteractivePlatformMap from "../../components/InteractivePlatformMap";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  PackageIcon,
  TagIcon,
  LayersIcon,
  WalletIcon,
  TrendingUpIcon,
  SparklesIcon,
  CloseIcon,
} from "../../components/Icons";

export const SellerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 👤 بيانات الحساب الشخصي للبائع
  const [sellerProfile, setSellerProfile] = useState({
    fullName: "عبدالرازق بدر",
    phone: "+201092242607",
    email: "abdelrazikrbadr@gmail.com",
    nationalId: "20012121401234",
    storeName: "أورا ستريت وير (Aura Store)",
    payoutMethod: "Instapay (01092242607)",
  });

  const [sellerZone] = useState({
    city: "مدينة 6 أكتوبر - الجيزة",
    zoneName: "المنطقة الصناعية - زون A4",
    coverageRadius: "15 كم",
    coordinates: { lat: 29.9722, lng: 30.9419 },
  });

  const [metrics] = useState({
    grossSales: { value: "34,200", trend: "+14.5%" },
    ordersCount: { value: "24", trend: "+8.3%" },
    estimatedProfit: { value: "8,900", trend: "+15.2%" },
    availablePayout: "21,500",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isRtl = lang === "ar";

  // 🌐 قاموس الترجمة الفورية للنصوص
  const t = {
    commandCenter: isRtl ? "مركز قيادة البائع" : "Seller Command Center",
    profile: isRtl ? "الحساب الشخصي" : "Profile",
    logout: isRtl ? "خروج" : "Logout",
    welcome: isRtl ? "أهلاً بك، عبدالرازق بدر" : "Welcome, Abdelrazik Badr",
    storeInfo: isRtl
      ? `المتجر: ${sellerProfile.storeName} | الموقع: ${sellerZone.city}`
      : `Store: ${sellerProfile.storeName} | Location: 6th of October City - Giza`,
    zoneActive: isRtl ? "المنطقة الجغرافية نشطة" : "Geographic Zone Active",
    chartTitle: isRtl
      ? "مؤشر أداء المبيعات والأرباح (Trading Flow Chart)"
      : "Sales & Profit Performance Index (Trading Flow Chart)",
    chartDesc: isRtl
      ? "رسم بياني تفاعلي يوضح اتجاه المبيعات والنمو خلال الأيام الأخيرة"
      : "Interactive chart showing sales and growth trends over recent days",
    grossSales: isRtl ? "إجمالي المبيعات" : "Gross Sales",
    totalOrders: isRtl ? "إجمالي الطلبات" : "Total Orders",
    netProfit: isRtl ? "الأرباح الصافية" : "Net Profit",
    availablePayout: isRtl ? "الرصيد المتاح للسحب" : "Available Payout",
    orderUnit: isRtl ? "طلب" : "Orders",
    withdraw: isRtl ? "سحب ←" : "Withdraw →",
    mapTitle: isRtl
      ? "النطاق الجغرافي وخريطة خادم التوصيل (Google Maps API / مصر)"
      : "Geographic Range & Delivery Hub Map (Google Maps API / Egypt)",
    mapSub: isRtl
      ? "مدينة 6 أكتوبر - الجيزة (المنطقة الصناعية - زون A4)"
      : "6th of October City - Giza (Industrial Zone - Zone A4)",
    coverage: isRtl ? "15 كم" : "15 km",
    mapBoxTitle: isRtl
      ? "المنطقة الصناعية - زون A4"
      : "Industrial Zone - Zone A4",
    mapBoxSub: isRtl
      ? "جمهورية مصر العربية - تغطية شاملة"
      : "Arab Republic of Egypt - Comprehensive Coverage",
    activeGrid: "Egypt Map Grid Active",
    effectiveDelivery: isRtl
      ? "نطاق التوصيل الفعّال في جمهورية مصر العربية"
      : "Effective Delivery Range in Egypt",
    aiTitle: isRtl ? "مساعد الذكاء الاصطناعي للمنصة" : "Platform AI Assistant",
    aiDesc: isRtl
      ? "تحليلات الطلب وحركة السوق"
      : "Demand & Market Trend Analytics",
    aiPlaceholder: isRtl
      ? "مثال: ما هي المنتجات الأعلى طلباً في نطاق 6 أكتوبر؟"
      : "Example: What are the top-ordered products in 6th of October?",
    generateAnalysis: isRtl ? "توليد تحليل ذكي" : "Generate Analysis",
    generating: isRtl ? "جاري التحليل..." : "Analyzing...",
    card1Title: isRtl
      ? "إدارة المنتجات والصور"
      : "Products & Images Management",
    card1Desc: isRtl ? "إدارة المخزون والصور" : "Manage inventory and images",
    card2Title: isRtl
      ? "تعديل وتخصيص البراندات"
      : "Brand Management & Customization",
    card2Desc: isRtl ? "إدارة المتاجر والعلامات" : "Manage stores and brands",
    card3Title: isRtl ? "بيانات السائق والمُجمّع" : "Driver & Collector Data",
    card3Desc: isRtl ? "متابعة الشحن والتوصيل" : "Track shipping and delivery",
    card4Title: isRtl ? "الربحية وكشف الحساب" : "Profitability & Statement",
    card4Desc: isRtl ? "الأرباح والعمولات" : "Profits and commissions",
    modalTitle: isRtl
      ? "الحساب الشخصي للبائع وبيانات الاعتماد"
      : "Seller Profile & Credentials",
    fullName: isRtl ? "الاسم الكامل" : "Full Name",
    storeNameLabel: isRtl ? "اسم المتجر" : "Store Name",
    phone: isRtl ? "رقم الهاتف" : "Phone Number",
    email: isRtl ? "البريد الإلكتروني" : "Email Address",
    nationalId: isRtl ? "الرقم القومي (البطاقة الشخصية)" : "National ID",
    payoutMethod: isRtl ? "طريقة سحب الأرباح" : "Payout Method",
    idImage: isRtl ? "صورة البطاقة الشخصية" : "National ID Image",
    contract: isRtl
      ? "عقد الشراكة الموثق (PDF)"
      : "Verified Partnership Contract (PDF)",
    close: isRtl ? "إغلاق" : "Close",
    saveChanges: isRtl ? "حفظ التعديلات" : "Save Changes",
    savedSuccess: isRtl
      ? "تم حفظ التعديلات بنجاح!"
      : "Changes saved successfully!",
  };

  const handleAskAi = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || aiPrompt;
    if (!query.trim()) return;

    setAiPrompt(query);
    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      let insight = "";
      if (query.includes("مبيعات") || query.includes("زيادة")) {
        insight = `خطة زيادة المبيعات في 6 أكتوبر والمنوفية:
1. زيادة مخزون التيشيرتات البولو القطنية والكاجوال قبل نهاية الأسبوع (تشهد المنوفية طلباً بنسبة 42%).
2. الترويج لميزة الشحن المجمع (35 ج.م فقط) لجذب طلبات المجموعات والأصدقاء في الجامعات.
3. اعتماد صور واضحة بتفاصيل النسيج لتقليل استفسارات المقاسات ورفع معدل التحويل 22%.`;
      } else if (query.includes("تسعير") || query.includes("سعر") || query.includes("أرباح")) {
        insight = `استراتيجية التسعير الذكي ورفع الربحية:
1. المنتجات بين 450 - 650 ج.م تحقق أعلى معدل سرعة دوران في السوق المصري الحالي.
2. تفعيل عرض "اشتري قطعتين واحصل على شحن مجاني" لرفع متوسط قيمة السلة من 550 ج.م إلى 1,100 ج.م.
3. تحقيق هامش ربح لا يقل عن 25% مع الحفاظ على تنافسية الأسعار مقارنة بالبراندات المستوردة.`;
      } else if (query.includes("شحن") || query.includes("مجمع") || query.includes("هب")) {
        insight = `الاستفادة القصوى من شبكة الشحن المجمع 3ARB AURA:
1. تجهيز الشحنات قبل الساعة 2 ظهراً يتيح لمُجمّع الحي استلامها وإيداعها في نقطة التجميع (Micro-Hub) في نفس اليوم.
2. استخدام كود التأكيد السريع وباركود الطرد يقلل زمن التسليم للكابتن بنسبة 40%.
3. الطلبات المجمعة توفر 65% في تكلفة الشحن على عملائك في المحافظات مقارنة بالشحن الفردي.`;
      } else {
        insight = `تحليل ذكي شامل لمتجرك (${sellerProfile.storeName}):
• مؤشر أداء المبيعات مرتفع (+14.5%) في نطاق 6 أكتوبر والجيزة.
• الطلب المتزايد على المقاسات L و XL يتطلب تغذية المخزون بنسبة 30% إضافية.
• الرد السريع على طلبات التجهيز خلال ساعة واحدة يرفع تصنيف متجرك لأعلى 5% في منصة عرب أورا.`;
      }

      setAiResponse(insight);
      setIsAiLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-black"
      }`}
    >
      {/* 🔹 شريط التنقل العلوي (Navbar متجاوب بالكامل) */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-auto sm:h-16 py-2.5 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <BrandLogo showText={true} />
            <span
              className={`text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-lg border ${
                isDarkMode
                  ? "bg-slate-800 text-indigo-400 border-slate-700"
                  : "bg-indigo-50 text-indigo-950 border-indigo-200"
              } hidden md:inline-block`}
            >
              {t.commandCenter}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                isDarkMode
                  ? "bg-indigo-500 hover:bg-indigo-400 text-black border border-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                  isDarkMode ? "fill-black" : "fill-white"
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span>{t.profile}</span>
            </button>

            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
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
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  : "bg-white border-slate-300 text-black hover:bg-slate-100"
              }`}
            >
              {isRtl ? "English" : "عربي"}
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* الترحيب وحالة المتجر */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-300"
          }`}
        >
          <div>
            <h1
              className={`text-lg sm:text-xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {t.welcome}
            </h1>
            <p
              className={`text-[11px] sm:text-xs font-bold mt-1 ${isDarkMode ? "text-white/50" : "text-black/50"}`}
            >
              {t.storeInfo}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-400">
              {t.zoneActive}
            </span>
          </div>
        </div>

        {/* 📊 لوحة التحليلات بالأعمدة (قابلة للتمرير أفقياً على الموبايل لعدم الانضغاط) */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border shadow-xs space-y-4 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-300"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
            <div>
              <h3
                className={`text-xs sm:text-sm font-black flex items-center gap-2 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                <TrendingUpIcon className="w-4 h-4 text-emerald-500" />
                <span>{t.chartTitle}</span>
              </h3>
              <p
                className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                {t.chartDesc}
              </p>
            </div>
            <span className="px-3 py-1 bg-teal-500/10 text-teal-900 dark:text-teal-300 border border-teal-500/30 rounded-xl text-xs font-black self-start sm:self-auto">
              Growth 14.5%+
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="h-44 min-w-[450px] w-full flex items-end gap-3 sm:gap-4 pt-8 px-2 border-b border-slate-200 dark:border-slate-800">
              {[45, 65, 55, 78, 85, 72, 98, 88, 115, 105, 135, 150].map(
                (val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end"
                  >
                    <span className="opacity-0 group-hover:opacity-100 bg-black text-teal-300 text-[10px] font-black px-1.5 py-0.5 rounded transition whitespace-nowrap">
                      {val * 250} EGP
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 rounded-t-lg transition-all duration-300 shadow-xs"
                      style={{ height: `${val}%` }}
                    ></div>
                    <span
                      className={`text-[10px] font-black ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Day {12 - idx}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* مؤشرات الأداء (KPI Cards Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                {t.grossSales}
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-400">
                ▲ +14.5%
              </span>
            </div>
            <h3
              className={`text-xl sm:text-2xl font-black ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {metrics.grossSales.value}{" "}
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                EGP
              </span>
            </h3>
          </div>

          <div
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                {t.totalOrders}
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-400">
                ▲ +8.3%
              </span>
            </div>
            <h3
              className={`text-xl sm:text-2xl font-black ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {metrics.ordersCount.value}{" "}
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                {t.orderUnit}
              </span>
            </h3>
          </div>

          <div
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                {t.netProfit}
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-400">
                ▲ +15.2%
              </span>
            </div>
            <h3
              className={`text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400`}
            >
              {metrics.estimatedProfit.value}{" "}
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                EGP
              </span>
            </h3>
          </div>

          <div
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                {t.availablePayout}
              </span>
              <button
                onClick={() => navigate("/seller/wallet")}
                className="text-xs font-black text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {t.withdraw}
              </button>
            </div>
            <h3
              className={`text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400`}
            >
              {metrics.availablePayout}{" "}
              <span
                className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                EGP
              </span>
            </h3>
          </div>
        </div>

        {/* 🗺️ النطاق الجغرافي وخريطة خادم التوصيل التفاعلية */}
        <InteractivePlatformMap
          role="seller"
          title={isRtl ? "خريطة نطاق متجر 6 أكتوبر والشحنات الميدانية" : "Store Coverage & Delivery Map"}
          subtitle={isRtl ? "تتبع استلام المندوب للشحنات وخروجها مع سائقي المحافظات (شبين الكوم والباجور)" : "Track store pickups and driver dispatches"}
        />

        {/* 🧠 مساعد الذكاء الاصطناعي للمنصة */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border shadow-xs space-y-4 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
            <span className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl text-base font-black flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </span>
            <div>
              <h3
                className={`text-xs sm:text-sm font-black ${isDarkMode ? "text-white" : "text-black"}`}
              >
                {t.aiTitle}
              </h3>
              <p
                className={`text-[11px] sm:text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
              >
                {t.aiDesc}
              </p>
            </div>
          </div>
          {/* أسئلة واقتراحات سريعة بنقرة واحدة */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold opacity-60">اقتراحات سريعة:</span>
            {[
              "خطة زيادة المبيعات في 6 أكتوبر والمنوفية",
              "استراتيجية التسعير ورفع الربحية",
              "الاستفادة من الشحن المجمع 35 ج.م",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAi(undefined, chip)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleAskAi}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={t.aiPlaceholder}
              className={`flex-1 p-3 sm:p-3.5 border rounded-xl text-xs sm:text-sm font-black outline-none shadow-xs ${
                isDarkMode
                  ? "bg-slate-950 text-white border-slate-700 placeholder:text-white/50"
                  : "bg-white text-black border-slate-400 placeholder:text-black/50"
              }`}
            />
            <button
              type="submit"
              disabled={isAiLoading}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              {isAiLoading ? t.generating : t.generateAnalysis}
            </button>
          </form>
          {aiResponse && (
            <div
              className={`p-4 border rounded-xl text-xs font-black whitespace-pre-line leading-relaxed ${
                isDarkMode
                  ? "bg-indigo-950/50 border-indigo-800 text-indigo-200"
                  : "bg-indigo-50 border-indigo-200 text-black"
              }`}
            >
              {aiResponse}
            </div>
          )}
        </div>

        {/* الكروت الأربعة السفلية متجاوبة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate("/seller/products")}
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs cursor-pointer hover:border-indigo-600 transition space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <PackageIcon className="w-5 h-5" />
            </div>
            <h4
              className={`font-black text-sm ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {t.card1Title}
            </h4>
            <p
              className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
            >
              {t.card1Desc}
            </p>
          </div>
          <div
            onClick={() => navigate("/seller/brands")}
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs cursor-pointer hover:border-indigo-600 transition space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TagIcon className="w-5 h-5" />
            </div>
            <h4
              className={`font-black text-sm ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {t.card2Title}
            </h4>
            <p
              className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
            >
              {t.card2Desc}
            </p>
          </div>
          <div
            onClick={() => navigate("/seller/orders")}
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs cursor-pointer hover:border-indigo-600 transition space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <LayersIcon className="w-5 h-5" />
            </div>
            <h4
              className={`font-black text-sm ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {t.card3Title}
            </h4>
            <p
              className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
            >
              {t.card3Desc}
            </p>
          </div>
          <div
            onClick={() => navigate("/seller/wallet")}
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs cursor-pointer hover:border-indigo-600 transition space-y-2 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <WalletIcon className="w-5 h-5" />
            </div>
            <h4
              className={`font-black text-sm ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {t.card4Title}
            </h4>
            <p
              className={`text-xs font-bold ${isDarkMode ? "text-white/50" : "text-black/50"}`}
            >
              {t.card4Desc}
            </p>
          </div>
        </div>
      </main>

      {/* 👤 مودال الحساب الشخصي (متجاوب مع الشاشات الصغيرة) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className={`max-w-xl w-full p-4 sm:p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3
                className={`font-black text-sm sm:text-base flex items-center gap-2 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                <UserIcon className="w-4 h-4 text-indigo-500" />
                <span>{t.modalTitle}</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block font-black mb-1 ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    value={sellerProfile.fullName}
                    onChange={(e) =>
                      setSellerProfile({
                        ...sellerProfile,
                        fullName: e.target.value,
                      })
                    }
                    className={`w-full p-3 border rounded-xl font-black shadow-xs ${
                      isDarkMode
                        ? "bg-slate-950 text-white border-slate-700"
                        : "bg-white text-black border-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block font-black mb-1 ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {t.storeNameLabel}
                  </label>
                  <input
                    type="text"
                    value={sellerProfile.storeName}
                    onChange={(e) =>
                      setSellerProfile({
                        ...sellerProfile,
                        storeName: e.target.value,
                      })
                    }
                    className={`w-full p-3 border rounded-xl font-black shadow-xs ${
                      isDarkMode
                        ? "bg-slate-950 text-white border-slate-700"
                        : "bg-white text-black border-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block font-black mb-1 ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {t.phone}
                  </label>
                  <input
                    type="text"
                    value={sellerProfile.phone}
                    onChange={(e) =>
                      setSellerProfile({
                        ...sellerProfile,
                        phone: e.target.value,
                      })
                    }
                    className={`w-full p-3 border rounded-xl font-black shadow-xs ${
                      isDarkMode
                        ? "bg-slate-950 text-white border-slate-700"
                        : "bg-white text-black border-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block font-black mb-1 ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={sellerProfile.email}
                    onChange={(e) =>
                      setSellerProfile({
                        ...sellerProfile,
                        email: e.target.value,
                      })
                    }
                    className={`w-full p-3 border rounded-xl font-black shadow-xs ${
                      isDarkMode
                        ? "bg-slate-950 text-white border-slate-700"
                        : "bg-white text-black border-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block font-black mb-1 ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  {t.nationalId}
                </label>
                <input
                  type="text"
                  value={sellerProfile.nationalId}
                  onChange={(e) =>
                    setSellerProfile({
                      ...sellerProfile,
                      nationalId: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded-xl font-black shadow-xs ${
                    isDarkMode
                      ? "bg-slate-950 text-white border-slate-700"
                      : "bg-white text-black border-slate-400"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block font-black mb-1 ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  {t.payoutMethod}
                </label>
                <input
                  type="text"
                  value={sellerProfile.payoutMethod}
                  onChange={(e) =>
                    setSellerProfile({
                      ...sellerProfile,
                      payoutMethod: e.target.value,
                    })
                  }
                  className={`w-full p-3 border rounded-xl font-black shadow-xs ${
                    isDarkMode
                      ? "bg-slate-950 text-white border-slate-700"
                      : "bg-white text-black border-slate-400"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label
                    className={`block font-black mb-1 text-[11px] ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {t.idImage}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-950 dark:file:bg-indigo-950 dark:file:text-indigo-300 font-bold"
                  />
                </div>
                <div>
                  <label
                    className={`block font-black mb-1 text-[11px] ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {t.contract}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-950 dark:file:bg-indigo-950 dark:file:text-indigo-300 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className={`px-4 py-2.5 rounded-xl font-black cursor-pointer ${
                    isDarkMode
                      ? "bg-slate-800 text-white"
                      : "bg-slate-200 text-black"
                  }`}
                >
                  {t.close}
                </button>
                <button
                  onClick={() => {
                    alert(t.savedSuccess);
                    setShowProfileModal(false);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black cursor-pointer shadow-xs"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardScreen;
