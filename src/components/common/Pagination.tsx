// src/components/common/Pagination.tsx

import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean; // برای نمایش متن "نمایش X تا Y..."
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  showInfo = true,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalItems === 0) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  // محاسبه بازه نمایشی (مثلاً: نمایش 1 تا 15 از 50)
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 px-2 gap-3">
      {/* بخش متن اطلاعات */}
      {showInfo && (
        <div className="text-muted small order-2 order-md-1">
          نمایش <span className="fw-bold">{startItem}</span> تا{" "}
          <span className="fw-bold">{endItem}</span> از{" "}
          <span className="fw-bold">{totalItems}</span> رکورد
        </div>
      )}

      {/* بخش دکمه‌ها */}
      <nav aria-label="Page navigation" className="order-1 order-md-2">
        <ul className="pagination pagination-brand mb-0 gap-2">
          {/* دکمه قبلی (در RTL فلش راست به معنی قبلی است) */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link rounded-circle d-flex align-items-center justify-content-center"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronRight size={18} />
            </button>
          </li>

          {/* شماره صفحات */}
          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1;
            // منطق نمایش: اولی، آخری، و یکی قبل و بعد از صفحه جاری
            if (
              p === 1 ||
              p === totalPages ||
              (p >= currentPage - 1 && p <= currentPage + 1)
            ) {
              return (
                <li
                  key={p}
                  className={`page-item ${currentPage === p ? "active" : ""}`}
                >
                  <button
                    className="page-link rounded-circle"
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                </li>
              );
            } else if (p === currentPage - 2 || p === currentPage + 2) {
              return (
                <li key={p} className="page-item disabled">
                  <span className="page-link border-0 bg-transparent">...</span>
                </li>
              );
            }
            return null;
          })}

          {/* دکمه بعدی (در RTL فلش چپ به معنی بعدی است) */}
          <li
            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
          >
            <button
              className="page-link rounded-circle d-flex align-items-center justify-content-center"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronLeft size={18} />
            </button>
          </li>
        </ul>
      </nav>

      {/* استایل‌های اختصاصی کامپوننت */}
      <style>{`
        /* Brand Gradient Pagination Styles */
        .pagination-brand .page-link {
            width: 36px;
            height: 36px;
            border: none;
            color: #6c757d;
            background-color: #f8f9fa;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        
        .pagination-brand .page-item.active .page-link {
            /* گرادینت از لوگوی گربه: بنفش به آبی/فیروزه‌ای */
            background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
            transform: scale(1.1);
        }

        .pagination-brand .page-link:hover:not(.active) {
            background-color: #e0e7ff; 
            color: #4f46e5;
            transform: translateY(-2px);
        }
        
        .pagination-brand .page-item.disabled .page-link {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: #f1f5f9;
            color: #94a3b8;
            transform: none;
        }
        
        /* حذف بوردر اضافی برای سه نقطه */
        .pagination-brand .page-item.disabled .page-link.bg-transparent {
            background-color: transparent;
            cursor: default;
        }
      `}</style>
    </div>
  );
};

export default Pagination;
