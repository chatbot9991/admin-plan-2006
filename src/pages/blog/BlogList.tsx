// src/pages/blog/BlogList.tsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Eye, 
  Filter as FilterIcon, 
  ChevronDown, 
  ChevronUp, 
  RefreshCcw,
  Search,
  Edit,
  RotateCw
} from "lucide-react";
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

import { api } from "../../services/api";
import Filter from "../../components/common/Filter";
import Pagination from "../../components/common/Pagination"; 

// --- Interfaces ---

// طبق JSON نمونه، categoryId یک آبجکت کامل است
interface Category {
  _id: string;
  title: string;
  description?: string;
  status?: string;
}

interface Blog {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  status: string; // "active" | "inactive" | "deactive"
  mainPic: string;
  alt?: string;
  categoryId: Category; // این فیلد populated است
  version?: number;
}

// ساختار جدید پاسخ API
interface ApiResponse {
  result: {
    data: Blog[];
    total: { count: number }[];
  }[];
}

const BlogList: React.FC = () => {
  // --- States for Data ---
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  
  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- UI States (Filters) ---
  const [showFilters, setShowFilters] = useState(true);
  
  // استیت‌های موقت (ورودی کاربر)
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("");
  const [tempDateRange, setTempDateRange] = useState<DateObject[]>([]);
  
  // استیت‌های نهایی (ارسال به API)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "",
    dateRange: [] as DateObject[],
  });

  // --- Status Change Modal State ---
  const [targetBlog, setTargetBlog] = useState<{ id: string; status: string; title: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- Helpers ---
  const formatDate = (isoString: string) => {
    if (!isoString) return { date: "-", time: "-" };
    try {
      const dateObj = new Date(isoString);
      return {
        date: dateObj.toLocaleDateString("fa-IR"),
        time: dateObj.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      };
    } catch (e) {
      return { date: "-", time: "-" };
    }
  };

  // --- Core API Fetch Function ---
  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      // صفحه‌بندی
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());

      // ساخت آبجکت where
      const where: any = {};

      // 1. فیلتر وضعیت
      if (appliedFilters.status) {
        where.status = appliedFilters.status;
      }

      // 2. فیلتر جستجو (روی عنوان)
      if (appliedFilters.search) {
        where.title = appliedFilters.search; 
      }

      // 3. فیلتر تاریخ (createdAt)
      if (appliedFilters.dateRange.length > 0) {
        const fromDate = new DateObject(appliedFilters.dateRange[0]);
        fromDate.convert(gregorian, gregorian_en);
        fromDate.setHour(0).setMinute(0).setSecond(0).setMillisecond(0);

        const toDate = new DateObject(
          appliedFilters.dateRange[1] ? appliedFilters.dateRange[1] : appliedFilters.dateRange[0]
        );
        toDate.convert(gregorian, gregorian_en);
        toDate.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);

        where.createdAt = {
          from: fromDate.toDate().toISOString(),
          to: toDate.toDate().toISOString()
        };
      }

      // تبدیل where به JSON String
      if (Object.keys(where).length > 0) {
        const filterJson = JSON.stringify({ where });
        params.append("filter", filterJson);
      }

      const response = await api.get<ApiResponse>(`/blog/list?${params.toString()}`);

      // --- اصلاح شده برای ساختار جدید ---
      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        
        // دریافت لیست بلاگ‌ها
        setBlogs(resultData.data || []);
        
        // دریافت تعداد کل از آرایه total
        const totalCount = (resultData.total && resultData.total.length > 0) 
          ? resultData.total[0].count 
          : 0;
          
        setTotal(totalCount);
      } else {
        setBlogs([]);
        setTotal(0);
      }

    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("خطا در دریافت لیست بلاگ‌ها");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({
      search: tempSearch,
      status: tempStatus,
      dateRange: tempDateRange,
    });
  };

  const handleResetFilters = () => {
    setTempSearch("");
    setTempStatus("");
    setTempDateRange([]);
    setCurrentPage(1);
    setAppliedFilters({ search: "", status: "", dateRange: [] });
  };

  // تغییر وضعیت (Modal Logic)
  const openStatusModal = (blog: Blog) => {
    setTargetBlog({ id: blog._id, status: blog.status, title: blog.title });
  };

  const closeStatusModal = () => {
    setTargetBlog(null);
  };

  const confirmStatusChange = async () => {
    if (!targetBlog) return;
    setIsProcessing(true);
    try {
      const newStatus = targetBlog.status === "active" ? "deactive" : "active";
      await api.put(`/blog/changeStatus`, { id: targetBlog.id, status: newStatus });
      
      // آپدیت لوکال برای سرعت بیشتر UI
      setBlogs(prev => prev.map(b => b._id === targetBlog.id ? { ...b, status: newStatus } : b));
      
      toast.success("وضعیت تغییر کرد");
      closeStatusModal();
    } catch (error) {
      console.error(error);
      toast.error("خطا در تغییر وضعیت");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: "100vh" }}>
      
      {/* Modal تغییر وضعیت */}
      {targetBlog && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box">
              <RotateCw className="text-warning" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">تغییر وضعیت بلاگ</h4>
            <p className="text-muted text-center mt-2 mb-4 px-3">
              وضعیت مقاله <strong>"{targetBlog.title}"</strong> به 
              <span className={`fw-bold mx-1 ${targetBlog.status === "active" ? "text-danger" : "text-success"}`}>
                {targetBlog.status === "active" ? "غیرفعال" : "فعال"}
              </span>
              تغییر کند؟
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button className="btn btn-light flex-grow-1 py-2 rounded-pill fw-bold" onClick={closeStatusModal} disabled={isProcessing}>
                انصراف
              </button>
              <button className="btn btn-warning text-white flex-grow-1 py-2 rounded-pill fw-bold" onClick={confirmStatusChange} disabled={isProcessing}>
                {isProcessing ? "..." : "بله، تغییر بده"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت بلاگ‌ها</h3>
          <p className="text-muted small mb-0">لیست مقالات و اخبار منتشر شده</p>
        </div>
        <div className="d-flex gap-2">
            <Link to="/blog/create" className="btn-shine-effect">
                <span className="mx-2 fs-5">+</span> ایجاد بلاگ جدید
            </Link>
            <button 
            onClick={fetchBlogs} 
            className="btn btn-light rounded-pill p-2 shadow-sm border"
            title="بروزرسانی لیست"
            >
            <RefreshCcw size={20} className={loading ? "spin-anim" : ""} />
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div 
          className="card-header bg-white border-0 p-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="d-flex align-items-center gap-2 text-primary fw-bold">
            <FilterIcon size={20} />
            <span>فیلترهای پیشرفته</span>
          </div>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        <div className={`collapse ${showFilters ? "show" : ""}`}>
          <div className="card-body bg-light border-top p-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="جستجو (عنوان)"
                  placeholder="عنوان مقاله..."
                  value={tempSearch}
                  onChange={setTempSearch}
                />
              </div>
              <div className="col-12 col-md-2">
                <Filter
                  type="dropdown"
                  label="وضعیت"
                  placeholder="همه"
                  options={[
                    { id: "active", name: "فعال" },
                    { id: "deactive", name: "غیرفعال" },
                  ]}
                  value={tempStatus}
                  onChange={setTempStatus}
                />
              </div>
              <div className="col-12 col-md-4">
                <Filter
                  type="date-range"
                  label="بازه زمانی (تاریخ ایجاد)"
                  placeholder="انتخاب تاریخ"
                  value={tempDateRange}
                  onChange={setTempDateRange}
                />
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button 
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleApplyFilters}
                  style={{ height: "48px", borderRadius: "12px" }}
                >
                  <Search size={18} />
                  <span>اعمال فیلتر</span>
                </button>
                {(tempSearch || tempStatus || tempDateRange.length > 0) && (
                   <button 
                   className="btn btn-danger-soft px-3"
                   onClick={handleResetFilters}
                   title="حذف فیلترها"
                   style={{ height: "48px", borderRadius: "12px" }}
                 >
                   ×
                 </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: "visible" }}>
        <table className="table modern-table">
          <thead>
            <tr>
              <th style={{ width: "5%", borderRadius: "0 15px 15px 0" }}>#</th>
              <th style={{ width: "25%" }}>عنوان و دسته‌بندی</th>
              <th style={{ width: "30%" }}>توضیحات کوتاه</th>
              <th className="text-center" style={{ width: "15%" }}>تاریخ ایجاد</th>
              <th className="text-center" style={{ width: "10%" }}>وضعیت</th>
              <th className="text-center" style={{ width: "15%", borderRadius: "15px 0 0 15px" }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted fw-bold">
                  هیچ مقاله‌ای یافت نشد!
                </td>
              </tr>
            ) : (
              blogs.map((blog, index) => {
                const { date, time } = formatDate(blog.createdAt);
                const isActive = blog.status === "active";

                return (
                  <tr key={blog._id} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    
                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark mb-1 text-truncate" style={{maxWidth: '250px'}} title={blog.title}>
                          {blog.title}
                        </span>
                        {blog.categoryId && (
                          <span className="badge bg-light text-secondary border rounded-pill fw-normal align-self-start">
                            {blog.categoryId.title}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <p className="text-muted small mb-0 description-truncate" style={{maxWidth: '300px'}}>
                        {blog.shortDescription || "-"}
                      </p>
                    </td>

                    <td className="text-center">
                       <div className="d-flex flex-column">
                         <span className="fw-bold text-dark">{date}</span>
                         <span className="text-muted small">{time}</span>
                       </div>
                    </td>

                    <td className="text-center">
                      <div className={`status-pill ${isActive ? "active" : "inactive"}`}>
                        <span className="dot"></span>
                        {isActive ? "فعال" : "غیرفعال"}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link to={`/blog/details/${blog._id}`} className="btn-action btn-soft-info" title="مشاهده">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/blog/edit/${blog._id}`} className="btn-action btn-soft-primary" title="ویرایش">
                          <Edit size={18} />
                        </Link>
                        <button 
                          className="btn-action btn-soft-warning" 
                          title="تغییر وضعیت"
                          onClick={() => openStatusModal(blog)}
                        >
                          <RotateCw size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-4 d-flex justify-content-center">
          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .custom-modal-content { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modal-icon-box { width: 70px; height: 70px; background-color: #fff3cd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .btn-shine-effect { background: linear-gradient(45deg, #099773, #20c997); color: white; padding: 8px 20px; border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(32, 201, 151, 0.4); transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; font-weight: 600; }
        .btn-shine-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(32, 201, 151, 0.6); color: white; }

        .btn-danger-soft { background-color: #fff5f5; color: #ef4444; border: 1px solid #fee2e2; transition: all 0.2s; }
        .btn-danger-soft:hover { background-color: #fee2e2; color: #b91c1c; }

        .modern-table { border-collapse: separate; border-spacing: 0 15px; }
        .modern-table thead th { border: none; background: transparent; color: #8898aa; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding-bottom: 10px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border-radius: 16px; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-5px) scale(1.005); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); z-index: 2; position: relative; }
        .modern-table td { border: none; padding: 20px 15px; }

        .description-truncate { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .status-pill { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-pill.active { background-color: #e6fffa; color: #20c997; }
        .status-pill.inactive { background-color: #f1f3f5; color: #868e96; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background-color: currentColor; margin-left: 6px; }

        .btn-action { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-info { background-color: #e3f2fd; color: #0dcaf0; }
        .btn-soft-info:hover { background-color: #0dcaf0; color: white; }
        .btn-soft-primary { background-color: #e7f5ff; color: #4dabf7; }
        .btn-soft-primary:hover { background-color: #4dabf7; color: white; }
        .btn-soft-warning { background-color: #fff3cd; color: #ffc107; }
        .btn-soft-warning:hover { background-color: #ffc107; color: white; }
      `}</style>
    </div>
  );
};

export default BlogList;
