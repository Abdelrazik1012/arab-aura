import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import walletService from "../../services/walletService";
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  WalletIcon,
  SparklesIcon,
  TagIcon,
  PhoneIcon,
  LightningIcon,
  BuildingIcon,
  CheckCircleIcon,
  CashIcon,
} from "../../components/Icons";

interface Transaction {
  id: string;
  type: "deposit" | "payment" | "refund" | "promo_bonus" | "withdrawal";
  titleAr: string;
  titleEn: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "expired";
  expiryDate?: string;
  referenceNumber?: string;
}

export const CustomerWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  // الرصيد والمعاملات - تبدأ متصفّرة (0.00 EGP) افتراضياً لأي حساب جديد
  const [currentBalance, setCurrentBalance] = useState<number>(0.0);
  const [promoBalance, setPromoBalance] = useState<number>(0.0);
  const currency = "EGP";

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // تحميل رصيد المحفظة والمعاملات الحقيقية من السيرفر
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await walletService.getMyWallet();
        setCurrentBalance(data.balance || 0);
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(
            data.transactions.map((t: any) => ({
              id: t.id || t._id,
              type: t.type,
              titleAr: t.titleAr,
              titleEn: t.titleEn,
              amount: t.amount,
              date: new Date(t.date || t.createdAt).toISOString().split("T")[0],
              status: t.status || "completed",
            }))
          );
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.warn("Wallet fetch fallback:", err);
      }
    };
    fetchWallet();
  }, []);

  // حالات الشحن والتحقق (Validation States)
  const [selectedMethod, setSelectedMethod] = useState<
    "vodafone_cash" | "instapay" | "fawry" | "card"
  >("vodafone_cash");
  const [topUpAmount, setTopUpAmount] = useState<string>("200");

  // مدخلات فودافون كاش / والمحافظ
  const [walletPhone, setWalletPhone] = useState<string>("");

  // مدخلات إنستا باي
  const [instapayUsername, setInstapayUsername] = useState<string>("");

  // مدخلات البطاقة البنكية
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

  // رسائل الأخطاء والنجاح
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // البرومو كود
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 🔍 دالة فحص والتحقق من صحة المدخلات (Validation Engine)
  const validateAndProcessTopUp = async () => {
    setFormError(null);
    setFormSuccess(null);

    const amountNum = Number(topUpAmount);
    if (!amountNum || amountNum <= 0) {
      setFormError(
        lang === "ar"
          ? "يرجى إدخال مبلغ شحن صحيح أكبر من الصفر."
          : "Please enter a valid amount.",
      );
      return;
    }

    // 1. فحص فودافون كاش / المحافظ
    if (selectedMethod === "vodafone_cash") {
      const phoneRegex = /^01[0125][0-9]{8}$/;
      if (!phoneRegex.test(walletPhone)) {
        setFormError(
          lang === "ar"
            ? "رقم محفظة فودافون كاش غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 010, 011, 012, أو 015."
            : "Invalid wallet number. Must be 11 digits starting with 010, 011, 012, or 015.",
        );
        return;
      }
    }

    // 2. فحص إنستا باي (InstaPay)
    if (selectedMethod === "instapay") {
      if (!instapayUsername.includes("@") || instapayUsername.length < 4) {
        setFormError(
          lang === "ar"
            ? "عنوان إنستا باي غير صحيح (مثال صحيح: username@instapay)."
            : "Invalid InstaPay address (e.g. username@instapay).",
        );
        return;
      }
    }

    // 3. فحص البطاقات البنكية (Visa / MasterCard / Meeza)
    if (selectedMethod === "card") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (cleanCard.length !== 16 || isNaN(Number(cleanCard))) {
        setFormError(
          lang === "ar"
            ? "رقم البطاقة البنكية غير صحيح. يجب أن يتكون من 16 رقماً."
            : "Invalid card number. Must be 16 digits.",
        );
        return;
      }
      const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      if (!expiryRegex.test(cardExpiry)) {
        setFormError(
          lang === "ar"
            ? "تاريخ انتهاء البطاقة غير صحيح (الصيغة المطلوبة MM/YY)."
            : "Invalid expiry date format (MM/YY required).",
        );
        return;
      }
      if (cardCvv.length !== 3 || isNaN(Number(cardCvv))) {
        setFormError(
          lang === "ar"
            ? "رقم الأمان (CVV) غير صحيح. يجب أن يتكون من 3 أرقام."
            : "Invalid CVV. Must be 3 digits.",
        );
        return;
      }
    }

    // 🚀 تنفيذ الطلب وإرساله إلى الباك إند
    setLoading(true);
    try {
      await walletService.deposit(amountNum, selectedMethod);

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: "deposit",
        titleAr: `إيداع ناجح عبر ${
          selectedMethod === "vodafone_cash"
            ? "فودافون كاش"
            : selectedMethod === "instapay"
              ? "إنستا باي"
              : selectedMethod === "card"
                ? "البطاقة البنكية"
                : "خدمة فوري"
        }`,
        titleEn: `Successful Top-up via ${selectedMethod.toUpperCase()}`,
        amount: amountNum,
        date: new Date().toISOString().split("T")[0],
        status: "completed",
        referenceNumber: `EGYPT-PAY-${Math.floor(Math.random() * 899999 + 100000)}`,
      };

      setCurrentBalance((prev) => prev + amountNum);
      setTransactions((prev) => [newTx, ...prev]);

      setFormSuccess(
        lang === "ar"
          ? `تم شحن المحفظة بنجاح بمبلغ ${amountNum} ج.م وتحديث الرصيد في السيرفر!`
          : `Successfully topped up ${amountNum} EGP and balance updated on server!`,
      );

      // تفريغ المدخلات بعد النجاح
      setWalletPhone("");
      setInstapayUsername("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          (lang === "ar" ? "فشل شحن المحفظة، يرجى المحاولة لاحقاً" : "Top-up failed, please try again")
      );
    } finally {
      setLoading(false);
    }
  };

  // تفعيل البرومو كود
  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;

    const added = 50.0;
    const now = new Date();
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "promo_bonus",
      titleAr: `مكافأة برومو كود (${promoCodeInput.toUpperCase()}) - صالحة لمدة 30 يوم`,
      titleEn: `Promo Code Bonus (${promoCodeInput.toUpperCase()}) - Valid for 30 days`,
      amount: added,
      date: now.toISOString().split("T")[0],
      status: "completed",
      expiryDate: expiry.toISOString().split("T")[0],
    };

    setCurrentBalance((prev) => prev + added);
    setPromoBalance((prev) => prev + added);
    setTransactions((prev) => [newTx, ...prev]);

    setPromoMessage({
      type: "success",
      text:
        lang === "ar"
          ? `تم إضافة ${added} ج.م لرصيد المحفظة بنجاح! صالحة للاستخدام خلال 30 يوماً.`
          : `Added ${added} EGP to your wallet balance! Valid for 30 days.`,
    });
    setPromoCodeInput("");
  };

  const textColor = isDarkMode ? "#FFFFFF" : "#0E172A";

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        isDarkMode ? "bg-[#0F172A] text-white" : "bg-[#F8FAFC] text-[#0E172A]"
      }`}
      style={{ color: textColor }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: ${lang === "ar" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"}; }
      `}</style>

      {/* 🔝 النافبار العلوي */}
      <header
        className={`sticky top-0 z-50 border-b shadow-sm transition-all duration-300 ${
          isDarkMode
            ? "bg-[#1E293B] border-slate-700 text-white"
            : "bg-white border-slate-200 text-[#0E172A]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/customer/products")}
          >
            <BrandLogo showText={true} />
            <span
              className="text-xs font-black hidden sm:inline"
              style={{ color: textColor }}
            >
              |{" "}
              {lang === "ar"
                ? "محفظتي الرقمية والدفع"
                : "My Digital Wallet & Payments"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 px-3 border rounded-full text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-[#0F172A] border-slate-700 text-amber-400"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`px-3 py-1 border rounded-full text-xs font-bold transition ${
                isDarkMode
                  ? "bg-[#0F172A] border-slate-700 text-slate-300"
                  : "bg-slate-100 border-slate-200 text-[#0E172A]"
              }`}
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <button
              onClick={() => navigate("/customer/profile")}
              className="flex items-center gap-2 px-3 py-1 bg-amber-400 text-[#0E172A] font-black rounded-full text-xs shadow-sm hover:bg-amber-500 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "حسابي" : "Profile"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main
        className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6"
        style={{ color: textColor }}
      >
        {/* 💳 بطاقة الرصيد والبرومو كود */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#0E172A] to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                  {lang === "ar"
                    ? "إجمالي الرصيد المتاح"
                    : "Available Wallet Balance"}
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h1 className="text-3xl md:text-5xl font-black font-mono text-amber-400">
                    {currentBalance.toFixed(2)}
                  </h1>
                  <span className="text-sm font-black text-slate-300">
                    {currency}
                  </span>
                </div>
              </div>
              <WalletIcon className="w-8 h-8 text-amber-400/80" />
            </div>

            {promoBalance > 0 && (
              <div className="mt-4 p-3 bg-amber-400/10 border border-amber-400/30 rounded-2xl z-10 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {lang === "ar"
                      ? `يتضمن رصيد مكافآت برومو كود:`
                      : "Includes promo bonus balance:"}
                  </span>
                  <strong className="font-mono text-white">
                    {promoBalance.toFixed(2)} {currency}
                  </strong>
                </span>
                <span className="text-[10px] text-amber-200/80 font-bold">
                  {lang === "ar"
                    ? "صالح لمدة 30 يوماً من التفعيل"
                    : "Valid 30 days from activation"}
                </span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs z-10">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === "ar" ? "حالة المحفظة: نشطة وموثقة بالكامل" : "Wallet Status: Active & Verified"}</span>
              </span>
              <button
                onClick={() => navigate("/customer/products")}
                className="bg-amber-400 hover:bg-amber-500 text-[#0E172A] font-black px-4 py-2 rounded-xl transition text-xs cursor-pointer shadow"
              >
                {lang === "ar" ? "تسوق بالرصيد الآن" : "Shop with Balance"}
              </button>
            </div>
          </div>

          {/* قسم الكوبونات */}
          <div
            className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
              isDarkMode
                ? "bg-[#1E293B] border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TagIcon className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black" style={{ color: textColor }}>
                  {lang === "ar"
                    ? "شحن برومو كود / كوبون"
                    : "Redeem Promo Code"}
                </h3>
              </div>
              <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                {lang === "ar"
                  ? "أدخل الكود للحصول على رصيد مباشر بالمحفظة صالح لمدة 30 يوماً."
                  : "Enter code to get instant wallet credit valid for 30 days."}
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={
                    lang === "ar"
                      ? "أدخل الكود (مثال: EGYPT50)"
                      : "Enter code (e.g. EGYPT50)"
                  }
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className={`w-full p-3 border rounded-2xl font-mono uppercase font-black outline-none text-xs text-center tracking-widest transition ${
                    isDarkMode
                      ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                      : "bg-slate-50 border-slate-300 text-[#0E172A] focus:border-slate-500"
                  }`}
                />

                <button
                  onClick={handleApplyPromo}
                  disabled={!promoCodeInput.trim()}
                  className="w-full py-3 bg-[#0E172A] dark:bg-amber-400 hover:bg-slate-800 dark:hover:bg-amber-500 text-white dark:text-[#0E172A] font-black rounded-2xl text-xs transition shadow cursor-pointer disabled:opacity-50"
                >
                  {lang === "ar"
                    ? "تفعيل وتطبيق الرصيد"
                    : "Apply Promo Balance"}
                </button>
              </div>

              {promoMessage && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs font-bold border ${
                    promoMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400"
                  }`}
                >
                  {promoMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔄 طرق الشحن + التحقق الذكي + سجل المعاملات */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ⚡ وسائل الدفع والتحقق (Validation Engine) */}
          <div
            className={`lg:col-span-5 p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDarkMode
                ? "bg-[#1E293B] border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-black" style={{ color: textColor }}>
                {lang === "ar"
                  ? "بوابات الدفع المصرية والتحقق الآمن"
                  : "Egyptian Payment Gateways & Validation"}
              </h3>
            </div>

            {/* أزرار وسائل الدفع */}
            <div className="space-y-2.5">
              {[
                {
                  id: "vodafone_cash",
                  titleAr: "فودافون كاش / المحافظ",
                  titleEn: "Vodafone Cash & Wallets",
                  Icon: PhoneIcon,
                },
                {
                  id: "instapay",
                  titleAr: "إنستا باي (InstaPay IPN)",
                  titleEn: "InstaPay Instant Transfer",
                  Icon: LightningIcon,
                },
                {
                  id: "fawry",
                  titleAr: "خدمة فوري (Fawry Pay)",
                  titleEn: "Fawry Pay & Kiosks",
                  Icon: BuildingIcon,
                },
                {
                  id: "card",
                  titleAr: "البطاقات البنكية (Visa / Meeza)",
                  titleEn: "Bank Cards (Visa/Meeza)",
                  Icon: WalletIcon,
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMethod(m.id as any);
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                    selectedMethod === m.id
                      ? "bg-amber-400/15 border-amber-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <m.Icon className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold">
                      {lang === "ar" ? m.titleAr : m.titleEn}
                    </span>
                  </div>
                  {selectedMethod === m.id && (
                    <span className="text-amber-500 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* تفاصيل المدخلات لكل وسيلة دفع بناءً على الـ Validation */}
            <div className="space-y-3 pt-2">
              <div>
                <label
                  className="text-xs font-black block mb-1"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "مبلغ الشحن (EGP):" : "Top-Up Amount (EGP):"}
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className={`w-full p-2.5 border rounded-xl font-mono font-black text-xs outline-none ${
                    isDarkMode
                      ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                      : "bg-slate-50 border-slate-300 text-[#0E172A]"
                  }`}
                />
              </div>

              {/* حقول فودافون كاش والمحافظ */}
              {selectedMethod === "vodafone_cash" && (
                <div>
                  <label
                    className="text-xs font-black block mb-1"
                    style={{ color: textColor }}
                  >
                    {lang === "ar"
                      ? "رقم محفظة الهاتف (11 رقم):"
                      : "Wallet Mobile Number:"}
                  </label>
                  <input
                    type="tel"
                    placeholder="01012345678"
                    maxLength={11}
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl font-mono font-black text-xs outline-none ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                        : "bg-slate-50 border-slate-300 text-[#0E172A]"
                    }`}
                  />
                </div>
              )}

              {/* حقول إنستا باي */}
              {selectedMethod === "instapay" && (
                <div>
                  <label
                    className="text-xs font-black block mb-1"
                    style={{ color: textColor }}
                  >
                    {lang === "ar"
                      ? "عنوان حساب إنستا باي (IPN Address):"
                      : "InstaPay IPN Address:"}
                  </label>
                  <input
                    type="text"
                    placeholder="name@instapay"
                    value={instapayUsername}
                    onChange={(e) => setInstapayUsername(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl font-mono font-black text-xs outline-none ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                        : "bg-slate-50 border-slate-300 text-[#0E172A]"
                    }`}
                  />
                </div>
              )}

              {/* حقول البطاقات البنكية */}
              {selectedMethod === "card" && (
                <div className="space-y-2.5">
                  <div>
                    <label
                      className="text-xs font-black block mb-1"
                      style={{ color: textColor }}
                    >
                      {lang === "ar"
                        ? "رقم البطاقة (16 رقماً):"
                        : "Card Number (16 Digits):"}
                    </label>
                    <input
                      type="text"
                      placeholder="4532   "
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className={`w-full p-2.5 border rounded-xl font-mono font-black text-xs outline-none ${
                        isDarkMode
                          ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                          : "bg-slate-50 border-slate-300 text-[#0E172A]"
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        className="text-xs font-black block mb-1"
                        style={{ color: textColor }}
                      >
                        {lang === "ar" ? "تاريخ الانتهاء:" : "Expiry Date:"}
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className={`w-full p-2.5 border rounded-xl font-mono font-black text-xs outline-none ${
                          isDarkMode
                            ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                            : "bg-slate-50 border-slate-300 text-[#0E172A]"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs font-black block mb-1"
                        style={{ color: textColor }}
                      >
                        {lang === "ar" ? "رمز الأمان (CVV):" : "CVV Code:"}
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className={`w-full p-2.5 border rounded-xl font-mono font-black text-xs outline-none ${
                          isDarkMode
                            ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                            : "bg-slate-50 border-slate-300 text-[#0E172A]"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* رسائل التنبيه والخطأ للـ Validation */}
              {formError && (
                <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold">
                  ⚠️ {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
                  ✅ {formSuccess}
                </div>
              )}

              <button
                onClick={validateAndProcessTopUp}
                disabled={loading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-[#0E172A] font-black rounded-xl text-xs transition shadow cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? lang === "ar"
                    ? "جاري التحقق وإرسال البيانات للباك إند..."
                    : "Validating & Processing..."
                  : lang === "ar"
                    ? `تأكيد الشحن ودفع (${topUpAmount} EGP)`
                    : `Confirm Top-Up (${topUpAmount} EGP)`}
              </button>
            </div>
          </div>

          {/* 📊 سجل المعاملات (History) */}
          <div
            className={`lg:col-span-7 p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDarkMode
                ? "bg-[#1E293B] border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-black" style={{ color: textColor }}>
                {lang === "ar"
                  ? "سجل المعاملات المالي"
                  : "Financial Transaction History"}
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400">
                {transactions.length}{" "}
                {lang === "ar" ? "معاملة" : "Transactions"}
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/10 flex items-center justify-center text-amber-500">
                    <WalletIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {lang === "ar"
                      ? "لا توجد أي معاملات سابقة حتى الآن"
                      : "No transactions recorded yet"}
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {lang === "ar"
                      ? "رصيدك الحالي 0.00 ج.م. يمكنك شحن المحفظة أو التسوق وسيتم تسجيل كافة معاملاتك هنا تلقائياً."
                      : "Your current balance is 0.00 EGP. Top up or start shopping to record your transactions here."}
                  </p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        tx.amount > 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.type === "promo_bonus" ? (
                        <SparklesIcon className="w-4 h-4 text-amber-500" />
                      ) : tx.amount > 0 ? (
                        "⇣"
                      ) : (
                        "⇡"
                      )}
                    </div>

                    <div>
                      <h4
                        className="text-xs font-black"
                        style={{ color: textColor }}
                      >
                        {lang === "ar" ? tx.titleAr : tx.titleEn}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          {tx.date}
                        </span>
                        {tx.referenceNumber && (
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-2 py-0.5 rounded">
                            {tx.referenceNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <span
                      className={`text-sm font-black block ${
                        tx.amount > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.amount > 0
                        ? `+${tx.amount.toFixed(2)}`
                        : tx.amount.toFixed(2)}{" "}
                      {currency}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block capitalize">
                      {tx.status}
                    </span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerWalletPage;
