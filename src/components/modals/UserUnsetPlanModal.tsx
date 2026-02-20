// src/components/modals/UserUnsetPlanModal.tsx

import React, { useState } from 'react';
import { X, PackageMinus, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import CustomButton from '../CustomButton'; // مسیر ایمپورت را بر اساس پروژه خود چک کنید

interface UserUnsetPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    _id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  onSuccess: () => void;
}

const UserUnsetPlanModal: React.FC<UserUnsetPlanModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const displayName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}` 
    : user.username || 'نامشخص';

  const handleUnsetPlan = async () => {
    try {
      setLoading(true);
      // ارسال درخواست POST حاوی userId در Body
      await api.post('/user/unset-plan', { userId: user._id });
      
      toast.success(`پلن کاربر ${displayName} با موفقیت حذف شد`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error unsetting plan:', error);
      toast.error(error.response?.data?.message || 'خطا در حذف پلن کاربر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content fade-in-up">
        {/* Header */}
        <div className="custom-modal-header border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 text-danger">
            <PackageMinus size={22} />
            <h5 className="fw-bold mb-0">حذف پلن کاربر</h5>
          </div>
          <button onClick={onClose} className="btn-close-custom" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="custom-modal-body mb-4">
          <div className="alert alert-danger d-flex gap-3 align-items-start border-0 rounded-4" style={{ backgroundColor: '#fef2f2' }}>
            <AlertTriangle className="text-danger flex-shrink-0 mt-1" size={24} />
            <div>
              <h6 className="fw-bold text-danger mb-2">هشدار حذف پلن</h6>
              <p className="text-danger mb-0 mb-2" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                آیا از حذف پلن برای کاربر <strong>{displayName}</strong> اطمینان دارید؟
              </p>
              <div className="bg-white px-2 py-1 rounded border border-danger-subtle d-inline-block mt-2">
                <code className="text-danger dir-ltr" style={{ fontSize: '0.8rem' }}>ID: {user._id}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="custom-modal-footer pt-3 border-top">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onClose} 
            disabled={loading}
          >
            انصراف
          </button>
          
          <CustomButton
            text="تایید و حذف پلن"
            onClick={handleUnsetPlan}
            isLoading={loading}
            className="btn-submit btn-danger" // اضافه کردن کلاس قرمز برای عملیات حذفی
          />
        </div>
      </div>

      <style>{`
        .custom-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .custom-modal-content {
          background: #ffffff;
          width: 100%;
          max-width: 480px;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .btn-close-custom {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }
        .btn-close-custom:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .custom-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        /* استایل دقیق دکمه‌های فوتر مطابق با هماهنگی قبلی */
        .btn-cancel {
          padding: 0 20px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-cancel:hover:not(:disabled) {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        /* کلاس کمکی برای تغییر رنگ دکمه کاستوم به قرمز در این مودال خاص */
        .btn-submit.btn-danger {
          background: #ef4444 !important;
          border: none !important;
        }
        .btn-submit.btn-danger:hover:not(:disabled) {
          background: #dc2626 !important;
        }
      `}</style>
    </div>
  );
};

export default UserUnsetPlanModal;
