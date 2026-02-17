// src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  return (
    <div 
      className="d-flex flex-column vh-100" 
      style={{ backgroundColor: "#f3f4f6" }} // رنگ پس‌زمینه کل صفحه (خاکستری روشن)
    >
      
      {/* هدر در بالای صفحه */}
      <Header />

      {/* کانتینر اصلی پایین هدر */}
      <div className="d-flex flex-grow-1 overflow-hidden p-3 gap-3">
        
        {/* سایدبار (چون RTL است، این سمت راست قرار می‌گیرد) */}
        <aside className="h-100 d-none d-md-block flex-shrink-0">
          <Sidebar />
        </aside>

        {/* محتوای صفحات (سمت چپ) */}
        <main className="flex-grow-1 h-100 bg-white rounded-4 shadow-sm overflow-auto position-relative">
             {/* این div سفید همان کادر بزرگی است که در عکس سمت چپ می‌بینید */}
             <div className="container-fluid p-4">
               <Outlet />
             </div>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;