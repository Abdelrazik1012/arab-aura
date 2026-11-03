import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import InteractivePlatformMap from "../../components/InteractivePlatformMap";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  PackageIcon,
  TrendingUpIcon,
  TruckIcon,
  MapPinIcon,
  SparklesIcon,
  PhoneIcon,
  QrCodeIcon,
  CloseIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  LightningIcon,
  ClockIcon,
  ChatIcon,
  MapIcon,
  InfoIcon,
} from "../../components/Icons";

interface TimelineStep {
  title: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

interface PackageItem {
  id: string;
  name: string;
  qty: number;
  sellerOffice: string;
}

interface DeliveryOrder {
  id: string;
  packageCode: string;
  manifestId: string;
  hubName: string;
  customerName: string;
  phone: string;
  address: string;
  zone: string;
  codAmount: number;
  paymentType: "COD" | "ONLINE";
  status: "assigned" | "out_for_delivery" | "delivered" | "failed";
  otpCode: string;
  failedReason?: string;
  packageItems: PackageItem[];
  timeline: TimelineStep[];
}

export const DriverDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { orders, packages, updateOrderStatus, updatePackageStatus, acceptExpressDelivery } =
    usePlatform();

  const { isDarkMode, toggleTheme } = useTheme();

  const [isAvailable, setIsAvailable] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // 📦 قائمة الشحنات الافتراضية لقائد التوصيل
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([
    {
      id: "ORD-9821",
      packageCode: "PKG-MONUF-901",
      manifestId: "MNF-8021",
      hubName: "مقر المُجمّع: محمود حسن (حي الأشجار - Micro-Hub)",
      customerName: "محمود عبد الفتاح",
      phone: "01012345678",
      address: "شبين الكوم - شارع الجلاء - بجوار الاستاد الرياضي",
      zone: "المنوفية - شبين الكوم",
      codAmount: 1340,
      paymentType: "COD",
      status: "out_for_delivery",
      otpCode: "4821",
      packageItems: [
        {
          id: "1",
          name: "تيشيرت بولو قطن 100% Town Team",
          qty: 2,
          sellerOffice: "Town Team (مول العرب)",
        },
        {
          id: "2",
          name: "بنطلون جينز كاجوال مريح",
          qty: 1,
          sellerOffice: "Town Team (مول العرب)",
        },
      ],
      timeline: [
        { title: "تم التجهيز لدى البائع", time: "10:00 AM", completed: true },
        { title: "استلام المُجمّع (Collector)", time: "11:30 AM", completed: true },
        { title: "تم التجميع لدى مُجمّع الحي بالحزمة", time: "01:00 PM", completed: true },
        { title: "جاري التوصيل مع السائق", time: "02:15 PM", completed: true, active: true },
        { title: "تم التسليم للعميل", time: "—", completed: false },
      ],
    },
    {
      id: "ORD-9822",
      packageCode: "PKG-MONUF-901",
      manifestId: "MNF-8021",
      hubName: "مقر المُجمّع: محمود حسن (حي الأشجار - Micro-Hub)",
      customerName: "إسلام رضوان",
      phone: "01099887766",
      address: "الباجور - شارع الجيش - ميدان المحطة",
      zone: "المنوفية - الباجور",
      codAmount: 0,
      paymentType: "ONLINE",
      status: "out_for_delivery",
      otpCode: "3190",
      packageItems: [
        {
          id: "3",
          name: "قميص كلاسيك إيطالي Tie House",
          qty: 1,
          sellerOffice: "Tie House (الحصري)",
        },
      ],
      timeline: [
        { title: "تم التجهيز لدى البائع", time: "09:00 AM", completed: true },
        { title: "استلام المُجمّع (Collector)", time: "10:15 AM", completed: true },
        { title: "مجمع لدى مُجمّع الحي بالحزمة", time: "12:00 PM", completed: true },
        { title: "جاري التوصيل مع السائق", time: "01:30 PM", completed: true, active: true },
        { title: "تم التسليم للعميل", time: "—", completed: false },
      ],
    },
    {
      id: "ORD-EXP-7701",
      packageCode: "EXP-DIRECT-01",
      manifestId: "EXP-8899",
      hubName: "توصيل فوري مباشر من المتجر",
      customerName: "سارة خالد الشريف",
      phone: "01198765432",
      address: "الشيخ زايد - كمبوند زايد ديونز - فيلا 14B",
      zone: "الجيزة - الشيخ زايد",
      codAmount: 0,
      paymentType: "ONLINE",
      status: "out_for_delivery",
      otpCode: "7701",
      packageItems: [
        {
          id: "4",
          name: "تيشيرت بولو قطن (شحن سريع ⚡)",
          qty: 4,
          sellerOffice: "Town Team (مول العرب)",
        },
      ],
      timeline: [
        { title: "طلب شحن فوري Express", time: "04:40 PM", completed: true },
        { title: "استلام مباشر من مول العرب", time: "05:00 PM", completed: true },
        { title: "في الطريق للتسليم للعميل", time: "05:10 PM", completed: true, active: true },
        { title: "تم التسليم للعميل", time: "—", completed: false },
      ],
    },
  ]);

