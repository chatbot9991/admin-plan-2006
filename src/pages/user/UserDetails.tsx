// src/pages/user/UserDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  User,
  Smartphone,
  Mail,
  Calendar,
  AlertCircle,
  ArrowRight,
  Clock,
  Copy,
  Wallet,
  ShieldAlert,
  Package,
  Activity,
  UserCheck,
  UserX,
  Database,
  UploadCloud,
  MessageSquare,
  CalendarDays
} from 'lucide-react';
import { api } from '../../services/api';

// --- Interfaces ---

interface WalletBalance {
  $numberDecimal: string;
}

interface PlanIdInfo {
  _id: string;
  name: string;
  status: string;
}

interface UserDetailData {
  _id: string;
  email?: string;
  mobile?: string;
  username?: string;
  name?: string;
  family?: string;
  status?: string;
  walletBalance?: WalletBalance;
  limit?: boolean;
  versionLimit?: number;
  versionPlanMessage?: number;
  limitNumberOfUsers?: number;
  amountUploadExistPlan?: number;
  amountApiExistPlan?: number;
  apiUsed?: string | number;
  exTimePlan?: string;
  startTimePlan?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  planName?: string;
  planId?: PlanIdInfo;
  fcmToken?: string;
}

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Helpers ---
  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '۰';
    return Number(num).toLocaleString('fa-IR');
  };

  const getWalletAmount = (wallet?: WalletBalance) => {
    if (!wallet || !wallet.$numberDecimal) return 0;
    return Number(wallet.$numberDecimal);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return { date: '-', time: '-' };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('fa-IR'),
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('با موفقیت کپی شد', { position: 'bottom-center', autoClose: 2000 });
  };

  const getStatusInfo = (status?: string | boolean) => {
    const isActive = status === 'active' || status === true;
    if (isActive) {
      return { color: 'success', text: 'فعال', icon: <UserCheck size={18} /> };
    }
    return { color: 'danger', text: 'غیرفعال', icon: <UserX size={18} /> };
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/user/details?_id=${id}`);
        
        // استخراج داده بر اساس فرمت جدید: response.data.user
        const userData = response.data?.user || response.data?.result || response.data?.data;
        
        if (userData && userData._id) {
          setUser(userData);
        } else {
          toast.error('اطلاعات کاربر یافت نشد.');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('خطا در دریافت جزئیات کاربر.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 fade-in">
        <AlertCircle size={64} className="text-muted mb-3" />
        <h3 className="text-dark fw-bold">کاربر یافت نشد!</h3>
        <p className="text-muted">ممکن است شناسه اشتباه باشد یا کاربر حذف شده باشد.</p>
        <button className="custom-btn custom-btn-primary mt-3 px-4 py-2 rounded-pill" onClick={() => navigate(-1)}>
          بازگشت به لیست
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(user.status);
  const { date: createdDate, time: createdTime } = formatDate(user.createdAt);
  const { date: updatedDate, time: updatedTime } = formatDate(user.updatedAt);
  const { date: startPlanDate } = formatDate(user.startTimePlan);
  const { date: exPlanDate } = formatDate(user.exTimePlan);
  
  const displayName = user.name || user.family 
    ? `${user.name || ''} ${user.family || ''}`.trim() 
    : user.username || 'نامشخص';

  const planStatusInfo = getStatusInfo(user.planId?.status);

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      {/* --- Header --- */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bolder text-dark mb-1 d-flex align-items-center gap-2">
            <User className="text-primary" size={28} />
            جزئیات حساب کاربری
          </h3>
          <p className="text-muted small mb-0 mt-1 d-flex align-items-center gap-2">
            شناسه سیستم: 
            <span className="dir-ltr d-inline-block text-primary fw-bold bg-primary-subtle px-2 py-1 rounded" style={{ fontSize: '13px' }}>
              {user._id}
            </span>
            <button onClick={() => handleCopy(user._id)} className="btn btn-sm btn-link p-0 text-secondary hover-primary">
              <Copy size={14} />
            </button>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-white border shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 hover-up transition-all"
        >
          <ArrowRight size={18} />
          <span className="fw-medium">بازگشت</span>
        </button>
      </div>

      <div className="row g-4">
        {/* --- Main Column --- */}
        <div className="col-lg-8">
          
          {/* 1. Main Profile Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className={`card-header border-0 py-3 d-flex justify-content-between align-items-center bg-${statusInfo.color}-subtle`}>
              <div className="d-flex align-items-center gap-2">
                <span className={`text-${statusInfo.color}`}>{statusInfo.icon}</span>
                <span className={`fw-bold text-${statusInfo.color} fs-6`}>وضعیت اکانت: {statusInfo.text}</span>
              </div>
              {user.version !== undefined && (
                <span className="badge bg-white text-dark border shadow-sm">
                  نسخه: {user.version}
                </span>
              )}
            </div>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8 d-flex align-items-center gap-4 mb-4 mb-md-0">
                  <div className="bg-light rounded-circle d-flex justify-content-center align-items-center border border-2 border-white shadow-sm" style={{ width: '90px', height: '90px' }}>
                    <User size={40} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="fw-bolder text-dark mb-1">{displayName}</h4>
                    <p className="text-muted mb-2">نام کاربری: <span className="text-dark fw-medium dir-ltr">{user.username || '-'}</span></p>
                    <span className={`badge bg-${statusInfo.color}-subtle text-${statusInfo.color} px-3 py-2 rounded-pill border border-${statusInfo.color}-subtle`}>
                      کاربر {statusInfo.text} سیستم
                    </span>
                  </div>
                </div>
                
                <div className="col-md-4 border-end-md ps-md-4 text-md-start text-center">
                  <div className="bg-success-subtle p-3 rounded-4 border border-success-subtle">
                    <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
                      <Wallet size={20} className="text-success" />
                      <span className="text-success fw-bold">موجودی کیف پول</span>
                    </div>
                    <h3 className="fw-bolder text-dark m-0 d-flex align-items-center justify-content-center justify-content-md-start gap-1">
                      {formatNumber(getWalletAmount(user.walletBalance))} <span className="fs-6 text-muted fw-normal">تومان</span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Contact & Personal Info */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <Activity size={20} className="text-primary" />
                اطلاعات تماس و ارتباطی
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-info">
                      <Mail size={22} />
                    </div>
                    <div className="overflow-hidden">
                      <small className="text-muted d-block mb-1">پست الکترونیک (ایمیل)</small>
                      <span className="fw-bold text-dark dir-ltr d-block text-truncate" title={user.email || 'ثبت نشده'}>
                        {user.email || 'ثبت نشده'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-success">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <small className="text-muted d-block mb-1">شماره موبایل</small>
                      <span className="fw-bold text-dark dir-ltr d-block text-start">
                        {user.mobile || 'ثبت نشده'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Subscription & Limits Info */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <Package size={20} className="text-primary" />
                وضعیت اشتراک، مصرف و دسترسی‌ها
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                
                {/* Plan Info */}
                <div className="col-md-12">
                  <div className="p-4 border rounded-4 position-relative overflow-hidden bg-light">
         
                    
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                         <h6 className="fw-bold text-muted mb-2 d-flex align-items-center gap-2">
                          <Package size={18} /> پلن فعال کاربر
                        </h6>
                        <h4 className="fw-bolder text-primary m-0">
                          {user.planName || user.planId?.name || 'بدون پلن'}
                        </h4>
                      </div>
                      {user.planId && (
                        <span className={`badge bg-${planStatusInfo.color}-subtle text-${planStatusInfo.color} border border-${planStatusInfo.color}-subtle px-3 py-2 rounded-pill`}>
                          پلن {planStatusInfo.text}
                        </span>
                      )}
                    </div>

                    <div className="row g-3">
                      {/* API Usage */}
                      <div className="col-md-3 col-6">
                        <div className="bg-white p-3 rounded-3 border text-center h-100 shadow-sm">
                          <Database size={24} className="text-primary mb-2 mx-auto" />
                          <small className="text-muted d-block mb-1">کل API مجاز</small>
                          <span className="fw-bold fs-5">{formatNumber(user.amountApiExistPlan)}</span>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="bg-white p-3 rounded-3 border text-center h-100 shadow-sm">
                          <Activity size={24} className="text-warning mb-2 mx-auto" />
                          <small className="text-muted d-block mb-1">API مصرف شده</small>
                          <span className="fw-bold fs-5">{formatNumber(user.apiUsed)}</span>
                        </div>
                      </div>
                      {/* Uploads */}
                      <div className="col-md-3 col-6">
                        <div className="bg-white p-3 rounded-3 border text-center h-100 shadow-sm">
                          <UploadCloud size={24} className="text-info mb-2 mx-auto" />
                          <small className="text-muted d-block mb-1">مجوز آپلود</small>
                          <span className="fw-bold fs-5">{formatNumber(user.amountUploadExistPlan)}</span>
                        </div>
                      </div>
                      {/* Messages */}
                      <div className="col-md-3 col-6">
                        <div className="bg-white p-3 rounded-3 border text-center h-100 shadow-sm">
                          <MessageSquare size={24} className="text-success mb-2 mx-auto" />
                          <small className="text-muted d-block mb-1">پیام‌های پلن</small>
                          <span className="fw-bold fs-5">{formatNumber(user.versionPlanMessage)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Plan Dates */}
                    {user.startTimePlan && (
                      <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top">
                        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded border">
                          <CalendarDays size={18} className="text-muted" />
                          <span className="text-muted small">شروع پلن:</span>
                          <span className="fw-bold">{startPlanDate}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded border">
                          <CalendarDays size={18} className="text-danger" />
                          <span className="text-muted small">انقضای پلن:</span>
                          <span className="fw-bold text-danger">{exPlanDate}</span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Limit Info */}
                <div className="col-md-12">
                  <div className={`p-4 border rounded-4 ${user.limit ? 'border-warning bg-warning-subtle' : 'bg-white'} transition-all`}>
                    <h6 className="fw-bold text-muted mb-3 d-flex align-items-center gap-2">
                      <ShieldAlert size={18} className={user.limit ? 'text-warning' : ''} /> تنظیمات و محدودیت‌های سیستم
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded border h-100">
                          <span className="text-muted small">وضعیت لیمیت:</span>
                          {user.limit ? (
                            <span className="badge bg-warning text-dark px-2 py-1">محدود شده</span>
                          ) : (
                            <span className="badge bg-success text-white px-2 py-1">آزاد</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded border h-100">
                          <span className="text-muted small">سقف تعداد کاربران:</span>
                          <span className="fw-bolder text-dark px-2 bg-white border rounded">
                            {user.limitNumberOfUsers !== undefined ? formatNumber(user.limitNumberOfUsers) : 'نامحدود'}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded border h-100">
                          <span className="text-muted small">ورژن محدودیت:</span>
                          <span className="fw-bolder text-dark px-2 bg-white border rounded">
                            {user.versionLimit !== undefined ? user.versionLimit : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* --- Sidebar Column --- */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top bg-white" style={{ top: '20px' }}>
            <h5 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <Clock size={20} className="text-secondary" />
              اطلاعات زمانی سیستم
            </h5>

            {/* Created At */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 text-muted mb-2">
                <Calendar size={16} />
                <span className="fw-medium small">تاریخ ثبت نام در سیستم:</span>
              </div>
              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border border-light">
                <span className="fw-bold text-dark">{createdDate}</span>
                <span className="badge bg-white text-muted border">{createdTime}</span>
              </div>
            </div>

            {/* Updated At */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 text-muted mb-2">
                <Activity size={16} />
                <span className="fw-medium small">آخرین بروزرسانی اطلاعات:</span>
              </div>
              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 border border-light">
                <span className="fw-bold text-dark">{updatedDate}</span>
                <span className="badge bg-white text-muted border">{updatedTime}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Global Styles for this page */}
      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hover-up { transition: all 0.3s ease; }
        .hover-up:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; }
        
        .hover-bg-white:hover { background-color: #ffffff !important; }
        .hover-shadow:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
        .transition-all { transition: all 0.3s ease; }
        
        .btn-white { background-color: #fff; color: #475569; }
        .btn-white:hover { background-color: #f8fafc; color: #0f172a; }
        
        .text-light-gray { color: #cbd5e1; }
        .dir-ltr { direction: ltr; display: inline-block; }
        .hover-primary:hover { color: #3b82f6 !important; }
        
        .bg-warning-subtle { background-color: #fef3c7 !important; }
        .border-warning { border-color: #fbbf24 !important; }

        /* Custom Button Override - استایل یکپارچه دکمه ها */
        .custom-btn {
          display: inline-block;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
          vertical-align: middle;
          user-select: none;
          border: 1px solid transparent;
          padding: 0.5rem 1.25rem;
          font-size: 1rem;
          line-height: 1.5;
          border-radius: 0.5rem;
          transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          cursor: pointer;
        }
        
        .custom-btn-primary {
          color: #fff;
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .custom-btn-primary:hover {
          background-color: #2563eb;
          border-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default UserDetails;
