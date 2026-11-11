// src/utils/seed.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Brand } from "../models/Brand";
import { Product } from "../models/Product";
import { Hub } from "../models/Hub";
import { Order } from "../models/Order";
import { Category } from "../models/Category";
import { Business } from "../models/Business";
import { Branch } from "../models/Branch";
import { Zone } from "../models/Zone";
import { Location } from "../models/Location";
import { ShippingCompany } from "../models/ShippingCompany";
import { Vehicle } from "../models/Vehicle";
import { Shipment } from "../models/Shipment";
import { Payment } from "../models/Payment";
import { Review } from "../models/Review";
import { ObjectRecognition } from "../models/ObjectRecognition";

dotenv.config();

const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/arab_aura";

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("🌱 [Seeding]: متصل بقاعدة بيانات مونجو بنجاح..");

    // 🧹 مسح البيانات السابقة مع الحفاظ على الحسابات الحقيقية
    await Promise.all([
      User.deleteMany({
        email: {
          $in: [
            "customer@aura.com",
            "seller@aura.com",
            "collector@aura.com",
            "driver@aura.com",
            "admin@aura.com",
          ],
        },
      }),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Hub.deleteMany({}),
      Category.deleteMany({}),
      Business.deleteMany({}),
      Branch.deleteMany({}),
      Zone.deleteMany({}),
      Location.deleteMany({}),
      ShippingCompany.deleteMany({}),
      Vehicle.deleteMany({}),
      Shipment.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      ObjectRecognition.deleteMany({}),
      Order.deleteMany({
        customerName: {
          $in: [
            "أحمد عبد العزيز",
            "محمود عبد الفتاح",
            "إسلام رضوان",
            "سارة خالد الشريف",
            "عمر الألفي",
          ],
        },
      }),
    ]);
    console.log("🧹 [Seeding]: تم تنظيف الحسابات التجريبية والكيانات السابقة.");

    // 1. 👤 إنشاء المستخدمين التجريبيين لكافة الأدوار الخمسة (User Requirements Page 30)
    const customer = await User.create({
      name: "أحمد عبد العزيز",
      username: "customer",
      email: "customer@aura.com",
      password: "password123",
      phone: "+201012345678",
      nationalId: "29801011401234",
      birthDate: "1998-05-14",
      walletBalance: 250,
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
      walletBalance: 5400,
      role: "seller",
      socialLinks: {
        instagram: "https://instagram.com/townteam_official",
        facebook: "https://facebook.com/townteam.eg",
        tiktok: "https://tiktok.com/@townteam",
        website: "https://townteam.com",
      },
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
      walletBalance: 850,
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
      walletBalance: 12500,
      role: "admin",
    });

    console.log("✅ [Seeding]: تم إنشاء المستخدمين الخمسة الأساسيين بنجاح.");

    // 2. 🏢 إنشاء كيان BUSINESS والـ Branches (Figure 4.2)
    const townTeamBiz = await Business.create({
      businessId: 101,
      user: seller._id,
      businessName: "Town Team Egypt",
      businessType: "Fashion Retail & Manufacturing",
      businessModel: "B2C & Neighborhood Micro-Consolidation",
      description: "العلامة التجارية الرائدة للملابس الرجالية والشبابية العصرية في مصر بأجود خامات القطن المصري.",
      phone: "+201092242607",
      email: "info@townteam.com",
      website: "https://townteam.com",
      logo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&q=80",
      verificationStatus: "verified",
      rating: 4.9,
    });

    await Branch.create({
      branchId: 1,
      business: townTeamBiz._id,
      branchName: "فرع مول العرب - 6 أكتوبر",
      address: "مول العرب - بوابة 3 - الدور الأرضي - مدينة 6 أكتوبر",
      phone: "+20238260100",
      openingHours: "10:00 AM - 12:00 AM",
      status: "active",
    });

    await Branch.create({
      branchId: 2,
      business: townTeamBiz._id,
      branchName: "فرع شبين الكوم - المنوفية",
      address: "شارع جمال عبد الناصر - شبين الكوم - محافظة المنوفية",
      phone: "+20482230400",
      openingHours: "10:00 AM - 11:00 PM",
      status: "active",
    });

    // 3. 🏷️ إنشاء التصنيفات (Figure 4.2 CATEGORY)
    const catPolos = await Category.create({
      categoryId: 1,
      name: "T-Shirts & Polos",
      nameAr: "تيشيرتات وبولو قطن",
      description: "تيشيرتات وقمصان بولو مصنعة من أجود خامات القطن المصري طويل التيلة.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
      status: "active",
    });

    const catPants = await Category.create({
      categoryId: 2,
      name: "Pants & Chinos",
      nameAr: "بناطيل جينز وشينو وكارجو",
      description: "بناطيل جينز دينيم كلاسيكية وشينو قطنية عملية ومريحة لكافة الأوقات.",
      image: "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&q=80",
      status: "active",
    });

    const catSuits = await Category.create({
      categoryId: 3,
      name: "Suits & Blazers",
      nameAr: "بدل وبليزرات سواريه",
      description: "بليزرات وبدل رسمية بقصات إيطالية وتقفيل مصانع مصري فاخر.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
      status: "active",
    });

    const catShoes = await Category.create({
      categoryId: 4,
      name: "Footwear & Sneakers",
      nameAr: "أحذية وسنيكرز كاجوال",
      description: "أحذية جلد طبيعي مصري وسنيكرز مريحة للمشي اليومي.",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
      status: "active",
    });

    // 4. 🏷️ إنشاء البراندات المصرية (Figure 4.2 BRAND)
    const townTeam = await Brand.create({
      brandId: 1,
      name: "Town Team",
      nameAr: "تاون تيم",
      brandType: "Menswear & Casual",
      descriptionAr: "أرقى صيحات الموضة الكاجوال والرسمية المصممة خصيصاً للرجل العصري.",
      descriptionEn: "Contemporary menswear crafted with authentic Egyptian pride.",
      logoText: "TT",
      bgImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
      country: "Egypt",
      seller: seller._id,
      status: "active",
    });

    const mobaco = await Brand.create({
      brandId: 2,
      name: "Mobaco Cottons",
      nameAr: "موباكو كوتونز",
      brandType: "Luxury Egyptian Cotton",
      descriptionAr: "الاسم الأيقوني للقطن المصري الطبيعي طويل التيلة منذ عام 1974.",
      descriptionEn: "Heritage Egyptian cotton craftsmanship since 1974.",
      logoText: "MC",
      bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
      country: "Egypt",
      seller: seller._id,
      status: "active",
    });

    const concrete = await Brand.create({
      brandId: 3,
      name: "Concrete",
      nameAr: "كونكريت",
      brandType: "Formal & Tailoring",
      descriptionAr: "رمز الأناقة الكلاسيكية والتفصيل الفاخر في المجتمع المصري.",
      descriptionEn: "Sophisticated tailoring and timeless executive fashion.",
      logoText: "CC",
      bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
      country: "Egypt",
      seller: seller._id,
      status: "active",
    });

    // 5. 🌍 إنشاء مناطق الشحن (Figure 4.2 ZONE) ومواقع العملاء (LOCATION)
    const zoneOctober = await Zone.create({
      zoneId: 1,
      zoneName: "نطاق مدينة 6 أكتوبر والشيخ زايد",
      city: "6 أكتوبر",
      governorate: "الجيزة",
      deliveryFee: 35.0,
      estimatedDeliveryTime: "خلال 24 ساعة (توصيل بالحي)",
      status: "active",
    });

    const zoneMenoufia = await Zone.create({
      zoneId: 2,
      zoneName: "نطاق شبين الكوم والباجور وقويسنا",
      city: "شبين الكوم",
      governorate: "المنوفية",
      deliveryFee: 35.0,
      estimatedDeliveryTime: "خلال 48 ساعة (تجميع إقليمي)",
      status: "active",
    });

    await Location.create({
      locationId: 1,
      user: customer._id,
      address: "الحي المتميز - مجاورة 2 - عمارة 14",
      city: "6 أكتوبر",
      governorate: "الجيزة",
      latitude: 29.9723,
      longitude: 30.9412,
      locationType: "home",
    });

    // 6. 🏢 إنشاء مراكز التجميع المصغرة (Micro-Hubs)
    const hubOct = await Hub.create({
      name: "October Micro-Hub 01",
      nameAr: "مركز تجميع أكتوبر النموذجي",
      code: "HUB-OCT-01",
      governorate: "الجيزة",
      city: "6 أكتوبر",
      address: "ميدان الحصري، المحور المركزي، أمام جامعة 6 أكتوبر",
      collector: collector._id,
      latitude: 29.9723,
      longitude: 30.9412,
      active: true,
    });

    const hubMnf = await Hub.create({
      name: "Menoufia Regional Hub 02",
      nameAr: "مركز تجميع المنوفية الإقليمي",
      code: "HUB-MNF-02",
      governorate: "المنوفية",
      city: "شبين الكوم",
      address: "شارع الجلاء البحري، بجوار مجمع المصالح الحكومية",
      collector: collector._id,
      latitude: 30.5611,
      longitude: 31.0125,
      active: true,
    });

    // 7. 🚚 شركة الشحن ومركبة السائق (Figure 4.2 SHIPPING_COMPANY & VEHICLE)
    const shippingCompany = await ShippingCompany.create({
      shippingCompanyId: 1,
      companyName: "عرب أورا لوجستيكس (3ARB AURA Logistics Network)",
      phone: "+201092242607",
      email: "logistics@arab-aura.com",
      address: "المنطقة الصناعية الثالثة - 6 أكتوبر",
      website: "https://arab-aura-app.vercel.app",
      rating: 4.9,
      status: "active",
    });

    const driverVehicle = await Vehicle.create({
      vehicleId: 1,
      driver: driver._id,
      vehicleType: "Van / فان مقفل",
      plateNumber: "أ ب جـ 4589",
      brand: "Daewoo",
      model: "Carry Eco Cargo",
      modelYear: 2023,
      color: "أبيض ناصع",
      capacity: 650,
      license: "نقل تجاري خفيف سارية حتى 2027",
      status: "active",
      currentLocation: "مدينة 6 أكتوبر - المحور المركزي",
    });

    // 8. 👕 إدراج المنتجات في الكتالوج (Figure 4.2 PRODUCT)
    const productsData = [
      {
        brand: (townTeam as any)._id,
        brandName: "Town Team",
        titleAr: "تيشيرت بولو قطن مصري فاخر ناعم",
        titleEn: "Egyptian Pique Luxury Polo Shirt",
        category: "تيشيرتات وبولو قطن",
        price: 490,
        oldPrice: 650,
        sizes: ["M", "L", "XL", "XXL"],
        colors: [
          { nameAr: "كحلي ملكي", nameEn: "Royal Navy", hex: "#1B2A4A" },
          { nameAr: "أبيض ناصع", nameEn: "Crisp White", hex: "#FFFFFF" },
          { nameAr: "زيتي غامق", nameEn: "Olive Green", hex: "#4A5D4E" },
        ],
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
        additionalImages: [
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
        ],
        badgeAr: "الأكثر مبيعاً 🔥",
        badgeEn: "Best Seller",
        descriptionAr: "نسيج بيكيه قطني مصري طبيعي 100% يوفر تهوية ممتازة وراحة استثنائية طوال اليوم.",
        descriptionEn: "100% Authentic Egyptian long-staple cotton pique with premium breathability.",
        stock: 85,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "قطن جيزة 94 مصري أصيل",
      },
      {
        brand: (townTeam as any)._id,
        brandName: "Town Team",
        titleAr: "بنطلون جينز كلاسيك سليم فيت أزرق داكن",
        titleEn: "Classic Slim-Fit Dark Indigo Denim",
        category: "بناطيل جينز وشينو وكارجو",
        price: 680,
        oldPrice: 850,
        sizes: ["30", "32", "34", "36", "38"],
        colors: [
          { nameAr: "أزرق حبري", nameEn: "Deep Indigo", hex: "#1A2E40" },
          { nameAr: "أزرق ثلجي", nameEn: "Ice Blue", hex: "#6C8EA4" },
        ],
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&q=80",
        additionalImages: [
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
        ],
        badgeAr: "عرض التوفير",
        badgeEn: "Great Deal",
        descriptionAr: "دينيم عالي الجودة مع نسبة ليكرا خفيفة لمرونة الحركة وثبات اللون بعد الغسيل المتكرر.",
        descriptionEn: "Heavyweight stretch denim woven in Egypt for maximum mobility.",
        stock: 60,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "قطن دينيم مع إيلاستين 2%",
      },
      {
        brand: (mobaco as any)._id,
        brandName: "Mobaco Cottons",
        titleAr: "قميص كتان طبيعي بيج أنيق كاجوال",
        titleEn: "Bespoke Pure Egyptian Linen Shirt",
        category: "قمصان كاجوال ورسمية",
        price: 890,
        oldPrice: 1100,
        sizes: ["S", "M", "L", "XL"],
        colors: [
          { nameAr: "بيج رملي", nameEn: "Sand Beige", hex: "#D4B996" },
          { nameAr: "أبيض قطني", nameEn: "Cotton White", hex: "#F8F9FA" },
        ],
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
        additionalImages: [
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        ],
        badgeAr: "خامة فاخرة 🌿",
        badgeEn: "Pure Linen",
        descriptionAr: "كتان مصري طبيعي خالص معالج بنعومة فائقة ليمنحك شعوراً بالانتعاش الدائم والأناقة الصيفية.",
        descriptionEn: "Master-crafted from locally harvested Egyptian flax fibers.",
        stock: 40,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "كتان مصري طبيعي 100%",
      },
      {
        brand: (concrete as any)._id,
        brandName: "Concrete",
        titleAr: "بليزر كاجوال عصري كحلي بأزرار قرن طبيعي",
        titleEn: "Modern Tailored Navy Executive Blazer",
        category: "بدل وبليزرات سواريه",
        price: 1850,
        oldPrice: 2400,
        sizes: ["48", "50", "52", "54", "56"],
        colors: [
          { nameAr: "كحلي فحمي", nameEn: "Charcoal Navy", hex: "#16202C" },
          { nameAr: "رمادي داكن", nameEn: "Dark Slate", hex: "#2E3B4E" },
        ],
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
        additionalImages: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
        ],
        badgeAr: "مجموعة السهرات 👔",
        badgeEn: "Executive",
        descriptionAr: "تصميم إيطالي بقصة مضبوطة بالمللي مع بطانة حريرية فاخرة وخياطة مزدوجة متينة.",
        descriptionEn: "Italian tailored blazer made with Egyptian textiles.",
        stock: 25,
        deliveryTime: "خلال 24 ساعة",
        city: "6 أكتوبر",
        material: "صوف خفيف مخلوط بألياف قطنية",
      },
    ];

    const insertedProducts: any[] = [];
    for (const p of productsData) {
      const prod = await Product.create(p);
      insertedProducts.push(prod);
    }
    console.log("✅ [Seeding]: تم إدراج المنتجات في قاعدة البيانات.");

    // 9. 📦 إنشاء الطلبات، الشحنات، والمدفوعات (Figure 4.2 ORDER, SHIPMENT, PAYMENT)
    const now = new Date();
    const dMinus = (days: number) =>
      new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const ordersData: any[] = [
      {
        orderNumber: "ORD-9824",
        customer: customer._id,
        customerName: "أحمد عبد العزيز",
        customerPhone: "+201012345678",
        governorate: "الجيزة",
        city: "6 أكتوبر",
        address: "الحي المتميز - عمارة 14",
        shippingType: "standard",
        shippingFee: 35.0,
        itemsTotal: 490,
        totalAmount: 525,
        paymentMethod: "cod",
        paymentStatus: "unpaid",
        status: "out_for_delivery",
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
            product: insertedProducts[0]._id,
            productTitle: "تيشيرت بولو قطن مصري فاخر ناعم",
            brandName: "Town Team",
            unitPrice: 490,
            quantity: 1,
            size: "L",
            color: "كحلي ملكي",
            imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
          },
        ],
        createdAt: dMinus(0),
      },
      {
        orderNumber: "ORD-9821",
        customer: customer._id,
        customerName: "سارة خالد الشريف",
        customerPhone: "+201122334455",
        governorate: "المنوفية",
        city: "شبين الكوم",
        address: "شارع جمال عبد الناصر - برج الزهور",
        shippingType: "standard",
        shippingFee: 35.0,
        itemsTotal: 1570,
        totalAmount: 1605,
        paymentMethod: "instapay",
        paymentStatus: "paid",
        status: "collected_in_hub",
        otpCode: "9134",
        packageId: "PKG-POOL-MONUF-02",
        hub: hubMnf._id,
        items: [
          {
            product: insertedProducts[1]._id,
            productTitle: "بنطلون جينز كلاسيك سليم فيت أزرق داكن",
            brandName: "Town Team",
            unitPrice: 680,
            quantity: 1,
            size: "32",
            color: "أزرق حبري",
            imageUrl: "https://images.unsplash.com/photo-1542272604-780c96856592?w=600&q=80",
          },
          {
            product: insertedProducts[2]._id,
            productTitle: "قميص كتان طبيعي بيج أنيق كاجوال",
            brandName: "Mobaco Cottons",
            unitPrice: 890,
            quantity: 1,
            size: "M",
            color: "بيج رملي",
            imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
          },
        ],
        createdAt: dMinus(1),
      },
    ];

    for (const o of ordersData) {
      const createdOrder: any = await Order.create(o);

      // ربط كل طلب بكيان الدفع (PAYMENT)
      await Payment.create({
        order: createdOrder._id,
        paymentMethod: createdOrder.paymentMethod,
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: createdOrder.totalAmount,
        status: createdOrder.paymentStatus === "paid" ? "completed" : "pending",
      });

      // ربط كل طلب بكيان الشحنة (SHIPMENT)
      await Shipment.create({
        order: createdOrder._id,
        shippingCompany: shippingCompany._id,
        driver: driver._id,
        vehicle: (driverVehicle as any)._id,
        trackingNumber: `TRK-${createdOrder.orderNumber.replace("ORD-", "")}-EG`,
        shippingStatus:
          createdOrder.status === "out_for_delivery"
            ? "in_transit"
            : createdOrder.status === "delivered"
            ? "delivered"
            : "assigned",
        shippingFee: createdOrder.shippingFee,
        pickupLocation: createdOrder.city,
        deliveryLocation: createdOrder.address,
        estimatedDelivery: new Date(Date.now() + 24 * 3600 * 1000),
      });
    }

    // 10. ⭐ إنشاء المراجعات والتقييمات (Figure 4.3 REVIEW)
    await Review.create({
      reviewId: 1,
      user: customer._id,
      product: insertedProducts[0]._id,
      rating: 5,
      comment: "خامة القطن ممتازة جداً والمقاس مظبوط بالمللي. التوصيل وصل في أقل من 24 ساعة بميزة المعاينة عند الباب!",
    });

    // 11. 👁️ إنشاء سجلات التعرف على الصور بالذكاء الاصطناعي (Figure 4.3 OBJECT_RECOGNITION)
    await ObjectRecognition.create({
      recognitionId: 1,
      product: insertedProducts[0]._id,
      user: customer._id,
      objectName: "Polo T-Shirt (Short Sleeve)",
      confidence: 0.984,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
      detectedLabels: ["Polo Shirt", "Menswear", "Cotton Fabric", "Navy Blue"],
    });

    console.log("✅ [Seeding]: تم ربط الكيانات وتوليد المدفوعات والشحنات وسجلات الذكاء الاصطناعي.");
    console.log(`
    ══════════════════════════════════════════════════════════
    🎉 تم ملء وتوثيق قاعدة بيانات مشروع التخرج بنجاح تام!
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
