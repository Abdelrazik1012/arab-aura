// src/services/authService.ts
import api from "./api";

export interface LoginCredentials {
  email?: string;
  username?: string;
  identifier?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username?: string;
  email: string;
  password?: string;
  newPassword?: string;
  phone?: string;
  role?: string;
  nationalId?: string;
  birthDate?: string;
  brandName?: string;
  avatar?: string;
  address?: string;
  primaryAddress?: string;
  secondaryAddress?: string;
  secondaryPhone?: string;
}

const syncAdminBackup = (user: any) => {
  if (!user) return;
  const currentBackup = JSON.parse(localStorage.getItem("admin_profile") || "{}");
  const updated = {
    ...currentBackup,
    name: user.name || currentBackup.name || "عبد الرازق بدر (المدير التنفيذي)",
    email: user.email || currentBackup.email || "admin@aura.com",
    username: user.username || currentBackup.username || "admin",
    phone: user.phone || currentBackup.phone || "01092242607",
    avatar: user.avatar !== undefined ? user.avatar : currentBackup.avatar || "",
    nationalId: user.nationalId !== undefined ? user.nationalId : currentBackup.nationalId || "",
    birthDate: user.birthDate !== undefined ? user.birthDate : currentBackup.birthDate || "",
  };
  localStorage.setItem("admin_profile", JSON.stringify(updated));
};

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data?.success && response.data?.data) {
        const { token, user } = response.data.data;
        const normalizedRole = user.role === "customer" ? "user" : user.role;
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_data", JSON.stringify({ ...user, token }));
        localStorage.setItem("user_role", normalizedRole);
        localStorage.setItem("user_name", user.name || "");
        localStorage.setItem("user_email", user.email || "");
        localStorage.setItem("user_phone", user.phone || "");
        if (user.avatar) {
          localStorage.setItem("user_avatar", user.avatar);
        } else {
          localStorage.removeItem("user_avatar");
        }
        if (user.role === "admin") {
          localStorage.setItem("original_admin", "true");
          syncAdminBackup(user);
        } else {
          localStorage.removeItem("original_admin");
          localStorage.removeItem("admin_profile");
        }
        window.dispatchEvent(new Event("auth-state-changed"));
        return response.data.data;
      }
      throw new Error(response.data?.message || "فشل تسجيل الدخول");
    } catch (err: any) {
      console.warn("⚠️ [Live API Error] falling back to client logic if needed:", err.message);
      throw err;
    }
  },

  async register(userData: RegisterData) {
    const response = await api.post("/auth/register", userData);
    if (response.data?.success && response.data?.data) {
      const { token, user } = response.data.data;
      const normalizedRole = user.role === "customer" ? "user" : user.role;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify({ ...user, token }));
      localStorage.setItem("user_role", normalizedRole);
      localStorage.setItem("user_name", user.name || "");
      localStorage.setItem("user_email", user.email || "");
      localStorage.setItem("user_phone", user.phone || "");
      localStorage.removeItem("original_admin");
      localStorage.removeItem("admin_profile");
      if (user.avatar) {
        localStorage.setItem("user_avatar", user.avatar);
      } else {
        localStorage.removeItem("user_avatar");
      }
      window.dispatchEvent(new Event("auth-state-changed"));
      return response.data.data;
    }
    throw new Error(response.data?.message || "فشل إنشاء الحساب");
  },

  async googleLogin(data: { email: string; name?: string; avatar?: string; role?: string }) {
    const response = await api.post("/auth/google", data);
    if (response.data?.success && response.data?.data) {
      const { token, user } = response.data.data;
      const normalizedRole = user.role === "customer" ? "user" : user.role;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify({ ...user, token }));
      localStorage.setItem("user_role", normalizedRole);
      localStorage.setItem("user_name", user.name || "");
      localStorage.setItem("user_email", user.email || "");
      localStorage.setItem("user_phone", user.phone || "");
      if (user.avatar) {
        localStorage.setItem("user_avatar", user.avatar);
      } else {
        localStorage.removeItem("user_avatar");
      }
      if (user.role === "admin") {
        localStorage.setItem("original_admin", "true");
        syncAdminBackup(user);
      } else {
        localStorage.removeItem("original_admin");
        localStorage.removeItem("admin_profile");
      }
      window.dispatchEvent(new Event("auth-state-changed"));
      return response.data.data;
    }
    throw new Error(response.data?.message || "فشل تسجيل الدخول بواسطة Google");
  },

  async getMe() {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;
      const response = await api.get("/auth/me");
      if (response.data?.success && response.data?.data) {
        const user = response.data.data;
        const current = JSON.parse(localStorage.getItem("user_data") || "{}");
        const merged = { ...current, ...user };
        localStorage.setItem("user_data", JSON.stringify(merged));
        if (user.name) localStorage.setItem("user_name", user.name);
        if (user.email) localStorage.setItem("user_email", user.email);
        if (user.phone) localStorage.setItem("user_phone", user.phone);
        if (user.avatar !== undefined) localStorage.setItem("user_avatar", user.avatar || "");
        if (user.role === "admin") {
          syncAdminBackup(merged);
        }
        return user;
      }
    } catch (e) {
      console.warn("Could not fetch /auth/me from server:", e);
    }
    return null;
  },

  async updateProfile(updates: Partial<RegisterData>) {
    try {
      const response = await api.put("/auth/profile", updates);
      if (response.data?.success && response.data?.data) {
        const updatedUser = response.data.data.user || response.data.data;
        const current = JSON.parse(localStorage.getItem("user_data") || "{}");
        const merged = { ...current, ...updatedUser };
        localStorage.setItem("user_data", JSON.stringify(merged));
        if (merged.name) localStorage.setItem("user_name", merged.name);
        if (merged.email) localStorage.setItem("user_email", merged.email);
        if (merged.phone) localStorage.setItem("user_phone", merged.phone);
        if (merged.avatar !== undefined) {
          localStorage.setItem("user_avatar", merged.avatar || "");
        }
        if (localStorage.getItem("user_role") === "admin") {
          syncAdminBackup(merged);
        }
        window.dispatchEvent(new Event("admin-profile-updated"));
        return merged;
      }
    } catch (err: any) {
      // إذا كان الخطأ 400 أو 409 (مثل خطأ تحقق أو تكرار اسم المستخدم)، نعيد رميه ليظهر للمستخدم
      if (err?.response?.status === 400 || err?.response?.status === 409) {
        throw err;
      }
      console.warn("Could not update profile via API, updating local storage:", err.message);
      const current = JSON.parse(localStorage.getItem("user_data") || "{}");
      const { newPassword: _ignored, ...safeUpdates } = updates;
      const merged = { ...current, ...safeUpdates };
      localStorage.setItem("user_data", JSON.stringify(merged));
      if (merged.name) localStorage.setItem("user_name", merged.name);
      if (merged.email) localStorage.setItem("user_email", merged.email);
      if (merged.phone) localStorage.setItem("user_phone", merged.phone);
      if (merged.avatar !== undefined) {
        localStorage.setItem("user_avatar", merged.avatar || "");
      }
      if (localStorage.getItem("user_role") === "admin") {
        syncAdminBackup(merged);
      }
      window.dispatchEvent(new Event("admin-profile-updated"));
      return merged;
    }
  },

  async forgotPassword(params: { identifier: string; method?: "email" | "whatsapp" } | string) {
    const identifier = typeof params === "string" ? params : params.identifier;
    const method = typeof params === "string" ? (params.includes("@") ? "email" : "whatsapp") : params.method;
    const response = await api.post("/auth/forgot-password", {
      identifier,
      email: identifier.includes("@") ? identifier : undefined,
      phone: !identifier.includes("@") ? identifier : undefined,
      method: method || (identifier.includes("@") ? "email" : "whatsapp"),
    });
    return response.data;
  },

  async verifyResetOtp(identifier: string, otpCode: string) {
    const response = await api.post("/auth/verify-otp", {
      identifier,
      email: identifier.includes("@") ? identifier : undefined,
      phone: !identifier.includes("@") ? identifier : undefined,
      otpCode,
    });
    return response.data;
  },

  async resetPasswordWithOtp(identifier: string, otpCode: string, newPassword: string) {
    const response = await api.post("/auth/reset-password", {
      identifier,
      email: identifier.includes("@") ? identifier : undefined,
      phone: !identifier.includes("@") ? identifier : undefined,
      otpCode,
      newPassword,
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_avatar");
    localStorage.removeItem("user_national_id");
    localStorage.removeItem("original_admin");
    localStorage.removeItem("admin_profile");
    window.dispatchEvent(new Event("auth-state-changed"));
  },
};

export default authService;
