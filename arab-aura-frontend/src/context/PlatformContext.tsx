import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

export type OrderStatus =
  | "pending"
  | "processing"
  | "ready_for_collection"
  | "collected_in_hub"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type ShippingType = "standard" | "express";

export interface OrderItem {
  id: string;
  productId?: string;
  productTitle: string;
  qty: number;
  unitPrice: number;
  brandName?: string;
  size?: string;
  color?: string;
  imageUrl?: string;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  titleAr: string;
  titleEn: string;
  timestamp: string;
  actor?: string;
  note?: string;
}

export interface PlatformOrder {
  id: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  city: string;
  governorate?: string;
  address: string;
  totalAmount: number;
  shippingFee: number;
  shippingType: ShippingType;
  paymentMethod: "cod" | "wallet" | "vodafone_cash" | "card" | "instapay" | "fawry" | "paypal";
  paymentStatus: "paid" | "unpaid" | "pending_verification";
  status: OrderStatus;
  sellerId?: string;
  sellerName?: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerCommercialReg?: string;
  sellerTaxId?: string;
  collectorName?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  driverPlate?: string;
  driverRating?: string;
  hubName?: string;
  packageId?: string;
  otpCode?: string;
  distanceKm?: number;
  mapCoords?: { x: number; y: number }; // relative map offset [-150, 150]
  lat?: number;
  lng?: number;
  originCoords?: [number, number];
  destCoords?: [number, number];
  createdAt: string;
  items: OrderItem[];
  timeline: OrderTimelineStep[];
}

export interface PlatformPackage {
  id: string;
  title: string;
  originHub: string;
  destinationZone: string;
  destinationCity: string;
  orderIds: string[];
  totalWeightKg: number;
  ordersCount: number;
  assignedDriver?: string;
  status: "ready_at_hub" | "in_transit" | "delivered";
  savingsRatio?: string;
  createdAt: string;
}

export interface PlatformProduct {
  id: string;
  title: string;
  titleEn?: string;
  price: number;
  originalPrice?: number;
  brandId: string;
  brandName: string;
  category: string;
  imageUrl: string;
  description: string;
  descriptionEn?: string;
  stock: number;
  isScraped?: boolean;
  scrapedSource?: "instagram" | "facebook" | "tiktok";
  scrapedPostUrl?: string;
}

interface PlatformContextType {
  orders: PlatformOrder[];
  packages: PlatformPackage[];
  products: PlatformProduct[];
  placeOrder: (orderInput: {
    items: any[];
    shippingType?: ShippingType;
    shippingAddress: {
      governorate?: string;
      center?: string;
      villageOrDistrict?: string;
      street?: string;
      buildingNumber?: string;
      phone: string;
      fullName?: string;
      city?: string;
      address?: string;
    };
    payment: {
      method: string;
      totalAmount: number;
      receiptImage?: string | null;
      transactionRef?: string;
      senderWallet?: string;
    };
  }) => PlatformOrder;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    actorName?: string,
    note?: string,
  ) => void;
  updateOrderDetails: (
    orderId: string,
    updates: Partial<PlatformOrder>,
  ) => void;
  deleteOrder: (orderId: string) => void;
  createPackage: (packageInput: {
    title: string;
    destinationZone: string;
    destinationCity: string;
    orderIds: string[];
    assignedDriver?: string;
    savingsRatio?: string;
  }) => PlatformPackage;
  updatePackageStatus: (
    packageId: string,
    status: PlatformPackage["status"],
    driverName?: string,
  ) => void;
  acceptExpressDelivery: (orderId: string, driverName: string) => void;
  addProduct: (product: Omit<PlatformProduct, "id">) => PlatformProduct;
  deleteProduct: (productId: string) => void;
  importScrapedProducts: (
    productsToImport: Omit<PlatformProduct, "id">[],
  ) => void;
}

const STORAGE_ORDERS_KEY = "arab_aura_platform_orders_v4";
const STORAGE_PACKAGES_KEY = "arab_aura_platform_packages_v3";
const STORAGE_PRODUCTS_KEY = "arab_aura_platform_products_v3";

