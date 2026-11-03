import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import InteractivePlatformMap from "../../components/InteractivePlatformMap";
import {
  PackageIcon,
  MapPinIcon,
  LayersIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "../../components/Icons";

export const CollectorDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { orders, packages } = usePlatform();
  const { isDarkMode: isDark } = useTheme();

  const readyForCollectionOrders = orders.filter(
    (o) => o.status === "ready_for_collection" || o.status === "pending" || o.status === "processing",
  );
  const collectedInHubOrders = orders.filter((o) => o.status === "collected_in_hub");
  const readyPackages = packages.filter((p) => p.status === "ready_at_hub");

  const collectorStats = {
    zoneName: isRtl
      ? "المنطقة الصناعية ومراكز 6 أكتوبر (زون A4)"
      : "Industrial Zone & 6th of October Centers (Zone A4)",
    radiusKm: isRtl ? "تغطية مرنة: 5 - 25 كم" : "Flexible Coverage: 5 - 25 km",
    availableOrdersCount: readyForCollectionOrders.length,
    activeCollectionsCount: collectedInHubOrders.length,
    preparingPackagesCount: packages.length,
    readyHandoffCount: readyPackages.length,
  };

  const t = {
    welcome: isRtl ? "لوحة تحكم مُجمّع المنطقة اللوجستي" : "Zone Logistics Collector Dashboard",
    zoneLabel: isRtl ? "نطاق الخدمة النشط:" : "Active Service Zone:",
    availableOrders: isRtl
      ? "طلبات بانتظار الاستلام من المتاجر"
      : "Orders Ready for Store Pickup",
    activeCollections: isRtl ? "شحنات تم تجميعها بالهَب" : "Collected in Hub",
    preparingPackages: isRtl ? "إجمالي الحزم الذكية" : "Total Smart Packages",
    readyHandoff: isRtl ? "حزم جاهزة لتسليم السائقين" : "Ready for Driver Pickup",
    quickActions: isRtl ? "الإجراءات والعمليات السريعة" : "Quick Actions",
    buildPackage: isRtl
      ? "فتح مُنشئ الحزم الذكية (Package Builder)"
      : "Open Smart Package Builder",
    viewAllOrders: isRtl
      ? "عرض جدول كل الطلبات والمتاجر"
      : "View Orders Table",
    viewMap: isRtl ? "شاشة الخريطة الميدانية" : "Field Map View",
    tableOrder: isRtl ? "رقم الطلب" : "Order ID",
    tableStore: isRtl ? "المتجر / البائع" : "Store / Seller",
    tableDestination: isRtl ? "وجهة التسليم النهائية" : "Final Destination",
    tableStatus: isRtl ? "الحالة" : "Status",
    collectorReady: isRtl ? "نظام التجميع يعمل بنشاط" : "Collector System Active",
    viewAll: isRtl ? "عرض الكل" : "View All",
  };

  return (
    <div className="space-y-6">
      {/* 🔹 بطاقة الترحيب وتأكيد النطاق */}
      <div
        className={`p-6 rounded-2xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black"
        }`}
      >
        <div>
          <h1 className="text-xl font-black">{t.welcome}</h1>
          <p
            className={`text-xs font-bold mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}
          >
            {t.zoneLabel}{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              {collectorStats.zoneName}
            </span>{" "}
            | {collectorStats.radiusKm}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-black text-emerald-800 dark:text-emerald-400">
            {t.collectorReady}
          </span>
        </div>
      </div>

      {/* 🔹 بطاقات الإحصائيات (KPIs) المرتبطة بالحالة المركزية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t.availableOrders,
            count: collectorStats.availableOrdersCount,
            path: "/collector/orders",
            color: "text-amber-500",
          },
          {
            label: t.activeCollections,
            count: collectorStats.activeCollectionsCount,
            path: "/collector/map",
            color: "text-indigo-600 dark:text-indigo-400",
          },
          {
            label: t.preparingPackages,
            count: collectorStats.preparingPackagesCount,
            path: "/collector/packages",
            color: "text-indigo-500",
          },
          {
            label: t.readyHandoff,
            count: collectorStats.readyHandoffCount,
            path: "/collector/packages",
            color: "text-emerald-600 dark:text-emerald-400",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.path)}
            className={`p-5 rounded-2xl border shadow-xs space-y-2 cursor-pointer hover:border-indigo-500 transition-all ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <span
              className={`text-xs font-bold ${isDark ? "text-white/50" : "text-black/50"}`}
            >
              {item.label}
            </span>
            <h3 className={`text-2xl font-black ${item.color}`}>
              {item.count}
            </h3>
          </div>
        ))}
      </div>

      {/* 🔹 الخريطة التفاعلية المدمجة مباشرة بالداشبورد مع اختيار النطاق */}
      <InteractivePlatformMap
        role="collector"
        title={
          isRtl
            ? "خريطة نقاط الاستلام والتجميع التفاعلية (6 أكتوبر والمحافظات)"
            : "Interactive Store Pickup & Collection Map"
        }
        subtitle={
          isRtl
            ? "اختر نصف القطر (5 - 25 كم) واضغط على أي شحنة لنقلها للهب أو تجميعها في باكج"
            : "Select coverage radius and click pins to collect orders to hub"
        }
      />

      {/* 🔹 الإجراءات السريعة وجدول الطلبات المتاحة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-2xl border shadow-xs space-y-3 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        >
          <h3 className="text-sm font-black">{t.quickActions}</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/collector/packages")}
              className="w-full text-start px-4 py-3 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-900 dark:text-indigo-200 rounded-xl text-xs font-black transition cursor-pointer border border-indigo-200 dark:border-indigo-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <PackageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t.buildPackage}</span>
              </div>
              {isRtl ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate("/collector/map")}
              className={`w-full text-start px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer border flex items-center justify-between ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.viewMap}</span>
              </div>
              {isRtl ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate("/collector/orders")}
              className={`w-full text-start px-4 py-3 rounded-xl text-xs font-black transition cursor-pointer border flex items-center justify-between ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <LayersIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t.viewAllOrders}</span>
              </div>
              {isRtl ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div
          className={`lg:col-span-2 p-6 rounded-2xl border shadow-xs space-y-4 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black">
              {t.availableOrders} ({readyForCollectionOrders.length})
            </h3>
            <button
              onClick={() => navigate("/collector/orders")}
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr
                  className={`border-b text-xs font-black ${
                    isDark
                      ? "border-slate-800 text-white/50"
                      : "border-slate-200 text-black/50"
                  }`}
                >
                  <th className="p-3 text-start">{t.tableOrder}</th>
                  <th className="p-3 text-start">{t.tableStore}</th>
                  <th className="p-3 text-start">{t.tableDestination}</th>
                  <th className="p-3 text-start">{t.tableStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-black">
                {readyForCollectionOrders.slice(0, 5).map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-indigo-50/5 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => navigate("/collector/map")}
                  >
                    <td className="p-3 text-indigo-600 dark:text-indigo-400 font-black text-start">
                      {ord.id}
                    </td>
                    <td
                      className={`p-3 text-start ${isDark ? "text-white" : "text-black"}`}
                    >
                      {ord.sellerName}
                    </td>
                    <td
                      className={`p-3 text-start ${isDark ? "text-white/50" : "text-black/50"}`}
                    >
                      {ord.city}
                    </td>
                    <td className="p-3 text-start">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] ${
                          ord.status === "ready_for_collection"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {ord.status === "ready_for_collection"
                          ? "جاهز للاستلام"
                          : "جاري التجهيز"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboardScreen;
