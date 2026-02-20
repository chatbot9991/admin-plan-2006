// src/pages/user/UserEdit.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Smartphone, 
  ArrowRight, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../../services/api';
import CustomButton from '../../components/CustomButton'; // مسیر را بسته به ساختار پوشه‌های خود تنظیم کنید

// --- Interfaces ---
interface UserEditForm {
  _id: string;
  name: string;
  family: string;
  username: string;
  email: string;
  mobile: string;
}

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States
  const [formData, setFormData] = useState<UserEditForm>({
    _id: '',
    name: '',
    family: '',
    username: '',
    email: '',
    mobile: '',
  });
  
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const response = await api.get(`/user/details?_id=${id}`);
        
        // پشتیبانی از ساختارهای مختلف ریسپانس (مانند صفحه جزئیات)
        const userData = response.data?.user || response.data?.result || response.data?.data;
        
        if (userData && userData._id) {
          setFormData({
            _id: userData._id,
            name: userData.name || '',
            family: userData.family || '',
            username: userData.username || '',
            email: userData.email || '',
            mobile: userData.mobile || '',
          });
        } else {
          setFetchError(true);
          toast.error('اطلاعات کاربر یافت نشد.');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setFetchError(true);
        toast.error('خطا در دریافت اطلاعات کاربر.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ولیدیشن ساده سمت فرانت
    if (!formData.username) {
      toast.warning('وارد کردن نام کاربری الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);
      // فراخوانی متد PUT بر اساس مستندات Swagger
      await api.put('/user/update', formData);
      
      toast.success('اطلاعات کاربر با موفقیت بروزرسانی شد.', { position: 'bottom-center' });
      // بازگشت به صفحه قبل (یا لیست) پس از موفقیت
      navigate(-1);
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMsg = error.response?.data?.message || 'خطا در بروزرسانی اطلاعات کاربر. لطفا مجددا تلاش کنید.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Loading ---
  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  // --- Render Error ---
  if (fetchError) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 fade-in">
        <AlertCircle size={64} className="text-muted mb-3" />
        <h3 className="text-dark fw-bold">خطا در دریافت اطلاعات!</h3>
        <p className="text-muted">امکان ویرایش این کاربر در حال حاضر وجود ندارد.</p>
        <button className="custom-btn custom-btn-primary mt-3 px-4 py-2 rounded-pill" onClick={() => navigate(-1)}>
          بازگشت به لیست
        </button>
      </div>
    );
  }

  // --- Render Form ---
  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bolder text-dark mb-1 d-flex align-items-center gap-2">
            <Edit3 className="text-primary" size={28} />
            ویرایش اطلاعات کاربر
          </h3>
          <p className="text-muted small mb-0 mt-1">
            شناسه سیستم: <span className="dir-ltr text-primary fw-bold">{formData._id}</span>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-white border shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 hover-up transition-all"
          type="button"
        >
          <ArrowRight size={18} />
          <span className="fw-medium">انصراف و بازگشت</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-primary-subtle border-0 py-3">
          <h6 className="m-0 fw-bold text-primary d-flex align-items-center gap-2">
            <User size={18} /> مشخصات کاربری
          </h6>
        </div>
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              
              {/* Name */}
              <div className="col-md-6">
                <label className="form-label fw-medium text-dark d-flex align-items-center gap-2">
                  نام
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control form-control-lg bg-light border-0 px-3"
                    placeholder="نام کاربر را وارد کنید"
                  />
                </div>
              </div>

              {/* Family */}
              <div className="col-md-6">
                <label className="form-label fw-medium text-dark d-flex align-items-center gap-2">
                  نام خانوادگی
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="family"
                    value={formData.family}
                    onChange={handleChange}
                    className="form-control form-control-lg bg-light border-0 px-3"
                    placeholder="نام خانوادگی را وارد کنید"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="col-md-6">
                <label className="form-label fw-medium text-dark d-flex align-items-center gap-2">
                  <User size={16} className="text-muted" /> نام کاربری <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="form-control form-control-lg bg-light border-0 px-3 dir-ltr text-start"
                    placeholder="Username"
                  />
                </div>
                <small className="text-muted mt-1 d-block">این فیلد برای ورود به سیستم الزامی است.</small>
              </div>

              {/* Mobile */}
              <div className="col-md-6">
                <label className="form-label fw-medium text-dark d-flex align-items-center gap-2">
                  <Smartphone size={16} className="text-muted" /> شماره موبایل
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="form-control form-control-lg bg-light border-0 px-3 dir-ltr text-start"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-md-12">
                <label className="form-label fw-medium text-dark d-flex align-items-center gap-2">
                  <Mail size={16} className="text-muted" /> پست الکترونیک (ایمیل)
                </label>
                <div className="position-relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control form-control-lg bg-light border-0 px-3 dir-ltr text-start"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

            </div>

            <hr className="my-5 border-light" />

            {/* Submit Actions */}
            <div className="d-flex justify-content-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-light rounded-3 px-4 py-2 fw-medium transition-all"
                disabled={isSubmitting}
              >
                انصراف
              </button>
              
              {/* استفاده از CustomButton دقیقاً طبق خواسته شما */}
              <CustomButton
                type="submit"
                text="ذخیره تغییرات"
                isLoading={isSubmitting}
                className="px-5 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hover-up { transition: all 0.3s ease; }
        .hover-up:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
        
        .btn-white { background-color: #fff; color: #475569; }
        .btn-white:hover { background-color: #f8fafc; color: #0f172a; }
        
        .transition-all { transition: all 0.3s ease; }
        .dir-ltr { direction: ltr; display: inline-block; }
        
        /* Input Focus Style overrides for seamless look */
        .form-control:focus {
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25) !important;
          background-color: #fff !important;
        }
        
        /* Custom Button Override if not fully handled in the component */
        .custom-btn {
          font-weight: 500;
          transition: all 0.2s;
        }
      `}</style>
    </div>
  );
};

export default UserEdit;
