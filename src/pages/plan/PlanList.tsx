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
  Edit,
  RotateCw,
  Trash2,
  Package,
  Activity,
  UploadCloud,
  Users,
  Clock,
  Award,
} from 'lucide-react';

import { api } from '../../services/api';
import Filter from '../../components/common/Filter';
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---
interface PlanOriginalData {
  _id: string;
  name: string;
  price: string;
  limitOfRequest: number;
  numberOfUsers: number;
  limitUploadFiles: number;
  version: number;
  duration: number;
  points: number;
  status: string;
}

interface PlanItem {
  _id: string;
  totalPrice: number;
  usersActiveCount: number;
  originalData: PlanOriginalData;
}

interface PlanApiResponse {
  result: {
    data: PlanItem[];
    total: { count: number }[];
  }[];
}

const PlanList: React.FC = () => {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  const [showFilters, setShowFilters] = useState(true);
  const [tempSearch, setTempSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ search: '' });

  const [targetPlan, setTargetPlan] = useState<{ id: string; status: string; name: string } | null>(
    null
  );
  const [deletePlan, setDeletePlan] = useState<{ id: string; name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const where: any = {};
      if (appliedFilters.search) {
        where.name = appliedFilters.search;
      }

      if (Object.keys(where).length > 0) {
        const filterJson = JSON.stringify({ where });
        params.append('filter', filterJson);
      }

      const response = await api.get<PlanApiResponse>(`/plan/list?${params.toString()}`);

      if (response.data?.result?.[0]) {
        const resultData = response.data.result[0];
        setPlans(resultData.data || []);
        setTotal(resultData.total?.[0]?.count || 0);
      } else {
        setPlans([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('خطا در دریافت لیست پلن‌ها');
      setPlans([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({ search: tempSearch });
  };

  const handleResetFilters = () => {
    setTempSearch('');
    setCurrentPage(1);
    setAppliedFilters({ search: '' });
  };

  const openStatusModal = (plan: PlanItem) => {
    setTargetPlan({
      id: plan.originalData._id,
      status: plan.originalData.status,
      name: plan.originalData.name,
    });
  };
  const closeStatusModal = () => setTargetPlan(null);

  const confirmStatusChange = async () => {
    if (!targetPlan) return;
    setIsProcessing(true);
    try {
      const newStatus = targetPlan.status === 'active' ? 'deactive' : 'active';
      await api.put(`/plan/changeStatus`, { id: targetPlan.id, status: newStatus });

      setPlans((prev) =>
        prev.map((p) =>
          p.originalData._id === targetPlan.id
            ? { ...p, originalData: { ...p.originalData, status: newStatus } }
            : p
        )
      );
      toast.success('وضعیت با موفقیت تغییر کرد');
      closeStatusModal();
    } catch (error) {
      toast.error('خطا در تغییر وضعیت');
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeleteModal = (plan: PlanItem) => {
    setDeletePlan({ id: plan.originalData._id, name: plan.originalData.name });
  };
  const closeDeleteModal = () => setDeletePlan(null);

  const confirmDelete = async () => {
    if (!deletePlan) return;
    setIsProcessing(true);
    try {
      await api.delete('/plan/delete', { data: { _id: deletePlan.id } });
      setPlans((prev) => prev.filter((p) => p.originalData._id !== deletePlan.id));
      setTotal((prev) => prev - 1);
      toast.success('مورد با موفقیت حذف شد');
      closeDeleteModal();
      if (plans.length === 1 && currentPage > 1) setCurrentPage((prev) => prev - 1);
    } catch (error) {
      toast.error('خطا در حذف');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: string | number) => Number(price).toLocaleString('fa-IR');

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      
      {/* --- Modals --- */}
      {/* Status Modal */}
      {targetPlan && (
        <div className="custom-modal-overlay" onClick={closeStatusModal}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-box text-warning mb-3">
              <RotateCw size={36} />
            </div>
            <h5 className="fw-bold mb-3">تغییر وضعیت پلن</h5>
            <p className="text-muted text-center mb-4">
              آیا از تغییر وضعیت پلن <strong>{targetPlan.name}</strong> اطمینان دارید؟
            </p>
            <div className="d-flex gap-2 w-100">
              <button className="btn btn-light w-50 rounded-3" onClick={closeStatusModal} disabled={isProcessing}>
                انصراف
              </button>
              <button className="btn btn-warning w-50 rounded-3 text-white" onClick={confirmStatusChange} disabled={isProcessing}>
                {isProcessing ? 'در حال پردازش...' : 'تایید تغییر'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletePlan && (
        <div className="custom-modal-overlay" onClick={closeDeleteModal}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-box mb-3" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <Trash2 size={36} />
            </div>
            <h5 className="fw-bold mb-3">حذف پلن</h5>
            <p className="text-muted text-center mb-4">
              آیا از حذف پلن <strong>{deletePlan.name}</strong> اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </p>
            <div className="d-flex gap-2 w-100">
              <button className="btn btn-light w-50 rounded-3" onClick={closeDeleteModal} disabled={isProcessing}>
                انصراف
              </button>
              <button className="btn btn-danger w-50 rounded-3" onClick={confirmDelete} disabled={isProcessing}>
                {isProcessing ? 'در حال حذف...' : 'تایید حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- End Modals --- */}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت پلن‌ها</h3>
          <p className="text-muted small mb-0">لیست تمامی پلن‌های سیستم</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/plan/create" className="btn-shine-effect">
            <span className="mx-2 fs-5">+</span> ایجاد پلن جدید
          </Link>
          <button
            onClick={fetchPlans}
            className="btn btn-light rounded-pill p-2 shadow-sm border"
            title="بروزرسانی"
          >
            <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ zIndex: 10 }}>
        <div
          className="card-header bg-white border-0 p-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="d-flex align-items-center gap-2 text-primary fw-bold">
            <FilterIcon size={20} />
            <span>جستجو و فیلتر</span>
          </div>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        <div className={`collapse ${showFilters ? 'show' : ''}`}>
          <div className="card-body bg-light border-top p-4">
            <div className="row g-3 align-items-end pb-2">
              <div className="col-12 col-md-5 col-lg-4">
                <Filter
                  type="text"
                  label="جستجو با نام پلن"
                  placeholder="نام پلن را وارد کنید..."
                  value={tempSearch}
                  onChange={setTempSearch}
                />
              </div>
              <div className="col-12 col-md-auto d-flex gap-2" style={{ marginBottom: '2px' }}>
                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4"
                  onClick={handleApplyFilters}
                  style={{ height: '44px', borderRadius: '12px' }}
                >
                  <Search size={18} />
                  <span>جستجو</span>
                </button>
                {tempSearch && (
                  <button
                    className="btn btn-danger-soft px-3"
                    onClick={handleResetFilters}
                    title="پاک کردن"
                    style={{ height: '44px', borderRadius: '12px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ paddingBottom: '10px' }}>
        <table className="table modern-table mb-0">
          <thead>
            <tr className="text-nowrap text-muted">
              <th style={{ width: '5%', borderRadius: '0 15px 15px 0' }}>#</th>
              <th>نام پلن</th>
              <th className="text-center">قیمت</th>
              <th className="text-center">درخواست / آپلود</th>
              <th className="text-center">کاربران</th>
              <th className="text-center">زمان (روز)</th>
              <th className="text-center">امتیاز</th>
              <th className="text-center">وضعیت</th>
              <th
                className="text-center"
                style={{ minWidth: '180px', borderRadius: '15px 0 0 15px' }}
              >
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-5 text-muted fw-bold">
                  هیچ موردی یافت نشد!
                </td>
              </tr>
            ) : (
              plans.map((plan, index) => {
                const item = plan.originalData;
                const isActive = item.status === 'active';
                return (
                  <tr key={item._id} className="align-middle text-nowrap">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-2 rounded-3 text-primary d-flex align-items-center justify-content-center">
                          <Package size={22} />
                        </div>
                        <div className="d-flex flex-column gap-1">
                          <span
                            className="fw-bold text-dark text-truncate"
                            style={{ maxWidth: '180px' }}
                            title={item.name}
                          >
                            {item.name}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            نسخه: {item.version}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1 text-primary fw-bold">
                        {formatPrice(item.price)}
                        <span className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>
                          تومان
                        </span>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <span className="badge bg-light text-dark border d-flex align-items-center gap-1 py-2 px-3">
                          <Activity size={14} className="text-info" />
                          {item.limitOfRequest}
                        </span>
                        <span className="badge bg-light text-dark border d-flex align-items-center gap-1 py-2 px-3">
                          <UploadCloud size={14} className="text-warning" />
                          {item.limitUploadFiles}
                        </span>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1 fw-bold text-secondary">
                        <Users size={16} className="text-muted" />
                        {item.numberOfUsers} نفر
                      </div>
                    </td>

                    <td className="text-center">
                      <span className="text-muted small d-flex align-items-center justify-content-center gap-1">
                        <Clock size={14} /> {item.duration || 0} روز
                      </span>
                    </td>

                    <td className="text-center">
                      <span className="badge bg-warning text-dark px-3 py-2 d-inline-flex align-items-center gap-1 border border-warning-subtle rounded-pill">
                        <Award size={14} /> {item.points || 0}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
                        <span className="dot"></span>
                        {isActive ? 'فعال' : 'غیرفعال'}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link
                          to={`/plan/details/${item._id}`}
                          className="btn-action btn-soft-info"
                          title="مشاهده"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/plan/edit/${item._id}`}
                          className="btn-action btn-soft-primary"
                          title="ویرایش"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          className="btn-action btn-soft-warning"
                          title="تغییر وضعیت"
                          onClick={() => openStatusModal(plan)}
                        >
                          <RotateCw size={18} />
                        </button>
                        <button
                          className="btn-action btn-danger-soft"
                          title="حذف"
                          onClick={() => openDeleteModal(plan)}
                        >
                          <Trash2 size={18} />
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
        
        /* Modal Styles */
        .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeInOverlay 0.2s ease-out; }
        .custom-modal-content { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modal-icon-box { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .btn-shine-effect { background: linear-gradient(45deg, #0d6efd, #0dcaf0); color: white; padding: 8px 20px; border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3); transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; font-weight: 600; }
        .btn-shine-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13, 110, 253, 0.5); color: white; }

        .btn-danger-soft { background-color: #fff5f5; color: #ef4444; border: 1px solid #fee2e2; transition: all 0.2s; }
        .btn-danger-soft:hover { background-color: #fee2e2; color: #b91c1c; }

        .modern-table { border-collapse: separate; border-spacing: 0 12px; }
        .modern-table thead th { border: none; background: transparent; color: #6c757d; font-weight: 600; font-size: 0.85rem; padding-bottom: 8px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); transition: all 0.2s ease; border-radius: 16px; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06); z-index: 2; position: relative; }
        .modern-table td { border: none; padding: 18px 12px; }
        
        .status-pill { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-pill.active { background-color: #d1e7dd; color: #0f5132; }
        .status-pill.inactive { background-color: #f8d7da; color: #842029; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background-color: currentColor; margin-left: 6px; }

        .btn-action { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-info { background-color: #e0f2fe; color: #0284c7; }
        .btn-soft-info:hover { background-color: #0284c7; color: white; }
        .btn-soft-primary { background-color: #e0e7ff; color: #4f46e5; }
        .btn-soft-primary:hover { background-color: #4f46e5; color: white; }
        .btn-soft-warning { background-color: #fef3c7; color: #d97706; }
        .btn-soft-warning:hover { background-color: #d97706; color: white; }
      `}</style>
    </div>
  );
};

export default PlanList;
