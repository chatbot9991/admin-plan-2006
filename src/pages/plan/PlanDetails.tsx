import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  Info,
  Users,
  CreditCard,
  Clock,
  Activity,
  UploadCloud,
  Star,
  Box,
} from 'lucide-react';
import { api } from '../../services/api';

const IMAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PlanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/plan/details/${id}`);
        const planData = response.data?.result?.[0];

        if (planData) {
          setPlan(planData);
        } else {
          setError('اطلاعات پلن یافت نشد.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در دریافت اطلاعات پلن');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlanDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 fade-in">
        <AlertCircle size={64} className="text-danger mb-3" />
        <h3 className="fw-bolder text-dark mb-2">خطا در دریافت اطلاعات!</h3>
        <p className="text-muted">{error || 'پلن مورد نظر یافت نشد.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary mt-3 px-4 py-2 rounded-pill shadow-sm"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }} dir="rtl">
      {/* Header Row */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bolder text-dark mb-1 d-flex align-items-center gap-2">
            <Info size={28} className="text-primary" />
            جزئیات پلن: {plan?.name || plan?.title || 'نامشخص'}
          </h3>
          <div className="mt-2 d-flex align-items-center gap-3 flex-wrap">
            <span>
              <span className="text-muted me-2">شناسه سیستم:</span>
              <span className="dir-ltr d-inline-block text-primary fw-bold bg-primary-subtle px-2 py-1 rounded">
                {plan?._id}
              </span>
            </span>
            {plan?.status === 'active' ? (
              <span className="badge bg-success">فعال</span>
            ) : (
              <span className="badge bg-danger">غیرفعال</span>
            )}
            {plan?.highlight && (
              <span className="badge bg-warning text-dark">پلن ویژه (Highlight)</span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-white border shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 hover-up transition-all"
        >
          بازگشت <ArrowRight size={18} />
        </button>
      </div>

      <div className="row g-4">
        {/* Main Info Column */}
        <div className="col-lg-8 col-12">
          {/* General Information Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="card-header border-0 py-3 bg-light d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                اطلاعات و ویژگی‌های پلن
              </h5>
              <span className="badge bg-secondary-subtle text-secondary border">
                نسخه: {plan?.version || 1}
              </span>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                {/* Price */}
                <div className="col-md-4 col-sm-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-success">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <span className="d-block text-muted small mb-1">قیمت</span>
                      <strong className="d-block text-dark fs-5">
                        {plan?.price ? `${Number(plan.price).toLocaleString()} تومان` : 'رایگان'}
                      </strong>
                    </div>
                  </div>
                </div>
                {/* Request Limit */}
                <div className="col-md-4 col-sm-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-primary">
                      <Activity size={24} />
                    </div>
                    <div>
                      <span className="d-block text-muted small mb-1">محدودیت درخواست</span>
                      <strong className="d-block text-dark fs-5">
                        {plan?.limitOfRequest ?? 'نامشخص'}
                      </strong>
                    </div>
                  </div>
                </div>
                {/* Upload Limit */}
                <div className="col-md-4 col-sm-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-info">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <span className="d-block text-muted small mb-1">محدودیت فایل آپلود</span>
                      <strong className="d-block text-dark fs-5">
                        {plan?.limitUploadFiles ?? 'نامشخص'}
                      </strong>
                    </div>
                  </div>
                </div>
                {/* Number of Users */}
                <div className="col-md-4 col-sm-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-secondary">
                      <Users size={24} />
                    </div>
                    <div>
                      <span className="d-block text-muted small mb-1">ظرفیت کاربران</span>
                      <strong className="d-block text-dark fs-5">
                        {plan?.numberOfUsers ?? 'نامحدود'}
                      </strong>
                    </div>
                  </div>
                </div>
                {/* Duration */}
                <div className="col-md-4 col-sm-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-warning">
                      <Clock size={24} />
                    </div>
                    <div>
                      <span className="d-block text-muted small mb-1">مدت زمان</span>
                      <strong className="d-block text-dark fs-5">
                        {plan?.duration ? `${plan.duration} روز` : 'نامشخص'}
                      </strong>
                    </div>
                  </div>
                </div>
                {/* Points */}
                <div className="col-md-4 col-sm-6">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light h-100 border border-light transition-all hover-bg-white hover-shadow">
                    <div className="bg-white p-2 rounded-circle shadow-sm text-danger">
                      <Star size={24} />
                    </div>
                    <div>
                      <span className="d-block text-muted small mb-1">امتیاز</span>
                      <strong className="d-block text-dark fs-5">{plan?.points ?? 0}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Details Row */}
              <div className="row mt-4 pt-4 border-top g-3">
                <div className="col-md-3 col-6">
                  <span className="text-muted d-block small">نوع پرداخت:</span>
                  <span className="fw-bold">
                    {plan?.typePay === 'Month' ? 'ماهانه' : plan?.typePay || 'نامشخص'}
                  </span>
                </div>
                <div className="col-md-3 col-6">
                  <span className="text-muted d-block small">نوع پلن:</span>
                  <span className="fw-bold">
                    {plan?.type === 'public' ? 'عمومی' : plan?.type || 'نامشخص'}
                  </span>
                </div>
                <div className="col-md-3 col-6">
                  <span className="text-muted d-block small">ترتیب نمایش:</span>
                  <span className="fw-bold">{plan?.order ?? '-'}</span>
                </div>
                <div className="col-md-3 col-6">
                  <span className="text-muted d-block small">امکان حذف فایل:</span>
                  {plan?.deleteFile ? (
                    <span className="badge bg-success-subtle text-success">دارد</span>
                  ) : (
                    <span className="badge bg-danger-subtle text-danger">ندارد</span>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Sidebar: AI Info */}
        <div className="col-lg-4 col-12">
          <div className="card border-0 shadow-sm rounded-4 mb-4 h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <Box size={20} className="text-primary" />
                هوش‌های مصنوعی فعال
              </h5>
            </div>
            <div className="card-body p-3">
              {!plan?.ai_info || plan.ai_info.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  هوش مصنوعی‌ای به این پلن متصل نیست.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {plan.ai_info.map((ai: any) => (
                    <div
                      key={ai._id}
                      className="d-flex gap-3 p-3 bg-light rounded-3 border border-light hover-shadow transition-all align-items-start"
                    >
                      {ai.image ? (
                        <img
                          src={`${IMAGE_BASE_URL}/${ai.image}`}
                          alt={ai.name}
                          className="rounded-3 shadow-sm"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="bg-white text-primary rounded-3 d-flex justify-content-center align-items-center shadow-sm"
                          style={{ width: '60px', height: '60px' }}
                        >
                          <Box size={24} />
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark">{ai.name || 'نامشخص'}</strong>
                          {ai.status === 'active' && (
                            <span className="badge bg-success-subtle text-success py-1">فعال</span>
                          )}
                        </div>
                        <p
                          className="text-muted small mb-0 lh-sm line-clamp-2"
                          title={ai.description}
                        >
                          {ai.description || 'توضیحاتی ثبت نشده است.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <Users size={20} className="text-primary" />
                کاربران دارای این پلن ({plan?.users?.length || 0} نفر)
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3 px-4 text-muted font-weight-bold border-0">نام کاربر</th>
                      <th className="py-3 px-4 text-muted font-weight-bold border-0">ایمیل</th>
                      <th className="py-3 px-4 text-muted font-weight-bold border-0">موجودی API</th>
                      <th className="py-3 px-4 text-muted font-weight-bold border-0">
                        موجودی آپلود
                      </th>
                      <th className="py-3 px-4 text-muted font-weight-bold border-0">
                        تاریخ انقضا
                      </th>
                      <th className="py-3 px-4 text-muted font-weight-bold border-0 text-center">
                        وضعیت
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!plan?.users || plan.users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          هیچ کاربری برای این پلن یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      plan.users.map((u: any, index: number) => {
                        const userInfo = u.userInfo?.[0] || {};
                        const userMeta = u.userMeta || {};

                        return (
                          <tr key={userMeta._id || index} className="transition-all">
                            <td className="py-3 px-4 fw-medium text-dark">
                              {userInfo.name || userInfo.family
                                ? `${userInfo.name ?? ''} ${userInfo.family ?? ''}`.trim()
                                : 'نامشخص'}
                            </td>
                            <td className="py-3 px-4 text-secondary">
                              <span
                                className="dir-ltr d-inline-block text-truncate"
                                style={{ maxWidth: '200px' }}
                                title={userInfo.email}
                              >
                                {userInfo.email || 'ندارد'}
                              </span>
                            </td>
                            <td className="py-3 px-4 fw-medium">
                              <span className="badge bg-info-subtle text-info px-3 py-2 rounded-pill">
                                {userMeta.amountApiExist ?? 0}
                              </span>
                            </td>
                            <td className="py-3 px-4 fw-medium">
                              <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill">
                                {userMeta.amountUploadExist ?? 0}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-secondary">
                              {userMeta.exTime
                                ? new Date(userMeta.exTime).toLocaleDateString('fa-IR')
                                : 'نامشخص'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {userMeta.status === 'active' ? (
                                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill border border-success-subtle">
                                  فعال
                                </span>
                              ) : (
                                <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill border border-danger-subtle">
                                  غیرفعال
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
