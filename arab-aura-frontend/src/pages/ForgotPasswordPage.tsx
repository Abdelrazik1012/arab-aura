import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { authService } from "../services/authService";
import BrandLogo from "../components/BrandLogo";
import {
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LockIcon,
} from "../components/Icons";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const [step, setStep] = useState<"input" | "otp" | "password" | "success">("input");
  const [method, setMethod] = useState<"email" | "whatsapp">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(60);

  const isRtl = lang === "ar";
  const activeIdentifier = method === "email" ? email.trim() : phone.trim();

  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // 1️⃣ إرسال كود التحقق (فحص وجود الحساب في قاعدة البيانات أولاً)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (method === "email") {
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        setErrorMsg(
          isRtl
            ? "يرجى إدخال بريد إلكتروني صحيح (مثال: name@gmail.com)"
            : "Please enter a valid email address (e.g. name@gmail.com)",
        );
        return;
      }
    } else {
      const cleanPhone = phone.trim().replace(/\D/g, "");
      const egPhoneRegex = /^(?:01)[0125][0-9]{8}$/;
      if (!cleanPhone || !egPhoneRegex.test(cleanPhone)) {
        setErrorMsg(
          isRtl
            ? "يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً (مثال: 01012345678)"
            : "Please enter a valid 11-digit Egyptian phone number (e.g. 01012345678)",
        );
        return;
      }
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword({
        identifier: activeIdentifier,
        method,
      });

      if (res?.data?.whatsappUrl) {
        setWhatsappUrl(res.data.whatsappUrl);
      }

      setSuccessMsg(
        res?.message ||
          (isRtl
            ? method === "email"
              ? `تم إرسال رمز التحقق إلى بريدك الإلكتروني (${activeIdentifier})`
              : `تم توليد رمز التحقق لرقمك (${activeIdentifier})، اضغط على زر واتساب بالأسفل لاستلامه`
            : "Verification code requested successfully!"),
      );
      setCountdown(60);
      setStep("otp");
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.message ||
        err.message ||
        (isRtl
          ? "حدث خطأ أثناء فحص البيانات، يرجى المحاولة لاحقاً"
          : "Error checking credentials, please try again");
      setErrorMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ التحقق من كود الـ OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg(
        isRtl
          ? "يرجى إدخال كود التحقق كاملاً المكون من 6 أرقام رقمية فقط"
          : "Please enter the full 6-digit numeric verification code",
      );
      return;
    }

    setLoading(true);
    try {
      await authService.verifyResetOtp(activeIdentifier, cleanOtp);
      setSuccessMsg(
        isRtl
          ? "تم التحقق من الرمز بنجاح! يمكنك الآن كتابة كلمة المرور الجديدة."
          : "Code verified successfully! You can now set your new password.",
      );
      setStep("password");
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          (isRtl
            ? "رمز التحقق غير صحيح أو انتهت صلاحيته! تأكد من الـ 6 أرقام."
            : "Invalid or expired verification code. Please check the 6 digits."),
      );
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ تعيين وحفظ كلمة المرور الجديدة
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg(
        isRtl
          ? "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام"
          : "Password must be at least 6 characters",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        isRtl ? "كلمتا المرور غير متطابقتين!" : "Passwords do not match!",
      );
      return;
    }

    setLoading(true);
    try {
      await authService.resetPasswordWithOtp(
        activeIdentifier,
        otpCode.trim(),
        newPassword,
      );
      setStep("success");
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          (isRtl
            ? "فشل تحديث كلمة المرور، يرجى المحاولة ثانية"
            : "Failed to reset password"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* هيدر الصفحة */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 py-3 flex items-center justify-between ${
          isDarkMode
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white/90 border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <BrandLogo showText={true} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-amber-400"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? (
              <SunIcon className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonIcon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={toggleLanguage}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                : "bg-white border-slate-300 text-black hover:bg-slate-100"
            }`}
          >
            {isRtl ? "English" : "عربي"}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
          >
            {isRtl ? "تسجيل الدخول" : "Sign In"}
          </button>
        </div>
      </header>

      {/* محتوى الاستعادة */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 sm:p-6 my-auto flex flex-col justify-center">
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 transition-all ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          {/* أيقونة وعنوان الخطوة */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 flex items-center justify-center">
              <LockIcon className="w-7 h-7 text-indigo-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {step === "input" &&
                (isRtl ? "استعادة كلمة المرور" : "Reset Password")}
              {step === "otp" &&
                (isRtl
                  ? method === "email"
                    ? "رمز التحقق المرسل لبريدك"
                    : "رمز التحقق عبر واتساب"
                  : "Verification Code (OTP)")}
              {step === "password" &&
                (isRtl ? "تعيين كلمة المرور الجديدة" : "Set New Password")}
              {step === "success" &&
                (isRtl
                  ? "تم تغيير كلمة المرور بنجاح!"
                  : "Password Reset Successfully!")}
            </h2>
            <p className="text-xs opacity-70">
              {step === "input" &&
                (isRtl
                  ? "اختر وسيلة الاستعادة المناسبة (البريد الإلكتروني أو واتساب)"
                  : "Choose your preferred recovery method (Email or WhatsApp)")}
              {step === "otp" &&
                (isRtl
                  ? method === "email"
                    ? `أدخل رمز الـ 6 أرقام المرسل إلى بريدك: ${email}`
                    : `أدخل رمز الـ 6 أرقام المرسل لرقمك: ${phone}`
                  : `Enter the 6-digit verification code sent to ${activeIdentifier}`)}
              {step === "password" &&
                (isRtl
                  ? "قم بكتابة كلمة مرور قوية جديدة لتسجيل الدخول بها"
                  : "Choose a strong password to protect your account")}
            </p>
          </div>

          {/* تبديل وسيلة الاستعادة (البريد الإلكتروني vs واتساب) */}
          {step === "input" && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setMethod("email");
                  setErrorMsg("");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  method === "email"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>✉️</span>
                <span>{isRtl ? "البريد الإلكتروني" : "Email (Gmail)"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod("whatsapp");
                  setErrorMsg("");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  method === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>💬</span>
                <span>{isRtl ? "واتساب / هاتف" : "WhatsApp / Phone"}</span>
              </button>
            </div>
          )}

          {/* رسائل التنبيه والخطأ */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold text-center flex items-center justify-center gap-2 animate-shake">
              <AlertTriangleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && step === "otp" && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* الخطوة 1: إدخال البريد أو رقم الهاتف */}
          {step === "input" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {method === "email" ? (
                <div>
                  <label className="block text-xs font-black mb-1.5 opacity-80">
                    {isRtl ? "عنوان البريد الإلكتروني (Gmail):" : "Email Address (Gmail):"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold outline-none transition ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600"
                    }`}
                  />
                  <span className="text-[10px] opacity-60 block mt-1">
                    {isRtl
                      ? "سنبحث عن حسابك ونرسل لك كود سري مكون من 6 أرقام إلى صندوق الوارد"
                      : "We will check your account and send a 6-digit code to your inbox"}
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black mb-1.5 opacity-80">
                    {isRtl ? "رقم الهاتف المصري المسجل:" : "Registered Egyptian Mobile Number:"}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold font-mono outline-none transition ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600"
                    }`}
                  />
                  <span className="text-[10px] opacity-60 block mt-1">
                    {isRtl
                      ? "يبدأ بـ 010 أو 011 أو 012 أو 015، وسنرسل كود التحقق عبر رسالة واتساب مباشرة"
                      : "Starts with 010, 011, 012, or 015. We will deliver the OTP via WhatsApp"}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                  method === "email"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <span>
                  {loading
                    ? isRtl
                      ? "جاري التحقق من الحساب والإرسال..."
                      : "Checking account..."
                    : isRtl
                    ? method === "email"
                      ? "إرسال رمز التحقق إلى الإيميل"
                      : "إرسال رمز التحقق عبر واتساب"
                    : "Send Verification Code"}
                </span>
                {isRtl ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* الخطوة 2: كود التحقق (OTP) بدون إظهار أي كود على الواجهة إطلاقاً */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* زر واتساب السريع إذا كان تم التوليد برقم الهاتف */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-400 text-xs font-black transition flex items-center justify-center gap-2 text-center"
                >
                  <span className="text-base">💬</span>
                  <span>{isRtl ? "فتح محادثة واتساب لاستلام الكود مباشرة" : "Open WhatsApp to view your OTP code"}</span>
                </a>
              )}

              <div>
                <label className="block text-xs font-black mb-1.5 opacity-80 text-center">
                  {isRtl
                    ? "أدخل كود التحقق المكون من 6 أرقام:"
                    : "Enter the 6-digit OTP Code:"}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className={`w-full p-3.5 text-center tracking-[0.5em] text-xl font-mono font-black rounded-xl border outline-none transition ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-amber-400 focus:border-indigo-500"
                      : "bg-slate-50 border-slate-300 text-indigo-700 focus:border-indigo-600"
                  }`}
                />
              </div>

              {/* إعادة إرسال الكود */}
              <div className="flex items-center justify-between text-xs opacity-70 px-1">
                {countdown > 0 ? (
                  <span>
                    {isRtl
                      ? `إعادة الإرسال بعد ${countdown} ثانية`
                      : `Resend code in ${countdown}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    className="text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    {isRtl ? "إعادة إرسال رمز جديد الآن" : "Resend new code now"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setStep("input");
                    setOtpCode("");
                    setErrorMsg("");
                  }}
                  className="text-xs font-bold hover:underline cursor-pointer opacity-80"
                >
                  {isRtl ? "← تغيير وسيلة الإرسال" : "← Change recovery details"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? (isRtl ? "جاري التحقق..." : "Verifying...") : (isRtl ? "تأكيد الرمز والمتابعة" : "Verify Code & Proceed")}</span>
                {isRtl ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* الخطوة 3: إدخال كلمة المرور الجديدة */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black mb-1.5 opacity-80">
                  {isRtl ? "كلمة المرور الجديدة (6 خانات كحد أدنى):" : "New Password (min 6 characters):"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold outline-none transition ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-3 flex items-center text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black mb-1.5 opacity-80">
                  {isRtl ? "تأكيد كلمة المرور الجديدة:" : "Confirm New Password:"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold outline-none transition ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ كلمة المرور الجديدة" : "Save New Password")}</span>
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* الخطوة 4: اكتمال العملية بنجاح */}
          {step === "success" && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-emerald-500">
                  {isRtl ? "تم تغيير كلمة المرور بنجاح!" : "Password Reset Successfully!"}
                </h3>
                <p className="text-xs opacity-70">
                  {isRtl
                    ? "تم تحديث كلمة المرور في قاعدة البيانات. يمكنك الآن تسجيل الدخول بحسابك مباشرة."
                    : "Your password has been securely updated. You can now sign in to your account."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                {isRtl ? "الانتقال إلى تسجيل الدخول الآن" : "Go to Login Page Now"}
              </button>
            </div>
          )}

          {/* روابط سفلية للرجوع */}
          {step !== "success" && (
            <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
              >
                {isRtl ? "← العودة لصفحة تسجيل الدخول" : "← Back to Sign In"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* الفوتر */}
      <footer className="text-center py-4 text-[11px] opacity-50">
        {isRtl
          ? "© 2026 عرب أورا - 3ARB AURA. جميع الحقوق محفوظة."
          : "© 2026 3ARB AURA. All rights reserved."}
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
