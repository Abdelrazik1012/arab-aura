import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import GlobalFooter from "../../components/GlobalFooter";
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  StarIcon,
  SparklesIcon,
  CheckIcon,
  TrendingUpIcon,
  CartIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  TagIcon,
  LayersIcon,
  InfoIcon,
  CloseIcon,
} from "../../components/Icons";
import {
  analyzeProductForEgyptianConsumer,
  runVirtualTryOn,
  type ConsumerAiAnalysisResult,
  type VirtualTryOnResult,
} from "../../services/aiService";

export interface ProductReviewItem {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  date: string;
  sizeBought: string;
  comment: string;
  verifiedBuyer: boolean;
}

interface ColorOption {
  nameAr: string;
  nameEn: string;
  hex: string;
}

interface OutfitLook {
  titleAr: string;
  titleEn: string;
  itemsAr: string[];
  itemsEn: string[];
}

interface AnalysisResult {
  recommendedSize: string;
  fabricSpecsAr: string;
  fabricSpecsEn: string;
  seasonNoteAr: string;
  seasonNoteEn: string;
  skinAndToneAdviceAr: string;
  skinAndToneAdviceEn: string;
  ageTrendNoteAr: string;
  ageTrendNoteEn: string;
  outfits: OutfitLook[];
  generatedOutfitImage?: string;
}

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const [addedToast, setAddedToast] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState<ColorOption>({
    nameAr: "أبيض قطني",
    nameEn: "Cotton White",
    hex: "#FFFFFF",
  });
  const [quantity, setQuantity] = useState(1);

  // حالات التحليل المتقدم للذكاء الاصطناعي (Smart Engine)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userHeight, setUserHeight] = useState("175");
  const [userWeight, setUserWeight] = useState("76");
  const [userAge, setUserAge] = useState("24");
  const [userSkinTone, setUserSkinTone] = useState<"wheat" | "bronze" | "fair" | "dark">("wheat");
  const [fitPreference, setFitPreference] = useState<
    "wide" | "regular" | "slim"
  >("regular");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisOutput, setAnalysisOutput] = useState<ConsumerAiAnalysisResult | null>(
    null,
  );
  const [tryOnResult, setTryOnResult] = useState<VirtualTryOnResult | null>(null);
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [isVirtualTryOnLoading, setIsVirtualTryOnLoading] = useState(false);
  const [outfitAddedNotice, setOutfitAddedNotice] = useState(false);

  // 🌟 إدارة تقييمات ومراجعات العملاء الفعلية
  const [reviewsList, setReviewsList] = useState<ProductReviewItem[]>([
    {
      id: "rev-1",
      userName: "أحمد صابر",
      userCity: "6 أكتوبر (حي الأشجار)",
      rating: 5,
      date: "منذ يومين",
      sizeBought: "L",
      comment:
        "الخامة قطن مصري فاخر فعلاً والتقفيل عالي جداً. نصيحة المقاس اللي طلعتلي من حاسبة القياس بالذكاء الاصطناعي طلعت مضبوطة بالمللي!",
      verifiedBuyer: true,
    },
    {
      id: "rev-2",
      userName: "مي السيد",
      userCity: "شبين الكوم (المنوفية)",
      rating: 5,
      date: "منذ 4 أيام",
      sizeBought: "M",
      comment:
        "أجمل حاجة إن الشحنة وصلت مجمعة مع كوليكتور الحي في شبين الكوم بسعر 35 جنيه بس بدلاً من 80 جنيه. الألوان ثابتة والقطعة أنيقة جداً.",
      verifiedBuyer: true,
    },
    {
      id: "rev-3",
      userName: "إسلام رضوان",
      userCity: "الشيخ زايد",
      rating: 4,
      date: "منذ أسبوع",
      sizeBought: "XL",
      comment:
        "القصة ممتازة ومريحة جداً في اللبس اليومي والخروج الكاجوال. هطلب لون تاني بإذن الله.",
      verifiedBuyer: true,
    },
    {
      id: "rev-4",
      userName: "سارة محمود",
      userCity: "الجيزة",
      rating: 5,
      date: "منذ 10 أيام",
      sizeBought: "M",
      comment:
        "اتبعت تعليمات الغسيل بالماء البارد والكي بالبخار المقترحة في دليل العناية، القطعة محتفظة برونقها كأنها لسه جديدة.",
      verifiedBuyer: true,
    },
  ]);

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewCity, setNewReviewCity] = useState("6 أكتوبر");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewSize, setNewReviewSize] = useState("M");
  const [reviewSubmitFeedback, setReviewSubmitFeedback] = useState("");

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev: ProductReviewItem = {
      id: `rev-${Date.now()}`,
      userName: newReviewName.trim(),
      userCity: newReviewCity,
      rating: newReviewRating,
      date: lang === "ar" ? "الآن" : "Just now",
      sizeBought: newReviewSize,
      comment: newReviewComment.trim(),
      verifiedBuyer: true,
    };

    setReviewsList((prev) => [newRev, ...prev]);
    setReviewSubmitFeedback(
      lang === "ar"
        ? "✓ شكراً لك! تم نشر تقييمك للمنتج بنجاح."
        : "✓ Thank you! Your review has been published.",
    );
    setNewReviewName("");
    setNewReviewComment("");
    setTimeout(() => {
      setReviewSubmitFeedback("");
      setShowAddReviewModal(false);
    }, 1800);
  };

  // بيانات المنتج
  const product = {
    id: productId || "prod-1",
    brandName: "Town Team",
    titleAr: "تيشيرت بولو قطن مطرز كاجوال أنيق",
    titleEn: "Embroidered Cotton Polo T-Shirt",
    price: 550.0,
    oldPrice: 750.0,
    rating: 4.9,
    reviewsCount: 128,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { nameAr: "أبيض قطني", nameEn: "Cotton White", hex: "#FFFFFF" },
      { nameAr: "كحلي داكن", nameEn: "Dark Navy", hex: "#1B2A4A" },
      { nameAr: "رمادي هادئ", nameEn: "Muted Grey", hex: "#4A5568" },
    ],
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
    ],
    descriptionAr:
      "تم تصميم هذا التيشيرت من أنقى ألياف القطن المصري طويل التيلة لتوفير أقصى درجات الراحة والمرونة، مع ياقة مقواة تقاوم التلف مع الغسيل المتكرر لمظهر مميز وجذاب.",
    descriptionEn:
      "Crafted from fine long-staple Egyptian cotton for maximum comfort and durability. Features a reinforced collar that retains its crisp shape.",
  };

  const [activeImage, setActiveImage] = useState(product.images[0]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const handleRunAnalysis = async () => {
    if (!userHeight || !userWeight) {
      alert(
        lang === "ar"
          ? "يرجى إدخال الطول والوزن لتحديد القياس والتريند بدقة."
          : "Please enter height and weight for accurate size & style recommendation.",
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisOutput(null);

    try {
      const result = await analyzeProductForEgyptianConsumer({
        productId: product.id,
        productTitle: lang === "ar" ? product.titleAr : product.titleEn,
        category: "polo",
        brandName: product.brandName,
        price: product.price,
        height: userHeight,
        weight: userWeight,
        age: userAge || "24",
        skinTone: userSkinTone,
        fitPreference,
        userPhotoBase64: uploadedImage,
      });

      setAnalysisOutput(result);
      setSelectedSize(result.recommendedSize);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVirtualTryOn = async () => {
    setIsVirtualTryOnLoading(true);
    try {
      const res = await runVirtualTryOn({
        productTitle: lang === "ar" ? product.titleAr : product.titleEn,
        productImage: activeImage || product.images[0],
        category: "polo",
        price: product.price,
        height: userHeight || "178",
        weight: userWeight || "76",
        age: userAge || "24",
        skinTone: userSkinTone,
        fitPreference,
        userPhotoBase64: uploadedImage,
      });
      setTryOnResult(res);
      setSelectedSize(res.recommendedSize);
      setShowTryOnModal(true);
    } catch (err) {
      console.error("Virtual Try-On error", err);
    } finally {
      setIsVirtualTryOnLoading(false);
    }
  };

  // ديناميكية اللون بناءً على الـ Dark Mode
  const textColor = isDarkMode ? "#FFFFFF" : "#0E172A";

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        isDarkMode ? "bg-[#0F172A] text-white" : "bg-[#F8FAFC] text-[#0E172A]"
      }`}
      style={{ color: textColor }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: ${
          lang === "ar" ? "'Tajawal', sans-serif" : "'Outfit', sans-serif"
        }; }
      `}</style>

      {/* 🔝 النافبار العلوي */}
      <header
        className={`sticky top-0 z-50 border-b shadow-sm transition-all duration-300 ${
          isDarkMode
            ? "bg-[#1E293B] border-slate-700 text-white"
            : "bg-white border-slate-200 text-[#0E172A]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/customer/products")}
          >
            <BrandLogo showText={true} />
            <span
              className="text-xs font-black hidden sm:inline"
              style={{ color: textColor }}
            >
              | {lang === "ar" ? "تفاصيل المنتج" : "Product Details"}
            </span>
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
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-full text-xs shadow-sm hover:bg-amber-500 transition cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "حسابي" : "Profile"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main
        className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6"
        style={{ color: textColor }}
      >
        <button
          onClick={() => navigate("/customer/products")}
          className="flex items-center gap-2 text-xs font-black hover:opacity-80 transition"
          style={{ color: textColor }}
        >
          <span>
            {lang === "ar" ? "← العودة لمعرض المنتجات" : "← Back to Shop"}
          </span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 🖼️ معرض الصور */}
          <div className="space-y-4 sticky top-20">
            <div className="h-96 md:h-[450px] rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative">
              <img
                src={activeImage}
                alt={product.titleAr}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 right-4 bg-[#0E172A] dark:bg-slate-900 text-white dark:text-amber-400 font-black text-xs px-3.5 py-1.5 rounded-full shadow">
                {product.brandName}
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    activeImage === img
                      ? "border-amber-400 shadow-md scale-105"
                      : "border-transparent opacity-70"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 📝 تفاصيل المنتج وخيارات القياس */}
          <div className="space-y-6" style={{ color: textColor }}>
            <div>
              <span className="text-xs font-black bg-[#0E172A] text-white dark:bg-amber-400 dark:text-[#0E172A] px-3 py-1 rounded-lg">
                {product.brandName}
              </span>
              <h1
                className="text-xl md:text-2xl font-black mt-2 leading-snug"
                style={{ color: textColor }}
              >
                {lang === "ar" ? product.titleAr : product.titleEn}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <span
                  className="text-2xl font-black font-mono"
                  style={{ color: isDarkMode ? "#FBBF24" : "#0E172A" }}
                >
                  {product.price.toFixed(2)} EGP
                </span>
                {product.oldPrice && (
                  <span className="text-sm font-black line-through text-slate-500 font-mono">
                    {product.oldPrice.toFixed(2)} EGP
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowReviewsModal(true)}
                  className="flex items-center gap-1.5 text-xs font-black bg-amber-400/20 hover:bg-amber-400/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-xl transition cursor-pointer border border-amber-400/30 shadow-2xs"
                  title="عرض تقييمات العملاء"
                >
                  <StarIcon filled className="w-3.5 h-3.5 text-amber-500" />
                  <span>{product.rating}</span>
                  <span className="opacity-80 font-bold">
                    ({reviewsList.length} {lang === "ar" ? "تقييم - عرض الكل ↗" : "reviews - View All ↗"})
                  </span>
                </button>
              </div>
            </div>

            <p
              className="text-xs md:text-sm font-bold leading-relaxed border-t border-b py-3 border-slate-200 dark:border-slate-800"
              style={{ color: textColor }}
            >
              {lang === "ar" ? product.descriptionAr : product.descriptionEn}
            </p>

            {/* اختيار المقاس واللون */}
            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-black block mb-2"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "المقاس المتاح:" : "Select Size:"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition ${
                        selectedSize === sz
                          ? "bg-amber-400 text-[#0E172A] border-amber-400 shadow-sm"
                          : "border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      style={{
                        color: selectedSize === sz ? "#0E172A" : textColor,
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-black block mb-2"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "اللون:" : "Select Color:"}
                </label>
                <div className="flex gap-2">
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition ${
                        selectedColor.hex === c.hex
                          ? "bg-amber-400 text-[#0E172A] border-amber-400 font-black"
                          : "border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      style={{
                        color:
                          selectedColor.hex === c.hex ? "#0E172A" : textColor,
                      }}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block"
                        style={{ backgroundColor: c.hex }}
                      ></span>
                      {lang === "ar" ? c.nameAr : c.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* زر الإضافة للسلة */}
              <div className="flex gap-3 pt-2">
                <div className="flex items-center border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 font-black hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-xl"
                    style={{ color: textColor }}
                  >
                    -
                  </button>
                  <span
                    className="px-3 font-mono font-black text-xs"
                    style={{ color: textColor }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 font-black hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-xl"
                    style={{ color: textColor }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    setAddedToast(true);
                    setTimeout(() => setAddedToast(false), 5000);
                  }}
                  className="flex-1 py-3.5 bg-slate-900 dark:bg-amber-400 hover:bg-slate-800 dark:hover:bg-amber-500 text-white dark:text-[#0E172A] font-black rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CartIcon className="w-4 h-4" />
                  <span>
                    {lang === "ar" ? "إضافة إلى السلة" : "Add To Cart"}
                  </span>
                </button>
              </div>

              {addedToast && (
                <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 animate-fade-in text-xs font-black">
                  <span className="text-emerald-500 flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    <span>{lang === "ar" ? "تمت إضافة المنتج للسلة بنجاح!" : "Item added to cart!"}</span>
                  </span>
                  <button
                    onClick={() => navigate("/customer/cart")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] cursor-pointer shadow-xs transition"
                  >
                    {lang === "ar" ? "الذهاب للسلة وإتمام الشراء ←" : "Go to Cart →"}
                  </button>
                </div>
              )}
            </div>

            {/* 📏 دليل القياس والتنسيقات */}
            <div
              className={`p-5 rounded-3xl border shadow-sm space-y-4 transition-all ${
                isDarkMode
                  ? "bg-[#1E293B] border-slate-700"
                  : "bg-white border-slate-200"
              }`}
              style={{ color: textColor }}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-black" style={{ color: textColor }}>
                  {lang === "ar"
                    ? "دليل القياس والتنسيق المخصص"
                    : "Personalized Size & Style Guide"}
                </h3>
                <span
                  className="text-[11px] font-black"
                  style={{ color: textColor }}
                >
                  {lang === "ar" ? "تحليل المظهر" : "Style Assistant"}
                </span>
              </div>

              {/* مدخلات القياس والعمر */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label
                    className="font-black block mb-1"
                    style={{ color: textColor }}
                  >
                    {lang === "ar" ? "الطول (سم):" : "Height (cm):"}
                  </label>
                  <input
                    type="number"
                    placeholder="175"
                    value={userHeight}
                    onChange={(e) => setUserHeight(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl font-black outline-none transition ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                        : "bg-slate-50 border-slate-300 text-[#0E172A] focus:border-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className="font-black block mb-1"
                    style={{ color: textColor }}
                  >
                    {lang === "ar" ? "الوزن (كجم):" : "Weight (kg):"}
                  </label>
                  <input
                    type="number"
                    placeholder="78"
                    value={userWeight}
                    onChange={(e) => setUserWeight(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl font-black outline-none transition ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                        : "bg-slate-50 border-slate-300 text-[#0E172A] focus:border-slate-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className="font-black block mb-1"
                    style={{ color: textColor }}
                  >
                    {lang === "ar" ? "العمر (سنة):" : "Age:"}
                  </label>
                  <input
                    type="number"
                    placeholder="24"
                    value={userAge}
                    onChange={(e) => setUserAge(e.target.value)}
                    className={`w-full p-2.5 border rounded-xl font-black outline-none transition ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-700 text-white focus:border-amber-400"
                        : "bg-slate-50 border-slate-300 text-[#0E172A] focus:border-slate-500"
                    }`}
                  />
                </div>
              </div>

              {/* اختيار لون البشرة وقصة البنطلون */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label
                    className="font-black block mb-1"
                    style={{ color: textColor }}
                  >
                    {lang === "ar" ? "لون البشرة:" : "Skin Tone:"}
                  </label>
                  <select
                    value={userSkinTone}
                    onChange={(e) => setUserSkinTone(e.target.value as any)}
                    className={`w-full p-2.5 border rounded-xl font-black outline-none ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-[#0E172A]"
                    }`}
                  >
                    <option value="wheat">قمحية (الأكثر شيوعاً في مصر)</option>
                    <option value="bronze">برونزية ودافئة</option>
                    <option value="fair">فاتحة وبيضاء</option>
                    <option value="dark">سمراء أصيلة</option>
                  </select>
                </div>

                <div>
                  <label
                    className="font-black block mb-1"
                    style={{ color: textColor }}
                  >
                    {lang === "ar"
                      ? "قصّة البنطلون المفضلة (Fit):"
                      : "Pants Fit Style:"}
                  </label>
                  <select
                    value={fitPreference}
                    onChange={(e) => setFitPreference(e.target.value as any)}
                    className={`w-full p-2.5 border rounded-xl font-black outline-none ${
                      isDarkMode
                        ? "bg-[#0F172A] border-slate-700 text-white"
                        : "bg-slate-50 border-slate-300 text-[#0E172A]"
                    }`}
                  >
                    <option value="wide">Wide-Leg (واسع عصري)</option>
                    <option value="regular">Regular (عادي مريح)</option>
                    <option value="slim">Slim Fit (مجسم أنيق)</option>
                  </select>
                </div>
              </div>

              {/* رفع الصورة الشخصية */}
              <div>
                <label
                  className="font-black block mb-1 text-xs"
                  style={{ color: textColor }}
                >
                  {lang === "ar"
                    ? "إرفاق صورة شخصية (اختياري لتحليل تناسق الألوان):"
                    : "Upload personal photo (Optional for color matching):"}
                </label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="style-photo-upload"
                    className={`flex-1 border-2 border-dashed p-2.5 rounded-xl text-center text-xs font-black transition cursor-pointer ${
                      isDarkMode
                        ? "border-slate-700 text-slate-200 hover:border-amber-400"
                        : "border-slate-300 text-[#0E172A] hover:border-slate-500"
                    }`}
                  >
                    {uploadedImage
                      ? lang === "ar"
                        ? "تمت إضافة الصورة بنجاح ✓"
                        : "Photo uploaded ✓"
                      : lang === "ar"
                        ? "اضغط هنا لرفع الصورة"
                        : "Click to upload photo"}
                    <input
                      type="file"
                      id="style-photo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="User Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-amber-400 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleVirtualTryOn}
                  disabled={isVirtualTryOnLoading}
                  className="py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-black rounded-xl text-xs transition shadow-md hover:shadow-indigo-500/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                  <SparklesIcon className="w-4 h-4 text-amber-300" />
                  <span>
                    {isVirtualTryOnLoading
                      ? lang === "ar"
                        ? "جاري تجهيز غرفة القياس الافتراضية بالذكاء الاصطناعي..."
                        : "Generating Virtual Try-On Studio..."
                      : lang === "ar"
                        ? "👗 تجربة افتراضية فورية (AI Virtual Try-On)"
                        : "👗 Instant Virtual Try-On"}
                  </span>
                </button>

                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4 text-slate-950" />
                  <span>
                    {isAnalyzing
                      ? lang === "ar"
                        ? "جاري تحليل التريند والمقاس..."
                        : "Analyzing Trends..."
                      : lang === "ar"
                        ? "تحليلات السوق والعناية بالقطن"
                        : "Market Trends & Cotton Care"}
                  </span>
                </button>
              </div>

              {/* 📊 بطاقة النتيجة الشاملة بالذكاء الاصطناعي */}
              {analysisOutput && (
                <div
                  className={`mt-4 p-5 rounded-2xl border space-y-4 text-xs transition-all ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-800 text-slate-100"
                      : "bg-white border-slate-200 text-slate-900 shadow-sm"
                  }`}
                >
                  {/* هيدر عمليات الشراء ومؤشر التريند */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-amber-500/30 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TrendingUpIcon className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-black text-amber-500 text-sm">
                          مؤشر التريند: {analysisOutput.trendingScore}% في السوق المصري
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500 text-white shadow-xs">
                        {analysisOutput.purchasesCountRecent} عملية شراء هذا الأسبوع
                      </span>
                    </div>
                    <p className="text-[11px] font-bold opacity-90 leading-relaxed text-slate-700 dark:text-slate-300">
                      {lang === "ar" ? analysisOutput.trendingVerdictAr : analysisOutput.trendingVerdictEn}
                    </p>
                  </div>

                  {/* القياس الموصى به بدقة */}
                  <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="font-black block text-slate-900 dark:text-white">
                        {lang === "ar" ? "القياس المصري الموصى به:" : "Recommended Size:"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        دقة التوافق: {analysisOutput.sizeConfidence} بناءً على الطول والوزن ولون البشرة
                      </span>
                    </div>
                    <span className="bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-base shadow-sm">
                      {analysisOutput.recommendedSize}
                    </span>
                  </div>

                  {/* نلبس معاه إيه؟ (Styling & Matching) */}
                  <div className="space-y-2 border-b pb-3 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                        {lang === "ar" ? "نلبس معاه إيه؟ (اقتراحات التنسيق المتكامل):" : "What to Wear with It:"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(lang === "ar" ? analysisOutput.stylingAndMatchingAr : analysisOutput.stylingAndMatchingEn).map(
                        (item, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start gap-2"
                          >
                            <span className="text-indigo-500 font-black">✦</span>
                            <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">{item}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* دليل الغسيل والكي وحفظ الألوان */}
                  <div className="space-y-2.5 border-b pb-4 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {lang === "ar"
                          ? "دليل العناية بالملابس والكاوي وحماية الألوان:"
                          : "Garment Care, Ironing & Longevity Guide:"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <CheckIcon className="w-3 h-3 text-blue-500" />
                          <span>{lang === "ar" ? "طريقة الغسيل الصحيحة:" : "Proper Washing Method:"}</span>
                        </span>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                          {lang === "ar"
                            ? analysisOutput.careInstructionsAr.washing
                            : analysisOutput.careInstructionsEn.washing}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <CheckIcon className="w-3 h-3 text-amber-500" />
                          <span>{lang === "ar" ? "طريقة الكي بالبخار:" : "Steam Ironing Guide:"}</span>
                        </span>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                          {lang === "ar"
                            ? analysisOutput.careInstructionsAr.ironing
                            : analysisOutput.careInstructionsEn.ironing}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <ShieldCheckIcon className="w-3 h-3 text-rose-500" />
                          <span>{lang === "ar" ? "حماية الألوان من البهتان:" : "Color Fading Protection:"}</span>
                        </span>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                          {lang === "ar"
                            ? analysisOutput.careInstructionsAr.colorProtection
                            : analysisOutput.careInstructionsEn.colorProtection}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckIcon className="w-3 h-3 text-emerald-500" />
                          <span>{lang === "ar" ? "الحفاظ على القطن والياقة:" : "Fabric & Collar Longevity:"}</span>
                        </span>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                          {lang === "ar"
                            ? analysisOutput.careInstructionsAr.longevityTip
                            : analysisOutput.careInstructionsEn.longevityTip}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* نصيحة لون البشرة */}
                  <div>
                    <span className="font-black block mb-0.5 text-xs text-amber-600 dark:text-amber-400">
                      {lang === "ar" ? "توافق القطعة مع لون البشرة المختار:" : "Complexion Matching:"}
                    </span>
                    <p className="font-bold leading-relaxed bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 text-[11px] text-slate-800 dark:text-slate-200">
                      {lang === "ar" ? analysisOutput.skinAndToneAdviceAr : analysisOutput.skinAndToneAdviceEn}
                    </p>
                  </div>

                  {/* الإطلالات الكاملة بالمناسبات */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="font-black block text-xs text-slate-900 dark:text-white">
                      {lang === "ar" ? "الإطلالات الكاملة المقترحة (Outfits):" : "Suggested Outfit Combos:"}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {analysisOutput.outfits.map((outfit, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border space-y-2 ${
                            isDarkMode
                              ? "bg-slate-950/60 border-slate-800"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <h4 className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                            {lang === "ar" ? outfit.titleAr : outfit.titleEn}
                          </h4>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <TagIcon className="w-3 h-3 text-amber-500" />
                            <span>{outfit.occasionAr}</span>
                          </span>
                          <ul className="list-disc list-inside font-bold space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                            {(lang === "ar" ? outfit.itemsAr : outfit.itemsEn).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ⭐ سكشن التقييمات والمراجعات الكامل في صفحة المنتج */}
            <div
              className={`p-5 rounded-3xl border shadow-sm space-y-4 transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <StarIcon filled className="w-4 h-4 text-amber-400" />
                    <span>{lang === "ar" ? "تقييمات وآراء المشترين الحقيقيين" : "Customer Ratings & Reviews"}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 font-mono">
                      {product.rating} / 5.0
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === "ar"
                      ? `بناءً على ${reviewsList.length} مراجعة موثقة من عملاء قاموا بشراء واستلام هذا المنتج في مصر`
                      : `Based on ${reviewsList.length} verified reviews from buyers across Egypt`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(true)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <StarIcon className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "✍️ اكتب تقييمك للمنتج" : "Write a Review"}</span>
                </button>
              </div>

              {/* قائمة المراجعات الحديثة */}
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs">{rev.userName}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          • {rev.userCity}
                        </span>
                        {rev.verifiedBuyer && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            ✓ مشتري موثق
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <StarIcon
                              key={idx}
                              filled={idx < rev.rating}
                              className={`w-3.5 h-3.5 ${
                                idx < rev.rating ? "text-amber-400" : "text-slate-300 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                      "{rev.comment}"
                    </p>

                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>المقاس المشتَرى: <strong className="text-slate-900 dark:text-white">{rev.sizeBought}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 🌟 مودال استعراض كل التقييمات والتوزيع التفصيلي (Reviews Breakdown Modal) */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border p-6 rounded-3xl w-full max-w-xl space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto ${
              isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <StarIcon filled className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">
                  {lang === "ar" ? "تقييمات ومراجعات العملاء" : "Customer Ratings"} ({reviewsList.length})
                </h3>
              </div>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="text-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* توزيع النجوم الإجمالي */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400 font-mono">4.8</div>
                <div className="flex text-amber-400 justify-center my-1">
                  {"★★★★★"}
                </div>
                <div className="text-[10px] text-slate-500 font-bold">128 تقييم كلي</div>
              </div>

              <div className="flex-1 space-y-1.5 text-[11px] font-bold">
                {[
                  { star: "5 نجوم", pct: "85%" },
                  { star: "4 نجوم", pct: "10%" },
                  { star: "3 نجوم", pct: "5%" },
                  { star: "نجمتان", pct: "0%" },
                  { star: "نجمة واحدة", pct: "0%" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-14 text-end text-[10px] text-slate-500">{s.star}</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: s.pct }} />
                    </div>
                    <span className="w-8 text-[10px] font-mono opacity-80">{s.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* المراجعات */}
            <div className="space-y-2.5">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900 dark:text-white">{rev.userName} - {rev.userCity}</span>
                    <div className="flex text-amber-400 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => "★")}
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">"{rev.comment}"</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowReviewsModal(false);
                setShowAddReviewModal(true);
              }}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
            >
              ✍️ أضف تقييمك أنت أيضاً
            </button>
          </div>
        </div>
      )}

      {/* ✍️ مودال كتابة تقييم جديد (Add Review Interactive Modal) */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddReviewSubmit}
            className={`border p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl ${
              isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm">
                {lang === "ar" ? "إضافة تقييم ومراجعة للمنتج" : "Write a Product Review"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddReviewModal(false)}
                className="text-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reviewSubmitFeedback && (
              <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center rounded-xl text-xs font-black">
                {reviewSubmitFeedback}
              </div>
            )}

            {/* تحديد عدد النجوم */}
            <div>
              <label className="block text-xs font-black mb-1.5">تقييمك الكلي:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setNewReviewRating(st)}
                    className="p-1 text-2xl transition hover:scale-110 cursor-pointer"
                  >
                    <StarIcon
                      filled={st <= newReviewRating}
                      className={`w-7 h-7 ${
                        st <= newReviewRating ? "text-amber-400" : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-black mb-1">اسمك الكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف أحمد"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-black mb-1">المحافظة / المدينة:</label>
                <select
                  value={newReviewCity}
                  onChange={(e) => setNewReviewCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                >
                  <option value="6 أكتوبر">6 أكتوبر</option>
                  <option value="الشيخ زايد">الشيخ زايد</option>
                  <option value="شبين الكوم">شبين الكوم (المنوفية)</option>
                  <option value="الباجور">الباجور (المنوفية)</option>
                  <option value="أشمون">أشمون (المنوفية)</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="القاهرة">القاهرة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black mb-1">المقاس الذي قمت بتجربته:</label>
              <div className="flex gap-2">
                {["S", "M", "L", "XL", "XXL"].map((sz) => (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => setNewReviewSize(sz)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                      newReviewSize === sz
                        ? "bg-amber-400 text-slate-950 border-amber-400"
                        : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black mb-1">رأيك وتجربتك مع الخامة والتوصيل:</label>
              <textarea
                required
                rows={3}
                placeholder="اكتب تقييمك بكل صراحة عن جودة القماش، المقاس، وسرعة الشحن..."
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold outline-none text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-sm"
            >
              نشر التقييم الآن
            </button>
          </form>
        </div>
      )}

      {/* 👗 مودال غرفة القياس الافتراضية الذكية (AI Virtual Try-On Modal) */}
      {showTryOnModal && tryOnResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className={`max-w-3xl w-full p-5 sm:p-7 rounded-3xl border shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-indigo-500/40 text-white"
                : "bg-white border-indigo-200 text-slate-950"
            }`}
          >
            {/* الهيدر */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/30">
                  <SparklesIcon className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-indigo-500 dark:text-indigo-400">
                      {lang === "ar"
                        ? "غرفة القياس الافتراضية الذكية (AI Virtual Try-On)"
                        : "AI Virtual Fitting Studio"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Gemini Vision Powered
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70">
                    {lang === "ar"
                      ? "محاكاة فورية لتناسق القطعة والمقاس مع أبعاد جسمك ولون بشرتك"
                      : "Real-time AI outfit simulation matching your body metrics and skin tone"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTryOnModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 font-black cursor-pointer transition"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* الإشعار عند إضافة الإطلالة الكاملة */}
            {outfitAddedNotice && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-between text-xs font-black animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === "ar"
                      ? "تمت إضافة الإطلالة الكاملة (3 قطع متناسقة) بنجاح إلى السلة مع خصم TRYON15!"
                      : "Full styled outfit added to your cart with TRYON15 discount!"}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/customer/cart")}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition cursor-pointer"
                >
                  {lang === "ar" ? "الذهاب للسلة" : "Go to Cart"}
                </button>
              </div>
            )}

            {/* جسم المودال: صورة المعاينة وبطاقات القياس */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* قسم المعاينة الصورية */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-xl bg-slate-950">
                  <img
                    src={tryOnResult.fittedOutfitImage}
                    alt="AI Fitted Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute top-3 right-3 bg-indigo-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1.5 border border-white/20">
                    <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>توافق القياس: {tryOnResult.fitScore}</span>
                  </div>
                  <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 text-white backdrop-blur-md p-2.5 rounded-xl text-center border border-white/10">
                    <span className="text-[10px] opacity-70 block">المقاس المصري المقترح:</span>
                    <span className="text-sm font-black text-amber-400">{tryOnResult.recommendedSize}</span>
                    <span className="text-[10px] opacity-80 block truncate">{tryOnResult.sizeDetails}</span>
                  </div>
                </div>
              </div>

              {/* قسم التحليل والتناسق */}
              <div className="md:col-span-7 space-y-3.5 text-xs">
                {/* بطاقة أبعاد الجسم ومؤشر BMI */}
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4" />
                      <span>{lang === "ar" ? "بيانات المقاس وأبعاد الجسم:" : "Body Fit Dimensions:"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-400 text-slate-950">
                      {tryOnResult.bodyMetrics.bmiCategory}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-bold">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] opacity-60 block">الطول</span>
                      <span className="font-black text-xs">{tryOnResult.bodyMetrics.height}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] opacity-60 block">الوزن</span>
                      <span className="font-black text-xs">{tryOnResult.bodyMetrics.weight}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] opacity-60 block">BMI</span>
                      <span className="font-black text-xs">{tryOnResult.bodyMetrics.bmi}</span>
                    </div>
                  </div>
                </div>

                {/* بطاقة تناسق لون البشرة */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <div className="flex items-center justify-between text-amber-500 font-black">
                    <span>{lang === "ar" ? "تناسق لون البشرة:" : "Skin Tone Match:"}</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                      {tryOnResult.skinToneHarmony.contrastRating}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed font-bold text-slate-700 dark:text-slate-300">
                    {tryOnResult.skinToneHarmony.verdictAr}
                  </p>
                </div>

                {/* نصيحة الذكاء الاصطناعي العامة */}
                <p className="text-[11px] font-bold opacity-80 leading-relaxed">
                  💡 {tryOnResult.stylingSummaryAr}
                </p>
              </div>
            </div>

            {/* قسم عناصر الإطلالة المكملة (Complete Look) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs text-indigo-500 dark:text-indigo-400">
                    {lang === "ar" ? "عناصر الإطلالة المتناسقة (Complete Look):" : "Matching Outfit Elements:"}
                  </h4>
                  <p className="text-[10px] opacity-60">
                    {lang === "ar"
                      ? "قطع مختارة بالذكاء الاصطناعي متطابقة الخامات والألوان مع هذا المنتج"
                      : "AI selected matching pieces to complete the look"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {tryOnResult.bundleDiscount}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tryOnResult.completeOutfitLook.map((look) => (
                  <div
                    key={look.id}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={look.image}
                        alt={look.titleAr}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-black opacity-50 block uppercase">{look.category}</span>
                        <h5 className="font-black text-[11px] truncate leading-tight">{look.titleAr}</h5>
                        <span className="text-[10px] font-black text-emerald-500">{look.price} ج.م</span>
                      </div>
                    </div>
                    <p className="text-[9px] opacity-70 leading-snug font-bold border-t pt-1 border-slate-200 dark:border-slate-700">
                      {look.reasonAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* الفوتر وأزرار الإجراءات */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] opacity-60 block">إجمالي الإطلالة الكاملة (4 قطع):</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-base text-emerald-500">{tryOnResult.totalLookPrice} ج.م</span>
                  <span className="text-[10px] line-through opacity-50">{Math.round(tryOnResult.totalLookPrice * 1.15)} ج.م</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOutfitAddedNotice(true);
                    setTimeout(() => setOutfitAddedNotice(false), 4000);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                >
                  <CartIcon className="w-4 h-4 text-slate-950" />
                  <span>{lang === "ar" ? "إضافة الإطلالة الكاملة للسلة" : "Add Complete Outfit to Cart"}</span>
                </button>
                <button
                  onClick={() => setShowTryOnModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  {lang === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 الفوتر الموحد للمنصة */}
      <GlobalFooter />
    </div>
  );
};

export default ProductDetailsPage;
