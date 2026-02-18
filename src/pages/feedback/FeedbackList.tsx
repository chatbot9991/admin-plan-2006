// src/pages/feedback/FeedbackList.tsx

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  MessageSquare,
  User,
  Cpu,
  Star,
  Calendar,
  RefreshCcw,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

import { api } from '../../services/api';
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---
// توجه: اینترفیس را بر اساس ستون‌های تصویر تنظیم کردم.
// اگر بک‌ند آبجکت User را populate می‌کند، ساختار زیر درست است.
// اگر فقط userId می‌فرستد، در بخش رندر باید هندل شود.
interface FeedbackUser {
  _id: string;
  name?: string;
  username?: string;
  mobile?: string;
}

interface Feedback {
  _id: string;
  user?: FeedbackUser | string; // نام کاربر
  aiName?: string;              // نام هوش مصنوعی
  score?: number;               // امتیاز
  type?: string;                // نوع
  message?: string;             // متن بازخورد (اختیاری)
  createdAt: string;            // تاریخ ثبت
}

interface ApiResponse {
  result: {
    data: Feedback[];
    total: { count: number }[];
  }[];
}

const FeedbackList: React.FC = () => {
  // --- States ---
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- Helpers ---
  const formatDate = (isoString: string) => {
    if (!isoString) return { date: '-', time: '-' };
    try {
      const dateObj = new Date(isoString);
      return {
        date: dateObj.toLocaleDateString('fa-IR'),
        time: dateObj.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

  // تابع کمکی برای نمایش کاربر
  const getUserName = (user: FeedbackUser | string | undefined) => {
    if (!user) return 'ناشناس';
    if (typeof user === 'string') return user.substring(0, 8) + '...'; // اگر فقط ID بود
    return user.name || user.username || user.mobile || 'کاربر بدون نام';
  };

  // رندر ستاره برای امتیاز
  const renderStars = (score: number = 0) => {
    return (
      <div className="d-flex align-items-center justify-content-center gap-1 text-warning">
        <span className="text-dark fw-bold ms-1" style={{ fontSize: '0.9rem' }}>{score}</span>
        <Star size={16} fill={score > 0 ? "currentColor" : "none"} />
      </div>
    );
  };

  // --- API Fetch ---
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      // فراخوانی API طبق درخواست: feedback/list
      const response = await api.get<ApiResponse>(`/feedback/list?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setFeedbacks(resultData.data || []);
        
        const totalCount = resultData.total && resultData.total.length > 0 ? resultData.total[0].count : 0;
        setTotal(totalCount);
      } else {
        setFeedbacks([]);
        setTotal(0);
      }

    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('خطا در دریافت لیست بازخوردها');
    } finally {
      setLoading(false);
    }
  };

  // هندلر حذف (فقط نمایشی - در صورت نیاز API را وصل کنید)
  const handleDelete = (id: string) => {
    toast.info('این قابلیت هنوز متصل نشده است');
    // api.delete(`/feedback/${id}`)...
  };

  // --- Effects ---
  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h3 className="fw-bolder text-dark mb-1 d-flex align-items-center gap-2">
            <MessageSquare className="text-primary" size={28} />
            لیست بازخوردها
          </h3>
          <p className="text-muted small mb-0 ms-1">نظرات و امتیازات ثبت شده توسط کاربران</p>
        </div>
        
        <button
          onClick={fetchFeedbacks}
          className="btn btn-light rounded-pill p-2 shadow-sm border"
          title="بروزرسانی لیست"
        >
          <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
        </button>
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive" style={{ overflowX: 'visible' }}>
          <table className="table modern-table mb-0">
            <thead className="bg-light">
              <tr>
                <th style={{ width: '5%', borderRadius: '0 15px 15px 0' }}>ردیف</th>
                <th style={{ width: '20%' }}>نام کاربر</th>
                <th className="text-center" style={{ width: '20%' }}>نام هوش مصنوعی</th>
                <th className="text-center" style={{ width: '10%' }}>امتیاز</th>
                <th className="text-center" style={{ width: '15%' }}>نوع</th>
                <th className="text-center" style={{ width: '20%' }}>تاریخ ثبت</th>
                <th className="text-center" style={{ width: '10%', borderRadius: '15px 0 0 15px' }}>عملیات ها</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center opacity-50">
                        <MessageSquare size={48} className="mb-2" />
                        <span className="fw-bold">موردی برای نمایش وجود ندارد!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                feedbacks.map((item, index) => {
                  const { date, time } = formatDate(item.createdAt);
                  
                  return (
                    <tr key={item._id || index} className="align-middle">
                      {/* ردیف */}
                      <td className="fw-bold text-secondary ps-4">
                        {(currentPage - 1) * limit + index + 1}
                      </td>

                      {/* نام کاربر */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-light rounded-circle p-2 d-flex justify-content-center align-items-center" style={{width: '35px', height: '35px'}}>
                                <User size={16} className="text-muted"/>
                            </div>
                            <span className="fw-bold text-dark fs-6">{getUserName(item.user)}</span>
                        </div>
                      </td>

                      {/* نام هوش مصنوعی */}
                      <td className="text-center">
                          <div className="d-inline-flex align-items-center gap-2 bg-primary-subtle text-primary px-3 py-1 rounded-pill fw-medium">
                              <Cpu size={14} />
                              {item.aiName || '---'}
                          </div>
                      </td>

                      {/* امتیاز */}
                      <td className="text-center">
                        {renderStars(item.score)}
                      </td>

                      {/* نوع */}
                      <td className="text-center">
                        <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-3 py-2 fw-normal">
                            {item.type || 'عمومی'}
                        </span>
                      </td>

                      {/* تاریخ ثبت */}
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                          <Calendar size={14} />
                          <span className="fw-medium">{date}</span>
                          <span className="small opacity-75">({time})</span>
                        </div>
                      </td>

                      {/* عملیات ها */}
                      <td className="text-center">
                        <button 
                            className="btn btn-sm btn-icon text-danger bg-danger-subtle rounded-circle p-2 transition-all"
                            onClick={() => handleDelete(item._id)}
                            title="حذف"
                        >
                            <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-4 d-flex justify-content-center">
          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Styles */}
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .modern-table { border-collapse: separate; border-spacing: 0 10px; }
        .modern-table thead th { 
            border: none; 
            color: #64748b; 
            font-weight: 600; 
            font-size: 0.85rem; 
            padding: 15px 10px;
            background-color: #f8fafc;
            text-transform: uppercase;
        }
        .modern-table tbody tr { 
            transition: all 0.2s ease; 
            background-color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            border-radius: 12px;
        }
        .modern-table tbody tr:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 5px 15px rgba(0,0,0,0.05); 
            z-index: 1;
        }
        .modern-table td { 
            border: none; 
            padding: 15px 10px; 
            vertical-align: middle;
        }
        .modern-table tbody tr td:first-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }

        .btn-icon:hover { transform: scale(1.1); }
        .bg-danger-subtle { background-color: #fef2f2; }
        .bg-primary-subtle { background-color: #e0f2fe; }
        .bg-secondary-subtle { background-color: #f1f5f9; }
      `}</style>
    </div>
  );
};

export default FeedbackList;