// 📦 الطلبات الافتراضية مع دعم المحافظات ونطاق 6 أكتوبر والمنوفية والإكسبريس وإحداثيات GPS الحية
const INITIAL_ORDERS: PlatformOrder[] = [
  {
    id: "ORD-9821",
    customerName: "محمود عبد الفتاح",
    customerEmail: "mahmoud.fatah@aura.com",
    phone: "01012345678",
    city: "شبين الكوم - المنوفية",
    governorate: "المنوفية",
    address: "شارع الجلاء - بجوار الاستاد الرياضي - عمارة 12",
    totalAmount: 1340,
    shippingFee: 35,
    shippingType: "standard",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    status: "collected_in_hub",
    sellerId: "b-townteam",
    sellerName: "Town Team (مول العرب)",
    sellerAddress: "مول العرب - بوابة 3، 6 أكتوبر",
    sellerPhone: "01122334455",
    sellerCommercialReg: "CR-49210-GIZA",
    collectorName: "محمود حسن (مُجمّع)",
    driverName: "الكابتن أحمد محمود",
    driverPhone: "01092242607",
    driverVehicle: "سيارة فان دايو كاري",
    driverPlate: "أ ب جـ 4589",
    driverRating: "4.9 (142 رحلة)",
    hubName: "نقطة تجميع حي الأشجار - 6 أكتوبر (مقر المُجمّع محمود حسن)",
    packageId: "PKG-MONUF-901",
    otpCode: "4821",
    distanceKm: 3.2,
    mapCoords: { x: -60, y: -45 },
    lat: 30.5593,
    lng: 31.0105,
    originCoords: [30.0074, 30.9733],
    destCoords: [30.5593, 31.0105],
    createdAt: "2026-11-03 14:30",
    items: [
      {
        id: "item-1",
        productId: "p-townteam-1",
        productTitle: "تيشيرت بولو قطن 100% Town Team",
        qty: 2,
        unitPrice: 450,
        brandName: "Town Team",
        size: "L",
        color: "كحلي",
        imageUrl:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
      },
      {
        id: "item-2",
        productId: "p-townteam-2",
        productTitle: "بنطلون جينز كاجوال مريح",
        qty: 1,
        unitPrice: 440,
        brandName: "Town Team",
        size: "34",
        color: "أزرق كلاسيك",
        imageUrl:
          "https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      {
        status: "pending",
        titleAr: "تم إنشاء الطلب واعتماده",
        titleEn: "Order Placed",
        timestamp: "2026-11-03 14:30",
        actor: "المستهلك (محمود عبد الفتاح)",
      },
      {
        status: "processing",
        titleAr: "جاري تجهيز وتغليف الطلب لدى التاجر",
        titleEn: "Processing by Seller",
        timestamp: "2026-11-03 15:10",
        actor: "متجر Town Team (مول العرب)",
      },
      {
        status: "ready_for_collection",
        titleAr: "الطلب جاهز للاستلام بواسطة مندوب التجميع",
        titleEn: "Ready for Pickup",
        timestamp: "2026-11-03 15:45",
        actor: "متجر Town Team",
      },
      {
        status: "collected_in_hub",
        titleAr: "تم فحص الشحنة وتجميعها في حزمة المنوفية لدى مُجمّع الحي (حي الأشجار)",
        titleEn: "Collected at Hub & Batched",
        timestamp: "2026-11-03 16:20",
        actor: "محمود حسن (مُجمّع)",
      },
    ],
  },
  {
    id: "ORD-9822",
    customerName: "إسلام رضوان",
    customerEmail: "eslam.radwan@aura.com",
    phone: "01099887766",
    city: "الباجور - المنوفية",
    governorate: "المنوفية",
    address: "شارع الجيش - ميدان المحطة - برج الصفا",
    totalAmount: 850,
    shippingFee: 35,
    shippingType: "standard",
    paymentMethod: "vodafone_cash",
    paymentStatus: "paid",
    status: "collected_in_hub",
    sellerId: "b-tiehouse",
    sellerName: "Tie House (الحصري)",
    sellerAddress: "ميدان الحصري - مجمع الماجد، 6 أكتوبر",
    sellerPhone: "01234567890",
    sellerCommercialReg: "CR-88123-GIZA",
    collectorName: "محمود حسن (مُجمّع)",
    driverName: "الكابتن أحمد محمود",
    driverPhone: "01092242607",
    driverVehicle: "سيارة فان دايو كاري",
    driverPlate: "أ ب جـ 4589",
    driverRating: "4.9 (142 رحلة)",
    hubName: "نقطة تجميع حي الأشجار - 6 أكتوبر (مقر المُجمّع محمود حسن)",
    packageId: "PKG-MONUF-901",
    otpCode: "3190",
    distanceKm: 4.8,
    mapCoords: { x: 75, y: -70 },
    lat: 30.4300,
    lng: 31.0400,
    originCoords: [29.9723, 30.9472],
    destCoords: [30.4300, 31.0400],
    createdAt: "2026-11-03 15:00",
    items: [
      {
        id: "item-3",
        productId: "p-tiehouse-1",
        productTitle: "قميص كلاسيك إيطالي ناصع البياض Tie House",
        qty: 1,
        unitPrice: 850,
        brandName: "Tie House",
        size: "XL",
        color: "أبيض",
        imageUrl:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      {
        status: "pending",
        titleAr: "تم إنشاء الطلب والدفع بفودافون كاش",
        titleEn: "Order Placed & Paid",
        timestamp: "2026-11-03 15:00",
        actor: "إسلام رضوان",
      },
      {
        status: "processing",
        titleAr: "تجهيز الشحنة لدى البائع",
        titleEn: "Processing",
        timestamp: "2026-11-03 15:30",
        actor: "Tie House",
      },
      {
        status: "ready_for_collection",
        titleAr: "جاهز للاستلام",
        titleEn: "Ready for Collection",
        timestamp: "2026-11-03 16:00",
      },
      {
        status: "collected_in_hub",
        titleAr: "تم الاستلام وإضافته لحزمة المنوفية المشتركة",
        titleEn: "Collected at Hub",
        timestamp: "2026-11-03 16:30",
        actor: "محمود حسن (مُجمّع)",
      },
    ],
  },
  {
    id: "ORD-9823",
    customerName: "أحمد سامي النجار",
    customerEmail: "ahmed.sami@aura.com",
    phone: "01122334455",
    city: "شبين الكوم - المنوفية",
    governorate: "المنوفية",
    address: "شارع باريس - أمام مجمع المحاكم - برج الأندلس",
    totalAmount: 1170,
    shippingFee: 35,
    shippingType: "standard",
    paymentMethod: "instapay",
    paymentStatus: "paid",
    status: "collected_in_hub",
    sellerId: "b-activ",
    sellerName: "Activ Abu Alaa (دولفين مول)",
    sellerAddress: "دولفين مول - المحور المركزي، 6 أكتوبر",
    sellerPhone: "01099881122",
    sellerCommercialReg: "CR-55412-GIZA",
    collectorName: "محمود حسن (مُجمّع)",
    driverName: "الكابتن أحمد محمود",
    driverPhone: "01092242607",
    driverVehicle: "سيارة فان دايو كاري",
    driverPlate: "أ ب جـ 4589",
    driverRating: "4.9 (142 رحلة)",
    hubName: "نقطة تجميع حي الأشجار - 6 أكتوبر (مقر المُجمّع محمود حسن)",
    packageId: "PKG-MONUF-901",
    otpCode: "8823",
    distanceKm: 2.1,
    mapCoords: { x: -30, y: 80 },
    lat: 30.5650,
    lng: 31.0080,
    originCoords: [29.9790, 30.9320],
    destCoords: [30.5650, 31.0080],
    createdAt: "2026-11-03 15:15",
    items: [
      {
        id: "item-4",
        productId: "p-activ-1",
        productTitle: "حذاء رياضي مبطن خفيف Activ Pro",
        qty: 1,
        unitPrice: 1170,
        brandName: "Activ Abu Alaa",
        size: "42",
        color: "رمادي / أسود",
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      {
        status: "pending",
        titleAr: "تم إنشاء الطلب والدفع عبر InstaPay",
        titleEn: "Order Placed & Paid via InstaPay",
        timestamp: "2026-11-03 15:15",
      },
      {
        status: "ready_for_collection",
        titleAr: "تم التجهيز بواسطة Activ",
        titleEn: "Ready for Pickup",
        timestamp: "2026-11-03 16:00",
      },
      {
        status: "collected_in_hub",
        titleAr: "مجمع بالهب وجاهز في حزمة شبين الكوم",
        titleEn: "Collected at Hub",
        timestamp: "2026-11-03 16:45",
      },
    ],
  },
  {
    id: "ORD-EXP-7701",
    customerName: "سارة خالد الشريف",
    customerEmail: "sara.sherif@aura.com",
    phone: "01198765432",
    city: "الشيخ زايد - الجيزة",
    governorate: "الجيزة",
    address: "كمبوند زايد ديونز - فيلا 14B - الشيخ زايد",
    totalAmount: 1800,
    shippingFee: 75,
    shippingType: "express",
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "ready_for_collection",
    sellerId: "b-townteam",
    sellerName: "Town Team (مول العرب)",
    sellerAddress: "مول العرب - بوابة 3، 6 أكتوبر",
    sellerPhone: "01122334455",
    sellerCommercialReg: "CR-49210-GIZA",
    collectorName: "طلب فوري (Express On-Demand)",
    driverName: "أحمد محمود (سائق السريع)",
    driverPhone: "01092242607",
    driverVehicle: "سكوتر شحن سريع هوندا",
    driverPlate: "س ق ر 1290",
    driverRating: "5.0 (89 رحلة)",
    hubName: "تسليم فوري ومباشر (Uber-like Delivery)",
    otpCode: "7701",
    distanceKm: 5.4,
    mapCoords: { x: 90, y: 30 },
    lat: 30.0450,
    lng: 30.9980,
    originCoords: [30.0074, 30.9733],
    destCoords: [30.0450, 30.9980],
    createdAt: "2026-11-03 16:40",
    items: [
      {
        id: "item-5",
        productId: "p-townteam-1",
        productTitle: "تيشيرت بولو قطن 100% Town Team",
        qty: 4,
        unitPrice: 450,
        brandName: "Town Team",
        size: "M",
        color: "أبيض",
        imageUrl:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      {
        status: "pending",
        titleAr: "تم إنشاء طلب شحن فوري Express والدفع بالبطاقة",
        titleEn: "Express Order Placed",
        timestamp: "2026-11-03 16:40",
        actor: "سارة خالد الشريف",
      },
      {
        status: "processing",
        titleAr: "تجهيز فوري سريع بالمتجر",
        titleEn: "Express Packing",
        timestamp: "2026-11-03 16:50",
        actor: "Town Team (مول العرب)",
      },
      {
        status: "ready_for_collection",
        titleAr: "⚡ جاهز للاستلام المباشر من أقرب سائق توصيل",
        titleEn: "Ready for Instant Driver Pickup",
        timestamp: "2026-11-03 17:00",
        actor: "متجر Town Team",
      },
    ],
  },
  {
    id: "ORD-9825",
    customerName: "طارق الدسوقي",
    customerEmail: "tarek@aura.com",
    phone: "01288776655",
    city: "طنطا - الغربية",
    governorate: "الغربية",
    address: "شارع البحر - بجوار بنك مصر - الدور الثاني",
    totalAmount: 1440,
    shippingFee: 35,
    shippingType: "standard",
    paymentMethod: "fawry",
    paymentStatus: "paid",
    status: "processing",
    sellerId: "b-activ",
    sellerName: "Activ Abu Alaa (دولفين مول)",
    sellerAddress: "دولفين مول - 6 أكتوبر",
    otpCode: "9825",
    distanceKm: 6.8,
    mapCoords: { x: -110, y: 70 },
    createdAt: "2026-11-03 16:00",
    items: [
      {
        id: "item-6",
        productId: "p-activ-1",
        productTitle: "حذاء جري كاجوال Activ Pro",
        qty: 1,
        unitPrice: 1170,
        brandName: "Activ Abu Alaa",
        size: "44",
        color: "أسود",
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
      },
    ],
    timeline: [
      {
        status: "pending",
        titleAr: "تم تأكيد الدفع عبر فوري باي بنجاح",
        titleEn: "Fawry Payment Verified",
        timestamp: "2026-11-03 16:00",
      },
      {
        status: "processing",
        titleAr: "جاري تجهيز الشحنة في مخزن دولفين مول",
        titleEn: "Processing",
        timestamp: "2026-11-03 16:30",
      },
    ],
  },
];

// 📦 الحزم المجمعة الأولية للربط بين الكوليكتور والدرايفر
const INITIAL_PACKAGES: PlatformPackage[] = [
  {
    id: "PKG-MONUF-901",
    title: "حزمة المنوفية الكبرى (شبين الكوم & الباجور)",
    originHub: "نقطة تجميع حي الأشجار - 6 أكتوبر (مقر المُجمّع محمود حسن)",
    destinationZone: "المنوفية",
    destinationCity: "شبين الكوم & الباجور",
    orderIds: ["ORD-9821", "ORD-9822", "ORD-9823"],
    totalWeightKg: 4.8,
    ordersCount: 3,
    assignedDriver: "بانتظار قبول السائق",
    status: "ready_at_hub",
    savingsRatio: "توفير 65% في تكلفة الوقود وزمن الشحن الموحد عبر الذكاء الاصطناعي",
    createdAt: "2026-11-03 16:45",
  },
  {
    id: "PKG-GHARB-902",
    title: "حزمة وسط الدلتا (طنطا)",
    originHub: "نقطة تجميع حي الأشجار - 6 أكتوبر (مقر المُجمّع محمود حسن)",
    destinationZone: "الغربية",
    destinationCity: "طنطا (شارع البحر)",
    orderIds: ["ORD-9825"],
    totalWeightKg: 2.1,
    ordersCount: 1,
    assignedDriver: "الكابتن إبراهيم متولي",
    status: "ready_at_hub",
    savingsRatio: "توفير 40% عبر المسار الدائري الإقليمي",
    createdAt: "2026-11-03 17:10",
  },
];

// 🛍️ المنتجات الأولية
const INITIAL_PRODUCTS: PlatformProduct[] = [
  {
    id: "p-townteam-1",
    title: "تيشيرت بولو قطن 100% كلاسيك Town Team",
    titleEn: "Town Team 100% Cotton Classic Polo",
    price: 450,
    originalPrice: 650,
    brandId: "b-townteam",
    brandName: "Town Team",
    category: "ملابس رجالي",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    description: "خامة قطنية مصرية فائقة النعومة وتصميم عصري مناسب لجميع الإطلالات اليومية.",
    descriptionEn: "Premium 100% soft cotton polo shirt tailored for modern gentlemen.",
    stock: 24,
  },
  {
    id: "p-townteam-2",
    title: "بنطلون جينز كاجوال سليم فيت Town Team",
    titleEn: "Slim Fit Casual Denim Jeans",
    price: 590,
    originalPrice: 800,
    brandId: "b-townteam",
    brandName: "Town Team",
    category: "ملابس رجالي",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80",
    description: "جينز عصري مريح جداً بخامة مطاطية خفيفة ولون ثابت لا يبهت مع الغسيل.",
    descriptionEn: "Durable premium stretch denim jeans with modern fit.",
    stock: 18,
  },
  {
    id: "p-tiehouse-1",
    title: "قميص كلاسيك سليم فيت ناصع البياض Tie House",
    titleEn: "Tie House Italian Classic White Shirt",
    price: 850,
    originalPrice: 1100,
    brandId: "b-tiehouse",
    brandName: "Tie House",
    category: "ملابس رجالي",
    imageUrl:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    description: "تصميم إيطالي راقي للمناسبات واجتماعات العمل الرسمية.",
    descriptionEn: "Italian cut formal shirt with premium non-iron fabric.",
    stock: 12,
  },
  {
    id: "p-activ-1",
    title: "حذاء رياضي مبطن خفيف للركض Activ Pro",
    titleEn: "Activ Pro Cushioned Running Shoes",
    price: 1170,
    originalPrice: 1500,
    brandId: "b-activ",
    brandName: "Activ Abu Alaa",
    category: "أحذية ورياضة",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    description: "نعل طبي ماص للصدمات يوفر أقصى درجات الراحة أثناء الجري والمشي الطويل.",
    descriptionEn: "High-performance ergonomic sports shoes with shock absorption sole.",
    stock: 35,
  },
];

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<PlatformOrder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading stored orders", e);
    }
    return INITIAL_ORDERS;
  });

  const [packages, setPackages] = useState<PlatformPackage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PACKAGES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading stored packages", e);
    }
    return INITIAL_PACKAGES;
  });

  const [products, setProducts] = useState<PlatformProduct[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading stored products", e);
    }
    return INITIAL_PRODUCTS;
  });

  // حفظ التغييرات تلقائياً في LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Error saving orders to localStorage", e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PACKAGES_KEY, JSON.stringify(packages));
    } catch (e) {
      console.error("Error saving packages to localStorage", e);
    }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Error saving products to localStorage", e);
    }
  }, [products]);

  // 1️⃣ إنشاء طلب جديد من المستهلك
  const placeOrder = (orderInput: {
    items: any[];
    shippingType?: ShippingType;
    shippingAddress: {
      governorate?: string;
      center?: string;
      villageOrDistrict?: string;
      street?: string;
      buildingNumber?: string;
      phone: string;
      fullName?: string;
      city?: string;
      address?: string;
    };
    payment: {
      method: string;
      totalAmount: number;
      receiptImage?: string | null;
      transactionRef?: string;
      senderWallet?: string;
    };
  }): PlatformOrder => {
    const isExpress = orderInput.shippingType === "express";
    const orderNumber = isExpress
      ? `ORD-EXP-${Math.floor(1000 + Math.random() * 9000)}`
      : `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const parsedItems: OrderItem[] = orderInput.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: item.id || `p-${idx}`,
      productTitle: item.title || item.name || "منتج من عرب أورا",
      qty: item.quantity || item.qty || 1,
      unitPrice: Number(item.price) || 0,
      brandName: item.brand || item.brandName || "Town Team",
      size: item.selectedSize || item.size || "M",
      color: item.selectedColor || item.color || "افتراضي",
      imageUrl:
        item.image ||
        item.imageUrl ||
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    }));

    const fullAddress =
      orderInput.shippingAddress.address ||
      `${orderInput.shippingAddress.governorate || "المنوفية"} - ${orderInput.shippingAddress.center || "شبين الكوم"} - ${orderInput.shippingAddress.street || "الشارع الرئيسي"} - عمارة ${orderInput.shippingAddress.buildingNumber || "1"}`;

    const randomOffsetX = Math.floor(Math.random() * 160) - 80;
    const randomOffsetY = Math.floor(Math.random() * 160) - 80;
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));

    let orderLat = 30.5593;
    let orderLng = 31.0105;
    if (orderInput.shippingAddress.governorate === "الجيزة") {
      orderLat = 30.0131;
      orderLng = 31.2089;
    } else if (orderInput.shippingAddress.governorate === "القاهرة") {
      orderLat = 30.0444;
      orderLng = 31.2357;
    } else if (orderInput.shippingAddress.center?.includes("الباجور")) {
      orderLat = 30.4300;
      orderLng = 31.0400;
    } else if (orderInput.shippingAddress.center?.includes("أشمون")) {
      orderLat = 30.2975;
      orderLng = 30.9780;
    }

    const newOrder: PlatformOrder = {
      id: orderNumber,
      customerName:
        orderInput.shippingAddress.fullName ||
        localStorage.getItem("user_name") ||
        "عميل عرب أورا",
      customerEmail:
        localStorage.getItem("user_email") || "customer@aura.com",
      phone: orderInput.shippingAddress.phone || "01000000000",
      city:
        orderInput.shippingAddress.city ||
        `${orderInput.shippingAddress.center || "شبين الكوم"} - ${orderInput.shippingAddress.governorate || "المنوفية"}`,
      governorate: orderInput.shippingAddress.governorate || "المنوفية",
      address: fullAddress,
      totalAmount: orderInput.payment.totalAmount,
      shippingFee: isExpress ? 75 : 35,
      shippingType: isExpress ? "express" : "standard",
      paymentMethod: (orderInput.payment.method as any) || "cod",
      paymentStatus:
        orderInput.payment.method === "cod" ? "unpaid" : "paid",
      status: "pending",
      sellerId: parsedItems[0]?.brandName || "b-townteam",
      sellerName: parsedItems[0]?.brandName || "Town Team (مول العرب)",
      sellerAddress: "مول العرب - 6 أكتوبر",
      sellerPhone: "01122334455",
      sellerCommercialReg: "CR-49210-GIZA",
      driverName: isExpress ? "أحمد محمود (سائق السريع)" : "الكابتن أحمد محمود",
      driverPhone: "01092242607",
      driverVehicle: isExpress ? "سكوتر شحن سريع هوندا" : "سيارة فان دايو كاري",
      driverPlate: isExpress ? "س ق ر 1290" : "أ ب جـ 4589",
      driverRating: "4.9 (142 رحلة)",
      hubName: isExpress
        ? "توصيل فوري مباشر (Express Courier)"
        : "نقطة تجميع حي الأشجار - 6 أكتوبر (مقر المُجمّع)",
      otpCode: generatedOtp,
      distanceKm: Math.floor(Math.random() * 8) + 2,
      mapCoords: { x: randomOffsetX, y: randomOffsetY },
      lat: orderLat,
      lng: orderLng,
      originCoords: [30.0074, 30.9733],
      destCoords: [orderLat, orderLng],
      createdAt: formattedDate,
      items: parsedItems,
      timeline: [
        {
          status: "pending",
          titleAr: isExpress
            ? "تم إنشاء طلب شحن فوري Express بنجاح وجاري إخطار السائقين"
            : "تم استلام الطلب وتأكيده بنجاح من المستهلك",
          titleEn: isExpress
            ? "Express Order Placed - Finding Nearby Couriers"
            : "Order Placed Successfully",
          timestamp: formattedDate,
          actor: "المستهلك",
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 📡 مزامنة الطلب فوراً مع الباك إند (MongoDB API)
    try {
      api.post("/orders", {
        shippingAddress: {
          fullName: newOrder.customerName,
          phone: newOrder.phone,
          governorate: newOrder.governorate,
          city: newOrder.city,
          address: newOrder.address,
        },
        shippingType: newOrder.shippingType,
        paymentMethod: newOrder.paymentMethod,
        items: newOrder.items.map((it) => ({
          productId: it.productId,
          productTitle: it.productTitle,
          brandName: it.brandName,
          unitPrice: it.unitPrice,
          quantity: it.qty,
          size: it.size,
          color: it.color,
          imageUrl: it.imageUrl,
        })),
      }).catch((e) => console.log("Backend sync notice:", e.message));
    } catch (e: any) {
      console.log("Backend offline notice:", e.message);
    }

    return newOrder;
  };

  // 2️⃣ تحديث حالة الطلب
  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    actorName?: string,
    note?: string,
  ) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const statusTitles: Record<OrderStatus, { ar: string; en: string }> = {
      pending: {
        ar: "تم استلام الطلب وبانتظار تجهيز التاجر",
        en: "Order Pending",
      },
      processing: {
        ar: "بدأ التاجر بتجهيز وتغليف الطلب",
        en: "Processing by Merchant",
      },
      ready_for_collection: {
        ar: "تم تجهيز الشحنة وهي جاهزة للاستلام",
        en: "Ready for Pickup",
      },
      collected_in_hub: {
        ar: "تم استلام الشحنة وتجميعها لدى مُجمّع الحي (Micro-Hub)",
        en: "Collected by Local Area Collector",
      },
      out_for_delivery: {
        ar: "الشحنة خرجت مع السائق وجاري تسليمها للعنوان",
        en: "Out for Delivery",
      },
      delivered: {
        ar: "تم تسليم الطلب للعميل والتحقق من الـ OTP بنجاح",
        en: "Delivered to Customer",
      },
      cancelled: {
        ar: "تم إلغاء الطلب من قِبل إدارة المنصة",
        en: "Order Cancelled",
      },
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const newTimelineStep: OrderTimelineStep = {
          status: newStatus,
          titleAr: statusTitles[newStatus]?.ar || newStatus,
          titleEn: statusTitles[newStatus]?.en || newStatus,
          timestamp: formattedDate,
          actor: actorName || "إدارة النظام",
          note,
        };

        return {
          ...ord,
          status: newStatus,
          paymentStatus:
            newStatus === "delivered" ? "paid" : ord.paymentStatus,
          timeline: [...ord.timeline, newTimelineStep],
        };
      }),
    );
  };

  // 3️⃣ تعديل تفاصيل الطلب (خاص بالأدمن)
  const updateOrderDetails = (
    orderId: string,
    updates: Partial<PlatformOrder>,
  ) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord)),
    );
  };

  // 4️⃣ حذف الطلب
  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
  };

  // 5️⃣ إنشاء وتجميع حزمة ذكية (Package) من الكوليكتور
  const createPackage = (packageInput: {
    title: string;
    destinationZone: string;
    destinationCity: string;
    orderIds: string[];
    assignedDriver?: string;
    savingsRatio?: string;
  }): PlatformPackage => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newPackageId = `PKG-${packageInput.destinationZone.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPkg: PlatformPackage = {
      id: newPackageId,
      title: packageInput.title,
      originHub: "نقطة تجميع حي الأشجار - 6 أكتوبر (مقر المُجمّع محمود حسن)",
      destinationZone: packageInput.destinationZone,
      destinationCity: packageInput.destinationCity,
      orderIds: packageInput.orderIds,
      ordersCount: packageInput.orderIds.length,
      totalWeightKg: Math.round(packageInput.orderIds.length * 1.6 * 10) / 10,
      assignedDriver: packageInput.assignedDriver || "بانتظار قبول السائق",
      status: "ready_at_hub",
      savingsRatio:
        packageInput.savingsRatio ||
        `توفير ${Math.round(40 + Math.random() * 30)}% في زمن النقل والوقود عبر التجميع الذكي بالـ AI`,
      createdAt: formattedDate,
    };

    setPackages((prev) => [newPkg, ...prev]);

    // ربط وتحديث حالة الطلبات المشمولة بالحزمة
    setOrders((prev) =>
      prev.map((ord) => {
        if (packageInput.orderIds.includes(ord.id)) {
          return {
            ...ord,
            packageId: newPackageId,
            status: "collected_in_hub",
            timeline: [
              ...ord.timeline,
              {
                status: "collected_in_hub",
                titleAr: `تم تجميع الشحنة ضمن الحزمة الذكية (${newPackageId}) بمقر مُجمّع الحي وبانتظار استلام السائق`,
                titleEn: `Grouped into Package (${newPackageId}) at Neighborhood Collector Point`,
                timestamp: formattedDate,
                actor: "مُجمّع المنطقة اللوجستية",
              },
            ],
          };
        }
        return ord;
      }),
    );

    return newPkg;
  };

  // 6️⃣ تحديث حالة الحزمة (عند استلام السائق أو إتمام التوصيل)
  const updatePackageStatus = (
    packageId: string,
    status: PlatformPackage["status"],
    driverName?: string,
  ) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === packageId) {
          return {
            ...pkg,
            status,
            assignedDriver: driverName || pkg.assignedDriver,
          };
        }
        return pkg;
      }),
    );

    // إذا استلم السائق الحزمة، تنتقل جميع طلباتها لحالة "out_for_delivery"
    if (status === "in_transit") {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.packageId === packageId) {
            return {
              ...ord,
              status: "out_for_delivery",
              driverName: driverName || "أحمد محمود (سائق التوصيل)",
              timeline: [
                ...ord.timeline,
                {
                  status: "out_for_delivery",
                  titleAr: `استلم السائق (${driverName || "أحمد محمود"}) الحزمة وبدأ مسار التوصيل للعميل`,
                  titleEn: "Picked up by Driver and Out for Delivery",
                  timestamp: formattedDate,
                  actor: driverName || "سائق التوصيل",
                },
              ],
            };
          }
          return ord;
        }),
      );
    }
  };

  // 7️⃣ قبول شحن فوري Express بواسطة السائق
  const acceptExpressDelivery = (orderId: string, driverName: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: "out_for_delivery",
            driverName: driverName,
            timeline: [
              ...ord.timeline,
              {
                status: "out_for_delivery",
                titleAr: `تم قبول الشحن الفوري بواسطة السائق (${driverName}) مباشرة من المتجر وبدأ التحرك للتسليم`,
                titleEn: `Express courier assigned directly`,
                timestamp: formattedDate,
                actor: driverName,
              },
            ],
          };
        }
        return ord;
      }),
    );
  };

  // 8️⃣ إضافة وحذف المنتجات
  const addProduct = (
    productInput: Omit<PlatformProduct, "id">,
  ): PlatformProduct => {
    const newProduct: PlatformProduct = {
      ...productInput,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // 9️⃣ استيراد المنتجات من السوشيال ميديا
  const importScrapedProducts = (
    productsToImport: Omit<PlatformProduct, "id">[],
  ) => {
    const newlyCreated = productsToImport.map((p, idx) => ({
      ...p,
      id: `scraped-${Date.now()}-${idx}`,
    }));
    setProducts((prev) => [...newlyCreated, ...prev]);
  };

  return (
    <PlatformContext.Provider
      value={{
        orders,
        packages,
        products,
        placeOrder,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrder,
        createPackage,
        updatePackageStatus,
        acceptExpressDelivery,
        addProduct,
        deleteProduct,
        importScrapedProducts,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextType => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
};
