import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { authService } from "../services/authService";
import BrandLogo from "../components/BrandLogo";
import { SunIcon, MoonIcon } from "../components/Icons";

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // مصفوفة أزواج الصور المزدوجة للتبديل في الكروت
  const imagePairs = [
    { back: "/loginphoto.png", front: "/download.jpeg" },
    { back: "/images.jpeg", front: "/istockphoto-2161831582-612x612.jpg" },
    {
      back: "/banner-the-concept-of-minimalist-fashion-clothes-women-s-blouses-and-t-shirts-on-a-hanger-on-a-white-background-with-copy-space-fashion-blog-website-social-media-post-photo.jpeg",
      front:
        "/women-s-aesthetic-minimal-fashion-pastel-clothes-made-washed-linen-stylish-female-blouses-dresses-pants-shirts-hanger-white-background-fashion-blog-website-social-media_408798-9507.avif",
    },
  ];

  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPairIndex((prevIndex) => (prevIndex + 1) % imagePairs.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [imagePairs.length]);

  const t = {
    ar: {
      sloganLine1: "كل البراندات",
      sloganLine2: "في مكان واحد",
      loginHeader: "تسجيل الدخول لعرب اورا",
      emailPlaceholder: "اسم المستخدم أو البريد الإلكتروني",
      passwordPlaceholder: "كلمة السر",
      submitBtn: "تسجيل الدخول",
      forgotPassword: "نسيت كلمة السر؟",
      createAccount: "ليس لديك حساب؟ إنشاء حساب جديد",
      loadingText: "جاري الدخول...",
      footer: "© 2026 3ARB AURA - جميع الحقوق محفوظة لمشروع التخرج.",
    },
    en: {
      sloganLine1: "All Brands",
      sloganLine2: "In One Place",
      loginHeader: "Sign In to 3ARB AURA",
      emailPlaceholder: "Username or Email Address",
      passwordPlaceholder: "Password",
      submitBtn: "Sign In",
      forgotPassword: "Forgot Password?",
      createAccount: "Don't have an account? Register now",
      loadingText: "Signing in...",
      footer: "© 2026 3ARB AURA - All rights reserved for graduation project.",
    },
  };

  const currentData = t[lang];

  // أنيميشن كتابة النص حرف بحرف
  const [typedLine1, setTypedLine1] = useState("");
  const [typedLine2, setTypedLine2] = useState("");

  useEffect(() => {
    setTypedLine1("");
    setTypedLine2("");

    let index1 = 0;
    let index2 = 0;
    const line1Text = currentData.sloganLine1;
    const line2Text = currentData.sloganLine2;

    const intervalLine1 = setInterval(() => {
      if (index1 < line1Text.length) {
        setTypedLine1(line1Text.slice(0, index1 + 1));
        index1++;
      } else {
        clearInterval(intervalLine1);

        const intervalLine2 = setInterval(() => {
          if (index2 < line2Text.length) {
            setTypedLine2(line2Text.slice(0, index2 + 1));
            index2++;
          } else {
            clearInterval(intervalLine2);
          }
        }, 80);
      }
    }, 80);

    return () => {
      clearInterval(intervalLine1);
    };
  }, [lang]);

  // 🔑 قائمة الحسابات المعتمدة لجميع الأدوار
  const mockUsers = [
    {
      username: "3arabbadr",
      email: "3arabbadr@admin.com",
      password: "12345678",
      role: "admin",
      name: "Abdelrazik Badr (Owner)",
    },
    {
      username: "ziad_yasser",
      email: "ziad@aura.com",
      password: "12345678",
      role: "user",
      name: "زياد ياسر",
    },
    {
      username: "brand_owner",
      email: "seller@aura.com",
      password: "12345678",
      role: "seller",
      name: "متجر البراند الشهير",
    },
    {
      username: "driver_hero",
      email: "driver@aura.com",
      password: "12345678",
      role: "driver",
      name: "أحمد محمود (سائق)",
    },
    {
      username: "hub_collector",
      email: "collector@aura.com",
      password: "12345678",
      role: "collector",
      name: "محمود حسن (مُجمّع)",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg(
        lang === "ar"
          ? "يرجى إدخال بريد أو اسم المستخدم"
          : "Please enter email or username",
      );
      return;
    }

    if (!password) {
      setErrorMsg(
        lang === "ar" ? "يرجى إدخال كلمة السر" : "Please enter your password",
      );
      return;
    }

    setLoading(true);

    const normalizedInput = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // 1️⃣ البحث الدقيق في الحسابات التجريبية (اسم المستخدم/الإيميل + كلمة السر)
    const foundUser = mockUsers.find(
      (u) =>
        (u.username.toLowerCase() === normalizedInput ||
          u.email.toLowerCase() === normalizedInput) &&
        u.password === trimmedPassword,
    );

    if (foundUser) {
      setTimeout(() => {
        setLoading(false);
        localStorage.setItem("user_data", JSON.stringify(foundUser));
        localStorage.setItem("user_role", foundUser.role);
        if (foundUser.role === "admin") {
          localStorage.setItem("original_admin", "true");
        }
        redirectByRole(foundUser.role);
      }, 400);
      return;
    }

    // 2️⃣ Dyanmic Mock Fallback: دخول تجريبي مرن عند إدخال اسم حساب معروف بدون التقيّد بالباسوورد
    let fallbackRole = "";
    if (normalizedInput === "3arabbadr" || normalizedInput.includes("admin")) {
      fallbackRole = "admin";
    } else if (
      normalizedInput === "hub_collector" ||
      normalizedInput.includes("collector")
    ) {
      fallbackRole = "collector";
    } else if (
      normalizedInput === "brand_owner" ||
      normalizedInput.includes("seller")
    ) {
      fallbackRole = "seller";
    } else if (
      normalizedInput === "driver_hero" ||
      normalizedInput.includes("driver")
    ) {
      fallbackRole = "driver";
    }

    if (fallbackRole) {
      const mockUserData = {
        username: normalizedInput,
        email: `${normalizedInput}@aura.com`,
        role: fallbackRole,
        name: normalizedInput,
      };
      setTimeout(() => {
        setLoading(false);
        localStorage.setItem("user_data", JSON.stringify(mockUserData));
        localStorage.setItem("user_role", fallbackRole);
        if (fallbackRole === "admin") {
          localStorage.setItem("original_admin", "true");
        }
        redirectByRole(fallbackRole);
      }, 400);
      return;
    }

    // 3️⃣ محاولة الدخول عبر السيرفر الخارجي (API Connection)
    try {
      await authService.login({
        identifier: email.trim(),
        email: email.trim(),
        password,
      });
      const savedRole = localStorage.getItem("user_role") || "user";
      redirectByRole(savedRole);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          (lang === "ar"
            ? "بيانات الدخول غير صحيحة"
            : "Invalid login credentials"),
      );
    } finally {
      setLoading(false);
    }
  };

  // تسجيل سريع بحساب Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const demoEmail = email.trim() || "user_google@gmail.com";
      const data = await authService.googleLogin({
        email: demoEmail,
        name: demoEmail.split("@")[0],
        role: "customer",
      });
      redirectByRole(data.user.role);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          (lang === "ar" ? "فشل تسجيل الدخول بـ Google" : "Google Sign-in failed")
      );
    } finally {
      setLoading(false);
    }
  };

  // دالة موحدة للتوجيه حسب الدور
  const redirectByRole = (role: string) => {
    const r = role === "customer" ? "user" : role;
    switch (r) {
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "driver":
        navigate("/driver/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "collector":
        navigate("/collector/dashboard");
        break;
      default:
        navigate("/customer/products");
        break;
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen w-full font-sans flex flex-col justify-between transition-colors duration-500 overflow-x-hidden ${
        isDarkMode
          ? "bg-[#0B0F19] text-[#F8FAFC]"
          : "bg-[#FDFBF7] text-[#1E293B]"
      }`}
    >
      {/* Header */}
      <header className="px-4 sm:px-8 py-3 flex justify-between items-center shrink-0 z-30">
        <BrandLogo onClick={() => navigate("/")} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className={`text-xs px-3 py-1.5 rounded-full font-bold transition border cursor-pointer ${
              isDarkMode
                ? "bg-[#1E293B] text-slate-200 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-xs"
            }`}
          >
            {lang === "ar" ? "English" : "عربي"}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`text-xs p-1.5 px-3 rounded-full font-bold transition border cursor-pointer flex items-center gap-1.5 ${
              isDarkMode
                ? "bg-[#1E293B] text-amber-400 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs"
            }`}
          >
            {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            <span className="text-[11px]">{isDarkMode ? "فاتح" : "داكن"}</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 max-w-7xl mx-auto w-full">
        <div
          className={`w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border transition-all my-auto ${
            isDarkMode
              ? "bg-[#131C2E] border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          {/* الجانب الأيسر: الكروت والألبوم */}
          <div
            className={`relative overflow-hidden hidden lg:flex flex-col justify-center items-center p-4 ${
              isDarkMode ? "bg-[#1A263D]/40" : "bg-[#E3F2ED]/40"
            }`}
          >
            <div className="relative w-full max-w-sm h-[360px] flex items-center justify-center">
              {/* الكرت الخلفي */}
              <div className="absolute w-44 sm:w-52 h-60 sm:h-72 bg-[#83B8A7] p-2 rounded-3xl rotate-6 top-1 right-6 shadow-xl overflow-hidden">
                {imagePairs.map((pair, idx) => (
                  <img
                    key={`back-${idx}`}
                    src={pair.back}
                    alt="Fashion Back"
                    className={`w-full h-full object-cover rounded-2xl transition-opacity duration-1000 absolute inset-0 p-1.5 ${
                      idx === currentPairIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo_app.png";
                    }}
                  />
                ))}
              </div>

              {/* الكرت الأمامي */}
              <div className="absolute w-44 sm:w-52 h-60 sm:h-72 bg-[#5DA392] p-2 rounded-3xl -rotate-6 bottom-4 left-6 shadow-2xl overflow-hidden z-10">
                {imagePairs.map((pair, idx) => (
                  <img
                    key={`front-${idx}`}
                    src={pair.front}
                    alt="Fashion Front"
                    className={`w-full h-full object-cover rounded-2xl transition-opacity duration-1000 absolute inset-0 p-1.5 ${
                      idx === currentPairIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo_app.png";
                    }}
                  />
                ))}
              </div>

              {/* النصوص أنيميشن الكتابة */}
              <div
                className={`absolute bottom-0 z-20 space-y-0.5 ${
                  lang === "ar" ? "right-4 text-right" : "left-4 text-left"
                }`}
              >
                <h3
                  className={`text-xl sm:text-2xl font-black tracking-wide min-h-[30px] drop-shadow-md ${
                    isDarkMode ? "text-white" : "text-[#1E293B]"
                  }`}
                >
                  {typedLine1}
                  {typedLine1.length < currentData.sloganLine1.length && (
                    <span className="animate-pulse">|</span>
                  )}
                </h3>
                <p
                  className={`text-lg sm:text-xl font-bold min-h-[28px] drop-shadow-md ${
                    isDarkMode ? "text-cyan-400" : "text-[#2B7A78]"
                  }`}
                >
                  {typedLine2}
                  {typedLine1.length >= currentData.sloganLine1.length &&
                    typedLine2.length < currentData.sloganLine2.length && (
                      <span className="animate-pulse">|</span>
                    )}
                </p>
              </div>
            </div>
          </div>

          {/* الجانب الثاني: فورم تسجيل الدخول */}
          <div className="flex flex-col justify-center items-center p-6 sm:p-10 my-auto">
            <div className="w-full max-w-sm space-y-5">
              <h2
                className={`text-2xl sm:text-3xl font-black text-center tracking-tight ${
                  isDarkMode ? "text-white" : "text-[#1E293B]"
                }`}
              >
                {currentData.loginHeader}
              </h2>

              {errorMsg && (
                <div className="p-2.5 bg-red-500/20 border border-red-500 text-red-500 rounded-xl text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder={currentData.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        : "bg-gray-50 border-gray-300 text-[#1E293B] focus:border-[#41535D] focus:ring-2 focus:ring-[#41535D]/20 placeholder-gray-500"
                    }`}
                  />
                </div>

                <div>
                  <input
                    type="password"
                    required
                    placeholder={currentData.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        : "bg-gray-50 border-gray-300 text-[#1E293B] focus:border-[#41535D] focus:ring-2 focus:ring-[#41535D]/20 placeholder-gray-500"
                    }`}
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-full font-black text-base transition-all duration-300 shadow-xl cursor-pointer ${
                      loading
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : isDarkMode
                          ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20 transform hover:scale-[1.01]"
                          : "bg-[#41535D] hover:bg-[#32414A] text-white transform hover:scale-[1.01]"
                    }`}
                  >
                    {loading ? currentData.loadingText : currentData.submitBtn}
                  </button>
                </div>
              </form>

              {/* 🌐 المتابعة بحساب Google */}
              <div className="w-full pt-1">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-full border font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer ${
                    isDarkMode
                      ? "bg-[#1E293B] border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{lang === "ar" ? "المتابعة السريعة بواسطة Google" : "Continue with Google"}</span>
                </button>
              </div>

              <div className="text-center space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className={`text-xs transition cursor-pointer ${
                    isDarkMode
                      ? "text-gray-400 hover:text-cyan-400"
                      : "text-gray-600 hover:text-[#2B7A78]"
                  }`}
                >
                  {currentData.forgotPassword}
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className={`text-xs font-bold transition cursor-pointer hover:underline ${
                      isDarkMode ? "text-cyan-400" : "text-[#2B7A78]"
                    }`}
                  >
                    {currentData.createAccount}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`text-center py-2 text-[11px] font-semibold shrink-0 border-t ${
          isDarkMode
            ? "text-gray-500 border-gray-800/60"
            : "text-gray-600 border-gray-200"
        }`}
      >
        {currentData.footer}
      </footer>
    </div>
  );
};

export default LoginScreen;
