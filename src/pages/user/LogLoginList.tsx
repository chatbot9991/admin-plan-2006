// src/pages/logs/LogLoginList.tsx

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Search,
  Monitor,
  Globe,
} from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';

import { api } from '../../services/api'; // فرض بر این است که سرویس api در این مسیر است
import Filter from '../../components/common/Filter';
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---

interface LogLogin {
  _id: string;
  fingerPrint: string;
  deviceInfo: string;
  userId: string;
  ipAddress: string;
  versionLimit: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface ApiResponse {
  result: {
    data: LogLogin[];
    total: { count: number }[];
  }[];
}

const LogLoginList: React.FC = () => {
  const [logs, setLogs] = useState<LogLogin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // استیت‌های موقت (برای ورودی‌های کاربر قبل از اعمال)
  const [tempUserId, setTempUserId] = useState('');
  const [tempIp, setTempIp] = useState('');
  const [tempDateRange, setTempDateRange] = useState<DateObject[]>([]);

  // استیت‌های نهایی (که به API ارسال می‌شوند)
  const [appliedFilters, setAppliedFilters] = useState({
    userId: '',
    ipAddress: '',
    dateRange: [] as DateObject[],
  });

  const [showFilters, setShowFilters] = useState(true);

  // فرمت‌دهی تاریخ برای نمایش در جدول
  const formatDate = (isoString: string) => {
    if (!isoString) return { date: '-', time: '-' };
    try {
      const date = new Date(isoString);
      return {
        date: date.toLocaleDateString('fa-IR'),
        time: date.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

  // تمیز کردن رشته Device Info برای نمایش بهتر
  const formatDeviceInfo = (info: string) => {
    if (!info) return '-';
    // اگر رشته خیلی طولانی یا نامرتب است، می‌توان آن را کوتاه کرد
    return info.replace(/undefined/g, 'Unknown').replace(/_/g, ' ');
  };

  // --- دریافت اطلاعات از API ---
  const fetchLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      // ساخت آبجکت where برای پارامتر filter
      const where: any = {};

      // 1. فیلتر User ID
      if (appliedFilters.userId) {
        where.userId = appliedFilters.userId;
      }

      // 2. فیلتر IP Address
      if (appliedFilters.ipAddress) {
        where.ipAddress = appliedFilters.ipAddress;
      }

      // 3. فیلتر تاریخ
      if (appliedFilters.dateRange.length > 0) {
        const fromDate = new DateObject(appliedFilters.dateRange[0]);
        fromDate.convert(gregorian, gregorian_en);
        fromDate.setHour(0).setMinute(0).setSecond(0).setMillisecond(0);

        const toDate = new DateObject(
          appliedFilters.dateRange[1] ? appliedFilters.dateRange[1] : appliedFilters.dateRange[0]
        );
        toDate.convert(gregorian, gregorian_en);
        toDate.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);

        where.date = { // یا date بسته به ساختار دقیق بکند، طبق خروجی createdAt فیلد تاریخ است
          from: fromDate.toDate().toISOString(),
          to: toDate.toDate().toISOString(),
        };
      }

      if (Object.keys(where).length > 0) {
        const filterJson = JSON.stringify({ where });
        params.append('filter', filterJson);
      }

      // مسیر API طبق درخواست کاربر
      const response = await api.get<ApiResponse>(`/user/list/log/login?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const aggResult = response.data.result[0];
        setLogs(aggResult.data || []);

        if (aggResult.total && aggResult.total.length > 0) {
          setTotal(aggResult.total[0].count);
        } else {
          setTotal(0);
        }
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching login logs:', error);
      toast.error('خطا در دریافت لیست لاگ‌ها');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // اعمال فیلترها
  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({
      userId: tempUserId,
      ipAddress: tempIp,
      dateRange: tempDateRange,
    });
  };

  // حذف فیلترها
  const handleResetFilters = () => {
    setTempUserId('');
    setTempIp('');
    setTempDateRange([]);
    setCurrentPage(1);
    setAppliedFilters({ userId: '', ipAddress: '', dateRange: [] });
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">لاگ‌های ورود کاربران</h3>
          <p className="text-muted small mb-0">مشاهده تاریخچه ورود کاربران به سامانه</p>
        </div>
        <button
          onClick={fetchLogs}
          className="btn btn-light rounded-pill p-2 shadow-sm border"
          title="بروزرسانی لیست"
        >
          <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ overflow: 'visible', zIndex: 10 }}>
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
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="شناسه کاربر (User ID)"
                  placeholder="جستجو کاربر..."
                  value={tempUserId}
                  onChange={setTempUserId}
                />
              </div>
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="آدرس IP"
                  placeholder="جستجو IP..."
                  value={tempIp}
                  onChange={setTempIp}
                />
              </div>
              <div className="col-12 col-md-3">
                <Filter
                  type="date-range"
                  label="بازه زمانی"
                  placeholder="انتخاب تاریخ"
                  value={tempDateRange}
                  onChange={setTempDateRange}
                />
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleApplyFilters}
                  style={{ height: '48px', borderRadius: '12px' }}
                >
                  <Search size={18} />
                  <span>اعمال فیلتر</span>
                </button>
                {(tempUserId || tempIp || tempDateRange.length > 0) && (
                  <button
                    className="btn btn-danger-soft w-75 px-3"
                    onClick={handleResetFilters}
                    title="حذف فیلترها"
                    style={{ height: '48px', borderRadius: '12px' }}
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: 'visible' }}>
        <table className="table modern-table">
          <thead>
            <tr>
              <th style={{ width: '5%', borderRadius: '0 15px 15px 0' }}>#</th>
              <th style={{ width: '25%' }}>کاربر (شناسه)</th>
              <th className="text-center" style={{ width: '15%' }}>
                آدرس IP
              </th>
              <th className="text-center" style={{ width: '30%' }}>
                اطلاعات دستگاه (Device Info)
              </th>
              <th className="text-center" style={{ width: '15%' }}>
                تاریخ ورود
              </th>
              {/* <th className="text-center" style={{ width: '10%', borderRadius: '15px 0 0 15px' }}>
                اثر انگشت
              </th> */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted fw-bold">
                  هیچ لاگی با این مشخصات یافت نشد!
                </td>
              </tr>
            ) : (
              logs.map((log, index) => {
                const { date, time } = formatDate(log.createdAt);

                return (
                  <tr key={log._id || index} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-1" title={log.userId}>
                        <code className="text-primary bg-primary-subtle px-2 py-1 rounded small">
                          {log.userId}
                        </code>
                      </div>
                    </td>

                    <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                             <Globe size={16} className="text-muted" />
                             <span className="fw-medium text-dark dir-ltr">{log.ipAddress || 'نامشخص'}</span>
                        </div>
                    </td>

                    <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <Monitor size={16} className="text-muted" />
                            <span 
                                className="text-muted small text-truncate d-inline-block" 
                                style={{ maxWidth: '250px' }} 
                                title={log.deviceInfo}
                            >
                                {formatDeviceInfo(log.deviceInfo)}
                            </span>
                        </div>
                    </td>

                    <td className="text-center">
                      <div className="d-flex flex-column align-items-center">
                        <div className="d-flex align-items-center gap-1 text-dark fw-bold">
                            <span>{date}</span>
                        </div>
                        <span className="text-muted small">{time}</span>
                      </div>
                    </td>

                    {/* <td className="text-center">
                        <div className="d-flex justify-content-center text-muted" title={log.fingerPrint}>
                            <Fingerprint size={20} />
                        </div>
                    </td> */}
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

      {/* Styles - Exactly matched with TransactionList.tsx */}
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .cursor-pointer { cursor: pointer; }
        .dir-ltr { direction: ltr; }

        .btn-danger-soft {
            background-color: #fff5f5; color: #ef4444; border: 1px solid #fee2e2;
            transition: all 0.2s;
        }
        .btn-danger-soft:hover { background-color: #fee2e2; color: #b91c1c; }

        .modern-table { border-collapse: separate; border-spacing: 0 15px; }
        .modern-table thead th { border: none; background: transparent; color: #8898aa; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding-bottom: 10px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border-radius: 16px; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-5px) scale(1.005); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); z-index: 2; position: relative; }
        .modern-table td { border: none; padding: 20px 15px; }

        .btn-action { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-primary { background-color: #e7f5ff; color: #4dabf7; }
        .btn-soft-primary:hover { background-color: #4dabf7; color: white; }
        .btn-icon:hover { background-color: #e2e8f0; }
      `}</style>
    </div>
  );
};

export default LogLoginList;
