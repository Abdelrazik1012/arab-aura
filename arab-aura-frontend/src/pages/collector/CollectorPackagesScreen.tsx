import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import {
  SparklesIcon,
  PlusIcon,
  TruckIcon,
  CheckCircleIcon,
  TagIcon,
  WalletIcon,
  CloseIcon,
} from "../../components/Icons";

export const CollectorPackagesScreen: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { orders, packages, createPackage } = usePlatform();
  const { isDarkMode: isDark } = useTheme();

  const [showManualModal, setShowManualModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGeneratingAiBatch, setIsGeneratingAiBatch] = useState(false);
  const [aiSuccessToast, setAiSuccessToast] = useState("");

  // الطلبات المتاحة في الهب للتجميع
  const standardHubOrders = orders.filter((o) => o.shippingType === "standard");

  // مقترحات التجميع الذكي بالـ AI (النمطان: شحن سريع Express وتجميع اقتصادي 2-3 أيام)
  const aiSuggestions = [
    {
      id: "PKG-EXP-OCT-101",
      tier: "express",
      title: "⚡ باكدج شحن سريع فوري Express (نفس اليوم - 6 أكتوبر والشيخ زايد)",
      destinationZone: "الجيزة",
      targetCity: "6 أكتوبر والشيخ زايد",
      ordersList: ["ORD-9824", "ORD-9828"],
      ordersCount: 2,
      saving: "شحن سريع فوري خلال 2-4 ساعات للطلبات المستعجلة - ربح السائق 120 ج.م للشحنتين بدون تأخير",
      customerFee: "75 ج.م للعميل (Express)",
      driverEarnings: "120 ج.م دخل للسائق",
      totalWeightKg: 2.1,
      recommendedDriver: "أحمد محمود (سائق خط أكتوبر الفوري)",
      aiConfidence: "99% توافق جغرافي فوري",
    },
    {
      id: "PKG-AI-MONUF-101",
      tier: "economy",
      title: "باكدج التجميع الاقتصادي الذكي (2-3 أيام: شبين الكوم والباجور بالمنوفية)",
      destinationZone: "المنوفية",
      targetCity: "شبين الكوم & الباجور",
      ordersList: ["ORD-9821", "ORD-9822", "ORD-9823", "ORD-9826"],
      ordersCount: 4,
      saving: "توفير 65% على المستهلك (35 ج.م فقط) ومضاعفة ربح السائق إلى 380 ج.م بدمج 4 شحنات في مشوار واحد",
      customerFee: "35 ج.م فقط للعميل (اقتصادي مجمع)",
      driverEarnings: "380 ج.م دخل صافي للسائق",
      totalWeightKg: 5.6,
      recommendedDriver: "أحمد محمود (سائق خط المنوفية)",
      aiConfidence: "98% توافق مسار وتوقيت",
    },
  ];

  const handleApproveAiSuggestion = (suggestion: (typeof aiSuggestions)[0]) => {
    createPackage({
      title: suggestion.title,
      destinationZone: suggestion.destinationZone,
      destinationCity: suggestion.targetCity,
      orderIds: suggestion.ordersList,
      assignedDriver: suggestion.recommendedDriver,
      savingsRatio: suggestion.saving,
    });

    setAiSuccessToast(
      isRtl
        ? `✓ تم اعتماد الحزمة الذكية "${suggestion.title}" بنجاح وإرسال إشعار فوري للسائقين المتاحين!`
        : `✓ AI Package approved and notified to nearby drivers!`,
    );
    setShowAiModal(false);
    setTimeout(() => setAiSuccessToast(""), 5000);
  };

  const [selectedZoneFilter, setSelectedZoneFilter] =
    useState<string>("المنوفية");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const eligibleManualOrders = standardHubOrders.filter(
    (ord) => ord.governorate === selectedZoneFilter || ord.city.includes(selectedZoneFilter),
  );

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCreateManualPackage = () => {
    if (selectedOrderIds.length === 0) return;

    createPackage({
      title: `حزمة ${selectedZoneFilter} اليدوية`,
      destinationZone: selectedZoneFilter,
      destinationCity: selectedZoneFilter,
      orderIds: selectedOrderIds,
      assignedDriver: "بانتظار قبول السائق",
      savingsRatio: `تجميع يدوي (${selectedOrderIds.length} شحنات)`,
    });

    setSelectedOrderIds([]);
    setShowManualModal(false);
    setAiSuccessToast(
      isRtl
        ? `✓ تم إنشاء الحزمة وإدراجها بمركز الاستلام للسائقين!`
        : `✓ Package created successfully!`,
    );
    setTimeout(() => setAiSuccessToast(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 🔹 كارت الهيدر */}
      <div
        className={`p-6 rounded-2xl border shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black"
        }`}
      >
        <div>
          <h1 className="text-xl font-black">
            مُنشئ الحزم وتتبع شحن المحافظات (AI Package Clustering)
          </h1>
          <p
            className={`text-xs font-bold mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}
          >
            تجميع طلبات محلات 6 أكتوبر المتجهة لنفس المحافظة (مثل المنوفية / شبين الكوم) لتسليمها للسائق كباكج واحدة
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setIsGeneratingAiBatch(true);
              setShowAiModal(true);
              setTimeout(() => setIsGeneratingAiBatch(false), 600);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <SparklesIcon className="w-4 h-4 text-slate-950" />
            <span>
              {isRtl
                ? "مقترحات التجميع الذكي بالـ AI"
                : "AI Smart Batching Suggestions"}
            </span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{isRtl ? "تجميع حزمة يدوياً" : "Manual Package"}</span>
          </button>
        </div>
      </div>

      {aiSuccessToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black text-center animate-fade-in flex items-center justify-center gap-2">
          <span>✨</span>
          <span>{aiSuccessToast}</span>
        </div>
      )}

      {/* 🔹 قائمة الحزم الحالية والجاهزة للتسليم للسائقين */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <span className="font-mono font-black text-xs text-indigo-500">
                {pkg.id}
              </span>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-lg font-black flex items-center gap-1.5 ${
                  pkg.status === "in_transit"
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-emerald-500/15 text-emerald-500"
                }`}
              >
                {pkg.status === "in_transit" ? (
                  <>
                    <TruckIcon className="w-3 h-3" />
                    <span>في الطريق مع السائق</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-3 h-3" />
                    <span>جاهزة لاستلام السائق</span>
                  </>
                )}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-sm">{pkg.title}</h3>
              <p className="text-[11px] opacity-70">
                الوجهة: {pkg.destinationCity} ({pkg.destinationZone})
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-xs space-y-1.5 font-bold">
              <div className="flex justify-between">
                <span className="opacity-60">عدد الشحنات المجمعة:</span>
                <span className="font-black text-indigo-500">{pkg.ordersCount} طلبات</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">أرقام الطلبات:</span>
                <span className="font-mono text-[10px]">{pkg.orderIds.join(" ، ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">السائق المخصص:</span>
                <span>{pkg.assignedDriver || "بانتظار قبول السائق"}</span>
              </div>
            </div>

            {pkg.savingsRatio && (
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{pkg.savingsRatio}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔹 مودال مقترحات الذكاء الاصطناعي */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-2xl w-full p-6 rounded-2xl border shadow-2xl space-y-5 ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-black">
                    مقترحات التجميع الذكي بالذكاء الاصطناعي
                  </h3>
                  <p className="text-xs opacity-60">
                    قام النظام بتحليل وجهات الشحنات وتجميعها حسب خطوط السير الأعلى كفاءة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {isGeneratingAiBatch ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-black">جاري تحليل الوجهات وحساب التوفير اللوجستي...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {aiSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-amber-500">
                        {sug.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                        {sug.aiConfidence}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{sug.saving}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                        <TagIcon className="w-3 h-3" />
                        <span>الشحن: {sug.customerFee}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <WalletIcon className="w-3 h-3" />
                        <span>ربح السائق: {sug.driverEarnings}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black pt-2 border-t border-amber-500/20">
                      <span className="opacity-70">
                        الشحنات المشمولة ({sug.ordersCount}): {sug.ordersList.join("، ")}
                      </span>
                      <button
                        onClick={() => handleApproveAiSuggestion(sug)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-xs transition"
                      >
                        ✓ اعتماد الحزمة وإرسالها للسائقين
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔹 مودال التجميع اليدوي */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-lg w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black">إنشاء حزمة يدوية مخصصة</h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-black">
              <div>
                <label className="block mb-1 opacity-70">المحافظة المستهدفة:</label>
                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 outline-none"
                >
                  <option value="المنوفية">المنوفية (شبين الكوم & الباجور)</option>
                  <option value="الغربية">الغربية (طنطا)</option>
                  <option value="الجيزة">الجيزة و6 أكتوبر</option>
                  <option value="القاهرة">القاهرة</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 opacity-70">
                  اختر الشحنات لتضمينها ({eligibleManualOrders.length} متاحة):
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {eligibleManualOrders.map((ord) => (
                    <label
                      key={ord.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-indigo-50/10"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(ord.id)}
                        onChange={() => toggleOrderSelection(ord.id)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-black text-indigo-500">{ord.id}</span>
                          <span>{ord.totalAmount} ج.م</span>
                        </div>
                        <div className="text-[10px] opacity-60">
                          {ord.sellerName} ➔ {ord.city}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl font-black text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={selectedOrderIds.length === 0}
                onClick={handleCreateManualPackage}
                className="flex-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-500 text-white rounded-xl font-black text-xs cursor-pointer transition shadow-xs"
              >
                تأكيد إنشاء الحزمة ({selectedOrderIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorPackagesScreen;
