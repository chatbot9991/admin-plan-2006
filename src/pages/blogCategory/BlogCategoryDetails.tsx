// src/pages/blog/CategoryDetails.tsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { toast } from "react-toastify";

interface CategoryData {
  _id: string;
  title: string;
  description: string;
  isActive?: boolean; // فرض بر این است که وضعیت هم برمی‌گردد
  createdAt?: string;
  updatedAt?: string;
}

const CategoryDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- دریافت اطلاعات ---
  useEffect(() => {
    if (!id) {
      toast.error("شناسه دسته‌بندی یافت نشد.");
      navigate("/blog-category/list");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/blog-category/details?id=${id}`);
        
        // استخراج هوشمند داده‌ها
        const data = res.data.category || res.data;
        setCategory(data);

      } catch (error) {
        console.error("Error fetching category details:", error);
        toast.error("خطا در دریافت جزئیات دسته‌بندی.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // --- کامپوننت لودینگ ---
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">جزئیات دسته‌بندی</h3>
          <p className="text-muted small">
            مشاهده اطلاعات کامل دسته‌بندی
          </p>
        </div>
        <Link to="/blog-category/list" className="btn btn-outline-secondary rounded-pill px-4">
          <i className="bi bi-arrow-right me-2"></i>
          بازگشت به لیست
        </Link>
      </div>

      <div className="row g-4">
        {/* ستون اصلی (محتوا) */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white h-100">
            
            {/* عنوان */}
            <div className="mb-4 border-bottom pb-3">
              <label className="text-muted small text-uppercase fw-bold mb-1">عنوان دسته‌بندی</label>
              <h2 className="fw-bold text-dark m-0">{category.title}</h2>
            </div>

            {/* توضیحات */}
            <div>
              <label className="text-muted small text-uppercase fw-bold mb-2">
                <i className="bi bi-card-text me-1"></i>
                توضیحات
              </label>
              <div 
                className="bg-light p-4 rounded-3 text-secondary lh-lg"
                style={{ minHeight: "200px", whiteSpace: "pre-wrap" }}
              >
                {category.description ? category.description : <span className="text-muted fst-italic">بدون توضیحات</span>}
              </div>
            </div>

          </div>
        </div>

        {/* ستون کناری (اطلاعات متا و عملیات) */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "20px" }}>
            
            <h5 className="fw-bold mb-4 border-bottom pb-2">اطلاعات سیستمی</h5>

            {/* وضعیت */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">وضعیت:</span>
              {category.isActive !== undefined ? (
                category.isActive ? (
                  <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">فعال</span>
                ) : (
                  <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-2 rounded-pill">غیرفعال</span>
                )
              ) : (
                <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">نامشخص</span>
              )}
            </div>

            {/* تاریخ ایجاد (اگر وجود داشته باشد) */}
            {category.createdAt && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">تاریخ ایجاد:</span>
                <span className="fw-bold dir-ltr">{new Date(category.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
            )}

            {/* شناسه */}
            <div className="mb-4">
                <span className="text-muted d-block mb-1">شناسه (ID):</span>
                <code className="d-block bg-light p-2 rounded text-center text-break text-muted small">
                    {category._id}
                </code>
            </div>

            {/* دکمه ویرایش */}
            <div className="d-grid">
              <Link 
                to={`/blog-category/edit?_id=${category._id}`} 
                className="btn btn-primary py-2 rounded-3 fw-bold shadow-sm btn-animate"
              >
                <i className="bi bi-pencil-square me-2"></i>
                ویرایش این دسته‌بندی
              </Link>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .dir-ltr { direction: ltr; }
        .btn-animate { transition: transform 0.2s; }
        .btn-animate:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default CategoryDetails;
