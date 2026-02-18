// src/pages/transaction/TransactionDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  User,
  Smartphone,
  Mail,
  CreditCard,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hash,
  ArrowRight,
  Clock,
  Database,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';

// --- Interfaces ---

interface UserData {
  _id: string;
  email: string;
  mobile: string;
  username: string;
  name: string;
  family: string;
  status: string;
}

interface PlanData {
  _id: string;
  price: string;
  name: string;
  limitOfRequest: number;
  limitUploadFiles: number;
  typePay: string;
  type: string;
}

interface TransactionData {
  ref_id: string;
}

interface Transaction {
  _id: string;
  description: string;
  userId: UserData;
  planId: PlanData;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  updatedAt: string;
  version: number;
  transaction_data: TransactionData;
}

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Helpers ---
  const formatNumber = (num: number | string) => {
    return Number(num).toLocaleString('fa-IR');
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return { date: '-', time: '-' };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('fa-IR'),
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('شناسه کپی شد', { position: 'bottom-center', autoClose: 2000 });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'success':
        return { color: 'success', text: 'موفق', icon: <CheckCircle size={18} /> };
      case 'failed':
        return { color: 'danger', text: 'ناموفق', icon: <XCircle size={18} /> };
      default:
        return { color: 'warning', text: 'در انتظار', icon: <AlertCircle size={18} /> };
    }
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/transaction/details?_id=${id}`);
        if (response.data && response.data.transaction) {
          setTransaction(response.data.transaction);
        } else {
          toast.error('اطلاعات تراکنش یافت نشد.');
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        toast.error('خطا در دریافت جزئیات تراکنش.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-navy" role="status"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center mt-5">
        <h3>تراکنش یافت نشد!</h3>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          بازگشت
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(transaction.status);
  const { date: createdDate, time: createdTime } = formatDate(transaction.createdAt);
  const { date: updatedDate, time: updatedTime } = formatDate(transaction.updatedAt);

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      {/* --- Header --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">جزئیات تراکنش</h3>
          <p className="text-muted small">
            شناسه:{' '}
            <span className="dir-ltr d-inline-block text-navy fw-bold">{transaction._id}</span>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light border shadow-sm rounded-pill px-4 d-flex align-items-center gap-2 hover-up"
        >
          <ArrowRight size={18} />
          <span>بازگشت</span>
        </button>
      </div>

      <div className="row g-4">
        {/* --- Main Column --- */}
        <div className="col-lg-8">
          {/* 1. Status & Amount Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div
              className={`card-header border-0 py-3 d-flex justify-content-between align-items-center bg-${statusInfo.color}-subtle`}
            >
              <div className="d-flex align-items-center gap-2">
                <span className={`text-${statusInfo.color}`}>{statusInfo.icon}</span>
                <span className={`fw-bold text-${statusInfo.color} fs-5`}>
                  وضعیت: {statusInfo.text}
                </span>
              </div>
              <div className="text-muted small">{transaction.description}</div>
            </div>
            <div className="card-body p-4 text-center">
              <h6 className="text-muted text-uppercase fw-bold mb-2">مبلغ تراکنش</h6>
              <h1 className="fw-bolder text-dark mb-0 display-5">
                {formatNumber(transaction.amount)}{' '}
                <span className="fs-5 text-secondary fw-normal">تومان</span>
              </h1>
              {transaction.transaction_data?.ref_id &&
                transaction.transaction_data.ref_id !== '_' && (
                  <div className="mt-3 bg-light d-inline-block px-3 py-2 rounded-3 border">
                    <span className="text-muted me-2 small">شماره پیگیری (Ref ID):</span>
                    <span className="fw-bold dir-ltr font-monospace text-dark">
                      {transaction.transaction_data.ref_id}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* 2. User Info Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <User size={20} className="text-navy" />
                مشخصات پرداخت‌کننده
              </h5>
              {transaction.userId && (
                <Link
                  to={`/users/details/${transaction.userId._id}`}
                  className="btn btn-sm btn-outline-navy rounded-pill d-flex align-items-center gap-1"
                >
                  <span>مشاهده کاربر</span>
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-navy">
                      <User size={20} />
                    </div>
                    <div>
                      <small className="text-muted d-block">نام و نام خانوادگی</small>
                      <span className="fw-bold text-dark">
                        {transaction.userId?.name} {transaction.userId?.family}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-success">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <small className="text-muted d-block">شماره موبایل</small>
                      <span className="fw-bold text-dark dir-ltr">
                        {transaction.userId?.mobile}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-info">
                      <Mail size={20} />
                    </div>
                    <div>
                      <small className="text-muted d-block">ایمیل</small>
                      <span className="fw-bold text-dark dir-ltr">{transaction.userId?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-warning">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <small className="text-muted d-block">وضعیت کاربر</small>
                      <span className="fw-bold text-dark">
                        {transaction.userId?.status === 'active' ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Plan Info Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <CreditCard size={20} className="text-navy" />
                جزئیات سرویس خریداری شده
              </h5>
              {transaction.planId && (
                <Link
                  to={`/plans/details/${transaction.planId._id}`}
                  className="btn btn-sm btn-outline-navy rounded-pill d-flex align-items-center gap-1"
                >
                  <span>مشاهده پلن</span>
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
            <div className="card-body p-4">
              {transaction.planId ? (
                <div className="row g-4">
                  <div className="col-md-12">
                    <div className="bg-navy-subtle p-4 rounded-3 d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="fw-bold text-navy mb-1">{transaction.planId.name}</h5>
                        <span className="badge bg-navy rounded-pill">
                          پرداخت:{' '}
                          {transaction.planId.typePay === 'Year'
                            ? 'سالانه'
                            : transaction.planId.typePay}
                        </span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block mb-1">قیمت پایه</small>
                        <h4 className="fw-bold m-0 text-dark">
                          {formatNumber(transaction.planId.price)}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 text-center">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <Database className="text-secondary mb-2" size={24} />
                      <div className="text-muted small mb-1">تعداد درخواست</div>
                      <div className="fw-bold fs-5">
                        {formatNumber(transaction.planId.limitOfRequest)}
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 text-center">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <FileText className="text-secondary mb-2" size={24} />
                      <div className="text-muted small mb-1">آپلود فایل</div>
                      <div className="fw-bold fs-5">{transaction.planId.limitUploadFiles}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 text-center">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <Hash className="text-secondary mb-2" size={24} />
                      <div className="text-muted small mb-1">نوع پلن</div>
                      <div className="fw-bold fs-5">{transaction.planId.type}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-center m-0">اطلاعات پلن در دسترس نیست.</p>
              )}
            </div>
          </div>
        </div>

        {/* --- Sidebar Column --- */}
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 p-4 sticky-top bg-white"
            style={{ top: '20px' }}
          >
            <h5 className="fw-bold mb-4 border-bottom pb-3">اطلاعات زمانی & سیستم</h5>

            {/* Created At */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 text-muted mb-1">
                <Calendar size={16} />
                <small>تاریخ ایجاد:</small>
              </div>
              <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded-3">
                <span className="fw-bold text-dark">{createdDate}</span>
                <span className="text-muted small">{createdTime}</span>
              </div>
            </div>

            {/* Updated At */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 text-muted mb-1">
                <Clock size={16} />
                <small>آخرین بروزرسانی:</small>
              </div>
              <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded-3">
                <span className="fw-bold text-dark">{updatedDate}</span>
                <span className="text-muted small">{updatedTime}</span>
              </div>
            </div>

            {/* Version */}
            <div className="mb-4">
              <div className="d-flex align-items-between justify-content-between">
                <span className="text-muted small">نسخه رکورد:</span>
                <span className="badge bg-secondary rounded-pill px-3">{transaction.version}</span>
              </div>
            </div>

            {/* Technical IDs (With Copy Buttons) */}
            <div className="mt-4 pt-3 border-top">
              <small className="text-muted d-block mb-1">User ID:</small>
              <div className="d-flex align-items-center gap-2 bg-light p-2 rounded mb-3">
                <code className="text-muted small text-break dir-ltr flex-grow-1">
                  {transaction.userId?._id}
                </code>
                <button
                  onClick={() => handleCopy(transaction.userId?._id)}
                  className="btn btn-sm btn-link p-0 text-secondary hover-navy"
                  title="کپی شناسه کاربر"
                >
                  <Copy size={16} />
                </button>
              </div>

              <small className="text-muted d-block mb-1">Plan ID:</small>
              <div className="d-flex align-items-center gap-2 bg-light p-2 rounded">
                <code className="text-muted small text-break dir-ltr flex-grow-1">
                  {transaction.planId?._id}
                </code>
                <button
                  onClick={() => handleCopy(transaction.planId?._id)}
                  className="btn btn-sm btn-link p-0 text-secondary hover-navy"
                  title="کپی شناسه پلن"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* رنگ اختصاصی آبی سرمه‌ای (تیره‌تر و شکیل‌تر) */
        :root {
            --navy-primary: #0e3f7e; 
            --navy-hover: #0a2e5c;
            --navy-subtle: #ebf3ff;
        }

        .text-navy { color: var(--navy-primary) !important; }
        .bg-navy { background-color: var(--navy-primary) !important; color: white; }
        .bg-navy-subtle { background-color: var(--navy-subtle) !important; }
        
        .hover-navy:hover { color: var(--navy-primary) !important; }

        .btn-outline-navy {
            color: var(--navy-primary);
            border-color: var(--navy-primary);
        }
        .btn-outline-navy:hover {
            background-color: var(--navy-primary);
            color: #fff;
            border-color: var(--navy-primary);
        }

        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .hover-up { transition: transform 0.2s; }
        .hover-up:hover { transform: translateY(-2px); }
        
        .dir-ltr { direction: ltr; }
        .bg-success-subtle { background-color: #d1e7dd !important; }
        .text-success { color: #198754 !important; }
        .bg-danger-subtle { background-color: #f8d7da !important; }
        .text-danger { color: #dc3545 !important; }
        .bg-warning-subtle { background-color: #fff3cd !important; }
      `}</style>
    </div>
  );
};

export default TransactionDetails;
