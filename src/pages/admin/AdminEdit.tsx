// src/pages/admin/AdminEdit.tsx

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

const AdminEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- States ---
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // داده‌های فرم بر اساس Swagger ارسالی
  const [formData, setFormData] = useState({
    adminName: '',
    family: '',
    email: '',
    mobile: '',
  });

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // فرض بر این است که اندپوینت دریافت جزئیات به این شکل است
        const response = await api.get(`/admin/details?_id=${id}`);
        
        // استخراج دیتا با توجه به ساختار احتمالی ریسپانس (آرایه یا آبجکت مستقیم)
        let data = response.data;
        if (response.data && response.data.result && response.data.result.length > 0) {
          data = response.data.result[0];
        } else if (response.data && response.data.data) {
          data = response.data.data;
        }

        if (data) {
          setFormData({
            adminName: data.adminName || '',
            family: data.family || '',
            email: data.email || '',
            mobile: data.mobile || '',
          });
        }
      } catch (error) {
        console.error('Error fetching admin details:', error);
        toast.error('خطا در دریافت اطلاعات ادمین');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDetails();
  }, [id]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ساخت پی‌لود دقیقاً مطابق با Swagger
      const payload = {
        _id: id,
        adminName: formData.adminName,
        family: formData.family,
        email: formData.email,
        mobile: formData.mobile,
      };

      await api.put('/admin/update', payload);

      toast.success('اطلاعات ادمین با موفقیت ویرایش شد');
      navigate('/admin/list');
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('خطا در ذخیره‌سازی اطلاعات. لطفا مجددا تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">ویرایش اطلاعات ادمین</h3>
          <p className="text-muted small">
            ویرایش: <span className="text-primary fw-bold">{formData.adminName} {formData.family}</span>
          </p>
        </div>
        <Link to="/admin/list" className="btn btn-outline-secondary rounded-pill px-4">
          بازگشت
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm rounded-4 p-5 mb-4 bg-white">
          
          <div className="row g-4">
            {/* نام */}
            <div className="col-md-6">
              <label className="form-label fw-bold text-secondary">نام (Admin Name)</label>
              <input
                type="text"
                name="adminName"
                className="form-control form-control-lg bg-light border-0"
                value={formData.adminName}
                onChange={handleInputChange}
                placeholder="مثال: علی"
                required
              />
            </div>

            {/* نام خانوادگی */}
            <div className="col-md-6">
              <label className="form-label fw-bold text-secondary">نام خانوادگی (Family)</label>
              <input
                type="text"
                name="family"
                className="form-control form-control-lg bg-light border-0"
                value={formData.family}
                onChange={handleInputChange}
                placeholder="مثال: رضایی"
                required
              />
            </div>

            {/* ایمیل */}
            <div className="col-md-6">
              <label className="form-label fw-bold text-secondary">ایمیل (Email)</label>
              <input
                type="email"
                name="email"
                className="form-control form-control-lg bg-light border-0 text-start"
                dir="ltr"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                required
              />
            </div>

            {/* شماره موبایل */}
            <div className="col-md-6">
              <label className="form-label fw-bold text-secondary">شماره موبایل (Mobile)</label>
              <input
                type="text"
                name="mobile"
                className="form-control form-control-lg bg-light border-0 text-start font-monospace"
                dir="ltr"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="09123456789"
                required
              />
            </div>
          </div>

          <hr className="my-5 text-muted opacity-25" />

          {/* دکمه ثبت (دقیقا مشابه دکمه BlogEdit) */}
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-success px-5 py-3 rounded-3 fw-bold shadow-lg btn-animate"
              disabled={isSubmitting}
              style={{ minWidth: '200px' }}
            >
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>

        </div>
      </form>

      {/* استایل‌های اختصاصی مشابه صفحه بلاگ */}
      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Focus effect for inputs identical to BlogEdit */
        .form-control:focus {
            background-color: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
            border: 1px solid #dee2e6 !important;
        }

        .btn-animate { transition: transform 0.2s, box-shadow 0.2s; }
        .btn-animate:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(25, 135, 84, 0.3) !important; }
      `}</style>
    </div>
  );
};

export default AdminEdit;
