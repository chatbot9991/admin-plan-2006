// src/components/modals/UserStatusModal.tsx

import React, { useState } from 'react';
import { X, CheckCircle2, Ban, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import CustomButton from '../CustomButton';

interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentStatus?: string | boolean;
  onSuccess: () => void;
}

const UserStatusModal: React.FC<UserStatusModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentStatus,
  onSuccess,
}) => {
  const [status, setStatus] = useState<'active' | 'inactive'>(
    currentStatus === true || currentStatus === 'active' ? 'active' : 'inactive'
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.put('/user/change-status', {
        _id: userId,
        status: status,
      });

      toast.success('وضعیت کاربر با موفقیت تغییر کرد');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تغییر وضعیت');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in-up">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
          <h5 className="fw-bolder mb-0 d-flex align-items-center gap-2 text-dark">
            <ShieldCheck className="text-warning" size={24} />
            وضعیت دسترسی
          </h5>
          <button onClick={onClose} className="btn btn-light rounded-circle p-2 hover-scale">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Selection Cards */}
        <div className="d-flex flex-column gap-3 mb-4">
          <div
            onClick={() => setStatus('active')}
            className={`p-3 rounded-4 cursor-pointer transition-all border d-flex align-items-center gap-3 ${
              status === 'active'
                ? 'bg-success-subtle border-success ring-success'
                : 'bg-light border-transparent hover-bg-gray'
            }`}
          >
            <div
              className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${status === 'active' ? 'bg-success text-white' : 'bg-white text-muted'}`}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h6
                className={`fw-bold mb-1 ${status === 'active' ? 'text-success-dark' : 'text-dark'}`}
              >
                فعال (Active)
              </h6>
              <p className="mb-0 text-muted small" style={{ fontSize: '0.85rem' }}>
                کاربر دسترسی کامل به پنل دارد.
              </p>
            </div>
          </div>

          <div
            onClick={() => setStatus('inactive')}
            className={`p-3 rounded-4 cursor-pointer transition-all border d-flex align-items-center gap-3 ${
              status === 'inactive'
                ? 'bg-danger-subtle border-danger ring-danger'
                : 'bg-light border-transparent hover-bg-gray'
            }`}
          >
            <div
              className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${status === 'inactive' ? 'bg-danger text-white' : 'bg-white text-muted'}`}
            >
              <Ban size={24} />
            </div>
            <div>
              <h6
                className={`fw-bold mb-1 ${status === 'inactive' ? 'text-danger-dark' : 'text-dark'}`}
              >
                مسدود (Inactive)
              </h6>
              <p className="mb-0 text-muted small" style={{ fontSize: '0.85rem' }}>
                دسترسی کاربر به پنل قطع می‌شود.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
        <div className="modal-footer-custom">
          <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
            انصراف
          </button>
          <CustomButton
            text="ذخیره تغییرات"
            onClick={handleSubmit}
            isLoading={loading}
            className="btn-submit"
          />
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .modal-content { background: white; width: 95%; max-width: 420px; padding: 25px 30px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.8); }
        .fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease; }
        .hover-scale:hover { transform: scale(1.1); background-color: #f3f4f6; }
        .hover-bg-gray:hover { background-color: #f8f9fa; border-color: #e2e8f0; }
        .ring-success { box-shadow: 0 0 0 1px rgba(25, 135, 84, 0.3); }
        .ring-danger { box-shadow: 0 0 0 1px rgba(220, 53, 69, 0.3); }
        .text-success-dark { color: #0f5132; }
        .text-danger-dark { color: #842029; }
                /* ========== Custom Footer & Button Styles ========== */
        .modal-footer-custom {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          padding-top: 20px;
          margin-top: 24px;
          border-top: 1px solid #f1f5f9;
        }

        .btn-cancel {
          background: transparent;
          color: #64748b; /* رنگ متن طوسی ملایم */
          border: none;
          padding: 10px 20px;
          font-weight: 600;
          border-radius: 10px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .btn-cancel:hover:not(:disabled) {
          background-color: #f8fafc;
          color: #334155;
        }

        /* تنظیم دقیق دکمه CustomButton برای هماهنگی با طراحی */
        .btn-submit {
          padding: 10px 24px !important;
          font-weight: 600 !important;
          border-radius: 10px !important;
          font-size: 0.9rem !important;
          min-width: 130px;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          margin: 0 !important;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }

        /* رنگ‌های اختصاصی برای مودال کیف پول (اورراید کردن رنگ آبی پیش‌فرض) */
        .btn-submit-success {
          background-color: #10b981 !important; /* سبز مدرن */
          color: #ffffff !important;
        }
        .btn-submit-success:hover:not(:disabled) {
          background-color: #059669 !important;
        }

        .btn-submit-danger {
          background-color: #ef4444 !important; /* قرمز مدرن */
          color: #ffffff !important;
        }
        .btn-submit-danger:hover:not(:disabled) {
          background-color: #dc2626 !important;
        }
        /* =================================================== */

      `}</style>
    </div>
  );
};

export default UserStatusModal;
