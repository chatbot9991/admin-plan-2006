// src/pages/transaction/TransactionList.tsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Copy,
  Check,
  Eye,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Search,
} from "lucide-react";
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

import { api } from "../../services/api";
import Filter from "../../components/common/Filter";
import Pagination from "../../components/common/Pagination";

// --- Interfaces ---

interface TransactionData {
  ref_id?: string;
  track_id?: number | string;
  card_no?: string;
  hashed_card_no?: string;
}

interface Transaction {
  _id: string;
  amount: number;
  status: "success" | "pending" | "failed" | "expired" | "unknown";
  authority?: string;
  description?: string;
  createdAt: string;
  userId: string;
  planId?: string;
  transaction_data?: TransactionData; // اضافه شده برای دسترسی به جزئیات تراکنش
}

interface ApiResponse {
  result: {
    data: Transaction[];
    total: { count: number }[];
  }[];
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // استیت‌های موقت (برای ورودی‌های کاربر قبل از اعمال)
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("");
  const [tempDateRange, setTempDateRange] = useState<DateObject[]>([]);

  // استیت‌های نهایی (که به API ارسال می‌شوند)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "",
    dateRange: [] as DateObject[],
  });

  const [showFilters, setShowFilters] = useState(true);
  const [copiedAuth, setCopiedAuth] = useState<string | null>(null);

  // فرمت‌دهی پول
  const formatPrice = (price: number) => {
    if (isNaN(price) || price === null || price === undefined) return "0";
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  // فرمت‌دهی تاریخ برای نمایش در جدول
  const formatDate = (isoString: string) => {
    if (!isoString) return { date: "-", time: "-" };
    try {
      const date = new Date(isoString);
      return {
        date: date.toLocaleDateString("fa-IR"),
        time: date.toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (e) {
      return { date: "-", time: "-" };
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAuth(text);
    toast.success("کپی شد");
    setTimeout(() => setCopiedAuth(null), 2000);
  };

  // --- دریافت اطلاعات از API ---
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      // فقط page و limit خارج از filter ارسال می‌شوند
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());

      // ساخت آبجکت where برای پارامتر filter
      const where: any = {};

      // 1. فیلتر وضعیت (Status)
      if (appliedFilters.status) {
        where.status = appliedFilters.status;
      }

      // 2. فیلتر جستجو (Search)
      if (appliedFilters.search) {
        where.authority = appliedFilters.search;
      }

      // 3. فیلتر تاریخ (Date with Time)
      if (appliedFilters.dateRange.length > 0) {
        const fromDate = new DateObject(appliedFilters.dateRange[0]);
        fromDate.convert(gregorian, gregorian_en);
        fromDate.setHour(0).setMinute(0).setSecond(0).setMillisecond(0);

        const toDate = new DateObject(
          appliedFilters.dateRange[1]
            ? appliedFilters.dateRange[1]
            : appliedFilters.dateRange[0],
        );
        toDate.convert(gregorian, gregorian_en);
        toDate.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);

        where.date = {
          from: fromDate.toDate().toISOString(),
          to: toDate.toDate().toISOString(),
        };
      }

      if (Object.keys(where).length > 0) {
        const filterJson = JSON.stringify({ where });
        params.append("filter", filterJson);
      }

      const response = await api.get<ApiResponse>(
        `/transaction/list?${params.toString()}`,
      );

      // --- تغییر اصلی اینجاست: خواندن از result[0] ---
      if (response.data && response.data.result && response.data.result.length > 0) {
        const aggResult = response.data.result[0];
        
        setTransactions(aggResult.data || []);
        
        if (aggResult.total && aggResult.total.length > 0) {
           setTotal(aggResult.total[0].count);
        } else {
           setTotal(0);
        }
      } else {
        setTransactions([]);
        setTotal(0);
      }

    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("خطا در دریافت لیست تراکنش‌ها");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // اعمال فیلترها با کلیک روی دکمه
  const handleApplyFilters = () => {
    setCurrentPage(1); // بازگشت به صفحه اول هنگام جستجوی جدید
    setAppliedFilters({
      search: tempSearch,
      status: tempStatus,
      dateRange: tempDateRange,
    });
  };

  // حذف فیلترها
  const handleResetFilters = () => {
    setTempSearch("");
    setTempStatus("");
    setTempDateRange([]);
    setCurrentPage(1);
    setAppliedFilters({ search: "", status: "", dateRange: [] });
  };

  // با تغییر صفحه یا تغییر فیلترهای نهایی، درخواست ارسال می‌شود
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  return (
    <div
      className="container-fluid p-4 fade-in position-relative"
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت تراکنش‌ها</h3>
          <p className="text-muted small mb-0">
            مشاهده و پیگیری تمام تراکنش‌های انجام شده
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="btn btn-light rounded-pill p-2 shadow-sm border"
          title="بروزرسانی لیست"
        >
          <RefreshCcw size={20} className={loading ? "spin-anim" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
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

        <div className={`collapse ${showFilters ? "show" : ""}`}>
          <div className="card-body bg-light border-top p-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="جستجو (کد رهگیری)"
                  placeholder="Authority..."
                  value={tempSearch}
                  onChange={setTempSearch}
                />
              </div>
              <div className="col-12 col-md-2">
                <Filter
                  type="dropdown"
                  label="وضعیت"
                  placeholder="همه"
                  options={[
                    { id: "success", name: "موفق" },
                    { id: "pending", name: "در انتظار" },
                    { id: "failed", name: "ناموفق" },
                    { id: "expired", name: "منقضی شده" },
                    { id: "unknown", name: "نامشخص" },
                  ]}
                  value={tempStatus}
                  onChange={setTempStatus}
                />
              </div>
              <div className="col-12 col-md-4">
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
                  style={{ height: "48px", borderRadius: "12px" }}
                >
                  <Search size={18} />
                  <span>اعمال فیلتر</span>
                </button>
                {(tempSearch || tempStatus || tempDateRange.length > 0) && (
                  <button
                    className="btn btn-danger-soft w-75 px-3"
                    onClick={handleResetFilters}
                    title="حذف فیلترها"
                    style={{ height: "48px", borderRadius: "12px" }}
                  >
                    حذف فیلتر
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: "visible" }}>
        <table className="table modern-table">
          <thead>
            <tr>
              <th style={{ width: "5%", borderRadius: "0 15px 15px 0" }}>#</th>
              <th style={{ width: "20%" }}>کاربر (شناسه)</th>
              <th className="text-center" style={{ width: "15%" }}>
                مبلغ (تومان)
              </th>
              <th className="text-center" style={{ width: "15%" }}>
                تاریخ
              </th>
              <th className="text-center" style={{ width: "15%" }}>
                وضعیت
              </th>
              <th className="text-center" style={{ width: "20%" }}>
                کد رهگیری / Authority
              </th>
              <th
                className="text-center"
                style={{ width: "10%", borderRadius: "15px 0 0 15px" }}
              >
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                  <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted fw-bold">
                  هیچ تراکنشی با این مشخصات یافت نشد!
                </td>
              </tr>
            ) : (
              transactions.map((trx, index) => {
                const { date, time } = formatDate(trx.createdAt);

                let statusBadgeClass = "bg-secondary-subtle text-secondary";
                let statusText = "نامشخص";

                switch (trx.status) {
                  case "success":
                    statusBadgeClass = "bg-success-subtle text-success";
                    statusText = "موفق";
                    break;
                  case "failed":
                    statusBadgeClass = "bg-danger-subtle text-danger";
                    statusText = "ناموفق";
                    break;
                  case "pending":
                    statusBadgeClass = "bg-warning-subtle text-warning";
                    statusText = "در انتظار";
                    break;
                  case "expired":
                    statusBadgeClass = "bg-dark-subtle text-dark";
                    statusText = "منقضی شده";
                    break;
                  case "unknown":
                    statusBadgeClass = "bg-light text-muted border";
                    statusText = "نامعلوم";
                    break;
                }

                // نمایش یوزر آیدی به صورت خلاصه
                const displayUser = trx.userId ? (
                  <div
                    className="d-flex align-items-center gap-1"
                    title={trx.userId}
                  >
                    <code className="text-primary bg-primary-subtle px-2 py-1 rounded small">
                      {trx.userId.substring(0, 6)}...
                      {trx.userId.substring(trx.userId.length - 4)}
                    </code>
                    <span
                      className="text-muted small ms-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      (ID)
                    </span>
                  </div>
                ) : (
                  <span className="text-muted small">-</span>
                );

                // تعیین اینکه چه چیزی به عنوان کد رهگیری نمایش داده شود
                // اولویت: authority > transaction_data.ref_id > transaction_data.track_id
                const displayAuth =
                  trx.authority || 
                  trx.transaction_data?.ref_id || 
                  trx.transaction_data?.track_id || 
                  "-";

                return (
                  <tr key={trx._id || index} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>{displayUser}</td>

                    <td className="text-center">
                      <span className="fw-bold fs-6 text-dark">
                        {formatPrice(trx.amount)}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{date}</span>
                        <span className="text-muted small">{time}</span>
                      </div>
                    </td>

                    <td className="text-center">
                      <span
                        className={`badge rounded-pill px-3 py-2 border ${statusBadgeClass}`}
                      >
                        {statusText}
                      </span>
                    </td>

                    <td>
                      <div
                        className="d-flex align-items-center justify-content-center gap-2 bg-light rounded-pill px-2 py-1 border mx-auto"
                        style={{ maxWidth: "220px" }}
                      >
                        <span
                          className="text-muted small text-truncate dir-ltr"
                          style={{ maxWidth: "140px" }}
                          title={String(displayAuth)}
                        >
                          {displayAuth}
                        </span>
                        {displayAuth !== "-" && (
                          <button
                            className="btn btn-sm btn-icon rounded-circle"
                            onClick={() => handleCopy(String(displayAuth))}
                          >
                            {copiedAuth === String(displayAuth) ? (
                              <Check size={14} className="text-success" />
                            ) : (
                              <Copy size={14} className="text-secondary" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex justify-content-center">
                        <Link
                          to={`/transactions/details/${trx._id}`}
                          className="btn-action btn-soft-primary"
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

export default TransactionList;
