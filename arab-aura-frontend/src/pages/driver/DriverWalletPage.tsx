import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  BuildingIcon,
  CashIcon,
  LightningIcon,
  DocumentTextIcon,
  CloseIcon,
  CheckCircleIcon,
} from "../../components/Icons";

interface SettlementRecord {
  id: string;
  amount: number;
  hubName: string;
  method: "cash_to_hub" | "instapay" | "bank_deposit";
  status: "completed" | "pending";
  date: string;
}

export const DriverWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  // 💳 حالات المودال والتوريد - تبدأ من الصفر لأي سائق جديد
  const [codBalance, setCodBalance] = useState<number>(0.0);
  const [settledBalance, setSettledBalance] = useState<number>(0.0);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState<
    "cash_to_hub" | "instapay"
  >("cash_to_hub");
  const [settlementAmount, setSettlementAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [settlementError, setSettlementError] = useState("");

  // 📜 سجل التوريدات الخزينة
  const [records, setRecords] = useState<SettlementRecord[]>([]);

  const isRtl = lang === "ar";

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const handleSettlementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettlementError("");
    const amountNum = Number(settlementAmount);

    if (!amountNum || amountNum <= 0) {
      setSettlementError(isRtl ? "يرجى إدخال مبلغ صحيح أكبر من الصفر" : "Please enter a valid amount");
      return;
    }

    if (amountNum > codBalance) {
      setSettlementError(
        isRtl
          ? `عفواً، العهدة النقدية المعلقة لديك (${codBalance} ج.م) لا تكفي لتوريد ${amountNum} ج.م`
          : `Insufficient COD balance (${codBalance} EGP) for settlement`
      );
      return;
    }

    setIsSuccess(true);
    setCodBalance((prev) => Math.max(0, prev - amountNum));
    setSettledBalance((prev) => prev + amountNum);

    setTimeout(() => {
      const newRecord: SettlementRecord = {
        id: `SET-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: Number(settlementAmount),
        hubName:
          settlementMethod === "cash_to_hub"
            ? "خزينة نقطة المُجمّع المعتمد (حي الأشجار)"
            : "حساب الشركة (InstaPay)",
        method: settlementMethod,
        status: "completed",
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      setRecords((prev) => [newRecord, ...prev]);
      setIsSuccess(false);
      setShowSettlementModal(false);
      setSettlementAmount("");
    }, 1500);
  };

  const t = {
    title: isRtl ? "محفظة التحصيل والتوريد" : "Driver Cash Wallet & Settlement",
    dashboard: isRtl ? "الرئيسية" : "Dashboard",
    orders: isRtl ? "شحنات المسار" : "Deliveries",
    wallet: isRtl ? "محفظة الكاش" : "Cash Wallet",
    logout: isRtl ? "خروج" : "Logout",
    codBalance: isRtl ? "عهد الكاش في حوزتك (COD)" : "Cash in Hand (COD)",
    settledBalance: isRtl ? "إجمالي التوريدات المسلمة" : "Total Settled Cash",
    settleBtn: isRtl ? "توريد العهدة للخزينة" : "Settle Cash to Hub",
    modalTitle: isRtl ? "طلب توريد مبالغ العهدة" : "Settle Cash On Delivery",
    selectMethod: isRtl ? "اختر طريقة التوريد:" : "Select Settlement Method:",
    cashToHub: isRtl
      ? "تسليم كاش للمشرف في المركز اللوجستي"
      : "Cash Handover at Hub",
    instapay: isRtl ? "تحويل عبر انستا باي (InstaPay)" : "InstaPay Transfer",
    amount: isRtl ? "المبلغ المراد توريده (EGP)" : "Settlement Amount (EGP)",
    confirmSettle: isRtl ? "تأكيد التوريد" : "Confirm Settlement",
    cancel: isRtl ? "إلغاء" : "Cancel",
    successMsg: isRtl
      ? "تم إرسال إيصال التوريد واعتماده بنجاح!"
      : "Cash settlement confirmed successfully!",
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
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
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
              className="px-3 py-2 rounded-xl transition cursor-pointer bg-amber-500 text-black shadow-xs"
            >
              {t.wallet}
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
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
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <LogoutIcon className="w-4 h-4" />
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
          className="cursor-pointer"
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
          className="cursor-pointer text-amber-500"
        >
          {t.wallet}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        <div
          className={`p-6 rounded-2xl border shadow-xs ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
        >
          <h1 className="text-lg font-black">{t.title}</h1>
          <p
            className={`text-xs mt-1 ${isDarkMode ? "text-white/50" : "text-slate-500"}`}
          >
            {isRtl
              ? "تتبع المبالغ المحصلة نقدياً من العملاء وتوريدها للمركز اللوجستي"
              : "Manage COD cash and settlements"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`p-6 rounded-2xl border shadow-xs space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
          >
            <span className="text-xs font-black opacity-60 block">
              {t.codBalance}
            </span>
            <h2 className="text-3xl font-black text-amber-500">
              {codBalance.toLocaleString()} <span className="text-sm">EGP</span>
            </h2>
            <button
              onClick={() => setShowSettlementModal(true)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-black cursor-pointer shadow-xs transition"
            >
              {t.settleBtn}
            </button>
          </div>

          <div
            className={`p-6 rounded-2xl border shadow-xs space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
          >
            <span className="text-xs font-black opacity-60 block">
              {t.settledBalance}
            </span>
            <h2 className="text-3xl font-black text-emerald-500">
              {settledBalance.toLocaleString()} <span className="text-sm">EGP</span>
            </h2>
            <p
              className={`text-[11px] font-bold ${isDarkMode ? "text-white/50" : "text-slate-500"}`}
            >
              {isRtl
                ? "تم توريد المبالغ وتصفية العهدة بنجاح لدى خزينة منصة عرب أورا."
                : "Cash successfully transferred & cleared."}
            </p>
          </div>
        </div>

        {/* سجل التوريدات */}
        <div
          className={`rounded-2xl border overflow-hidden shadow-xs ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-black text-xs flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-amber-500" />
            <span>{isRtl ? "سجل عمليات التوريد وتسوية العهدة" : "Settlement & Deposit Logs"}</span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {records.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-500">
                {isRtl
                  ? "لا توجد عهدة نقدية مسجلة أو مبالغ محصلة بحاجة للتوريد حالياً (0.00 EGP)."
                  : "No pending COD settlements or cash records (0.00 EGP)."}
              </div>
            ) : (
              records.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex justify-between items-center text-xs font-black"
                >
                  <div>
                    <span className="font-mono text-amber-500">{r.id}</span>
                    <p className="text-sm pt-0.5">{r.amount} EGP</p>
                    <span className="text-[10px] opacity-60">
                      {r.hubName} • {r.date}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] inline-flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                    <span>{isRtl ? "مكتمل ومستلم" : "Completed"}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* مودال توريد العهدة */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm flex items-center gap-2">
                <BuildingIcon className="w-4 h-4 text-amber-500" />
                <span>{t.modalTitle}</span>
              </h3>
              <button
                onClick={() => setShowSettlementModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-center font-black text-xs py-8 flex flex-col items-center gap-2">
                <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                <span>{t.successMsg}</span>
              </div>
            ) : (
              <form
                onSubmit={handleSettlementSubmit}
                className="space-y-4 text-xs font-black"
              >
                <div>
                  <label className="block mb-2">{t.selectMethod}</label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        settlementMethod === "cash_to_hub"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={settlementMethod === "cash_to_hub"}
                        onChange={() => setSettlementMethod("cash_to_hub")}
                        className="accent-amber-500"
                      />
                      <CashIcon className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{t.cashToHub}</span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        settlementMethod === "instapay"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={settlementMethod === "instapay"}
                        onChange={() => setSettlementMethod("instapay")}
                        className="accent-amber-500"
                      />
                      <LightningIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{t.instapay}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">{t.amount}</label>
                  <input
                    type="number"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    className={`w-full p-3 border rounded-xl outline-none font-black ${
                      isDarkMode
                        ? "bg-slate-950 text-white border-slate-700"
                        : "bg-white text-black border-slate-300"
                    }`}
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSettlementModal(false)}
                    className={`px-4 py-2.5 rounded-xl cursor-pointer ${
                      isDarkMode
                        ? "bg-slate-800 text-white"
                        : "bg-slate-200 text-black"
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black cursor-pointer shadow-xs"
                  >
                    {t.confirmSettle}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverWalletPage;
