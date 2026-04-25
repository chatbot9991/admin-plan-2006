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
  Star, // آیکون ستاره برای نمایش پیش‌فرض
} from 'lucide-react';

// فرض بر این است که api.ts در مسیر مشخص شده وجود دارد
import { api } from '../../services/api';
import Filter from '../../components/common/Filter';
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---
interface AiOption {
  _id: string;
  name: string;
  image: string;
  description: string;
  inputPrice: number;
  outputPrice: number;
  cachePrice: number;
  defaultShow: boolean;
  status: string;
  field: string;
  aiId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface AiOptionApiResponse {
  result: {
    data: AiOption[];
    total: { count: number }[];
  }[];
}

interface AiItem {
  _id: string;
  name: string;
}

const AiOptionList: React.FC = () => {
  // --- States for Data ---
  const [aiOptions, setAiOptions] = useState<AiOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // State for AI dropdown list
  const [aiList, setAiList] = useState<AiItem[]>([]);

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- UI States (Filters) ---
  const [showFilters, setShowFilters] = useState(true);

  // استیت‌های موقت (ورودی کاربر)
  const [tempSearch, setTempSearch] = useState('');
  const [tempField, setTempField] = useState('');
  const [tempAiId, setTempAiId] = useState('');

  // استیت‌های نهایی (ارسال به API)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    field: '',
    aiId: '',
  });

  // --- Modals State ---
  const [targetAiOption, setTargetAiOption] = useState<{
    id: string;
    status: string;
    name: string;
  } | null>(null);

  // استیت برای مودال نمایش پیش‌فرض
  const [targetDefaultShow, setTargetDefaultShow] = useState<{
    id: string;
    isDefaultShow: boolean;
    name: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- Fetch AI List for Dropdown ---
  const fetchAiList = async () => {
    try {
      const response = await api.get('/ai/list?limit=100');
      if (response.data && response.data.result && response.data.result.length > 0) {
        setAiList(response.data.result[0].data || []);
      }
    } catch (error) {
      console.error('Error fetching AI list:', error);
      toast.error('خطا در دریافت لیست هوش مصنوعی‌ها برای فیلتر');
    }
  };

  // --- Core API Fetch Function ---
  const fetchAiOptions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const where: any = {};

      if (appliedFilters.search) {
        where.name = appliedFilters.search;
      }
      if (appliedFilters.field) {
        where.field = appliedFilters.field;
      }
      if (appliedFilters.aiId) {
        where.aiId = appliedFilters.aiId;
      }

      if (Object.keys(where).length > 0) {
        const filterJson = JSON.stringify({ where });
        params.append('filter', filterJson);
      }

      const response = await api.get<AiOptionApiResponse>(`/ai-option/list?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setAiOptions(resultData.data || []);
        const totalCount =
          resultData.total && resultData.total.length > 0 ? resultData.total[0].count : 0;
        setTotal(totalCount);
      } else {
        setAiOptions([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching AI options:', error);
      toast.error('خطا در دریافت لیست آپشن‌ها');
      setAiOptions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({
      search: tempSearch,
      field: tempField,
      aiId: tempAiId,
    });
  };

  const handleResetFilters = () => {
    setTempSearch('');
    setTempField('');
    setTempAiId('');
    setCurrentPage(1);
    setAppliedFilters({ search: '', field: '', aiId: '' });
  };

  // --- Status Change Logic ---
  const openStatusModal = (option: AiOption) => {
    setTargetAiOption({ id: option._id, status: option.status, name: option.name });
  };

  const closeStatusModal = () => {
    setTargetAiOption(null);
  };

  const confirmStatusChange = async () => {
    if (!targetAiOption) return;
    setIsProcessing(true);
    try {
      const newStatus = targetAiOption.status === 'active' ? 'deactive' : 'active';
      await api.put(`/ai-option/changeStatus`, { id: targetAiOption.id, status: newStatus });

      setAiOptions((prev) =>
        prev.map((o) => (o._id === targetAiOption.id ? { ...o, status: newStatus } : o))
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

  // --- Default Show Logic ---
  const openDefaultShowModal = (option: AiOption) => {
    setTargetDefaultShow({ id: option._id, isDefaultShow: option.defaultShow, name: option.name });
  };

  const closeDefaultShowModal = () => {
    setTargetDefaultShow(null);
  };

  const confirmDefaultShowChange = async () => {
    if (!targetDefaultShow) return;
    setIsProcessing(true);
    try {
      const endpoint = targetDefaultShow.isDefaultShow
        ? `/ai-option/unset/defaultShow`
        : `/ai-option/set/defaultShow`;

      await api.put(endpoint, { id: targetDefaultShow.id });

      setAiOptions((prev) =>
        prev.map((o) =>
          o._id === targetDefaultShow.id
            ? { ...o, defaultShow: !targetDefaultShow.isDefaultShow }
            : o
        )
      );

      toast.success('وضعیت نمایش پیش‌فرض با موفقیت تغییر کرد');
      closeDefaultShowModal();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تغییر وضعیت نمایش پیش‌فرض');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchAiList();
  }, []);

  useEffect(() => {
    fetchAiOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      {/* Modal تغییر وضعیت */}
      {targetAiOption && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box">
              <RotateCw className="text-warning" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">تغییر وضعیت</h4>
            <p className="text-muted text-center mt-2 mb-4 px-3">
              وضعیت <strong>"{targetAiOption.name}"</strong> به
              <span
                className={`fw-bold mx-1 ${targetAiOption.status === 'active' ? 'text-danger' : 'text-success'}`}
              >
                {targetAiOption.status === 'active' ? 'غیرفعال' : 'فعال'}
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

      {/* Modal تغییر نمایش پیش‌فرض */}
      {targetDefaultShow && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box bg-info bg-opacity-10">
              <Star className="text-info" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">تغییر نمایش پیش‌فرض</h4>
            <p className="text-muted text-center mt-2 mb-4 px-3">
              آیا می‌خواهید نمایش پیش‌فرض برای <strong>"{targetDefaultShow.name}"</strong> را
              <span
                className={`fw-bold mx-1 ${targetDefaultShow.isDefaultShow ? 'text-danger' : 'text-success'}`}
              >
                {targetDefaultShow.isDefaultShow ? 'لغو کنید' : 'فعال کنید'}
              </span>
              ؟
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                className="btn btn-light flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={closeDefaultShowModal}
                disabled={isProcessing}
              >
                انصراف
              </button>
              <button
                className="btn btn-info text-white flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={confirmDefaultShowChange}
                disabled={isProcessing}
              >
                {isProcessing ? '...' : 'بله، تغییر بده'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت AI Options</h3>
          <p className="text-muted small mb-0">لیست آپشن‌های هوش مصنوعی</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/ai-option/create" className="btn-shine-effect">
            <span className="mx-2 fs-5">+</span> ایجاد آپشن جدید
          </Link>
          <button
            onClick={fetchAiOptions}
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
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="جستجو (نام)"
                  placeholder="نام..."
                  value={tempSearch}
                  onChange={setTempSearch}
                />
              </div>

              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="فیلد (field)"
                  placeholder="مثال: chat..."
                  value={tempField}
                  onChange={setTempField}
                />
              </div>

              <div className="col-12 col-md-3">
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">
                    هوش مصنوعی (AI)
                  </label>
                  <select
                    className="form-select custom-input"
                    value={tempAiId}
                    onChange={(e) => setTempAiId(e.target.value)}
                    style={{ height: '48px', borderRadius: '12px' }}
                  >
                    <option value="">همه</option>
                    {aiList.map((ai) => (
                      <option key={ai._id} value={ai._id}>
                        {ai.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-3 d-flex gap-2 pb-3">
                <button
                  className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleApplyFilters}
                  style={{ height: '48px', borderRadius: '12px' }}
                >
                  <Search size={18} />
                  <span>اعمال فیلتر</span>
                </button>
                {(tempSearch || tempField || tempAiId) && (
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
              <th style={{ width: '25%' }}>نام</th>
              <th className="text-center" style={{ width: '15%' }}>
                فیلد
              </th>
              <th className="text-center" style={{ width: '20%' }}>
                قیمت‌ها (ورودی/خروجی)
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
            ) : aiOptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted fw-bold">
                  هیچ موردی یافت نشد!
                </td>
              </tr>
            ) : (
              aiOptions.map((option, index) => {
                const isActive = option.status === 'active';

                return (
                  <tr key={option._id} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex flex-column">
                        <span
                          className="fw-bold text-dark mb-1 text-truncate"
                          style={{ maxWidth: '250px' }}
                          title={option.name}
                        >
                          {option.name}
                        </span>
                        {option.defaultShow && (
                          <span
                            className="badge bg-info text-white border rounded-pill fw-normal align-self-start"
                            style={{ fontSize: '0.7rem' }}
                          >
                            نمایش پیش‌فرض
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="text-center">
                      <span className="fw-bold text-secondary">{option.field}</span>
                    </td>

                    <td className="text-center">
                      <div className="d-flex flex-column align-items-center">
                        <span className="text-muted small">
                          In: {option.inputPrice} | Out: {option.outputPrice}
                        </span>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
                        <span className="dot"></span>
                        {isActive ? 'فعال' : 'غیرفعال'}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        {/* دکمه تنظیم/لغو نمایش پیش‌فرض */}
                        <button
                          className={`btn-action ${option.defaultShow ? 'btn-soft-success' : 'btn-soft-secondary'}`}
                          title={
                            option.defaultShow ? 'لغو نمایش پیش‌فرض' : 'تنظیم به عنوان پیش‌فرض'
                          }
                          onClick={() => openDefaultShowModal(option)}
                        >
                          <Star size={18} fill={option.defaultShow ? 'currentColor' : 'none'} />
                        </button>
                        <Link
                          to={`/ai-option/details/${option._id}`}
                          className="btn-action btn-soft-info"
                          title="مشاهده"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/ai-option/edit/${option._id}`}
                          className="btn-action btn-soft-primary"
                          title="ویرایش"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          className="btn-action btn-soft-warning"
                          title="تغییر وضعیت"
                          onClick={() => openStatusModal(option)}
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
        .btn-soft-success { background-color: #d1e7dd; color: #198754; }
        .btn-soft-success:hover { background-color: #198754; color: white; }
        .btn-soft-secondary { background-color: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
        .btn-soft-secondary:hover { background-color: #6c757d; color: white; }
        
        .custom-input { border: 1px solid #dee2e6; border-radius: 12px; padding: 0.5rem 1rem; transition: all 0.2s; }
        .custom-input:focus { border-color: #4dabf7; box-shadow: 0 0 0 0.25rem rgba(77, 171, 247, 0.25); outline: none; }
      `}</style>
    </div>
  );
};

export default AiOptionList;
