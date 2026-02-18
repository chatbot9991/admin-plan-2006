// src/pages/blog/CategoryEdit.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

const CategoryEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // --- States ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  // --- Fetch Data ---
  useEffect(() => {
    if (!id) {
      toast.error('شناسه دسته‌بندی یافت نشد.');
      console.log(id);
      // navigate("/blog-category/list");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // فرض بر این است که API جزئیات شبیه به بلاگ است
        const res = await api.get(`/blog-category/details?_id=${id}`);

        // استخراج هوشمند داده‌ها (اگر داخل آبجکت category بود یا مستقیم در data)
        const data = res.data.category || res.data;

        setFormData({
          title: data.title || '',
          description: data.description || '',
        });
      } catch (error) {
        console.error('Error fetching category details:', error);
        toast.error('خطا در دریافت اطلاعات دسته‌بندی.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.warning('وارد کردن عنوان الزامی است');
      return;
    }

    setIsSubmitting(true);

    try {
      // ارسال درخواست آپدیت به همراه _id
      const payload = {
        _id: id,
        ...formData,
      };

      await api.put('/blog-category/update', payload);

      toast.success('دسته‌بندی با موفقیت ویرایش شد');
      navigate('/blog-category/list');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('خطا در ویرایش دسته‌بندی.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading View ---
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">ویرایش دسته‌بندی</h3>
          <p className="text-muted small">اصلاح اطلاعات دسته‌بندی موجود</p>
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
                  style={{
                    minHeight: '250px',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                  }}
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
                <div className="form-text text-end mt-1">
                  تعداد کاراکتر: {formData.description.length}
                </div>
              </div>
            </div>
          </div>

          {/* ستون کناری (دکمه عملیات) */}
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
              style={{ top: '20px' }}
            >
              <h5 className="fw-bold mb-3">ذخیره تغییرات</h5>
              <p className="text-muted small mb-4">
                تغییرات شما پس از کلیک بر روی دکمه زیر بلافاصله در سیستم اعمال خواهد شد.
              </p>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-lg btn-animate"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    در حال به‌روزرسانی...
                  </>
                ) : (
                  'ویرایش دسته‌بندی'
                )}
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
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15); /* آبی برای ادیت */
            border: 1px solid #dee2e6 !important;
        }

        .btn-animate { transition: transform 0.2s; }
        .btn-animate:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default CategoryEdit;
