import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import type { OrderStatus } from "../../context/PlatformContext";
import BrandLogo from "../../components/BrandLogo";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  DocumentTextIcon,
  LightningIcon,
  PackageIcon,
  BuildingIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  CloseIcon,
  RefreshIcon,
  MapIcon,
} from "../../components/Icons";
import { LeafletJourneyTracker } from "../../components/LeafletJourneyTracker";

export const SellerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { orders, updateOrderStatus } = usePlatform();

  const { isDarkMode, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingJourneyOrder, setTrackingJourneyOrder] = useState<any | null>(null);

  // 🔄 تحديث حالة الطلب وربطها بالمنصة المركزية
  const handleUpdateOrderStatus = (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    updateOrderStatus(
      orderId,
      nextStatus,
      "متجر البائع (Town Team)",
      "تم تحديث مرحلة التجهيز بواسطة البائع",
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev: any) =>
        prev ? { ...prev, status: nextStatus } : null,
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const filteredOrders = orders.filter((ord) => {
    if (activeTab === "all") return true;
    return ord.status === activeTab;
  });

  const isRtl = lang === "ar";

  const t = {
    title: isRtl ? "إدارة الطلبات واللوجستيات" : "Orders & Logistics Hub",
    dashboard: isRtl ? "لوحة التحكم" : "Dashboard",
    products: isRtl ? "المنتجات" : "Products",
    brands: isRtl ? "البراندات" : "Brands",
    orders: isRtl ? "الطلبات" : "Orders",
    wallet: isRtl ? "المحفظة" : "Wallet",
    logout: isRtl ? "خروج" : "Logout",
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-black"
      }`}
    >
      {/* 🔹 شريط التنقل العلوي المباشر (Navbar) */}
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

          {/* روابط التنقل للشاشات الكبيرة */}
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
              className="px-3 py-2 rounded-xl transition cursor-pointer bg-indigo-600 text-white shadow-xs"
            >
              {t.orders}
            </button>
            <button
              onClick={() => navigate("/seller/wallet")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.wallet}
            </button>
          </nav>

          {/* الأزرار والإعدادات (الدارك مود، اللغة، الخروج) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-amber-400"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
              title="Toggle Theme"
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
          className="cursor-pointer text-indigo-600 dark:text-indigo-400"
        >
          {t.orders}
        </button>
        <button
          onClick={() => navigate("/seller/wallet")}
          className="cursor-pointer"
        >
          {t.wallet}
        </button>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* هيدر الصفحة */}
        <div
          className={`p-6 rounded-3xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        >
          <div>
            <h1 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
              <span>
                {isRtl
                  ? "إدارة الطلبات والعمليات اللوجستية"
                  : "Orders Lifecycle & Fulfillment"}
              </span>
            </h1>
            <p
              className={`text-xs font-bold pt-1 ${isDarkMode ? "text-white/50" : "text-slate-500"}`}
            >
              {isRtl
                ? "متابعة تجهيز الطلبات، التسليم للمُجمّع، والتنسيق مع سائقي وصلة"
                : "Track packing, handover to Collector, and Driver delivery sync"}
            </p>
          </div>
        </div>

        {/* 🔘 تبويبات الفلترة حسب مرحلة الطلب */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black">
          {[
            { id: "all", label: isRtl ? "الكل" : "All" },
            {
              id: "pending",
              label: isRtl ? "بانتظار التأكيد" : "Pending",
            },
            {
              id: "ready_for_collection",
              label: isRtl ? "جاهز للتجميع" : "Ready for Collector",
            },
            {
              id: "out_for_delivery",
              label: isRtl ? "جاري التوصيل" : "Out for Delivery",
            },
            {
              id: "delivered",
              label: isRtl ? "تم التسليم" : "Delivered",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : isDarkMode
                    ? "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 📊 جدول الطلبات */}
        <div
          className={`rounded-3xl border shadow-xs overflow-x-auto ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        >
          <table className="w-full text-right text-xs">
            <thead>
              <tr
                className={`border-b font-black ${
                  isDarkMode
                    ? "border-slate-800 text-slate-400 bg-slate-950/40"
                    : "border-slate-200 text-slate-600 bg-slate-50"
                }`}
              >
                <th className="p-4">{isRtl ? "رقم الطلب" : "Order ID"}</th>
                <th className="p-4">
                  {isRtl ? "العميل والنطاق" : "Customer & Region"}
                </th>
                <th className="p-4">{isRtl ? "الإجمالي" : "Total"}</th>
                <th className="p-4">
                  {isRtl ? "المُجمّع / السائق" : "Collector / Driver"}
                </th>
                <th className="p-4">{isRtl ? "حالة الطلب" : "Status"}</th>
                <th className="p-4 text-center">
                  {isRtl ? "الإجراءات" : "Action"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {isRtl
                      ? "لا توجد طلبات في هذه المرحلة"
                      : "No orders in this stage"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4 font-black font-mono text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.id}</span>
                        {ord.shippingType === "express" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-500 inline-flex items-center gap-1">
                            <LightningIcon className="w-3 h-3 text-rose-500" />
                            <span>Express</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-black">{ord.customerName}</p>
                      <p className="text-[10px] opacity-60">{ord.city}</p>
                    </td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                      {ord.totalAmount} EGP
                    </td>
                    <td className="p-4 text-[11px] opacity-70">
                      <p>{ord.collectorName || "—"}</p>
                      {ord.driverName && (
                        <p className="text-[10px] text-purple-500 font-black">
                          {ord.driverName}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {ord.status === "pending" && (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/30 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{isRtl ? "جديد - يحتاج تجهيز" : "Pending"}</span>
                        </span>
                      )}
                      {ord.status === "processing" && (
                        <span className="px-2.5 py-1 bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                          <RefreshIcon className="w-3 h-3 animate-spin" />
                          <span>{isRtl ? "جاري التجهيز" : "Processing"}</span>
                        </span>
                      )}
                      {ord.status === "ready_for_collection" && (
                        <span className="px-2.5 py-1 bg-sky-500/10 text-sky-600 border border-sky-500/30 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                          <PackageIcon className="w-3 h-3" />
                          <span>{isRtl ? "جاهز للاستلام" : "Ready for Pickup"}</span>
                        </span>
                      )}
                      {ord.status === "collected_in_hub" && (
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                          <BuildingIcon className="w-3 h-3" />
                          <span>{isRtl ? "بالهب مجمع" : "In Hub"}</span>
                        </span>
                      )}
                      {ord.status === "out_for_delivery" && (
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/30 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                          <TruckIcon className="w-3 h-3" />
                          <span>{isRtl ? "في الطريق مع السائق" : "Out for Delivery"}</span>
                        </span>
                      )}
                      {ord.status === "delivered" && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-lg text-[10px] font-black inline-flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                          <span>{isRtl ? "تم التسليم" : "Delivered"}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      {ord.status === "pending" && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              ord.id,
                              "ready_for_collection",
                            )
                          }
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-[11px] cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <PackageIcon className="w-3.5 h-3.5" />
                          <span>{isRtl ? "تأكيد التجهيز للمُجمّع" : "Mark Ready"}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className={`px-2.5 py-1 font-bold rounded-lg text-[11px] cursor-pointer inline-flex items-center gap-1 ${
                          isDarkMode
                            ? "bg-slate-800 text-white hover:bg-slate-700"
                            : "bg-slate-200 text-black hover:bg-slate-300"
                        }`}
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        <span>{isRtl ? "تفاصيل" : "Details"}</span>
                      </button>
                      <button
                        onClick={() => setTrackingJourneyOrder(ord)}
                        className="px-2.5 py-1 font-bold rounded-lg text-[11px] cursor-pointer inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>{isRtl ? "خريطة المسار" : "Route Map"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 📄 مودال تفاصيل وبوليصة الطلب */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-lg w-full p-6 rounded-3xl border shadow-2xl space-y-4 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm flex items-center gap-2">
                <PackageIcon className="w-4 h-4 text-indigo-500" />
                <span>
                  {isRtl
                    ? `تفاصيل وبوليصة الطلب #${selectedOrder.id}`
                    : `Order AWB #${selectedOrder.id}`}
                </span>
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl space-y-1">
                <p className="font-black text-indigo-600 dark:text-indigo-400">
                  {selectedOrder.customerName} ({selectedOrder.phone})
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {selectedOrder.city}
                </p>
              </div>

              <div>
                <p className="font-black mb-2">
                  {isRtl ? "محتويات الطرد:" : "Package Items:"}
                </p>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="py-2 flex justify-between">
                      <span>
                        {item.productTitle} × {item.qty}
                      </span>
                      <span className="font-black">
                        {item.unitPrice * item.qty} EGP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-black">
                <span>{isRtl ? "الإجمالي الكلي:" : "Total Amount:"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedOrder.totalAmount} EGP
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className={`px-4 py-2 font-black rounded-xl cursor-pointer ${
                    isDarkMode
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-slate-200 text-black hover:bg-slate-300"
                  }`}
                >
                  {isRtl ? "طباعة البوليصة (AWB)" : "Print Shipping Label"}
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer shadow-xs"
                >
                  {isRtl ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🗺️ مودال تتبع مسار الشحنة على الخريطة للتاجر */}
      {trackingJourneyOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-2xl w-full p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <MapIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-indigo-500">
                    {isRtl
                      ? `تتبع مسار شحنة المتجر #${trackingJourneyOrder.id}`
                      : `Store Shipment Tracker #${trackingJourneyOrder.id}`}
                  </h3>
                  <p className="text-[10px] opacity-60">
                    {isRtl
                      ? `من متجر 6 أكتوبر عبر مقر المُجمّع (Micro-Hub) إلى ${trackingJourneyOrder.city}`
                      : `From 6th of October store via Micro-Hub to ${trackingJourneyOrder.city}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrackingJourneyOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 font-black cursor-pointer transition"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <LeafletJourneyTracker
              order={trackingJourneyOrder}
              heightClass="h-64 sm:h-80"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] opacity-60 block">
                  {isRtl ? "بيانات العميل:" : "Customer Details:"}
                </span>
                <div className="font-black">
                  {trackingJourneyOrder.customerName} ({trackingJourneyOrder.phone})
                </div>
                <div className="text-[11px] opacity-80">
                  {trackingJourneyOrder.address}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] opacity-60 block">
                  {isRtl ? "حالة الشحنة والتوصيل:" : "Shipment Status:"}
                </span>
                <div className="font-black text-indigo-500">
                  {trackingJourneyOrder.shippingType === "express"
                    ? "شحن فوري سريع Express"
                    : "شحن مجمع عبر الهب (35 ج.م)"}
                </div>
                <div className="text-[11px] text-emerald-500 font-bold">
                  {isRtl
                    ? `إجمالي الفاتورة: ${trackingJourneyOrder.totalAmount} ج.م`
                    : `Total: ${trackingJourneyOrder.totalAmount} EGP`}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTrackingJourneyOrder(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-black cursor-pointer"
              >
                {isRtl ? "إغلاق الخريطة" : "Close Map"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
