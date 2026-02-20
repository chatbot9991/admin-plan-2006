// src/components/UserPlanModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, Check, Layers, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import CustomButton from '../CustomButton';

// تعریف اینترفیس پلن بر اساس دیتای API
export interface Plan {
  _id: string;
  name: string;
  price: number | string;
  duration?: number;
  description?: string;
}

interface UserPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string; // شناسه کاربری که قرار است پلن برایش ست شود
  currentPlanId?: string; // (اختیاری) برای نشان دادن پلن فعلی کاربر
  onSuccess?: () => void; // تابعی برای رفرش کردن لیست کاربران پس از موفقیت
}

const UserPlanModal: React.FC<UserPlanModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentPlanId,
  onSuccess,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // ریست کردن استیت‌ها هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      // اگر پلن فعلی را داریم، آن را انتخاب شده پیش‌فرض قرار ندهیم تا کاربر مجبور به انتخاب آگاهانه باشد
      // یا می‌توانیم قرار دهیم: setSelectedPlanId(currentPlanId || null);
      setSelectedPlanId(null); 
    }
  }, [isOpen]);

  // دیبانس برای سرچ (برای جلوگیری از ریکوئست‌های زیاد هنگام تایپ)
  useEffect(() => {
    if (!isOpen) return;
    const delayDebounceFn = setTimeout(() => {
      fetchPlans();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const params: any = { limit: 50 }; // گرفتن 50 پلن اول
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/plan/menu', { params });
      
      // هندل کردن ساختارهای مختلف احتمالی ریسپانس
      const data = response.data;
      if (Array.isArray(data)) {
        setPlans(data);
      } else if (data.plans && Array.isArray(data.plans)) {
        setPlans(data.plans);
      } else if (data.list && Array.isArray(data.list)) {
        setPlans(data.list);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error loading plans', error);
      toast.error('خطا در دریافت لیست اشتراک‌ها');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlanId) {
      toast.warning('لطفاً یک اشتراک را انتخاب کنید.');
      return;
    }

    setSubmitting(true);
    try {
      // طبق داکیومنت Postman: userId و planId در بادی ارسال می‌شوند
      await api.post('/user/set-plan', {
        userId: userId,
        planId: selectedPlanId
      });

      toast.success('اشتراک کاربر با موفقیت تغییر کرد.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error setting plan', error);
      toast.error('خطا در تغییر اشتراک کاربر.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-custom fade-in-up">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Layers className="text-primary" size={24} />
            تغییر اشتراک کاربر
          </h5>
          <button onClick={onClose} className="btn-close-custom">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="position-relative mb-3">
          <Search
            className="position-absolute text-muted"
            size={18}
            style={{ top: '12px', right: '12px' }}
          />
          <input
            type="text"
            className="form-control pe-5 bg-light border-0"
            placeholder="جستجوی نام اشتراک..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Plan List */}
        <div className="plan-list custom-scrollbar">
          {loadingPlans ? (
            <div className="text-center py-5">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="mt-2 text-muted small">در حال بارگذاری پلن‌ها...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Layers size={40} className="mb-2 opacity-25" />
              <p>هیچ پلنی یافت نشد.</p>
            </div>
          ) : (
            plans.map((plan) => {
              const isSelected = selectedPlanId === plan._id;
              const isCurrent = currentPlanId === plan._id;
              
              return (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlanId(plan._id)}
                  className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-subtle border border-primary shadow-sm'
                      : 'bg-white border hover-shadow'
                  }`}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${
                        isSelected ? 'bg-primary text-white' : 'bg-light text-secondary'
                      }`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <Layers size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                        {plan.name}
                        {isCurrent && <span className="badge bg-secondary text-white small-badge">فعلی</span>}
                      </h6>
                      <small className="text-muted">
                        {plan.price && Number(plan.price) > 0 
                          ? `${Number(plan.price).toLocaleString()} تومان` 
                          : 'رایگان'}
                      </small>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="bg-primary text-white rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                      <Check size={14} />
                    </div>
                  ) : (
                    <div className="border rounded-circle" style={{ width: '24px', height: '24px', opacity: 0.3 }}></div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer (Unified Style) */}
        <div className="modal-footer-custom">
          <button 
            type="button"
            onClick={onClose} 
            className="btn-cancel"
            disabled={submitting}
          >
            انصراف
          </button>
          <CustomButton 
            text="ذخیره و تغییر پلن" 
            onClick={handleSubmit} 
            isLoading={submitting}
            className="btn-submit"
          />
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1060;
          display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
        }
        .modal-content-custom {
          background: white; width: 95%; max-width: 480px; padding: 24px;
          border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex; flex-direction: column; max-height: 85vh;
        }
        .plan-list {
          flex-grow: 1; overflow-y: auto; max-height: 400px; padding-right: 4px;
        }
        .fade-in-up { animation: fadeInUp 0.3s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .hover-shadow:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transform: translateY(-1px); border-color: #cbd5e1 !important; }
        .cursor-pointer { cursor: pointer; }
        .bg-primary-subtle { background-color: #f0f9ff; }
        .btn-close-custom { background: #f1f5f9; border: none; border-radius: 50%; padding: 8px; color: #64748b; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-close-custom:hover { background: #e2e8f0; color: #334155; }
        .small-badge { font-size: 0.65rem; font-weight: 500; }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }

        /* ========== Unified Footer Styles (Same as other modals) ========== */
        .modal-footer-custom {
          display: flex; justify-content: flex-end; align-items: center; gap: 12px;
          padding-top: 20px; margin-top: 16px; border-top: 1px solid #f1f5f9;
        }
        .btn-cancel {
          background: transparent; color: #64748b; border: none; padding: 10px 20px;
          font-weight: 600; border-radius: 10px; font-size: 0.9rem; transition: all 0.2s ease; outline: none;
        }
        .btn-cancel:hover:not(:disabled) { background-color: #f8fafc; color: #334155; }
        
        .btn-submit {
          padding: 10px 24px !important; font-weight: 600 !important; border-radius: 10px !important;
          font-size: 0.9rem !important; min-width: 130px; border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.2s ease !important; display: flex !important; justify-content: center !important;
          align-items: center !important; margin: 0 !important;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default UserPlanModal;
