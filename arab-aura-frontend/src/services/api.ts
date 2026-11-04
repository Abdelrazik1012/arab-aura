import axios from "axios";

// 🌐 قراءة رابط API من ملف البيئة .env أو استخدام السيرفر المحلي افتراضياً
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔑 Interceptor لإضافة التوكن تلقائياً مع كل طلب
api.interceptors.request.use(
  (config) => {
    const directToken = localStorage.getItem("auth_token");
    if (directToken) {
      config.headers.Authorization = `Bearer ${directToken}`;
      return config;
    }
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error("Error parsing user_data token", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ⚠️ Interceptor للتعامل مع أخطاء الاستجابة (مثل انتهاء الصلاحية 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // تفريغ البيانات والتوجيه لتسجيل الدخول عند انتهاء السيشن
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
