// src/components/modals/RequestUpdateModal.tsx

import React, { useState } from 'react';
import { X, Smartphone, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import CustomButton from '../CustomButton'; // مسیر ایمپورت ممکن است بر اساس پوشه‌بندی شما کمی متفاوت باشد

interface User {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface RequestUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

const RequestUpdateModal: React.FC<RequestUpdateModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !user) return null;

  const displayName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}` 
    : user.username || 'نامشخص';

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // فراخوانی API بر اساس مستندات Swagger
      await api.put('/user/request-update-version-user', { 
        _id: user._id 
      });
      
      toast.success(`درخواست آپدیت برای کاربر ${displayName} با موفقیت ارسال شد.`);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error requesting version update:', error);
      toast.error('خطا در ارسال درخواست آپدیت. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rum-overlay">
      <div className="rum-content fade-in-up">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-primary">
            <Smartphone size={22} />
            درخواست آپدیت کلاینت
          </h5>
          <button onClick={onClose} className="btn btn-light rounded-circle p-2 transition-all hover-bg-gray" disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mb-3" style={{ width: '70px', height: '70px' }}>
            <Smartphone size={34} className="pulse-animation" />
          </div>
          <h6 className="fw-bold text-dark mb-2" style={{ lineHeight: '1.6' }}>
            آیا از ارسال درخواست آپدیت برای این کاربر اطمینان دارید؟
          </h6>
          
          <div className="bg-light rounded-3 p-3 mt-3 text-start border border-light">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="text-muted small">نام کاربر:</span>
              <span className="fw-bold text-dark">{displayName}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">شناسه کاربر:</span>
              <code className="bg-white px-2 py-1 rounded text-primary" style={{ fontSize: '12px' }}>{user._id}</code>
            </div>
          </div>

          <div className="d-flex align-items-start gap-2 text-muted mt-3 bg-blue-light p-2 rounded-3">
            <AlertCircle size={18} className="text-info mt-1 flex-shrink-0" />
            <p className="small mb-0 text-start" style={{ fontSize: '0.85rem' }}>
               با تایید این عملیات، یک پیام سیستمی مبنی بر الزام یا پیشنهاد بروزرسانی کلاینت (اپلیکیشن) برای این کاربر ارسال خواهد شد.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex gap-2 pt-2">
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
            text="ارسال درخواست آپدیت" 
            onClick={handleSubmit} 
            isLoading={isLoading} 
            className="flex-grow-1"
          />
        </div>
      </div>

      <style>{`
        .rum-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          z-index: 1060;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        
        .rum-content {
          background: #ffffff;
          width: 90%;
          max-width: 450px;
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

        .pulse-animation {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .hover-bg-gray:hover {
          background-color: #f1f5f9 !important;
        }

        .bg-primary-subtle {
          background-color: #eff6ff !important;
        }

        .bg-blue-light {
          background-color: #f0f9ff;
          border: 1px solid #e0f2fe;
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

        /* اتصال به استایل CustomButton */
        .custom-btn {
          height: 48px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
        }
        .custom-btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        .custom-btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
};

export default RequestUpdateModal;
