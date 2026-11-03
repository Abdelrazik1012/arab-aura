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
      userName: "اسم المستخدم",
      birthDate: "تاريخ الميلاد (16+ سنة)",
      year: "السنة",
      month: "الشهر",
      day: "اليوم",
      email: "البريد الالكتروني",
      nationalId: "البطاقة الشخصية (14 رقم)",
      password: "كلمة السر",
      confirmPassword: "تأكيد كلمة السر",
      taxCommercial: "السجل التجاري والبطاقة الضريبية",
      driverLicense: "رخصة القيادة",
      vehicleLicense: "رخصة المركبة",
      vehiclePlate: "رقم لوحة المركبة",
      guarantorTitle: "بيانات الضامن المعتمد (في حالة التعذر)",
      guarantorName: "اسم الضامن بالكامل",
      guarantorId: "الرقم القومي للضامن",
      guarantorPhone: "رقم هاتف الضامن",
      termsText: "أوافق على الشروط والأحكام وسياسة الخصوصية منصة عرب أورا.",
      submitBtn: "تم",
      loadingText: "جاري التسجيل...",
      footer: "© 2026 3ARB AURA - جميع الحقوق محفوظة لمشروع التخرج.",
      titles: {
        user: "حساب شخصي",
        seller: "حساب بائع",
        driver: "حساب سائق",
        collector: "حساب مُجمّع",
      },
    },
    en: {
      loginBtn: "Login",
      firstName: "First Name",
      lastName: "Last Name",
      userName: "Username",
      birthDate: "Birth Date (16+ years)",
      year: "Year",
      month: "Month",
      day: "Day",
      email: "Email Address",
      nationalId: "National ID (14 digits)",
      password: "Password",
      confirmPassword: "Confirm Password",
      taxCommercial: "Commercial Register & Tax ID",
      driverLicense: "Driver License",
      vehicleLicense: "Vehicle License",
      vehiclePlate: "Vehicle Plate Number",
      guarantorTitle: "Guarantor Information",
      guarantorName: "Guarantor Full Name",
      guarantorId: "Guarantor National ID",
      guarantorPhone: "Guarantor Phone Number",
      termsText: "I agree to Terms & Conditions and Privacy Policy.",
      submitBtn: "Done",
      loadingText: "Registering...",
      footer: "© 2026 3ARB AURA - All rights reserved for graduation project.",
      titles: {
        user: "Personal Account",
        seller: "Seller Account",
        driver: "Driver Account",
        collector: "Collector Account",
      },
    },
  };

  const currentData = t[lang];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

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
    (currentYear - i).toString(),
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim())
      newErrors.firstName =
        lang === "ar" ? "الاسم الأول مطلوب" : "First name is required";
    if (!lastName.trim())
      newErrors.lastName =
        lang === "ar" ? "الاسم الأخير مطلوب" : "Last name is required";
    if (!email || !/\S+@\S+\.\S+/.test(email))
      newErrors.email =
        lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
    if (nationalId.length > 0 && nationalId.length !== 14) {
      newErrors.nationalId =
        lang === "ar"
          ? "الرقم القومي المصري يجب أن يكون 14 رقماً"
          : "Egyptian National ID must be 14 digits";
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
    if (!agreeTerms)
      newErrors.agreeTerms =
        lang === "ar"
          ? "يجب الموافقة على الشروط والأحكام"
          : "You must agree to the terms";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const backendRole = role === "user" ? "customer" : role;
      await authService.register({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        phone: guarantorPhone || nationalId || "+201092242607",
        role: backendRole,
        brandName: role === "seller" ? `${firstName} Fashion` : undefined,
      });
      alert(lang === "ar" ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
      navigate("/login");
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
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-500 overflow-x-hidden ${
        isDarkMode
          ? "bg-[#0B0F19] text-[#F8FAFC]"
          : "bg-[#FDFBF7] text-[#2A363D]"
      }`}
    >
      <header
        className={`px-4 md:px-8 py-3 flex flex-wrap gap-2 justify-between items-center shadow-md border-b ${
          isDarkMode
            ? "bg-[#131C2E] border-cyan-500/20 text-white"
            : "bg-[#41535D] text-white"
        }`}
      >
        <BrandLogo onClick={() => navigate("/")} />

        <h1 className="text-base sm:text-lg md:text-xl font-black text-center order-first w-full md:w-auto md:order-none">
          {currentData.titles[role]}
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className={`text-[11px] sm:text-xs px-3 py-1.5 rounded-full font-bold transition border cursor-pointer ${
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
            className={`text-[11px] sm:text-xs p-1.5 px-3 rounded-full transition border cursor-pointer flex items-center gap-1.5 ${
              isDarkMode
                ? "bg-[#1E293B] text-amber-400 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs"
            }`}
          >
            {isDarkMode ? <SunIcon className="w-3.5 h-3.5 text-amber-400" /> : <MoonIcon className="w-3.5 h-3.5 text-slate-700" />}
            <span className="text-[11px] font-bold">{isDarkMode ? "فاتح" : "داكن"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className={`px-3 sm:px-4 py-1 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer ${
              isDarkMode
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "bg-white text-[#41535D]"
            }`}
          >
            {currentData.loginBtn}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className={`w-full p-4 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-xl space-y-4 sm:space-y-6 ${
            isDarkMode
              ? "bg-[#131C2E] border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.userName}
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder={currentData.firstName}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={currentData.lastName}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      isDarkMode
                        ? "bg-[#1E293B] border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  />
                </div>
                {(errors.firstName || errors.lastName) && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.firstName || errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.birthDate}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className={`px-2 py-2.5 rounded-xl border text-xs outline-none ${
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
                    className={`px-2 py-2.5 rounded-xl border text-xs outline-none ${
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
                    className={`px-2 py-2.5 rounded-xl border text-xs outline-none ${
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

              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.email}
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.nationalId}
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(e.target.value.replace(/\D/g, ""))
                  }
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300"
                  }`}
                />
                {errors.nationalId && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.nationalId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300"
                  }`}
                />
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5">
                  {currentData.confirmPassword}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                    isDarkMode
                      ? "bg-[#1E293B] border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300"
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

          <div className="pt-3 border-t border-gray-800/60">
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

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-12 py-3 rounded-full font-black text-sm sm:text-base transition-all duration-300 shadow-xl ${
                loading
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : isDarkMode
                    ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20 cursor-pointer"
                    : "bg-[#41535D] hover:bg-[#32414A] text-white cursor-pointer"
              }`}
            >
              {loading ? currentData.loadingText : currentData.submitBtn}
            </button>
          </div>
        </form>
      </main>

      <footer className="text-center py-2.5 text-[11px] sm:text-xs font-semibold text-gray-500 border-t border-gray-800/60">
        {currentData.footer}
      </footer>
    </div>
  );
};

export default RegisterFormScreen;
