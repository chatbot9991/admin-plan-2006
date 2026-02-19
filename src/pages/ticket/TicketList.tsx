// src/pages/ticket/TicketList.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Eye,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Search,
  Copy,
  User,
} from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';

import { api } from '../../services/api';
import Filter from '../../components/common/Filter'; // استفاده از همان کامپوننت فیلتر بلاگ
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---

interface TicketMessage {
  _id: string;
  message: string;
  typeMessage: 'user' | 'admin' | 'system';
  createdAt: string;
}

interface Ticket {
  _id: string;
  userId: string;
  title: string;
  type: string; // "Technical", "Financial", etc.
  messages: TicketMessage[];
  status: string; // "done", "waiting-response", "pending", "open"
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  result: {
    data: Ticket[];
    total: { count: number }[];
  }[];
}

const TicketList: React.FC = () => {
  // --- States for Data ---
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- UI States (Filters) ---
  const [showFilters, setShowFilters] = useState(true);

  // استیت‌های موقت (ورودی کاربر - دقیقاً مثل بلاگ)
  const [tempSearch, setTempSearch] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [tempType, setTempType] = useState(''); // اضافه شده برای دپارتمان
  const [tempDateRange, setTempDateRange] = useState<DateObject[]>([]);

  // استیت‌های نهایی (ارسال به API)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateRange: [] as DateObject[],
  });

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

  const handleCopyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    toast.success('آیدی کاربر کپی شد', {
      position: 'bottom-center',
      theme: 'colored',
      autoClose: 1500,
      hideProgressBar: true,
      style: { fontSize: '13px' },
    });
  };

  // --- Core API Fetch Function ---
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const where: any = {};

      // 1. فیلتر وضعیت
      if (appliedFilters.status) {
        where.status = appliedFilters.status;
      }

      // 2. فیلتر نوع (دپارتمان)
      if (appliedFilters.type) {
        where.type = appliedFilters.type;
      }

      // 3. فیلتر جستجو (عنوان)
      if (appliedFilters.search) {
        where.title = appliedFilters.search;
      }

      // 4. فیلتر تاریخ
      if (appliedFilters.dateRange.length > 0) {
        const fromDate = new DateObject(appliedFilters.dateRange[0]);
        fromDate.convert(gregorian, gregorian_en);
        fromDate.setHour(0).setMinute(0).setSecond(0).setMillisecond(0);

        const toDate = new DateObject(
          appliedFilters.dateRange[1] ? appliedFilters.dateRange[1] : appliedFilters.dateRange[0]
        );
        toDate.convert(gregorian, gregorian_en);
        toDate.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);

        where.createdAt = {
          from: fromDate.toDate().toISOString(),
          to: toDate.toDate().toISOString(),
        };
      }

      if (Object.keys(where).length > 0) {
        const filterJson = JSON.stringify({ where });
        params.append('filter', filterJson);
      }

      const response = await api.get<ApiResponse>(`/ticket/list?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setTickets(resultData.data || []);
        const totalCount =
          resultData.total && resultData.total.length > 0 ? resultData.total[0].count : 0;
        setTotal(totalCount);
      } else {
        setTickets([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('خطا در دریافت لیست تیکت‌ها');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({
      search: tempSearch,
      status: tempStatus,
      type: tempType,
      dateRange: tempDateRange,
    });
  };

  const handleResetFilters = () => {
    setTempSearch('');
    setTempStatus('');
    setTempType('');
    setTempDateRange([]);
    setCurrentPage(1);
    setAppliedFilters({ search: '', status: '', type: '', dateRange: [] });
  };

  // --- Translate Helpers ---
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'بسته شده';
      case 'waiting-response':
        return 'منتظر پاسخ';
      case 'pending':
        return 'در حال بررسی';
      case 'responsedByAdmin':
        return 'ادمین پاسخ داده';
      case 'open':
        return 'باز';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'technical':
        return 'فنی';
      case 'financial':
        return 'مالی';
      case 'general':
        return 'عمومی';
      case 'ai':
        return 'هوش مصنوعی';
      default:
        return type;
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت تیکت‌ها</h3>
          <p className="text-muted small mb-0">لیست درخواست‌های پشتیبانی کاربران</p>
        </div>
        <div className="d-flex gap-2">
          {/* در تیکت معمولا دکمه ایجاد توسط ادمین کمتر استفاده می‌شود، اما اگر نیاز بود می‌توان اضافه کرد */}
          <button
            onClick={fetchTickets}
            className="btn btn-light rounded-pill p-2 shadow-sm border"
            title="بروزرسانی لیست"
          >
            <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* Filters - EXACTLY like BlogList */}
      <div className="card border-0 shadow-sm rounded-4 mb-4"  style={{ overflow: 'visible', zIndex: 10 }}>
        <div
          className="card-header bg-white border-0 p-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="d-flex align-items-center gap-2 text-primary fw-bold">
            <FilterIcon size={20} />
            <span>فیلترهای پیشرفته</span>
          </div>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        <div className={`collapse ${showFilters ? 'show' : ''}`}>
          <div className="card-body bg-light border-top p-4">
            <div className="row g-3 align-items-end">
              {/* Search */}
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="جستجو (عنوان)"
                  placeholder="عنوان تیکت..."
                  value={tempSearch}
                  onChange={setTempSearch}
                />
              </div>

              {/* Department (New for Ticket) */}
              <div className="col-12 col-md-2">
                <Filter
                  type="dropdown"
                  label="دپارتمان"
                  placeholder="همه"
                  options={[
                    { id: 'Technical', name: 'فنی' },
                    { id: 'Financial', name: 'مالی' },
                    { id: 'General', name: 'عمومی' },
                    { id: 'ai', name: 'هوش مصنوعی' },
                  ]}
                  value={tempType}
                  onChange={setTempType}
                />
              </div>

              {/* Status */}
              <div className="col-12 col-md-2">
                <Filter
                  type="dropdown"
                  label="وضعیت"
                  placeholder="همه"
                  options={[
                    { id: 'waiting-response', name: 'منتظر پاسخ' },
                    { id: 'pending', name: 'در حال بررسی' },
                    { id: 'done', name: 'بسته شده' },
                    { id: 'open', name: 'باز' },
                  ]}
                  value={tempStatus}
                  onChange={setTempStatus}
                />
              </div>

              {/* Date */}
              <div className="col-12 col-md-3">
                <Filter
                  type="date-range"
                  label="بازه زمانی (تاریخ ایجاد)"
                  placeholder="انتخاب تاریخ"
                  value={tempDateRange}
                  onChange={setTempDateRange}
                />
              </div>

              {/* Buttons */}
              <div className="col-12 col-md-2 d-flex gap-2">
                <button
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleApplyFilters}
                  style={{ height: '48px', borderRadius: '12px' }}
                >
                  <Search size={18} />
                  <span>اعمال</span>
                </button>
                {(tempSearch || tempStatus || tempType || tempDateRange.length > 0) && (
                  <button
                    className="btn btn-danger-soft px-3"
                    onClick={handleResetFilters}
                    title="حذف فیلترها"
                    style={{ height: '48px', borderRadius: '12px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table - Modern Style */}
      <div className="table-responsive" style={{ overflowX: 'visible' }}>
        <table className="table modern-table">
          <thead>
            <tr>
              <th style={{ width: '5%', borderRadius: '0 15px 15px 0' }}>#</th>
              <th style={{ width: '30%' }}>عنوان و توضیحات</th>
              <th className="text-center" style={{ width: '15%' }}>
                دپارتمان
              </th>
              <th className="text-center" style={{ width: '20%' }}>
                کاربر
              </th>
              <th className="text-center" style={{ width: '15%' }}>
                تاریخ ایجاد
              </th>
              <th className="text-center" style={{ width: '10%' }}>
                وضعیت
              </th>
              <th className="text-center" style={{ width: '5%', borderRadius: '15px 0 0 15px' }}>
                عملیات
              </th>
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
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted fw-bold">
                  هیچ تیکتی یافت نشد!
                </td>
              </tr>
            ) : (
              tickets.map((ticket, index) => {
                const { date, time } = formatDate(ticket.createdAt);
                const lastMessage = ticket.messages?.[ticket.messages.length - 1]?.message || '';

                return (
                  <tr key={ticket._id} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex flex-column">
                        <span
                          className="fw-bold text-dark mb-1 text-truncate"
                          style={{ maxWidth: '250px' }}
                          title={ticket.title}
                        >
                          {ticket.title}
                        </span>
                        <p
                          className="text-muted small mb-0 description-truncate"
                          style={{ maxWidth: '300px' }}
                        >
                          {lastMessage || 'بدون پیام'}
                        </p>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="text-center">
                      <span className="badge bg-light text-secondary border rounded-pill fw-normal">
                        {getTypeLabel(ticket.type)}
                      </span>
                    </td>

                    {/* User */}
                    <td className="text-center">
                      <div
                        className="d-inline-flex align-items-center gap-2 px-2 py-1 rounded bg-light border cursor-pointer"
                        onClick={() => handleCopyUserId(ticket.userId)}
                        title="کپی شناسه"
                      >
                        <User size={14} className="text-muted" />
                        <span className="small text-muted font-monospace">
                          {ticket.userId.substring(0, 6)}...
                        </span>
                        <Copy size={12} className="text-muted opacity-50" />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="text-center">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{date}</span>
                        <span className="text-muted small">{time}</span>
                      </div>
                    </td>

                    {/* Status Pill (Customized for tickets) */}
                    <td className="text-center">
                      <div className={`status-pill ${ticket.status}`}>
                        <span className="dot"></span>
                        {getStatusLabel(ticket.status)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link
                          to={`/ticket/details/${ticket._id}`}
                          className="btn-action btn-soft-info"
                          title="مشاهده"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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

      {/* CSS Styles - Exactly from BlogList + Extra Ticket Status Colors */}
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .btn-shine-effect { background: linear-gradient(45deg, #099773, #20c997); color: white; padding: 8px 20px; border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(32, 201, 151, 0.4); transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; font-weight: 600; }
        .btn-shine-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(32, 201, 151, 0.6); color: white; }

        .btn-danger-soft { background-color: #fff5f5; color: #ef4444; border: 1px solid #fee2e2; transition: all 0.2s; }
        .btn-danger-soft:hover { background-color: #fee2e2; color: #b91c1c; }

        .modern-table { border-collapse: separate; border-spacing: 0 15px; }
        .modern-table thead th { border: none; background: transparent; color: #8898aa; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding-bottom: 10px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border-radius: 16px; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-5px) scale(1.005); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); z-index: 2; position: relative; }
        .modern-table td { border: none; padding: 20px 15px; }

        .description-truncate { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* Status Pills - Adapted for Tickets */
        .status-pill { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background-color: currentColor; margin-left: 6px; }
        
        /* Status Colors */
        .status-pill.done { background-color: #e6fffa; color: #20c997; } /* Green */
        .status-pill.waiting-response { background-color: #fff9db; color: #fcc419; } /* Yellow */
        .status-pill.pending { background-color: #e7f5ff; color: #339af0; } /* Blue */
        .status-pill.open { background-color: #fff5f5; color: #ff6b6b; } /* Red */
        .status-pill.default { background-color: #f1f3f5; color: #868e96; }

        .btn-action { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-info { background-color: #e3f2fd; color: #0dcaf0; }
        .btn-soft-info:hover { background-color: #0dcaf0; color: white; }
      `}</style>
    </div>
  );
};

export default TicketList;
