// src/utils/seed.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Brand } from "../models/Brand";
import { Product } from "../models/Product";
import { Hub } from "../models/Hub";
import { Order } from "../models/Order";

dotenv.config();

const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/arab_aura";

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("🌱 [Seeding]: متصل بقاعدة بيانات مونجو بنجاح..");

    // تنظيف البيانات السابقة
    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Hub.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log("🧹 [Seeding]: تم مسح البيانات القديمة.");

    // 1. إنشاء المستخدمين التجريبيين لكافة الأدوار
    const customer = await User.create({
      name: "أحمد عبد العزيز",
      email: "customer@aura.com",
      password: "password123",
      phone: "+201092242607",
      role: "customer",
    });

    const seller = await User.create({
      name: "مهندس كريم شريف (Town Team)",
      email: "seller@aura.com",
      password: "password123",
      phone: "+201092242607",
      role: "seller",
    });

    const collector = await User.create({
      name: "محمود حسن (مشرف مركز أكتوبر)",
      email: "collector@aura.com",
      password: "password123",
      phone: "+201092242607",
      role: "collector",
    });

    const driver = await User.create({
      name: "الكابتن أحمد محمود",
      email: "driver@aura.com",
      password: "password123",
      phone: "+201092242607",
      role: "driver",
      currentLat: 29.9723,
      currentLng: 30.9412,
      isOnline: true,
    });

    const admin = await User.create({
      name: "عبد الرازق بدر (المدير التنفيذي)",
      email: "admin@aura.com",
      password: "password123",
      phone: "+201092242607",
      role: "admin",
    });

    console.log("✅ [Seeding]: تم إنشاء حسابات المستخدمين لكافة الأدوار.");

    // 2. إنشاء البراندات المصرية
    const townTeam = await Brand.create({
      name: "Town Team",
      nameAr: "تاون تيم",
      descriptionAr: "أرقى صيحات الموضة الكاجوال والرسمية المصممة خصيصاً للرجل العصري.",
      descriptionEn: "The finest casual and formal fashion tailored for the modern man.",
      bgImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80",
      logoText: "TOWN TEAM",
      seller: seller._id,
    });

    const concrete = await Brand.create({
      name: "Concrete",
      nameAr: "كونكريت",
      descriptionAr: "الفخامة المصرية الخالصة وأجود ألياف القطن العالمي لإطلالة لا تُضاهى.",
      descriptionEn: "Pure Egyptian luxury and world-class cotton for an unmatched look.",
      bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
      logoText: "CONCRETE",
      seller: seller._id,
    });

    const ravin = await Brand.create({
      name: "RAVIN",
      nameAr: "رافين",
      descriptionAr: "تصميمات جريئة وعصرية تُلهم أصحاب الأذواق الرفيعة والشباب.",
      descriptionEn: "Bold and trendy designs inspiring youth and refined tastes.",
      bgImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80",
      logoText: "RAVIN",
      seller: seller._id,
    });

    console.log("✅ [Seeding]: تم إنشاء البراندات المصرية الرئيسية.");

    // 3. إنشاء مراكز التجميع بالأحياء (Micro-Hubs)
    const hubOct = await Hub.create({
      name: "6th of October Central Micro-Hub",
      nameAr: "مركز تجميع حي الأشجار - 6 أكتوبر",
      code: "HUB-OCT-01",
      governorate: "الجيزة",
      city: "6 أكتوبر",
      address: "الحي المتميز - بجوار مول العرب وحي الأشجار",
      collector: collector._id,
      latitude: 29.9723,
      longitude: 30.9412,
      active: true,
    });

    const hubMonuf = await Hub.create({
      name: "Shebin El-Kom Neighborhood Hub",
      nameAr: "مركز توزيع شبين الكوم - المنوفية",
      code: "HUB-MONUF-02",
      governorate: "المنوفية",
      city: "شبين الكوم",
      address: "شارع الجلاء - بجوار الاستاد الرياضي",
      collector: collector._id,
      latitude: 30.5603,
      longitude: 31.0069,
      active: true,
    });

    console.log("✅ [Seeding]: تم إنشاء مراكز التجميع (Micro-Hubs).");

    // 4. إنشاء المنتجات القطنية الفاخرة
    const productsData = [
      {
        brand: townTeam._id,
        brandName: townTeam.name,
        titleAr: "تيشيرت بولو قطن مصري فاخر",
        titleEn: "Premium Egyptian Cotton Polo Shirt",
        category: "men_tshirts",
        price: 490,
        oldPrice: 650,
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: [
          { nameAr: "أبيض ناصع", nameEn: "White", hex: "#FFFFFF" },
          { nameAr: "كحلي ملكي", nameEn: "Navy", hex: "#1B2A4A" },
          { nameAr: "رمادي هادئ", nameEn: "Muted Grey", hex: "#4A5568" },
        ],
        rating: 5,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
        additionalImages: [
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
        ],
        badgeAr: "الأكثر مبيعاً",
        badgeEn: "Best Seller",
        descriptionAr: "مصنوع من أجود ألياف القطن المصري طويل التيلة، يمنحك ملمساً فائق النعومة وتهوية مثالية طوال اليوم.",
        descriptionEn: "Crafted from Egyptian extra-long staple cotton for unmatched softness and breathability.",
        stock: 85,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "قطن مصري 100%",
      },
      {
        brand: concrete._id,
        brandName: concrete.name,
        titleAr: "قميص كاجوال كتان ناعم مطرز",
        titleEn: "Tailored Linen Casual Shirt",
        category: "men_shirts",
        price: 890,
        oldPrice: 1150,
        sizes: ["M", "L", "XL", "XXL"],
        colors: [
          { nameAr: "بيج طبيعي", nameEn: "Beige", hex: "#E2D4C3" },
          { nameAr: "أزرق سماوي", nameEn: "Sky Blue", hex: "#87CEEB" },
        ],
        rating: 5,
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        additionalImages: [],
        badgeAr: "فخامة مصرية",
        badgeEn: "Pure Luxury",
        descriptionAr: "تصميم أنيق بقصة عصرية متناسقة، مناسب لبيئة العمل والمناسبات الصيفية الخفيفة.",
        descriptionEn: "A stylish tailored fit shirt suitable for modern work and leisure.",
        stock: 45,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "كتان قطني فاخر",
      },
      {
        brand: ravin._id,
        brandName: ravin.name,
        titleAr: "بنطلون جينز كلاسيك مريح سليم فيت",
        titleEn: "Classic Slim-Fit Stretch Denim Jeans",
        category: "men_pants",
        price: 750,
        oldPrice: 920,
        sizes: ["30", "32", "34", "36", "38"],
        colors: [
          { nameAr: "جينز داكن", nameEn: "Dark Indigo", hex: "#2C3E50" },
          { nameAr: "رمادي غامق", nameEn: "Dark Grey", hex: "#34495E" },
        ],
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
        additionalImages: [],
        badgeAr: "مريح ومطاط",
        badgeEn: "Comfort Stretch",
        descriptionAr: "خامة جينز قوية مع مرونة خفيفة لضمان أقصى درجات الراحة مع ثبات اللون مع الغسيل.",
        descriptionEn: "Durable denim blend offering comfort stretch and color retention.",
        stock: 60,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "دينيم قطن 98% ليكرا 2%",
      },
    ];

    await Product.insertMany(productsData);
    console.log("✅ [Seeding]: تم إدراج المنتجات في قاعدة البيانات.");

    // 5. إنشاء طلبات أولية جاهزة للاختبار
    await Order.create({
      orderNumber: "ORD-9821",
      customer: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      governorate: "الجيزة",
      city: "6 أكتوبر",
      address: "الحي المتميز - عمارة 14 - شقة 5",
      shippingType: "standard",
      shippingFee: 35.0,
      itemsTotal: 1380,
      totalAmount: 1415,
      paymentMethod: "cod",
      paymentStatus: "unpaid",
      status: "collected_in_hub",
      otpCode: "4821",
      packageId: "PKG-OCT-7701",
      hub: hubOct._id,
      driver: driver._id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverVehicle: "سيارة فان دايو كاري",
      driverPlate: "أ ب جـ 4589",
      items: [
        {
          productTitle: "تيشيرت بولو قطن مصري فاخر",
          brandName: "Town Team",
          unitPrice: 490,
          quantity: 2,
          size: "L",
          color: "كحلي ملكي",
          imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
        },
        {
          productTitle: "قميص كاجوال كتان ناعم مطرز",
          brandName: "Concrete",
          unitPrice: 890,
          quantity: 1,
          size: "XL",
          color: "بيج طبيعي",
          imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        },
      ],
    });

    console.log("✅ [Seeding]: تم إنشاء طلبات تجريبية بنظام الشحن المجمع بالحي (35 ج).");
    console.log(`
    ══════════════════════════════════════════════════════════
    🎉 تم ملء قاعدة بيانات مونجو بنجاح تام!
    🔑 بيانات تسجيل الدخول للاختبار:
       - عميل / مشتري:   customer@aura.com / password123
       - تاجر / براند:   seller@aura.com   / password123
       - مُجمّع حي (Hub): collector@aura.com/ password123
       - كابتن توصيل:    driver@aura.com   / password123
       - مدير المنصة:     admin@aura.com    / password123
    ══════════════════════════════════════════════════════════
    `);

    process.exit(0);
  } catch (err: any) {
    console.error("❌ خطأ أثناء ملء البيانات:", err);
    process.exit(1);
  }
};

seedData();
