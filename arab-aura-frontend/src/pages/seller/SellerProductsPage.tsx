import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  PlusIcon,
  CloseIcon,
  RefreshIcon,
  CheckCircleIcon,
  ClockIcon,
  LightningIcon,
  TargetIcon,
  DocumentTextIcon,
  CameraIcon,
  CopyIcon,
  InfoIcon,
  CheckIcon,
} from "../../components/Icons";
import { sellerApi } from "../../services/sellerApi";
import { usePlatform } from "../../context/PlatformContext";
import {
  generateSellerMarketingCopy,
  type SellerCopyGenerationResult,
} from "../../services/aiService";

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  supplierCode: string;
  officeName: string;
  material: string;
  sizes: string[];
  description: string;
  image: string;
  status: "approved" | "pending";
  marketPerformance: "ممتاز وعالي الربحية" | "جيد مستقر" | "تحت المراجعة";
}

export const SellerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const [showAddModal, setShowAddModal] = useState(false);
  const { addProduct: addPlatformProduct } = usePlatform();

  // 🤖 استيراد المنتجات بالذكاء الاصطناعي و الـ Social Scraping
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [scrapePlatform, setScrapePlatform] = useState<
    "instagram" | "facebook" | "tiktok"
  >("instagram");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedProducts, setScrapedProducts] = useState<any[]>([]);
  const [scrapeError, setScrapeError] = useState("");
  const [importSuccessMsg, setImportSuccessMsg] = useState("");

  // مساعد كتابة البوست وتوجيهات التصوير بالذكاء الاصطناعي (AI Marketing Assistant)
  const [showAiCopyModal, setShowAiCopyModal] = useState(false);
  const [aiCopyInputTitle, setAiCopyInputTitle] = useState("تيشيرت بولو قطن مصري فاخر");
  const [aiCopyInputPrice, setAiCopyInputPrice] = useState(550);
  const [aiCopyInputLimitation, setAiCopyInputLimitation] = useState("يحتاج غسيل يدوي أو ماء بارد");
  const [aiCopyResult, setAiCopyResult] = useState<SellerCopyGenerationResult | null>(null);
  const [isAiCopyLoading, setIsAiCopyLoading] = useState(false);
  const [copySuccessToast, setCopySuccessToast] = useState("");

  const handleGenerateAiCopy = async (title?: string, price?: number) => {
    const targetTitle = title || aiCopyInputTitle || "تيشيرت بولو قطن مصري فاخر";
    const targetPrice = price || aiCopyInputPrice || 550;
    setAiCopyInputTitle(targetTitle);
    setAiCopyInputPrice(targetPrice);
    setIsAiCopyLoading(true);
    setShowAiCopyModal(true);

    try {
      const res = await generateSellerMarketingCopy({
        productTitle: targetTitle,
        category: "ملابس وأزياء",
        price: targetPrice,
        mainFeatures: ["قطن مصري 100%", "ياقة مقواة", "ألوان ثابتة"],
        knownLimitation: aiCopyInputLimitation || "القصة محكمة (Slim Fit) وتحتاج غسيل بارد",
        targetAudience: "general",
      });
      setAiCopyResult(res);
    } finally {
      setIsAiCopyLoading(false);
    }
  };

  const handleRunScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) {
      setScrapeError(
        isRtl
          ? "يرجى إدخال رابط صفحة أو منشور المتجر"
          : "Please enter page or post URL",
      );
      return;
    }
    if (!consentAgreed) {
      setScrapeError(
        isRtl
          ? "يجب الموافقة على تفويض الاستخراج التجاري وحماية الحقوق القانونية"
          : "You must accept the commercial scraping authorization agreement",
      );
      return;
    }

    setScrapeError("");
    setIsScraping(true);

    try {
      const res = await sellerApi.scrapeSocialMediaCatalog({
        platform: scrapePlatform,
        pageUrl: scrapeUrl,
        consentAgreed: true,
      });

      if (res?.success && Array.isArray(res?.products)) {
        setScrapedProducts(res.products);
      }
    } catch (err) {
      setScrapeError(
        isRtl
          ? "حدث خطأ أثناء الاتصال بأداة الـ Scraping"
          : "Scraping service connection failed",
      );
    } finally {
      setIsScraping(false);
    }
  };

  const handleImportSingleScraped = (item: any) => {
    const newProd: Product = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      title: item.title,
      category: item.category || "ملابس وأزياء",
      price: item.price,
      stock: item.stock || 15,
      sku: `SC-${scrapePlatform.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      supplierCode: `SOC-${scrapePlatform.slice(0, 3).toUpperCase()}`,
      officeName: `سوشيال ميديا (${scrapePlatform})`,
      material: item.material || "خامة معتمدة",
      sizes: ["S", "M", "L", "XL"],
      description: item.description,
      image: item.imageUrl,
      status: "approved",
      marketPerformance: "ممتاز وعالي الربحية",
    };

    setProducts((prev) => [newProd, ...prev]);

    addPlatformProduct({
      title: item.title,
      price: item.price,
      brandId: "b-townteam",
      brandName: "Town Team (متجر البائع)",
      category: item.category || "ملابس رجالي",
      imageUrl: item.imageUrl,
      description: item.description,
      stock: item.stock || 15,
      isScraped: true,
      scrapedSource: scrapePlatform,
      scrapedPostUrl: scrapeUrl,
    });

    setImportSuccessMsg(
      isRtl
        ? `✓ تم استيراد "${item.title}" بنجاح وإدراجه في الكتالوج المباشر!`
        : `✓ "${item.title}" successfully imported to catalog!`,
    );
    setTimeout(() => setImportSuccessMsg(""), 3500);
  };

  const handleImportAllScraped = () => {
    scrapedProducts.forEach((item) => handleImportSingleScraped(item));
    setShowScrapeModal(false);
    setScrapedProducts([]);
    setScrapeUrl("");
  };

  const [products, setProducts] = useState<Product[]>([
    {
      id: "PROD-101",
      title: "تيشيرت بولو قطن 100% ممتاز",
      category: "ملابس وأزياء",
      price: 450,
      stock: 25,
      sku: "TSH-BLK-L",
      supplierCode: "SUP-882",
      officeName: "مكتب النيل للمنسوجات",
      material: "قطن 100% مصري",
      sizes: ["M", "L", "XL"],
      description: "قميص بولو قطني عالي الجودة.",
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300",
      status: "approved",
      marketPerformance: "ممتاز وعالي الربحية",
    },
    {
      id: "PROD-102",
      title: "ساعة يد رقمية رياضية",
      category: "إلكترونيات",
      price: 890,
      stock: 4,
      sku: "WTC-DIG-01",
      supplierCode: "SUP-410",
      officeName: "مكتب أورورا",
      material: "سيليكون مقاوم للماء",
      sizes: ["Standard"],
      description: "ساعة رياضية خفيفة.",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
      status: "pending",
      marketPerformance: "تحت المراجعة",
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    sizes: "M, L, XL",
    category: "ملابس وأزياء",
    material: "قطن 100%",
    supplierCode: "",
    officeName: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) return;

    const created: Product = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      title: form.title,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: form.category,
      material: form.material,
      supplierCode: form.supplierCode || "SUP-LOCAL",
      officeName: form.officeName || "المكتب الرئيسي",
      sizes: form.sizes.split(",").map((s) => s.trim()),
      description: form.description,
      image: selectedFile
        ? URL.createObjectURL(selectedFile)
        : "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300",
      status: "pending",
      marketPerformance: "تحت المراجعة",
    };

    setProducts([created, ...products]);
    setShowAddModal(false);
    setForm({
      title: "",
      price: "",
      stock: "",
      sizes: "M, L, XL",
      category: "ملابس وأزياء",
      material: "قطن 100%",
      supplierCode: "",
      officeName: "",
      description: "",
    });
    setSelectedFile(null);
  };

  const isRtl = lang === "ar";

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const t = {
    title: isRtl ? "إدارة المنتجات والمخزون" : "Catalog Management",
    dashboard: isRtl ? "لوحة التحكم" : "Dashboard",
    products: isRtl ? "المنتجات" : "Products",
    brands: isRtl ? "البراندات" : "Brands",
    orders: isRtl ? "الطلبات" : "Orders",
    wallet: isRtl ? "المحفظة" : "Wallet",
    logout: isRtl ? "خروج" : "Logout",
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* 🔹 شريط التنقل العلوي المباشر (Navbar) */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white border-slate-300 text-black shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="cursor-pointer"
              onClick={() => navigate("/seller/dashboard")}
            >
              <BrandLogo showText={true} />
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-lg border hidden md:inline-block ${
                isDarkMode
                  ? "bg-slate-800 text-indigo-400 border-slate-700"
                  : "bg-indigo-50 text-indigo-950 border-indigo-200"
              }`}
            >
              {t.title}
            </span>
          </div>

          {/* روابط التنقل للشاشات الكبيرة */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-black">
            <button
              onClick={() => navigate("/seller/dashboard")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => navigate("/seller/products")}
              className="px-3 py-2 rounded-xl transition cursor-pointer bg-indigo-600 text-white shadow-xs"
            >
              {t.products}
            </button>
            <button
              onClick={() => navigate("/seller/brands")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.brands}
            </button>
            <button
              onClick={() => navigate("/seller/orders")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.orders}
            </button>
            <button
              onClick={() => navigate("/seller/wallet")}
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.wallet}
            </button>
          </nav>

          {/* الأزرار والإعدادات (الدارك مود، اللغة، الخروج) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-amber-400"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  : "bg-white border-slate-300 text-black hover:bg-slate-100"
              }`}
            >
              {isRtl ? "English" : "عربي"}
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <LogoutIcon className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* شريط التنقل السفلي للهواتف */}
      <div
        className={`lg:hidden border-b px-4 py-2.5 flex items-center justify-around text-xs font-black ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-black"
        }`}
      >
        <button
          onClick={() => navigate("/seller/dashboard")}
          className="cursor-pointer"
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => navigate("/seller/products")}
          className="cursor-pointer text-indigo-600 dark:text-indigo-400"
        >
          {t.products}
        </button>
        <button
          onClick={() => navigate("/seller/brands")}
          className="cursor-pointer"
        >
          {t.brands}
        </button>
        <button
          onClick={() => navigate("/seller/orders")}
          className="cursor-pointer"
        >
          {t.orders}
        </button>
        <button
          onClick={() => navigate("/seller/wallet")}
          className="cursor-pointer"
        >
          {t.wallet}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div
          className={`p-6 rounded-2xl border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div>
            <h1 className="text-lg font-bold">
              {isRtl
                ? "كتالوج المنتجات وجرد المخزون وتحليلات الأداء"
                : "Product Catalog & Analytics"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl
                ? "إضافة منتجات مع رفع الصور المحلية، كود المورد، وتحليل أداء السوق لكل منتج"
                : "Upload local images & analyze market status"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleGenerateAiCopy()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <SparklesIcon className="w-4 h-4 text-slate-950" />
              <span>
                {isRtl
                  ? "مساعد كتابة البوست وتوجيهات التصوير بالـ AI"
                  : "AI Copywriter & Photo Advisory"}
              </span>
            </button>

            <button
              onClick={() => setShowScrapeModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>
                {isRtl
                  ? "استيراد ذكي من السوشيال ميديا"
                  : "AI Social Scraping"}
              </span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{isRtl ? "إضافة منتج جديد" : "Add Product"}</span>
            </button>
          </div>
        </div>

        {importSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-black animate-fade-in flex items-center justify-between">
            <span>{importSuccessMsg}</span>
            <button
              onClick={() => setImportSuccessMsg("")}
              className="opacity-70 hover:opacity-100 cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* جدول المنتجات مع عمود تحليل السوق */}
        <div
          className={`rounded-2xl border shadow-2xs overflow-x-auto ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <table className="w-full text-right text-xs">
            <thead>
              <tr
                className={`border-b font-bold ${isDarkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}
              >
                <th className="p-4">{isRtl ? "المنتج والصورة" : "Product"}</th>
                <th className="p-4">{isRtl ? "المورد والمكتب" : "Supplier"}</th>
                <th className="p-4">{isRtl ? "السعر" : "Price"}</th>
                <th className="p-4">{isRtl ? "المخزون" : "Stock"}</th>
                <th className="p-4">{isRtl ? "حالة السوق والربحية" : "Market Status"}</th>
                <th className="p-4">{isRtl ? "الاعتماد" : "Status"}</th>
                <th className="p-4">{isRtl ? "مساعد البوست بالـ AI" : "AI Marketing Copy"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <div>
                      <p className="font-bold">{p.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.category} | {p.material}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{p.officeName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {p.supplierCode}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {p.price} EGP
                  </td>
                  <td className="p-4 font-bold">
                    {p.stock} {isRtl ? "قطعة" : "units"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${p.marketPerformance === "ممتاز وعالي الربحية" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}
                    >
                      {p.marketPerformance}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.status === "approved" ? (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>معتمد</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>قيد المراجعة</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleGenerateAiCopy(p.title, p.price)}
                      className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <SparklesIcon className="w-3.5 h-3.5" />
                      <span>توليد بوست وتوجيهات</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* مودال الإضافة مع رفع الصور */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-xl w-full p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm">
                {isRtl
                  ? "إضافة منتج جديد ورفع الصور"
                  : "Add Product & Upload Image"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-rose-500"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  {isRtl ? "عنوان المنتج" : "Title"}
                </label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-900 border-slate-300 dark:bg-slate-950 dark:text-white dark:border-slate-800"
                  placeholder="مثال: قميص أبيض كاجوال قطن"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {isRtl ? "السعر (EGP)" : "Price"}
                  </label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-900 border-slate-300 dark:bg-slate-950 dark:text-white dark:border-slate-800"
                    placeholder="350"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    {isRtl ? "الكمية المتوفرة" : "Stock"}
                  </label>
                  <input
                    required
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-900 border-slate-300 dark:bg-slate-950 dark:text-white dark:border-slate-800"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {isRtl ? "اسم المكتب المورد" : "Office Name"}
                  </label>
                  <input
                    type="text"
                    value={form.officeName}
                    onChange={(e) =>
                      setForm({ ...form, officeName: e.target.value })
                    }
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-900 border-slate-300 dark:bg-slate-950 dark:text-white dark:border-slate-800"
                    placeholder="مكتب الأمل للملابس"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    {isRtl ? "كود المورد" : "Supplier Code"}
                  </label>
                  <input
                    type="text"
                    value={form.supplierCode}
                    onChange={(e) =>
                      setForm({ ...form, supplierCode: e.target.value })
                    }
                    className="w-full p-2.5 border rounded-lg bg-white text-slate-900 border-slate-300 dark:bg-slate-950 dark:text-white dark:border-slate-800"
                    placeholder="SUP-909"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {isRtl
                    ? "رفع صورة المنتج من الجهاز (Local File)"
                    : "Upload Product Image"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setSelectedFile(e.target.files[0])
                  }
                  className="w-full p-2 border rounded-lg bg-white text-slate-900 border-slate-300 dark:bg-slate-950 dark:text-white dark:border-slate-800 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {isRtl ? "الوصف الكامل" : "Description"}
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg bg-white text-slate-900 border-slate-300 dark:bg-slate-950 dark:text-white dark:border-slate-800"
                  placeholder="تفاصيل المنتج..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  حفظ وإرسال للمراجعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 🤖 نافذة استيراد المنتجات بالذكاء الاصطناعي و الـ Social Scraping */}
      {showScrapeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className={`border p-6 rounded-2xl w-full max-w-xl space-y-4 shadow-2xl transition max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-sm flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-indigo-400" />
                  <span>
                    {isRtl
                      ? "استيراد المنتجات من السوشيال ميديا بالذكاء الاصطناعي"
                      : "AI Social Media Web Scraping & Extraction"}
                  </span>
                </h3>
                <p className="text-[11px] opacity-60 mt-0.5">
                  {isRtl
                    ? "استخراج تلقائي للصور، خامات الأقمشة، والأسعار من إنستجرام، فيسبوك، أو تيك توك"
                    : "Automated computer vision & OCR extraction from social posts"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowScrapeModal(false);
                  setScrapedProducts([]);
                  setScrapeError("");
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRunScrape} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">
                  {isRtl ? "اختر منصة التواصل الاجتماعي:" : "Select Platform:"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScrapePlatform("instagram")}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      scrapePlatform === "instagram"
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-500 font-black"
                        : isDarkMode
                          ? "bg-slate-950 border-slate-800 text-slate-300"
                          : "bg-slate-50 border-slate-300 text-slate-700"
                    }`}
                  >
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScrapePlatform("facebook")}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      scrapePlatform === "facebook"
                        ? "bg-blue-500/20 border-blue-500 text-blue-500 font-black"
                        : isDarkMode
                          ? "bg-slate-950 border-slate-800 text-slate-300"
                          : "bg-slate-50 border-slate-300 text-slate-700"
                    }`}
                  >
                    <span>Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScrapePlatform("tiktok")}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      scrapePlatform === "tiktok"
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 font-black"
                        : isDarkMode
                          ? "bg-slate-950 border-slate-800 text-slate-300"
                          : "bg-slate-50 border-slate-300 text-slate-700"
                    }`}
                  >
                    <span>TikTok</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {isRtl
                    ? "رابط البروفايل أو المنشور المستهدف:"
                    : "Target Profile or Post URL:"}
                </label>
                <input
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder={
                    scrapePlatform === "instagram"
                      ? "https://www.instagram.com/p/C-example..."
                      : scrapePlatform === "facebook"
                        ? "https://www.facebook.com/brandpage/posts/..."
                        : "https://www.tiktok.com/@brand/video/..."
                  }
                  className={`w-full p-2.5 border rounded-xl outline-none font-mono transition ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 text-white focus:border-purple-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500"
                  }`}
                  required
                />
              </div>

              {/* إقرار التفويض القانوني والأخلاقي لحماية المنصة */}
              <div
                className={`p-3 rounded-xl border text-[11px] space-y-2 ${
                  isDarkMode
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <label className="flex items-start gap-2 cursor-pointer font-bold select-none leading-relaxed">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 accent-purple-600 rounded cursor-pointer shrink-0"
                  />
                  <span>
                    {isRtl
                      ? "أقر وأفوض رسميًا: بصفتي المالك أو الممثل التجاري المرخص لهذه الصفحة، أمنح منصة 3ARB AURA الصلاحية التقنية والقانونية لقراءة وتحليل محتوى المنشورات واستخراج بيانات وصور وأسعار المنتجات وإدراجها بمتجري، مع التزامي الكامل بحقوق الملكية الفكرية."
                      : "Legal Authorization & Consent: I certify that I am the authorized representative of this account and grant 3ARB AURA legal and technical permission to extract product data, images, and prices for commercial catalog ingestion without IP infringement."}
                  </span>
                </label>
              </div>

              {scrapeError && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold">
                  {scrapeError}
                </div>
              )}

              <button
                type="submit"
                disabled={isScraping || !consentAgreed}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {isScraping ? (
                  <>
                    <RefreshIcon className="w-4 h-4 animate-spin text-purple-200" />
                    <span>
                      {isRtl
                        ? "جاري فحص الصفحة بالرؤية الحاسوبية واستخراج المنتجات..."
                        : "Scraping & Running AI Vision Engine..."}
                    </span>
                  </>
                ) : (
                  <>
                    <LightningIcon className="w-4 h-4 text-amber-300" />
                    <span>
                      {isRtl
                        ? "بدء تحليل المنشور واستخراج المنتجات (Run Scraper)"
                        : "Extract Products Now"}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* عرض المنتجات المستخرجة بعد انتهاء الـ Scraping */}
            {scrapedProducts.length > 0 && (
              <div className="pt-3 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-purple-400">
                    {isRtl
                      ? `تم استخراج ${scrapedProducts.length} منتجات بنجاح:`
                      : `Successfully extracted ${scrapedProducts.length} products:`}
                  </h4>
                  <button
                    onClick={handleImportAllScraped}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>
                      {isRtl
                        ? "استيراد الكل للكتالوج"
                        : "Import All to Catalog"}
                    </span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {scrapedProducts.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        isDarkMode
                          ? "bg-slate-950 border-slate-800"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h5 className="font-bold text-xs">{item.title}</h5>
                          <p className="text-[10px] opacity-60 line-clamp-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] mt-0.5">
                            <span className="font-mono font-bold text-emerald-500">
                              {item.price} EGP
                            </span>
                            <span className="opacity-50">•</span>
                            <span className="opacity-70 text-[10px]">
                              {item.material}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleImportSingleScraped(item)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                      >
                        {isRtl ? "+ استيراد" : "+ Import"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* مودال مساعد كتابة البوست وتوجيهات التصوير بالذكاء الاصطناعي */}
      {showAiCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border p-6 rounded-2xl w-full max-w-2xl space-y-4 shadow-2xl transition max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-500">
                    {isRtl
                      ? "مساعد كتابة البوستات وتوجيهات التصوير بالذكاء الاصطناعي"
                      : "Smart AI Social Marketing Copywriter & Visual Advisor"}
                  </h3>
                  <p className="text-[11px] opacity-60">
                    صياغة بوستات تسويقية جذابة بلهجة السوق المصري، توجيهات التصوير الاحترافي، واستراتيجية إبراز المزايا
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiCopyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* حقول تعديل المدخلات للذكاء الاصطناعي */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-black block mb-1">اسم المنتج أو البوست:</label>
                  <input
                    type="text"
                    value={aiCopyInputTitle}
                    onChange={(e) => setAiCopyInputTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-black block mb-1">سعر البيع المقترح (ج.م):</label>
                  <input
                    type="number"
                    value={aiCopyInputPrice}
                    onChange={(e) => setAiCopyInputPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-black block mb-1">
                  أي ملاحظة أو قيد محتمل (مثل: قياس ضيق أو غسيل يدوي فقط) لتحويله لميزة بيعية:
                </label>
                <input
                  type="text"
                  value={aiCopyInputLimitation}
                  onChange={(e) => setAiCopyInputLimitation(e.target.value)}
                  placeholder="مثال: القصة Slim Fit وتفضل المقاس الأكبر، أو تحتاج غسيل بارد"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold outline-none"
                />
              </div>

              <button
                onClick={() => handleGenerateAiCopy()}
                disabled={isAiCopyLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-xs transition flex items-center justify-center gap-1.5"
              >
                {isAiCopyLoading ? (
                  <>
                    <RefreshIcon className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>جاري التوليد وإعادة الصياغة...</span>
                  </>
                ) : (
                  <>
                    <RefreshIcon className="w-3.5 h-3.5 text-slate-950" />
                    <span>إعادة توليد الاقتراحات التسويقية</span>
                  </>
                )}
              </button>
            </div>

            {copySuccessToast && (
              <div className="p-2.5 bg-emerald-500/15 text-emerald-500 text-center rounded-xl text-xs font-black animate-fade-in flex items-center justify-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>{copySuccessToast}</span>
              </div>
            )}

            {/* عرض نتائج الذكاء الاصطناعي */}
            {aiCopyResult && (
              <div className="space-y-4 text-xs">
                {/* 1. العناوين الخاطفة */}
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <span className="font-black text-amber-500 text-xs flex items-center gap-1.5">
                    <TargetIcon className="w-3.5 h-3.5" />
                    <span>عناوين مقترحة خاطفة للبوست (Hook Titles):</span>
                  </span>
                  <div className="space-y-1.5">
                    {aiCopyResult.catchyTitles.map((hook, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-2"
                      >
                        <span className="font-bold">{hook}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(hook);
                            setCopySuccessToast("تم نسخ العنوان للحافظة");
                            setTimeout(() => setCopySuccessToast(""), 3000);
                          }}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-[10px] font-black cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <CopyIcon className="w-3 h-3" />
                          <span>نسخ</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. نص البوست التسويقي الجاهز للنسخ */}
                <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-indigo-400 text-xs flex items-center gap-1.5">
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                      <span>كابشن البوست بأسلوب مصري تفاعلي (Facebook & Instagram):</span>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiCopyResult.socialPostAr);
                        setCopySuccessToast("تم نسخ نص البوست بالكامل");
                        setTimeout(() => setCopySuccessToast(""), 3000);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1"
                    >
                      <CopyIcon className="w-3 h-3" />
                      <span>نسخ البوست بالكامل</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-90">
                    {aiCopyResult.socialPostAr}
                  </pre>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiCopyResult.recommendedTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. توجيهات الصورة الاحترافية */}
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5">
                  <span className="font-black text-emerald-500 text-xs flex items-center gap-1.5">
                    <CameraIcon className="w-3.5 h-3.5" />
                    <span>توجيهات التصوير لجعل الصور جذابة (Attractive Visuals):</span>
                  </span>
                  <p className="text-[11px] font-bold opacity-80">
                    {aiCopyResult.photoAdvice.lightingAndBackdrop}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                        <span>عناصر ينصح بإضافتها في الكادر:</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[10px] opacity-80">
                        {aiCopyResult.photoAdvice.elementsToAdd.map((el, i) => (
                          <li key={i}>{el}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-black text-rose-500 flex items-center gap-1">
                        <CloseIcon className="w-3 h-3 text-rose-500" />
                        <span>عناصر ينصح بإزالتها وتفاديها:</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[10px] opacity-80">
                        {aiCopyResult.photoAdvice.elementsToRemove.map((el, i) => (
                          <li key={i}>{el}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 4. استراتيجية إبراز المزايا وتجاوز العيوب */}
                <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2">
                  <span className="font-black text-purple-400 text-xs flex items-center gap-1.5">
                    <InfoIcon className="w-3.5 h-3.5" />
                    <span>استراتيجية إبراز المزايا وتحويل أي قيد إلى ميزة فخمة:</span>
                  </span>
                  <p className="text-[11px] font-bold opacity-90 leading-relaxed whitespace-pre-line p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {aiCopyResult.overcomingLimitationStrategyAr}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;
