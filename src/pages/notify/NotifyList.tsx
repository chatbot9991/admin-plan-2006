// src/pages/notify/NotifyList.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { Bell, Eye, Users, RefreshCw } from 'lucide-react';

// ایمپورت کامپوننت صفحه‌بندی
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---

// تعریف اینترفیس کاربر (چون در جیسون جدید کاربران آبجکت هستند نه رشته)
interface User {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
}

interface Notify {
  _id: string;
  title: string;
  body: string;
  data: string;
  users: User[]; // تغییر به آرایه‌ای از آبجکت‌ها
  createdAt: string;
  updatedAt: string;
  version: number;
}

// تغییر ساختار ریسپانس مطابق با جیسون جدید
interface ApiResponse {
  result: {
    data: Notify[];
    total: { count: number }[];
  }[];
}

const NotifyList: React.FC = () => {
  // --- States ---
  const [notifies, setNotifies] = useState<Notify[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // ثابت pageSize (می‌توانید در State هم نگه دارید)

  // --- Helpers ---
  const formatDate = (isoString: string) => {
    if (!isoString) return { date: '-', time: '-' };
    try {
      const date = new Date(isoString);
      return {
        date: date.toLocaleDateString('fa-IR'),
        time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

  // --- API Call ---
  const fetchNotifies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      const response = await api.get<ApiResponse>('/notify/list', { params });

      // لاجیک جدید استخراج داده‌ها
      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];

        setNotifies(resultData.data || []);
        // استخراج تعداد کل از داخل آرایه total
        setTotalItems(resultData.total?.[0]?.count || 0);
      } else {
        setNotifies([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching notifies:', error);
      toast.error('خطا در دریافت لیست اعلانات');
      setNotifies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1600px' }}>
      {/* --- Header Section --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        {/* Title (Right Side) */}
        <div>
          <h2 className="fw-bolder text-dark mb-1">مدیریت اعلانات</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
            مشاهده و پیگیری تمام اعلان‌های ارسال شده سیستم
          </p>
        </div>

        {/* Actions (Left Side) */}
        <div className="d-flex align-items-center gap-3">
          {/* دکمه ایجاد اعلان جدید */}
          <Link to="/notifications/create" className="btn-shine-effect">
            <span className="mx-2 fs-5">+</span> ایجاد اعلان جدید
          </Link>

          {/* دکمه رفرش دایره‌ای */}
          <button
            onClick={fetchNotifies}
            className="btn btn-refresh shadow-sm"
            title="بروزرسانی لیست"
          >
            <RefreshCw size={20} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="card border-0 shadow-none bg-transparent">
        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0">
            <thead>
              <tr>
                <th className="text-secondary small fw-bold text-center" style={{ width: '60px' }}>
                  #
                </th>
                <th className="text-secondary small fw-bold text-start" style={{ width: '20%' }}>
                  عنوان اعلان
                </th>
                <th className="text-secondary small fw-bold text-start" style={{ width: '30%' }}>
                  متن پیام
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '15%' }}>
                  گیرندگان
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '15%' }}>
                  تاریخ ارسال
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '10%' }}>
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : notifies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="opacity-50 mb-3">
                      <Bell size={40} className="text-secondary" />
                    </div>
                    <h6 className="text-muted fw-bold">هیچ اعلانی یافت نشد!</h6>
                  </td>
                </tr>
              ) : (
                notifies.map((notify, index) => {
                  const { date, time } = formatDate(notify.createdAt);

                  return (
                    <tr
                      key={notify._id}
                      className="bg-white rounded-3 shadow-sm my-2 border-bottom-0"
                    >
                      {/* Index */}
                      <td className="text-center text-muted fw-bold">
                        {(currentPage - 1) * pageSize + (index + 1)}
                      </td>

                      {/* Title */}
                      <td className="text-start">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="fw-bold text-dark text-truncate"
                            style={{ maxWidth: '200px' }}
                            title={notify.title}
                          >
                            {notify.title}
                          </span>
                        </div>
                      </td>

                      {/* Body */}
                      <td className="text-start">
                        <span
                          className="text-muted small text-truncate d-inline-block"
                          style={{ maxWidth: '300px' }}
                          title={notify.body}
                        >
                          {notify.body}
                        </span>
                      </td>

                      {/* Users Count */}
                      <td className="text-center">
                        {notify.users && notify.users.length > 0 ? (
                          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal">
                            <Users size={14} className="me-1 text-primary" />
                            {notify.users.length} کاربر
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border-0 px-3 py-2 rounded-pill fw-normal">
                            عمومی
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                          <span className="fw-bold text-dark fs-6 dir-ltr">{date}</span>
                          <span className="text-muted extra-small">{time}</span>
                        </div>
                      </td>

                      {/* Actions (Eye Icon) */}
                      <td className="text-center">
                        <Link
                          to={`/notifications/details/${notify._id}`}
                          className="btn-action-view d-inline-flex align-items-center justify-content-center"
                          title="مشاهده جزئیات"
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="py-3">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            showInfo={true}
          />
        </div>
      </div>

      {/* --- Styles --- */}
      <style>{`
        /* Utils */
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .dir-ltr { direction: ltr; }
        .extra-small { font-size: 0.75rem; }

        /* --- دکمه ایجاد --- */
        .btn-shine-effect {
            background: linear-gradient(45deg, #099773, #20c997);
            color: white;
            padding: 10px 25px;
            border-radius: 12px;
            border: none;
            box-shadow: 0 4px 15px rgba(32, 201, 151, 0.4);
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            font-weight: 600;
        }
        .btn-shine-effect:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(32, 201, 151, 0.6);
            color: white;
        }

        /* Refresh Button (Circular) */
        .btn-refresh {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background-color: #fff;
            border: 1px solid #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #495057;
            transition: all 0.2s;
        }
        .btn-refresh:hover {
            background-color: #f8f9fa;
            color: #212529;
            transform: rotate(15deg);
            border-color: #dee2e6;
        }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Table Styles (Clean & Spaced) */
        .custom-table {
            border-collapse: separate;
            border-spacing: 0 10px;
        }
        .custom-table thead th {
            border: none;
            background: transparent;
            padding-bottom: 10px;
            font-weight: 600;
            color: #8898aa;
        }
        .custom-table tbody tr {
            transition: transform 0.2s;
            background-color: #fff;
        }
        .custom-table tbody tr td {
            border: none;
            padding: 16px 12px;
            vertical-align: middle;
        }
        .custom-table tbody tr td:first-child {
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
        }
        .custom-table tbody tr td:last-child {
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
        }
        .custom-table tbody tr:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.05) !important;
        }

        /* Action View Button */
        .btn-action-view {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background-color: #e0f2fe;
            color: #0ea5e9;
            border: none;
            transition: all 0.2s;
        }
        .btn-action-view:hover {
            background-color: #bae6fd;
            color: #0284c7;
        }

        /* Badges */
        .bg-success-subtle { background-color: #dcfce7 !important; color: #166534 !important; }
      `}</style>
    </div>
  );
};

export default NotifyList;
