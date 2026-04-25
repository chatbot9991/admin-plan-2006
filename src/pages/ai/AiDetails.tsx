import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowRight,
  Edit,
  Info,
  Image as ImageIcon,
  AlignLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Tag,
} from 'lucide-react';
import { api } from '../../services/api';

// تعریف تایپ بر اساس ساختار JSON جدید
interface AiDetailData {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  defaultShow: boolean;
  description?: string;
  image?: string;
}

const AiDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<AiDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchDetails();
    } else {
      navigate('/ai/list');
    }
  }, [id]);

  // دریافت تصویر از طریق axios (api) برای اعمال توکن و هدرها
  useEffect(() => {
    const fetchImage = async () => {
      if (data?.image) {
        setIsImageLoading(true);
        try {
          const response = await api.get('/ai/image/download', {
            params: { imageFile: data.image },
            responseType: 'blob', // دریافت به صورت فایل
          });
          // ساخت یک URL موقت برای نمایش عکس
          const url = URL.createObjectURL(response.data);
          setImageUrl(url);
        } catch (error) {
          console.error('Fetch Image Error:', error);
        } finally {
          setIsImageLoading(false);
        }
      }
    };

    fetchImage();

    // پاکسازی URL ساخته شده هنگام خروج از کامپوننت
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [data?.image]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/ai/details', {
        params: { _id: id },
      });

      // با توجه به تصویر، دیتا داخل آبجکت ai است
      const fetchedData = response.data?.ai || response.data?.data?.ai || response.data?.result?.ai;
      setData(fetchedData);
    } catch (error) {
      console.error('Fetch AI Details Error:', error);
      toast.error('خطا در دریافت اطلاعات هوش مصنوعی');
      navigate('/ai/list');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid p-4 text-center">
        <p className="text-muted">اطلاعاتی یافت نشد.</p>
        <Link to="/ai/list" className="btn btn-outline-primary mt-3">
          بازگشت به لیست
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 page-fade-in">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link
            to="/ai/list"
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm transition-all hover-scale"
            title="بازگشت به لیست"
          >
            <ArrowRight size={20} className="text-secondary" />
          </Link>
          <div>
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <Info size={22} className="text-gradient" />
              جزئیات هوش مصنوعی: <span className="text-dark">{data.name}</span>
            </h4>
            <p className="text-muted mb-0 font-14">مشاهده کامل اطلاعات ثبت شده</p>
          </div>
        </div>

        <Link
          to={`/ai/edit/${id}`}
          className="btn btn-gradient px-4 py-2 rounded-3 fw-medium d-flex align-items-center gap-2 border-0 shadow-sm transition-all hover-scale"
        >
          <Edit size={18} />
          ویرایش اطلاعات
        </Link>
      </div>

      {/* Content Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-body p-4 p-md-5">
          <div className="row g-5">
            {/* Right Column: Image and Status Info */}
            <div className="col-lg-4 text-center border-end-lg">
              <div className="mb-4 d-flex justify-content-center">
                <div
                  className="image-wrapper shadow-sm rounded-4 overflow-hidden border position-relative"
                  style={{ width: '160px', height: '160px', backgroundColor: '#f8f9fa' }}
                >
                  {isImageLoading ? (
                    <div className="d-flex align-items-center justify-content-center w-100 h-100">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      ></div>
                    </div>
                  ) : imageUrl ? (
                    <img src={imageUrl} alt={data.name} className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 text-muted">
                      <ImageIcon size={48} className="mb-2 opacity-50" />
                      <span className="font-14">بدون تصویر</span>
                    </div>
                  )}
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-3">{data.name}</h5>

              <div className="d-flex flex-column gap-2 align-items-center mb-4">
                <span
                  className={`badge px-3 py-2 rounded-pill font-14 ${data.status === 'active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
                >
                  وضعیت: {data.status === 'active' ? 'فعال' : data.status}
                </span>

                <span
                  className={`badge px-3 py-2 rounded-pill font-14 ${data.defaultShow ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}
                >
                  نمایش پیش‌فرض: {data.defaultShow ? 'بله' : 'خیر'}
                </span>
              </div>

              <div className="text-start bg-light rounded-3 p-3 font-14">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    <Tag size={14} className="me-1" /> شناسه:
                  </span>
                  <span
                    className="fw-medium text-dark text-break"
                    dir="ltr"
                    style={{ fontSize: '12px' }}
                  >
                    {data._id}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    <Tag size={14} className="me-1" /> نسخه:
                  </span>
                  <span className="fw-medium text-dark">{data.version}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    <Calendar size={14} className="me-1" /> ایجاد:
                  </span>
                  <span className="fw-medium text-dark" dir="ltr">
                    {new Date(data.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">
                    <Calendar size={14} className="me-1" /> بروزرسانی:
                  </span>
                  <span className="fw-medium text-dark" dir="ltr">
                    {new Date(data.updatedAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Left Column: Descriptions */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-4 h-100 justify-content-start mt-3 mt-lg-0">
                {/* Description */}
                <div className="content-box bg-light rounded-4 p-4 transition-all h-100">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="icon-gradient-bg p-2 rounded-circle shadow-sm">
                      <AlignLeft size={18} className="text-white" />
                    </div>
                    <h6 className="fw-bold mb-0 text-dark">توضیحات</h6>
                  </div>
                  <p
                    className="text-secondary mb-0 text-justify"
                    style={{ lineHeight: '1.9', whiteSpace: 'pre-wrap' }}
                  >
                    {data.description || (
                      <span className="text-muted fst-italic">توضیحاتی ثبت نشده است.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .page-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .font-14 { font-size: 14px; }
        .text-justify { text-align: justify; }
        
        .text-gradient {
          background: linear-gradient(135deg, #9b62ff 0%, #62b6ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .icon-gradient-bg {
          background: linear-gradient(135deg, #9b62ff 0%, #62b6ff 100%);
        }
        .btn-gradient {
          background: linear-gradient(135deg, #9b62ff 0%, #62b6ff 100%);
          color: white !important;
        }
        .btn-gradient:hover {
          background: linear-gradient(135deg, #8a50e6 0%, #52a3e6 100%);
          box-shadow: 0 4px 12px rgba(155, 98, 255, 0.3) !important;
        }
        
        .hover-scale:hover { transform: translateY(-2px); }
        
        .content-box { border: 1px solid transparent; }
        .content-box:hover {
          border-color: rgba(155, 98, 255, 0.2);
          background-color: #fcfaff !important;
        }

        .bg-success-subtle { background-color: #d1e7dd; }
        .bg-danger-subtle { background-color: #f8d7da; }
        .bg-primary-subtle { background-color: #cce5ff; }
        .bg-secondary-subtle { background-color: #e2e3e5; }

        @media (min-width: 992px) {
          .border-end-lg {
            border-left: 1px solid #eaeaea; /* Left border in RTL */
          }
        }
      `}</style>
    </div>
  );
};

export default AiDetails;
