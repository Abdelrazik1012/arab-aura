import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import type { PlatformOrder } from "../../context/PlatformContext";
import { LeafletJourneyTracker } from "../../components/LeafletJourneyTracker";
import BrandLogo from "../../components/BrandLogo";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  PhoneIcon,
  CheckCircleIcon,
  TruckIcon,
  MapIcon,
  CloseIcon,
  CheckIcon,
} from "../../components/Icons";

interface PackageItem {
  id: string;
  name: string;
  qty: number;
  sellerOffice: string;
}

interface DeliveryOrder {
  id: string;
  packageCode: string;
  manifestId: string;
  hubName: string;
  customerName: string;
  phone: string;
  address: string;
  zone: string;
  codAmount: number;
  paymentType: "COD" | "ONLINE";
  status: "assigned" | "out_for_delivery" | "delivered" | "failed";
  otpCode: string;
  packageItems: PackageItem[];
}

export const DriverOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { orders: platformOrders } = usePlatform();

  const { isDarkMode, toggleTheme } = useTheme();

  const [orders, setOrders] = useState<DeliveryOrder[]>([
    {
      id: "ORD-9821",
      packageCode: "PKG-OCT-9901",
      manifestId: "MNF-8021",
      hubName: "مقر المُجمّع: محمود حسن (حي الأشجار - Micro-Hub)",
      customerName: "أحمد محمود",
      phone: "01012345678",
      address: "الحي الثاني - شارع 15 - عمارة 4 - شقة 201",
      zone: "6 أكتوبر - زون A4",
      codAmount: 1340,
      paymentType: "COD",
      status: "out_for_delivery",
      otpCode: "4821",
      packageItems: [
        {
          id: "1",
          name: "تيشيرت بولو قطن 100%",
          qty: 2,
          sellerOffice: "مكتب النيل للمنسوجات",
        },
        {
          id: "2",
          name: "ساعة يد رقمية رياضية",
          qty: 1,
          sellerOffice: "مكتب أورورا",
        },
      ],
    },
    {
      id: "ORD-9820",
      packageCode: "PKG-OCT-9902",
      manifestId: "MNF-8021",
      hubName: "مقر المُجمّع: محمود حسن (حي الأشجار - Micro-Hub)",
      customerName: "سارة خالد",
      phone: "01198765432",
      address: "المحور المركزي - بجوار جامعة 6 أكتوبر",
      zone: "6 أكتوبر - زون B1",
      codAmount: 0,
      paymentType: "ONLINE",
      status: "assigned",
      otpCode: "9902",
      packageItems: [
        {
          id: "3",
          name: "ساعة يد رقمية رياضية",
          qty: 1,
          sellerOffice: "مكتب أورورا",
        },
      ],
    },
    {
      id: "ORD-9815",
      packageCode: "PKG-OCT-9880",
      manifestId: "MNF-8020",
      hubName: "مقر المُجمّع: محمود حسن (حي الأشجار - Micro-Hub)",
      customerName: "محمود حسن",
      phone: "01233445566",
      address: "المنطقة الصناعية - مصنع 12",
      zone: "6 أكتوبر - زون C3",
      codAmount: 750,
      paymentType: "COD",
      status: "delivered",
      otpCode: "1154",
      packageItems: [
        {
          id: "4",
          name: "حذاء رياضي مريح",
          qty: 1,
          sellerOffice: "مكتب الموضة",
        },
      ],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedJourneyOrder, setSelectedJourneyOrder] = useState<PlatformOrder | null>(null);

  const isRtl = lang === "ar";

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  // دمج طلبات المنصة مع شحنات السائق
  const allDriverOrders: DeliveryOrder[] = [
    ...orders,
    ...platformOrders
      .filter((po) => !orders.some((o) => o.id === po.id))
      .map((po) => ({
        id: po.id,
        packageCode: po.packageId || (po.shippingType === "express" ? "EXP-DIRECT" : "PKG-OCT-9901"),
        manifestId: "MNF-8021",
        hubName: po.hubName || "مقر المُجمّع: محمود حسن (حي الأشجار - Micro-Hub)",
        customerName: po.customerName,
        phone: po.phone,
        address: po.address,
        zone: po.city,
        codAmount: po.paymentMethod === "cod" ? po.totalAmount : 0,
        paymentType: (po.paymentMethod === "cod" ? "COD" : "ONLINE") as any,
        status: (po.status === "delivered" ? "delivered" : "out_for_delivery") as any,
        otpCode: po.otpCode || "4821",
        packageItems: po.items.map((it) => ({
          id: it.id,
          name: it.productTitle,
          qty: it.qty,
          sellerOffice: it.brandName || "متجر معتمد",
        })),
      })),
  ];

  const filteredOrders = allDriverOrders.filter((o) => {
    const matchesTab = activeTab === "all" || o.status === activeTab;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.packageCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const t = {
    title: isRtl
      ? "إدارة شحنات ومانفيست المسار"
      : "Deliveries & Manifest Management",
    dashboard: isRtl ? "الرئيسية" : "Dashboard",
    orders: isRtl ? "شحنات المسار" : "Deliveries",
    wallet: isRtl ? "محفظة الكاش" : "Cash Wallet",
    logout: isRtl ? "خروج" : "Logout",
    searchPlaceholder: isRtl
      ? "بحث برقم الطلب، اسم العميل، أو كود الباكيدج..."
      : "Search Order ID, Customer, or Package Code...",
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
              className="px-3 py-2 rounded-xl transition cursor-pointer bg-amber-500 text-black shadow-xs"
            >
              {t.orders}
            </button>
            <button
              onClick={() => navigate("/driver/wallet")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
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
          className="cursor-pointer text-amber-500"
        >
          {t.orders}
        </button>
        <button
          onClick={() => navigate("/driver/wallet")}
          className="cursor-pointer"
        >
          {t.wallet}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* هيدر وشريط البحث */}
        <div
          className={`p-6 rounded-2xl border shadow-xs space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
        >
          <div>
            <h1 className="text-lg font-black">{t.title}</h1>
            <p
              className={`text-xs mt-1 ${isDarkMode ? "text-white/50" : "text-slate-500"}`}
            >
              {isRtl
                ? "قائمة جميع الشحنات، تتبع حالة التسليم، وتأكيد استلام الطرود"
                : "List of all deliveries & packages"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 p-3 border rounded-xl text-xs font-black outline-none ${
                isDarkMode
                  ? "bg-slate-950 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-black"
              }`}
            />
          </div>
        </div>

        {/* جدول الشحنات */}
        <div
          className={`rounded-2xl border overflow-hidden shadow-xs ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs font-black">
              <thead
                className={`border-b ${isDarkMode ? "bg-slate-950/50 border-slate-800 text-white/70" : "bg-slate-50 border-slate-200 text-slate-600"}`}
              >
                <tr>
                  <th className="p-4">رقم الشحنة</th>
                  <th className="p-4">كود الطرد (Package)</th>
                  <th className="p-4">العميل والتليفون</th>
                  <th className="p-4">النطاق والعنوان</th>
                  <th className="p-4">المبلغ والنوع</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">خريطة ومسار GPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredOrders.map((o) => {
                  const platMatch = platformOrders.find((p) => p.id === o.id);
                  const displayOrder: PlatformOrder = platMatch || {
                    id: o.id,
                    customerName: o.customerName,
                    phone: o.phone,
                    city: o.zone,
                    address: o.address,
                    totalAmount: o.codAmount,
                    shippingFee: 35,
                    shippingType: o.packageCode.includes("EXP") ? "express" : "standard",
                    paymentMethod: o.paymentType === "COD" ? "cod" : "card",
                    paymentStatus: o.paymentType === "COD" ? "unpaid" : "paid",
                    status: o.status === "delivered" ? "delivered" : "out_for_delivery",
                    sellerName: "متجر 6 أكتوبر",
                    driverName: "أحمد محمود (سائق)",
                    otpCode: o.otpCode,
                    originCoords: [30.0074, 30.9733],
                    destCoords: [30.5593, 31.0105],
                    createdAt: new Date().toISOString(),
                    items: o.packageItems.map((pi) => ({
                      id: pi.id,
                      productTitle: pi.name,
                      qty: pi.qty,
                      unitPrice: o.codAmount || 500,
                    })),
                    timeline: [],
                  };

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="p-4 font-mono text-amber-500">{o.id}</td>
                      <td className="p-4 font-mono opacity-80">
                        {o.packageCode}
                      </td>
                      <td className="p-4">
                        <div>{o.customerName}</div>
                        <a
                          href={`tel:${o.phone}`}
                          className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                          <PhoneIcon className="w-3 h-3 inline" />
                          <span>{o.phone}</span>
                        </a>
                      </td>
                      <td className="p-4">
                        <div>{o.zone}</div>
                        <span className="text-[10px] opacity-60 block max-w-xs truncate">
                          {o.address}
                        </span>
                      </td>
                      <td className="p-4">
                        {o.paymentType === "COD" ? (
                          <span className="text-emerald-500 font-black">
                            {o.codAmount} EGP (كاش)
                          </span>
                        ) : (
                          <span className="text-indigo-400 font-bold inline-flex items-center gap-1">
                            <span>مدفوع أونلاين</span>
                            <CheckCircleIcon className="w-3 h-3 text-indigo-400" />
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                            o.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {o.status === "delivered" ? (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                              <span>تم التسليم</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <TruckIcon className="w-3 h-3 text-amber-500" />
                              <span>جاري التوصيل</span>
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedJourneyOrder(displayOrder)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <MapIcon className="w-3.5 h-3.5" />
                          <span>المسار والخريطة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🗺️ مودال خريطة ومسار رحلة الشحنة المباشرة للسائق */}
        {selectedJourneyOrder && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className={`max-w-2xl w-full p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
                isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300 text-black"
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <TruckIcon className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-indigo-500">
                      مسار رحلة الشحنة الميدانية ({selectedJourneyOrder.id})
                    </h3>
                    <p className="text-[10px] opacity-60">
                      تتبع مباشر لمسار القيادة بين 6 أكتوبر ووجهة العميل في {selectedJourneyOrder.city}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJourneyOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 font-black cursor-pointer transition"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* خريطة Leaflet المتجاوبة مع دعم خرائط جوجل المجانية والأقمار الصناعية */}
              <LeafletJourneyTracker
                order={selectedJourneyOrder}
                heightClass="h-64 sm:h-80"
              />

              {/* بطاقة تفاصيل العميل وإجراءات الاتصال والتسليم */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] opacity-60 block">بيانات العميل والتوصيل:</span>
                  <div className="font-black">{selectedJourneyOrder.customerName}</div>
                  <div className="text-[11px] opacity-80">{selectedJourneyOrder.address}</div>
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={`tel:${selectedJourneyOrder.phone}`}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black inline-flex items-center gap-1.5"
                    >
                      <PhoneIcon className="w-3 h-3" />
                      <span>اتصال: {selectedJourneyOrder.phone}</span>
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] opacity-60 block">التحصيل ورمز التأكيد:</span>
                  <div className="font-black text-emerald-500">
                    المبلغ: {selectedJourneyOrder.totalAmount} ج.م (
                    {selectedJourneyOrder.paymentMethod === "cod" ? "تحصيل كاش COD" : "مدفوع أونلاين"}
                    )
                  </div>
                  <div className="text-[11px]">
                    رمز التأكيد (OTP):{" "}
                    <span className="font-mono font-black text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10">
                      {selectedJourneyOrder.otpCode || "4821"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedJourneyOrder(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-black cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverOrdersPage;
