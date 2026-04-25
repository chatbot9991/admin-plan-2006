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
} from 'lucide-react';

// ایمپورت سرویس API
import { api } from '../../services/api';
import Filter from '../../components/common/Filter';
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---
interface Plan {
  _id: string;
  totalPrice: number;
  usersActiveCount: number;
  originalData: {
    name: string;
    price: number;
    duration: number;
    status: string; // "active" | "inactive"
  };
  ai_info?: any;
}

interface ApiResponse {
  result: {
    data: Plan[];
    total: { count: number }[];
  }[];
}

const PlanList: React.FC = () => {
  // --- States for Data ---
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- UI States (Filters) ---
  const [showFilters, setShowFilters] = useState(true);

  // استیت‌های موقت (ورودی کاربر)
  const [tempSearch, setTempSearch] = useState('');

  // استیت‌های نهایی (ارسال به API)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
  });

  // --- Modals State ---
  const [targetPlan, setTargetPlan] = useState<{
    id: string;
    status: string;
    name: string;
  } | null>(null);

  const [deletePlan, setDeletePlan] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- Core API Fetch Function ---
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

      const response = await api.get<ApiResponse>(`/plan/list?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setPlans(resultData.data || []);
        const totalCount =
          resultData.total && resultData.total.length > 0 ? resultData.total[0].count : 0;
        setTotal(totalCount);
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

  // --- Handlers ---
  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({ search: tempSearch });
  };

  const handleResetFilters = () => {
    setTempSearch('');
    setCurrentPage(1);
    setAppliedFilters({ search: '' });
  };

  // --- Status Change Logic ---
  const openStatusModal = (plan: Plan) => {
    setTargetPlan({ id: plan._id, status: plan.originalData.status, name: plan.originalData.name });
  };

  const closeStatusModal = () => {
    setTargetPlan(null);
  };

  const confirmStatusChange = async () => {
    if (!targetPlan) return;
    setIsProcessing(true);
    try {
      const newStatus = targetPlan.status === 'active' ? 'deactive' : 'active';
      await api.put(`/plan/changeStatus`, { id: targetPlan.id, status: newStatus });

      setPlans((prev) =>
        prev.map((p) =>
          p._id === targetPlan.id
            ? { ...p, originalData: { ...p.originalData, status: newStatus } }
            : p
        )
      );

      toast.success('وضعیت پلن با موفقیت تغییر کرد');
      closeStatusModal();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تغییر وضعیت');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Delete Logic ---
  const openDeleteModal = (plan: Plan) => {
    setDeletePlan({ id: plan._id, name: plan.originalData?.name });
  };

  const closeDeleteModal = () => {
    setDeletePlan(null);
  };

  const confirmDelete = async () => {
    if (!deletePlan) return;
    setIsProcessing(true);
    try {
      // ارسال درخواست Delete همراه با Body طبق داکیومنت Swagger
      await api.delete('/plan/delete', {
        data: { _id: deletePlan.id },
      });

      setPlans((prev) => prev.filter((p) => p._id !== deletePlan.id));
      setTotal((prev) => prev - 1);

      toast.success('پلن با موفقیت حذف شد');
      closeDeleteModal();

      // اگر در صفحه جاری آیتمی نمانده بود، یک صفحه به عقب برگرد
      if (plans.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error(error);
      toast.error('خطا در حذف پلن');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  // --- Formatter ---
  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      {/* Modal تغییر وضعیت */}
      {targetPlan && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box">
              <RotateCw className="text-warning" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">تغییر وضعیت پلن</h4>
            <p className="text-muted text-center mt-2 mb-4 px-3">
              وضعیت پلن <strong>"{targetPlan.name}"</strong> به
              <span
                className={`fw-bold mx-1 ${targetPlan.status === 'active' ? 'text-danger' : 'text-success'}`}
              >
                {targetPlan.status === 'active' ? 'غیرفعال' : 'فعال'}
              </span>
              تغییر کند؟
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                className="btn btn-light flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={closeStatusModal}
                disabled={isProcessing}
              >
                انصراف
              </button>
              <button
                className="btn btn-warning text-white flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={confirmStatusChange}
                disabled={isProcessing}
              >
                {isProcessing ? '...' : 'بله، تغییر بده'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal حذف پلن */}
      {deletePlan && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box bg-danger bg-opacity-10">
              <Trash2 className="text-danger" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">حذف پلن</h4>
            <p className="text-muted text-center mt-2 mb-4 px-3">
              آیا از حذف پلن <strong>"{deletePlan.name}"</strong> اطمینان دارید؟ این عملیات غیرقابل
              بازگشت است.
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                className="btn btn-light flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={closeDeleteModal}
                disabled={isProcessing}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger text-white flex-grow-1 py-2 rounded-pill fw-bold border-0 shadow-sm"
                onClick={confirmDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت پلن‌ها</h3>
          <p className="text-muted small mb-0">لیست اشتراک‌ها و پلن‌های سیستم</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/plan/create" className="btn-shine-effect">
            <span className="mx-2 fs-5">+</span> ایجاد پلن جدید
          </Link>
          <button
            onClick={fetchPlans}
            className="btn btn-light rounded-pill p-2 shadow-sm border"
            title="بروزرسانی لیست"
          >
            <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{ overflow: 'visible', zIndex: 10 }}
      >
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
              <div className="col-12 col-md-4">
                <Filter
                  type="text"
                  label="جستجو (نام پلن)"
                  placeholder="نام پلن..."
                  value={tempSearch}
                  onChange={setTempSearch}
                />
              </div>

              <div className="col-12 col-md-5 d-flex gap-2">
                <button
                  className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleApplyFilters}
                  style={{ height: '48px', borderRadius: '12px' }}
                >
                  <Search size={18} />
                  <span>اعمال فیلتر</span>
                </button>
                {tempSearch && (
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

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: 'visible' }}>
        <table className="table modern-table">
          <thead>
            <tr>
              <th style={{ width: '5%', borderRadius: '0 15px 15px 0' }}>#</th>
              <th style={{ width: '25%' }}>نام پلن و هزینه</th>
              <th className="text-center" style={{ width: '15%' }}>
                مدت زمان (روز)
              </th>
              <th className="text-center" style={{ width: '20%' }}>
                تعداد کاربران فعال
              </th>
              <th className="text-center" style={{ width: '15%' }}>
                وضعیت
              </th>
              <th className="text-center" style={{ width: '20%', borderRadius: '15px 0 0 15px' }}>
                عملیات
              </th>
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
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted fw-bold">
                  هیچ پلنی یافت نشد!
                </td>
              </tr>
            ) : (
              plans.map((plan, index) => {
                const isActive = plan.originalData?.status === 'active';

                return (
                  <tr key={plan._id} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex flex-column">
                        <span
                          className="fw-bold text-dark mb-1 text-truncate"
                          style={{ maxWidth: '250px' }}
                          title={plan.originalData?.name}
                        >
                          {plan.originalData?.name || '-'}
                        </span>
                        <span className="badge bg-light text-secondary border rounded-pill fw-normal align-self-start">
                          {formatPrice(plan.originalData?.price || 0)}
                        </span>
                      </div>
                    </td>

                    <td className="text-center">
                      <span className="fw-bold text-dark">{plan.originalData?.duration || 0}</span>
                    </td>

                    <td className="text-center">
                      <span className="text-primary fw-bold bg-primary bg-opacity-10 px-3 py-1 rounded-pill">
                        {plan.usersActiveCount || 0} کاربر
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
                          to={`/plan/details/${plan._id}`}
                          className="btn-action btn-soft-info"
                          title="مشاهده"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/plan/edit/${plan._id}`}
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

      {/* Styles identical to BlogList */}
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .custom-modal-content { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modal-icon-box { width: 70px; height: 70px; background-color: #fff3cd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

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
        
        .status-pill { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-pill.active { background-color: #e6fffa; color: #20c997; }
        .status-pill.inactive { background-color: #f1f3f5; color: #868e96; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background-color: currentColor; margin-left: 6px; }

        .btn-action { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-info { background-color: #e3f2fd; color: #0dcaf0; }
        .btn-soft-info:hover { background-color: #0dcaf0; color: white; }
        .btn-soft-primary { background-color: #e7f5ff; color: #4dabf7; }
        .btn-soft-primary:hover { background-color: #4dabf7; color: white; }
        .btn-soft-warning { background-color: #fff3cd; color: #ffc107; }
        .btn-soft-warning:hover { background-color: #ffc107; color: white; }
      `}</style>
    </div>
  );
};

export default PlanList;
