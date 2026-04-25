import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, Save, ImagePlus, X, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

const AiCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // وضعیت فیلدها
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    description2: '',
  });

  // وضعیت تصویر
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی ساده کلاینت
    if (!formData.name.trim()) {
      toast.warning('وارد کردن نام سرویس هوش مصنوعی الزامی است');
      return;
    }

    setIsLoading(true);
    try {
      let finalImageId = '';

      // 1. آپلود عکس (اگر انتخاب شده باشد)
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const uploadResponse = await api.post('/ai/image/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadResponse.data) {
          finalImageId = uploadResponse.data.file || uploadResponse.data.url || uploadResponse.data;
        }
      }

      // 2. ساخت هوش مصنوعی
      const payload = {
        name: formData.name,
        description: formData.description,
        description2: formData.description2,
        image: finalImageId, // نام یا آدرس تصویر که از مرحله قبل گرفتیم
      };

      await api.post('/ai/create', payload);

      toast.success('هوش مصنوعی با موفقیت ایجاد شد');
      navigate('/ai/list');
    } catch (error: any) {
      console.error('Create AI Error:', error);
      const errorMsg =
        error.response?.data?.message || 'خطا در ایجاد هوش مصنوعی. لطفا مجددا تلاش کنید.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
              <Sparkles size={22} className="text-gradient" />
              ایجاد هوش مصنوعی جدید
            </h4>
            <p className="text-muted mb-0 font-14">
              افزودن یک سرویس AI جدید به سیستم با تنظیمات دلخواه
            </p>
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
                  disabled={isLoading}
                />
              </div>

              {/* Image Upload */}
              <div className="col-lg-6">
                <label className="form-label fw-medium text-dark">لوگو یا تصویر سرویس</label>
                <div
                  className="upload-box bg-light border border-2 border-dashed rounded-4 p-3 text-center position-relative transition-all d-flex align-items-center justify-content-center"
                  style={{ minHeight: '120px' }}
                >
                  {imagePreview ? (
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
                          برای آپلود تصویر کلیک کنید
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description 1 */}
              <div className="col-lg-12">
                <label className="form-label fw-medium text-dark">توضیحات کوتاه</label>
                <textarea
                  name="description"
                  className="form-control bg-light border-0 custom-focus"
                  rows={3}
                  placeholder="توضیحات مختصری درباره قابلیت‌های این هوش مصنوعی..."
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                ></textarea>
              </div>

              {/* Description 2 */}
              <div className="col-lg-12">
                <label className="form-label fw-medium text-dark">توضیحات تکمیلی</label>
                <textarea
                  name="description2"
                  className="form-control bg-light border-0 custom-focus"
                  rows={4}
                  placeholder="جزئیات بیشتر، راهنما یا نکات مهم (اختیاری)..."
                  value={formData.description2}
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
                    در حال ساخت...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    ایجاد هوش مصنوعی
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
          background-color: #f8f5ff !important;
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

export default AiCreate;
