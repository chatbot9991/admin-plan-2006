// src/pages/discount/DiscountDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Calendar as CalendarIcon,
  Layers,
  Users,
  Tag,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Hash,
  Lock,
  Clock,
} from 'lucide-react';

import { api } from '../../services/api';

// --- اینترفیس‌ها ---
interface Plan {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface DiscountData {
  _id: string;
  code?: string;
  title: string;
  amount: number; // در جیسون استرینگ است اما معمولا نامبر هندل میکنیم، یا تبدیل میکنیم
  type: 'percentage' | 'fixed' | 'amount'; // تایپ amount در جیسون شما بود
  startDate: string;
  endDate: string;
  plan?: Plan | null;
  users?: User[];
  status: 'active' | 'deactive'; // اصلاح شد: استفاده از status بجای isActive
  createdAt: string;
}

const DiscountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [discount, setDiscount] = useState<DiscountData | null>(null);

  // --- دریافت اطلاعات ---
  useEffect(() => {
    const fetchDiscount = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/discount/details?_id=${id}`);
        // هندل کردن ساختار احتمالی ریسپانس
        const data = response.data.discount || response.data;
        setDiscount(data);
      } catch (error) {
        console.error('Error fetching discount:', error);
        toast.error('خطا در دریافت اطلاعات تخفیف');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id]);

  // --- توابع کمکی ---
  const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('کپی شد');
  };

  // --- منطق وضعیت و استایل کارت ---
  const getStatusInfo = () => {
    if (!discount)
      return {
        label: '---',
        colorClass: 'bg-secondary',
        icon: Tag,
        cardGradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
        isLocked: false,
        lockLabel: '',
        desc: '...',
      };

    const now = new Date();
    const end = new Date(discount.endDate);
    const isExpired = end < now;

    // نکته مهم: طبق جیسون شما، فیلد status مقدار 'active' یا 'deactive' دارد.
    const isDeactive = discount.status !== 'active';

    // 1. اولویت اول: وضعیت غیرفعال (توسط ادمین)
    if (isDeactive) {
      return {
        label: 'غیرفعال',
        badgeClass: 'bg-secondary text-white',
        containerClass: 'border-secondary',
        icon: XCircle,
        desc: 'غیرفعال شده توسط مدیر.',
        cardGradient: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)', // تیره برای غیرفعال
        isLocked: true,
        lockLabel: 'غیرفعال',
        lockIcon: Lock,
      };
    }

    // 2. اولویت دوم: منقضی شده (تاریخ گذشته)
    if (isExpired) {
      return {
        label: 'منقضی شده',
        badgeClass: 'bg-warning text-dark',
        containerClass: 'border-warning',
        icon: AlertTriangle,
        desc: 'مهلت استفاده تمام شده است.',
        cardGradient: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)', // قهوه‌ای/نارنجی تیره برای انقضا
        isLocked: true,
        lockLabel: 'منقضی شده',
        lockIcon: Clock,
      };
    }

    // 3. حالت فعال و سالم (آبی)
    return {
      label: 'فعال',
      badgeClass: 'bg-success text-white',
      containerClass: 'border-success',
      icon: CheckCircle,
      desc: 'قابل استفاده.',
      cardGradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)', // آبی درخواست شده
      isLocked: false,
      lockLabel: '',
      lockIcon: Lock,
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="text-center mt-5">
        <h3>تخفیف یافت نشد!</h3>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          بازگشت
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const LockOverlayIcon = statusInfo.lockIcon || Lock;
  const displayCode = discount.code || discount._id;

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      {/* --- Header --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">جزئیات تخفیف</h3>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light border shadow-sm rounded-pill px-4 d-flex align-items-center gap-2 hover-scale"
        >
          <ArrowRight size={18} />
          <span>بازگشت</span>
        </button>
      </div>

      <div className="row g-4">
        {/* --- Left Column: Dynamic Preview Card --- */}
        <div className="col-lg-4 order-lg-last">
          <div
            className="preview-card p-4 rounded-4 sticky-top position-relative overflow-hidden transition-all"
            style={{
              top: '20px',
              minHeight: '420px',
              background: statusInfo.cardGradient,
              boxShadow: statusInfo.isLocked
                ? '0 15px 35px -5px rgba(0, 0, 0, 0.5)'
                : '0 15px 35px -5px rgba(14, 165, 233, 0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {/* دوایر پس‌زمینه */}
            <div className="bg-circle-1"></div>
            <div className="bg-circle-2"></div>

            {/* --- Lock Overlay (برای حالت منقضی یا غیرفعال) --- */}
            {statusInfo.isLocked && (
              <div className="lock-overlay d-flex flex-column align-items-center justify-content-center text-white z-index-3">
                <div className="bg-white bg-opacity-10 p-4 rounded-circle mb-3 backdrop-blur border border-white border-opacity-25 shadow-lg">
                  <LockOverlayIcon size={48} strokeWidth={1.5} />
                </div>
                <h4 className="fw-bold text-shadow">{statusInfo.lockLabel}</h4>
              </div>
            )}

            {/* --- محتوای کارت (در حالت قفل بلور می‌شود) --- */}
            <div className={`card-content-wrapper ${statusInfo.isLocked ? 'blur-mode' : ''}`}>
              <div className="position-relative z-index-2 text-center text-white mb-4 mt-3">
                <div
                  className="icon-box bg-white text-dark rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{ width: '70px', height: '70px' }}
                >
                  <Tag size={32} />
                </div>
                <h3 className="fw-bolder mb-2 text-shadow dir-ltr">
                  {displayCode.substring(0, 10)}
                  {displayCode.length > 10 ? '...' : ''}
                </h3>
                <p className="text-white small opacity-75">{discount.title}</p>
              </div>

              <div className="position-relative z-index-2 details-box bg-white bg-opacity-10 rounded-4 p-4 mb-4 backdrop-blur border border-white border-opacity-25">
                <div className="d-flex justify-content-between mb-3 border-bottom border-white border-opacity-25 pb-2">
                  <span className="text-white fw-light small">مقدار:</span>
                  <span className="fw-bolder fs-4 text-white text-shadow">
                    {Number(discount.amount).toLocaleString()}
                    <small className="fs-6 ms-1 fw-light">
                      {discount.type === 'percentage'
                        ? '%'
                        : discount.type === 'amount' || discount.type === 'fixed'
                          ? 'تومان'
                          : ''}
                    </small>
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white fw-light small">شروع:</span>
                  <span className="fw-bold dir-rtl small text-white">
                    {formatDate(discount.startDate)}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-white fw-light small">پایان:</span>
                  <span className="fw-bold dir-rtl small text-white">
                    {formatDate(discount.endDate)}
                  </span>
                </div>
              </div>

              <div className="text-center position-relative z-index-2">
                <small className="text-white opacity-50">پیش‌نمایش کارت تخفیف</small>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Form (Read Only) --- */}
        <div className="col-lg-8 order-lg-first">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            {/* باکس وضعیت و کد تخفیف */}
            <div className="row g-4 mb-4">
              {/* وضعیت (Single Box) */}
              <div className="col-md-6 d-flex flex-column justify-content-end">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label text-secondary fw-bold small ms-1 mb-0">
                    وضعیت فعلی
                  </label>
                </div>
                <div
                  className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-3 border ${statusInfo.containerClass} bg-light`}
                >
                  <span className="text-muted small">{statusInfo.desc}</span>
                  <span
                    className={`badge rounded-pill px-3 py-2 ${statusInfo.badgeClass} d-flex align-items-center gap-2`}
                  >
                    <StatusIcon size={14} />
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* فیلد کد تخفیف */}
              <div className="col-md-6">
                <label className="form-label text-secondary fw-bold small ms-1">کد تخفیف</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Hash size={18} />
                  </span>
                  <div className="form-control custom-input fw-bold bg-light text-dark d-flex align-items-center justify-content-between border-start-0">
                    <span className="dir-ltr text-truncate">{displayCode}</span>
                    <button
                      className="btn btn-sm btn-link text-muted p-0"
                      onClick={() => handleCopy(displayCode)}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* عنوان و مقادیر */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label text-secondary fw-bold small ms-1">عنوان تخفیف</label>
                <div className="form-control custom-input fw-bold bg-light text-dark d-flex align-items-center">
                  {discount.title}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary fw-bold small ms-1">مقدار و نوع</label>
                <div className="d-flex gap-2">
                  <div className="form-control custom-input fw-bold bg-light text-dark d-flex align-items-center flex-grow-1 justify-content-center fs-5">
                    {Number(discount.amount).toLocaleString()}
                  </div>
                  <div
                    className="d-flex bg-light rounded-3 p-1 border border-light"
                    style={{ height: '48px', minWidth: '120px' }}
                  >
                    <div
                      className={`w-100 d-flex align-items-center justify-content-center  rounded-2 ${discount.type === 'percentage' ? 'bg-secondary text-white' : 'text-muted'}`}
                    >
                      % درصد
                    </div>
                    <div
                      className={`w-100 d-flex align-items-center justify-content-center  rounded-2 ${discount.type === 'fixed' || discount.type === 'amount' ? 'bg-secondary text-white' : 'text-muted'}`}
                    >
                      $ مبلغ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* تاریخ‌ها */}
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <label className="form-label text-secondary fw-bold small ms-1">تاریخ شروع</label>
                <div className="custom-input-group bg-light d-flex align-items-center rounded-3 px-3">
                  <CalendarIcon size={18} className="text-muted ms-2" />
                  <span className="fw-bold text-dark py-2">{formatDate(discount.startDate)}</span>
                </div>
              </div>

              <div className="col-md-6">
                <label
                  className={`form-label fw-bold small ms-1 ${statusInfo.isLocked && statusInfo.lockLabel === 'منقضی شده' ? 'text-danger' : 'text-secondary'}`}
                >
                  تاریخ پایان
                </label>
                <div
                  className={`custom-input-group bg-light d-flex align-items-center rounded-3 px-3 ${statusInfo.isLocked && statusInfo.lockLabel === 'منقضی شده' ? 'border border-danger' : ''}`}
                >
                  <CalendarIcon size={18} className="text-muted ms-2" />
                  <span className="fw-bold text-dark py-2">{formatDate(discount.endDate)}</span>
                </div>
              </div>
            </div>

            <hr className="my-5 border-light" />

            {/* --- Plan Section --- */}
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-info bg-opacity-10 text-info rounded-3">
                    <Layers size={22} />
                  </div>
                  <h5 className="fw-bold text-dark mb-0">محدودیت اشتراک</h5>
                </div>
                <div className="form-check form-switch d-flex align-items-center gap-2 dir-rtl opacity-75">
                  <label className="form-check-label text-muted small">اشتراک خاص</label>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!discount.plan}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="p-4 rounded-4 bg-light border border-light">
                {discount.plan ? (
                  <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border border-info-subtle">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                        <Layers size={24} />
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{discount.plan.name}</h6>
                        <small className="text-muted">شناسه: {discount.plan._id}</small>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/plans/edit/${discount.plan?._id}`)}
                      className="btn btn-outline-info btn-sm rounded-pill d-flex align-items-center gap-1"
                    >
                      <span>مشاهده پلن</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-muted py-2">
                    <small>این کد تخفیف برای تمام پلن‌ها فعال است.</small>
                  </div>
                )}
              </div>
            </div>

            {/* --- User Section --- */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                    <Users size={22} />
                  </div>
                  <h5 className="fw-bold text-dark mb-0">کاربران هدف</h5>
                </div>
                <div className="form-check form-switch d-flex align-items-center gap-2 dir-rtl opacity-75">
                  <label className="form-check-label text-muted small">کاربران خاص</label>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!(discount.users && discount.users.length > 0)}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="p-4 rounded-4 bg-light border border-light">
                {discount.users && discount.users.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {discount.users.map((user, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center justify-content-between bg-white border px-3 py-2 rounded-3 shadow-sm hover-bg-light transition-all"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2">
                            <Users size={16} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark small">
                              {user.username || 'کاربر'}
                            </div>
                            <div className="text-muted extra-small dir-ltr">{user._id}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/users/details/${user._id}`)}
                          className="btn btn-link text-primary p-0 d-flex align-items-center gap-1 text-decoration-none"
                        >
                          <small className="fw-bold">مشاهده پروفایل</small>
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-2">
                    <small>این کد تخفیف برای تمام کاربران فعال است.</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-input, .custom-input-group {
            height: 48px;
            border: 1px solid #e2e8f0;
        }
        .extra-small { font-size: 0.75rem; }

        .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .bg-circle-1 {
            position: absolute; width: 250px; height: 250px;
            background: rgba(255,255,255,0.05);
            border-radius: 50%; top: -80px; left: -80px;
        }
        .bg-circle-2 {
            position: absolute; width: 180px; height: 180px;
            background: rgba(255,255,255,0.03);
            border-radius: 50%; bottom: -40px; right: -40px;
        }
        .backdrop-blur { backdrop-filter: blur(8px); }
        .hover-scale:hover { transform: scale(1.02); }
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        
        .transition-all { transition: all 0.3s ease; }
        .z-index-2 { z-index: 2; }
        .z-index-3 { z-index: 3; }

        /* --- استایل‌های جدید برای حالت قفل --- */
        .blur-mode {
            filter: blur(8px) grayscale(70%);
            opacity: 0.5;
            pointer-events: none;
            transition: all 0.5s ease;
        }
        .lock-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DiscountDetails;
