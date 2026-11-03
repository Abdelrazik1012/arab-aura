import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlatformOrder } from "../context/PlatformContext";
import {
  StoreIcon,
  MapPinIcon,
  TruckIcon,
  BuildingIcon,
  ClockIcon,
  MapIcon,
} from "./Icons";

interface LeafletJourneyTrackerProps {
  order: PlatformOrder;
  heightClass?: string;
}

export const LeafletJourneyTracker: React.FC<LeafletJourneyTrackerProps> = ({
  order,
  heightClass = "h-64 sm:h-72",
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapType, setMapType] = useState<"google" | "google-satellite" | "osm">("google");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if ((mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // إحداثيات المتجر (6 أكتوبر)، الهب، والوجهة
    const originCoords: [number, number] = order.originCoords || [30.0074, 30.9733];
    const hubCoords: [number, number] = [29.9550, 30.9150];
    const destCoords: [number, number] =
      order.destCoords || [order.lat || 30.5593, order.lng || 31.0105];

    // تحديد موقع السائق الحي المتحرك
    const isExpress = order.shippingType === "express";
    let driverCoords: [number, number] = [
      (originCoords[0] + destCoords[0]) / 2 + 0.05,
      (originCoords[1] + destCoords[1]) / 2 + 0.02,
    ];

    if (order.status === "delivered") {
      driverCoords = destCoords;
    } else if (order.status === "collected_in_hub") {
      driverCoords = hubCoords;
    }

    const map = L.map(mapContainerRef.current, {
      center: driverCoords,
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // استخدام خرائط Google Maps التفاعلية المجانية بدون API Key
    const initialTileUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const tileLayer = L.tileLayer(initialTileUrl, {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a> contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // 1. علامة المتجر بـ 6 أكتوبر (Origin)
    const storeIcon = L.divIcon({
      className: "journey-store-icon",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:34px;height:34px;border-radius:12px;background:#4f46e5;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(0,0,0,0.4);border:2px solid white;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18v4H3V3zm2 4v14h14V7m-10 4h6m-6 4h6"/></svg>
          </div>
          <span style="background:rgba(15,23,42,0.9);color:white;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;border:1px solid rgba(99,102,241,0.4);">
            ${order.sellerName || "متجر 6 أكتوبر"}
          </span>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 20],
    });
    L.marker(originCoords, { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<strong>نقطة الانطلاق (6 أكتوبر)</strong><br/>${order.sellerName}`);

    // 2. علامة هب أكتوبر اللوجستي (للشحن العادي المجمع)
    if (!isExpress) {
      const hubIcon = L.divIcon({
        className: "journey-hub-icon",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:30px;height:30px;border-radius:10px;background:#6366f1;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 12px rgba(0,0,0,0.3);border:2px solid white;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <span style="background:rgba(15,23,42,0.85);color:white;font-size:8px;font-weight:800;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap;">
              مقر مُجمّع الحي (Micro-Hub)
            </span>
          </div>
        `,
        iconSize: [35, 45],
        iconAnchor: [17, 17],
      });
      L.marker(hubCoords, { icon: hubIcon })
        .addTo(map)
        .bindPopup(`<strong>مقر مُجمّع الحي (Micro-Hub - حي الأشجار)</strong><br/>نقطة التجميع الميدانية للطرود من محلات الحي`);
    }

    // 3. علامة السائق الحي المتحرك (Moving Van)
    const vanIcon = L.divIcon({
      className: "journey-van-icon",
      html: `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:38px;height:38px;border-radius:14px;background:#f59e0b;color:#0f172a;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px rgba(0,0,0,0.5);border:2px solid white;position:relative;z-index:10;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2"/></svg>
          </div>
          <span style="background:#f59e0b;color:#0f172a;font-size:9px;font-weight:900;padding:1px 6px;border-radius:10px;margin-top:2px;white-space:nowrap;box-shadow:0 4px 6px rgba(0,0,0,0.3);">
            الكابتن متحرك (48 كم/س)
          </span>
        </div>
      `,
      iconSize: [45, 55],
      iconAnchor: [22, 22],
    });
    L.marker(driverCoords, { icon: vanIcon })
      .addTo(map)
      .bindPopup(
        `<strong>${order.driverName || "الكابتن أحمد محمود"}</strong><br/>متحرك في مسار الرحلة لتسليم الشحنة`
      );

    // 4. علامة وجهة العميل (Destination)
    const destIcon = L.divIcon({
      className: "journey-dest-icon",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:34px;height:34px;border-radius:12px;background:#10b981;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(0,0,0,0.4);border:2px solid white;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </div>
          <span style="background:rgba(15,23,42,0.9);color:white;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;border:1px solid rgba(16,185,129,0.4);">
            ${order.city}
          </span>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 20],
    });
    L.marker(destCoords, { icon: destIcon })
      .addTo(map)
      .bindPopup(`<strong>وجهة العميل:</strong> ${order.customerName}<br/><strong>العنوان:</strong> ${order.address}`);

    // 5. رسم خط سير الرحلة المباشر (Route Polyline)
    const routePoints: [number, number][] = isExpress
      ? [originCoords, driverCoords, destCoords]
      : [originCoords, hubCoords, driverCoords, destCoords];

    L.polyline(routePoints, {
      color: "#6366f1",
      weight: 4,
      opacity: 0.85,
      dashArray: "8, 8",
    }).addTo(map);

    // ضبط الحدود لتظهر كل النقاط
    const bounds = L.latLngBounds([originCoords, destCoords, driverCoords]);
    map.fitBounds(bounds, { padding: [35, 35] });

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
      tileLayerRef.current = null;
    };
  }, [order]);

  // 🛰️ تحديث نوع الطبقة (Google Maps، قمر صناعي، أو OSM)
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

  // 🔄 معالجة التجاوب وتغيير الحجم
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

  const handleOpenGoogleMaps = () => {
    const origin = order.originCoords ? `${order.originCoords[0]},${order.originCoords[1]}` : "29.9737,30.9529";
    const dest = order.destCoords ? `${order.destCoords[0]},${order.destCoords[1]}` : (order.lat ? `${order.lat},${order.lng}` : "30.5593,31.0105");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className={`relative ${heightClass} w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner select-none`}>
      {/* حاوية Leaflet المتجاوبة */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
        style={{ width: "100%", height: "100%" }}
      />

      {/* شريط البيانات الحية وأزرار التبديل العائمة على الخريطة */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="p-2 rounded-xl bg-slate-900/90 text-white text-[10px] font-black border border-slate-800 shadow-md flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>الوصول المتوقع: خلال 24 دقيقة | متبقي 6.5 كم</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="flex bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 text-[10px] font-black text-white">
            <button
              onClick={() => setMapType("google")}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                mapType === "google" ? "bg-indigo-600 text-white" : "opacity-70 hover:opacity-100"
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapType("google-satellite")}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                mapType === "google-satellite" ? "bg-indigo-600 text-white" : "opacity-70 hover:opacity-100"
              }`}
            >
              قمر صناعي
            </button>
            <button
              onClick={() => setMapType("osm")}
              className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                mapType === "osm" ? "bg-indigo-600 text-white" : "opacity-70 hover:opacity-100"
              }`}
            >
              OSM
            </button>
          </div>

          <button
            onClick={handleOpenGoogleMaps}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black shadow-md transition cursor-pointer flex items-center gap-1"
            title="فتح مسار الرحلة في تطبيق خرائط جوجل المجانية"
          >
            <MapPinIcon className="w-3 h-3" />
            <span>Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeafletJourneyTracker;