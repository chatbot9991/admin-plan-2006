// src/components/modals/UserWalletModal.tsx

import React, { useState } from 'react';
import { X, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import CustomButton from '../CustomButton';

interface UserWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const UserWalletModal: React.FC<UserWalletModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'increase' | 'decrease'>('increase');
  const [loading, setLoading] = useState(false);

  const formatNumber = (num: string) => {
    return num.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue))) {
      setAmount(rawValue);
    }
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.warning('لطفاً مبلغ معتبری وارد کنید');
      return;
    }

    try {
      setLoading(true);
      const finalAmount = type === 'decrease' ? -Number(amount) : Number(amount);

      await api.put('/user/wallet/increase-or-decrease', {
        _id: userId,
        amount: finalAmount,
      });

      toast.success(type === 'increase' ? 'افزایش موجودی انجام شد' : 'کاهش موجودی انجام شد');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تراکنش');
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
            <Wallet className="text-success" size={24} />
            مدیریت کیف پول
          </h5>
          <button onClick={onClose} className="btn btn-light rounded-circle p-2 hover-scale">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {/* Action Switcher */}
        <div className="p-1 bg-light rounded-4 d-flex mb-4 position-relative overflow-hidden">
          <button
            className={`flex-fill btn border-0 py-2 rounded-3 fw-bold transition-all d-flex align-items-center justify-content-center gap-2 ${
              type === 'increase' ? 'bg-white shadow-sm text-success' : 'text-muted'
            }`}
            onClick={() => setType('increase')}
          >
            <ArrowUpCircle size={18} /> افزایش موجودی
          </button>
          <button
            className={`flex-fill btn border-0 py-2 rounded-3 fw-bold transition-all d-flex align-items-center justify-content-center gap-2 ${
              type === 'decrease' ? 'bg-white shadow-sm text-danger' : 'text-muted'
            }`}
            onClick={() => setType('decrease')}
          >
            <ArrowDownCircle size={18} /> کاهش موجودی
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="form-label text-muted small fw-bold mb-2">مبلغ تراکنش (تومان)</label>
          <div className="position-relative">
            <input
              type="text"
              className="form-control form-control-lg bg-light border-0 rounded-4 text-center fw-bolder"
              placeholder="0"
              value={formatNumber(amount)}
              onChange={handleChangeAmount}
              style={{ fontSize: '1.5rem', height: '60px', color: '#2d3748' }}
              autoFocus
            />
            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted small user-select-none">
              تومان
            </span>
          </div>
          <div style={{ minHeight: '24px' }} className="mt-2 text-center">
            {amount && (
              <span
                className={`small fw-bold fade-in ${type === 'increase' ? 'text-success' : 'text-danger'}`}
              >
                {type === 'increase' ? '+ واریز به حساب' : '- برداشت از حساب'}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
        <div className="modal-footer-custom">
          <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
            انصراف
          </button>
          <CustomButton
            text={type === 'increase' ? 'افزایش موجودی' : 'کاهش موجودی'}
            onClick={handleSubmit}
            isLoading={loading}
            // رنگ دکمه بر اساس نوع عملیات کلاس اختصاصی می‌گیرد
            className={`btn-submit ${type === 'increase' ? 'btn-submit-success' : 'btn-submit-danger'}`}
          />
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .modal-content { background: white; width: 95%; max-width: 420px; padding: 25px 30px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.8); }
        .fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .transition-all { transition: all 0.2s ease-in-out; }
        .hover-scale:hover { transform: scale(1.1); background-color: #f3f4f6; }
        .hover-bg-gray:hover { background-color: #e2e8f0; }
        .form-control:focus { box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.15); background-color: #fff; }
        
        /* استایل‌های اجباری برای تغییر رنگ دکمه */
        .bg-success { background-color: #198754 !important; }
        .hover-bg-success-dark:hover { background-color: #157347 !important; }
        .bg-danger { background-color: #dc3545 !important; }
        .hover-bg-danger-dark:hover { background-color: #bb2d3b !important; }
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

export default UserWalletModal;
