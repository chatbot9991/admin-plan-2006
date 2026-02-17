// src/services/api.ts
import axios from "axios";
import Cookies from "js-cookie"; // <--- ایمپورت کوکی

// این Instance برای درخواست‌های عمومی است
export const api = axios.create({
  baseURL: "https://dev.backend.mobo.land/api/v1/portal",
  headers: {
    "Content-Type": "application/json",
  },
});

// این Instance برای درخواست‌های مربوط به احراز هویت است
export const api_auth = axios.create({
  baseURL: "https://dev.backend.mobo.land/api/v1/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// 1. تنظیمات Request Interceptor (افزودن توکن به هدر)
// ============================================================
const authInterceptor = (config: any) => {
  // به جای خواندن از استور، مستقیم از کوکی می‌خوانیم
  const token = Cookies.get("adminJwt");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// اعمال اینترسپتور روی هر دو نمونه (api و api_auth)
// نکته: حتی api_auth هم برای روت‌هایی مثل verify نیاز به توکن دارد
api.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
api_auth.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// ============================================================
// 2. تنظیمات Response Interceptor (مدیریت خطای 401 و خروج)
// ============================================================
const errorInterceptor = (error: any) => {
  if (error.response && error.response.status === 401) {
    const isLoginRequest = error.config.url.includes("/login");

    if (!isLoginRequest) {
      // حذف کوکی و استوریج
      Cookies.remove("adminJwt");
      localStorage.removeItem("auth-storage");
      
      // ریدایرکت به صفحه لاگین
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
};

// اعمال روی هر دو
api.interceptors.response.use((response) => response, errorInterceptor);
api_auth.interceptors.response.use((response) => response, errorInterceptor);

// ============================================================
// 3. سرویس‌های API
// ============================================================

// اگر روت وریفای شما زیرمجموعه auth است، بهتر است از api_auth استفاده کنید
export const verifyTokenService = async () => {
  // این درخواست به https://dev.backend.mobo.land/api/v1/auth/verify ارسال می‌شود
  return await api.get("/setting/read"); 
};
