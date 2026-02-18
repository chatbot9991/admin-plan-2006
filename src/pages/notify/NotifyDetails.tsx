// src/pages/notify/NotifyDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Bell,
  Calendar,
  Clock,
  ArrowRight,
  Database,
  Users,
  Copy,
  AlignLeft,
  User,
  CreditCard,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { api } from '../../services/api';

// --- Interfaces ---

interface UserObj {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  mobile?: string;
  email?: string;
  planName?: string;
  status?: string;
  avatar?: string;
}

interface NotifyData {
  _id: string;
  title: string;
  body: string;
  data: string;
  users: (string | UserObj)[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

const NotifyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [notify, setNotify] = useState<NotifyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Helpers ---
  const formatDate = (isoString: string) => {
    if (!isoString) return { date: '-', time: '-' };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('fa-IR'),
      time: date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const handleCopy = (text: string, label: string = 'متن') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} کپی شد`, {
      position: 'bottom-center',
      autoClose: 2000,
    });
  };

  const extractUserInfo = (userItem: string | UserObj) => {
    if (typeof userItem === 'string') {
      return {
        id: userItem,
        displayName: 'کاربر (بدون جزئیات)',
        detailsAvailable: false,
        mobile: '-',
        email: '-',
        plan: '-',
        isActive: null,
      };
    }

    const fullName = [userItem.firstName, userItem.lastName].filter(Boolean).join(' ');
    return {
      id: userItem._id,
      displayName: fullName || userItem.username || 'کاربر بی نام',
      detailsAvailable: true,
      mobile: userItem.mobile || '-',
      email: userItem.email || '-',
      plan: userItem.planName || 'پایه (Free)',
      isActive: userItem.status === 'active' ? true : false,
    };
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/notify/get?id=${id}`);
        const data = response.data.notify || response.data;

