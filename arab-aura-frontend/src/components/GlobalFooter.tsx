// src/components/GlobalFooter.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "./BrandLogo";
import {
  PackageIcon,
  ShieldCheckIcon,
  LightningIcon,
  StoreIcon,
  TruckIcon,
  BuildingIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PhoneIcon,
  ChatIcon,
} from "./Icons";

export const GlobalFooter: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { isDarkMode } = useTheme();
  const isRtl = lang === "ar";

  // 🔹 المميزات الحصرية للمنصة - كلام مصري أصيل واقعي 100%
  const features = [
    {
      id: "hub",
      titleAr: "شحن مجمع بالحي بـ 35 جنيه بس",
      titleEn: "Batch Hub Delivery for 35 EGP",
      descAr: "اطلب من 3 أو 4 براندات مختلفة وهنجمعهم لك في شحنة واحدة بـ 35 جنيه بس، بدل ما تدفع 80 جنيه لكل متجر لوحده.",
      descEn: "Order from multiple Egyptian brands and get them batched in a single 35 EGP delivery.",
      tagAr: "وفر 65% مصاريف شحن",
      tagEn: "Save 65%",
      Icon: PackageIcon,
      accentColor: "amber",
    },
    {
      id: "tryon",
      titleAr: "قيس وعاين براحتك عند باب بيتك",
      titleEn: "Doorstep Free Try-On & Inspect",
      descAr: "الكابتن هيستناك 10 دقائق تعاين خامة القطن وتقيس مقاسك على مهلك، عجبك استلم.. مش مضبوط؟ يرجع في ساعتها بدون أي مصاريف.",
      descEn: "Inspect cotton quality and try on sizes at your door before paying a single pound.",
      tagAr: "معاينة مجانية 100%",
      tagEn: "100% Free Try-On",
      Icon: ShieldCheckIcon,
      accentColor: "emerald",
    },
    {
      id: "express",
      titleAr: "شحن فوري إكسبريس في نفس الساعة",
      titleEn: "60-Min Express Neighborhood Delivery",
      descAr: "مستعجل على خروجة الليلة أو عندك مناسبة مفاجئة؟ أقرب كابتن في نطاق حيك هيوصلك طلبك خلال 60 دقيقة بالظبط.",
      descEn: "Need an outfit right now? Dispatched from your local neighborhood hub within 60 minutes.",
      tagAr: "توصيل خلال 60 دقيقة",
      tagEn: "60-Min Delivery",
      Icon: LightningIcon,
      accentColor: "rose",
    },
    {
      id: "cotton",
      titleAr: "قطن مصري أصيل بسعر المصنع",
      titleEn: "100% Authentic Egyptian Cotton",
      descAr: "كل القطع المعروضة مصنوعة في مصر بأيادي عمالنا المهرة ومن أنضف خامات القطن الفاخر، مباشرة من البراند لدولابك.",
      descEn: "Premium grade Egyptian cotton directly from authentic local fashion workshops and brands.",
      tagAr: "صناعة مصرية فخر",
      tagEn: "Made In Egypt",
      Icon: StoreIcon,
      accentColor: "indigo",
    },
    {
      id: "otp",
      titleAr: "استلام آمن 100% بكود OTP سري",
      titleEn: "Secure Handover with Secret OTP",
      descAr: "بيوصلك كود سري من 4 أرقام على تليفونك، محدش يقدر يستلم أوردرك غيرك، وده بيضمنلك أمان كامل لفلوسك ومشترياتك.",
      descEn: "A unique 4-digit code confirms parcel delivery right into your hands safely.",
      tagAr: "أمان واستلام مؤكد",
      tagEn: "Guaranteed Safe",
      Icon: CheckCircleIcon,
      accentColor: "sky",
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // أنيميشن هادئ وسلس يتغير تلقائياً كل 1.8 ثانية مع توقف مؤقت عند وضع الماوس
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % features.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [isPaused, features.length]);

  const activeFeature = features[activeIdx];

  const getAccentBg = (color: string) => {
    switch (color) {
      case "amber":
        return isDarkMode
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-amber-50 border-amber-200 text-amber-700";
      case "emerald":
        return isDarkMode
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "rose":
        return isDarkMode
          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
          : "bg-rose-50 border-rose-200 text-rose-700";
      case "indigo":
        return isDarkMode
          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
          : "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "sky":
      default:
        return isDarkMode
          ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
          : "bg-sky-50 border-sky-200 text-sky-700";
    }
  };

  return (
    <footer
      className={`border-t transition-colors duration-300 mt-auto select-none ${
        isDarkMode
          ? "bg-[#0B1120] border-slate-800 text-slate-200"
          : "bg-slate-50 border-slate-200 text-slate-800"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* 🔹 1. شريط المميزات الحصرية - أنيميشن مميز وهادئ يتغير كل 1.8 ثانية */}
      <div
        className={`border-b transition-colors ${
          isDarkMode
            ? "bg-[#0F172A]/90 border-slate-800/80"
            : "bg-white border-slate-200 shadow-2xs"
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* عنوان الشريط المصغر */}
            <div className="flex items-center gap-2 text-xs font-black shrink-0">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className={isDarkMode ? "text-amber-400" : "text-amber-600"}>
                {isRtl ? "ليه عرب أورا مختلفة عن أي مكان تاني؟" : "Why Shop With Arab Aura?"}
              </span>
            </div>

            {/* الميزة النشطة المعروضة بأنيميشن ناعم وسلس */}
            <div className="flex-1 w-full flex items-center justify-center">
              <div
                key={activeFeature.id}
                className={`w-full max-w-3xl flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-500 animate-fadeIn ${getAccentBg(
                  activeFeature.accentColor,
                )}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-xl bg-black/10 shrink-0">
                    <activeFeature.Icon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs sm:text-sm">
                        {isRtl ? activeFeature.titleAr : activeFeature.titleEn}
                      </span>
                      <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-black bg-white/20">
                        {isRtl ? activeFeature.tagAr : activeFeature.tagEn}
                      </span>
                    </div>
                    <p className={`text-[11px] sm:text-xs truncate ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {isRtl ? activeFeature.descAr : activeFeature.descEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setActiveIdx(
                        (prev) => (prev - 1 + features.length) % features.length,
                      )
                    }
                    className="p-1 rounded-lg hover:bg-black/10 transition cursor-pointer"
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
                      setActiveIdx((prev) => (prev + 1) % features.length)
                    }
                    className="p-1 rounded-lg hover:bg-black/10 transition cursor-pointer"
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

            {/* مؤشرات التبديل التفاعلية (Dots) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {features.map((f, idx) => (
                <button
                  key={f.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIdx === idx
                      ? "w-6 bg-amber-400"
                      : isDarkMode
                      ? "w-1.5 bg-slate-700 hover:bg-slate-500"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  title={isRtl ? f.titleAr : f.titleEn}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 2. أقسام وروابط الفوتر الرئيسية - واقعية وبلهجة مصرية أصيلة */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* العمود 1: هوية المنصة وخدمة العملاء المباشرة (عمودين على الشاشات الكبيرة) */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer inline-block"
            >
              <BrandLogo showText={true} />
            </div>

            <p
              className={`text-xs leading-relaxed max-w-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {isRtl
                ? "عرب أورا هي أول منصة مصرية بتجمع أشهر براندات ومصانع الملابس في مكان واحد، وبتحل مشكلة مصاريف الشحن بنظام التجميع بالحي بـ 35 جنيه بس، مع إمكانية المعاينة والقياس عند الباب قبل السداد."
                : "Arab Aura is the pioneer Egyptian fashion marketplace connecting local apparel brands with smart neighborhood micro-hubs for 35 EGP deliveries and free try-on."}
            </p>

            {/* كارت خدمة العملاء والدعم الفوري */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 max-w-sm ${
                isDarkMode
                  ? "bg-[#1E293B]/70 border-slate-700/80"
                  : "bg-white border-slate-200 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <PhoneIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold block text-slate-400">
                    {isRtl ? "خدمة العملاء (واتساب ومكالمات):" : "Direct Hotline & WhatsApp:"}
                  </span>
                  <a
                    href="tel:+201092242607"
                    className="font-mono font-black text-xs hover:text-emerald-400 transition"
                    dir="ltr"
                  >
                    +20 109 224 2607
                  </a>
                </div>
              </div>

              <a
                href="https://wa.me/201092242607"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px] flex items-center gap-1.5 transition shadow-xs"
              >
                <ChatIcon className="w-3.5 h-3.5" />
                <span>{isRtl ? "شات واتساب" : "WhatsApp"}</span>
              </a>
            </div>
          </div>

          {/* العمود 2: تسوق حسب الموضة والمنتجات */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
                isDarkMode
                  ? "text-white border-slate-800"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              {isRtl ? "أقسام الملابس" : "Shop Categories"}
            </h4>
            <ul
              className={`space-y-2 text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <li>
                <Link
                  to="/customer/products?category=men_tshirts"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "تيشيرتات صيفي وبولو قطن" : "Cotton T-Shirts & Polos"}
                </Link>
              </li>
              <li>
                <Link
                  to="/customer/products?category=men_pants"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "بنطلونات جينز وكارجو رجالي" : "Jeans & Cargo Pants"}
                </Link>
              </li>
              <li>
                <Link
                  to="/customer/products?category=women_tshirts"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "ملابس وكولكشن حريمي أنيق" : "Women's Collection"}
                </Link>
              </li>
              <li>
                <Link
                  to="/customer/products?category=men_shoes"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "أحذية وسنيكرز خامات مصرية" : "Casual Shoes & Sneakers"}
                </Link>
              </li>
              <li>
                <Link
                  to="/customer/products"
                  className="hover:text-amber-400 transition block text-amber-500 font-bold"
                >
                  {isRtl ? "عروض وتخفيضات المصانع المصرية" : "Factory Outlet Deals"}
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود 3: شبكة وشركاء عرب أورا في مصر */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
                isDarkMode
                  ? "text-white border-slate-800"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              {isRtl ? "الشركاء والخدمات" : "Partners & Logistics"}
            </h4>
            <ul
              className={`space-y-2 text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <li>
                <Link
                  to="/seller/dashboard"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "سجل كبراند أو مصنع ملابس" : "Sell As Brand / Factory"}
                </Link>
              </li>
              <li>
                <Link
                  to="/collector/dashboard"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "انضم كمركز تجميع بالحي (Hub)" : "Become a Neighborhood Hub"}
                </Link>
              </li>
              <li>
                <Link
                  to="/courier/dashboard"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "انضم ككابتن توصيل حر" : "Drive as Courier Captain"}
                </Link>
              </li>
              <li>
                <Link
                  to="/customer/profile?tab=orders"
                  className="hover:text-amber-400 transition block"
                >
                  {isRtl ? "تتبع مسار شحنتك لايف" : "Track Your Live Package"}
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-emerald-500 hover:underline font-bold block"
                >
                  {isRtl ? "بوابة تسجيل الدخول الموحدة" : "Unified Account Portal"}
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود 4: أسئلة شائعة وحكايتنا */}
          <div className="space-y-3">
            <h4
              className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
                isDarkMode
                  ? "text-white border-slate-800"
                  : "text-slate-900 border-slate-200"
              }`}
            >
              {isRtl ? "أمانك وحكايتنا" : "Trust & Story"}
            </h4>
            <ul
              className={`space-y-2 text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <li>
                <Link
                  to="/about"
                  className="text-amber-500 hover:underline font-black flex items-center gap-1.5"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isRtl ? "حكايتنا وإزاي خفضنا الشحن" : "Our Story & Hub Model"}</span>
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{isRtl ? "معاينة وقياس قبل دفع أي جنيه" : "Try-on before paying"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{isRtl ? "استرجاع مجاني سهل خلال 14 يوم" : "14-day hassle-free return"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{isRtl ? "تسليم مؤكد بكود الـ OTP السري" : "Verified OTP handover"}</span>
              </li>
              <li>
                <span
                  className={`text-[11px] block pt-1 ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {isRtl
                    ? "المقرات النشطة: 6 أكتوبر • الشيخ زايد • شبين الكوم"
                    : "Active Hubs: 6th October • Zayed • Shebin"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 🔹 3. شريط طرق الدفع المصرية الحقيقية */}
        <div
          className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            isDarkMode ? "border-slate-800/80" : "border-slate-200"
          }`}
        >
          <span
            className={`font-bold ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {isRtl ? "طرق الدفع المصرية المتاحة:" : "Egyptian Payment Gateways:"}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-amber-400"
                  : "bg-white border-slate-200 text-amber-600 shadow-2xs"
              }`}
            >
              إنستا باي (InstaPay)
            </span>
            <span
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-rose-400"
                  : "bg-white border-slate-200 text-rose-600 shadow-2xs"
              }`}
            >
              فودافون كاش ومحافظ المحمول
            </span>
            <span
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-amber-300"
                  : "bg-white border-slate-200 text-amber-700 shadow-2xs"
              }`}
            >
              فوري باي (كود خدمة 788)
            </span>
            <span
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-indigo-300"
                  : "bg-white border-slate-200 text-indigo-600 shadow-2xs"
              }`}
            >
              كروت ميزة / فيزا وماستركارد
            </span>
            <span
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-black ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-emerald-400"
                  : "bg-white border-slate-200 text-emerald-600 shadow-2xs"
              }`}
            >
              كاش عند الاستلام بعد المعاينة
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 4. السطر النهائي لحقوق الملكية بالهوية المصرية */}
      <div
        className={`border-t py-4 px-4 text-xs ${
          isDarkMode
            ? "border-slate-800/60 bg-black/40 text-slate-500"
            : "border-slate-200 bg-slate-100/70 text-slate-500"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span
              className={`font-bold ${
                isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {isRtl
                ? "مراكز التجميع والتوزيع شغالة ومباشرة الآن بنطاق 6 أكتوبر والمنوفية"
                : "Operational Micro-Hubs: 6th October & Menoufia"}
            </span>
          </div>

          <p className="font-bold">
            {isRtl
              ? `عرب أورا (3ARB AURA) © ${new Date().getFullYear()} - منصة مصرية 100% صُممت لحل مشكلة الشحن ودعم البراندات والمصانع المحلية.`
              : `Arab Aura © ${new Date().getFullYear()} - Crafted in Egypt to solve local logistics and empower local brands.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
