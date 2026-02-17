// src/pages/blog/CategoryCreate.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { toast } from "react-toastify";

const CategoryCreate: React.FC = () => {
  const navigate = useNavigate();

  // --- States ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // داده‌های فرم (فقط عنوان و توضیحات طبق درخواست)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // --- هندلرها ---

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // اعتبارسنجی ساده
    if (!formData.title.trim()) {
        toast.warning("وارد کردن عنوان الزامی است");
        return;
    }

    setIsSubmitting(true);

    try {
      // ارسال درخواست دقیقا با فرمت { title, description }
      await api.post("/blog-category/create", formData);

      toast.success("دسته‌بندی با موفقیت ایجاد شد");
      navigate("/blog-category/list");

    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("خطا در ایجاد دسته‌بندی. لطفا مجددا تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">ایجاد دسته‌بندی جدید</h3>
          <p className="text-muted small">
            تعریف دسته‌بندی جدید برای مقالات بلاگ
          </p>
        </div>
        <Link to="/blog-category/list" className="btn btn-outline-secondary rounded-pill px-4">
          بازگشت
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* ستون اصلی (فرم‌ها) */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              
              {/* ردیف اول: عنوان */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">عنوان دسته‌بندی</label>
                <input
                  type="text"
                  name="title"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="مثال: هوش مصنوعی"
                />
              </div>

              {/* ردیف دوم: توضیحات */}
              <div className="mb-2">
                <label className="form-label fw-bold text-dark fs-5">
                  <i className="bi bi-card-text me-2"></i>
                  توضیحات
                </label>
                <textarea
                  name="description"
                  className="form-control bg-light border-0 editor-textarea"
                  style={{ minHeight: "250px", fontSize: "1rem", lineHeight: "1.6" }}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="توضیحات مختصری در مورد این دسته‌بندی بنویسید..."
                ></textarea>
                <div className="form-text text-end mt-1">
                   تعداد کاراکتر: {formData.description.length}
                </div>
              </div>

            </div>
          </div>

          {/* ستون کناری (دکمه عملیات) */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "20px" }}>
              
              <h5 className="fw-bold mb-3">انتشار</h5>
              <p className="text-muted small mb-4">
                پس از بررسی صحت اطلاعات، بر روی دکمه زیر کلیک کنید تا دسته‌بندی جدید به سیستم اضافه شود.
              </p>

              <button
                type="submit"
                className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow-lg btn-animate"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        در حال ذخیره...
                    </>
                ) : "ایجاد دسته‌بندی"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .editor-textarea:focus {
            background-color: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.15);
            border: 1px solid #dee2e6 !important;
        }

        .btn-animate { transition: transform 0.2s; }
        .btn-animate:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default CategoryCreate;
