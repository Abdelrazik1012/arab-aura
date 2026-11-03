import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  WalletIcon,
  CashIcon,
  LightningIcon,
  PhoneIcon,
  BuildingIcon,
  CheckCircleIcon,
  CloseIcon,
} from "../../components/Icons";

export const SellerWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();

  const { isDarkMode, toggleTheme } = useTheme();

  // 💳 حالات مودال ونماذج السحب
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<
    "instapay" | "wallet" | "bank"
  >("instapay");
  const [withdrawAmount, setWithdrawAmount] = useState("21500");
  const [accountDetail, setAccountDetail] = useState("01092242607");
  const [isSuccess, setIsSuccess] = useState(false);

  const isRtl = lang === "ar";

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setShowWithdrawModal(false);
    }, 2000);
  };

  const t = {
    title: isRtl ? "محفظة وأرباح البائع" : "Seller Wallet & Earnings",
    dashboard: isRtl ? "لوحة التحكم" : "Dashboard",
    products: isRtl ? "المنتجات" : "Products",
    brands: isRtl ? "البراندات" : "Brands",
    orders: isRtl ? "الطلبات" : "Orders",
    wallet: isRtl ? "المحفظة" : "Wallet",
    logout: isRtl ? "خروج" : "Logout",
    availableBalance: isRtl ? "الرصيد المتاح للسحب" : "Available Balance",
    pendingBalance: isRtl ? "أرصدة معلقة قيد التسوية" : "Pending Balance",
    withdrawBtn: isRtl ? "سحب الأرباح الآن" : "Withdraw Earnings",
    modalTitle: isRtl ? "طلب سحب الأرباح" : "Payout Request",
    selectMethod: isRtl
      ? "اختر طريقة السحب المناسبة:"
      : "Select Payout Method:",
    instapay: "InstaPay (انستا باي)",
    eWallet: isRtl
      ? "محفظة إلكترونية (فودافون/أورانج/اتصالات كاش)"
      : "E-Wallet (Vodafone/Orange/Etisalat Cash)",
    bankTransfer: isRtl
      ? "تحويل بنكي مباشر (IBAN)"
      : "Direct Bank Transfer (IBAN)",
    amount: isRtl ? "المبلغ المراد سحبه (EGP)" : "Amount to Withdraw (EGP)",
    accountFieldLabel:
      withdrawMethod === "instapay"
        ? isRtl
          ? "معرف انستا باي (IPA) أو رقم الهاتف"
          : "InstaPay IPA / Phone Number"
        : withdrawMethod === "wallet"
          ? isRtl
            ? "رقم المحفظة الإلكترونية"
            : "E-Wallet Mobile Number"
          : isRtl
            ? "رقم الحساب البنكي / IBAN"
            : "Bank Account Number / IBAN",
    confirmWithdraw: isRtl ? "تأكيد طلب السحب" : "Confirm Withdrawal",
    cancel: isRtl ? "إلغاء" : "Cancel",
    successMsg: isRtl
      ? "تم إرسال طلب السحب بنجاح وجاري المعالجة!"
      : "Payout request submitted successfully!",
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
              onClick={() => navigate("/seller/dashboard")}
            >
              <BrandLogo showText={true} />
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-lg border hidden md:inline-block ${
                isDarkMode
                  ? "bg-slate-800 text-indigo-400 border-slate-700"
                  : "bg-indigo-50 text-indigo-950 border-indigo-200"
              }`}
            >
              {t.title}
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-2 text-xs font-black">
            <button
              onClick={() => navigate("/seller/dashboard")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => navigate("/seller/products")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.products}
            </button>
            <button
              onClick={() => navigate("/seller/brands")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.brands}
            </button>
            <button
              onClick={() => navigate("/seller/orders")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.orders}
            </button>
            <button
              onClick={() => navigate("/seller/wallet")}
              className="px-3 py-2 rounded-xl transition cursor-pointer bg-indigo-600 text-white shadow-xs"
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
          onClick={() => navigate("/seller/dashboard")}
          className="cursor-pointer"
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => navigate("/seller/products")}
          className="cursor-pointer"
        >
          {t.products}
        </button>
        <button
          onClick={() => navigate("/seller/brands")}
          className="cursor-pointer"
        >
          {t.brands}
        </button>
        <button
          onClick={() => navigate("/seller/orders")}
          className="cursor-pointer"
        >
          {t.orders}
        </button>
        <button
          onClick={() => navigate("/seller/wallet")}
          className="cursor-pointer text-indigo-600 dark:text-indigo-400"
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
              ? "متابعة الأرباح، الرصيد المتاح، وعمليات السحب الفورية عبر مختلف طرق الدفع الإلكترونية"
              : "Track balance and multi-channel payouts"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`p-6 rounded-2xl border shadow-xs space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
          >
            <span className="text-xs font-black opacity-60 block">
              {t.availableBalance}
            </span>
            <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              21,500 <span className="text-sm">EGP</span>
            </h2>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition"
            >
              {t.withdrawBtn}
            </button>
          </div>

          <div
            className={`p-6 rounded-2xl border shadow-xs space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
          >
            <span className="text-xs font-black opacity-60 block">
              {t.pendingBalance}
            </span>
            <h2 className="text-3xl font-black text-amber-500">
              4,200 <span className="text-sm">EGP</span>
            </h2>
            <p
              className={`text-[11px] font-bold ${isDarkMode ? "text-white/50" : "text-slate-500"}`}
            >
              {isRtl
                ? "تتم تسوية المبالغ المعلقة تلقائياً بعد اكتمال تسليم الطلبات للعملاء."
                : "Pending amounts settle automatically upon delivery."}
            </p>
          </div>
        </div>
      </main>

      {/* 💸 مودال سحب الأرباح المتعدد الخيارات */}
      {showWithdrawModal && (
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
                <CashIcon className="w-5 h-5 text-emerald-500" />
                <span>{t.modalTitle}</span>
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-center font-black text-xs py-8 flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                <span>{t.successMsg}</span>
              </div>
            ) : (
              <form
                onSubmit={handleWithdrawSubmit}
                className="space-y-4 text-xs font-black"
              >
                <div>
                  <label className="block mb-2 text-slate-700 dark:text-slate-300">
                    {t.selectMethod}
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        withdrawMethod === "instapay"
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={withdrawMethod === "instapay"}
                        onChange={() => setWithdrawMethod("instapay")}
                        className="accent-indigo-600"
                      />
                      <span className="flex items-center gap-1.5">
                        <LightningIcon className="w-4 h-4 text-amber-500" />
                        <span>{t.instapay}</span>
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        withdrawMethod === "wallet"
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={withdrawMethod === "wallet"}
                        onChange={() => setWithdrawMethod("wallet")}
                        className="accent-indigo-600"
                      />
                      <span className="flex items-center gap-1.5">
                        <PhoneIcon className="w-4 h-4 text-indigo-500" />
                        <span>{t.eWallet}</span>
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        withdrawMethod === "bank"
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={withdrawMethod === "bank"}
                        onChange={() => setWithdrawMethod("bank")}
                        className="accent-indigo-600"
                      />
                      <span className="flex items-center gap-1.5">
                        <BuildingIcon className="w-4 h-4 text-purple-500" />
                        <span>{t.bankTransfer}</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">{t.amount}</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className={`w-full p-3 border rounded-xl outline-none font-black ${
                      isDarkMode
                        ? "bg-slate-950 text-white border-slate-700"
                        : "bg-white text-black border-slate-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1">{t.accountFieldLabel}</label>
                  <input
                    type="text"
                    value={accountDetail}
                    onChange={(e) => setAccountDetail(e.target.value)}
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
                    onClick={() => setShowWithdrawModal(false)}
                    className={`px-4 py-2.5 rounded-xl cursor-pointer ${
                      isDarkMode
                        ? "bg-slate-800 text-white hover:bg-slate-700"
                        : "bg-slate-200 text-black hover:bg-slate-300"
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black cursor-pointer shadow-xs"
                  >
                    {t.confirmWithdraw}
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

export default SellerWalletPage;
