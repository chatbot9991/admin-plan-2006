// src/pages/org/OrgEdit.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Save, 
  UserCheck, 
  ArrowRight, 
  User, 
  AtSign, 
  Phone, 
  Mail 
} from 'lucide-react';

const OrgEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    family: '',
    username: '',
    email: '',
    mobile: '',
  });

  // دریافت اطلاعات فعلی جهت نمایش در فرم
  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/org/details?_id=${id}`);
        const data = response.data.org || response.data;
        
        if (data) {
          setFormData({
            name: data.name || '',
            family: data.family || '',
            username: data.username || '',
            email: data.email || '',
            mobile: data.mobile || '',
          });
        }
      } catch (error) {
        console.error('Error fetching org for edit:', error);
        toast.error('خطا در دریافت اطلاعات. لطفا مجددا تلاش کنید.');
        navigate('/org/list');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchOrgDetails();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // استفاده از متد PUT برای آپدیت اطلاعات (مسیر را در صورت نیاز با بک‌اند سینک کنید)
      const payload = {
        _id: id,
        ...formData
      };
      
      await api.put('/org/update', payload); // اگر بک‌اند /org/edit است، آن را تغییر دهید
      
      toast.success('اطلاعات سازمان / کاربر با موفقیت ویرایش شد');
      navigate('/org/list');
    } catch (error) {
      console.error('Error updating org:', error);
      toast.error('خطا در ثبت ویرایش. لطفا مجددا تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 p-md-5 fade-in" style={{ maxWidth: '1000px' }}>
      
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-2 d-flex align-items-center gap-3">
            <div className="icon-wrapper bg-success text-white d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '50px', height: '50px' }}>
              <UserCheck size={26} />
            </div>
            ویرایش اطلاعات سازمان
          </h2>
          <p className="text-muted mb-0 ms-5 ps-2">تغییرات مورد نیاز را در فیلدهای زیر اعمال کرده و ذخیره نمایید.</p>
        </div>
        <Link to="/org/list" className="btn btn-white border shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 back-btn">
          <ArrowRight size={18} className="text-secondary" />
          <span className="text-secondary fw-bold">بازگشت به لیست</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="card border-0 custom-card rounded-4 p-4 p-md-5 bg-white position-relative overflow-hidden">
        {/* Decorative Top Line - Green for Edit */}
        <div className="position-absolute top-0 start-0 w-100 bg-success" style={{ height: '4px' }}></div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4 mb-4">
            
            {/* نام */}
            <div className="col-md-6">
              <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <User size={18} className="text-success" />
                نام (Name)
              </label>
              <input
                type="text"
                name="name"
                className="form-control custom-input"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="مثال: علی"
              />
            </div>

            {/* نام خانوادگی */}
            <div className="col-md-6">
              <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <User size={18} className="text-success" />
                نام خانوادگی (Family)
              </label>
              <input
                type="text"
                name="family"
                className="form-control custom-input"
                value={formData.family}
                onChange={handleInputChange}
                required
                placeholder="مثال: محمدی"
              />
            </div>
          </div>

          <div className="row g-4">
            {/* نام کاربری */}
            <div className="col-md-4">
              <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <AtSign size={18} className="text-success" />
                نام کاربری (Username)
              </label>
              <input
                type="text"
                name="username"
                className="form-control custom-input text-start"
                dir="ltr"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="alimohammadi"
              />
            </div>

            {/* ایمیل */}
            <div className="col-md-4">
              <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <Mail size={18} className="text-success" />
                ایمیل (Email)
              </label>
              <input
                type="email"
                name="email"
                className="form-control custom-input text-start"
                dir="ltr"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="example@mail.com"
              />
            </div>

            {/* موبایل */}
            <div className="col-md-4">
              <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                <Phone size={18} className="text-success" />
                شماره موبایل (Mobile)
              </label>
              <input
                type="text"
                name="mobile"
                className="form-control custom-input text-start"
                dir="ltr"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                placeholder="09120000000"
              />
            </div>
          </div>

          <hr className="my-5 text-muted opacity-25" />

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-md-row justify-content-end gap-3">
            <Link to="/org/list" className="btn btn-light px-5 py-3 rounded-pill fw-bold text-secondary action-btn">
              انصراف
            </Link>
            <button
              type="submit"
              className="btn btn-success px-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg btn-submit"
              disabled={isSubmitting}
            >
              <Save size={20} />
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>

      {/* --- Styles --- */}
      <style>{`
        /* Animations */
        .fade-in { animation: fadeInUp 0.4s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Card Styles */
        .custom-card {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .custom-card:hover {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
        }

        /* Input Styles */
        .custom-input {
          background-color: #f8f9fc !important;
          border: 2px solid transparent !important;
          border-radius: 14px;
          padding: 14px 20px;
          font-size: 1rem;
          color: #333;
          transition: all 0.3s ease;
        }
        .custom-input::placeholder {
          color: #adb5bd;
          font-size: 0.9rem;
        }
        .custom-input:focus {
          background-color: #ffffff !important;
          border-color: #10b981 !important; /* Green Focus Border */
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
        }

        /* Button Styles */
        .back-btn { transition: all 0.2s ease; }
        .back-btn:hover { background-color: #f8f9fa; transform: translateX(-3px); }

        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { background-color: #e2e6ea; }

        /* دکمه سبز مدرن */
        .btn-submit {
          background: linear-gradient(45deg, #10b981, #059669) !important;
          border: none;
          color: #ffffff !important;
          transition: all 0.3s ease;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
        }
        .btn-submit:disabled {
          background: #6c757d !important;
          box-shadow: none !important;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default OrgEdit;
