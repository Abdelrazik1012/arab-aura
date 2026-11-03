import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  UserIcon,
  PackageIcon,
  TagIcon,
  WalletIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "../../components/Icons";

interface NotificationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  timeAr: string;
  timeEn: string;
  type: "order" | "offer" | "wallet" | "system";
  isRead: boolean;
}

export const CustomerNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "order" | "offer"
  >("all");

  // قائمة الإشعارات الافتراضية
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      titleAr: "تحديث حالة الطلب #3A-9081",
      titleEn: "Order Status Update #3A-9081",
      messageAr: "تم شحن طلبك بنجاح وهو الآن في طريقه إليك عبر مندوب الشحن.",
      messageEn: "Your order has been shipped successfully and is on its way.",
      timeAr: "منذ 15 دقيقة",
      timeEn: "15 mins ago",
      type: "order",
      isRead: false,
    },
    {
      id: "notif-2",
      titleAr: "عرض خاص ومحدود!",
      titleEn: "Exclusive Limited Offer!",
      messageAr: "خصم 15% إضافي عند الدفع باستخدام رصيد المحفظة الشخصية اليوم.",
      messageEn:
        "Get an extra 15% discount when paying with your wallet today.",
      timeAr: "منذ ساعتين",
      timeEn: "2 hours ago",
      type: "offer",
      isRead: false,
    },
    {
      id: "notif-3",
      titleAr: "إيداع رصيد في المحفظة",
      titleEn: "Wallet Funds Deposited",
      messageAr: "تم إضافة مبلغ 200.00 EGP إلى محفظتك بنجاح كاسترداد نقدي.",
      messageEn: "Amount of 200.00 EGP was added to your wallet as cashback.",
      timeAr: "أمس، 04:30 م",
      timeEn: "Yesterday, 04:30 PM",
      type: "wallet",
      isRead: true,
    },
    {
      id: "notif-4",
      titleAr: "تم تأكيد استلام الشحنة",
      titleEn: "Delivery Confirmed",
      messageAr: "شكراً لتسوقك معنا! تم تأكيد تسليم الطلب #3A-8812 بنجاح.",
      messageEn: "Thank you for shopping! Order #3A-8812 delivery confirmed.",
      timeAr: "منذ 3 أيام",
      timeEn: "3 days ago",
      type: "system",
      isRead: true,
    },
  ]);

  // تحديد الإشعار كمقروء
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  // تحديد الكل كمقروء
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // حذف إشعار
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "order") return n.type === "order";
    if (activeFilter === "offer") return n.type === "offer";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 🎨 ألوان نصوص حريصة ومباشرة (إجبارية)
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
                ? "مركز التنبيهات والإشعارات"
                : "Notifications Center"}
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
        {/* رأس الصفحة مع الشارة والأزرار */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#0E172A] flex items-center justify-center font-bold text-lg shadow-2xs relative">
              <BellIcon className="w-5 h-5 text-[#0E172A]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1
                className="text-sm sm:text-base font-black"
                style={{ color: textColor }}
              >
                {lang === "ar"
                  ? "الإشعارات والتنبيهات"
                  : "Notifications & Alerts"}
              </h1>
              <p
                className="text-[11px] font-bold"
                style={{ color: subTextColor }}
              >
                {lang === "ar"
                  ? `لديك ${unreadCount} إشعارات غير مقروءة`
                  : `You have ${unreadCount} unread notifications`}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black rounded-xl transition cursor-pointer text-white shadow-2xs text-center"
            >
              {lang === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
            </button>
          )}
        </div>

        {/* أزرار الفلترة */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", labelAr: "الكل", labelEn: "All" },
            { id: "unread", labelAr: "غير مقروء", labelEn: "Unread" },
            { id: "order", labelAr: "الطلبات والشحن", labelEn: "Orders" },
            { id: "offer", labelAr: "العروض والخصومات", labelEn: "Offers" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 border ${
                activeFilter === f.id
                  ? "bg-amber-400 text-[#0E172A] border-amber-400 shadow-2xs"
                  : isDarkMode
                    ? "bg-slate-800 border-slate-700 text-white hover:border-slate-600"
                    : "bg-white border-slate-300 text-black hover:border-slate-400 shadow-2xs"
              }`}
            >
              {lang === "ar" ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>

        {/* قائمة الإشعارات */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div
              className={`p-10 rounded-3xl border text-center space-y-3 ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200 shadow-2xs"}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mx-auto">
                <BellIcon className="w-8 h-8 opacity-50" />
              </div>
              <p
                className="text-xs font-bold"
                style={{ color: mutedTextColor }}
              >
                {lang === "ar"
                  ? "لا توجد إشعارات لعرضها حالياً"
                  : "No notifications found"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 rounded-2xl sm:rounded-3xl border flex items-start justify-between gap-3 sm:gap-4 transition cursor-pointer shadow-2xs ${
                  !n.isRead
                    ? isDarkMode
                      ? "bg-slate-800 border-amber-500/80"
                      : "bg-amber-100/60 border-amber-400"
                    : isDarkMode
                      ? "bg-[#1E293B] border-slate-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                      isDarkMode ? "bg-slate-800" : "bg-slate-200/80"
                    }`}
                  >
                    {n.type === "order" && <PackageIcon className="w-4 h-4 text-amber-500" />}
                    {n.type === "offer" && <TagIcon className="w-4 h-4 text-rose-500" />}
                    {n.type === "wallet" && <WalletIcon className="w-4 h-4 text-emerald-500" />}
                    {n.type === "system" && <SparklesIcon className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="text-xs font-black truncate"
                        style={{ color: textColor }}
                      >
                        {lang === "ar" ? n.titleAr : n.titleEn}
                      </h3>
                      {!n.isRead && (
                        <span className="px-2 py-0.5 bg-amber-400 text-[#0E172A] font-black text-[9px] rounded-md shadow-2xs shrink-0">
                          {lang === "ar" ? "جديد" : "NEW"}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs font-bold leading-relaxed"
                      style={{ color: subTextColor }}
                    >
                      {lang === "ar" ? n.messageAr : n.messageEn}
                    </p>
                    <span
                      className="text-[10px] font-bold block pt-1"
                      style={{ color: mutedTextColor }}
                    >
                      {lang === "ar" ? n.timeAr : n.timeEn}
                    </span>
                  </div>
                </div>

                {/* زر مسح الإشعار */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1.5 transition cursor-pointer rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0"
                  style={{ color: mutedTextColor }}
                  title="حذف"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerNotificationsPage;
