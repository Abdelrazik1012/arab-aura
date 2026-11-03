// src/pages/AboutUsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";
import GlobalFooter from "../components/GlobalFooter";
import {
  SunIcon,
  MoonIcon,
  PackageIcon,
  TruckIcon,
  BuildingIcon,
  StoreIcon,
  ShieldCheckIcon,
  LightningIcon,
  SparklesIcon,
  UsersIcon,
  MapPinIcon,
  CheckCircleIcon,
  CloseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PhoneIcon,
  ChatIcon,
} from "../components/Icons";

export const AboutUsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const isRtl = lang === "ar";
  const ArrowIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;

  // 🔹 أنيميشن تفاعلي هادئ: رحلة الأوردر من المصنع لحد باب بيتك (يتغير كل 2.6 ثانية)
  const journeySteps = [
    {
      step: 1,
      titleAr: "1. اختيار قطعك من أفضل براندات ومصانع مصر",
      titleEn: "1. Handpicked from Egypt's Top Brands",
      descAr: "بتختار التيشرت من براند، والبنطلون من براند تاني، والكوتشي من مصنع تالت.. كلهم بيتأكدوا فوراً.",
      descEn: "Select your favorite garments from independent Egyptian brands and verified workshops.",
      Icon: StoreIcon,
      accent: "amber",
      tagAr: "براندات قطنية أصلية",
      tagEn: "100% Egyptian Cotton",
    },
    {
      step: 2,
      titleAr: "2. التجميع الذكي في مركز التوزيع بحيّك (Micro-Hub)",
      titleEn: "2. Smart Neighborhood Batching (Micro-Hub)",
      descAr: "بدل ما كل مصنع يبعتلك مندوب لوحده، شحناتك كلها بتوصل لمقر التجميع في حيك (بأكتوبر أو المنوفية) وبتتجمع في باكدج واحدة نظيفة.",
      descEn: "Instead of separate couriers, all items arrive at your local neighborhood hub and get packaged together.",
      Icon: BuildingIcon,
      accent: "indigo",
      tagAr: "باكدج واحدة لكل طلباتك",
      tagEn: "Single Consolidated Parcel",
    },
    {
      step: 3,
      titleAr: "3. كابتن التوصيل بيوصلك لباب بيتك بـ 35 جنيه بس",
      titleEn: "3. Delivery Captain Dispatched for 35 EGP",
      descAr: "كابتن من أهالي المنطقة بيتحرك بطلبك في ميعاد محدد. تكلفة الشحن الإجمالية 35 جنيه بس، مهما كان عدد القطع أو البراندات!",
      descEn: "A trusted neighborhood courier delivers your consolidated parcel for a flat 35 EGP delivery fee.",
      Icon: TruckIcon,
      accent: "emerald",
      tagAr: "وفرت أكتر من 65% شحن",
      tagEn: "Save Over 65%",
    },
    {
      step: 4,
      titleAr: "4. عاين وقيس على مهلك واستلم بكود الـ OTP",
      titleEn: "4. Doorstep Inspection & Secure OTP Handover",
      descAr: "المندوب هيستناك تجرب المقاس وتتأكد من خامة القطن. عجبك؟ بتديله كود الـ OTP السري وتدفع.. مش مقاسك؟ يرجع معاه في نفس اللحظة مجاناً.",
      descEn: "Try on sizes at your door. Love it? Confirm via secret OTP code. Doesn't fit? Hand it back with zero hassle.",
      Icon: ShieldCheckIcon,
      accent: "rose",
      tagAr: "معاينة مجانية 100%",
      tagEn: "Zero-Risk Try-On",
    },
  ];

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isJourneyPaused, setIsJourneyPaused] = useState(false);

  useEffect(() => {
    if (isJourneyPaused) return;
    const interval = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % journeySteps.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [isJourneyPaused, journeySteps.length]);

  const activeStep = journeySteps[activeStepIdx];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#0F172A] text-slate-100"
          : "bg-[#F8FAFC] text-slate-900"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* حقن خط تجوال مع أوتفت لتناسق الويب سايت بالكامل */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: ${
          lang === "ar" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"
        }; }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .animate-subtle { animation: subtlePulse 3s infinite ease-in-out; }
      `}</style>

      {/* 🔝 النافبار العلوي المتناسق تماماً مع باقي المنصة */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 ${
          isDarkMode
            ? "bg-[#1E293B]/90 border-slate-700/80"
            : "bg-white/90 border-slate-200 shadow-2xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center"
            >
              <BrandLogo showText={true} />
            </div>

            <nav className="hidden md:flex items-center gap-4 text-xs font-black">
              <button
                onClick={() => navigate("/")}
                className={`transition cursor-pointer hover:text-amber-400 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {isRtl ? "الرئيسية" : "Home"}
              </button>
              <button
                onClick={() => navigate("/customer/products")}
                className={`transition cursor-pointer hover:text-amber-400 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {isRtl ? "معرض المنتجات" : "Products Catalog"}
              </button>
              <span className="text-amber-500 border-b-2 border-amber-500 pb-1 cursor-default">
                {isRtl ? "حكايتنا ونظام الحي" : "Our Story & Hubs"}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-amber-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={toggleLanguage}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                isDarkMode
                  ? "border-slate-700 hover:border-amber-400 text-slate-200"
                  : "border-slate-300 hover:border-amber-500 text-slate-700"
              }`}
            >
              {lang === "ar" ? "English" : "العربية"}
            </button>

            <button
              onClick={() => navigate("/customer/products")}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-xs"
            >
              <span>{isRtl ? "ابدأ التسوق الآن" : "Start Shopping"}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 قسم البانر الرئيسي (Hero Section) بنكهة مصرية أصيلة */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border ${
              isDarkMode
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <SparklesIcon className="w-4 h-4 text-amber-500" />
            <span>
              {isRtl
                ? "فكرة مصرية 100% بدأت من مشكلة بنعاني منها كل يوم"
                : "Proudly Egyptian • Solving Real Logistics"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            {isRtl ? (
              <>
                ليه تدفع شحن 3 مرات؟{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  شحنة واحدة بـ 35 جنيه بس
                </span>{" "}
                لكل مشترياتك!
              </>
            ) : (
              <>
                Stop Paying 3x Shipping!{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  Flat 35 EGP Delivery
                </span>{" "}
                for All Your Orders!
              </>
            )}
          </h1>

          <p
            className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {isRtl
              ? "جمعنا لك أحسن براندات ومصانع الملابس المصرية في مكان واحد. طلباتك كلها بتنزل في باكدج واحدة نظيفة عند مركز التوزيع بحيّك، وبتوصلك لباب بيتك مع كابتن المنطقة.. تقيس وتعاين براحتك قبل ما تدفع قرش واحد!"
              : "We brought together Egypt's top local apparel brands. All your orders get batched at your local neighborhood hub, arriving at your doorstep in one box with free try-on before payment."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate("/customer/products")}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>{isRtl ? "تصفح كولكشن البراندات" : "Explore Egyptian Brands"}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/201092242607"
              target="_blank"
              rel="noreferrer"
              className={`px-5 py-3 rounded-2xl border font-bold text-sm flex items-center gap-2 transition cursor-pointer ${
                isDarkMode
                  ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-white"
                  : "bg-white border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs"
              }`}
            >
              <ChatIcon className="w-4 h-4 text-emerald-500" />
              <span>{isRtl ? "كلمنا واتساب مباشرة" : "Chat on WhatsApp"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 💡 أنيميشن تفاعلي هادئ: مسار الشحنة الذكي في حيك */}
      <section
        className={`py-14 sm:py-20 border-b transition-colors duration-300 ${
          isDarkMode
            ? "bg-[#0B1120]/60 border-slate-800"
            : "bg-slate-100/60 border-slate-200"
        }`}
        onMouseEnter={() => setIsJourneyPaused(true)}
        onMouseLeave={() => setIsJourneyPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/10 text-amber-500 border border-amber-400/30">
              <LightningIcon className="w-3.5 h-3.5" />
              <span>{isRtl ? "الابتكار اللوجستي بالأرقام والخطوات" : "The Micro-Hub Innovation"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              {isRtl
                ? "إزاي شحنتك بتوصلك بـ 35 جنيه بس بدل 120 جنيه؟"
                : "How Your 35 EGP Neighborhood Delivery Works"}
            </h2>
            <p
              className={`text-xs sm:text-sm max-w-xl mx-auto ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {isRtl
                ? "دورة ذكية بتوفر وقت ومصاريف الشحن، وبتحافظ على خامة ملابسك لحد ما تقيسها في بيتك"
                : "Consolidated micro-hub logistics saving both shipping cost and parcel handling time"}
            </p>
          </div>

          {/* 4 خطوات مع أنيميشن وتفاعل سلس */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {journeySteps.map((s, idx) => {
              const isCurrent = activeStepIdx === idx;
              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStepIdx(idx)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isCurrent
                      ? isDarkMode
                        ? "bg-[#1E293B] border-amber-400 shadow-lg shadow-amber-500/10 scale-102"
                        : "bg-white border-amber-500 shadow-md scale-102"
                      : isDarkMode
                      ? "bg-[#1E293B]/60 border-slate-800 hover:border-slate-700 opacity-75"
                      : "bg-white/80 border-slate-200 hover:border-slate-300 opacity-80"
                  }`}
                >
                  {/* شريط التقدم التلقائي للخطوة النشطة */}
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 animate-pulse" />
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        isCurrent
                          ? "bg-amber-400 text-slate-950"
                          : isDarkMode
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <s.Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                        isCurrent
                          ? "bg-amber-400/20 text-amber-500"
                          : isDarkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isRtl ? `خطوة ${s.step}` : `Step ${s.step}`}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-black mb-1 line-clamp-2">
                    {isRtl ? s.titleAr : s.titleEn}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {isRtl ? s.descAr : s.descEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* كارت الشرح الموسع للخطوة النشطة */}
          <div
            className={`p-6 rounded-3xl border transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isDarkMode
                ? "bg-[#1E293B] border-slate-700/80"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                <activeStep.Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-500">
                    {isRtl ? `تفاصيل المرحلة ${activeStep.step}:` : `Step ${activeStep.step} Details:`}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
                    {isRtl ? activeStep.tagAr : activeStep.tagEn}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black mt-0.5">
                  {isRtl ? activeStep.titleAr : activeStep.titleEn}
                </h4>
                <p
                  className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {isRtl ? activeStep.descAr : activeStep.descEn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  setActiveStepIdx(
                    (prev) => (prev - 1 + journeySteps.length) % journeySteps.length,
                  )
                }
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isDarkMode
                    ? "border-slate-700 hover:bg-slate-800"
                    : "border-slate-300 hover:bg-slate-100"
                }`}
                title="السابق"
              >
                {isRtl ? (
                  <ChevronRightIcon className="w-4 h-4" />
                ) : (
                  <ChevronLeftIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() =>
                  setActiveStepIdx((prev) => (prev + 1) % journeySteps.length)
                }
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isDarkMode
                    ? "border-slate-700 hover:bg-slate-800"
                    : "border-slate-300 hover:bg-slate-100"
                }`}
                title="التالي"
              >
                {isRtl ? (
                  <ChevronLeftIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ⚖️ مقارنة واقعية: الفرق بين الشحن التقليدي وطريقة عرب أورا */}
      <section className="py-16 sm:py-20 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black">
              {isRtl ? "مقارنة حقيقية تفرق في جيبك ووقتك" : "The True Difference in Your Pocket"}
            </h2>
            <p
              className={`text-xs sm:text-sm max-w-xl mx-auto ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {isRtl
                ? "تعال نشوف بتدفع كام وبتستنى إزاي لو طلبت 3 قطع ملابس من 3 براندات مختلفة"
                : "What happens when you order from 3 Egyptian fashion brands?"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* الشحن العادي القديم */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${
                isDarkMode
                  ? "bg-rose-950/20 border-rose-900/40 text-slate-200"
                  : "bg-rose-50/70 border-rose-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center font-black">
                    <CloseIcon className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm text-rose-500">
                    {isRtl ? "الشحن التقليدي في مصر" : "Traditional Online Shipping"}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">
                  ~150 إلى 200 ج
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black mt-0.5">•</span>
                  <span>
                    {isRtl
                      ? "كل براند بيبعت مندوب منفصل.. يعني بتدفع 60 أو 70 جنيه شحن لكل قطعة لوحدها!"
                      : "Separate courier per brand; you pay ~60-80 EGP per store."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black mt-0.5">•</span>
                  <span>
                    {isRtl
                      ? "بتفضل قاعد في البيت 3 أيام مختلفة مستني 3 مناديب يتصلوا بيك في مواعيد عشوائية."
                      : "Waiting across multiple days for 3 different couriers."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-black mt-0.5">•</span>
                  <span>
                    {isRtl
                      ? "ممنوع تفتح الكيس أو تعاين القطعة قبل ما تدفع الفلوس للمندوب.. ولو المقاس طلع مش مضبوط بتدخل في دوامة استرجاع وشحن تاني!"
                      : "Zero try-on policy; pay first before even seeing the garment."}
                  </span>
                </li>
              </ul>
            </div>

            {/* طريقة عرب أورا الجديدة الذكية */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border space-y-5 relative ${
                isDarkMode
                  ? "bg-emerald-950/25 border-emerald-500/50 text-slate-100 shadow-xl shadow-emerald-950/20"
                  : "bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-sm"
              }`}
            >
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] shadow-xs">
                  {isRtl ? "وفر فلوسك ووقتك" : "Smart & Fair"}
                </span>
              </div>

              <div className="flex items-center gap-2 border-b border-emerald-500/30 pb-4 pt-4 sm:pt-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-emerald-500">
                  {isRtl ? "نظام عرب أورا (مقر الحي)" : "Arab Aura Neighborhood Hub"}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "شحن مجمع بـ 35 جنيه بس: مهما طلبت من 3 أو 5 براندات، كلهم بيوصلوك في شحنة واحدة وبسعر شحنة واحدة!"
                      : "35 EGP flat shipping: Order from 3+ brands and receive everything in one single delivery."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "مندوب واحد في ميعاد محدد: كابتن منطقتك بيكلمك في ميعاد مناسب ليك بدون تشتيت."
                      : "Single local captain arriving at a confirmed convenient time."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    {isRtl
                      ? "معاينة وقياس مجاني عند الباب: الكابتن بيستناك تقيس براحتك، وتتأكد من خامة القطن والتطريز، وتدفع بكود OTP السري فقط لما ترتاح للقطعة."
                      : "100% free doorstep try-on; inspect fabric and fit, verify with OTP."}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 أرقام وإحصائيات واقعية */}
      <section className="py-16 sm:py-20 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className={`p-6 rounded-3xl border text-center space-y-2 transition-transform hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-[#1E293B] border-slate-700/60"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 block">
                35 ج.م
              </span>
              <h4 className="text-xs sm:text-sm font-black">
                {isRtl ? "سعر الشحن المجمع بالحي" : "Flat Neighborhood Delivery"}
              </h4>
              <p
                className={`text-[11px] ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isRtl ? "وفر أكتر من 65% من التكلفة" : "Saves over 65% in fees"}
              </p>
            </div>

            <div
              className={`p-6 rounded-3xl border text-center space-y-2 transition-transform hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-[#1E293B] border-slate-700/60"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 block">
                100%
              </span>
              <h4 className="text-xs sm:text-sm font-black">
                {isRtl ? "قطن وصناعة مصرية" : "Egyptian Cotton"}
              </h4>
              <p
                className={`text-[11px] ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isRtl ? "أجود خامات وتقفيل مصانع" : "Direct factory craftsmanship"}
              </p>
            </div>

            <div
              className={`p-6 rounded-3xl border text-center space-y-2 transition-transform hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-[#1E293B] border-slate-700/60"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <span className="text-3xl sm:text-4xl font-black font-mono text-rose-400 block">
                0 ج.م
              </span>
              <h4 className="text-xs sm:text-sm font-black">
                {isRtl ? "مصاريف المعاينة والقياس" : "Free Doorstep Inspection"}
              </h4>
              <p
                className={`text-[11px] ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isRtl ? "قيس الأول وتأكد من المقاس" : "Try on before paying"}
              </p>
            </div>

            <div
              className={`p-6 rounded-3xl border text-center space-y-2 transition-transform hover:-translate-y-1 ${
                isDarkMode
                  ? "bg-[#1E293B] border-slate-700/60"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <span className="text-3xl sm:text-4xl font-black font-mono text-indigo-400 block">
                60 دقيقة
              </span>
              <h4 className="text-xs sm:text-sm font-black">
                {isRtl ? "توصيل إكسبريس فوري" : "Instant 60-Min Express"}
              </h4>
              <p
                className={`text-[11px] ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isRtl ? "للحالات والمناسبات المستعجلة" : "For urgent same-day needs"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🤝 دعوة للانضمام والشركاء */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 max-w-4xl mx-auto ${
              isDarkMode
                ? "bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-slate-700/80"
                : "bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-sm"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-500 mx-auto flex items-center justify-center font-black">
              <SparklesIcon className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black">
              {isRtl
                ? "جاهز تجرب تجربة تسوق ملابس جديدة ومحترمة في مصر؟"
                : "Ready for an Authentic Egyptian Fashion Experience?"}
            </h3>

            <p
              className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {isRtl
                ? "ابدأ بتصفح الكتالوج واطلب اللي يعجبك.. الشحن مجمع بـ 35 جنيه بس، والمعاينة مجانية عند باب بيتك!"
                : "Browse the catalog and order what fits your style with 35 EGP delivery and free try-on."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/customer/products")}
                className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer shadow-md"
              >
                {isRtl ? "تصفح جميع المنتجات والماركات" : "Shop All Collections"}
              </button>
              <button
                onClick={() => navigate("/seller/dashboard")}
                className={`px-5 py-3 rounded-2xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
                  isDarkMode
                    ? "border-slate-700 hover:bg-slate-800 text-slate-200"
                    : "border-slate-300 hover:bg-slate-100 text-slate-800"
                }`}
              >
                {isRtl ? "انضم كبراند أو مصنع شريك" : "Partner as Brand / Factory"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 الفوتر الموحد */}
      <GlobalFooter />
    </div>
  );
};

export default AboutUsPage;
