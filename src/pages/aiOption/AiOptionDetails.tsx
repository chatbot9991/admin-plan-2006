import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

// به روز رسانی تایپ‌ها بر اساس ریسپانس شما
interface AiOptionData {
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
  aiId: {
    _id: string;
    name: string;
    image: string;
    defaultShow: boolean;
    description: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AiOptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AiOptionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      // دقیقا به همان آدرسی که گفتید درخواست زده می‌شود
      const response = await api.get(`/ai-option/details?_id=${id}`);

      // گرفتن آبجکت aiOption از ریسپانس
      if (response.data && response.data.aiOption) {
        setData(response.data.aiOption);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching AI Option details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ترجمه وضعیت‌ها و فیلدها برای نمایش بهتر
  const translateStatus = (status: string) => {
    return status === 'active' ? 'فعال' : status === 'inactive' ? 'غیرفعال' : status;
  };

  const translateField = (field: string) => {
    return field === 'chat' ? 'چت (Chat)' : field === 'image' ? 'تصویر (Image)' : field;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
        <h4 className="text-muted">آپشن هوش مصنوعی یافت نشد!</h4>
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/ai-option/list')}>
          بازگشت به لیست
        </button>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .fade-in { animation: fadeIn 0.4s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .hover-dark:hover { background-color: #e9ecef; color: #212529 !important; }
          .detail-label { font-size: 0.85rem; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
          .detail-value { font-size: 1.1rem; color: #2b2b2b; font-weight: 500; }
          .image-wrapper { width: 100%; max-height: 400px; border-radius: 1rem; overflow: hidden; background: #f8f9fa; display: flex; align-items: center; justify-content: center; }
          .image-wrapper img { width: 100%; height: 100%; object-fit: contain; }
        `}
      </style>

      <div
        className="container-fluid p-4 fade-in"
        style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}
      >
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold text-dark px-2">جزئیات آپشن هوش مصنوعی</h4>
            <Link
              to="/ai-option/list"
              className="btn btn-light border d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-secondary hover-dark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"
                />
              </svg>
              بازگشت به لیست
            </Link>
          </div>
        </div>

        <div className="row g-4">
          {/* اطلاعات متنی */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-4 border-bottom pb-3 text-primary">اطلاعات اصلی</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3">
                    <div className="detail-label">نام آپشن (Name)</div>
                    <div className="detail-value">{data.name}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3">
                    <div className="detail-label">هوش مصنوعی والد (AI)</div>
                    <div className="detail-value d-flex align-items-center gap-2">
                      {data.aiId?.name || 'نامشخص'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <div className="detail-label">حوزه (Field)</div>
                    <div className="detail-value text-info fw-bold">
                      {translateField(data.field)}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <div className="detail-label">وضعیت کلی (Status)</div>
                    <div className="detail-value">
                      <span
                        className={`badge ${data.status === 'active' ? 'bg-success' : 'bg-danger'} px-3 py-2 rounded-pill`}
                      >
                        {translateStatus(data.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <div className="detail-label">وضعیت پیش‌فرض (Default Show)</div>
                    <div className="detail-value">
                      {data.defaultShow ? (
                        <span className="badge bg-primary px-3 py-2 rounded-pill">
                          نمایش پیش‌فرض
                        </span>
                      ) : (
                        <span className="badge bg-secondary px-3 py-2 rounded-pill">عادی</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="fw-bold mt-4 mb-3 border-bottom pb-2 text-primary">
                اطلاعات مالی (توکن/هزینه)
              </h5>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-warning">
                    <div className="detail-label">قیمت ورودی (Input)</div>
                    <div className="detail-value">
                      {data.inputPrice} <span className="text-muted fs-6">توکن</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-info">
                    <div className="detail-label">قیمت خروجی (Output)</div>
                    <div className="detail-value">
                      {data.outputPrice} <span className="text-muted fs-6">توکن</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3 border-start border-4 border-success">
                    <div className="detail-label">قیمت کش (Cache)</div>
                    <div className="detail-value">
                      {data.cachePrice} <span className="text-muted fs-6">توکن</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3">
                    <div className="detail-label">تاریخ ایجاد</div>
                    <div className="detail-value" dir="ltr">
                      {data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString('fa-IR')
                        : 'نامشخص'}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3">
                    <div className="detail-label">تاریخ آخرین بروزرسانی</div>
                    <div className="detail-value" dir="ltr">
                      {data.updatedAt
                        ? new Date(data.updatedAt).toLocaleDateString('fa-IR')
                        : 'نامشخص'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3">
                <div className="detail-label">توضیحات</div>
                <div className="detail-value mt-2" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                  {data.description && data.description !== 'string'
                    ? data.description
                    : 'توضیحاتی برای این آپشن ثبت نشده است.'}
                </div>
              </div>
            </div>
          </div>

          {/* تصویر شاخص */}
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
              style={{ top: '20px' }}
            >
              <h5 className="fw-bold mb-4 border-bottom pb-3 text-primary">تصویر آپشن</h5>

              <div className="image-wrapper shadow-sm border mb-4">
                {data.image && data.image !== 'string' ? (
                  <img src={data.image} alt={data.name} />
                ) : (
                  <div className="text-muted text-center p-5">
                    <i className="bi bi-image fs-1 d-block mb-2 text-secondary"></i>
                    تصویری یافت نشد
                  </div>
                )}
              </div>

              {/* نمایش خلاصه والد */}
              {data.aiId && (
                <div className="p-3 bg-light rounded-3 mt-3">
                  <div className="detail-label mb-2">اطلاعات والد (AI)</div>
                  <div className="d-flex align-items-center gap-3">
                    {data.aiId.image ? (
                      <img
                        src={
                          data.aiId.image.startsWith('http')
                            ? data.aiId.image
                            : `/${data.aiId.image}`
                        }
                        alt={data.aiId.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          backgroundColor: '#e9ecef',
                        }}
                      ></div>
                    )}
                    <div>
                      <h6 className="mb-1 fw-bold">{data.aiId.name}</h6>
                      <small className="text-muted">{translateStatus(data.aiId.status)}</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiOptionDetails;