  const [filterTab, setFilterTab] = useState<string>("all");

  // 🔒 مودال تأكيد التسليم بالـ OTP
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] =
    useState<DeliveryOrder | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState(false);

  // 🗺️ مودال تفاصيل مسار الرحلة والباكيدج
  const [selectedOrderForJourney, setSelectedOrderForJourney] =
    useState<DeliveryOrder | null>(null);

  // ⚠️ مودال الإبلاغ عن تعذر التسليم
  const [selectedOrderForFailed, setSelectedOrderForFailed] =
    useState<DeliveryOrder | null>(null);
  const [failReason, setFailReason] = useState("العميل لا يجيب على الهاتف");

  // 🧠🚀 مسار التوصيل الأمثل بالذكاء الاصطناعي (AI Route Optimizer)
  const [showAiRouteModal, setShowAiRouteModal] = useState(false);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);
  const [optimizedApplied, setOptimizedApplied] = useState(false);

  // الحزم الجاهزة للاستلام من المجمع بالهب
  const readyPackagesAtHub = packages.filter((p) => p.status === "ready_at_hub");

  // طلبات الشحن الفوري السريع
  const expressOrdersReady = orders.filter(
    (o) => o.shippingType === "express" && o.status === "ready_for_collection",
  );

  const optimalStops = [
    {
      stopNumber: 1,
      title: "نقطة الانطلاق: مقر المُجمّع محمود حسن (حي الأشجار - Micro-Hub)",
      type: "hub",
      eta: "09:00 ص",
      dist: "0 كم",
    },
    {
      stopNumber: 2,
      title: "المحطة الأولى: محمود عبد الفتاح (شبين الكوم - شارع الجلاء)",
      orderId: "ORD-9821",
      type: "customer",
      eta: "10:15 ص",
      dist: "48 كم عبر الدائري الإقليمي",
      note: "تسليم كاش COD - 1340 EGP (OTP: 4821)",
    },
    {
      stopNumber: 3,
      title: "المحطة الثانية: أحمد سامي النجار (شبين الكوم - شارع باريس)",
      orderId: "ORD-9823",
      type: "customer",
      eta: "10:35 ص",
      dist: "3.2 كم داخلي",
      note: "مدفوع بالكامل أونلاين عبر InstaPay",
    },
    {
      stopNumber: 4,
      title: "المحطة الثالثة: إسلام رضوان (الباجور - ميدان المحطة)",
      orderId: "ORD-9822",
      type: "customer",
      eta: "11:05 ص",
      dist: "12 كم",
      note: "مدفوع فودافون كاش (OTP: 3190)",
    },
  ];

  const handleApplyOptimalRoute = () => {
    setOptimizedApplied(true);
    setShowAiRouteModal(false);
    setTimeout(() => setOptimizedApplied(false), 5000);
  };

  const isRtl = lang === "ar";

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  // استلام السائق لحزمة مجمعة من الهب
  const handleDriverPickupPackage = (pkgId: string) => {
    updatePackageStatus(pkgId, "in_transit", "أحمد محمود (سائق التوصيل)");
    setToastMessage(`✓ تم استلام الحزمة (${pkgId}) بنجاح وبدء خط سير المنوفية!`);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // قبول سائق لشحن فوري Express
  const handleAcceptExpressOrder = (orderId: string) => {
    acceptExpressDelivery(orderId, "أحمد محمود (سائق الشحن الفوري)");
    setToastMessage(`⚡ تم قبول الشحن الفوري للطلب (${orderId}) والتحرك للاستلام!`);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;

    if (
      enteredOtp === selectedOrderForDelivery.otpCode ||
      enteredOtp === "1234"
    ) {
      updateOrderStatus(
        selectedOrderForDelivery.id,
        "delivered",
        "أحمد محمود (سائق التوصيل)",
        "تم التحقق من كود التسليم OTP وتسليم الشحنة للعميل بنجاح",
      );

      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.id === selectedOrderForDelivery.id) {
            const updatedTimeline = d.timeline.map((step, idx) =>
              idx === d.timeline.length - 1
                ? { ...step, completed: true, active: false, time: "الآن" }
                : { ...step, active: false },
            );
            return { ...d, status: "delivered", timeline: updatedTimeline };
          }
          return d;
        }),
      );
      setSelectedOrderForDelivery(null);
      setEnteredOtp("");
      setOtpError(false);
      setToastMessage(`✓ تم تسليم الطلب (${selectedOrderForDelivery.id}) بنجاح!`);
      setTimeout(() => setToastMessage(""), 4000);
    } else {
      setOtpError(true);
    }
  };

  const handleReportFailedDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForFailed) return;

    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === selectedOrderForFailed.id
          ? { ...d, status: "failed", failedReason: failReason }
          : d,
      ),
    );
    setSelectedOrderForFailed(null);
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterTab === "all") return true;
    return d.status === filterTab;
  });

  const totalAssigned = deliveries.length;
  const totalDelivered = deliveries.filter(
    (d) => d.status === "delivered",
  ).length;
  const totalCashCollected = deliveries
    .filter((d) => d.status === "delivered" && d.paymentType === "COD")
    .reduce((sum, d) => sum + d.codAmount, 0);

  const t = {
    title: isRtl ? "لوحة قائد التوصيل واللوجستيات" : "Driver Logistics Hub",
    dashboard: isRtl ? "الرئيسية" : "Dashboard",
    orders: isRtl ? "شحنات المسار" : "Deliveries",
    wallet: isRtl ? "محفظة الكاش" : "Cash Wallet",
    logout: isRtl ? "خروج" : "Logout",
    online: isRtl ? "متوفر للرحلات" : "Available",
    offline: isRtl ? "غير متوفر" : "Offline",
    kpiAssigned: isRtl ? "شحنات المسار النشطة" : "Active Manifest Orders",
    kpiCompleted: isRtl ? "تم تسليمها بنجاح" : "Delivered Today",
    kpiCash: isRtl ? "الكاش المحصل (COD)" : "Cash Collected",
    activeShipments: isRtl
      ? "جدول خط السير ومانفيست اليوم (أكتوبر ➔ المنوفية)"
      : "Active Delivery Route & Manifest",
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-black"
      }`}
    >
      {/* 🔹 شريط التنقل العلوي المباشر */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="cursor-pointer"
              onClick={() => navigate("/driver/dashboard")}
            >
              <BrandLogo showText={true} />
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-lg border hidden md:inline-block ${
                isDarkMode
                  ? "bg-slate-800 text-amber-400 border-slate-700"
                  : "bg-amber-50 text-amber-950 border-amber-200"
              }`}
            >
              {t.title}
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-2 text-xs font-black">
            <button
              onClick={() => navigate("/driver/dashboard")}
              className="px-3 py-2 rounded-xl transition cursor-pointer bg-amber-500 text-black shadow-xs"
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => navigate("/driver/orders")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.orders}
            </button>
            <button
              onClick={() => navigate("/driver/wallet")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.wallet}
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                isAvailable
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/30"
              }`}
            >
              {isAvailable ? t.online : t.offline}
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-amber-400"
                  : "bg-white border-slate-300 text-black hover:bg-slate-100"
              }`}
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

      {/* شريط التنقل السفلي للهواتف */}
      <div
        className={`lg:hidden border-b px-4 py-2.5 flex items-center justify-around text-xs font-black ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-black"
        }`}
      >
        <button
          onClick={() => navigate("/driver/dashboard")}
          className="cursor-pointer text-amber-500"
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => navigate("/driver/orders")}
          className="cursor-pointer"
        >
          {t.orders}
        </button>
        <button
          onClick={() => navigate("/driver/wallet")}
          className="cursor-pointer"
        >
          {t.wallet}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black text-center animate-fade-in flex items-center justify-center gap-2">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 🗺️ خريطة السائق التفاعلية مع مسار التوصيل الأمثل المولد بالـ AI */}
        <InteractivePlatformMap
          role="driver"
          showAiOptimalRoute={true}
          title={
            isRtl
              ? "خريطة السائق الميدانية ومسار الذكاء الاصطناعي (أكتوبر ➔ شبين الكوم والباجور)"
              : "Driver Live Navigation & AI Route Map"
          }
          subtitle={
            isRtl
              ? "نطاق الاستلام 6 أكتوبر - مسار التسليم المجمع: شبين الكوم والباجور بالمنوفية مع طلبات Express الفورية"
              : "Pickup hub in October, consolidated deliveries in Menoufia & instant express stops"
          }
        />

        {/* 💡 حاسبة الذكاء الاصطناعي لحمولة الرحلة ومضاعفة صافي أرباح السائق */}
        <div
          className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
            isDarkMode
              ? "bg-slate-900 border-indigo-500/30 text-white"
              : "bg-indigo-50/50 border-indigo-200 text-black"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-indigo-500/20">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <TrendingUpIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-indigo-400">
                  {isRtl
                    ? "مستشار الذكاء الاصطناعي لتعظيم ربحية رحلة السائق"
                    : "AI Trip Load & Net Profit Optimizer"}
                </h3>
                <p className="text-[11px] opacity-70">
                  {isRtl
                    ? "حساب عدد الشحنات الأمثل لنقلها من 6 أكتوبر إلى المنوفية لتحقيق أعلى دخل صافي بأقل استهلاك وقود"
                    : "Optimal multi-package load from October to Menoufia for maximum net earnings"}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xs flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>صافي ربح متوقع: +400 ج.م للرحلة</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="opacity-60 block text-[10px]">الحمولة المقترحة للرحلة:</span>
              <span className="font-black text-sm text-amber-500">6 طرود مجمعة</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="opacity-60 block text-[10px]">استهلاك الوقود التقديري:</span>
              <span className="font-black text-sm text-rose-400">140 ج.م بنزين</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="opacity-60 block text-[10px]">إجمالي العائد من الطرود:</span>
              <span className="font-black text-sm text-emerald-500">540 ج.م</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="opacity-60 block text-[10px]">سعر الشحن للعميل:</span>
              <span className="font-black text-sm text-indigo-400">35 ج.م فقط (ثابت ✓)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] font-bold">
            <span className="text-amber-500 font-black flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>نصائح المحرك الذكي للمسار الأعلى ربحية:</span>
            </span>
            <p className="opacity-80">
              • استلام طرود خط المنوفية دفعة واحدة من مقر المُجمّع (حي الأشجار - Micro-Hub) وتسليمها بالترتيب (أشمون ➔ الباجور ➔ شبين الكوم) يوفر 45 دقيقة و 35% من استهلاك البنزين.
            </p>
            <p className="opacity-80">
              • تأكيد التسليم مع كل عميل برمز الـ OTP فوري ولا يتطلب أي انتظار ورقي، مما يرفع تقييمك إلى 4.9+ نجوم.
            </p>
            <p className="text-emerald-500 font-black">
              • التكلفة على العميل مخفضة 35 ج.م فقط بفضل ميزة التجميع الذكي بالمنصة دون أي زيادة على المستهلك!
            </p>
          </div>
        </div>

        {/* 📦 قسم الحزم الجديدة بانتظار استلام السائق من المُجمّع (Collector Hub Batches) */}
        {readyPackagesAtHub.length > 0 && (
          <div
            className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
              isDarkMode
                ? "bg-slate-900 border-amber-500/30 text-white"
                : "bg-amber-50/50 border-amber-300 text-black"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-amber-500/20">
              <div className="flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-black text-sm text-amber-500">
                    طرود مجمعة جديدة جاهزة للاستلام من مقر مُجمّع الحي (Micro-Hub)
                  </h3>
                  <p className="text-[11px] opacity-70">
                    قام المُجمّع بتجهيز هذه الباكجات الموحدة في أكتوبر بانتظار استلامك لنقلها للمحافظات
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 text-slate-950">
                {readyPackagesAtHub.length} حزم بانتظارك
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {readyPackagesAtHub.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800"
                      : "bg-white border-amber-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-xs text-amber-500">
                      {pkg.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-black bg-emerald-500/10 text-emerald-400">
                      {pkg.ordersCount} شحنات مجمعة
                    </span>
                  </div>

                  <h4 className="font-black text-sm">{pkg.title}</h4>
                  <p className="text-xs opacity-70 flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>الوجهة: {pkg.destinationCity} ({pkg.destinationZone})</span>
                  </p>
                  <p className="text-[11px] font-mono opacity-60">
                    الطلبات المشمولة: {pkg.orderIds.join(" ، ")}
                  </p>

                  {pkg.savingsRatio && (
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg flex items-center gap-1.5">
                      <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{pkg.savingsRatio}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleDriverPickupPackage(pkg.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <TruckIcon className="w-4 h-4" />
                    <span>استلام الباكج من مجمع أكتوبر والبدء بالرحلة</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚡ قسم طلبات الشحن الفوري السريع Express */}
        {expressOrdersReady.length > 0 && (
          <div
            className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
              isDarkMode
                ? "bg-slate-900 border-rose-500/30 text-white"
                : "bg-rose-50/50 border-rose-300 text-black"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-rose-500/20">
              <div className="flex items-center gap-2">
                <LightningIcon className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="font-black text-sm text-rose-500">
                    طلبات شحن فوري Express (استلام مباشر من المتجر كـ Uber Direct)
                  </h3>
                  <p className="text-[11px] opacity-70">
                    طلبات مستعجلة جاهزة لدى التاجر في 6 أكتوبر للتسليم المباشر خلال 60 دقيقة
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-600 text-white">
                {expressOrdersReady.length} متاح الآن
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {expressOrdersReady.map((ord) => (
                <div
                  key={ord.id}
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800"
                      : "bg-white border-rose-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-xs text-rose-500">
                      {ord.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-black bg-rose-500/10 text-rose-500">
                      ⚡ Express تسليم مباشر
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-black text-indigo-400">
                      المتجر: {ord.sellerName} ({ord.sellerAddress})
                    </p>
                    <p className="opacity-80">
                      العميل: {ord.customerName} - {ord.city}
                    </p>
                    <p className="font-black text-emerald-500">
                      قيمة الشحن: {ord.shippingFee} ج.م | الإجمالي: {ord.totalAmount} ج.م
                    </p>
                  </div>

                  <button
                    onClick={() => handleAcceptExpressOrder(ord.id)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span>قبول الشحن الفوري والتحرك للمتجر الآن</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📊 بطاقات المؤشرات اللوجستية السريعة */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className={`p-5 rounded-2xl border shadow-xs ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <span className="text-xs font-black opacity-60 block">
              {t.kpiAssigned}
            </span>
            <h2 className="text-2xl font-black mt-1 text-amber-500">
              {totalAssigned} <span className="text-xs">طرد</span>
            </h2>
          </div>

          <div
            className={`p-5 rounded-2xl border shadow-xs ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <span className="text-xs font-black opacity-60 block">
              {t.kpiCompleted}
            </span>
            <h2 className="text-2xl font-black mt-1 text-emerald-500">
              {totalDelivered} <span className="text-xs">تمت</span>
            </h2>
          </div>

          <div
            className={`p-5 rounded-2xl border shadow-xs ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-300"
            }`}
          >
            <span className="text-xs font-black opacity-60 block">
              {t.kpiCash}
            </span>
            <h2 className="text-2xl font-black mt-1 text-indigo-500">
              {totalCashCollected} <span className="text-xs">EGP</span>
            </h2>
          </div>
        </div>

        {/* 🔘 تبويبات الفلترة وزر تحسين المسار بالذكاء الاصطناعي */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black w-full sm:w-auto">
            {[
              { id: "all", label: isRtl ? "جميع الشحنات" : "All Deliveries" },
              {
                id: "out_for_delivery",
                label: isRtl ? "جاري التوصيل" : "Out for Delivery",
              },
              {
                id: "delivered",
                label: isRtl ? "تم التسليم بنجاح" : "Delivered",
              },
              {
                id: "failed",
                label: isRtl ? "تعذر التسليم" : "Failed / Postponed",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl transition cursor-pointer whitespace-nowrap ${
                  filterTab === tab.id
                    ? "bg-amber-500 text-black shadow-xs font-black"
                    : isDarkMode
                      ? "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                      : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsOptimizingRoute(true);
              setShowAiRouteModal(true);
              setTimeout(() => setIsOptimizingRoute(false), 800);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1.5 text-xs shrink-0"
          >
            <SparklesIcon className="w-4 h-4 text-slate-950" />
            <span>
              {isRtl
                ? "ترتيب المسار الأمثل بالـ AI"
                : "AI Optimal Route"}
            </span>
          </button>
        </div>

        {optimizedApplied && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center justify-between animate-fade-in">
            <span>
              {isRtl
                ? "✓ تم تطبيق ترتيب المسار الأمثل بالذكاء الاصطناعي بنجاح (توفير 28% في المسافة ووقت الرحلة)!"
                : "✓ AI Optimal Route successfully applied (Saved 28% in distance & delivery time)!"}
            </span>
            <button
              onClick={() => setOptimizedApplied(false)}
              className="p-1 rounded-lg hover:bg-emerald-500/20 cursor-pointer"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 🚛 قائمة الشحنات مع تفاصيل الرحلة والباكيدج */}
        <div
          className={`rounded-2xl border shadow-xs overflow-hidden ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-300"
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black text-sm flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-amber-500" />
              <span>{t.activeShipments}</span>
            </h3>
            <span className="text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg">
              {isRtl ? "المانفيست: MNF-8021" : "Manifest: MNF-8021"}
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredDeliveries.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-500 text-xs">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold flex items-center gap-1">
                      <PackageIcon className="w-3 h-3" />
                      <span>{item.packageCode}</span>
                    </span>
                    <span className="text-xs font-black text-slate-400">
                      • {item.zone}
                    </span>
                  </div>
                  <h4 className="font-black text-sm">{item.customerName}</h4>
                  <p className="text-xs opacity-70 flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{item.address}</span>
                  </p>
                  {item.failedReason && (
                    <p className="text-[11px] font-black text-rose-500 pt-0.5">
                      ⚠️ سبب التعذر: {item.failedReason}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <div className="text-right sm:text-left">
                    <p className="text-xs font-black">
                      {item.paymentType === "COD" ? (
                        <span className="text-emerald-500 font-mono text-sm">
                          {item.codAmount} EGP (كاش)
                        </span>
                      ) : (
                        <span className="text-indigo-400 font-black">
                          مدفوع أونلاين ✓
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] opacity-50 block">
                      كود التأكيد: {item.otpCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* زر مسار الرحلة والباكيدج */}
                    <button
                      onClick={() => setSelectedOrderForJourney(item)}
                      className="p-2.5 px-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                      title="عرض مسار الرحلة ومكونات الطرد"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <span>المسار</span>
                    </button>

                    <a
                      href={`tel:${item.phone}`}
                      className="p-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded-xl text-xs font-black text-center cursor-pointer flex items-center justify-center text-slate-700 dark:text-slate-300"
                      title="اتصال بالعميل"
                    >
                      <PhoneIcon className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/2${item.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 px-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-black text-center cursor-pointer transition flex items-center gap-1"
                      title="محادثة واتساب"
                    >
                      <span>واتساب</span>
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(item.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-xl text-xs font-black text-center cursor-pointer transition flex items-center justify-center"
                      title="موقع العميل على الخريطة"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                    </a>

                    {item.status !== "delivered" &&
                      item.status !== "failed" && (
                        <button
                          onClick={() => setSelectedOrderForFailed(item)}
                          className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black transition cursor-pointer"
                          title="تعذر التسليم"
                        >
                          تعذر
                        </button>
                      )}

                    {item.status === "delivered" ? (
                      <span className="px-3 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-black flex items-center gap-1">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        <span>تم التسليم</span>
                      </span>
                    ) : item.status === "failed" ? (
                      <span className="px-3 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-black">
                        تعذر التسليم
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedOrderForDelivery(item)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-xs cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1.5"
                      >
                        <QrCodeIcon className="w-3.5 h-3.5" />
                        <span>تأكيد التسليم (OTP)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 🛤️ مودال عرض مسار الرحلة والباكيدج التفصيلي */}
      {selectedOrderForJourney && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-lg w-full p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-sm flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-amber-500" />
                  <span>
                    مسار الرحلة والباكيدج ({selectedOrderForJourney.id})
                  </span>
                </h3>
                <p className="text-[11px] opacity-60 font-mono mt-0.5">
                  Package: {selectedOrderForJourney.packageCode} |{" "}
                  {selectedOrderForJourney.hubName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForJourney(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* الخط الزمني لرحلة الشحنة */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-amber-500 flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>تتبع مراحل التسليم:</span>
              </h4>
              <div className="relative border-r-2 border-amber-500/30 mr-3 space-y-4 pr-4">
                {selectedOrderForJourney.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-start justify-between text-xs"
                  >
                    <div
                      className={`absolute -right-[21px] top-1 w-3 h-3 rounded-full border-2 ${
                        step.completed
                          ? "bg-amber-500 border-amber-500"
                          : "bg-slate-800 border-slate-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-black ${step.completed ? "text-amber-400" : "opacity-50"}`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] opacity-50">{step.time}</p>
                    </div>
                    {step.completed && (
                      <span className="text-[10px] text-emerald-500 font-bold">
                        ✓ مكتمل
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* قائمة العناصر والمنتجات بداخل الطرد */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-black text-xs text-indigo-400 flex items-center gap-1.5">
                <PackageIcon className="w-3.5 h-3.5" />
                <span>محتويات الطرد ومكاتب التجار:</span>
              </h4>
              <div className="space-y-2">
                {selectedOrderForJourney.packageItems.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{pkg.name}</p>
                      <span className="text-[10px] opacity-60">
                        مكتب التاجر: {pkg.sellerOffice}
                      </span>
                    </div>
                    <span className="font-mono font-bold px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg">
                      x{pkg.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderForJourney(null)}
              className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-black cursor-pointer transition"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

      {/* 🔒 مودال تأكيد التسليم وإدخال الـ OTP */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-sm flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                  <span>تأكيد تسليم الشحنة ({selectedOrderForDelivery.id})</span>
                </h3>
                <p className="text-[11px] opacity-60 mt-0.5">
                  العميل: {selectedOrderForDelivery.customerName}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrderForDelivery(null);
                  setEnteredOtp("");
                  setOtpError(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4">
              <div
                className={`p-4 rounded-xl border text-center space-y-1 ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800"
                    : "bg-amber-50/50 border-amber-200"
                }`}
              >
                <span className="text-[11px] opacity-60 block">
                  مبلغ التحصيل المطلوب (COD):
                </span>
                <span className="text-xl font-mono font-black text-emerald-500">
                  {selectedOrderForDelivery.paymentType === "COD"
                    ? `${selectedOrderForDelivery.codAmount} EGP`
                    : "مدفوع إلكترونياً (0 EGP)"}
                </span>
                <p className="text-[10px] text-amber-500 font-bold mt-1 flex items-center gap-1">
                  <InfoIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>كود التحقق لدى العميل:</span>
                  <span className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {selectedOrderForDelivery.otpCode}
                  </span>
                  <span>(أو 1234)</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-black mb-1.5">
                  أدخل كود الـ OTP المكون من 4 أرقام:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    setOtpError(false);
                  }}
                  placeholder="مثال: 4821"
                  className={`w-full p-3 rounded-xl border text-center font-mono text-lg font-black tracking-widest outline-none transition ${
                    otpError
                      ? "border-rose-500 bg-rose-500/10 text-rose-500"
                      : isDarkMode
                        ? "bg-slate-950 border-slate-700 text-white focus:border-amber-500"
                        : "bg-slate-50 border-slate-300 text-black focus:border-amber-500"
                  }`}
                  autoFocus
                />
                {otpError && (
                  <p className="text-rose-500 text-xs font-black mt-1 text-center">
                    ⚠️ كود الـ OTP غير صحيح! يرجى التأكد من العميل.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForDelivery(null);
                    setEnteredOtp("");
                    setOtpError(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black cursor-pointer bg-slate-200 dark:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!enteredOtp}
                  className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-xs transition"
                >
                  تأكيد التحقق وتسليم الشحنة ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ مودال الإبلاغ عن تعذر التسليم */}
      {selectedOrderForFailed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm text-rose-500 flex items-center gap-2">
                <span>⚠️</span>
                <span>تعذر تسليم الشحنة ({selectedOrderForFailed.id})</span>
              </h3>
              <button
                onClick={() => setSelectedOrderForFailed(null)}
                className="text-slate-400 hover:text-rose-500 text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportFailedDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-black mb-1.5">
                  حدد سبب التعذر:
                </label>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-black outline-none ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-black"
                  }`}
                >
                  <option value="العميل لا يجيب على الهاتف">
                    العميل لا يجيب على الهاتف
                  </option>
                  <option value="العميل طلب تأجيل الاستلام ليوم آخر">
                    العميل طلب تأجيل الاستلام ليوم آخر
                  </option>
                  <option value="العنوان غير صحيح أو غير دقيق">
                    العنوان غير صحيح أو غير دقيق
                  </option>
                  <option value="العميل رفض استلام الشحنة">
                    العميل رفض استلام الشحنة
                  </option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForFailed(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black cursor-pointer bg-slate-200 dark:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  تسجيل التعذر وتأجيل الشحنة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧠 مودال ترتيب المسار الأمثل بالذكاء الاصطناعي */}
      {showAiRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-lg w-full p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-black text-sm text-amber-500">
                    {isRtl
                      ? "مسار التوصيل الأمثل المولد بالمحرك الذكي"
                      : "AI Optimal Route Optimizer"}
                  </h3>
                  <p className="text-[11px] opacity-60">
                    تم تحليل إحداثيات 6 أكتوبر والدلتا لاختصار المسافة والوقت
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiRouteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {isOptimizingRoute ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-amber-500">
                  {isRtl
                    ? "جاري حساب المسار الأمثل وإحداثيات نقاط التسليم..."
                    : "Calculating shortest path & traffic sequence..."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ملخص كفاءة المسار */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-xl border ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-[11px] opacity-60 font-bold flex items-center gap-1 mb-1">
                      <ClockIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>إجمالي زمن الرحلة:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-500 text-base">
                      52 دقيقة
                    </span>
                    <span className="text-[10px] text-emerald-400 block">
                      (توفير 34 دقيقة بفضل الدمج)
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className="text-[11px] opacity-60 font-bold flex items-center gap-1 mb-1">
                      <TrendingUpIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>توفير الوقود والمسافة:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-base">
                      وفرت 14.8 كم
                    </span>
                    <span className="text-[10px] text-amber-400 block">
                      (-32% استهلاك وقود)
                    </span>
                  </div>
                </div>

                {/* تسلسل التوقفات المرتبة بالذكاء الاصطناعي */}
                <div className="space-y-2">
                  <h4 className="font-black text-xs text-amber-500 flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    <span>تسلسل المحطات المرتب ذكياً (Optimal Stops Sequence):</span>
                  </h4>
                  <div className="relative border-r-2 border-amber-500/40 mr-3 space-y-3 pr-4 text-xs font-black">
                    {optimalStops.map((st) => (
                      <div key={st.stopNumber} className="relative">
                        <div className="absolute -right-[21px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-black font-black">
                          {st.stopNumber}
                        </div>
                        <div
                          className={`p-2.5 rounded-xl border ${
                            isDarkMode
                              ? "bg-slate-950 border-slate-800"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold">{st.title}</span>
                            <span className="font-mono text-emerald-500 text-[11px]">
                              {st.eta}
                            </span>
                          </div>
                          {st.note && (
                            <span className="text-[10px] opacity-60 block mt-0.5">
                              {st.note}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setShowAiRouteModal(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer transition ${
                      isDarkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-white"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                    }`}
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={handleApplyOptimalRoute}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>تطبيق المسار وبدء الرحلة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboardScreen;
