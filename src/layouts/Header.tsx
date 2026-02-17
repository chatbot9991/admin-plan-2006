import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore"; // فرض بر این است که این فایل وجود دارد
import logoIcon from "../assets/icons/logo.svg";
import avatarPlaceholder from "../assets/icons/avatar.svg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // دریافت اطلاعات کاربر و متد خروج از استور
  const { user, logout } = useAuthStore((state) => state);

  // ساخت نام کامل برای نمایش
  // از Optional Chaining (?.) استفاده می‌کنیم تا اگر هنوز دیتا لود نشده بود خطا ندهد
  const fullName = user ? `${user.adminName} ${user.family}` : "کاربر سیستم";
  const roleTitle = user?.role ? user.role : "-";

  // بستن منو در صورت کلیک بیرون از آن
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className="w-100 bg-white border-bottom d-flex align-items-center justify-content-between px-4 py-2 position-relative"
        style={{ height: "80px", zIndex: 1000 }}
      >
        {/* ---------------- سمت راست: لوگو ---------------- */}
        <div className="d-flex align-items-center gap-2">
          <img
            src={logoIcon}
            alt="Moboland Logo"
            style={{ width: "auto", height: "45px" }}
          />
        </div>

        {/* ---------------- سمت چپ: پروفایل و نوتیفیکیشن ---------------- */}
        <div className="d-flex align-items-center gap-4">
          {/* دکمه نوتیفیکیشن */}
          <button
            className="btn btn-light rounded-circle position-relative d-flex align-items-center justify-content-center p-0 border-0"
            style={{
              width: "45px",
              height: "45px",
              backgroundColor: "#f3f4f6",
            }}
          >
            <Bell size={24} className="text-secondary" />
            <span
              className="position-absolute bg-success rounded-circle border border-white"
              style={{
                width: "12px",
                height: "12px",
                bottom: "8px",
                right: "8px",
              }}
            ></span>
          </button>

          {/* بخش پروفایل و منوی کشویی */}
          <div className="position-relative" ref={dropdownRef}>
            {/* دکمه تریگر (عکس و نام داینامیک) */}
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="d-flex align-items-center gap-3 p-1 ps-3 rounded-pill custom-profile-trigger"
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
            >
              <img
                src={avatarPlaceholder}
                className="rounded-circle shadow-sm"
                alt="Admin"
                style={{ width: "45px", height: "45px", objectFit: "cover" }}
              />

              <div className="d-none d-md-flex align-items-center gap-2">
                {/* نمایش نام داینامیک */}
                <span className="fw-bold text-dark fs-8">{fullName}</span>
                <ChevronDown
                  size={20}
                  className="text-muted"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* بدنه منوی کشویی (Dropdown) */}
            {isOpen && (
              <div
                className="position-absolute bg-white rounded-4 shadow-lg border-0 overflow-hidden custom-dropdown-animation"
                style={{
                  top: "120%",
                  left: "0",
                  width: "280px",
                  zIndex: 1050,
                }}
              >
                {/* هدر منو (اطلاعات کاربر داینامیک) */}
                <div className="p-3 bg-light border-bottom text-center">
                  <p className="mb-0 fw-bold text-dark fs-5">{fullName}</p>
                  <small className="text-muted">{roleTitle}</small>
                  {user?.mobile && (
                    <div
                      className="text-muted small mt-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {user.mobile}
                    </div>
                  )}
                </div>

                {/* آیتم‌های منو */}
                <div className="p-2 d-flex flex-column gap-1">
                  {/* دکمه مشاهده پروفایل */}
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none rounded-3 custom-menu-item"
                  >
                    <div className="icon-box bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center">
                      <User size={18} />
                    </div>
                    <span className="fw-medium text-secondary">
                      مشاهده پروفایل
                    </span>
                  </Link>

                  {/* دکمه تنظیمات */}
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none rounded-3 custom-menu-item"
                  >
                    <div className="icon-box bg-info bg-opacity-10 text-info rounded-circle p-2 d-flex align-items-center justify-content-center">
                      <Settings size={18} />
                    </div>
                    <span className="fw-medium text-secondary">
                      تنظیمات اکانت
                    </span>
                  </Link>

                  <hr className="my-1 border-secondary opacity-25" />

                  {/* دکمه خروج */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="d-flex align-items-center gap-3 px-3 py-2 border-0 bg-transparent w-100 rounded-3 custom-menu-item-danger"
                  >
                    <div className="icon-box bg-danger bg-opacity-10 text-danger rounded-circle p-2 d-flex align-items-center justify-content-center">
                      <LogOut size={18} />
                    </div>
                    <span className="fw-bold text-danger">خروج از حساب</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* استایل‌های CSS سفارشی (بدون Tailwind) */}
      <style>{`
        /* هاور روی باکس اصلی پروفایل */
        .custom-profile-trigger:hover {
          background-color: #f8f9fa;
        }

        /* آیتم‌های معمولی منو */
        .custom-menu-item {
          transition: all 0.2s ease;
          color: #6c757d; /* text-secondary */
        }
        .custom-menu-item:hover {
          background-color: #f1f5f9;
          color: #212529 !important; /* text-dark */
        }

        /* آیتم خروج (قرمز) */
        .custom-menu-item-danger {
          transition: all 0.2s ease;
        }
        .custom-menu-item-danger:hover {
          background-color: #fef2f2; /* قرمز خیلی روشن */
        }

        /* انیمیشن باز شدن منو */
        .custom-dropdown-animation {
          animation: slideUpFade 0.3s ease-out forwards;
        }
        
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
