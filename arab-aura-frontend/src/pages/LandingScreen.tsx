import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { usePlatform } from "../context/PlatformContext";
import BrandLogo from "../components/BrandLogo";
import GlobalFooter from "../components/GlobalFooter";
import {
  SearchIcon,
  SunIcon,
  MoonIcon,
  PackageIcon,
  BuildingIcon,
  CartIcon,
  UserIcon,
  CloseIcon,
  CheckCircleIcon,
} from "../components/Icons";

interface ColorOption {
  nameAr: string;
  nameEn: string;
  hex: string;
}

interface Product {
  id: string;
  brandId: string;
  brandName: string;
  titleAr: string;
  titleEn: string;
  category: string;
  price: number;
  oldPrice?: number;
  sizes: string[];
  colors: ColorOption[];
  rating: number;
  image: string;
  additionalImages: string[];
  badgeAr?: string;
  badgeEn?: string;
  descriptionAr: string;
  descriptionEn: string;
}

interface CartItem extends Product {
  selectedSize: string;
  selectedColor: ColorOption;
  quantity: number;
}

interface Brand {
  id: string;
  name: string;
  descriptionAr: string;
  descriptionEn: string;
  bgImage: string;
  logoText: string;
}

const LandingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const { placeOrder } = usePlatform();

  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"products" | "brands" | "orders">(
    "products",
  );

  const [selectedProductDetails, setSelectedProductDetails] =
    useState<Product | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string>("");
  const [tempSize, setTempSize] = useState<string>("");
  const [tempColor, setTempColor] = useState<ColorOption | null>(null);

  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [guestOrderData, setGuestOrderData] = useState({
    fullName: "",
    phone: "",
    city: "القاهرة",
    address: "",
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // 🏢 البراندات مع روابط صور خلفيات مستقرة ومضمونة 100%
  const brandsList: Brand[] = [
    {
      id: "b-townteam",
      name: "Town Team",
      descriptionAr:
        "أرقى صيحات الموضة الكاجوال والرسمية المصممة خصيصاً للرجل العصري.",
      descriptionEn:
        "The finest casual and formal fashion tailored for the modern man.",
      bgImage:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80",
      logoText: "TOWN TEAM",
    },
    {
      id: "b-concrete",
      name: "Concrete",
      descriptionAr:
        "الفخامة المصرية الخالصة وأجود ألياف القطن العالمي لإطلالة لا تُضاهى.",
      descriptionEn:
        "Pure Egyptian luxury and world-class cotton for an unmatched look.",
      bgImage:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
      logoText: "CONCRETE",
    },
    {
      id: "b-ravin",
      name: "RAVIN",
      descriptionAr:
        "تصميمات جريئة وعصرية تُلهم أصحاب الأذواق الرفيعة والشباب.",
      descriptionEn:
        "Bold and trendy designs inspiring youth and refined tastes.",
      bgImage:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80",
      logoText: "RAVIN",
    },
    {
      id: "b-mobaco",
      name: "Mobaco Cottons",
      descriptionAr: "كلاسيكية راقية وأناقة متميزة تعكس عراقة القطن المصري.",
      descriptionEn:
        "Timeless class and distinct elegance reflecting Egyptian cotton heritage.",
      bgImage:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop&q=80",
      logoText: "MOBACO",
    },
  ];

  useEffect(() => {
    if (!showWelcomeScreen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % brandsList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showWelcomeScreen, brandsList.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const catalogTemplates = [
    {
      category: "men_tshirts",
      titleAr: "تيشيرت بولو قطن مطرز كاجوال",
      titleEn: "Embroidered Cotton Polo T-Shirt",
      descriptionAr:
        "تيشيرت بولو رجالي مصمم من أجود ألياف القطن المصري مع ياقة مقواة وأزرار أنيقة.",
      descriptionEn:
        "Mens polo shirt made of fine Egyptian cotton featuring a reinforced collar.",
      basePrice: 550,
      images: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
      ],
    },
    {
      category: "women_tshirts",
      titleAr: "تيشيرت نسائي صيفي مطبوع",
      titleEn: "Womens Printed Summer T-Shirt",
      descriptionAr:
        "تيشيرت نسائي مريح بتصميم عصري يناسب الأجواء الصيفية ويمنحك إطلالة حيوية.",
      descriptionEn:
        "Comfortable womens summer t-shirt with a modern printed design.",
      basePrice: 480,
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
      ],
    },
    {
      category: "men_pants",
      titleAr: "بنطلون جينز أزرق داكن Slim Fit",
      titleEn: "Dark Blue Slim-Fit Jeans",
      descriptionAr:
        "بنطلون جينز مرن ومريح للغاية، بقصة عصرية تناسب قوامك وتمنحك حرية الحركة.",
      descriptionEn:
        "Flexible and comfortable denim jeans with a modern slim fit cut.",
      basePrice: 890,
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
      ],
    },
    {
      category: "women_shoes",
      titleAr: "حذاء نسائي أنيق بكعب عالي",
      titleEn: "Womens Elegant High-Heel Shoes",
      descriptionAr:
        "حذاء نسائي فاخر بتصميم عصري يمنحك ثقة وثباتاً مع مظهر جذاب.",
      descriptionEn: "Luxurious womens high heel shoes designed for parties.",
      basePrice: 1350,
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
        "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600&q=80",
      ],
    },
  ];

  const productsList: Product[] = Array.from({ length: 110 }, (_, index) => {
    const template = catalogTemplates[index % catalogTemplates.length];
    const brand = brandsList[index % brandsList.length];
    const itemNumber = Math.floor(index / catalogTemplates.length) + 1;

    return {
      id: `prod-${index + 1}`,
      brandId: brand.id,
      brandName: brand.name,
      titleAr: `${template.titleAr} ${brand.name} (${itemNumber})`,
      titleEn: `${template.titleEn} ${brand.name} (${itemNumber})`,
      category: template.category,
      price: template.basePrice + (index % 5) * 45,
      oldPrice: template.basePrice + (index % 5) * 45 + 250,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { nameAr: "أبيض قطني", nameEn: "Cotton White", hex: "#FFFFFF" },
        { nameAr: "كحلي داكن", nameEn: "Dark Navy", hex: "#1B2A4A" },
        { nameAr: "رمادي هادئ", nameEn: "Muted Grey", hex: "#4A5568" },
      ],
      rating: 5,
      image: template.images[0],
      additionalImages: template.images,
      badgeAr: index % 4 === 0 ? "الأكثر مبيعاً" : undefined,
      badgeEn: index % 4 === 0 ? "Best Seller" : undefined,
      descriptionAr: template.descriptionAr,
      descriptionEn: template.descriptionEn,
    };
  });

  const t = {
    ar: {
      exploreBtn: "استكشف المعرض الآن",
      searchPlaceholder: "ابحث عن منتج، براند، أو تصميم...",
      loginBtn: "تسجيل الدخول",
      registerBtn: "إنشاء حساب",
      categories: [
        { id: "all", label: "الكل (110+)" },
        { id: "men_tshirts", label: "تيشيرتات رجالي" },
        { id: "women_tshirts", label: "تيشيرتات حريمي" },
        { id: "men_pants", label: "بنطلونات رجالي" },
        { id: "women_pants", label: "بنطلونات حريمي" },
        { id: "men_shirts", label: "أقمصة رجالي" },
        { id: "women_shirts", label: "أقمصة حريمي" },
        { id: "men_shoes", label: "أحذية رجالي" },
        { id: "women_shoes", label: "أحذية حريمي" },
      ],
      sidebar: {
        products: "المنتجات والمعرض",
        brands: "البراندات المصرية",
        orders: "السلة والطلبات",
      },
      addToCart: "إضافة للسلة",
    },
    en: {
      exploreBtn: "Explore Collection",
      searchPlaceholder: "Search for products, brands...",
      loginBtn: "Sign In",
      registerBtn: "Sign Up",
      categories: [
        { id: "all", label: "All (110+)" },
        { id: "men_tshirts", label: "Men T-Shirts" },
        { id: "women_tshirts", label: "Women T-Shirts" },
        { id: "men_pants", label: "Men Pants" },
        { id: "women_pants", label: "Women Pants" },
        { id: "men_shirts", label: "Men Shirts" },
        { id: "women_shirts", label: "Women Shirts" },
        { id: "men_shoes", label: "Men Shoes" },
        { id: "women_shoes", label: "Women Shoes" },
      ],
      sidebar: {
        products: "Products & Shop",
        brands: "Egyptian Brands",
        orders: "Cart & Orders",
      },
      addToCart: "Add To Cart",
    },
  };

  const currentText = t[lang];

  const filteredProducts = productsList.filter((prod) => {
    const matchesSearch =
      prod.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brandName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || prod.category === selectedCategory;
    const matchesBrand =
      !selectedBrandFilter || prod.brandId === selectedBrandFilter;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleOpenProduct = (product: Product) => {
    setSelectedProductDetails(product);
    setActivePreviewImage(product.image);
    setTempSize(product.sizes[0] || "");
    setTempColor(product.colors[0] || null);
  };

  const handleAddToCartFromDetails = () => {
    if (!selectedProductDetails || !tempColor) return;
    const newItem: CartItem = {
      ...selectedProductDetails,
      selectedSize: tempSize,
      selectedColor: tempColor,
      quantity: 1,
    };
    setCartItems([...cartItems, newItem]);
    setSelectedProductDetails(null);
    alert(
      lang === "ar"
        ? `تم إضافة "${newItem.titleAr}" للسلة بنجاح!`
        : `Added to cart!`,
    );
  };

  const handleConfirmGuestOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !guestOrderData.fullName ||
      !guestOrderData.phone ||
      !guestOrderData.address
    ) {
      alert(
        lang === "ar"
          ? "برجاء استكمال جميع البيانات الأساسية!"
          : "Please fill out all required fields!",
      );
      return;
    }

    const itemsTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const newPlacedOrder = placeOrder({
      items: cartItems.map((item) => ({
        id: `item-${Date.now()}-${item.id}`,
        productId: item.id,
        productTitle: lang === "ar" ? item.titleAr : item.titleEn,
        unitPrice: item.price,
        qty: item.quantity,
        brandName: item.brandName,
        size: item.selectedSize || "L",
        color: item.selectedColor?.nameAr || "أزرق",
        imageUrl: item.image,
      })),
      shippingType: "standard",
      shippingAddress: {
        fullName: guestOrderData.fullName,
        phone: guestOrderData.phone,
        governorate: guestOrderData.city,
        city: guestOrderData.city,
        address: guestOrderData.address,
      },
      payment: {
        method: "cod",
        totalAmount: itemsTotal + 35,
      },
    });

    alert(
      lang === "ar"
        ? `تم تأكيد طلبك بنجاح برقم: (${newPlacedOrder.id})!\nشكراً لك يا ${guestOrderData.fullName}، الشحنة الآن قيد الإعداد.\nسيتم التواصل معك على (${guestOrderData.phone}).\nطريقة الدفع: الدفع عند الاستلام (COD).`
        : `Order confirmed successfully with ID: (${newPlacedOrder.id})!\nThank you ${guestOrderData.fullName}, your order is being prepared.`,
    );
    setCartItems([]);
    setShowCheckoutModal(false);
  };

  if (showWelcomeScreen) {
    const activeBrand = brandsList[currentSlide];

    return (
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="min-h-screen font-sans relative flex flex-col items-center justify-center p-6 text-white overflow-hidden"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
          body { font-family: ${lang === "ar" ? "'Cairo', sans-serif" : "'Outfit', sans-serif"}; }
        `}</style>

        <div className="absolute inset-0 z-0">
          <img
            src={activeBrand.bgImage}
            alt={activeBrand.name}
            className="w-full h-full object-cover transition-all duration-1000 scale-105 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50 backdrop-blur-[1px]"></div>
        </div>

        {/* الشريط العلوي لصفحة الترحيب - ظاهرة دائماً للأزرار */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center max-w-7xl mx-auto z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="px-3.5 py-1.5 border border-white/20 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-amber-300 hover:bg-white/20 transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-300" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-200" />}
              <span>{isDarkMode ? "فاتح" : "داكن"}</span>
            </button>
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 border border-white/20 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition shadow-lg cursor-pointer"
            >
              {lang === "ar" ? "English" : "عربي"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md backdrop-blur-md transition cursor-pointer border border-white/10"
            >
              {currentText.loginBtn}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              {currentText.registerBtn}
            </button>
          </div>
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-4 mt-12">
          <div className="flex justify-center mb-2">
            <div className="bg-white/95 p-5 rounded-[28px] shadow-2xl backdrop-blur-xl border border-white/20">
              <BrandLogo showText={false} />
            </div>
          </div>

          <div className="space-y-4 transition-all duration-700">
            <span className="px-5 py-1.5 bg-amber-400 text-slate-950 font-black rounded-full text-xs tracking-wider inline-block shadow-lg">
              ✨ {activeBrand.name}
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-relaxed text-slate-100">
              {lang === "ar"
                ? activeBrand.descriptionAr
                : activeBrand.descriptionEn}
            </h1>
          </div>

          <div className="flex justify-center items-center gap-2 pt-2">
            {brandsList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "w-10 bg-amber-400 shadow-md"
                    : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          <div className="pt-6">
            <button
              onClick={() => setShowWelcomeScreen(false)}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all duration-300 text-xs md:text-sm tracking-wide cursor-pointer"
            >
              {currentText.exploreBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#0F172A] text-slate-100"
          : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: ${lang === "ar" ? "'Cairo', sans-serif" : "'Outfit', sans-serif"}; }
        .notch-card { border-radius: 20px; position: relative; }
        .notch-badge {
          position: absolute; top: 12px; right: 16px;
          background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px);
          padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 800;
          color: #1E293B; box-shadow: 0 2px 6px rgba(0,0,0,0.05); z-index: 10;
        }
      `}</style>

      {/* 🔝 النافبار العلوي المتجاوب */}
      <header
        className={`sticky top-0 z-50 border-b shadow-sm transition-all duration-300 ${
          isDarkMode
            ? "bg-[#1E293B] border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="py-2.5 sm:py-3">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                onClick={() => setShowWelcomeScreen(true)}
                className="cursor-pointer flex items-center"
                title="العودة لواجهة الترحيب"
              >
                <BrandLogo showText={true} />
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-3">
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 border rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isDarkMode
                    ? "bg-[#0F172A] border-slate-700 text-amber-400"
                    : "bg-slate-100 border-slate-200 text-slate-800"
                }`}
              >
                {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
              </button>

              <button
                onClick={toggleLanguage}
                className={`px-2.5 sm:px-3 py-1 border rounded-full text-xs font-bold transition ${
                  isDarkMode
                    ? "bg-[#0F172A] border-slate-700 text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-800"
                }`}
              >
                {lang === "ar" ? "EN" : "عربي"}
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => navigate("/login")}
                  className="px-2.5 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-xs shadow-sm transition cursor-pointer"
                >
                  {currentText.loginBtn}
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-2.5 sm:px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-full text-xs shadow-sm transition cursor-pointer"
                >
                  {currentText.registerBtn}
                </button>
              </div>
            </div>

            <div className="w-full md:flex-1 md:max-w-md relative flex items-center gap-2 order-3 md:order-2 mt-1 md:mt-0">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={currentText.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-full px-9 py-2 text-xs focus:outline-none transition ${
                    isDarkMode
                      ? "bg-[#0F172A] border-slate-700 text-white focus:border-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400"
                  }`}
                />
                <span className="absolute left-3 rtl:right-3 rtl:left-auto top-2.5 text-slate-400 pointer-events-none">
                  <SearchIcon className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* شريط الأقسام */}
        <div
          className={`border-t transition-colors ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200"}`}
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2 text-xs font-bold overflow-x-auto scrollbar-none">
            {currentText.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveTab("products");
                }}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white font-black"
                    : isDarkMode
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={() => navigate("/about")}
              className="px-3.5 py-1.5 rounded-xl text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition font-black whitespace-nowrap cursor-pointer shrink-0"
            >
              {lang === "ar" ? "من نحن وقصة الابتكار" : "About Us"}
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي للمتجر */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 mt-2 pb-24 md:pb-6">
        <aside
          className={`border rounded-2xl p-3 flex-col gap-2 shrink-0 shadow-sm transition-all duration-300 md:sticky md:top-20 h-fit hidden md:flex md:w-60 ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200"}`}
        >
          <button
            onClick={() => {
              setSelectedBrandFilter(null);
              setActiveTab("products");
            }}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "products"
                ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <PackageIcon className="w-4 h-4" />
            <span>{currentText.sidebar.products}</span>
          </button>

          <button
            onClick={() => setActiveTab("brands")}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "brands"
                ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BuildingIcon className="w-4 h-4" />
            <span>{currentText.sidebar.brands}</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CartIcon className="w-4 h-4" />
            <span>{currentText.sidebar.orders}</span>
            {cartItems.length > 0 && (
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black ml-auto">
                {cartItems.length}
              </span>
            )}
          </button>
        </aside>

        <section className="flex-1">
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3 border-slate-200/60">
                <h2
                  className={`text-lg font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {lang === "ar" ? "معرض المنتجات" : "Products Marketplace"}
                </h2>
                <span className="text-xs font-bold text-slate-500">
                  {filteredProducts.length}{" "}
                  {lang === "ar" ? "منتج متوفر" : "Items"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`notch-card border shadow-sm hover:shadow-md transition duration-300 p-2.5 sm:p-4 flex flex-col justify-between ${
                      isDarkMode
                        ? "bg-[#1E293B] border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <span className="notch-badge !text-[9px] sm:!text-[11px] !px-2 sm:!px-3 !py-0.5 sm:!py-1">{product.brandName}</span>

                    <div
                      className="space-y-2 sm:space-y-3 cursor-pointer"
                      onClick={() => handleOpenProduct(product)}
                    >
                      <div className="relative h-36 sm:h-52 md:h-60 w-full rounded-xl overflow-hidden mt-1 bg-slate-100">
                        <img
                          src={product.image}
                          alt={product.titleAr}
                          className="w-full h-full object-cover rounded-xl hover:scale-105 transition duration-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-2">
                          <h3
                            className={`text-[11px] sm:text-xs font-bold leading-snug line-clamp-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            {lang === "ar" ? product.titleAr : product.titleEn}
                          </h3>
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-black text-slate-900 bg-slate-100 rounded-lg shrink-0 font-mono">
                            {product.price.toFixed(0)} LE
                          </span>
                        </div>
                        <p
                          className={`text-[11px] line-clamp-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {lang === "ar"
                            ? product.descriptionAr
                            : product.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-3">
                      <button
                        onClick={() => handleOpenProduct(product)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow-sm flex items-center justify-center gap-2"
                      >
                        {currentText.addToCart}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "brands" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandsList.map((b) => (
                <div
                  key={b.id}
                  className="relative h-52 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-slate-200"
                  onClick={() => {
                    setSelectedBrandFilter(b.id);
                    setActiveTab("products");
                  }}
                >
                  <img
                    src={b.bgImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 p-6 flex flex-col justify-end text-white">
                    <h3 className="text-xl font-black">{b.name}</h3>
                    <p className="text-xs">
                      {lang === "ar" ? b.descriptionAr : b.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "orders" && (
            <div
              className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? "bg-[#1E293B] border-slate-700" : "bg-white border-slate-200"}`}
            >
              <h2
                className={`text-lg font-black border-b pb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {lang === "ar"
                  ? "سلة التسوق والتنفيذ السريع"
                  : "Cart & Quick Checkout"}
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold">
                  {lang === "ar"
                    ? "سلة التسوق فارغة حالياً!"
                    : "Your cart is empty!"}
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs ${
                        isDarkMode
                          ? "bg-[#0F172A] border-slate-700"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <img
                          src={item.image}
                          alt=""
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="space-y-1">
                          <p
                            className={`font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            {lang === "ar" ? item.titleAr : item.titleEn}
                          </p>
                          <div className="flex gap-3 text-[11px] text-slate-500">
                            <span>
                              المقاس: <strong>{item.selectedSize}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              اللون:
                              <span
                                className="w-3 h-3 rounded-full border border-slate-400 inline-block"
                                style={{
                                  backgroundColor: item.selectedColor.hex,
                                }}
                              ></span>
                              <strong>{item.selectedColor.nameAr}</strong>
                            </span>
                          </div>
                          <span className="font-mono font-bold block text-slate-900 dark:text-slate-100">
                            {item.price.toFixed(2)} EGP
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setCartItems(cartItems.filter((_, i) => i !== idx))
                        }
                        className="text-rose-500 hover:underline font-bold"
                      >
                        {lang === "ar" ? "حذف" : "Remove"}
                      </button>
                    </div>
                  ))}

                  <div className="pt-4 border-t flex justify-between items-center font-bold">
                    <span>{lang === "ar" ? "الإجمالي:" : "Total:"}</span>
                    <span className="text-lg font-black font-mono">
                      {cartItems
                        .reduce((acc, curr) => acc + curr.price, 0)
                        .toFixed(2)}{" "}
                      EGP
                    </span>
                  </div>

                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition text-xs shadow-sm cursor-pointer"
                  >
                    {lang === "ar"
                      ? "تأكيد الطلب (الدفع عند الاستلام)"
                      : "Checkout (Cash on Delivery)"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 🔍 نافذة تفاصيل المنتج */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`max-w-2xl w-full rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode ? "bg-[#1E293B] text-white" : "bg-white text-slate-900"
            }`}
          >
            <button
              onClick={() => setSelectedProductDetails(null)}
              className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-64 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={activePreviewImage || selectedProductDetails.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedProductDetails.additionalImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      onClick={() => setActivePreviewImage(img)}
                      className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 ${
                        activePreviewImage === img
                          ? "border-amber-400"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    {selectedProductDetails.brandName}
                  </span>
                  <h3 className="text-base font-black mt-1">
                    {lang === "ar"
                      ? selectedProductDetails.titleAr
                      : selectedProductDetails.titleEn}
                  </h3>
                  <span className="text-lg font-black font-mono mt-2 block text-slate-900 dark:text-slate-100">
                    {selectedProductDetails.price.toFixed(2)} EGP
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {lang === "ar"
                      ? selectedProductDetails.descriptionAr
                      : selectedProductDetails.descriptionEn}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">
                      {lang === "ar" ? "المقاس:" : "Size:"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProductDetails.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setTempSize(s)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                            tempSize === s
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">
                      {lang === "ar" ? "اللون:" : "Color:"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProductDetails.colors.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setTempColor(c)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                            tempColor?.hex === c.hex
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-400 inline-block"
                            style={{ backgroundColor: c.hex }}
                          ></span>
                          {lang === "ar" ? c.nameAr : c.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCartFromDetails}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CartIcon className="w-4 h-4" />
                    <span>{currentText.addToCart}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💳 نافذة تأكيد طلب الزائر */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 ${
              isDarkMode ? "bg-[#1E293B] text-white" : "bg-white text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black">
                {lang === "ar" ? "بيانات الشحن والتسليم" : "Shipping Details"}
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmGuestOrder}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold block mb-1">
                  {lang === "ar" ? "الاسم بالكامل:" : "Full Name:"}
                </label>
                <input
                  type="text"
                  required
                  value={guestOrderData.fullName}
                  onChange={(e) =>
                    setGuestOrderData({
                      ...guestOrderData,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 outline-none"
                  placeholder="مثال: عبد الرازق رضا"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {lang === "ar" ? "رقم الهاتف للتواصل:" : "Phone Number:"}
                </label>
                <input
                  type="tel"
                  required
                  value={guestOrderData.phone}
                  onChange={(e) =>
                    setGuestOrderData({
                      ...guestOrderData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 outline-none"
                  placeholder="010xxxxxxx"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {lang === "ar" ? "المحافظة:" : "City:"}
                </label>
                <select
                  value={guestOrderData.city}
                  onChange={(e) =>
                    setGuestOrderData({
                      ...guestOrderData,
                      city: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 outline-none"
                >
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="المنوفية">المنوفية</option>
                  <option value="بقية المحافظات">بقية المحافظات</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {lang === "ar" ? "العنوان بالتفصيل:" : "Detailed Address:"}
                </label>
                <textarea
                  required
                  rows={2}
                  value={guestOrderData.address}
                  onChange={(e) =>
                    setGuestOrderData({
                      ...guestOrderData,
                      address: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 outline-none"
                  placeholder="اسم الشارع، رقم العمارة، الدور..."
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-[11px] font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>الدفع: نقداً عند الاستلام (Cash on Delivery) بعد المعاينة.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>{lang === "ar" ? "تأكيد الطلب الآن" : "Confirm Order Now"}</span>
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📱 شريط التنقل السفلي الاحترافي للموبايل في واجهة المتجر */}
      <nav
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-lg flex items-center justify-around py-2 px-1 transition-all ${
          isDarkMode
            ? "bg-[#1E293B]/95 border-slate-700 text-white"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-lg"
        }`}
      >
        <button
          onClick={() => {
            setSelectedBrandFilter(null);
            setActiveTab("products");
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "products"
              ? "text-amber-500 font-black"
              : "text-slate-400 font-medium"
          }`}
        >
          <PackageIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">{currentText.sidebar.products}</span>
        </button>

        <button
          onClick={() => setActiveTab("brands")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "brands"
              ? "text-amber-500 font-black"
              : "text-slate-400 font-medium"
          }`}
        >
          <BuildingIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">{currentText.sidebar.brands}</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer relative ${
            activeTab === "orders"
              ? "text-rose-500 font-black"
              : "text-slate-400 font-medium"
          }`}
        >
          <CartIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">{currentText.sidebar.orders}</span>
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition text-slate-400 font-medium hover:text-amber-500 cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">{currentText.loginBtn}</span>
        </button>
      </nav>

      {/* 🔹 الفوتر الموحد للمنصة */}
      <GlobalFooter />
    </div>
  );
};

export default LandingScreen;
