import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { authService } from "../../services/authService";
import type { AdminLayoutContextType } from "../../layouts/AdminLayout";
import {
  CameraIcon,
  CrownIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  LogoutIcon,
  LockIcon,
  TrashIcon,
  UserIcon,
} from "../../components/Icons";

// ضغط الصورة الشخصية تلقائياً لضمان سرعة الحفظ في قاعدة البيانات و localStorage
const compressImageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<AdminLayoutContextType | undefined>();
  const isDarkMode = outletCtx?.isDarkMode ?? true;
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadInitialProfile = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      const adminBackup = JSON.parse(localStorage.getItem("admin_profile") || "{}");
      return {
        name:
          localStorage.getItem("user_name") ||
          userData.name ||
          adminBackup.name ||
          "عبد الرازق بدر (المدير التنفيذي)",
        username: userData.username || adminBackup.username || "admin",
        email:
          localStorage.getItem("user_email") ||
          userData.email ||
          adminBackup.email ||
          "admin@aura.com",
        phone:
          localStorage.getItem("user_phone") ||
          userData.phone ||
          adminBackup.phone ||
          "01092242607",
        avatar:
          localStorage.getItem("user_avatar") ||
          userData.avatar ||
          adminBackup.avatar ||
          "",
        nationalId: userData.nationalId || adminBackup.nationalId || "",
        birthDate: userData.birthDate || adminBackup.birthDate || "",
      };
    } catch {
      return {
        name: "عبد الرازق بدر (المدير التنفيذي)",
        username: "admin",
        email: "admin@aura.com",
        phone: "01092242607",
        avatar: "",
        nationalId: "",
        birthDate: "",
      };
    }
  };

  const initial = loadInitialProfile();
  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [nationalId, setNationalId] = useState(initial.nationalId);
  const [birthDate, setBirthDate] = useState(initial.birthDate);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // جلب أحدث البيانات من السيرفر إن وجد توكن صالح
  useEffect(() => {
    const fetchLatest = async () => {
      const me = await authService.getMe();
      if (me && me.role === "admin") {
        if (me.name) setName(me.name);
        if (me.username) setUsername(me.username);
        if (me.email) setEmail(me.email);
        if (me.phone) setPhone(me.phone);
        if (me.avatar !== undefined) setAvatar(me.avatar || "");
        if (me.nationalId) setNationalId(me.nationalId);
        if (me.birthDate) setBirthDate(me.birthDate);
      }
    };
    fetchLatest();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMsg({
        type: "error",
        text: isRtl
          ? "يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)"
          : "Please select a valid image file (JPG, PNG, WEBP)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({
        type: "error",
        text: isRtl
          ? "حجم الصورة يجب ألا يتجاوز 5 ميجابايت"
          : "Image size must not exceed 5MB",
      });
      return;
    }

    try {
      const compressed = await compressImageToDataUrl(file);
      setAvatar(compressed);
      setSavingProfile(true);
      await authService.updateProfile({ avatar: compressed });
      setProfileMsg({
        type: "success",
        text: isRtl
          ? "تم تحديث الصورة الشخصية وحفظها بنجاح!"
          : "Profile photo updated and saved!",
      });
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          (isRtl ? "تعذر رفع الصورة، حاول مرة أخرى" : "Failed to upload photo"),
      });
    } finally {
      setSavingProfile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatar("");
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await authService.updateProfile({ avatar: "" });
      setProfileMsg({
        type: "success",
        text: isRtl ? "تم حذف الصورة الشخصية" : "Profile photo removed",
      });
    } catch {
      // handled in fallback
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setProfileMsg({
        type: "error",
        text: isRtl
          ? "الاسم بالكامل مطلوب (حرفان على الأقل)"
          : "Full name is required (at least 2 characters)",
      });
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setProfileMsg({
        type: "error",
        text: isRtl ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address",
      });
      return;
    }

    if (phone.trim()) {
      const cleanPhone = phone.trim().replace(/\D/g, "");
      if (!/^(?:20)?0?1[0125][0-9]{8}$/.test(cleanPhone)) {
        setProfileMsg({
          type: "error",
          text: isRtl
            ? "رقم الهاتف المصري غير صحيح (مثال: 01092242607)"
            : "Invalid Egyptian phone number (e.g. 01092242607)",
        });
        return;
      }
    }

    setSavingProfile(true);
    try {
      await authService.updateProfile({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        avatar,
        nationalId: nationalId.trim(),
        birthDate: birthDate.trim(),
      });
      setProfileMsg({
        type: "success",
        text: isRtl
          ? "تم حفظ جميع التعديلات وتحديث بيانات حساب الأدمن بنجاح!"
          : "Admin profile changes saved successfully!",
      });
    } catch (err: any) {
      setProfileMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          (isRtl ? "حدث خطأ أثناء حفظ البيانات" : "Failed to save profile"),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: isRtl
          ? "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف أو أرقام"
          : "New password must be at least 6 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
      });
      return;
    }

    setSavingPassword(true);
    try {
      await authService.updateProfile({ newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg({
        type: "success",
        text: isRtl
          ? "تم تحديث كلمة المرور وتشفيرها في قاعدة البيانات بنجاح!"
          : "Password updated and encrypted successfully!",
      });
    } catch (err: any) {
      setPasswordMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          (isRtl ? "تعذر تحديث كلمة المرور" : "Failed to update password"),
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // 🚪 تسجيل الخروج النهائي وإغلاق وضع الأدمن بالكامل
  const handleLogoutAdmin = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  const initials = (name || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase();

  const cardClass = `rounded-3xl border p-6 transition-colors ${
    isDarkMode
      ? "bg-slate-900/90 border-slate-800 text-white"
      : "bg-white border-slate-200 text-slate-900 shadow-xs"
  }`;

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition ${
    isDarkMode
      ? "bg-slate-950 border-slate-700 text-white focus:border-rose-500"
      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-600"
  }`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. بطاقة الهوية والصورة الشخصية */}
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* الصورة الشخصية مع زر التغيير */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-rose-500/40 shadow-xl bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-white tracking-wider">
                  {initials}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -end-2 p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg border-2 border-slate-900 transition cursor-pointer"
              title={isRtl ? "تغيير الصورة الشخصية" : "Change Profile Photo"}
            >
              <CameraIcon className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* بيانات العرض السريع */}
          <div className="flex-1 text-center sm:text-start space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black">{name}</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <CrownIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{isRtl ? "سوبر أدمن (المدير العام)" : "Super Admin"}</span>
              </span>
            </div>

            <p className="text-sm opacity-75 font-medium">
              {email} {username ? `• @${username}` : ""}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5"
              >
                <CameraIcon className="w-3.5 h-3.5" />
                <span>{isRtl ? "تغيير الصورة الشخصية" : "Upload New Photo"}</span>
              </button>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>{isRtl ? "حذف الصورة" : "Remove Photo"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. نموذج تعديل البيانات الشخصية */}
      <form onSubmit={handleSaveProfile} className={`${cardClass} space-y-5`}>
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black">
              {isRtl ? "البيانات الشخصية للأدمن" : "Admin Personal Information"}
            </h2>
            <p className="text-xs opacity-65">
              {isRtl
                ? "يمكنك تعديل اسمك، بريدك الإلكتروني، ورقم هاتفك وسيتم حفظها مباشرة في قاعدة البيانات"
                : "Update your name, email, username, and phone number directly in the database"}
            </p>
          </div>
        </div>

        {profileMsg && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              profileMsg.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            {profileMsg.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black mb-1.5 opacity-80">
              {isRtl ? "الاسم بالكامل" : "Full Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={isRtl ? "أدخل اسم المدير" : "Enter full name"}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-1.5 opacity-80">
              {isRtl ? "اسم المستخدم (Username)" : "Username"}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))
              }
              placeholder="admin"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-1.5 opacity-80">
              {isRtl ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@aura.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-1.5 opacity-80">
              {isRtl ? "رقم الهاتف المصري" : "Egyptian Phone Number"}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01092242607"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-1.5 opacity-80">
              {isRtl ? "الرقم القومي (اختياري)" : "National ID (Optional)"}
            </label>
            <input
              type="text"
              maxLength={14}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
              placeholder="30000000000000"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-1.5 opacity-80">
              {isRtl ? "تاريخ الميلاد (اختياري)" : "Birth Date (Optional)"}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>
              {savingProfile
                ? isRtl
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isRtl
                  ? "حفظ التعديلات"
                  : "Save Changes"}
            </span>
          </button>
        </div>
      </form>

      {/* 3. تغيير كلمة المرور والأمان */}
      <form onSubmit={handleSavePassword} className={`${cardClass} space-y-5`}>
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500">
            <LockIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black">
              {isRtl ? "الأمان وتغيير كلمة المرور" : "Security & Password"}
            </h2>
            <p className="text-xs opacity-65">
              {isRtl
                ? "قم بتحديث كلمة مرور حساب الأدمن في أي وقت"
                : "Update your administrator password at any time"}
            </p>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              passwordMsg.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            {passwordMsg.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black mb-1.5 opacity-80">
              {isRtl ? "كلمة المرور الجديدة" : "New Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
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
              {isRtl ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {savingPassword
              ? isRtl
                ? "جاري التحديث..."
                : "Updating..."
              : isRtl
                ? "تحديث كلمة المرور"
                : "Update Password"}
          </button>
        </div>
      </form>

      {/* 4. منطقة تسجيل الخروج وإغلاق وضع الأدمن نهائياً */}
      <div
        className={`rounded-3xl border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDarkMode
            ? "bg-rose-950/20 border-rose-500/30 text-white"
            : "bg-rose-50 border-rose-200 text-slate-900"
        }`}
      >
        <div className="flex items-start gap-3 text-center sm:text-start">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-500 shrink-0 hidden sm:flex">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-rose-500">
              {isRtl
                ? "تسجيل الخروج وإغلاق وضع الأدمن بالكامل"
                : "Sign Out & Close Super Admin Mode"}
            </h3>
            <p className="text-xs opacity-75 mt-1">
              {isRtl
                ? "سيتم إنهاء الجلسة وإخفاء شريط التبديل العائم نهائياً حتى تتمكن من الدخول بأي حساب آخر بدون صلاحيات الأدمن."
                : "This terminates your admin session, removes the floating role-switcher bar completely, and lets you sign in cleanly as any user."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutAdmin}
          className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black shadow-lg transition cursor-pointer shrink-0 flex items-center gap-2"
        >
          <LogoutIcon className="w-4 h-4" />
          <span>{isRtl ? "تسجيل الخروج الآن" : "Sign Out Now"}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminProfilePage;
