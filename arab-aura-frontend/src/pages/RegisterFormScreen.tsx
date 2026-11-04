import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";
import { SunIcon, MoonIcon } from "../components/Icons";
import { authService } from "../services/authService";

type RoleType = "user" | "seller" | "driver" | "collector";

const RegisterFormScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const role = (searchParams.get("role") as RoleType) || "user";

  const t = {
    ar: {
      loginBtn: "دخول",
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      fullName: "الاسم بالكامل",
      userName: "اسم المستخدم (Username)",
      userNameHint: "💡 يمكنك تسجيل الدخول لاحقاً باسم المستخدم هذا أو ببريدك الإلكتروني",
      birthDate: "تاريخ الميلاد (16+ سنة)",
      year: "السنة",
      month: "الشهر",
      day: "اليوم",
      email: "البريد الإلكتروني",
      nationalId: "البطاقة الشخصية (14 رقم)",
      password: "كلمة السر",
      confirmPassword: "تأكيد كلمة السر",
      brandNameLabel: "اسم البراند / المتجر",
      brandNamePlaceholder: "مثال: كونكريت أو تاون تيم",
      taxCommercial: "السجل التجاري والبطاقة الضريبية",
      driverLicense: "رخصة القيادة",
      vehicleLicense: "رخصة المركبة",
      vehiclePlate: "رقم لوحة المركبة",
      guarantorTitle: "بيانات الضامن المعتمد (اختياري)",
      guarantorName: "اسم الضامن بالكامل",
      guarantorId: "الرقم القومي للضامن",
      guarantorPhone: "رقم هاتف الضامن",
      termsText: "أوافق على الشروط والأحكام وسياسة الخصوصية لمنصة عرب أورا.",
      submitBtn: "تم إنشاء الحساب والدخول",
      loadingText: "جاري إنشاء الحساب وتسجيل الدخول...",
      continueGoogle: "المتابعة السريعة باستخدام Google",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      footer: "© 2026 3ARB AURA - جميع الحقوق محفوظة لمشروع التخرج.",
      titles: {
        user: "حساب شخصي (عميل)",
        seller: "حساب بائع وتاجر ملابس",
        driver: "حساب كابتن توصيل",
        collector: "حساب مجمّع شحنات الحي",
      },
    },
    en: {
      loginBtn: "Login",
      firstName: "First Name",
      lastName: "Last Name",
      fullName: "Full Name",
      userName: "Username",
      userNameHint: "💡 You can log in later using this username or your email",
      birthDate: "Birth Date (16+ years)",
      year: "Year",
      month: "Month",
      day: "Day",
      email: "Email Address",
      nationalId: "National ID (14 digits)",
      password: "Password",
      confirmPassword: "Confirm Password",
      brandNameLabel: "Brand / Store Name",
      brandNamePlaceholder: "e.g. Concrete or Town Team",
      taxCommercial: "Commercial Register & Tax ID",
      driverLicense: "Driver License",
      vehicleLicense: "Vehicle License",
      vehiclePlate: "Vehicle Plate Number",
      guarantorTitle: "Guarantor Information (Optional)",
      guarantorName: "Guarantor Full Name",
      guarantorId: "Guarantor National ID",
      guarantorPhone: "Guarantor Phone Number",
      termsText: "I agree to Terms & Conditions and Privacy Policy.",
      submitBtn: "Create Account & Login",
      loadingText: "Creating Account & Logging in...",
      continueGoogle: "Continue with Google",
      alreadyHaveAccount: "Already have an account?",
      footer: "© 2026 3ARB AURA - All rights reserved for graduation project.",
      titles: {
        user: "Personal Account (Customer)",
        seller: "Seller & Fashion Merchant",
        driver: "Delivery Captain Account",
        collector: "Micro-Hub Collector Account",
      },
    },
  };

  const currentData = t[lang];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameCustomized, setIsUsernameCustomized] = useState(false);
  const [phone, setPhone] = useState("");
  const [brandName, setBrandName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [taxCommercialNo, setTaxCommercialNo] = useState("");
  const [driverLicenseNo, setDriverLicenseNo] = useState("");
  const [vehicleLicenseNo, setVehicleLicenseNo] = useState("");
  const [vehiclePlateNo, setVehiclePlateNo] = useState("");

  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorNationalId, setGuarantorNationalId] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) =>
    (currentYear - i).toString()
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // تحديث البريد واشتقاق اسم المستخدم تلقائياً
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (!isUsernameCustomized) {
      const autoUser = newEmail
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_.]/g, "");
      setUsername(autoUser);
    }
  };

  // تعديل اسم المستخدم يدوياً
  const handleUsernameChange = (newUsername: string) => {
    setIsUsernameCustomized(true);
    setUsername(newUsername.toLowerCase().replace(/[^a-zA-Z0-9_.]/g, ""));
  };

  // توجيه تلقائي مباشر حسب الدور بعد تسجيل الدخول
  const redirectAfterAuth = (userRole: string) => {
    const r = userRole === "customer" ? "user" : userRole;
    switch (r) {
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "driver":
        navigate("/driver/dashboard");
        break;
      case "collector":
        navigate("/collector/dashboard");
        break;
      default:
        navigate("/customer/products");
        break;
    }
  };

  // تسجيل سريع بحساب Google
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const demoEmail = email.trim() || `user_${Date.now().toString().slice(-4)}@gmail.com`;
      const demoName = `${firstName || "مستخدم"} ${lastName || "عرب أورا"}`.trim();
      const backendRole = role === "user" ? "customer" : role;

      const data = await authService.googleLogin({
        email: demoEmail,
        name: demoName,
        role: backendRole,
      });

      redirectAfterAuth(data.user.role);
    } catch (err: any) {
      setErrors({
        email:
          err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء المتابعة بحساب Google",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName =
        lang === "ar" ? "الاسم الأول مطلوب" : "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName =
        lang === "ar" ? "الاسم الأخير مطلوب" : "Last name is required";
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email =
        lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
    }
    if (!password || password.length < 6) {
      newErrors.password =
        lang === "ar"
          ? "كلمة المرور يجب ألا تقل عن 6 أحرف"
          : "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword =
        lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match";
    }
    if (!agreeTerms) {
      newErrors.agreeTerms =
        lang === "ar"
          ? "يجب الموافقة على الشروط والأحكام"
          : "You must agree to the terms";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const backendRole = role === "user" ? "customer" : role;
      const finalUser = username.trim() || email.split("@")[0].toLowerCase().replace(/[^a-zA-Z0-9_.]/g, "");

      const data = await authService.register({
        name: `${firstName} ${lastName}`.trim(),
        username: finalUser,
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || guarantorPhone.trim() || undefined,
        role: backendRole,
        nationalId,
        birthDate: birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth}-${birthDay}` : undefined,
        brandName: role === "seller" ? (brandName || `${firstName} Fashion`) : undefined,
      });

      // ✅ تسجيل الدخول التلقائي المباشر بدون إرجاع المستخدم لصفحة الدخول
      redirectAfterAuth(data.user.role);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        (lang === "ar" ? "فشل إنشاء الحساب" : "Registration failed");
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen w-full font-sans flex flex-col justify-between transition-colors duration-500 overflow-x-hidden ${
        isDarkMode
          ? "bg-[#0B0F19] text-[#F8FAFC]"
          : "bg-[#FDFBF7] text-[#2A363D]"
      }`}
    >
      {/* 🔝 الهيدر المتجاوب */}
      <header
        className={`px-3 sm:px-6 md:px-8 py-3 flex flex-wrap gap-2 justify-between items-center shadow-md border-b sticky top-0 z-40 ${
          isDarkMode
            ? "bg-[#131C2E]/95 backdrop-blur-md border-cyan-500/20 text-white"
            : "bg-[#41535D] text-white"
        }`}
      >
        <BrandLogo onClick={() => navigate("/")} />

        <h1 className="text-sm sm:text-base md:text-lg font-black text-center order-3 sm:order-none w-full sm:w-auto">
          {currentData.titles[role]}
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-full font-bold transition border cursor-pointer ${
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
            className={`text-xs p-1.5 px-2.5 sm:px-3 rounded-full transition border cursor-pointer flex items-center gap-1 ${
              isDarkMode
                ? "bg-[#1E293B] text-amber-400 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs"
            }`}
          >
            {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            <span className="text-[10px] font-bold hidden sm:inline">{isDarkMode ? "فاتح" : "داكن"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className={`px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs transition cursor-pointer ${
              isDarkMode
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "bg-white text-[#41535D] hover:bg-slate-100"
            }`}
          >
            {currentData.loginBtn}
          </button>
        </div>
      </header>

      {/* 📄 المحتوى ونموذج التسجيل */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto w-full">
        {/* زر التسجيل السريع بـ Google */}
        <div className="w-full mb-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-sm cursor-pointer ${
              isDarkMode
                ? "bg-[#1E293B] border-slate-700 text-white hover:bg-slate-800"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{currentData.continueGoogle}</span>
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-700/50" />
            <span className="text-[11px] text-gray-400 font-bold">
              {lang === "ar" ? "أو التسجيل بالبيانات" : "Or register with details"}
            </span>
            <div className="flex-1 border-t border-gray-700/50" />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`w-full p-4 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-xl space-y-4 sm:space-y-6 ${
            isDarkMode
              ? "bg-[#131C2E] border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* العمود الأول */}
            <div className="space-y-4">
              {/* الاسم الأول والأخير */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.fullName}
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder={currentData.firstName}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400"
                        : "bg-gray-50 border-gray-300 focus:border-[#41535D]"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={currentData.lastName}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400"
                        : "bg-gray-50 border-gray-300 focus:border-[#41535D]"
                    }`}
                  />
                </div>
                {(errors.firstName || errors.lastName) && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.firstName || errors.lastName}
                  </p>
                )}
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.email}
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400"
                      : "bg-gray-50 border-gray-300 focus:border-[#41535D]"
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* 🆔 اسم المستخدم (Username) المميز والمطلوب لتسجيل الدخول */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs sm:text-sm font-black text-cyan-500">
                    {currentData.userName}
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {lang === "ar" ? "يتم اشتقاقه تلقائياً ويمكنك تعديله" : "Auto-generated & editable"}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 rtl:right-3 rtl:left-auto flex items-center text-gray-400 font-bold text-xs pointer-events-none">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`w-full px-8 py-2.5 rounded-xl border text-xs sm:text-sm font-mono outline-none transition font-bold ${
                      isDarkMode
                        ? "bg-[#1E293B] border-cyan-500/40 text-cyan-300 focus:border-cyan-400"
                        : "bg-cyan-50/50 border-cyan-300 text-slate-800 focus:border-[#41535D]"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {currentData.userNameHint}
                </p>
              </div>

              {/* 📱 رقم الهاتف المحمول الشخصي */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {lang === "ar" ? "رقم الهاتف المحمول" : "Mobile Phone Number"}
                </label>
                <input
                  type="tel"
                  placeholder="010xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-mono outline-none transition ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400"
                      : "bg-gray-50 border-gray-300 focus:border-[#41535D]"
                  }`}
                />
              </div>

              {/* حقل اسم البراند إذا كان الحساب تاجر */}
              {role === "seller" && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-1.5 text-amber-400">
                    {currentData.brandNameLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={currentData.brandNamePlaceholder}
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${
                      isDarkMode
                        ? "bg-[#1E293B] border-amber-500/40 text-white focus:border-amber-400"
                        : "bg-amber-50/40 border-amber-300 text-slate-800 focus:border-amber-500"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* العمود الثاني */}
            <div className="space-y-4">
              {/* تاريخ الميلاد */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.birthDate}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className={`px-2 py-2.5 rounded-xl border text-xs outline-none transition cursor-pointer ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <option value="">{currentData.year}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className={`px-2 py-2.5 rounded-xl border text-xs outline-none transition cursor-pointer ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <option value="">{currentData.month}</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className={`px-2 py-2.5 rounded-xl border text-xs outline-none transition cursor-pointer ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <option value="">{currentData.day}</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* الرقم القومي */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.nationalId}
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="2991201xxxxxxxx"
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(e.target.value.replace(/\D/g, ""))
                  }
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-mono outline-none transition ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400"
                      : "bg-gray-50 border-gray-300 focus:border-[#41535D]"
                  }`}
                />
                {errors.nationalId && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.nationalId}
                  </p>
                )}
              </div>

              {/* كلمة السر */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400"
                      : "bg-gray-50 border-gray-300 focus:border-[#41535D]"
                  }`}
                />
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* تأكيد كلمة السر */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.confirmPassword}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white focus:border-cyan-400"
                      : "bg-gray-50 border-gray-300 focus:border-[#41535D]"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* الموافقة على الشروط */}
          <div className="pt-3 border-t border-gray-700/40">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer shrink-0"
              />
              <span className="text-[11px] sm:text-xs font-medium">
                {currentData.termsText}
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-[11px] text-rose-500 font-bold mt-1">
                {errors.agreeTerms}
              </p>
            )}
          </div>

          {/* زر التأكيد والإنشاء والتسجيل المباشر */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs text-gray-400 hover:text-cyan-400 transition"
            >
              {currentData.alreadyHaveAccount}{" "}
              <span className="font-bold underline text-cyan-500">
                {currentData.loginBtn}
              </span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-8 sm:px-12 py-3 rounded-full font-black text-xs sm:text-sm transition-all duration-300 shadow-xl cursor-pointer ${
                loading
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : isDarkMode
                    ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20"
                    : "bg-[#41535D] hover:bg-[#32414A] text-white"
              }`}
            >
              {loading ? currentData.loadingText : currentData.submitBtn}
            </button>
          </div>
        </form>
      </main>

      {/* الفوتر */}
      <footer className="text-center py-3 text-[11px] sm:text-xs font-semibold text-gray-500 border-t border-gray-800/60">
        {currentData.footer}
      </footer>
    </div>
  );
};

export default RegisterFormScreen;
