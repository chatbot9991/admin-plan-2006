// src/pages/prompt/PromptCreate.tsx

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Bot, 
  ArrowRight, 
  Save, 
  Type, 
  UserCircle, 
  Tags, 
  AlignLeft, 
  TerminalSquare,
  UploadCloud
} from 'lucide-react';

const PromptCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استیت فرم
  const [formData, setFormData] = useState({
    name: '',
    personalityName: '',
    promptType: 'personal', 
    description: '',
    prompt: ''
  });

  // مدیریت آپلود تصویر
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageId = '';

      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const uploadResponse = await api.post('/prompt/image/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadResponse.data) {
          finalImageId = uploadResponse.data.file || uploadResponse.data.url || uploadResponse.data;
        }
      }

      const payload = {
        ...formData,
        image: finalImageId,
      };

      await api.post('/prompt/create', payload);
      toast.success('پرامپت با موفقیت ایجاد شد');
      navigate('/prompt/list');
    } catch (error: any) {
      console.error('Error creating prompt:', error);
      const errorMessage = error.response?.data?.message || 'خطا در ثبت پرامپت. لطفا مجددا تلاش کنید.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-4 p-md-5 fade-in" style={{ maxWidth: '1400px' }}>
      
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-2 d-flex align-items-center gap-3">
            <div className="icon-wrapper bg-primary text-white d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '50px', height: '50px' }}>
              <Bot size={26} />
            </div>
            ایجاد پرامپت جدید
          </h2>
          <p className="text-muted mb-0 ms-5 ps-2">مشخصات، شخصیت و دستورات هوش مصنوعی را در این بخش تعریف کنید.</p>
        </div>
        <Link to="/prompt/list" className="btn btn-white border shadow-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 back-btn">
          <ArrowRight size={18} className="text-secondary" />
          <span className="text-secondary fw-bold">بازگشت به لیست</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          
          {/* ستون اصلی (فرم‌ها) */}
          <div className="col-lg-8">
            <div className="card border-0 custom-card rounded-4 p-4 p-md-5 bg-white position-relative overflow-hidden mb-4">
              <div className="position-absolute top-0 start-0 w-100 bg-primary" style={{ height: '4px' }}></div>

              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <Type size={18} className="text-primary" />
                    نام (Name)
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control custom-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="مثال: دستیار برنامه‌نویسی"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <UserCircle size={18} className="text-primary" />
                    نام شخصیت (Personality Name)
                  </label>
                  <input
                    type="text"
                    name="personalityName"
                    className="form-control custom-input"
                    value={formData.personalityName}
                    onChange={handleInputChange}
                    required
                    placeholder="مثال: مهندس نرم‌افزار ارشد"
                  />
                </div>
              </div>

              <div className="row g-4 mb-4">
                {/* نوع پرامپت - استایل‌ها اصلاح شد و مقادیر فارسی شدند */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <Tags size={18} className="text-primary" />
                    نوع (Prompt Type)
                  </label>
                  <select
                    name="promptType"
                    className="form-select custom-input custom-select"
                    value={formData.promptType}
                    onChange={handleInputChange}
                    required
                  >
                    {/* مقادیر ارسالی انگلیسی، اما نمایش به کاربر فارسی است */}
                    <option value="personal">شخصی</option>
                    <option value="image">تصویری</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <AlignLeft size={18} className="text-primary" />
                    توضیحات (Description)
                  </label>
                  <textarea
                    name="description"
                    className="form-control custom-input"
                    rows={1}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="توضیح مختصری درباره کاربرد..."
                  />
                </div>
              </div>

              <div className="row g-4">
                 <div className="col-12">
                  <label className="form-label fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                    <TerminalSquare size={18} className="text-primary" />
                    متن پرامپت (Prompt Content)
                  </label>
                  <textarea
                    name="prompt"
                    className="form-control custom-input text-start font-monospace"
                    dir="auto"
                    rows={10}
                    value={formData.prompt}
                    onChange={handleInputChange}
                    required
                    placeholder="You are a helpful assistant..."
                    style={{ resize: 'vertical' }}
                  />
                  <div className="form-text text-muted mt-2">
                    دستورات اصلی که به هوش مصنوعی داده می‌شود را به صورت دقیق اینجا بنویسید.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ستون کناری (عکس و دکمه ثبت) */}
          <div className="col-lg-4">
            <div className="card border-0 custom-card rounded-4 p-4 sticky-top" style={{ top: '20px' }}>
              <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                تصویر آواتار (اختیاری)
              </h5>

              <div
                className="image-upload-box mb-4 rounded-4"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundImage: previewImage ? `url(${previewImage})` : 'none',
                }}
              >
                {!previewImage && (
                  <div className="text-center text-muted d-flex flex-column align-items-center">
                    <UploadCloud size={48} className="mb-2 text-primary opacity-75" />
                    <span className="fw-medium">کلیک کنید تا تصویر آپلود شود</span>
                  </div>
                )}
                {previewImage && (
                  <div className="overlay rounded-4">
                    <span className="text-white fw-bold">تغییر عکس</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <hr className="my-4 text-muted opacity-25" />

              <button
                type="submit"
                className="btn btn-submit w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
                disabled={isSubmitting}
              >
                <Save size={20} />
                {isSubmitting ? 'در حال ایجاد...' : 'ایجاد پرامپت'}
              </button>

              <Link to="/prompt/list" className="btn btn-light w-100 py-3 mt-3 rounded-pill fw-bold text-secondary action-btn">
                انصراف و بازگشت
              </Link>
            </div>
          </div>

        </div>
      </form>

      {/* --- Styles --- */}
      <style>{`
        /* Animations */
        .fade-in { animation: fadeInUp 0.4s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Card */
        .custom-card {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Inputs */
        .custom-input {
          background-color: #f8f9fc !important;
          border: 2px solid transparent !important;
          border-radius: 14px;
          padding: 14px 20px;
          font-size: 1rem;
          color: #333;
          transition: all 0.3s ease;
        }
        .custom-input::placeholder { color: #adb5bd; font-size: 0.9rem; }
        
        .custom-input:focus {
          background-color: #ffffff !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
        }

        /* Custom Select for RTL */
        select.custom-select {
          cursor: pointer;
          background-position: left 1rem center !important; /* آیکون فلش در سمت چپ */
          padding-left: 2.5rem !important; /* ایجاد فضا برای فلش در سمت چپ */
          padding-right: 1.25rem !important; /* فاصله عادی متن از راست */
          appearance: none; /* حذف استایل پیش‌فرض مرورگر */
        }

        /* Image Upload Box */
        .image-upload-box {
          height: 250px;
          background-color: #f8f9fa;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          border: 2px dashed #dee2e6;
          transition: all 0.3s ease;
        }
        .image-upload-box:hover { 
          border-color: #3b82f6; 
          background-color: #eff6ff; 
        }
        .image-upload-box .overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
        }
        .image-upload-box:hover .overlay { opacity: 1; }

        /* Buttons */
        .back-btn { transition: all 0.2s ease; }
        .back-btn:hover { background-color: #f8f9fa; transform: translateX(-3px); }

        .action-btn { transition: all 0.2s ease; }
        .action-btn:hover { background-color: #e2e6ea; }

        .btn-submit {
          background: linear-gradient(45deg, #10b981, #059669) !important;
          border: none;
          color: #ffffff !important;
          transition: all 0.3s ease;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
        }
        .btn-submit:disabled {
          background: #6c757d !important;
          box-shadow: none !important;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PromptCreate;
