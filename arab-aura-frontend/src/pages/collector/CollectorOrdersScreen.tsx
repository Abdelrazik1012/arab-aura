import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { usePlatform } from "../../context/PlatformContext";
import { useTheme } from "../../context/ThemeContext";
import { MapPinIcon, CloseIcon, CheckIcon, TruckIcon } from "../../components/Icons";

interface OrderItem {
  id: string;
  storeName: string;
  sellerAddress: string;
  destinationZone: string;
  customerCity: string;
  distanceKm: number;
  shippingType: "Standard" | "Express";
  deliveryPreference: string;
  itemsCount: number;
  status: "Available" | "Collecting" | "Collected";
  paymentMethod: "Cash" | "Online" | "Wallet";
  totalPrice: number;
  trackingCode?: string;
  collectorNotes?: string;
}

export const CollectorOrdersScreen: React.FC = () => {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { orders: platformOrders, updateOrderStatus } = usePlatform();
  const { isDarkMode: isDark } = useTheme();

  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedShippingType, setSelectedShippingType] =
    useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalOrder, setActiveModalOrder] = useState<OrderItem | null>(
    null,
  );

  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "#ORD-8812",
      storeName: "أورا ستريت وير (ملابس وتجهيزات)",
      sellerAddress: "المنطقة الصناعية - زون A4، 6 أكتوبر",
      destinationZone: "المنوفية",
      customerCity: "شبين الكوم (حي مبروك)",
      distanceKm: 2.4,
      shippingType: "Standard",
      deliveryPreference: "اليوم (6:00 - 8:00 مساءً)",
      itemsCount: 3,
      status: "Available",
      paymentMethod: "Online",
      totalPrice: 1250,
      trackingCode: "TRK-MONUF-8812",
      collectorNotes: "قابل للكسر - شحنة مغلفة بفقاعات حماية",
    },
    {
      id: "#ORD-8815",
      storeName: "متاجر النيل للتجارة العامة",
      sellerAddress: "الحي المتميز، مول الماجد، 6 أكتوبر",
      destinationZone: "الغربية",
      customerCity: "طنطا (شارع البحر الرئيسي)",
      distanceKm: 4.8,
      shippingType: "Standard",
      deliveryPreference: "في أقرب وقت (غداً صباحاً)",
      itemsCount: 1,
      status: "Available",
      paymentMethod: "Cash",
      totalPrice: 420,
      trackingCode: "TRK-GHARB-8815",
      collectorNotes: "تحصيل كاش عند التسليم",
    },
    {
      id: "#ORD-8820",
      storeName: "كايرو فاشون هاب",
      sellerAddress: "المحور المركزي، عمارة 42، 6 أكتوبر",
      destinationZone: "الشرقية",
      customerCity: "منيا القمح (المركز)",
      distanceKm: 7.2,
      shippingType: "Standard",
      deliveryPreference: "غداً (10:00 صباحاً)",
      itemsCount: 5,
      status: "Available",
      paymentMethod: "Wallet",
      totalPrice: 2890,
      trackingCode: "TRK-SHARK-8820",
      collectorNotes: "طلب حجم كبير - يحتاج كرتونة تقفيل C3",
    },
    {
      id: "#ORD-8825",
      storeName: "الزهراء للإلكترونيات والدش",
      sellerAddress: "الحي الحادي عشر، سوق الجملة، 6 أكتوبر",
      destinationZone: "القاهرة",
      customerCity: "مدينة نصر (شارع التسعين الشمالي)",
      distanceKm: 6.1,
      shippingType: "Standard",
      deliveryPreference: "اليوم (8:00 مساءً)",
      itemsCount: 2,
      status: "Available",
      paymentMethod: "Online",
      totalPrice: 4500,
      trackingCode: "TRK-CAIRO-8825",
      collectorNotes: "أجهزة حساسه - تجنب الضغط العالي",
    },
    {
      id: "#ORD-8830",
      storeName: "مكتبات السندس التعليمية",
      sellerAddress: "الحي السابع، بجوار مسجد الحصري، 6 أكتوبر",
      destinationZone: "الجيزة",
      customerCity: "الدقي (شارع مصدق)",
      distanceKm: 3.5,
      shippingType: "Standard",
      deliveryPreference: "اليوم (مسائي)",
      itemsCount: 4,
      status: "Available",
      paymentMethod: "Cash",
      totalPrice: 310,
      trackingCode: "TRK-GIZA-8830",
      collectorNotes: "مطبوعات وكتب دراسية",
    },
    {
      id: "#ORD-8834",
      storeName: "بيوتي كير لمستحضرات التجميل",
      sellerAddress: "غرب الصومعة، المجاورة الثانية، 6 أكتوبر",
      destinationZone: "المنوفية",
      customerCity: "أشمون (بجوار المحطة)",
      distanceKm: 3.1,
      shippingType: "Standard",
      deliveryPreference: "خلال 48 ساعة",
      itemsCount: 6,
      status: "Available",
      paymentMethod: "Online",
      totalPrice: 1980,
      trackingCode: "TRK-MONUF-8834",
      collectorNotes: "منتجات عناية زجاجية",
    },
    {
      id: "#ORD-8840",
      storeName: "تكنو هاوس للأجهزة المنزلية",
      sellerAddress: "المنطقة الصناعية الثالثة، 6 أكتوبر",
      destinationZone: "الإسكندرية",
      customerCity: "سموحة (شارع فوزي معاذ)",
      distanceKm: 8.9,
      shippingType: "Standard",
      deliveryPreference: "توصيل محافظات أسبوعي",
      itemsCount: 2,
      status: "Available",
      paymentMethod: "Wallet",
      totalPrice: 6200,
      trackingCode: "TRK-ALEX-8840",
      collectorNotes: "شحنة ثقيلة تحتاج مناولة هادئة",
    },
    {
      id: "#ORD-EXPRESS-99",
      storeName: "سوبر ماركت الرويال الغذائي",
      sellerAddress: "الحي الثامن، عمارة الاستثمار، 6 أكتوبر",
      destinationZone: "الجيزة",
      customerCity: "6 أكتوبر (حى الأشجار)",
      distanceKm: 1.8,
      shippingType: "Express",
      deliveryPreference: "توصيل فوري (خلال 60 دقيقة)",
      itemsCount: 2,
      status: "Available",
      paymentMethod: "Online",
      totalPrice: 680,
      trackingCode: "EXP-GIZA-0099",
      collectorNotes: "شحنة سريعة - لا يتم إدراجها بالحزم",
    },
  ]);

  const handleStartCollection = (orderId: string) => {
    updateOrderStatus(
      orderId,
      "collected_in_hub",
      "محمود حسن (مُجمّع المنطقة)",
      "تم استلام الشحنة وإيداعها في مقر المُجمّع (حي الأشجار - Micro-Hub)",
    );
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status: "Collected" } : ord,
      ),
    );
  };

  const handleUpdateOrderDetails = () => {
    if (!activeModalOrder) return;
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === activeModalOrder.id ? activeModalOrder : ord,
      ),
    );
    setActiveModalOrder(null);
  };

  // دمج طلبات المنصة المركزية مع شحنات الكوليكتور
  const allCollectorOrders: OrderItem[] = [
    ...orders,
    ...platformOrders
      .filter((po) => !orders.some((o) => o.id === po.id))
      .map((po) => ({
        id: po.id,
        storeName: po.sellerName || "متجر 6 أكتوبر",
        sellerAddress: po.sellerAddress || "6 أكتوبر",
        destinationZone: po.governorate || "المنوفية",
        customerCity: po.city,
        distanceKm: po.distanceKm || 3.5,
        shippingType: (po.shippingType === "express" ? "Express" : "Standard") as any,
        deliveryPreference: po.shippingType === "express" ? "فوري (خلال 60 دقيقة)" : "مجدول",
        itemsCount: po.items.length,
        status: (po.status === "collected_in_hub"
          ? "Collected"
          : po.status === "ready_for_collection"
            ? "Available"
            : "Collecting") as any,
        paymentMethod: (po.paymentMethod === "cod" ? "Cash" : "Online") as any,
        totalPrice: po.totalAmount,
        trackingCode: `TRK-${po.id}`,
        collectorNotes: po.shippingType === "express" ? "⚡ طلب Express مستعجل" : "تجميع عادي بالهب",
      })),
  ];

  const filteredOrders = allCollectorOrders.filter((ord) => {
    const matchesZone =
      selectedZone === "all" || ord.destinationZone === selectedZone;
    const matchesType =
      selectedShippingType === "all" ||
      ord.shippingType === selectedShippingType;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerCity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 🔹 هيدر البحث والفلاتر */}
      <div
        className={`p-6 rounded-2xl border shadow-xs space-y-4 transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black">
              الطلبات المتاحة للتجميع والنقل للهَب
            </h1>
            <p
              className={`text-xs font-bold mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}
            >
              اضغط على أي صف بالجدول لاستعراض وتعديل كود التتبع الداخلي
              والملاحظات التشغيلية
            </p>
          </div>
          <input
            type="text"
            placeholder="بحث برقم الطلب، المتجر، أو المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black border outline-none w-full md:w-80 ${
              isDark
                ? "bg-slate-950 border-slate-700 text-white"
                : "bg-slate-50 border-slate-300 text-black"
            }`}
          />
        </div>

        <div
          className={`flex flex-wrap items-center justify-between gap-4 pt-3 border-t ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-black">تصفية المحافظة:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className={`p-2 rounded-xl text-xs font-black border outline-none cursor-pointer ${
                isDark
                  ? "bg-slate-950 border-slate-700 text-white"
                  : "bg-white border-slate-300 text-black"
              }`}
            >
              <option value="all">جميع المحافظات المتاحة</option>
              <option value="المنوفية">المنوفية (شبين الكوم / أشمون)</option>
              <option value="الغربية">الغربية (طنطا)</option>
              <option value="الشرقية">الشرقية (منيا القمح)</option>
              <option value="القاهرة">القاهرة (مدينة نصر)</option>
              <option value="الجيزة">الجيزة (الدقي / 6 أكتوبر)</option>
              <option value="الإسكندرية">الإسكندرية (سموحة)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black">نوع الشحن:</span>
            {["all", "Standard", "Express"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedShippingType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer border transition ${
                  selectedShippingType === type
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : isDark
                      ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                      : "bg-slate-100 text-black border-slate-300 hover:bg-slate-200"
                }`}
              >
                {type === "all"
                  ? "الكل"
                  : type === "Standard"
                    ? "قياسي (Standard)"
                    : "سريع (Express)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📋 جدول الطلبات الشامل */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black"
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-black">
            عدد الطلبات المتاحة حالياً: {filteredOrders.length} طلب
          </span>
          <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5" />
            <span>نقطة تجميع الحي: Micro-Hub (حي الأشجار - 6 أكتوبر)</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr
                className={`border-b text-xs font-black ${isDark ? "border-slate-800 text-white/50" : "border-slate-200 text-black/50"}`}
              >
                <th className="p-4 text-start">رقم الطلب والسعر</th>
                <th className="p-4 text-start">المتجر / العنوان</th>
                <th className="p-4 text-start">الوجهة والموعد</th>
                <th className="p-4 text-start">كود التتبع الداخلي</th>
                <th className="p-4 text-start">القطع الشحن</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs font-black ${isDark ? "divide-slate-800" : "divide-slate-200"}`}
            >
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  onClick={() => setActiveModalOrder(ord)}
                  className="hover:bg-indigo-50/10 dark:hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <td className="p-4 text-start">
                    <p className="text-indigo-600 dark:text-indigo-400 font-black">
                      {ord.id}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      {ord.totalPrice} ج.م ({ord.paymentMethod})
                    </p>
                  </td>
                  <td className="p-4 text-start">
                    <p className="font-black">{ord.storeName}</p>
                    <p
                      className={`text-[10px] ${isDark ? "text-white/50" : "text-black/50"}`}
                    >
                      {ord.sellerAddress}
                    </p>
                  </td>
                  <td className="p-4 text-start">
                    <p className="text-emerald-600 dark:text-emerald-400 font-black">
                      {ord.customerCity}
                    </p>
                    <p
                      className={`text-[10px] ${isDark ? "text-white/50" : "text-black/50"}`}
                    >
                      {ord.deliveryPreference}
                    </p>
                  </td>
                  <td className="p-4 text-start font-mono font-bold text-indigo-500">
                    {ord.trackingCode || "غير محدد"}
                  </td>
                  <td className="p-4 text-start">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        ord.shippingType === "Express"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {ord.shippingType === "Express"
                        ? "مباشر ⚡"
                        : `${ord.itemsCount} قطع`}
                    </span>
                  </td>
                  <td
                    className="p-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ord.shippingType === "Express" ? (
                      <span
                        className={`text-[11px] font-bold ${isDark ? "text-white/40" : "text-black/40"}`}
                      >
                        مباشر للسائق
                      </span>
                    ) : (
                      <button
                        disabled={ord.status === "Collecting"}
                        onClick={() => handleStartCollection(ord.id)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white rounded-xl text-[11px] font-black cursor-pointer shadow-xs transition flex items-center gap-1.5"
                      >
                        {ord.status === "Collecting" ? (
                          <>
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>تم الإيداع بمقر المُجمّع</span>
                          </>
                        ) : (
                          <>
                            <TruckIcon className="w-3.5 h-3.5" />
                            <span>استلام وإيداع بمقر المُجمّع</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 مودال عرض التفاصيل وتعديل الكود */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm">
                تفاصيل الطلب {activeModalOrder.id}
              </h3>
              <button
                onClick={() => setActiveModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-black">
              <div
                className={`p-3 rounded-xl ${isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-black"}`}
              >
                <p className="opacity-50">المتجر / البائع:</p>
                <p className="text-indigo-500 font-black">
                  {activeModalOrder.storeName}
                </p>
                <p className="text-[10px] opacity-70">
                  {activeModalOrder.sellerAddress}
                </p>
              </div>

              <div>
                <label className="block mb-1">
                  كود التتبع الداخلي للمُجمّع:
                </label>
                <input
                  type="text"
                  value={activeModalOrder.trackingCode || ""}
                  onChange={(e) =>
                    setActiveModalOrder({
                      ...activeModalOrder,
                      trackingCode: e.target.value,
                    })
                  }
                  className={`w-full p-2.5 rounded-xl border font-mono outline-none ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-black"
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1">
                  ملاحظات المُجمّع التشغيلية:
                </label>
                <textarea
                  value={activeModalOrder.collectorNotes || ""}
                  onChange={(e) =>
                    setActiveModalOrder({
                      ...activeModalOrder,
                      collectorNotes: e.target.value,
                    })
                  }
                  className={`w-full p-2.5 rounded-xl border outline-none h-20 ${
                    isDark
                      ? "bg-slate-950 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-black"
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setActiveModalOrder(null)}
                  className={`px-4 py-2 rounded-xl font-black cursor-pointer ${
                    isDark
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-slate-200 text-black hover:bg-slate-300"
                  }`}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpdateOrderDetails}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black cursor-pointer shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorOrdersScreen;