        if (data) {
          setNotify(data);
        } else {
          toast.error('اطلاعات اعلان یافت نشد.');
        }
      } catch (error) {
        console.error('Error fetching notify:', error);
        toast.error('خطا در دریافت جزئیات اعلان.');
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

  if (!notify) {
    return (
      <div className="text-center mt-5">
        <h3>اعلان یافت نشد!</h3>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          بازگشت
        </button>
      </div>
    );
  }

  const { date: createdDate, time: createdTime } = formatDate(notify.createdAt);
  const { date: updatedDate, time: updatedTime } = formatDate(notify.updatedAt);

  const usersList = notify.users || [];
  const isPublic = usersList.length === 0;

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      {/* --- Header --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">جزئیات اعلان</h3>
          <p className="text-muted small">
            شناسه: <span className="dir-ltr d-inline-block text-navy fw-bold">{notify._id}</span>
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
        {/* --- Main Column (Left) --- */}
        <div className="col-lg-8">
          {/* 1. Main Info Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
              <Bell size={20} className="text-navy" />
              <h5 className="mb-0 fw-bold text-dark">محتوای پیام</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label className="text-muted small fw-bold mb-1 d-block">عنوان اعلان</label>
                <h4 className="fw-bold text-dark">{notify.title}</h4>
              </div>

              <div className="bg-light p-3 rounded-3 border-start border-4 border-navy">
                <label className="text-muted small fw-bold mb-2 d-flex align-items-center gap-1">
                  <AlignLeft size={16} /> متن پیام:
                </label>
                <p className="mb-0 text-dark" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {notify.body}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Additional Data Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <Database size={20} className="text-navy" />
                دیتای ضمیمه (Payload)
              </h5>
              <button
                onClick={() => handleCopy(notify.data, 'دیتا')}
                className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1"
              >
                <Copy size={14} /> کپی
              </button>
            </div>
            <div className="card-body p-4">
              {notify.data ? (
                <div
                  className="bg-dark text-light p-3 rounded-3  font-monospace position-relative"
                  style={{ minHeight: '60px', wordBreak: 'break-all' }}
                >
                  {notify.data}
                </div>
              ) : (
                <p className="text-muted text-center m-0">دیتایی وجود ندارد.</p>
              )}
            </div>
          </div>

          {/* 3. Recipients (Users) Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Users size={20} className="text-navy" />
                <h5 className="mb-0 fw-bold text-dark">گیرندگان</h5>
              </div>
              {!isPublic && (
                <span className="badge bg-navy rounded-pill px-3">{usersList.length} کاربر</span>
              )}
            </div>

            <div className="card-body p-4">
              {isPublic ? (
                <div className="alert alert-success d-flex align-items-center gap-3 border-0 shadow-sm mb-0">
                  <div className="bg-white p-2 rounded-circle text-success">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">اعلان عمومی</h6>
                    <p className="mb-0 small">این پیام برای تمام کاربران ارسال شده است.</p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    paddingRight: '5px',
                  }}
                >
                  <div className="d-flex flex-column gap-3">
                    {usersList.map((userItem, idx) => {
                      const info = extractUserInfo(userItem);

                      return (
                        <div
                          key={idx}
                          className="border rounded-3 p-3 bg-white shadow-sm hover-up position-relative"
                        >
                          {/* 
                            کانتینر اصلی فلکس:
                            از justify-content-between استفاده می‌کنیم تا بخش نام کاربر از بخش دکمه‌ها جدا شود.
                          */}
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            {/* --- Left Side (User Info) --- */}
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-light rounded-circle p-3 d-flex align-items-center justify-content-center text-navy">
                                <User size={24} />
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                  {info.displayName}

                                  {info.isActive !== null &&
                                    (info.isActive ? (
                                      <span
                                        title="فعال"
                                        className="d-flex align-items-center"
                                        style={{ cursor: 'help' }}
                                      >
                                        <CheckCircle size={14} className="text-success" />
                                      </span>
                                    ) : (
                                      <span
                                        title="غیرفعال"
                                        className="d-flex align-items-center"
                                        style={{ cursor: 'help' }}
                                      >
                                        <XCircle size={14} className="text-danger" />
                                      </span>
                                    ))}
                                </h6>
                                <div className="d-flex align-items-center gap-2">
                                  <code className="text-muted small dir-ltr bg-light px-2 rounded">
                                    {info.id}
                                  </code>
                                  <button
                                    className="btn btn-link p-0 text-muted"
                                    onClick={() => handleCopy(info.id, 'ID')}
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* --- Right Side (Details + Action Button) --- 
                                تغییر مهم: یک دایو Wrapper برای جزئیات و دکمه ایجاد کردیم.
                                این دایو با flex-grow-1 فضای خالی را پر می‌کند و محتوا را به سمت چپ (end) هل می‌دهد.
                            */}
                            <div className="d-flex flex-wrap align-items-center gap-3 justify-content-start flex-grow-1">
                              {/* User Details (Plan, Mobile, Email) */}
                              {info.detailsAvailable && (
                                <div className="d-flex flex-wrap gap-3 text-muted small align-items-center justify-content-end">
                                  <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">
                                    <CreditCard size={14} className="text-navy" />
                                    <span
                                      className="d-inline-block text-truncate "
                                      style={{ maxWidth: '150px' }}
                                    >
                                      پلن: <span className="fw-bold text-dark">{info.plan}</span>
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">
                                    <Phone size={14} className="text-navy" />
                                    <span className="dir-ltr">{info.mobile}</span>
                                  </div>
                                  {info.email && info.email !== '-' && (
                                    <div
                                      className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded d-none d-md-flex"
                                      title={info.email}
                                    >
                                      <Mail size={14} className="text-navy flex-shrink-0" />
                                      <span
                                        className="d-inline-block text-truncate dir-ltr"
                                        style={{ maxWidth: '150px' }}
                                      >
                                        {info.email}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Action Button */}
                              <div>
                                <button
                                  onClick={() => navigate(`/users/details/${info.id}`)}
                                  className="btn btn-outline-navy btn-sm rounded-pill d-flex align-items-center gap-2"
                                  title="مشاهده پروفایل کامل"
                                >
                                  <span>مشاهده کاربر</span>
                                  <ExternalLink size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Sidebar Column (Right) --- */}
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 p-4 sticky-top bg-white"
            style={{ top: '20px' }}
          >
            <h5 className="fw-bold mb-4 border-bottom pb-3">اطلاعات سیستمی</h5>

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
                <span className="badge bg-secondary rounded-pill px-3">{notify.version}</span>
              </div>
            </div>

            {/* Technical IDs */}
            <div className="mt-4 pt-3 border-top">
              <small className="text-muted d-block mb-1">Notify ID:</small>
              <div className="d-flex align-items-center gap-2 bg-light p-2 rounded mb-3">
                <code className="text-muted small text-break dir-ltr flex-grow-1">
                  {notify._id}
                </code>
                <button
                  onClick={() => handleCopy(notify._id, 'شناسه اعلان')}
                  className="btn btn-sm btn-link p-0 text-secondary hover-navy"
                  title="کپی شناسه"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        :root {
            --navy-primary: #0e3f7e;
            --navy-hover: #0a2e5c;
            --navy-subtle: #ebf3ff;
        }

        .text-navy { color: var(--navy-primary) !important; }
        .bg-navy { background-color: var(--navy-primary) !important; color: white; }
        .border-navy { border-color: var(--navy-primary) !important; }

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
      `}</style>
    </div>
  );
};

export default NotifyDetails;
