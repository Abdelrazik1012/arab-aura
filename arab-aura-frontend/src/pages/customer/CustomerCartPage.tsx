import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import type { ShippingType } from "../../context/PlatformContext";
import BrandLogo from "../../components/BrandLogo";
import {
  UserIcon,
  SunIcon,
  MoonIcon,
  TrashIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  BarChartIcon,
  RefreshIcon,
  PackageIcon,
  LightningIcon,
  PhoneIcon,
  BuildingIcon,
  WalletIcon,
  CashIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertTriangleIcon,
  CheckIcon,
  CartIcon,
} from "../../components/Icons";

export interface CartItem {
  id: string;
  titleAr: string;
  titleEn: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  color: string;
}

export const sanitizeEgyptianPhone = (rawPhone: string): string => {
  if (!rawPhone) return "01012345678";
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\+]/g, "");
  if (cleaned.startsWith("0020")) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith("20") && cleaned.length >= 12) {
    cleaned = cleaned.substring(2);
  }
  if (!cleaned.startsWith("0") && (cleaned.startsWith("10") || cleaned.startsWith("11") || cleaned.startsWith("12") || cleaned.startsWith("15"))) {
    cleaned = "0" + cleaned;
  }
  return cleaned;
};

export const CustomerCartPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { placeOrder } = usePlatform();
  const { isDarkMode, toggleTheme } = useTheme();

  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string>("");

  // حالة الخطوة: عربة التسوق -> العنوان والدفع -> تم بنجاح
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");

  // طريقة الشحن: عادي مجمع ذكي (35 ج.م) vs شحن فوري سريع Express (75 ج.م)
  const [shippingType, setShippingType] = useState<ShippingType>("standard");

  // عربة التسوق الافتراضية
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "prod-1",
      titleAr: "تيشيرت بولو قطن 100% Town Team كاجوال",
      titleEn: "Town Team 100% Cotton Classic Polo",
      price: 450.0,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
      size: "L",
      color: "كحلي داكن",
    },
    {
      id: "prod-2",
      titleAr: "بنطلون جينز كاجوال سليم فيت Town Team",
      titleEn: "Slim Fit Casual Denim Jeans",
      price: 590.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80",
      size: "34",
      color: "أزرق كلاسيك",
    },
  ]);

  // نموذج العنوان المصري بالتفصيل
  const [governorate, setGovernorate] = useState("المنوفية");
  const [center, setCenter] = useState("شبين الكوم");
  const [villageOrDistrict, setVillageOrDistrict] = useState("شارع الجلاء");
  const [street, setStreet] = useState("بجوار الاستاد الرياضي");
  const [buildingNumber, setBuildingNumber] = useState("عمارة 12، شقة 4");
  const [phone, setPhone] = useState(() => sanitizeEgyptianPhone(localStorage.getItem("user_phone") || "01012345678"));
  const [fullName, setFullName] = useState(() => localStorage.getItem("user_name") || "عميل عرب أورا");

  // وسائل الدفع المتعددة
  type PaymentMethodType =
    | "cod"
    | "vodafone_cash"
    | "instapay"
    | "fawry"
    | "card"
    | "paypal"
    | "wallet";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("vodafone_cash");

  // بيانات المحافظ الإلكترونية
  const [senderWalletPhone, setSenderWalletPhone] = useState(() => sanitizeEgyptianPhone(localStorage.getItem("user_phone") || "01012345678"));

  // بيانات انستا باي
  const [instaPayAddress, setInstaPayAddress] = useState("mahmoud@instapay");

  // كود فوري التجريبي
  const [fawryCode] = useState("948 215 03");

  // بيانات البطاقة البنكية
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // إيصال التحويل (صورة)
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // حالات تحليل العربة واقتراحات التوفير
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    summaryAr: string;
    summaryEn: string;
    savingTips: string[];
    alternativeDeals: { title: string; saving: string; targetRoute: string }[];
  } | null>({
    summaryAr:
      "المنتجات المختارة متناسقة الألوان (كحلي مع أزرق كلاسيك)، ومطابقة لخامات القطن المصري عالي الجودة.",
    summaryEn:
      "Selected items match color tones (Navy & Classic Blue) and feature premium Egyptian cotton.",
    savingTips: [
      "اخترت الشحن المجمع بالهب مما يوفر 50% مقارنة بالشحن الفردي.",
      "أضف منتجاً بقيمة 110 ج.م للحصول على شحن مجاني تماماً!",
    ],
    alternativeDeals: [
      {
        title: "حذاء رياضي متناسق مع هذا الطقم (Activ Pro)",
        saving: "وفر 15% عند الشراء معاً",
        targetRoute: "/customer/products",
      },
    ],
  });

  // تحديث الكميات وحذف المنتجات
  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const shippingFee = cartItems.length === 0 ? 0 : shippingType === "express" ? 75.0 : 35.0;
  const freeShippingThreshold = 1600;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const totalAmount = subtotal + shippingFee;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 3000);
  };

  // رفع صورة إيصال الدفع
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // تحديث التحليل الذكي للعربة
  const handleRefreshAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        summaryAr: `تم فحص ${cartItems.length} عناصر في السلة. التكلفة ممتازة، ونظام التجميع الذكي يقلل زمن التوصيل إلى المنوفية بنسبة 35%.`,
        summaryEn: `Analyzed ${cartItems.length} items. Costs are optimized, batching reduces delivery time by 35%.`,
        savingTips: [
          "الشحن المجمع يوفر 40 ج.م على الفور.",
          "يمكنك الدفع عبر InstaPay بدون أي رسوم إضافية.",
        ],
        alternativeDeals: [
          {
            title: "قميص رسمي بديل من Tie House",
            saving: "وفر 120 EGP",
            targetRoute: "/customer/products",
          },
        ],
      });
      setAnalyzing(false);
    }, 600);
  };

  // تقديم الطلب وتجهيز الـ Payload للباك إند
  const handleFinalCheckout = () => {
    setFormError(null);

    // 1. فحص العنوان
    if (!governorate.trim() || !center.trim() || !street.trim()) {
      setFormError(
        lang === "ar"
          ? "يرجى استكمال بيانات العنوان (المحافظة، المركز، واسم الشارع)"
          : "Please complete all delivery address details",
      );
      return;
    }

    // 2. فحص وتطهير رقم الهاتف المصري
    const cleanPhone = sanitizeEgyptianPhone(phone);
    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egyptianPhoneRegex.test(cleanPhone)) {
      setFormError(
        lang === "ar"
          ? "رقم الهاتف غير صحيح! يرجى إدخال رقم محمول مصري صحيح مكون من 11 رقماً (010 / 011 / 012 / 015)"
          : "Invalid Egyptian phone number. Must be 11 digits starting with 010, 011, 012, or 015.",
      );
      return;
    }

    // 3. فحص مدخلات وسيلة الدفع المحددة
    const cleanSenderWallet = sanitizeEgyptianPhone(senderWalletPhone);
    if (paymentMethod === "vodafone_cash") {
      if (!egyptianPhoneRegex.test(cleanSenderWallet)) {
        setFormError(
          lang === "ar"
            ? "يرجى إدخال رقم المحفظة المحول منها (11 رقماً)"
            : "Please enter a valid 11-digit sender wallet number",
        );
        return;
      }
    }

    if (paymentMethod === "instapay") {
      if (!instaPayAddress.trim()) {
        setFormError(
          lang === "ar"
            ? "يرجى إدخال عنوان انستا باي (IPA) أو رقم مرجع العملية"
            : "Please enter your InstaPay IPA handle or reference ID",
        );
        return;
      }
    }

    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s+/g, "").length < 16 || !cardExpiry || !cardCvv) {
        setFormError(
          lang === "ar"
            ? "يرجى إدخال بيانات البطاقة البنكية كاملة وصحيحة (16 رقماً، تاريخ الانتهاء، ورمز الأمان CVV)"
            : "Please enter complete card details (16 digits, MM/YY, CVV)",
        );
        return;
      }
    }

    if (paymentMethod === "wallet") {
      const storedBalance = Number(localStorage.getItem("user_wallet_balance") || 0);
      if (storedBalance < totalAmount) {
        setFormError(
          lang === "ar"
            ? `رصيد محفظتك الحالي (${storedBalance.toFixed(2)} ج.م) غير كافٍ لسداد إجمالي الطلب (${totalAmount.toFixed(2)} ج.م). يرجى شحن رصيدك من صفحة المحفظة أو اختيار الدفع عند الاستلام.`
            : `Insufficient wallet balance (${storedBalance.toFixed(2)} EGP). Total is ${totalAmount.toFixed(2)} EGP. Please top up your wallet or choose COD.`,
        );
        return;
      }
    }

    const placed = placeOrder({
      shippingType,
      items: cartItems.map((c) => ({
        id: c.id,
        title: lang === "ar" ? c.titleAr : c.titleEn,
        quantity: c.quantity,
        price: c.price,
        size: c.size,
        color: c.color,
        image: c.image,
      })),
      shippingAddress: {
        fullName,
        governorate,
        center,
        villageOrDistrict,
        street,
        buildingNumber,
        phone: cleanPhone,
      },
      payment: {
        method: paymentMethod,
        totalAmount,
        receiptImage: receiptBase64,
        senderWallet: cleanSenderWallet,
        transactionRef: paymentMethod === "instapay" ? instaPayAddress : fawryCode,
      },
    });

    setLastPlacedOrderId(placed.id);
    setStep("success");
    setCartItems([]);
  };

  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-black"
      }`}
    >
      {/* 🔝 النافبار العلوي */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/customer/products")}
          >
            <BrandLogo showText={true} />
            <span
              className={`text-xs font-black px-3 py-1 rounded-lg border hidden md:inline-block ${
                isDarkMode
                  ? "bg-slate-800 text-amber-400 border-slate-700"
                  : "bg-amber-50 text-amber-950 border-amber-200"
              }`}
            >
              | {isRtl ? "عربة التسوق والدفع الذكي" : "Shopping Cart & Smart Checkout"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-amber-400"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
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
              onClick={() => navigate("/customer/profile")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-xs hover:bg-amber-500 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{isRtl ? "حسابي وطلباتي" : "Profile & Orders"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {step === "success" ? (
          <div
            className={`p-8 sm:p-12 rounded-3xl border text-center space-y-4 max-w-xl mx-auto my-12 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black shadow-xs"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-amber-500">
              {isRtl ? "تم تأكيد طلبك بنجاح!" : "Order Placed Successfully!"}
            </h2>
            {lastPlacedOrderId && (
              <div className="inline-block px-4 py-1.5 rounded-xl bg-amber-400/10 text-amber-500 border border-amber-400/30 font-mono font-black text-sm">
                {isRtl ? "كود الطلب:" : "Order ID:"} {lastPlacedOrderId}
              </div>
            )}
            <p className="text-xs font-bold opacity-70 leading-relaxed">
              {isRtl
                ? "تم ربط الطلب بمركز التوزيع وإخطار المتجر ومندوبي التوصيل فورياً. يمكنك متابعة خط السير اللحظي وكود الـ OTP من صفحة طلباتي."
                : "Order synced with merchant hub and couriers. Track real-time timeline from your profile."}
            </p>

            {/* تفاصيل كود فوري إذا كان الدفع فوري */}
            {paymentMethod === "fawry" && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-black space-y-1 text-amber-600 dark:text-amber-400">
                <p className="flex items-center justify-center gap-1.5">
                  <BuildingIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>كود الدفع عبر ماكينات فوري (خدمة رقم 788):</span>
                </p>
                <p className="text-lg font-mono tracking-widest text-slate-950 dark:text-white">
                  {fawryCode}
                </p>
                <p className="text-[10px] opacity-70">صالح لمدة 48 ساعة من الآن</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate("/customer/profile?tab=orders")}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md transition flex items-center justify-center gap-2"
              >
                <MapPinIcon className="w-4 h-4" />
                <span>
                  {isRtl
                    ? "تتبع مسار الشحنة المباشر في حسابي"
                    : "Track Live Order in Profile"}
                </span>
              </button>
              <button
                onClick={() => navigate("/customer/products")}
                className="w-full sm:w-auto px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-black rounded-xl text-xs cursor-pointer transition"
              >
                {isRtl ? "مواصلة التسوق" : "Continue Shopping"}
              </button>
            </div>
          </div>
        ) : step === "cart" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* قائمة المنتجات في السلة + صندوق التحليل الذكي */}
            <div className="lg:col-span-8 space-y-4">
              {/* شريط التقدم للشحن المجاني بالذكاء الاصطناعي */}
              <div
                className={`p-4 rounded-2xl border shadow-xs space-y-2 ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-300"
                }`}
              >
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <SparklesIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      {subtotal >= freeShippingThreshold
                        ? "مبروك! حصلت على شحن مجاني بالكامل بفضل التجميع الذكي"
                        : `أضف منتجات بقيمة ${(freeShippingThreshold - subtotal).toFixed(0)} ج.م للحصول على شحن مجاني!`}
                    </span>
                  </span>
                  <span className="font-mono text-emerald-500">
                    {freeShippingProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              <h2 className="text-sm font-black">
                {isRtl
                  ? `محتويات سلة المشتريات (${cartItems.length} عناصر)`
                  : `Cart Items (${cartItems.length})`}
              </h2>

              {cartItems.length === 0 ? (
                <div
                  className={`p-10 rounded-2xl border text-center space-y-3 ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-300"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mx-auto">
                    <CartIcon className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold opacity-60">عربة التسوق فارغة</p>
                  <button
                    onClick={() => navigate("/customer/products")}
                    className="px-4 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                  >
                    تصفح المنتجات
                  </button>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                        isDarkMode
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={item.image}
                          alt=""
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black leading-snug">
                            {isRtl ? item.titleAr : item.titleEn}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] opacity-60 font-bold">
                            <span>المقاس: {item.size}</span>
                            <span>•</span>
                            <span>اللون: {item.color}</span>
                          </div>
                          <span className="text-xs font-black font-mono text-amber-500 mt-1 block">
                            {item.price.toFixed(2)} EGP
                          </span>
                        </div>
                      </div>

                      {/* التحكم بالكميات والحذف */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-3 py-1 font-black text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 font-mono font-black text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-3 py-1 font-black text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                          title="حذف"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* صندوق تحليل التوفير والذكاء الاصطناعي */}
                  <div
                    className={`p-5 rounded-2xl border space-y-4 shadow-xs ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                          <BarChartIcon className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black">
                            تحليل تكاليف المشتريات والتوفير اللوجستي
                          </h3>
                          <span className="text-[10px] opacity-60 font-bold block mt-0.5">
                            رؤى الـ AI لتحسين ميزانية الشحن والتنسيق
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleRefreshAnalysis}
                        disabled={analyzing}
                        className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <RefreshIcon className="w-3.5 h-3.5" />
                        <span>{analyzing ? "جارٍ التحديث..." : "تحديث التحليل"}</span>
                      </button>
                    </div>

                    {analysisResult && (
                      <div className="space-y-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold leading-relaxed">
                          <span className="text-amber-500 font-black ml-1">▪</span>
                          {isRtl ? analysisResult.summaryAr : analysisResult.summaryEn}
                        </div>

                        <div className="space-y-1.5">
                          <span className="font-black opacity-60 block uppercase text-[10px]">
                            • نصائح التوفير:
                          </span>
                          {analysisResult.savingTips.map((tip, idx) => (
                            <div key={idx} className="flex items-center gap-2 font-bold px-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>

                        {analysisResult.alternativeDeals.map((deal, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 gap-3"
                          >
                            <div>
                              <span className="font-black block text-xs">{deal.title}</span>
                              <span className="font-mono font-black text-emerald-500 text-[11px] block">
                                {deal.saving}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(deal.targetRoute)}
                              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
                            >
                              عرض المنتج ←
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ملخص السلة واختيار نوع الشحن */}
            <div
              className={`lg:col-span-4 p-5 sm:p-6 rounded-2xl border space-y-5 lg:sticky lg:top-20 ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-300"
              }`}
            >
              <h3 className="text-sm font-black border-b pb-3 border-slate-200 dark:border-slate-800">
                {isRtl ? "نوع الشحن وملخص الحساب" : "Shipping & Cart Summary"}
              </h3>

              {/* اختيار نوع الشحن: عادي مجمع vs شحن فوري Express */}
              <div className="space-y-2">
                <label className="text-xs font-black block opacity-70">
                  {isRtl ? "اختر سرعة ونوع الشحن:" : "Select Shipping Method:"}
                </label>

                {/* خيار 1: شحن اقتصادي مجمع */}
                <div
                  onClick={() => setShippingType("standard")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-2 ${
                    shippingType === "standard"
                      ? "bg-indigo-600/10 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <PackageIcon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-xs">شحن اقتصادي مجمع (Smart Batch)</p>
                      <p className="text-[10px] opacity-75 mt-0.5">
                        يتم التجميع بمركز أكتوبر اللوجستي (توفير 50%)
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-xs">35 EGP</span>
                </div>

                {/* خيار 2: شحن فوري Express */}
                <div
                  onClick={() => setShippingType("express")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-2 ${
                    shippingType === "express"
                      ? "bg-rose-600/10 border-rose-600 text-rose-600 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <LightningIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-xs">شحن فوري سريع (Express 60 Min)</p>
                      <p className="text-[10px] opacity-75 mt-0.5">
                        توصيل مباشر مع أقرب كابتن (Uber Direct)
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-xs">75 EGP</span>
                </div>
              </div>

              {/* تفاصيل المبالغ */}
              <div className="space-y-2 text-xs font-bold border-t pt-3 border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="opacity-60">المجموع الفرعي:</span>
                  <span className="font-mono">{subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">مصاريف الشحن:</span>
                  <span className="font-mono">{shippingFee.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between border-t pt-2 border-slate-200 dark:border-slate-800 text-sm font-black text-amber-500">
                  <span>الإجمالي الكلي:</span>
                  <span className="font-mono">{totalAmount.toFixed(2)} EGP</span>
                </div>
              </div>

              <button
                onClick={() => setStep("checkout")}
                disabled={cartItems.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isRtl ? "متابعة العنوان وطريقة الدفع" : "Proceed to Checkout"}</span>
                {isRtl ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          /* خطوة إدخال العنوان وخيارات الدفع المصرية والدولية */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* تفاصيل العنوان المصري */}
            <div
              className={`lg:col-span-7 p-6 rounded-2xl border space-y-4 ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-300"
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-amber-500" />
                  <span>{isRtl ? "بيانات العنوان المصري بالتفصيل" : "Egyptian Delivery Address"}</span>
                </h3>
                <button
                  onClick={() => setStep("cart")}
                  className="text-xs font-black text-amber-500 cursor-pointer"
                >
                  ← العودة للعربة
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-black">
                <div className="sm:col-span-2">
                  <label className="block mb-1 opacity-70">اسم المستلم الكامل:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-70">المحافظة:</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 outline-none"
                  >
                    <option value="المنوفية">المنوفية</option>
                    <option value="الجيزة">الجيزة و6 أكتوبر</option>
                    <option value="القاهرة">القاهرة</option>
                    <option value="الغربية">الغربية (طنطا)</option>
                    <option value="الشرقية">الشرقية</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 opacity-70">المركز / المدينة:</label>
                  <input
                    type="text"
                    value={center}
                    onChange={(e) => setCenter(e.target.value)}
                    placeholder="مثال: شبين الكوم / الباجور"
                    className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-70">القرية / الحي:</label>
                  <input
                    type="text"
                    value={villageOrDistrict}
                    onChange={(e) => setVillageOrDistrict(e.target.value)}
                    placeholder="مثال: شارع الجلاء / حي بحري"
                    className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-70">اسم الشارع والمعالم:</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="مثال: بجوار الاستاد الرياضي"
                    className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-70">رقم العمارة والشقة:</label>
                  <input
                    type="text"
                    value={buildingNumber}
                    onChange={(e) => setBuildingNumber(e.target.value)}
                    placeholder="مثال: عمارة 12 - شقة 4"
                    className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 opacity-70">رقم المحمول المصري للتواصل:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 💳 جميع بوابات الدفع المصرية والعالمية */}
            <div
              className={`lg:col-span-5 p-6 rounded-2xl border space-y-4 ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-300"
              }`}
            >
              <h3 className="text-sm font-black border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                <WalletIcon className="w-4 h-4 text-amber-500" />
                <span>{isRtl ? "اختر وسيلة الدفع المعتمدة" : "Select Payment Gateway"}</span>
              </h3>

              {/* شبكة وسائل الدفع */}
              <div className="space-y-2 text-xs font-black">
                {/* 1. المحافظ الإلكترونية */}
                <div
                  onClick={() => setPaymentMethod("vodafone_cash")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === "vodafone_cash"
                      ? "bg-amber-400/15 border-amber-400 text-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-amber-500" />
                    <span>فودافون كاش / أورنج / إي آند / وي</span>
                  </div>
                  {paymentMethod === "vodafone_cash" && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                </div>

                {/* 2. انستا باي InstaPay */}
                <div
                  onClick={() => setPaymentMethod("instapay")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === "instapay"
                      ? "bg-amber-400/15 border-amber-400 text-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LightningIcon className="w-4 h-4 text-amber-500" />
                    <span>انستا باي (InstaPay Egypt)</span>
                  </div>
                  {paymentMethod === "instapay" && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                </div>

                {/* 3. فوري باي Fawry Pay */}
                <div
                  onClick={() => setPaymentMethod("fawry")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === "fawry"
                      ? "bg-amber-400/15 border-amber-400 text-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="w-4 h-4 text-amber-500" />
                    <span>فوري باي (Fawry Pay كود دفع)</span>
                  </div>
                  {paymentMethod === "fawry" && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                </div>

                {/* 4. البطاقات البنكية */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === "card"
                      ? "bg-amber-400/15 border-amber-400 text-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-4 h-4 text-amber-500" />
                    <span>البطاقات البنكية (Visa / MasterCard / ميزة)</span>
                  </div>
                  {paymentMethod === "card" && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                </div>

                {/* 5. PayPal */}
                <div
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === "paypal"
                      ? "bg-amber-400/15 border-amber-400 text-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-amber-500" />
                    <span>باي بال (PayPal International)</span>
                  </div>
                  {paymentMethod === "paypal" && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                </div>

                {/* 6. الدفع عند الاستلام */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === "cod"
                      ? "bg-amber-400/15 border-amber-400 text-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CashIcon className="w-4 h-4 text-amber-500" />
                    <span>الدفع نقداً عند الاستلام (COD مع المعاينة)</span>
                  </div>
                  {paymentMethod === "cod" && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                </div>

                {/* 7. رصيد محفظة المنصة */}
                <div
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    paymentMethod === "wallet"
                      ? "bg-amber-400/15 border-amber-400 text-amber-500"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-4 h-4 text-amber-500" />
                    <span>رصيد محفظة عرب أورا الرقمية (0.00 EGP)</span>
                  </div>
                  {paymentMethod === "wallet" && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                </div>
              </div>

              {/* 🔹 تفاصيل وحقول وسيلة الدفع النشطة */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-black space-y-3">
                {paymentMethod === "vodafone_cash" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div>
                        <span className="opacity-60 text-[10px] block">رقم محفظة التحويل للمنصة:</span>
                        <span className="font-mono text-sm text-amber-500">010 2345 6789</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("01023456789", "تم نسخ رقم المحفظة")}
                        className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black cursor-pointer"
                      >
                        {copiedText === "تم نسخ رقم المحفظة" ? "تم النسخ ✓" : "نسخ الرقم"}
                      </button>
                    </div>

                    <div>
                      <label className="block mb-1 opacity-70">رقم المحفظة التي قمت بالتحويل منها:</label>
                      <input
                        type="tel"
                        value={senderWalletPhone}
                        onChange={(e) => setSenderWalletPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 opacity-70">صورة إيصال التحويل (اختياري للتحقق الفوري):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="w-full text-xs font-black file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-400 file:text-slate-950 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "instapay" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <div>
                        <span className="opacity-60 text-[10px] block">عنوان الدفع اللحظي (IPA):</span>
                        <span className="font-mono text-sm text-indigo-500">arabaura@instapay</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("arabaura@instapay", "تم نسخ عنوان انستا باي")}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black cursor-pointer"
                      >
                        {copiedText === "تم نسخ عنوان انستا باي" ? "تم النسخ ✓" : "نسخ IPA"}
                      </button>
                    </div>

                    <div>
                      <label className="block mb-1 opacity-70">عنوان انستا باي الخاص بك (أو كود العملية):</label>
                      <input
                        type="text"
                        value={instaPayAddress}
                        onChange={(e) => setInstaPayAddress(e.target.value)}
                        placeholder="username@instapay"
                        className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "fawry" && (
                  <div className="space-y-2">
                    <p className="text-amber-500">كود فوري الموحد للدفع الميداني:</p>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border text-center font-mono text-base text-emerald-500">
                      {fawryCode}
                    </div>
                    <p className="text-[11px] opacity-70 leading-relaxed">
                      توجه لأي منفذ فوري واطلب سداد خدمة «عرب أورا» برقم الخدمة 788 باستخدام الكود أعلاه.
                    </p>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block mb-1 opacity-70">رقم البطاقة (16 رقماً):</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1 opacity-70">تاريخ الانتهاء:</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 opacity-70">رمز الأمان (CVV):</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="space-y-2 text-center py-2">
                    <p className="opacity-70">سيتم فتح نافذة PayPal الآمنة لتفويض العملية بالدولار أو الجنيه.</p>
                    <span className="px-3 py-1 bg-sky-500/10 text-sky-500 rounded-lg text-xs font-black">
                      ✓ معتمد ومدعوم بحماية المشتري
                    </span>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="space-y-1">
                    <p className="text-emerald-500 flex items-center gap-1.5">
                      <CashIcon className="w-4 h-4 text-emerald-500" />
                      <span>الدفع عند استلام الطلب والمعاينة:</span>
                    </p>
                    <p className="text-[11px] opacity-70 leading-relaxed">
                      ستقوم بدفع المبلغ نقداً لمندوب الشحن عند وصوله لعنوانك بعد معاينة الطرد والتأكد من مطابقة المقاسات.
                    </p>
                  </div>
                )}
              </div>

              {formError && (
                <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-black animate-fade-in flex items-center gap-1.5">
                  <AlertTriangleIcon className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                onClick={handleFinalCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                {isRtl
                  ? `تأكيد الطلب وشحنه إلى ${governorate} (${totalAmount.toFixed(2)} EGP)`
                  : `Confirm & Place Order (${totalAmount.toFixed(2)} EGP)`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerCartPage;
