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

    // مسح البيانات التجريبية السابقة مع الحفاظ على الحسابات الحقيقية
    await Promise.all([
      User.deleteMany({ email: { $in: ["customer@aura.com", "seller@aura.com", "collector@aura.com", "driver@aura.com", "admin@aura.com"] } }),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Hub.deleteMany({}),
      Order.deleteMany({ customerName: { $in: ["أحمد عبد العزيز", "محمود عبد الفتاح", "إسلام رضوان", "سارة خالد الشريف", "عمر الألفي"] } }),
    ]);
    console.log("🧹 [Seeding]: تم تنظيف الحسابات التجريبية والطلبات السابقة.");

    // 1. إنشاء المستخدمين التجريبيين لكافة الأدوار
    const customer = await User.create({
      name: "أحمد عبد العزيز",
      username: "customer",
      email: "customer@aura.com",
      password: "password123",
      phone: "+201012345678",
      nationalId: "29801011401234",
      birthDate: "1998-05-14",
      walletBalance: 0,
      role: "customer",
    });

    const seller = await User.create({
      name: "مهندس كريم شريف (Town Team)",
      username: "seller",
      email: "seller@aura.com",
      password: "password123",
      phone: "+201092242607",
      nationalId: "29204121401999",
      birthDate: "1992-04-12",
      walletBalance: 0,
      role: "seller",
    });

    const collector = await User.create({
      name: "محمود حسن (مشرف مركز أكتوبر)",
      username: "collector",
      email: "collector@aura.com",
      password: "password123",
      phone: "+201055443322",
      nationalId: "29508101405555",
      birthDate: "1995-08-10",
      walletBalance: 0,
      role: "collector",
    });

    const driver = await User.create({
      name: "الكابتن أحمد محمود",
      username: "driver",
      email: "driver@aura.com",
      password: "password123",
      phone: "+201092242607",
      nationalId: "29611201407777",
      birthDate: "1996-11-20",
      walletBalance: 0,
      role: "driver",
      currentLat: 29.9723,
      currentLng: 30.9412,
      isOnline: true,
    });

    const admin = await User.create({
      name: "عبد الرازق بدر (المدير التنفيذي)",
      username: "admin",
      email: "admin@aura.com",
      password: "password123",
      phone: "+201092242607",
      nationalId: "20012121401234",
      birthDate: "2001-12-14",
      walletBalance: 0,
      role: "admin",
    });

    console.log("✅ [Seeding]: تم إنشاء حسابات المستخدمين لكافة الأدوار مع أسماء المستخدمين.");

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
      descriptionEn: "Bold and trendsetting styles for the youthful fashion enthusiast.",
      bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
      logoText: "RAVIN JEANS",
      seller: seller._id,
    });

    console.log("✅ [Seeding]: تم إدراج البراندات المصرية وتوثيقها.");

    // 3. إنشاء نقاط ومراكز التجميع بالأحياء (Micro-Hubs)
    const hubOct = await Hub.create({
      code: "HUB-OCT-01",
      name: "نقطة تجميع حي الأشجار - 6 أكتوبر",
      nameAr: "نقطة تجميع حي الأشجار - 6 أكتوبر",
      governorate: "الجيزة",
      city: "6 أكتوبر",
      address: "الحي المتميز - بالقرب من مول العرب وسيتي سكيب",
      latitude: 29.9722,
      longitude: 30.9419,
      collector: collector._id,
      active: true,
    });

    const hubMnf = await Hub.create({
      code: "HUB-MNF-02",
      name: "نقطة تجميع شبين الكوم - المنوفية",
      nameAr: "نقطة تجميع شبين الكوم - المنوفية",
      governorate: "المنوفية",
      city: "شبين الكوم",
      address: "شارع الجلاء - مجمع المواقف المركزي",
      latitude: 30.5593,
      longitude: 31.0105,
      collector: collector._id,
      active: true,
    });

    console.log("✅ [Seeding]: تم إعداد مراكز التجميع المصغرة (Micro-Hubs).");

    // 4. إنشاء كتالوج المنتجات
    const productsData = [
      {
        brand: townTeam._id,
        brandName: "Town Team",
        titleAr: "تيشيرت بولو قطن مصري فاخر ناعم",
        titleEn: "Town Team Premium Egyptian Cotton Polo",
        category: "tshirt",
        price: 490,
        oldPrice: 650,
        sizes: ["M", "L", "XL", "XXL"],
        colors: [
          { nameAr: "كحلي ملكي", nameEn: "Royal Navy", hex: "#1A2B4C" },
          { nameAr: "أبيض ناصع", nameEn: "Pure White", hex: "#FFFFFF" },
          { nameAr: "زيتي غامق", nameEn: "Dark Olive", hex: "#4B5320" },
        ],
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
        additionalImages: [],
        badgeAr: "الأعلى مبيعاً",
        badgeEn: "Best Seller",
        descriptionAr: "تيشيرت مصنوع من قطن جيزة 94 طويل التيلة، يوفر أقصى درجات النعومة والتهوية في الطقس الحار.",
        descriptionEn: "Crafted with Giza 94 long-staple Egyptian cotton for ultimate breathability and refined elegance.",
        stock: 50,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "قطن مصري 100%",
      },
      {
        brand: concrete._id,
        brandName: "Concrete",
        titleAr: "قميص كاجوال كتان ناعم مطرز أنيق",
        titleEn: "Concrete Casual Soft Linen Shirt",
        category: "shirt",
        price: 890,
        oldPrice: 1200,
        sizes: ["S", "M", "L", "XL"],
        colors: [
          { nameAr: "بيج طبيعي", nameEn: "Natural Beige", hex: "#D4C4A8" },
          { nameAr: "أزرق سماوي", nameEn: "Sky Blue", hex: "#87CEEB" },
        ],
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        additionalImages: [],
        badgeAr: "خامة فاخرة",
        badgeEn: "Premium Blend",
        descriptionAr: "قميص رجالي مصمم بعناية فائقة من خيوط الكتان الطبيعية الممزوجة بالقطن لإطلالة صيفية جذابة ومريحة.",
        descriptionEn: "Tailored fit shirt utilizing pure breathable linen for a sharp Mediterranean summer look.",
        stock: 30,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "كتان 70% قطن 30%",
      },
      {
        brand: ravin._id,
        brandName: "RAVIN",
        titleAr: "بنطلون جينز سليم فيت ستريتش مريح",
        titleEn: "RAVIN Slim-Fit Stretch Denim Jeans",
        category: "pants",
        price: 690,
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

    // 5. إنشاء طلبات تجريبية واقعية موزعة على الأيام لمتجر Town Team والسائق التجريبي
    const now = new Date();
    const dMinus = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d;
    };

    const ordersData: any[] = [
      {
        orderNumber: "ORD-9821",
        customer: customer._id,
        customerName: "محمود عبد الفتاح",
        customerPhone: "+201012345678",
        governorate: "المنوفية",
        city: "شبين الكوم",
        address: "شارع الجلاء - بجوار الاستاد الرياضي",
        shippingType: "standard",
        shippingFee: 35.0,
        itemsTotal: 1470,
        totalAmount: 1505,
        paymentMethod: "cod",
        paymentStatus: "unpaid",
        status: "out_for_delivery",
        otpCode: "4821",
        packageId: "PKG-MONUF-901",
        hub: (hubMnf as any)._id,
        driver: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverVehicle: "سيارة فان دايو كاري",
        driverPlate: "أ ب جـ 4589",
        items: [
          {
            productTitle: "تيشيرت بولو قطن مصري فاخر ناعم",
            brandName: "Town Team",
            unitPrice: 490,
            quantity: 3,
            size: "L",
            color: "كحلي ملكي",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
          },
        ],
        createdAt: dMinus(0),
      },
      {
        orderNumber: "ORD-9822",
        customer: customer._id,
        customerName: "إسلام رضوان",
        customerPhone: "+201099887766",
        governorate: "المنوفية",
        city: "الباجور",
        address: "شارع الجيش - ميدان المحطة",
        shippingType: "standard",
        shippingFee: 35.0,
        itemsTotal: 980,
        totalAmount: 1015,
        paymentMethod: "instapay",
        paymentStatus: "paid",
        status: "out_for_delivery",
        otpCode: "3190",
        packageId: "PKG-MONUF-901",
        hub: (hubMnf as any)._id,
        driver: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverVehicle: "سيارة فان دايو كاري",
        driverPlate: "أ ب جـ 4589",
        items: [
          {
            productTitle: "تيشيرت بولو قطن مصري فاخر ناعم",
            brandName: "Town Team",
            unitPrice: 490,
            quantity: 2,
            size: "XL",
            color: "أبيض ناصع",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
          },
        ],
        createdAt: dMinus(1),
      },
      {
        orderNumber: "ORD-9820",
        customer: customer._id,
        customerName: "سارة خالد الشريف",
        customerPhone: "+201198765432",
        governorate: "الجيزة",
        city: "الشيخ زايد",
        address: "كمبوند زايد ديونز - فيلا 14B",
        shippingType: "express",
        shippingFee: 60.0,
        itemsTotal: 1960,
        totalAmount: 2020,
        paymentMethod: "card",
        paymentStatus: "paid",
        status: "delivered",
        otpCode: "7701",
        packageId: "PKG-OCT-7701",
        hub: (hubOct as any)._id,
        driver: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverVehicle: "سيارة فان دايو كاري",
        driverPlate: "أ ب جـ 4589",
        items: [
          {
            productTitle: "تيشيرت بولو قطن مصري فاخر ناعم",
            brandName: "Town Team",
            unitPrice: 490,
            quantity: 4,
            size: "L",
            color: "كحلي ملكي",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
          },
        ],
        createdAt: dMinus(2),
      },
      {
        orderNumber: "ORD-9819",
        customer: customer._id,
        customerName: "عمر الألفي",
        customerPhone: "+201022334455",
        governorate: "الجيزة",
        city: "6 أكتوبر",
        address: "الحي الثاني - مجاورة 3",
        shippingType: "standard",
        shippingFee: 35.0,
        itemsTotal: 1470,
        totalAmount: 1505,
        paymentMethod: "cod",
        paymentStatus: "paid",
        status: "delivered",
        otpCode: "2201",
        packageId: "PKG-OCT-7701",
        hub: (hubOct as any)._id,
        driver: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverVehicle: "سيارة فان دايو كاري",
        driverPlate: "أ ب جـ 4589",
        items: [
          {
            productTitle: "تيشيرت بولو قطن مصري فاخر ناعم",
            brandName: "Town Team",
            unitPrice: 490,
            quantity: 3,
            size: "M",
            color: "زيتي غامق",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
          },
        ],
        createdAt: dMinus(3),
      },
      {
        orderNumber: "ORD-9818",
        customer: customer._id,
        customerName: "أحمد عبد العزيز",
        customerPhone: "+201012345678",
        governorate: "الجيزة",
        city: "6 أكتوبر",
        address: "الحي المتميز - عمارة 14",
        shippingType: "standard",
        shippingFee: 35.0,
        itemsTotal: 980,
        totalAmount: 1015,
        paymentMethod: "cod",
        paymentStatus: "paid",
        status: "delivered",
        otpCode: "1198",
        packageId: "PKG-OCT-7701",
        hub: (hubOct as any)._id,
        driver: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverVehicle: "سيارة فان دايو كاري",
        driverPlate: "أ ب جـ 4589",
        items: [
          {
            productTitle: "تيشيرت بولو قطن مصري فاخر ناعم",
            brandName: "Town Team",
            unitPrice: 490,
            quantity: 2,
            size: "L",
            color: "كحلي ملكي",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
          },
        ],
        createdAt: dMinus(4),
      },
    ];

    for (const o of ordersData) {
      await Order.create(o);
    }

    console.log("✅ [Seeding]: تم إنشاء طلبات تجريبية واقعية موزعة بنجاح.");
    console.log(`
    ══════════════════════════════════════════════════════════
    🎉 تم ملء قاعدة بيانات مونجو بنجاح تام!
    🔑 بيانات تسجيل الدخول للاختبار:
       - عميل / مشتري:   customer@aura.com (يوزر: customer) / password123
       - تاجر / براند:   seller@aura.com   (يوزر: seller)   / password123
       - مُجمّع حي (Hub): collector@aura.com(يوزر: collector)/ password123
       - كابتن توصيل:    driver@aura.com   (يوزر: driver)   / password123
       - مدير المنصة:     admin@aura.com    (يوزر: admin)    / password123
    ══════════════════════════════════════════════════════════
    `);

    process.exit(0);
  } catch (err: any) {
    console.error("❌ خطأ أثناء ملء البيانات:", err);
    process.exit(1);
  }
};

seedData();
