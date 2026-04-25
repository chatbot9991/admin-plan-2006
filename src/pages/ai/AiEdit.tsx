import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, Save, ImagePlus, X, Edit } from 'lucide-react';
import { api } from '../../services/api';

const AiEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAiDetails();
    } else {
      navigate('/ai/list');
    }

    // پاکسازی URL ساخته شده برای پیش‌نمایش عکس در هنگام خروج
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [id]);

  const fetchAiDetails = async () => {
    try {
      setIsFetching(true);
      // دریافت جزئیات
      const response = await api.get('/ai/details', {
        params: { _id: id },
      });

      const data = response.data?.ai || response.data?.data?.ai || response.data?.result?.ai;

      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          image: data.image || '',
        });

        // دریافت تصویر به صورت Blob در صورت وجود نام عکس
        if (data.image) {
          fetchAndSetImage(data.image);
        }
      } else {
        toast.error('اطلاعات هوش مصنوعی یافت نشد');
        navigate('/ai/list');
      }
    } catch (error) {
      console.error('Fetch AI Details Error:', error);
      toast.error('خطا در دریافت اطلاعات هوش مصنوعی');
      navigate('/ai/list');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAndSetImage = async (imageName: string) => {
    setIsImageLoading(true);
    try {
      const imgResponse = await api.get('/ai/image/download', {
        params: { imageFile: imageName },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(imgResponse.data);
      setImagePreview(url);
    } catch (error) {
      console.error('Fetch Image Error:', error);
      // در صورت خطا در لود عکس، مقدار فرم رو خالی نمیکنیم تا فقط عکس نشون داده نشه
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // ساخت پیش‌نمایش لوکال برای فایلی که کاربر انتخاب کرده
      const reader = new FileReader();
      reader.onloadend = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview); // پاکسازی blob قبلی اگر وجود داشت
        }
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' })); // حذف نام عکس قبلی از دیتای ارسالی
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning('وارد کردن نام سرویس هوش مصنوعی الزامی است');
      return;
    }

    setIsLoading(true);
    try {
      let finalImage = formData.image;

      // ۱. اگر عکس جدیدی انتخاب شده باشد، ابتدا آن را آپلود می‌کنیم
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const uploadResponse = await api.post('/ai/image/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // دریافت نام فایل آپلود شده از خروجی (بسته به ساختار ریسپانس بک‌اند شما)
        finalImage =
          uploadResponse.data?.result?.[0] ||
          uploadResponse.data?.file ||
          uploadResponse.data?.url ||
          uploadResponse.data;
      }

      // ۲. ارسال درخواست آپدیت (استفاده از _id بر اساس ساختار)
      const payload = {
        id: id,
        // name: formData.name,
        image: finalImage || undefined,
        description: formData.description,
      };

      await api.put('/ai/update', payload);

      toast.success('هوش مصنوعی با موفقیت ویرایش شد');
      navigate('/ai/list');
    } catch (error: any) {
      console.error('Update AI Error:', error);
      const errorMsg =
        error.response?.data?.message || 'خطا در ویرایش هوش مصنوعی. لطفا مجددا تلاش کنید.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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

  return (
    <div className="container-fluid p-4 page-fade-in">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
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
              <Edit size={22} className="text-gradient" />
              ویرایش هوش مصنوعی
            </h4>
            <p className="text-muted mb-0 font-14">به‌روزرسانی اطلاعات و تنظیمات سرویس</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Name Field */}
              <div className="col-lg-6">
                <label className="form-label fw-medium text-dark">
                  نام سرویس <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-lg bg-light border-0 custom-focus"
                  placeholder="مثال: ChatGPT 4"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={true}
                />
              </div>

              {/* Image Upload */}
              <div className="col-lg-6">
                <label className="form-label fw-medium text-dark">لوگو یا تصویر سرویس</label>
                <div
                  className="upload-box bg-light border border-2 border-dashed rounded-4 p-3 text-center position-relative transition-all d-flex align-items-center justify-content-center"
                  style={{ minHeight: '120px' }}
                >
                  {isImageLoading ? (
                    <div
                      className="spinner-border spinner-border-sm text-primary"
                      role="status"
                    ></div>
                  ) : imagePreview ? (
                    <div className="position-relative d-inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded-3 shadow-sm object-fit-cover"
                        style={{ width: '80px', height: '80px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm rounded-circle position-absolute top-0 start-100 translate-middle shadow"
                        onClick={removeImage}
                        disabled={isLoading}
                        style={{
                          width: '24px',
                          height: '24px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isLoading}
                        style={{ zIndex: 10 }}
                      />
                      <div className="d-flex flex-column align-items-center justify-content-center text-muted">
                        <div className="icon-gradient-bg p-2 rounded-circle shadow-sm mb-2">
                          <ImagePlus size={24} className="text-white" />
                        </div>
                        <span className="fw-medium text-dark font-14">
                          برای انتخاب تصویر کلیک کنید
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="col-lg-12">
                <label className="form-label fw-medium text-dark">توضیحات</label>
                <textarea
                  name="description"
                  className="form-control bg-light border-0 custom-focus"
                  rows={4}
                  placeholder="توضیحات مربوط به این هوش مصنوعی را وارد کنید..."
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                ></textarea>
              </div>
            </div>

            <hr className="my-5 border-light" />

            {/* Actions */}
            <div className="d-flex justify-content-end gap-3">
              <Link
                to="/ai/list"
                className="btn btn-light px-4 py-2 rounded-3 fw-medium transition-all hover-scale"
              >
                انصراف
              </Link>
              <button
                type="submit"
                className="btn btn-gradient px-4 py-2 rounded-3 fw-medium d-flex align-items-center gap-2 border-0 shadow-sm transition-all hover-scale"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    ذخیره تغییرات
                  </>
                )}
              </button>
            </div>
          </form>
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
        
        .custom-focus:focus {
          box-shadow: 0 0 0 0.25rem rgba(155, 98, 255, 0.15);
          background-color: #fff !important;
        }
        
        /* Gradient Colors Based on Logo */
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
        
        .upload-box {
          border-color: #dee2e6 !important;
        }
        .upload-box:hover {
          border-color: #9b62ff !important;
          background-color: #fcfaff !important;
        }
        
        .hover-scale:hover {
          transform: translateY(-2px);
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AiEdit;
