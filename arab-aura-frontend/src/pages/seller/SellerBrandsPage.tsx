import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../../components/BrandLogo";
import {
  LogoutIcon,
  SunIcon,
  MoonIcon,
  CloseIcon,
  CheckCircleIcon,
  ClockIcon,
} from "../../components/Icons";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverBanner: string;
  description: string;
  status: "active" | "pending";
  productsCount: number;
}

export const SellerBrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const [brands, setBrands] = useState<Brand[]>([
    {
      id: "BRD-01",
      name: "أورا ستريت وير (Aura Streetwear)",
      slug: "aura-streetwear",
      logo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150",
      coverBanner:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      description: "علامة تجارية متخصصة في الأزياء الشبابية القطنية.",
      status: "active",
      productsCount: 14,
    },
    {
      id: "BRD-02",
      name: "زاك تيك (Zak Tech Electronics)",
      slug: "zak-tech",
      logo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150",
      coverBanner:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      description: "إكسسوارات الساعات والأجهزة الإلكترونية.",
      status: "pending",
      productsCount: 6,
    },
  ]);

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const isRtl = lang === "ar";

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    setBrands(brands.map((b) => (b.id === editingBrand.id ? editingBrand : b)));
    setEditingBrand(null);
  };

  const t = {
    title: isRtl ? "إدارة العلامات التجارية" : "Brands Workspace",
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
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-black"
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
              className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? "hover:bg-slate-800 text-white"
                  : "hover:bg-slate-200 text-black"
              }`}
            >
              {t.products}
            </button>
            <button
              onClick={() => navigate("/seller/brands")}
              className="px-3 py-2 rounded-xl transition cursor-pointer bg-indigo-600 text-white shadow-xs"
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
          className="cursor-pointer"
        >
          {t.products}
        </button>
        <button
          onClick={() => navigate("/seller/brands")}
          className="cursor-pointer text-indigo-600 dark:text-indigo-400"
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

      {/* المحتوى الرئيسي للصفحة */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
        <div
          className={`p-6 rounded-2xl border shadow-xs ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        >
          <h1 className="text-lg font-black">
            {isRtl
              ? "إدارة البراندات (اضغط على أي براند لتعديل بياناته)"
              : "Brand Storefronts & Editing"}
          </h1>
          <p
            className={`text-xs mt-0.5 ${isDarkMode ? "text-white/50" : "text-slate-500"}`}
          >
            {isRtl
              ? "تعديل أسماء البراندات، الأوصاف، والحالة"
              : "Click any brand to edit"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brands.map((b) => (
            <div
              key={b.id}
              onClick={() => setEditingBrand(b)}
              className={`rounded-2xl border shadow-xs overflow-hidden cursor-pointer hover:border-indigo-500 transition ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-white border-slate-300 text-black"
              }`}
            >
              <div className="h-32 bg-slate-200 dark:bg-slate-800 relative">
                <img
                  src={b.coverBanner}
                  alt={b.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 relative">
                <img
                  src={b.logo}
                  alt={b.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-slate-900 -mt-10 mb-2 shadow-xs"
                />
                <h3 className="font-black text-sm">{b.name}</h3>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? "text-white/70" : "text-slate-600"}`}
                >
                  {b.description}
                </p>
                <div
                  className={`mt-4 flex items-center justify-between border-t pt-3 ${
                    isDarkMode ? "border-slate-800" : "border-slate-200"
                  }`}
                >
                  <span className="text-[11px] font-black opacity-60">
                    {b.productsCount} منتج
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1 ${
                      b.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {b.status === "active" ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                        <span>نشط وموثق</span>
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-3 h-3 text-amber-500" />
                        <span>قيد المراجعة</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* مودال تعديل البراند */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-300 text-black"
            }`}
          >
            <div
              className={`flex justify-between items-center border-b pb-3 ${
                isDarkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <h3 className="font-black text-sm">
                {isRtl ? "تعديل بيانات العلامة التجارية" : "Edit Brand"}
              </h3>
              <button
                onClick={() => setEditingBrand(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSaveBrand}
              className="space-y-3 text-xs font-black"
            >
              <div>
                <label className="block mb-1">
                  {isRtl ? "اسم البراند" : "Brand Name"}
                </label>
                <input
                  type="text"
                  value={editingBrand.name}
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, name: e.target.value })
                  }
                  className={`w-full p-2.5 border rounded-lg outline-none ${
                    isDarkMode
                      ? "bg-slate-950 text-white border-slate-700"
                      : "bg-white text-black border-slate-300"
                  }`}
                />
              </div>
              <div>
                <label className="block mb-1">
                  {isRtl ? "وصف البراند" : "Description"}
                </label>
                <textarea
                  rows={3}
                  value={editingBrand.description}
                  onChange={(e) =>
                    setEditingBrand({
                      ...editingBrand,
                      description: e.target.value,
                    })
                  }
                  className={`w-full p-2.5 border rounded-lg outline-none ${
                    isDarkMode
                      ? "bg-slate-950 text-white border-slate-700"
                      : "bg-white text-black border-slate-300"
                  }`}
                />
              </div>
              <div
                className={`pt-3 flex justify-end gap-2 border-t ${
                  isDarkMode ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    isDarkMode
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-slate-200 text-black hover:bg-slate-300"
                  }`}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black cursor-pointer shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerBrandsPage;
