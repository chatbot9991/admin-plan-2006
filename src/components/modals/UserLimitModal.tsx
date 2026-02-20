// src/components/modals/UserLimitModal.tsx

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import CustomButton from '../CustomButton';

// اضافه کردن فیلدهای احتمالی محدودیت به اینترفیس کاربر
interface User {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  limit?: boolean;
  numberOfUserOnline?: number;
}

interface UserLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

const UserLimitModal: React.FC<UserLimitModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLimited, setIsLimited] = useState<boolean>(false);
  const [concurrentUsers, setConcurrentUsers] = useState<number>(0);

  // مقداردهی اولیه استیت‌ها در صورت وجود مقادیر قبلی در آبجکت کاربر
  useEffect(() => {
    if (isOpen && user) {
      setIsLimited(user.limit || false);
      setConcurrentUsers(user.numberOfUserOnline !== undefined ? user.numberOfUserOnline : 0);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const displayName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}` 
    : user.username || 'نامشخص';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (concurrentUsers < 0) {
      toast.warning('تعداد کاربران آنلاین نمی‌تواند منفی باشد.');
      return;
    }

    setIsLoading(true);

    try {
      // فراخوانی API بر اساس مستندات Swagger ارسالی
      await api.put('/user/limit/update', { 
        userId: user._id,
        limit: isLimited,
        numberOfUserOnline: Number(concurrentUsers)
      });
      
      toast.success(`تنظیمات محدودیت برای ${displayName} با موفقیت بروزرسانی شد.`);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error updating user limits:', error);
      toast.error('خطا در بروزرسانی محدودیت‌ها. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ulm-overlay">
      <div className="ulm-content fade-in-up">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-warning">
            <ShieldAlert size={22} />
            تنظیمات محدودیت کاربر
          </h5>
          <button onClick={onClose} className="btn btn-light rounded-circle p-2 transition-all hover-bg-gray" disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mb-4">
          <div className="bg-light rounded-3 p-3 mb-4 text-start border border-light d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="text-muted small">کاربر:</span>
                <span className="fw-bold text-dark">{displayName}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">شناسه:</span>
                <code className="bg-white px-2 py-1 rounded text-primary" style={{ fontSize: '11px' }}>{user._id}</code>
              </div>
            </div>
            <div className="bg-warning-subtle text-warning p-2 rounded-circle">
               <ShieldAlert size={24} />
            </div>
          </div>

          <form id="limitForm" onSubmit={handleSubmit}>
            {/* Toggle Limit */}
            <div className="mb-4 p-3 border rounded-3 bg-white shadow-sm d-flex justify-content-between align-items-center cursor-pointer transition-all" onClick={() => setIsLimited(!isLimited)}>
              <div>
                <h6 className="fw-bold text-dark mb-1">اعمال محدودیت (Limit)</h6>
                <p className="text-muted small mb-0">با فعال‌سازی این گزینه، محدودیت‌های سیستمی روی کاربر اعمال می‌شود.</p>
              </div>
              <div className="form-check form-switch m-0" onClick={(e) => e.stopPropagation()}>
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="limitSwitch" 
                  checked={isLimited} 
                  onChange={(e) => setIsLimited(e.target.checked)}
                  style={{ width: '45px', height: '24px', cursor: 'pointer' }} 
                />
              </div>
            </div>

            {/* Concurrent Users Online */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                <Users size={16} className="text-primary" />
                تعداد مجاز کاربران آنلاین همزمان (Sessions)
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control custom-input dir-ltr"
                  value={concurrentUsers}
                  onChange={(e) => setConcurrentUsers(parseInt(e.target.value) || 0)}
                  min="0"
                  disabled={isLoading}
                  placeholder="مثال: 1"
                />
                <span className="input-group-text bg-light text-muted">دستگاه</span>
              </div>
              <div className="form-text mt-2" style={{ fontSize: '0.8rem' }}>
                عدد 0 ممکن است به معنای عدم دسترسی یا دسترسی نامحدود (بسته به منطق بک‌اند) باشد.
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="d-flex gap-2 pt-2 border-top mt-4 pt-3">
          <button
            type="button"
            className="btn btn-light fw-medium flex-grow-1 custom-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
            style={{ height: '48px', borderRadius: '12px' }}
          >
            انصراف
          </button>
          
          <CustomButton 
            text="ذخیره تغییرات" 
            type="submit"
            onClick={handleSubmit} 
            isLoading={isLoading} 
            className="flex-grow-1"
          />
        </div>
      </div>

      <style>{`
        .ulm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          z-index: 1060;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        
        .ulm-content {
          background: #ffffff;
          width: 90%;
          max-width: 500px;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .hover-bg-gray:hover {
          background-color: #f1f5f9 !important;
        }

        .bg-warning-subtle {
          background-color: #fef3c7 !important;
        }

        .custom-input {
          border-radius: 10px !important;
          border: 1px solid #e2e8f0;
          height: 48px;
          font-size: 1rem;
        }
        
        .input-group-text {
          border-radius: 10px 0 0 10px !important;
          border: 1px solid #e2e8f0;
          border-right: none;
        }
        
        .custom-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .form-check-input:checked {
          background-color: #f59e0b; /* رنگ نارنجی هشدار در زمان فعال بودن */
          border-color: #f59e0b;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .dir-ltr {
          direction: ltr;
          text-align: right;
        }

        .custom-btn-cancel {
          background-color: #f8f9fa;
          border: 1px solid #e2e8f0;
          color: #475569;
          transition: all 0.2s;
        }

        .custom-btn-cancel:hover:not(:disabled) {
          background-color: #e2e8f0;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default UserLimitModal;
 