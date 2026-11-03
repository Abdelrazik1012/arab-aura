import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { usePlatform } from "../context/PlatformContext";
import { useTheme } from "../context/ThemeContext";
import type { PlatformOrder } from "../context/PlatformContext";
import {
  MapIcon,
  DocumentTextIcon,
  TargetIcon,
  SparklesIcon,
  EyeIcon,
  PhoneIcon,
  CloseIcon,
  CheckCircleIcon,
  LightningIcon,
  PackageIcon,
  TruckIcon,
  BuildingIcon,
  CheckIcon,
} from "./Icons";

interface InteractivePlatformMapProps {
  role: "collector" | "driver" | "seller" | "admin";
  title?: string;
  subtitle?: string;
  heightClass?: string;
  onOrderClick?: (order: PlatformOrder) => void;
  showAiOptimalRoute?: boolean;
}

export const InteractivePlatformMap: React.FC<InteractivePlatformMapProps> = ({
  role,
  title,
  subtitle,
  heightClass = "h-[460px] md:h-[540px]",
  onOrderClick,
  showAiOptimalRoute = false,
}) => {
  const { orders, updateOrderStatus, acceptExpressDelivery } = usePlatform();

  // 🌙 حالة الوضع الداكن الموحدة
  const { isDarkMode: isDark } = useTheme();

  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<PlatformOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [mapType, setMapType] = useState<"google" | "google-satellite" | "osm">("google");
  const [actionFeedback, setActionFeedback] = useState<string>("");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // فلترة الطلبات المعروضة
  const visibleOrders = orders.filter((ord) => {
    const dist = ord.distanceKm ?? 4;
    const withinRadius = dist <= radiusKm;
    const matchGov =
      selectedGovernorate === "all" ||
      ord.governorate === selectedGovernorate ||
      ord.city.includes(selectedGovernorate);
    return withinRadius && matchGov;
  });

  const handleSelectOrder = (ord: PlatformOrder) => {
    setSelectedOrder(ord);
    if (onOrderClick) {
      onOrderClick(ord);
    }
  };

  const handleCollectorCollect = (ord: PlatformOrder) => {
    updateOrderStatus(
      ord.id,
      "collected_in_hub",
      "محمود حسن (مُجمّع المنطقة)",
      "تم استلام الشحنة من المتجر وإيداعها في مقر المُجمّع (حي الأشجار - Micro-Hub)",
    );
    setActionFeedback(`تم استلام الشحنة ${ord.id} ونقلها إلى مقر المُجمّع بنجاح!`);
    setTimeout(() => setActionFeedback(""), 4000);
  };

  const handleDriverAcceptExpress = (ord: PlatformOrder) => {
    acceptExpressDelivery(ord.id, "أحمد محمود (سائق الشحن الفوري)");
    setActionFeedback(`تم قبول الشحن الفوري للطلب ${ord.id} وبدأ التحرك للتسليم!`);
    setTimeout(() => setActionFeedback(""), 4000);
  };

  // 🗺️ تهيئة خريطة Leaflet لأول مرة مع تفادي أي تصادم أو إعادة تهيئة
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // تنظيف أي معرّف سابق على نفس عنصر الـ DOM
    if ((mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // مركز مصر: بين 6 أكتوبر والمنوفية والقاهرة
    const map = L.map(mapContainerRef.current, {
      center: [30.25, 31.00],
      zoom: 9,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // استخدام خرائط Google Maps التفاعلية المجانية بدون أي API Key أو علامات مائية
    const initialTileUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const tileLayer = L.tileLayer(initialTileUrl, {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a> contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    // تكرار ضبط الحجم في أوقات متتابعة لمنع أي وميض أو اختفاء
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      layerGroupRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // 🛰️ تحديث نوع الخريطة (Google Maps شوارع، Google Satellite أقمار صناعية، أو OpenStreetMap - كلها مجانية 100%)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    let attr = '&copy; <a href="https://maps.google.com" target="_blank">Google Maps</a>';
    let maxZ = 20;

    if (mapType === "google-satellite") {
      url = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
      attr = '&copy; Google Maps Satellite & Imagery';
      maxZ = 20;
    } else if (mapType === "osm") {
      url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      attr = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
      maxZ = 19;
    }

    tileLayerRef.current = L.tileLayer(url, {
      maxZoom: maxZ,
      attribution: attr,
    }).addTo(map);
  }, [mapType]);

  // 🔄 معالجة الحجم والتجاوب الفوري (ResizeObserver) لمنع اختفاء الخريطة نهائياً
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 🔄 إعادة ضبط أبعاد الخريطة عند التبديل بين الخريطة والقائمة
  useEffect(() => {
    if (activeTab === "map" && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 📍 رسم العلامات والنطاق والمسار اللوجستي عند تغير البيانات أو الفلتر
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. دائرة النطاق الجغرافي حول مقر مُجمّع حي الأشجار (Micro-Hub 6 أكتوبر)
    const hubCoords: [number, number] = [29.9550, 30.9150];
    L.circle(hubCoords, {
      radius: radiusKm * 1000,
      color: "#6366f1",
      weight: 2,
      fillColor: "#6366f1",
      fillOpacity: 0.08,
      dashArray: "6, 6",
    }).addTo(layerGroup);

    // 2. علامة مقر المُجمّع المعتمد (Micro-Hub - حي الأشجار)
    const hubHtml = `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(99,102,241,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="width:36px;height:36px;border-radius:12px;background:#4f46e5;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(0,0,0,0.5);border:2px solid #ffffff;position:relative;z-index:10;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        </div>
        <span style="background:rgba(15,23,42,0.92);color:white;font-size:10px;font-weight:900;padding:2px 8px;border-radius:6px;margin-top:4px;white-space:nowrap;border:1px solid rgba(99,102,241,0.5);box-shadow:0 4px 6px rgba(0,0,0,0.3);">
          مقر المُجمّع: محمود حسن (حي الأشجار)
        </span>
      </div>
    `;

    const hubIcon = L.divIcon({
      className: "hub-marker-custom",
      html: hubHtml,
      iconSize: [40, 60],
      iconAnchor: [20, 20],
    });

    L.marker(hubCoords, { icon: hubIcon })
      .addTo(layerGroup)
      .bindPopup(
        `<div style="direction:rtl;text-align:right;font-family:sans-serif;padding:2px;">
          <h4 style="margin:0 0 4px;font-weight:900;color:#4f46e5;">مقر المُجمّع: محمود حسن (Micro-Hub)</h4>
          <p style="margin:0;font-size:11px;opacity:0.8;">نقطة تجميع حي الأشجار - 6 أكتوبر. يستلم الطرود من محلات الحي ليتم شحنها مجمعة مع الكابتن للوجهة المحددة.</p>
        </div>`
      );

    // علامة ثانوية لمُجمّع الحي المتميز
    const secondCollectorCoords: [number, number] = [29.9800, 30.9350];
    const secondCollectorHtml = `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="width:32px;height:32px;border-radius:10px;background:#0d9488;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 12px rgba(0,0,0,0.4);border:2px solid #ffffff;position:relative;z-index:10;">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        </div>
        <span style="background:rgba(15,23,42,0.92);color:white;font-size:9px;font-weight:900;padding:2px 6px;border-radius:6px;margin-top:4px;white-space:nowrap;border:1px solid rgba(13,148,136,0.5);">
          مُجمّع: طارق زيدان (الحي المتميز)
        </span>
      </div>
    `;
    const secondCollectorIcon = L.divIcon({
      className: "second-collector-custom",
      html: secondCollectorHtml,
      iconSize: [36, 54],
      iconAnchor: [18, 18],
    });
    L.marker(secondCollectorCoords, { icon: secondCollectorIcon })
      .addTo(layerGroup)
      .bindPopup(
        `<div style="direction:rtl;text-align:right;font-family:sans-serif;padding:2px;">
          <h4 style="margin:0 0 4px;font-weight:900;color:#0d9488;">مقر المُجمّع: طارق زيدان (Micro-Hub)</h4>
          <p style="margin:0;font-size:11px;opacity:0.8;">نقطة تجميع الحي المتميز - 6 أكتوبر.</p>
        </div>`
      );

    // 3. علامات الطلبات الميدانية
    visibleOrders.forEach((ord) => {
      const lat = ord.lat || (ord.governorate === "الجيزة" ? 30.0131 : 30.5593);
      const lng = ord.lng || (ord.governorate === "الجيزة" ? 31.2089 : 31.0105);
      const isExpress = ord.shippingType === "express";
      const isSelected = selectedOrder?.id === ord.id;

      const orderIconSvg = isExpress
        ? `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
        : `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;

      const orderHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:${isSelected ? "scale(1.15)" : "scale(1)"};transition:transform 0.2s;">
          <div style="padding:4px 8px;border-radius:12px;background:${isExpress ? "#e11d48" : "#4f46e5"};color:white;font-size:11px;font-weight:900;box-shadow:0 8px 16px rgba(0,0,0,0.4);border:2px solid ${isSelected ? "#fbbf24" : "#ffffff"};display:flex;align-items:center;gap:4px;white-space:nowrap;">
            ${orderIconSvg}
            <span>${ord.id}</span>
            <span style="opacity:0.85;font-size:10px;">(${ord.totalAmount} ج.م)</span>
          </div>
          <span style="background:rgba(15,23,42,0.88);color:#f8fafc;font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;border:1px solid rgba(255,255,255,0.2);">
            ${ord.city}
          </span>
        </div>
      `;

      const orderIcon = L.divIcon({
        className: "order-marker-custom",
        html: orderHtml,
        iconSize: [110, 48],
        iconAnchor: [55, 24],
      });

      const marker = L.marker([lat, lng], { icon: orderIcon }).addTo(layerGroup);

      marker.on("click", () => {
        handleSelectOrder(ord);
      });

      marker.bindPopup(`
        <div style="direction:rtl;text-align:right;font-family:sans-serif;padding:2px;min-width:180px;">
          <h4 style="margin:0 0 4px;font-weight:900;color:${isExpress ? "#e11d48" : "#4f46e5"};">
            ${isExpress ? "شحن فوري Express" : "شحن مجمع عادي"} - ${ord.id}
          </h4>
          <p style="margin:2px 0;font-size:11px;"><strong>المتجر:</strong> ${ord.sellerName}</p>
          <p style="margin:2px 0;font-size:11px;"><strong>العميل:</strong> ${ord.customerName}</p>
          <p style="margin:2px 0;font-size:11px;"><strong>الوجهة:</strong> ${ord.city}</p>
          <p style="margin:2px 0;font-size:12px;color:#059669;font-weight:bold;"><strong>المبلغ:</strong> ${ord.totalAmount} ج.م (${ord.paymentStatus === "paid" ? "مدفوع إلكترونياً" : "دفع كاش COD"})</p>
        </div>
      `);
    });

    // 4. مسار الذكاء الاصطناعي الأمثل (AI Optimal Route)
    if (showAiOptimalRoute || role === "driver") {
      const routePoints: [number, number][] = [
        [29.9550, 30.9150], // مقر المُجمّع (حي الأشجار)
        [30.0074, 30.9733], // Mall of Arabia Store
        [30.2975, 30.9780], // Ashmoun
        [30.4300, 31.0400], // Al-Bagour
        [30.5593, 31.0105], // Shebin El-Kom
      ];

      L.polyline(routePoints, {
        color: "#6366f1",
        weight: 4,
        opacity: 0.9,
        dashArray: "8, 8",
      }).addTo(layerGroup);

      // الكابتن متحرك على المسار
      const vanHtml = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="position:absolute;width:38px;height:38px;border-radius:50%;background:rgba(245,158,11,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:34px;height:34px;border-radius:12px;background:#f59e0b;color:#0f172a;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(0,0,0,0.4);border:2px solid white;position:relative;z-index:10;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2"/></svg>
          </div>
          <span style="background:#f59e0b;color:#0f172a;font-size:9px;font-weight:900;padding:1px 6px;border-radius:10px;margin-top:2px;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.3);">
            الكابتن متحرك (48 كم/س)
          </span>
        </div>
      `;

      const vanIcon = L.divIcon({
        className: "van-marker-custom",
        html: vanHtml,
        iconSize: [40, 50],
        iconAnchor: [20, 20],
      });

      L.marker([30.3600, 31.0100], { icon: vanIcon })
        .addTo(layerGroup)
        .bindPopup(
          `<strong>الكابتن أحمد محمود</strong><br/>في الطريق بين 6 أكتوبر والمنوفية (سرعة 48 كم/س)`
        );
    }
  }, [visibleOrders, radiusKm, selectedOrder, showAiOptimalRoute, role]);

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([30.25, 31.00], 9);
      mapInstanceRef.current.invalidateSize();
    }
  };

  const handleOpenGoogleMaps = () => {
    // فتح مسار الانطلاق من مقر المُجمّع بـ 6 أكتوبر في خرائط جوجل مباشرة بدون أي تكلفة أو API Key
    const url = `https://www.google.com/maps/dir/?api=1&origin=29.9550,30.9150&destination=30.5593,31.0105&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div
      className={`rounded-2xl border shadow-xs overflow-hidden transition-all ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300 text-black"
      }`}
    >
      {/* 🔹 شريط التحكم والفلترة العلوي */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-black">
              {title || "خريطة النطاق الجغرافي والعمليات الميدانية"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {visibleOrders.length} طلبات بالنطاق
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-500 font-mono">
              Google Maps & OSM 100% Free
            </span>
          </div>
          <p className="text-[11px] font-bold opacity-60 mt-0.5">
            {subtitle ||
              "مركز العمليات: 6 أكتوبر - استكشف الشحنات، اضبط نطاق التغطية، وتتبع المسارات بالذكاء الاصطناعي"}
          </p>
        </div>

        {/* أدوات التحكم بالراديوس والوجهة والطبقات */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* اختيار طبقة الخريطة (Google Maps، قمر صناعي، أو OSM) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black">
            <button
              onClick={() => setMapType("google")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1.5 ${
                mapType === "google"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapType("google-satellite")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1.5 ${
                mapType === "google-satellite"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <span>قمر صناعي</span>
            </button>
            <button
              onClick={() => setMapType("osm")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1.5 ${
                mapType === "osm"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <span>OSM</span>
            </button>
          </div>

          {/* نطاق التغطية: 5، 10، 15، 25 كم */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black">
            <span className="px-2 text-[10px] opacity-60 hidden sm:inline">النطاق:</span>
            {[5, 10, 15, 25].map((km) => (
              <button
                key={km}
                onClick={() => setRadiusKm(km)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                  radiusKm === km
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {km} كم
              </button>
            ))}
          </div>

          {/* اختيار المحافظة */}
          <select
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            className="p-1.5 px-3 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 outline-none cursor-pointer"
          >
            <option value="all">كل المحافظات</option>
            <option value="المنوفية">المنوفية (شبين الكوم & الباجور)</option>
            <option value="الجيزة">الجيزة و6 أكتوبر</option>
            <option value="القاهرة">القاهرة الكبرى</option>
            <option value="الغربية">الغربية (طنطا)</option>
          </select>

          {/* أزرار التمركز وخرائط جوجل */}
          <button
            onClick={handleResetCenter}
            className="p-1.5 px-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
            title="إعادة تركيز الخريطة على المركز"
          >
            <TargetIcon className="w-3.5 h-3.5" />
            <span>تمركز</span>
          </button>

          <button
            onClick={handleOpenGoogleMaps}
            className="p-1.5 px-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
            title="فتح مسار الرحلة في خرائط جوجل المجانية"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Maps</span>
          </button>

          {/* تبديل العرض بين خريطة وقائمة */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black">
            <button
              onClick={() => setActiveTab("map")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "map"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>خريطة</span>
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "list"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <DocumentTextIcon className="w-3.5 h-3.5" />
              <span>قائمة ({visibleOrders.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* رسالة نجاح الإجراء الميداني */}
      {actionFeedback && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-2.5 text-center text-xs font-black animate-fade-in flex items-center justify-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* جسم الخريطة التفاعلية الحقيقية (Leaflet + OpenStreetMap) */}
      <div
        className={`${
          activeTab === "map" ? "block" : "hidden"
        } relative ${heightClass} w-full overflow-hidden select-none`}
      >
        {/* حاوية Leaflet المتجاوبة بنسبة 100% */}
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0"
          style={{ width: "100%", height: "100%" }}
        />

        {/* بطاقة معلومات تفاعلية عائمة على الخريطة */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 text-white text-[10px] font-black border border-slate-800 shadow-lg pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {mapType === "google"
                ? "خريطة شوارع حية (Google Maps تفاعلية مجانية 100%)"
                : mapType === "google-satellite"
                ? "أقمار صناعية وتضاريس (Google Satellite تفاعلية 100%)"
                : "خريطة مجتمعية حرة (OpenStreetMap 100%)"}
            </span>
          </div>
        </div>
      </div>

      {/* جدول القائمة البديل للطلبات بالنطاق */}
      <div
        className={`${
          activeTab === "list" ? "block" : "hidden"
        } overflow-x-auto ${heightClass}`}
      >
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">رقم الطلب والنوع</th>
              <th className="p-3">المتجر والمرسل</th>
              <th className="p-3">العميل والوجهة</th>
              <th className="p-3">القيمة الإجمالية</th>
              <th className="p-3">الحالة الحالية</th>
              <th className="p-3">معاينة وإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {visibleOrders.map((ord) => (
              <tr
                key={ord.id}
                className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition"
              >
                <td className="p-2.5">
                  <span className="font-mono font-black text-amber-500 block">
                    {ord.id}
                  </span>
                  {ord.shippingType === "express" ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-500 font-black text-[10px] inline-flex items-center gap-1">
                      <LightningIcon className="w-3 h-3 text-rose-500" />
                      <span>فوري Express</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-500 font-black text-[10px] inline-flex items-center gap-1">
                      <PackageIcon className="w-3 h-3 text-indigo-400" />
                      <span>عادي مجمع</span>
                    </span>
                  )}
                </td>
                <td className="p-2.5">
                  <div>{ord.sellerName}</div>
                  <div className="text-[10px] opacity-60">{ord.sellerAddress}</div>
                </td>
                <td className="p-2.5">
                  <div>{ord.customerName}</div>
                  <div className="text-[10px] opacity-60">{ord.city}</div>
                </td>
                <td className="p-2.5 font-black">{ord.totalAmount} ج.م</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-200 dark:bg-slate-800">
                    {ord.status}
                  </span>
                </td>
                <td className="p-2.5">
                  <button
                    onClick={() => handleSelectOrder(ord)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black cursor-pointer"
                  >
                    معاينة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مودال معاينة تفاصيل الطلب على الخريطة */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedOrder.shippingType === "express" ? "bg-rose-500/20 text-rose-500" : "bg-indigo-500/20 text-indigo-400"}`}>
                  {selectedOrder.shippingType === "express" ? (
                    <LightningIcon className="w-4 h-4" />
                  ) : (
                    <PackageIcon className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm text-indigo-500">{selectedOrder.id}</h3>
                  <p className="text-[10px] opacity-60">
                    {selectedOrder.shippingType === "express"
                      ? "شحن فوري مباشر (توصيل فوري خلال ساعتين)"
                      : "شحن عادي عبر التجميع بالهب الإقليمي"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-black">
              {/* بيانات المتجر والمرسل */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 space-y-1">
                <p className="opacity-50 text-[10px]">المتجر ونقطة الاستلام (6 أكتوبر):</p>
                <p className="text-indigo-600 dark:text-indigo-400">{selectedOrder.sellerName}</p>
                <p className="text-[11px] opacity-75">{selectedOrder.sellerAddress}</p>
              </div>

              {/* بيانات العميل والوجهة */}
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-1">
                <p className="opacity-60 text-[10px] text-indigo-800 dark:text-indigo-300">
                  وجهة العميل والتسليم النهائي:
                </p>
                <p className="text-indigo-950 dark:text-indigo-200">{selectedOrder.customerName}</p>
                <p className="text-[11px] opacity-80">{selectedOrder.address}</p>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pt-1">
                  <PhoneIcon className="w-3.5 h-3.5" />
                  <span>{selectedOrder.phone} | كود التحقق OTP:</span>
                  <span className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-indigo-300">
                    {selectedOrder.otpCode || "4821"}
                  </span>
                </p>
              </div>

              {/* القيمة والدفع */}
              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span>إجمالي الطلب مع الشحن:</span>
                <span className="text-emerald-500 font-black text-sm">
                  {selectedOrder.totalAmount} ج.م ({selectedOrder.paymentStatus === "paid" ? "مدفوع إلكترونياً" : "دفع كاش COD"})
                </span>
              </div>
            </div>

            {/* الأزرار التفاعلية بناءً على نوع المستخدم */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-black text-xs cursor-pointer transition"
              >
                إغلاق
              </button>

              {role === "collector" && (
                <button
                  disabled={selectedOrder.status === "collected_in_hub"}
                  onClick={() => {
                    handleCollectorCollect(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="flex-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white rounded-xl font-black text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  {selectedOrder.status === "collected_in_hub" ? (
                    <>
                      <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                      <span>تم نقله لمقر المُجمّع</span>
                    </>
                  ) : (
                    <>
                      <TruckIcon className="w-3.5 h-3.5 text-white" />
                      <span>استلام وإيداع لدى مُجمّع الحي</span>
                    </>
                  )}
                </button>
              )}

              {role === "driver" && selectedOrder.shippingType === "express" && (
                <button
                  disabled={selectedOrder.status === "out_for_delivery"}
                  onClick={() => {
                    handleDriverAcceptExpress(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="flex-2 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-emerald-600 text-white rounded-xl font-black text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <LightningIcon className="w-3.5 h-3.5" />
                  <span>
                    {selectedOrder.status === "out_for_delivery"
                      ? "جاري التوصيل الآن"
                      : "قبول الشحن الفوري والتحرك"}
                  </span>
                </button>
              )}

              {role === "admin" && (
                <a
                  href={`/admin/orders?search=${selectedOrder.id}`}
                  className="flex-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  <span>إدارة وفحص تفاصيل الطلب</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractivePlatformMap;