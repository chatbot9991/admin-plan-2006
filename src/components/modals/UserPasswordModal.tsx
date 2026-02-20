// src/components/modals/UserPasswordModal.tsx

import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import CustomButton from '../CustomButton';

interface UserPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      toast.warning('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);
      await api.put('/user/change-password', {
        _id: userId,
        password: password,
      });

      toast.success('رمز عبور با موفقیت تغییر کرد');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تغییر رمز عبور');
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
            <KeyRound className="text-primary" size={24} />
            تغییر رمز عبور
          </h5>
          <button onClick={onClose} className="btn btn-light rounded-circle p-2 hover-scale">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="mb-4">
          <label className="form-label text-muted small fw-bold">رمز عبور جدید</label>
          <div className="position-relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control form-control-lg bg-light border-0 ps-3 pe-5 rounded-4"
              placeholder="رمز عبور..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontSize: '1.1rem' }}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none"
              onClick={() => setShowPassword(!showPassword)}
              style={{ paddingRight: '15px' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="button"
            onClick={generatePassword}
            className="btn btn-light text-primary w-100 rounded-3 py-2 d-flex align-items-center justify-content-center gap-2 small fw-bold hover-bg-primary-subtle border-0"
          >
            <RefreshCw size={16} />
            تولید رمز تصادفی قوی
          </button>
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
        .hover-scale:hover { transform: scale(1.1); background-color: #f3f4f6; }
        .hover-bg-gray:hover { background-color: #e2e8f0; }
        .hover-bg-primary-subtle:hover { background-color: #e0e7ff; color: #4338ca; }
        .form-control:focus { box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.15); background-color: #fff; }
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

export default UserPasswordModal;
