import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  DocumentTextIcon,
  StarIcon,
  SparklesIcon,
} from "../../components/Icons";

interface ReviewItem {
  id: string;
  productNameAr: string;
  productNameEn: string;
  orderId: string;
  date: string;
  ratings: {
    quality: number;
    shipping: number;
    packaging: number;
    support: number;
  };
  commentAr: string;
  commentEn: string;
}

export const CustomerReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // طلب نشط حالياً للتقييم المفصل
  const [activeOrderToReview, setActiveOrderToReview] = useState({
    orderId: "3A-9081",
    productNameAr: "تيشيرت بولو قطن مطرز كاجوال أنيق",
    productNameEn: "Embroidered Cotton Polo T-Shirt",
    quality: 5,
    shipping: 4,
    packaging: 5,
    support: 5,
    commentAr: "",
    commentEn: "",
  });

  // سجل التقييمات السابقة
  const [reviewHistory, setReviewHistory] = useState<ReviewItem[]>([
    {
      id: "rev-1",
      productNameAr: "بنطلون شينو كلاسيكي رجالي",
      productNameEn: "Classic Men Chino Trousers",
      orderId: "3A-8812",
      date: "2026-10-10",
      ratings: { quality: 5, shipping: 5, packaging: 4, support: 5 },
      commentAr: "الخامة ممتازة جداً ومطابقة للصورة، والتوصيل كان سريع.",
      commentEn: "Material is excellent and matches photos. Fast shipping.",
    },
    {
      id: "rev-2",
      productNameAr: "ساعة يد كلاسيكية جلد فاخرة",
      productNameEn: "Luxury Leather Classic Watch",
      orderId: "3A-7540",
      date: "2026-08-15",
      ratings: { quality: 4, shipping: 3, packaging: 4, support: 4 },
      commentAr: "ساعة رائعة ولكن تأخر مندوب التوصيل يوماً إضافياً.",
      commentEn: "Great watch but delivery courier delayed by an extra day.",
    },
  ]);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    commentAr: "",
    quality: 5,
    shipping: 5,
    packaging: 5,
    support: 5,
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canEditReview = (reviewDate: string) => {
    const created = new Date(reviewDate).getTime();
    const now = new Date().getTime();
    const diffDays = (now - created) / (1000 * 3600 * 24);
    return diffDays <= 14;
  };

  const handleSubmitActiveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      productNameAr: activeOrderToReview.productNameAr,
      productNameEn: activeOrderToReview.productNameEn,
      orderId: activeOrderToReview.orderId,
      date: new Date().toISOString().split("T")[0],
      ratings: {
        quality: activeOrderToReview.quality,
        shipping: activeOrderToReview.shipping,
        packaging: activeOrderToReview.packaging,
        support: activeOrderToReview.support,
      },
      commentAr: activeOrderToReview.commentAr || "تقييم ممتاز للخدمة والمنتج.",
      commentEn:
        activeOrderToReview.commentEn ||
        "Excellent service and product rating.",
    };

    setReviewHistory([newRev, ...reviewHistory]);
    setSuccessMsg(
      lang === "ar" ? "تم نشر تقييمك بنجاح!" : "Review published successfully!",
    );
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveEdit = (id: string) => {
    setReviewHistory((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              commentAr: editForm.commentAr,
              ratings: {
                quality: editForm.quality,
                shipping: editForm.shipping,
                packaging: editForm.packaging,
                support: editForm.support,
              },
            }
          : r,
      ),
    );
    setEditingReviewId(null);
    setSuccessMsg(
      lang === "ar"
        ? "تم تحديث التقييم بنجاح!"
        : "Review updated successfully!",
    );
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const subTextColor = isDarkMode ? "#CBD5E1" : "#334155";
  const mutedTextColor = isDarkMode ? "#94A3B8" : "#64748B";

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        isDarkMode ? "bg-[#0F172A]" : "bg-[#F8FAFC]"
      }`}
      style={{ color: textColor }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: ${lang === "ar" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"}; }
      `}</style>

      {/* 🔝 النافبار العلوي */}
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isDarkMode
            ? "bg-[#1E293B] border-slate-700 shadow-2xs"
            : "bg-white border-slate-200 shadow-2xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => navigate("/customer/products")}
          >
            <BrandLogo showText={true} />
            <span
              className="text-[11px] sm:text-xs font-black hidden md:inline"
              style={{ color: textColor }}
            >
              |{" "}
              {lang === "ar"
                ? "مركز التقييمات والآراء"
                : "Reviews & Ratings Center"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 px-2.5 sm:px-3 border rounded-full text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-[#0F172A] border-slate-700 text-amber-400"
                  : "bg-slate-100 border-slate-300 text-slate-700"
              }`}
            >
              {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`px-2.5 sm:px-3 py-1 border rounded-full text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? "bg-[#0F172A] border-slate-700 text-slate-300"
                  : "bg-slate-100 border-slate-300 text-black"
              }`}
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <button
              onClick={() => navigate("/customer/profile")}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-amber-400 text-[#0E172A] font-black rounded-full text-xs shadow-2xs hover:bg-amber-500 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {lang === "ar" ? "حسابي" : "Profile"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* رأس الصفحة وأزرار التبديل */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h1
              className="text-sm sm:text-base font-black"
              style={{ color: textColor }}
            >
              {lang === "ar"
                ? "⭐ تقييمات المنتجات والخدمات"
                : "⭐ Product & Service Reviews"}
            </h1>
            <p
              className="text-[11px] font-bold"
              style={{ color: subTextColor }}
            >
              {lang === "ar"
                ? "قيم طلباتك الحالية أو استعرض سجلك السابق (إمكانية التعديل خلال 14 يوماً)"
                : "Rate active orders or view history (editable within 14 days)"}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "active"
                  ? "bg-amber-400 text-[#0E172A] shadow-2xs"
                  : "text-black dark:text-white"
              }`}
            >
              {lang === "ar" ? "الطلبات النشطة" : "Active Orders"}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === "history"
                  ? "bg-amber-400 text-[#0E172A] shadow-2xs"
                  : "text-black dark:text-white"
              }`}
            >
              {lang === "ar" ? "سجل تقييماتي" : "Review History"}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        {/* كارت تقييم الطلب النشط */}
        {activeTab === "active" ? (
          <div
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 shadow-2xs ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200"}`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-black" style={{ color: textColor }}>
                {lang === "ar"
                  ? `تقييم الطلب الحالي #${activeOrderToReview.orderId}`
                  : `Rate Active Order #${activeOrderToReview.orderId}`}
              </h3>
              <span className="px-2.5 py-1 bg-amber-400/20 text-amber-600 dark:text-amber-400 font-black text-[10px] rounded-full">
                {lang === "ar" ? "طلب نشط" : "Active Order"}
              </span>
            </div>

            <p
              className="text-xs sm:text-sm font-black"
              style={{ color: textColor }}
            >
              {lang === "ar"
                ? activeOrderToReview.productNameAr
                : activeOrderToReview.productNameEn}
            </p>

            <form
              onSubmit={handleSubmitActiveReview}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* 1. خامة المنتج */}
                <div
                  className={`p-3 rounded-2xl border space-y-1 ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                >
                  <label
                    className="font-black block"
                    style={{ color: textColor }}
                  >
                    {lang === "ar"
                      ? "خامة المنتج (Quality):"
                      : "Product Quality:"}
                  </label>
                  <select
                    value={activeOrderToReview.quality}
                    onChange={(e) =>
                      setActiveOrderToReview({
                        ...activeOrderToReview,
                        quality: Number(e.target.value),
                      })
                    }
                    className={`w-full p-2 border rounded-xl font-bold outline-none cursor-pointer ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-white border-slate-300 text-black"}`}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5 ممتاز)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 جيد جداً)</option>
                    <option value={3}>⭐⭐⭐ (3/5 متوسط)</option>
                    <option value={2}>⭐⭐ (2/5 ضعيف)</option>
                    <option value={1}>⭐ (1/5 سيء)</option>
                  </select>
                </div>

                {/* 2. خدمة التوصيل */}
                <div
                  className={`p-3 rounded-2xl border space-y-1 ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                >
                  <label
                    className="font-black block"
                    style={{ color: textColor }}
                  >
                    {lang === "ar"
                      ? "خدمة التوصيل (Shipping):"
                      : "Shipping Service:"}
                  </label>
                  <select
                    value={activeOrderToReview.shipping}
                    onChange={(e) =>
                      setActiveOrderToReview({
                        ...activeOrderToReview,
                        shipping: Number(e.target.value),
                      })
                    }
                    className={`w-full p-2 border rounded-xl font-bold outline-none cursor-pointer ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-white border-slate-300 text-black"}`}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5 سريع ومنضبط)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 جيد)</option>
                    <option value={3}>⭐⭐⭐ (3/5 مقبول)</option>
                    <option value={2}>⭐⭐ (2/5 متأخر)</option>
                    <option value={1}>⭐ (1/5 سيء جداً)</option>
                  </select>
                </div>

                {/* 3. التغليف والتعبئة */}
                <div
                  className={`p-3 rounded-2xl border space-y-1 ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                >
                  <label
                    className="font-black block"
                    style={{ color: textColor }}
                  >
                    {lang === "ar"
                      ? "التغليف والتعبئة (Packaging):"
                      : "Packaging:"}
                  </label>
                  <select
                    value={activeOrderToReview.packaging}
                    onChange={(e) =>
                      setActiveOrderToReview({
                        ...activeOrderToReview,
                        packaging: Number(e.target.value),
                      })
                    }
                    className={`w-full p-2 border rounded-xl font-bold outline-none cursor-pointer ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-white border-slate-300 text-black"}`}
                  >
                    <option value={5}>
                      ⭐⭐⭐⭐⭐ (5/5 إحكام وتغليف فاخر)
                    </option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 جيد)</option>
                    <option value={3}>⭐⭐⭐ (3/5 مقبول)</option>
                    <option value={2}>⭐⭐ (2/5 تالف جزئياً)</option>
                    <option value={1}>⭐ (1/5 سيء)</option>
                  </select>
                </div>

                {/* 4. تواصل الدعم */}
                <div
                  className={`p-3 rounded-2xl border space-y-1 ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                >
                  <label
                    className="font-black block"
                    style={{ color: textColor }}
                  >
                    {lang === "ar" ? "الدعم الفني (Support):" : "Support Team:"}
                  </label>
                  <select
                    value={activeOrderToReview.support}
                    onChange={(e) =>
                      setActiveOrderToReview({
                        ...activeOrderToReview,
                        support: Number(e.target.value),
                      })
                    }
                    className={`w-full p-2 border rounded-xl font-bold outline-none cursor-pointer ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-white border-slate-300 text-black"}`}
                  >
                    <option value={5}>
                      ⭐⭐⭐⭐⭐ (5/5 استجابة سريعة جداً)
                    </option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 جيد)</option>
                    <option value={3}>⭐⭐⭐ (3/5 متوسط)</option>
                    <option value={2}>⭐⭐ (2/5 بطيء)</option>
                    <option value={1}>⭐ (1/5 سيء)</option>
                  </select>
                </div>
              </div>

              {/* حقل التعليق */}
              <div className="space-y-1">
                <label
                  className="font-black block"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "تعليقك التفصيلي:" : "Detailed Review:"}
                </label>
                <textarea
                  rows={3}
                  value={activeOrderToReview.commentAr}
                  onChange={(e) =>
                    setActiveOrderToReview({
                      ...activeOrderToReview,
                      commentAr: e.target.value,
                    })
                  }
                  placeholder={
                    lang === "ar"
                      ? "اكتب انطباعك عن المنتج والخدمة لتفيد العملاء الآخرين..."
                      : "Write your detailed thoughts here..."
                  }
                  className={`w-full p-3 border rounded-xl font-bold outline-none ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-[#0E172A] font-black rounded-xl transition shadow-2xs cursor-pointer text-xs"
              >
                {lang === "ar"
                  ? "نشر التقييم على صفحة المنتج"
                  : "Publish Review on Product Page"}
              </button>
            </form>
          </div>
        ) : (
          /* سجل التقييمات السابقة */
          <div className="space-y-3">
            {reviewHistory.length === 0 ? (
              <div
                className={`p-10 rounded-3xl border text-center space-y-3 ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200 shadow-2xs"}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mx-auto">
                  <DocumentTextIcon className="w-8 h-8 opacity-50" />
                </div>
                <p
                  className="text-xs font-bold"
                  style={{ color: mutedTextColor }}
                >
                  {lang === "ar"
                    ? "لا توجد تقييمات سابقة مسجلة"
                    : "No review history found"}
                </p>
              </div>
            ) : (
              reviewHistory.map((rev) => {
                const editable = canEditReview(rev.date);
                const isEditing = editingReviewId === rev.id;

                return (
                  <div
                    key={rev.id}
                    className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-3 shadow-2xs ${
                      isDarkMode
                        ? "bg-[#1E293B] border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
                      <div>
                        <h4
                          className="text-xs font-black"
                          style={{ color: textColor }}
                        >
                          {lang === "ar"
                            ? rev.productNameAr
                            : rev.productNameEn}
                        </h4>
                        <span
                          className="text-[10px] font-bold block pt-0.5"
                          style={{ color: mutedTextColor }}
                        >
                          {lang === "ar"
                            ? `طلب رقم: #${rev.orderId} • تاريخ التقييم: ${rev.date}`
                            : `Order #${rev.orderId} • Date: ${rev.date}`}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${editable ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/20 text-slate-500"}`}
                      >
                        {editable
                          ? lang === "ar"
                            ? "✓ متاح التعديل (أسبوعين)"
                            : "Editable (14 days)"
                          : lang === "ar"
                            ? "منتهي (أكثر من أسبوعين)"
                            : "Read-Only"}
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold"
                      style={{ color: subTextColor }}
                    >
                      <div>
                        {lang === "ar" ? "الخامة:" : "Quality:"} ⭐{" "}
                        {rev.ratings.quality}/5
                      </div>
                      <div>
                        {lang === "ar" ? "التوصيل:" : "Shipping:"} ⭐{" "}
                        {rev.ratings.shipping}/5
                      </div>
                      <div>
                        {lang === "ar" ? "التغليف:" : "Packaging:"} ⭐{" "}
                        {rev.ratings.packaging}/5
                      </div>
                      <div>
                        {lang === "ar" ? "الدعم:" : "Support:"} ⭐{" "}
                        {rev.ratings.support}/5
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 pt-2">
                        <textarea
                          rows={2}
                          value={editForm.commentAr}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              commentAr: e.target.value,
                            })
                          }
                          className={`w-full p-2.5 border rounded-xl font-bold outline-none text-xs ${isDarkMode ? "bg-[#0F172A] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-black"}`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(rev.id)}
                            className="px-4 py-1.5 bg-amber-400 text-[#0E172A] font-black rounded-xl text-xs cursor-pointer shadow-2xs"
                          >
                            {lang === "ar" ? "حفظ التعديل" : "Save Changes"}
                          </button>
                          <button
                            onClick={() => setEditingReviewId(null)}
                            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 font-black rounded-xl text-xs cursor-pointer text-black dark:text-white"
                          >
                            {lang === "ar" ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className="text-xs font-bold leading-relaxed"
                          style={{ color: subTextColor }}
                        >
                          "{rev.commentAr}"
                        </p>
                        {editable && (
                          <button
                            onClick={() => {
                              setEditingReviewId(rev.id);
                              setEditForm({
                                commentAr: rev.commentAr,
                                quality: rev.ratings.quality,
                                shipping: rev.ratings.shipping,
                                packaging: rev.ratings.packaging,
                                support: rev.ratings.support,
                              });
                            }}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black rounded-xl transition cursor-pointer shrink-0 border border-slate-300 dark:border-slate-700 text-black dark:text-white"
                          >
                            {lang === "ar" ? "✏️ تعديل" : "Edit"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerReviewsPage;
