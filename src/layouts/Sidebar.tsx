import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutGrid,
  Rss,
  Headset,
  Tag,
  ShieldCheck,
  Users,
  CircleDollarSign,
  BrainCircuit,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Dot,
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: any;
  path?: string;
  badge?: number | string;
  subItems?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { title: 'داشبورد', icon: LayoutGrid, path: '/dashboard' },
  {
    title: 'بلاگ‌ها',
    icon: Rss,
    subItems: [
      { title: 'لیست بلاگ ها', path: '/blog/list' },
      { title: 'ایجاد بلاگ', path: '/blog/create' },
      { title: 'لیست دسته های بلاگ', path: '/blog-category/list' },
      { title: 'ایجاد دسته بلاگ', path: '/blog-category/create' },
    ],
  },
  // { title: "پشتیبانی", icon: Headset, path: "/support", badge: 5 },
  { title: 'پشتیبانی', icon: Headset, path: '/support' },

  { title: 'ادمین‌ها', icon: ShieldCheck, path: '/admins' },
  { title: 'کاربران', icon: Users, path: '/users' },
  {
    title: 'تراکنشات',
    icon: CircleDollarSign,
    path: '/transactions',
  },
  { title: 'هوش مصنوعی', icon: BrainCircuit, path: '/ai' },
  { title: 'گزارشات', icon: BarChart3, path: '/reports' },
  { title: 'لیست تخفیف ها ', icon: Tag, path: '/discount/list' },

  {
    title: 'تنظیمات',
    icon: Settings,
    subItems: [{ title: 'لیست اعلانات', path: '/notifications' }],
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const handleParentClick = (title: string) => {
    // اگر بسته بود و کلیک کرد، باز شود و ساب‌منو را نشان دهد
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSubMenu(title);
    } else {
      setOpenSubMenu(openSubMenu === title ? null : title);
    }
  };

  return (
    <>
      <aside
        className="d-flex flex-column h-100 shadow-sm position-relative border-start bg-white"
        style={{
          width: isCollapsed ? '90px' : '260px', // کمی عرض را در حالت بسته بیشتر کردم تا مربع‌ها خوش‌فرم باشند
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '14px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center p-0 position-absolute toggle-btn"
          style={{
            width: '28px',
            height: '28px',
            top: '24px',
            left: '-14px',
            zIndex: 10,
            border: '1px solid #eee',
          }}
        >
          {isCollapsed ? (
            <ChevronLeft size={16} color="#087492" />
          ) : (
            <ChevronRight size={16} color="#087492" />
          )}
        </button>

        <nav className="flex-grow-1 overflow-y-auto overflow-x-hidden py-4 px-2 d-flex flex-column gap-2 custom-scrollbar">
          {menuItems.map((item, index) => {
            const isParentActive = item.subItems?.some((sub) => location.pathname === sub.path);
            const isSingleActive = item.path === location.pathname;
            const isActive = isParentActive || isSingleActive;
            const isMenuOpen = openSubMenu === item.title;

            // تعیین کلاس‌ها بر اساس باز/بسته بودن سایدبار
            // نکته مهم: در حالت بسته از mx-auto و justify-content-center استفاده می‌کنیم
            const containerClass = isCollapsed
              ? `d-flex align-items-center justify-content-center mx-auto nav-item-custom ${isActive ? 'active' : ''}`
              : `d-flex align-items-center justify-content-between px-3 nav-item-custom ${isActive ? 'active' : ''}`;

            // استایل مربعی در حالت بسته
            const containerStyle = isCollapsed
              ? {
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }
              : {
                  borderRadius: '12px',
                  padding: '10px 0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                };

            return (
              <div key={index}>
                {item.subItems ? (
                  // --- آیتم دارای زیرمنو ---
                  <div
                    onClick={() => handleParentClick(item.title)}
                    className={containerClass}
                    style={containerStyle}
                  >
                    {/* در حالت بسته فقط آیکون، در حالت باز آیکون و متن */}
                    {isCollapsed ? (
                      <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    ) : (
                      <>
                        <div className="d-flex align-items-center">
                          <div
                            style={{ minWidth: '24px' }}
                            className="d-flex justify-content-center"
                          >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                          </div>
                          <span className="me-3 fw-medium" style={{ fontSize: '0.95rem' }}>
                            {item.title}
                          </span>
                        </div>
                        <ChevronDown
                          size={16}
                          style={{
                            transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            opacity: 0.8,
                          }}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  // --- آیتم لینک تکی ---
                  <NavLink
                    to={item.path!}
                    className={({ isActive }) =>
                      isCollapsed
                        ? `d-flex align-items-center justify-content-center mx-auto nav-item-custom ${isActive ? 'active' : ''}`
                        : `d-flex align-items-center px-3 nav-item-custom ${isActive ? 'active' : ''}`
                    }
                    style={containerStyle}
                  >
                    {isCollapsed ? (
                      <item.icon size={24} strokeWidth={2} />
                    ) : (
                      <div className="d-flex align-items-center w-100">
                        <div style={{ minWidth: '24px' }} className="d-flex justify-content-center">
                          <item.icon size={22} strokeWidth={2} />
                        </div>
                        <span className="me-3 fw-medium" style={{ fontSize: '0.95rem' }}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="badge-notification ms-auto">{item.badge}</span>
                        )}
                      </div>
                    )}
                  </NavLink>
                )}

                {/* --- زیرمنوها (فقط وقتی سایدبار باز است نمایش داده شوند) --- */}
                {item.subItems && isMenuOpen && !isCollapsed && (
                  <div className="d-flex flex-column mt-1 pe-4 gap-1 animate-fade-in">
                    {item.subItems.map((sub, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={sub.path}
                        className={({ isActive }) =>
                          `d-flex align-items-center text-decoration-none rounded-3 px-2 py-2 small submenu-item ${
                            isActive ? 'submenu-active' : ''
                          }`
                        }
                        style={{ fontSize: '0.85rem', transition: 'all 0.2s' }}
                      >
                        <Dot size={18} />
                        <span className="me-1">{sub.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 mt-auto">
          <button
            onClick={logout}
            className="btn w-100 d-flex align-items-center justify-content-center border-0 rounded-3 py-2 logout-btn"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="me-2 fw-bold">خروج</span>}
          </button>
        </div>
      </aside>
      <style>{`
        .nav-item-custom, .submenu-item {
          color: #087492 !important;
          text-decoration: none !important;
        }
        
        /* هاور برای آیتم‌ها */
        .nav-item-custom:hover, .submenu-item:hover {
          background-color: #e0f7fa !important;
          font-weight: bold;
        }

        /* حالت فعال */
        .nav-item-custom.active, .submenu-active {
          background-color: #e0f7fa !important;
          font-weight: bold;
        }

        .badge-notification {
          background-color: #fd7e14;
          color: white;
          font-size: 0.75rem;
          margin: 0 8px;
          padding: 1px 6px;
          border-radius: 6px;
          font-weight: 500;
        }

        .logout-btn {
          background-color: #ffebee;
          color: #ef5350;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background-color: #ffcdd2;
        }

        /* انیمیشن باز شدن زیرمنو */
        .animate-fade-in {
          animation: slideDown 0.2s ease-out forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- استایل جدید و زیبای اسکرول‌بار --- */
        
        /* برای فایرفاکس */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        /* برای کروم، اج و سافاری */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px; /* عرض مناسب */
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; /* پس‌زمینه نامرئی */
          margin-block: 4px; /* فاصله کمی از بالا و پایین */
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1; /* رنگ پیش‌فرض: خاکستری ملایم */
          border-radius: 10px;       /* کاملاً گرد */
          border: 1px solid transparent; /* برای تمیزی لبه‌ها */
          background-clip: content-box;
        }

        /* وقتی موس روی اسکرول می‌رود، رنگ برند بگیرد */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #087492; 
        }
      `}</style>
    </>
  );
}
