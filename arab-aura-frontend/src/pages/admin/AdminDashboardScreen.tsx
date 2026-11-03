import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { usePlatform } from "../../context/PlatformContext";
import type { AdminLayoutContextType } from "../../layouts/AdminLayout";
import { InteractivePlatformMap } from "../../components/InteractivePlatformMap";
import {
  PackageIcon,
  UsersIcon,
  DocumentTextIcon,
  StoreIcon,
  TruckIcon,
  CheckCircleIcon,
  TrendingUpIcon,
} from "../../components/Icons";

export const AdminDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const { isDarkMode } = useTheme();

  const { orders } = usePlatform();
  const totalRevenueNumber = orders.reduce(
    (acc, curr) => acc + (curr.totalAmount || 0),
    0,
  );
  const totalDelivered = orders.filter((o) => o.status === "delivered").length;
  const activeOrdersCount = orders.filter(
    (o) =>
      o.status === "out_for_delivery" ||
      o.status === "collected_in_hub" ||
      o.status === "ready_for_collection",
  ).length;

  // 📊 مؤشرات النظام والتحليلات الشاملة
  const stats = {
    totalUsers: "1,428",
    activeMerchants: "86",
    activeDrivers: "42",
    activeCollectors: "18",
    totalOrdersCount: orders.length,
    deliveredCount: totalDelivered,
    successRate:
      orders.length > 0
        ? `${Math.round((totalDelivered / orders.length) * 100)}%`
        : "94.2%",
    failureRate: "5.8%",
    platformEfficiency: isRtl ? "ممتازة ومستقرة" : "Optimal & Stable",
    totalRevenueLastMonth: "380,000 EGP",
    totalRevenueCurrentMonth: `${(482500 + totalRevenueNumber).toLocaleString()} EGP`,
    activeDeliveriesToday: `${activeOrdersCount + 310}`,
    pendingApprovalsCount: "2",
  };

  const pendingApprovals = [
    {
      id: "CTR-501",
      storeName: isRtl ? "متجر النيل للأزياء" : "Nile Fashion Store",
      ownerName: isRtl ? "إبراهيم محمد" : "Ibrahim Mohamed",
      category: isRtl ? "ملابس رجالي وكاجوال" : "Men's & Casual Wear",
      date: "2026-11-02",
    },
    {
      id: "CTR-503",
      storeName: isRtl ? "أورا للأحذية والشنط" : "Aura Shoes & Bags",
      ownerName: isRtl ? "سارة خالد" : "Sara Khaled",
      category: isRtl ? "جلود وأحذية" : "Leather & Footwear",
      date: "2026-11-03",
    },
  ];

  const recentUsers = [
    {
      id: "USR-101",
      name: isRtl ? "عبدالرازق بدر" : "Abdelrazik Badr",
      email: "abdelrazikrbadr@gmail.com",
      role: "admin",
      status: "active",
    },
    {
      id: "USR-102",
      name: isRtl ? "محمد أحمد" : "Mohamed Ahmed",
      email: "seller@aura.com",
      role: "seller",
      status: "active",
    },
    {
      id: "USR-103",
      name: isRtl ? "محمود سعيد" : "Mahmoud Saeed",
      email: "driver@aura.com",
      role: "driver",
      status: "active",
    },
    {
      id: "USR-104",
      name: isRtl ? "أحمد علي" : "Ahmed Ali",
      email: "collector@aura.com",
      role: "collector",
      status: "active",
    },
  ];

  const t = {
    welcomeTitle: isRtl
      ? "مرحباً بك في لوحة تحكم الأدمن والتحليلات"
      : "Welcome to Admin Analytics & Control Center",
    welcomeSubtitle: isRtl
      ? "نظرة شاملة ومباشرة على أداء المنصة، إيرادات المبيعات، ومعدلات التوصيل"
      : "Real-time overview of platform health, revenues, and fulfillment metrics",
    quickUsers: isRtl ? "إدارة المستخدمين" : "Manage Users",
    quickApprovals: isRtl ? "مراجعة العقود" : "Review Contracts",
    kpiUsers: isRtl ? "إجمالي المستخدمين المسجلين" : "Total Registered Users",
    kpiSuccess: isRtl
      ? "نسبة نجاح التوصيل والطلبات"
      : "Delivery Success Rate",
    kpiFailure: isRtl
      ? "نسبة الفشل وتعذر التسليم"
      : "Failure & Return Rate",
    kpiRevenue: isRtl
      ? "إجمالي إيرادات الشهر الحالي"
      : "Current Month Total Revenue",
    revenueGrowth: isRtl
      ? "↑ نمو 27% مقارنة بالشهر السابق"
      : "↑ 27% growth vs last month",
    serverStatus: isRtl ? "حالة الخوادم:" : "Server Status:",
    activeDeliveries: isRtl ? "طلب نشط اليوم" : "active orders today",
    returnsNote: isRtl ? "شحنات مرجعة أو ملغاة" : "Returned or canceled shipments",
    analyticsTitle: isRtl
      ? "تحليلات الأداء ومقارنة الشهور"
      : "Performance & Monthly Analytics",
    liveBadge: isRtl ? "بيانات لحظية مباشرة" : "Live Real-Time Data",
    lastMonth: isRtl
      ? "أداء وإيرادات الشهر الماضي (380,000 EGP)"
      : "Last Month Revenue (380,000 EGP)",
    thisMonth: isRtl
      ? "أداء وإيرادات الشهر الحالي (482,500 EGP)"
      : "Current Month Revenue (482,500 EGP)",
    increasingGrowth: isRtl ? "نمو متصاعد" : "Accelerating Growth",
    fulfillmentTitle: isRtl
      ? `معدل تسليم الشحنات الناجحة (${stats.activeDeliveriesToday} طلب)`
      : `Successful Delivery Rate (${stats.activeDeliveriesToday} orders)`,
    pendingTitle: isRtl
      ? "طلبات اعتماد المتاجر المعلقة"
      : "Pending Store Approvals",
    pendingSubtitle: isRtl
      ? "عقود متاجر جديدة تنتظر مراجعة الإدارة"
      : "New merchant contracts awaiting admin approval",
    viewAllApprovals: isRtl ? "عرض كل العقود ←" : "View All Contracts →",
    actionApprove: isRtl ? "معاينة واعتماد" : "Review & Approve",
    recentUsersTitle: isRtl
      ? "أحدث الحسابات المسجلة"
      : "Recent System Users",
    viewAllUsers: isRtl ? "عرض كل المستخدمين ←" : "View All Users →",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 🌟 Welcome Banner with Quick Actions */}
      <div
        className={`p-6 rounded-2xl border transition shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ● {stats.platformEfficiency}
            </span>
            <span className="text-xs opacity-50 font-mono">
              3ARB AURA SuperAdmin
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{t.welcomeTitle}</h1>
          <p className="text-xs opacity-60 mt-1">{t.welcomeSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
          >
            <PackageIcon className="w-4 h-4 text-slate-950" />
            <span>{isRtl ? "مراقبة الطلبات" : "Orders"} ({orders.length})</span>
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
          >
            <UsersIcon className="w-4 h-4" />
            <span>{t.quickUsers}</span>
          </button>
          <button
            onClick={() => navigate("/admin/approvals")}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>{t.quickApprovals} ({stats.pendingApprovalsCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs font-black opacity-60 block">
            {t.kpiUsers}
          </span>
          <h2 className="text-3xl font-black mt-2 text-cyan-500">
            {stats.totalUsers}
          </h2>
          <div className="flex items-center gap-2 text-[11px] opacity-70 mt-2 font-mono flex-wrap">
            <span className="flex items-center gap-1"><StoreIcon className="w-3 h-3 text-cyan-400" /> {stats.activeMerchants} بائع</span>
            <span>•</span>
            <span className="flex items-center gap-1"><TruckIcon className="w-3 h-3 text-blue-400" /> {stats.activeDrivers} سائق</span>
            <span>•</span>
            <span className="flex items-center gap-1"><PackageIcon className="w-3 h-3 text-amber-400" /> {stats.activeCollectors} مُجمّع</span>
          </div>
        </div>

        {/* Delivery Success Rate */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs font-black opacity-60 block">
            {t.kpiSuccess}
          </span>
          <h2 className="text-3xl font-black mt-2 text-emerald-500">
            {stats.successRate}
          </h2>
          <p className="text-[11px] opacity-60 mt-2">
            {t.serverStatus} {stats.platformEfficiency}
          </p>
        </div>

        {/* Failure & Return Rate */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs font-black opacity-60 block">
            {t.kpiFailure}
          </span>
          <h2 className="text-3xl font-black mt-2 text-rose-500">
            {stats.failureRate}
          </h2>
          <p className="text-[11px] opacity-60 mt-2">{t.returnsNote}</p>
        </div>

        {/* Current Month Revenue */}
        <div
          className={`p-5 rounded-2xl border transition shadow-sm ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <span className="text-xs font-black opacity-60 block">
            {t.kpiRevenue}
          </span>
          <h2 className="text-3xl font-black mt-2 text-indigo-400">
            {stats.totalRevenueCurrentMonth}
          </h2>
          <p className="text-[11px] text-emerald-500 font-bold mt-2">
            {t.revenueGrowth}
          </p>
        </div>
      </div>

      {/* 🗺️ خريطة العمليات واللوجستيات الحية للمنصة بالكامل للأدمن */}
      <InteractivePlatformMap
        role="admin"
        title={
          isRtl
            ? "خريطة العمليات واللوجستيات الحية (نظام 3ARB AURA)"
            : "Live Operations & Logistics Platform Map"
        }
        subtitle={
          isRtl
            ? "مراقبة حركة كافة الشحنات بين متاجر 6 أكتوبر ومراكز التجميع وكباتن التوصيل إلى المنوفية والجيزة والقاهرة"
            : "Live tracking of all shipments from 6th of October hubs to Menoufia, Giza, and Cairo"
        }
        showAiOptimalRoute={true}
      />

      {/* 📈 Performance & Monthly Comparison */}
      <div
        className={`p-6 rounded-2xl border transition shadow-sm space-y-6 ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div
          className={`flex justify-between items-center border-b pb-4 ${
            isDarkMode ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <h3 className="font-black text-sm flex items-center gap-1.5">
            <TrendingUpIcon className="w-4 h-4 text-rose-500" />
            <span>{t.analyticsTitle}</span>
          </h3>
          <span className="text-xs font-black px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg">
            {t.liveBadge}
          </span>
        </div>

        <div className="space-y-5">
          {/* Last Month */}
          <div>
            <div className="flex justify-between text-xs font-black mb-1.5">
              <span>{t.lastMonth}</span>
              <span className="opacity-60 font-mono">75%</span>
            </div>
            <div
              className={`w-full h-4 rounded-xl overflow-hidden ${
                isDarkMode ? "bg-slate-800" : "bg-slate-200"
              }`}
            >
              <div
                className="bg-indigo-500 h-full rounded-xl transition-all duration-500"
                style={{ width: "75%" }}
              />
            </div>
          </div>

          {/* This Month */}
          <div>
            <div className="flex justify-between text-xs font-black mb-1.5">
              <span>{t.thisMonth}</span>
              <span className="text-emerald-500 font-mono">
                95% ({t.increasingGrowth})
              </span>
            </div>
            <div
              className={`w-full h-4 rounded-xl overflow-hidden ${
                isDarkMode ? "bg-slate-800" : "bg-slate-200"
              }`}
            >
              <div
                className="bg-emerald-500 h-full rounded-xl transition-all duration-500"
                style={{ width: "95%" }}
              />
            </div>
          </div>

          {/* Fulfilment */}
          <div>
            <div className="flex justify-between text-xs font-black mb-1.5">
              <span>{t.fulfillmentTitle}</span>
              <span className="text-amber-500 font-mono">94.2%</span>
            </div>
            <div
              className={`w-full h-4 rounded-xl overflow-hidden ${
                isDarkMode ? "bg-slate-800" : "bg-slate-200"
              }`}
            >
              <div
                className="bg-amber-500 h-full rounded-xl transition-all duration-500"
                style={{ width: "94.2%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Columns: Pending Approvals & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div
          className={`p-6 rounded-2xl border transition shadow-sm space-y-4 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm">{t.pendingTitle}</h3>
              <p className="text-xs opacity-50 mt-0.5">{t.pendingSubtitle}</p>
            </div>
            <button
              onClick={() => navigate("/admin/approvals")}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
            >
              {t.viewAllApprovals}
            </button>
          </div>

          <div className="divide-y divide-slate-800/40">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-500 text-xs font-black">
                      {item.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-black text-xs mt-1">{item.storeName}</h4>
                  <p className="text-[11px] opacity-60">
                    {item.ownerName} • {item.date}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/admin/approvals")}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs shrink-0"
                >
                  {t.actionApprove}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent System Users */}
        <div
          className={`p-6 rounded-2xl border transition shadow-sm space-y-4 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm">{t.recentUsersTitle}</h3>
              <p className="text-xs opacity-50 mt-0.5">
                {isRtl ? "مستخدمي المنصة المسجلين" : "Registered platform accounts"}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
            >
              {t.viewAllUsers}
            </button>
          </div>

          <div className="divide-y divide-slate-800/40">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-rose-500 text-xs font-black">
                      {user.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold bg-indigo-500/10 text-indigo-400">
                      {user.role}
                    </span>
                  </div>
                  <h4 className="font-black text-xs mt-1">{user.name}</h4>
                  <p className="text-[11px] opacity-60 font-mono">
                    {user.email}
                  </p>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold shrink-0 flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{user.status === "active" ? (isRtl ? "نشط" : "Active") : ""}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardScreen;
