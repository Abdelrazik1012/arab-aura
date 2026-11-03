import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import GlobalFooter from "../../components/GlobalFooter";
import {
  FilterIcon,
  SearchIcon,
  CartIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  PackageIcon,
  BuildingIcon,
  WalletIcon,
  BellIcon,
  StarIcon,
  CheckIcon,
  SparklesIcon,
  LightningIcon,
} from "../../components/Icons";

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
  deliveryTime: string; // وقت التوصيل (مثلاً: غداً، خلال 3 أيام)
  city: string; // مكان التوصيل
  shippingType?: "express" | "economy";
  material?: string;
  badgeAr?: string;
  badgeEn?: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const CustomerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<
    "products" | "brands" | "orders" | "wallet" | "notifications" | "reviews"
  >("products");

  // 🎛️ خيارات الفلاتر المتقدمة والشاملة الاحترافية
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterSize, setFilterSize] = useState<string>("all");
  const [filterColor, setFilterColor] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterShipping, setFilterShipping] = useState<string>("all");
  const [filterMaterial, setFilterMaterial] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number>(100);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [minRating, setMinRating] = useState<number>(0);

  const resetAllFilters = () => {
    setFilterBrand("all");
    setFilterSize("all");
    setFilterColor("all");
    setFilterCity("all");
    setFilterShipping("all");
    setFilterMaterial("all");
    setMinPrice(100);
    setMaxPrice(2500);
    setMinRating(0);
    setSelectedCategory("all");
    setSearchQuery("");
  };

  const placeholderImg =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

  const brandsList = [
    {
      id: "b-townteam",
      name: "Town Team",
      logo: "TOWN TEAM",
      bgImage:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
      descAr: "أزياء رجالية كاجوال ورسمية فائقة الأناقة",
      descEn: "Stylish casual and formal menswear",
    },
    {
      id: "b-concrete",
      name: "Concrete",
      logo: "CONCRETE",
      bgImage:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
      descAr: "الفخامة المصرية وأجود خامات القطن الفاخر",
      descEn: "Egyptian luxury and premium cotton",
    },
    {
      id: "b-zara",
      name: "ZARA",
      logo: "ZARA",
      bgImage:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
      descAr: "أحدث صيحات الموضة العالمية العصرية",
      descEn: "Latest global high-street fashion trends",
    },
    {
      id: "b-hm",
      name: "H&M",
      logo: "H&M",
      bgImage:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80",
      descAr: "تشكيلة متكاملة تناسب كل أفراد العائلة",
      descEn: "Sustainable fashion for the whole family",
    },
    {
      id: "b-ravin",
      name: "RAVIN",
      logo: "RAVIN",
      bgImage:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop&q=80",
      descAr: "تصاميم شبابية جريئة وعصرية",
      descEn: "Bold & trendy youth fashion",
    },
    {
      id: "b-mobaco",
      name: "Mobaco Cottons",
      logo: "MOBACO",
      bgImage:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80",
      descAr: "عراقة الكلاسيك وأصالة القطن المصري",
      descEn: "Timeless classic Egyptian cottons",
    },
  ];

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
      ],
    },
  ];

  const colorPalettes: ColorOption[][] = [
    [
      { nameAr: "أبيض قطني", nameEn: "Cotton White", hex: "#FFFFFF" },
      { nameAr: "كحلي داكن", nameEn: "Dark Navy", hex: "#1B2A4A" },
      { nameAr: "أسود ملكي", nameEn: "Royal Black", hex: "#0F172A" },
    ],
    [
      { nameAr: "بيج رملي", nameEn: "Sand Beige", hex: "#D6C4A6" },
      { nameAr: "رمادي هادئ", nameEn: "Cool Gray", hex: "#71717A" },
      { nameAr: "زيتي داكن", nameEn: "Deep Olive", hex: "#434E38" },
    ],
    [
      { nameAr: "نبيتي فخم", nameEn: "Burgundy", hex: "#7E1D2D" },
      { nameAr: "أزرق كلاسيك", nameEn: "Classic Blue", hex: "#2563EB" },
      { nameAr: "أسود ملكي", nameEn: "Royal Black", hex: "#0F172A" },
    ],
  ];

  const egyptianCities = [
    "6 أكتوبر",
    "الشيخ زايد",
    "شبين الكوم",
    "الباجور",
    "الجيزة",
    "القاهرة",
  ];
  const materialList = [
    "قطن مصري فاخر",
    "جينز متين",
    "كتان طبيعي",
    "ميلتون دافئ",
  ];

  const productsList: Product[] = Array.from({ length: 12 }, (_, index) => {
    const template = catalogTemplates[index % catalogTemplates.length];
    const brand = brandsList[index % brandsList.length];
    const itemNumber = Math.floor(index / catalogTemplates.length) + 1;
    const palette = colorPalettes[index % colorPalettes.length];
    const assignedCity = egyptianCities[index % egyptianCities.length];
    const assignedMaterial = materialList[index % materialList.length];
    const isExpress = index % 2 === 0;

    return {
      id: `prod-${index + 1}`,
      brandId: brand.id,
      brandName: brand.name,
      titleAr: `${template.titleAr} ${brand.name} (${itemNumber})`,
      titleEn: `${template.titleEn} ${brand.name} (${itemNumber})`,
      category: template.category,
      price: template.basePrice + (index % 5) * 45,
      oldPrice: template.basePrice + (index % 5) * 45 + 200,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: palette,
      rating: index % 3 === 0 ? 5 : 4,
      image: template.images[0],
      deliveryTime: isExpress ? "tomorrow" : "3_days",
      shippingType: isExpress ? "express" : "economy",
      city: assignedCity,
      material: assignedMaterial,
      badgeAr: isExpress ? "شحن فوري (Express)" : "شحن مجمع 35 ج.م",
      badgeEn: isExpress ? "Express Delivery" : "Economy 35 EGP",
      descriptionAr: template.descriptionAr,
      descriptionEn: template.descriptionEn,
    };
  });

  const categories = [
    { id: "all", labelAr: "الكل (110+)", labelEn: "All (110+)" },
    { id: "men_tshirts", labelAr: "تيشيرتات رجالي", labelEn: "Men T-Shirts" },
    {
      id: "women_tshirts",
      labelAr: "تيشيرتات حريمي",
      labelEn: "Women T-Shirts",
    },
    { id: "men_pants", labelAr: "بنطلونات رجالي", labelEn: "Men Pants" },
    { id: "women_pants", labelAr: "بنطلونات حريمي", labelEn: "Women Pants" },
    { id: "men_shirts", labelAr: "أقمصة رجالي", labelEn: "Men Shirts" },
    { id: "women_shirts", labelAr: "أقمصة حريمي", labelEn: "Women Shirts" },
    { id: "men_shoes", labelAr: "أحذية رجالي", labelEn: "Men Shoes" },
    { id: "women_shoes", labelAr: "أحذية حريمي", labelEn: "Women Shoes" },
  ];

  // 🔍 معالجة دقيقة وشاملة للبحث والفلاتر المتقدمة
  const filteredProducts = productsList.filter((prod) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      prod.titleAr.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      prod.titleEn.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      prod.brandName.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesCategory =
      selectedCategory === "all" || prod.category === selectedCategory;
    const matchesBrand = filterBrand === "all" || prod.brandId === filterBrand;
    const matchesSize = filterSize === "all" || prod.sizes.includes(filterSize);
    const matchesColor =
      filterColor === "all" ||
      prod.colors.some(
        (c) =>
          c.nameAr === filterColor ||
          c.hex.toLowerCase() === filterColor.toLowerCase(),
      );
    const matchesCity = filterCity === "all" || prod.city.includes(filterCity);
    const matchesShipping =
      filterShipping === "all" || prod.shippingType === filterShipping;
    const matchesMaterial =
      filterMaterial === "all" || prod.material === filterMaterial;
    const matchesPrice = prod.price >= minPrice && prod.price <= maxPrice;
    const matchesRating = minRating === 0 || prod.rating >= minRating;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesSize &&
      matchesColor &&
      matchesCity &&
      matchesShipping &&
      matchesMaterial &&
      matchesPrice &&
      matchesRating
    );
  });

  const selectedBrandObj = brandsList.find((b) => b.id === filterBrand);

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
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: ${
          lang === "ar" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"
        }; }
        .notch-card { border-radius: 20px; position: relative; }
        .notch-badge {
          position: absolute; top: 12px; right: 16px;
          background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px);
          padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 800;
          color: #1E293B; box-shadow: 0 2px 6px rgba(0,0,0,0.05); z-index: 10;
        }
      `}</style>

      {/* 🔝 النافبار العلوي */}
      <header
        className={`sticky top-0 z-50 border-b shadow-sm transition-all duration-300 ${
          isDarkMode
            ? "bg-[#1E293B] border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center"
              title="الرئيسية"
            >
              <BrandLogo showText={true} />
            </span>
          </div>

          <div className="flex-1 max-w-md relative flex items-center gap-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={
                  lang === "ar"
                    ? "ابحث عن منتج، براند، أو تصميم..."
                    : "Search for products, brands..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-full px-9 py-1.5 text-xs focus:outline-none transition ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-700 text-white focus:border-amber-400"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400"
                }`}
              />
              <SearchIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-2.5 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="p-1.5 px-3 border rounded-full text-xs font-black bg-amber-400 text-slate-950 border-amber-400 shadow-sm hover:bg-amber-500 transition cursor-pointer shrink-0 flex items-center gap-1.5"
              title="فلترة متقدمة"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "فلتر متقدم" : "Filter"}</span>
              {(filterSize !== "all" || filterColor !== "all" || filterCity !== "all" || filterShipping !== "all") && (
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 px-3 border rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isDarkMode
                  ? "bg-slate-900 border-slate-700 text-amber-400"
                  : "bg-slate-100 border-slate-200 text-slate-800"
              }`}
              title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`px-3 py-1 border rounded-full text-xs font-bold transition ${
                isDarkMode
                  ? "bg-slate-900 border-slate-700 text-slate-300"
                  : "bg-slate-100 border-slate-200 text-slate-800"
              }`}
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <button
              onClick={() => navigate("/customer/profile")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 text-slate-950 font-black rounded-full text-xs shadow-sm hover:bg-amber-500 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "حسابي" : "Profile"}</span>
            </button>
          </div>
        </div>

        {/* شريط الأقسام السريع */}
        <div
          className={`border-t transition-colors ${
            isDarkMode
              ? "bg-[#1E293B] border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2 text-xs font-bold overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveTab("products");
                }}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                    : isDarkMode
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {lang === "ar" ? cat.labelAr : cat.labelEn}
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

      {/* 🎛️ نافذة الفلاتر المتقدمة والشاملة الاحترافية (Advanced Filters Modal) */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className={`max-w-lg w-full rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition ${
              isDarkMode
                ? "bg-slate-900 border border-slate-800 text-white"
                : "bg-white border border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black">
                  {lang === "ar"
                    ? "خيارات الفلترة المتقدمة (المقاسات، الألوان، الأسعار، والمناطق)"
                    : "Advanced Product Filters"}
                </h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. فلتر المقاسات */}
              <div>
                <label className="font-black block mb-1.5 text-slate-900 dark:text-white">
                  {lang === "ar" ? "المقاس المطلوب:" : "Size:"}
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {["all", "S", "M", "L", "XL", "XXL", "3XL"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFilterSize(sz)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                        filterSize === sz
                          ? "bg-amber-400 text-slate-950 border-amber-400 shadow-2xs"
                          : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {sz === "all" ? (lang === "ar" ? "كل المقاسات" : "All Sizes") : sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. فلتر الألوان الشائعة */}
              <div>
                <label className="font-black block mb-1.5 text-slate-900 dark:text-white">
                  {lang === "ar" ? "اللون:" : "Color Palette:"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "all", label: "جميع الألوان", hex: "transparent" },
                    { id: "أبيض قطني", label: "أبيض", hex: "#FFFFFF" },
                    { id: "أسود ملكي", label: "أسود", hex: "#0F172A" },
                    { id: "كحلي داكن", label: "كحلي", hex: "#1B2A4A" },
                    { id: "بيج رملي", label: "بيج", hex: "#D6C4A6" },
                    { id: "زيتي داكن", label: "زيتي", hex: "#434E38" },
                    { id: "نبيتي فخم", label: "نبيتي", hex: "#7E1D2D" },
                    { id: "رمادي هادئ", label: "رمادي", hex: "#71717A" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFilterColor(c.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-[11px] font-bold transition cursor-pointer ${
                        filterColor === c.id
                          ? "border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-400"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {c.hex !== "transparent" ? (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. نوع الشحن وسرعة التوصيل */}
              <div>
                <label className="font-black block mb-1.5 text-slate-900 dark:text-white">
                  {lang === "ar" ? "طريقة الشحن وسرعة التوصيل:" : "Shipping Type:"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: "all", labelAr: "الكل", descAr: "عرض كل خيارات الشحن" },
                    { id: "express", labelAr: "شحن فوري Express", descAr: "توصيل خلال نفس اليوم" },
                    { id: "economy", labelAr: "شحن مجمع (35 ج.م)", descAr: "عبر كوليكتور الحي" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFilterShipping(s.id)}
                      className={`p-2.5 rounded-xl border text-start transition cursor-pointer ${
                        filterShipping === s.id
                          ? "border-amber-400 bg-amber-400/10 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className="font-black block text-[11px]">{s.labelAr}</span>
                      <span className="text-[9px] opacity-70 block">{s.descAr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. المنطقة والنطاق الجغرافي */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-black block mb-1 text-slate-900 dark:text-white">
                    {lang === "ar" ? "المنطقة / المحافظة:" : "Region / Hub Zone:"}
                  </label>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
                  >
                    <option value="all">جميع المناطق</option>
                    <option value="6 أكتوبر">6 أكتوبر (المناطق والأحياء)</option>
                    <option value="الشيخ زايد">الشيخ زايد</option>
                    <option value="شبين الكوم">شبين الكوم (المنوفية)</option>
                    <option value="الباجور">الباجور (المنوفية)</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="القاهرة">القاهرة</option>
                  </select>
                </div>

                <div>
                  <label className="font-black block mb-1 text-slate-900 dark:text-white">
                    {lang === "ar" ? "الخامة ونوع النسيج:" : "Material:"}
                  </label>
                  <select
                    value={filterMaterial}
                    onChange={(e) => setFilterMaterial(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
                  >
                    <option value="all">جميع الخامات</option>
                    <option value="قطن مصري فاخر">قطن مصري فاخر 100%</option>
                    <option value="جينز متين">جينز متين كاجوال</option>
                    <option value="كتان طبيعي">كتان طبيعي صيفي</option>
                    <option value="ميلتون دافئ">ميلتون دافئ ومريح</option>
                  </select>
                </div>
              </div>

              {/* 5. فلتر نطاق السعر */}
              <div>
                <div className="flex justify-between items-center font-black mb-1.5">
                  <span className="text-slate-900 dark:text-white">
                    {lang === "ar" ? "نطاق السعر الأقصى:" : "Max Price Range:"}
                  </span>
                  <span className="text-amber-500 font-mono text-sm font-black">
                    {maxPrice} EGP
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                  <span>200 ج.م</span>
                  <span>1,200 ج.م</span>
                  <span>2,500 ج.م</span>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs"
                >
                  {lang === "ar" ? "تصفير الكل" : "Reset All"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer text-center"
                >
                  {lang === "ar"
                    ? `تطبيق الفلاتر (${filteredProducts.length} منتج متطابق)`
                    : `Apply Filters (${filteredProducts.length} Results)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-6 mt-2">
        {/* السيدبار الجانبي */}
        <aside
          className={`border rounded-2xl p-3 flex flex-col gap-2 shrink-0 shadow-sm transition-all duration-300 md:sticky md:top-20 h-fit w-full md:w-60 ${
            isDarkMode
              ? "bg-[#1E293B] border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "products"
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <PackageIcon className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "المنتجات والمعرض" : "Products & Shop"}</span>
          </button>

          <button
            onClick={() => setActiveTab("brands")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "brands"
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BuildingIcon className="w-4 h-4 text-indigo-500" />
            <span>{lang === "ar" ? "البراندات" : "Brands"}</span>
          </button>

          <button
            onClick={() => navigate("/customer/wallet")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "wallet"
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <WalletIcon className="w-4 h-4 text-emerald-500" />
            <span>{lang === "ar" ? "المحفظة" : "Wallet"}</span>
          </button>

          <button
            onClick={() => navigate("/customer/cart")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CartIcon className="w-4 h-4 text-rose-500" />
            <span>{lang === "ar" ? "الطلبات" : "Orders"}</span>
          </button>

          <button
            onClick={() => navigate("/customer/notifications")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "notifications"
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BellIcon className="w-4 h-4 text-blue-500" />
            <span>{lang === "ar" ? "الإشعارات" : "Notifications"}</span>
          </button>

          <button
            onClick={() => navigate("/customer/reviews")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "reviews"
                ? "bg-slate-900 text-white dark:bg-slate-800"
                : isDarkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <StarIcon filled className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "المراجعات" : "Reviews"}</span>
          </button>
        </aside>

        <section className="flex-1 space-y-4">
          {/* شريط الفلتر المختار داخل سكشن المنتجات */}
          {filterBrand !== "all" && selectedBrandObj && (
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all shadow-sm ${
                isDarkMode
                  ? "bg-[#1E293B] border-slate-700 text-slate-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400">
                  {lang === "ar" ? "البراند المحدد:" : "Active Brand Filter:"}
                </span>
                <span className="bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-xl shadow-sm text-xs">
                  {selectedBrandObj.name}
                </span>
              </div>

              <button
                onClick={() => setFilterBrand("all")}
                className="flex items-center gap-1 text-[11px] font-black text-rose-500 hover:text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
              >
                <span>
                  {lang === "ar" ? "إلغاء التصفية وقراءة الكل" : "Reset Filter"}
                </span>
                <span>✕</span>
              </button>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3 border-slate-200/60">
                <h2
                  className={`text-lg font-black ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {lang === "ar" ? "معرض المنتجات" : "Products Marketplace"}
                </h2>
                <span className="text-xs font-bold text-slate-500">
                  {filteredProducts.length}{" "}
                  {lang === "ar" ? "منتج متوفر" : "Items"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`notch-card border shadow-sm hover:shadow-md transition duration-300 p-4 flex flex-col justify-between ${
                      isDarkMode
                        ? "bg-[#1E293B] border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <span className="notch-badge">{product.brandName}</span>

                    <div
                      className="space-y-3 cursor-pointer"
                      onClick={() =>
                        navigate(`/customer/product/${product.id}`)
                      }
                    >
                      <div className="relative h-60 w-full rounded-xl overflow-hidden mt-1 bg-slate-100">
                        <img
                          src={product.image}
                          alt={product.titleAr}
                          className="w-full h-full object-cover rounded-xl hover:scale-105 transition duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderImg;
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3
                            className={`text-xs font-bold leading-snug line-clamp-2 ${
                              isDarkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {lang === "ar" ? product.titleAr : product.titleEn}
                          </h3>
                          <span className="px-2.5 py-1 text-xs font-black text-slate-900 bg-slate-100 rounded-lg shrink-0 font-mono">
                            {product.price.toFixed(0)} LE
                          </span>
                        </div>
                        <p
                          className={`text-[11px] line-clamp-2 ${
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {lang === "ar"
                            ? product.descriptionAr
                            : product.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-3">
                      <button
                        onClick={() =>
                          navigate(`/customer/product/${product.id}`)
                        }
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CartIcon className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "إضافة للسلة" : "Add To Cart"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تبويب البراندات الفاخرة */}
          {activeTab === "brands" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-slate-200/60">
                <h2 className="text-lg font-black">
                  {lang === "ar" ? "أشهر البراندات" : "Featured Brands"}
                </h2>
                <span className="text-xs text-slate-500 font-bold">
                  {brandsList.length} {lang === "ar" ? "براند" : "Brands"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {brandsList.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setFilterBrand(b.id);
                      setActiveTab("products");
                    }}
                    className="relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.01] transition duration-500 border border-slate-200 dark:border-slate-800 group"
                  >
                    <img
                      src={b.bgImage}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 flex flex-col justify-end text-white">
                      <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-full text-[10px] w-fit mb-2 shadow-md">
                        {b.logo}
                      </span>
                      <h3 className="text-2xl font-black tracking-tight drop-shadow-md">
                        {b.name}
                      </h3>
                      <p className="text-xs text-slate-200 mt-1 line-clamp-1 font-bold opacity-90">
                        {lang === "ar" ? b.descAr : b.descEn}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-xs font-black text-amber-300 group-hover:text-amber-400 transition">
                        <span>
                          {lang === "ar"
                            ? "استكشف تشكيلة البراند"
                            : "Explore Collection"}
                        </span>
                        <span>←</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div
              className={`p-6 border rounded-2xl shadow-sm ${
                isDarkMode
                  ? "bg-[#1E293B] border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <h2 className="text-base font-black mb-2">
                محفظتي (3ARB Wallet)
              </h2>
              <p className="text-xs text-slate-500">رصيدك الحالي: 0.00 EGP</p>
            </div>
          )}
        </section>
      </main>

      {/* 🔹 الفوتر الموحد للمنصة */}
      <GlobalFooter />
    </div>
  );
};

export default CustomerProductsPage;
