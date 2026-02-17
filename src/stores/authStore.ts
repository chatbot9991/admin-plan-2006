// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface AuthState {
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // مقدار اولیه توکن را از کوکی می‌خوانیم (برای رفرش صفحه)
      token: Cookies.get("adminJwt") || null,
      user: null,

      login: (token, user) => {
        // 1. ذخیره در کوکی (مثلاً برای 7 روز)
        Cookies.set("adminJwt", token, { expires: 7, secure: true });
        
        // 2. ذخیره در استیت
        set({ token, user });
      },

      logout: () => {
        // 1. حذف از کوکی
        Cookies.remove("adminJwt");
        
        // 2. پاک کردن استیت
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage", // نام ذخیره‌سازی در LocalStorage (فقط برای یوزر دیتا)
      partialize: (state) => ({ user: state.user }), // توکن را در لوکال استوریج نگه نمی‌داریم (چون در کوکی هست)
    }
  )
);
