// src/pages/discount/DiscountList.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import {
  Tag,
  Users,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Percent,
  Eye,
  Edit,
  RotateCw,
} from 'lucide-react';

import Pagination from '../../components/common/Pagination';

// --- Interfaces ---

interface DiscountUser {
  _id: string;
  username?: string;
  name?: string;
  family?: string;
  mobile?: string;
  email?: string;
}

interface Discount {
  _id: string;
  title: string;
  type: 'percentage' | 'fixed' | 'amount'; // "amount" added based on JSON
  amount: string;
  code: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'deactive' | 'expired' | 'inactive'; // Added "deactive" based on API response
  users: DiscountUser[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

// آپدیت ساختار ریسپانس بر اساس تغییرات جدید API
interface ApiResponse {
  result: {
    data: Discount[];
    total: { count: number }[];
  }[];
}

const DiscountList: React.FC = () => {
  // --- States ---
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Pagination State (Limit = 50 as requested)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  // --- Status Modal State ---
  const [targetDiscount, setTargetDiscount] = useState<{
    id: string;
    status: string;
    title: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- Helpers ---
  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('کد تخفیف کپی شد', {
      position: 'bottom-center',
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      theme: 'colored',
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // --- Modal Logic ---
  const openStatusModal = (discount: Discount) => {
    setTargetDiscount({
      id: discount._id,
      status: discount.status,
      title: discount.title,
    });
  };

  const closeStatusModal = () => {
    setTargetDiscount(null);
  };

  const confirmStatusChange = async () => {
    if (!targetDiscount) return;
    setIsProcessing(true);
    try {
      // تعیین وضعیت جدید (توییچ بین فعال و غیرفعال)
      // نکته: طبق دیتای جدید وضعیت غیرفعال "deactive" است
      const newStatus = targetDiscount.status === 'active' ? 'deactive' : 'active';

      await api.put(`/discount/changeStatus`, { id: targetDiscount.id, status: newStatus });

      // آپدیت لوکال برای UX بهتر
      setDiscounts((prev) =>
        prev.map((d) => (d._id === targetDiscount.id ? { ...d, status: newStatus as any } : d))
      );

      toast.success('وضعیت با موفقیت تغییر کرد');
      closeStatusModal();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تغییر وضعیت');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- API Call ---
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      const response = await api.get<ApiResponse>('/discount/list', { params });

      // استخراج داده‌ها طبق ساختار جدید: result[0].data و result[0].total[0].count
      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setDiscounts(resultData.data || []);

        // استخراج تعداد کل برای صفحه‌بندی
        if (resultData.total && resultData.total.length > 0) {
          setTotalItems(resultData.total[0].count);
        } else {
          setTotalItems(0);
        }
      } else {
        setDiscounts([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('خطا در دریافت لیست تخفیفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Render Helpers ---
  const renderStatusBadge = (status: string, endDate: string) => {
    const expired = isExpired(endDate);

    if (expired) {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3 py-2 d-inline-flex align-items-center justify-content-center gap-1">
          <Clock size={12} /> منقضی
        </span>
      );
    }

    if (status === 'active') {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 d-inline-flex align-items-center justify-content-center gap-1">
          <CheckCircle size={12} /> فعال
        </span>
      );
    }

    // پوشش وضعیت‌های deactive و inactive
    return (
      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-2 d-inline-flex align-items-center justify-content-center gap-1">
        <XCircle size={12} /> غیرفعال
      </span>
    );
  };

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1600px', minHeight: '100vh' }}>
      {/* --- MODAL --- */}
      {targetDiscount && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box">
              <RotateCw className="text-warning" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">تغییر وضعیت تخفیف</h4>
            <p className="text-muted text-center mt-2 mb-4 px-3" style={{ lineHeight: '1.8' }}>
              وضعیت کد تخفیف <strong className="text-dark">"{targetDiscount.title}"</strong> به
              <span
                className={`fw-bold mx-1 ${targetDiscount.status === 'active' ? 'text-danger' : 'text-success'}`}
              >
                {targetDiscount.status === 'active' ? 'غیرفعال' : 'فعال'}
              </span>
              تغییر کند؟
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                className="btn btn-light flex-grow-1 py-2 rounded-pill fw-bold border"
                onClick={closeStatusModal}
                disabled={isProcessing}
              >
                انصراف
              </button>
              <button
                className="btn btn-warning text-white flex-grow-1 py-2 rounded-pill fw-bold shadow-sm"
                onClick={confirmStatusChange}
                disabled={isProcessing}
              >
                {isProcessing ? '...' : 'بله، تغییر بده'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Header Section --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        {/* Title */}
        <div>
          <h2 className="fw-bolder text-dark mb-1">مدیریت کدهای تخفیف</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
            لیست تمام کدهای تخفیف فعال و منقضی شده
          </p>
        </div>

        {/* Actions */}
        <div className="d-flex align-items-center gap-3">
          <Link to="/discount/create" className="btn-shine-effect">
            <span className="mx-2 fs-5">+</span> ایجاد کد تخفیف
          </Link>

          <button
            onClick={fetchDiscounts}
            className="btn btn-refresh shadow-sm"
            title="بروزرسانی لیست"
          >
            <RefreshCw size={20} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="card border-0 shadow-none bg-transparent">
        <div className="table-responsive" style={{ overflowX: 'visible' }}>
          <table className="table modern-table align-middle mb-0">
            <thead>
              <tr>
                <th className="text-secondary small fw-bold text-center" style={{ width: '50px' }}>
                  #
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '15%' }}>
                  عنوان تخفیف
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '15%' }}>
                  کد تخفیف
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '10%' }}>
                  مقدار
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '15%' }}>
                  کاربران
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '15%' }}>
                  تاریخ اعتبار
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '10%' }}>
                  وضعیت
                </th>
                <th className="text-secondary small fw-bold text-center" style={{ width: '15%' }}>
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="opacity-50 mb-3">
                      <Tag size={40} className="text-secondary" />
                    </div>
                    <h6 className="text-muted fw-bold">هیچ کد تخفیفی یافت نشد!</h6>
                  </td>
                </tr>
              ) : (
                discounts.map((item, index) => {
                  return (
                    <tr key={item._id} className="bg-white">
                      {/* Index */}
                      <td className="text-center text-muted fw-bold">
                        {(currentPage - 1) * pageSize + (index + 1)}
                      </td>

                      {/* Title */}
                      <td className="text-center">
                        <span
                          className="fw-bold text-dark d-block text-truncate mx-auto"
                          style={{ maxWidth: '180px' }}
                          title={item.title}
                        >
                          {item.title}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="text-center">
                        <div
                          className="d-inline-flex align-items-center justify-content-center gap-2 bg-light px-3 py-2 rounded-3 border border-secondary-subtle dashed-border position-relative group-hover"
                          style={{ cursor: 'pointer', minWidth: '140px' }}
                          onClick={() => handleCopy(item.code)}
                          title="کپی کردن کد"
                        >
                          <span className="font-monospace fw-bold dir-ltr text-navy">
                            {item.code}
                          </span>
                          <Copy size={14} className="text-muted" />
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1 fw-bold text-dark">
                          {Number(item.amount).toLocaleString()}
                          {item.type === 'percentage' ? (
                            <Percent size={14} className="text-danger" />
                          ) : (
                            <span className="small text-muted">تومان</span>
                          )}
                        </div>
                      </td>

                      {/* Users */}
                      <td className="text-center">
                        {item.users && item.users.length > 0 ? (
                          <div className="d-inline-flex align-items-center justify-content-center gap-1 badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3 py-2 fw-normal">
                            <Users size={14} />
                            <span>{item.users.length} کاربر</span>
                          </div>
                        ) : (
                          <div className="d-inline-flex align-items-center justify-content-center gap-1 badge bg-light text-muted border rounded-pill px-3 py-2 fw-normal">
                            <Users size={14} />
                            <span>عمومی</span>
                          </div>
                        )}
                      </td>

                      {/* Date Range */}
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center justify-content-center small gap-1">
                          <div className="d-flex align-items-center gap-1 text-muted">
                            <span className="text-success small">شروع:</span>
                            <span className="dir-ltr">{formatDate(item.startDate)}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1 text-muted">
                            <span className="text-danger small">پایان:</span>
                            <span className="dir-ltr">{formatDate(item.endDate)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="text-center">
                        {renderStatusBadge(item.status, item.endDate)}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Link
                            to={`/discount/details/${item._id}`}
                            className="btn-action btn-soft-info"
                            title="مشاهده"
                          >
                            <Eye size={18} />
                          </Link>

                          <Link
                            to={`/discount/edit/${item._id}`}
                            className="btn-action btn-soft-primary"
                            title="ویرایش"
                          >
                            <Edit size={18} />
                          </Link>

                          <button
                            className="btn-action btn-soft-warning"
                            title="تغییر وضعیت"
                            onClick={() => openStatusModal(item)}
                          >
                            <RotateCw size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="py-4">
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
        .text-navy { color: #0e3f7e; }
        .dashed-border { border-style: dashed !important; }

        /* Modal Styles */
        .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .custom-modal-content { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modal-icon-box { width: 70px; height: 70px; background-color: #fff3cd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* Shine Button */
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

        /* Refresh Button */
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

        /* Table Styles (Modern) */
        .modern-table { border-collapse: separate; border-spacing: 0 15px; }
        .modern-table thead th { border: none; background: transparent; color: #8898aa; font-weight: 600; font-size: 0.85rem; padding-bottom: 10px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border-radius: 16px; }
        .modern-table tbody tr td { border: none; padding: 16px 12px; vertical-align: middle; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); z-index: 2; position: relative; }

        /* Action Buttons */
        .btn-action { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        
        .btn-soft-info { background-color: #e0f2fe; color: #0ea5e9; }
        .btn-soft-info:hover { background-color: #0ea5e9; color: white; transform: translateY(-2px); }

        .btn-soft-primary { background-color: #e7f5ff; color: #3b82f6; }
        .btn-soft-primary:hover { background-color: #3b82f6; color: white; transform: translateY(-2px); }

        .btn-soft-warning { background-color: #fffbeb; color: #f59e0b; }
        .btn-soft-warning:hover { background-color: #f59e0b; color: white; transform: translateY(-2px); }

        /* Badges */
        .bg-success-subtle { background-color: #dcfce7 !important; color: #166534 !important; }
        .bg-danger-subtle { background-color: #fee2e2 !important; color: #991b1b !important; }
        .bg-secondary-subtle { background-color: #f1f5f9 !important; color: #475569 !important; }
        .bg-info-subtle { background-color: #e0f2fe !important; color: #075985 !important; }
      `}</style>
    </div>
  );
};

export default DiscountList;
