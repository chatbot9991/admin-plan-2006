import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, RefreshCcw, Edit, RotateCw, Image as ImageIcon, Star } from 'lucide-react';
import { api } from '../../services/api';
import Pagination from '../../components/common/Pagination';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AiModel {
  _id: string;
  name: string;
  image?: string;
  defaultShow: boolean;
  description?: string;
  description2?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

const AiList: React.FC = () => {
  const [ais, setAis] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // Status Modal States
  const [targetAi, setTargetAi] = useState<AiModel | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const fetchAis = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ai/list?page=${currentPage}&limit=${limit}`);

      const resultData = response.data?.result?.[0];
      if (resultData) {
        setAis(resultData.data || []);
        setTotal(resultData.total?.[0]?.count || 0);
      }
    } catch (error) {
      console.error('Fetch AIs error:', error);
      toast.error('خطا در دریافت لیست هوش مصنوعی‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAis();
  }, [currentPage]);

  // تغییر وضعیت (فعال/غیرفعال)
  const openStatusModal = (ai: AiModel) => {
    setTargetAi(ai);
  };

  const closeStatusModal = () => {
    setTargetAi(null);
  };

  const handleStatusChange = async () => {
    if (!targetAi) return;
    setIsProcessing(true);
    try {
      const newStatus = targetAi.status === 'active' ? 'deactive' : 'active';
      await api.put('/ai/changeStatus', { id: targetAi._id, status: newStatus });

      toast.success('وضعیت با موفقیت تغییر کرد');

      setAis(
        ais.map((item) => (item._id === targetAi._id ? { ...item, status: newStatus } : item))
      );
      closeStatusModal();
    } catch (error) {
      toast.error('خطا در تغییر وضعیت');
    } finally {
      setIsProcessing(false);
    }
  };

  // تغییر وضعیت نمایش پیش‌فرض
  const handleToggleDefaultShow = async (ai: AiModel) => {
    try {
      const endpoint = ai.defaultShow
        ? '/ai/unset/defaultShow'
        : '/ai/set/defaultShow';
      await api.put(endpoint, { id: ai._id });

      toast.success('وضعیت نمایش پیش‌فرض با موفقیت تغییر کرد');

      setAis(
        ais.map((item) =>
          item._id === ai._id ? { ...item, defaultShow: !item.defaultShow } : item
        )
      );
    } catch (error) {
      toast.error('خطا در تغییر وضعیت نمایش پیش‌فرض');
    }
  };

  // فرمت تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">مدیریت هوش مصنوعی</h4>
          <p className="text-muted mb-0 font-14">لیست سرویس‌های هوش مصنوعی فعال در سیستم</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-light rounded-3 shadow-sm px-3 d-flex align-items-center justify-content-center"
            onClick={fetchAis}
            disabled={loading}
            title="بروزرسانی لیست"
          >
            <RefreshCcw size={18} className={`text-secondary ${loading ? 'spin-anim' : ''}`} />
          </button>
          <Link
            to="/ai/create"
            className="btn btn-primary rounded-3 shadow-sm px-4 py-2 fw-medium btn-shine-effect d-flex align-items-center gap-2"
          >
            ایجاد +
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive" style={{ overflowX: 'visible' }}>
            <table className="table modern-table mb-0 align-middle">
              <thead>
                <tr>
                  <th
                    className="text-center bg-light text-secondary py-3 px-4 font-14"
                    style={{ width: '60px' }}
                  >
                    #
                  </th>
                  <th className="bg-light text-secondary py-3 font-14">تصویر و نام</th>
                  <th className="bg-light text-secondary py-3 font-14 text-end pe-5">توضیحات</th>
                  <th className="bg-light text-secondary py-3 font-14 text-center">
                    نمایش پیش‌فرض
                  </th>
                  <th className="bg-light text-secondary py-3 font-14 text-center">تاریخ ایجاد</th>
                  <th className="bg-light text-secondary py-3 font-14 text-center">وضعیت</th>
                  <th
                    className="text-center bg-light text-secondary py-3 px-4 font-14"
                    style={{ width: '220px' }}
                  >
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">در حال بارگذاری...</span>
                      </div>
                    </td>
                  </tr>
                ) : ais.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      هیچ موردی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  ais.map((ai, index) => (
                    <tr key={ai._id}>
                      <td className="text-center fw-medium text-muted">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="bg-light border rounded-3 d-flex align-items-center justify-content-center overflow-hidden"
                            style={{ width: '45px', height: '45px', flexShrink: 0 }}
                          >
                            {ai.image && ai.image !== 'string' ? (
                              <img
                                src={`${API_BASE_URL}/api/v1/portal/ai/image/download?imageFile=${ai.image}`}
                                alt={ai.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <ImageIcon size={20} className="text-muted" />
                            )}
                          </div>
                          <div>
                            <div
                              className="fw-bold text-dark text-truncate"
                              style={{ maxWidth: '150px' }}
                              title={ai.name}
                            >
                              {ai.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end pe-5">
                        <div
                          className="text-muted font-13 description-truncate ms-auto"
                          style={{
                            maxWidth: '300px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {ai.description || '-'}
                        </div>
                      </td>
                      <td className="text-center">
                        {ai.defaultShow ? (
                          <span className="badge badge-soft-success rounded-pill px-3 py-2 fw-medium">
                            بله
                          </span>
                        ) : (
                          <span className="badge badge-soft-secondary rounded-pill px-3 py-2 fw-medium">
                            خیر
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="text-muted font-13">{formatDate(ai.createdAt)}</div>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${ai.status === 'active' ? 'badge-soft-success' : 'badge-soft-danger'} rounded-pill px-3 py-2 fw-medium`}
                        >
                          {ai.status === 'active' ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className={`btn btn-action p-2 rounded-circle ${ai.defaultShow ? 'btn-soft-success' : 'btn-soft-secondary'}`}
                            onClick={() => handleToggleDefaultShow(ai)}
                            title={ai.defaultShow ? 'حذف از پیش‌فرض' : 'تنظیم به عنوان پیش‌فرض'}
                          >
                            <Star size={16} fill={ai.defaultShow ? 'currentColor' : 'none'} />
                          </button>
                          <Link
                            to={`/ai/details/${ai._id}`}
                            className="btn btn-action btn-soft-info p-2 rounded-circle"
                            title="مشاهده"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/ai/edit/${ai._id}`}
                            className="btn btn-action btn-soft-primary p-2 rounded-circle"
                            title="ویرایش"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            className="btn btn-action btn-soft-warning p-2 rounded-circle"
                            onClick={() => openStatusModal(ai)}
                            title="تغییر وضعیت"
                          >
                            <RotateCw size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-4">
          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Status Modal (Custom Overlay) */}
      {targetAi && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content card border-0 shadow-lg rounded-4 p-4 fade-in">
            <div className="text-center mb-4">
              <div
                className="modal-icon-box bg-warning-subtle text-warning mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <RotateCw size={28} />
              </div>
              <h5 className="fw-bold">تغییر وضعیت سرویس</h5>
              <p className="text-muted mt-2 font-14">
                آیا از {targetAi.status === 'active' ? 'غیرفعال' : 'فعال'} کردن سرویس{' '}
                <strong>{targetAi.name}</strong> اطمینان دارید؟
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-light flex-grow-1 py-2 rounded-3"
                onClick={closeStatusModal}
                disabled={isProcessing}
              >
                انصراف
              </button>
              <button
                className="btn btn-warning flex-grow-1 py-2 rounded-3 text-white"
                onClick={handleStatusChange}
                disabled={isProcessing}
              >
                {isProcessing ? 'در حال ثبت...' : 'بله، تغییر بده'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .btn-shine-effect {
          position: relative;
          overflow: hidden;
        }
        .btn-shine-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
          animation: shine 3s infinite;
        }
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        
        /* Table Styles */
        .modern-table th {
          font-weight: 600;
          border-bottom: 2px solid #f1f5f9;
        }
        .modern-table td {
          border-bottom: 1px solid #f8f9fa;
          padding: 1.25rem 0.5rem;
          color: #4b5563;
        }
        .modern-table tbody tr {
          transition: all 0.2s;
        }
        .modern-table tbody tr:hover {
          background-color: #f8fafc;
        }
        .font-13 { font-size: 13px; }
        .font-14 { font-size: 14px; }
        
        /* Soft Badges */
        .badge-soft-success {
          background-color: #d1fae5;
          color: #10b981;
        }
        .badge-soft-danger {
          background-color: #fee2e2;
          color: #ef4444;
        }
        .badge-soft-secondary {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        
        /* Action Buttons */
        .btn-action {
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }
        .btn-action:hover {
          transform: translateY(-2px);
        }
        .btn-soft-info {
          background-color: #e0f2fe;
          color: #0ea5e9;
        }
        .btn-soft-info:hover {
          background-color: #0ea5e9;
          color: white;
        }
        .btn-soft-primary {
          background-color: #dbeafe;
          color: #3b82f6;
        }
        .btn-soft-primary:hover {
          background-color: #3b82f6;
          color: white;
        }
        .btn-soft-warning {
          background-color: #fef3c7;
          color: #f59e0b;
        }
        .btn-soft-warning:hover {
          background-color: #f59e0b;
          color: white;
        }
        .btn-soft-success {
          background-color: #d1fae5;
          color: #10b981;
        }
        .btn-soft-success:hover {
          background-color: #10b981;
          color: white;
        }
        .btn-soft-secondary {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        .btn-soft-secondary:hover {
          background-color: #6b7280;
          color: white;
        }
        
        /* Modal */
        .custom-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-modal-content {
          width: 100%;
          max-width: 400px;
        }
      `}</style>
    </div>
  );
};

export default AiList;
