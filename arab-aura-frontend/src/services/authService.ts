// src/services/authService.ts
import api from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  brandName?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data?.success && response.data?.data) {
        const { token, user } = response.data.data;
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_data", JSON.stringify({ ...user, token }));
        localStorage.setItem("user_role", user.role);
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
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify({ ...user, token }));
      localStorage.setItem("user_role", user.role);
      return response.data.data;
    }
    throw new Error(response.data?.message || "فشل إنشاء الحساب");
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data?.data;
  },

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_role");
  },
};

export default authService;
