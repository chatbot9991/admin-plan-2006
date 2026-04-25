import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api'; // تنظیم مسیر درست بر اساس پروژه

interface AiOptionForm {
  id: string;
  name: string;
  image: string;
  aiId: string;
  field: string;
  inputPrice: number;
  outputPrice: number;
  cachePrice: number;
}

const AiOptionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // استیت برای پیش‌نمایش سریع عکس قبل/حین آپلود
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // استیت برای نگهداری لیست هوش‌های مصنوعی والد
  const [aiList, setAiList] = useState<any[]>([]);

  const [formData, setFormData] = useState<AiOptionForm>({
    id: id || '',
    name: '',
    image: '',
    aiId: '',
    field: 'chat',
    inputPrice: 0,
    outputPrice: 0,
    cachePrice: 0,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [detailsRes, aiListRes] = await Promise.all([
          api.get(`/ai-option/details?_id=${id}`),
          api.get('/ai/list'),
        ]);

        const aiItems =
          aiListRes.data?.result?.[0]?.data || aiListRes.data?.items || aiListRes.data || [];
        setAiList(Array.isArray(aiItems) ? aiItems : []);

        if (detailsRes.data && detailsRes.data.aiOption) {
          const data = detailsRes.data.aiOption;
          setFormData({
            id: data._id,
            name: data.name || '',
            image: data.image === 'string' ? '' : data.image || '',
            aiId: data.aiId?._id || '',
            field: data.field || 'chat',
            inputPrice: data.inputPrice || 0,
            outputPrice: data.outputPrice || 0,
            cachePrice: data.cachePrice || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('خطا در دریافت اطلاعات اولیه');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ایجاد پیش‌نمایش سریع محلی
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    const uploadData = new FormData();
    uploadData.append('file', file);

    setIsUploading(true);

    try {
      const res = await api.post('/ai-option/image/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedPath = res.data?.file || res.data?.path || res.data?.url || res.data;

      setFormData((prev) => ({
        ...prev,
        image: uploadedPath,
      }));
      toast.success('تصویر با موفقیت آپلود شد');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('خطا در آپلود تصویر. لطفا دوباره تلاش کنید.');
      setPreviewImage(null); // در صورت خطا، پیش‌نمایش لغو شود
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      toast.warning('تصویر نمی‌تواند خالی باشد. لطفا یک تصویر آپلود کنید.');
      return;
    }

    setIsSaving(true);

    try {
      const { name, ...submitData } = formData;
      await api.post('/ai-option/update', submitData);
      toast.success('آپشن هوش مصنوعی با موفقیت ویرایش شد');
      navigate(`/ai-option/list`);
    } catch (err) {
      console.error('Error updating AI Option:', err);
      toast.error('خطا در ذخیره‌سازی اطلاعات. لطفا مجددا تلاش کنید.');
    } finally {
      setIsSaving(false);
    }
  };

  // پاک کردن object URL هنگام Unmount برای جلوگیری از نشت حافظه (Memory Leak)
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // آماده‌سازی آدرس تصویر: اولویت با پیش‌نمایش محلی است، سپس تصویر ذخیره شده
  const serverImageUrl = formData.image 
    ? (formData.image.startsWith('http') ? formData.image : `/${formData.image}`)
    : 'none';
  const displayImageUrl = previewImage || (formData.image ? serverImageUrl : 'none');

  return (
    <>
      <style>
        {`
          .fade-in { animation: fadeIn 0.4s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .form-label { font-weight: 600; color: #495057; font-size: 0.9rem; margin-bottom: 8px; }
          
          .image-upload-box { 
            height: 250px; 
            border: 2px dashed #dee2e6; 
            background-color: #f8f9fa; 
            background-size: cover;
            background-position: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }
          .image-upload-box:hover {
            border-color: #0d6efd;
            background-color: #e9ecef;
          }
          .image-upload-box .overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
          }
          .image-upload-box:hover .overlay {
            opacity: 1;
          }
          .btn-animate {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .btn-animate:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
          }
        `}
      </style>

      <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1200px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1">ویرایش آپشن هوش مصنوعی</h3>
            <span className="text-muted">ویرایش: {formData.name}</span>
          </div>
          <Link
            to={`/ai-option/list`}
            className="btn btn-outline-secondary rounded-pill px-4"
          >
            بازگشت
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* فرم اصلی */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <h5 className="fw-bold mb-4 border-bottom pb-3 text-primary">اطلاعات اصلی</h5>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">نام آپشن (غیرقابل ویرایش)</label>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-light border-0"
                      name="name"
                      value={formData.name}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">هوش مصنوعی والد (aiId)</label>
                    <select
                      className="form-select form-select-lg bg-light border-0"
                      name="aiId"
                      value={formData.aiId}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        انتخاب کنید...
                      </option>
                      {aiList.map((ai) => (
                        <option key={ai._id} value={ai._id}>
                          {ai.name} {ai.model ? `(${ai.model})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">حوزه فعالیت (Field)</label>
                    <select
                      className="form-select form-select-lg bg-light border-0"
                      name="field"
                      value={formData.field}
                      onChange={handleChange}
                      required
                    >
                      <option value="voice-to-text">تبدیل صدا به متن (voice-to-text)</option>
                      <option value="text-to-speech">تبدیل متن به صدا (text-to-speech)</option>
                      <option value="image">تصویر (image)</option>
                      <option value="chat">چت (chat)</option>
                      <option value="code">کد (code)</option>
                    </select>
                  </div>
                </div>

                <h5 className="fw-bold mt-5 mb-4 border-bottom pb-3 text-primary">
                  هزینه‌ها (توکن)
                </h5>

                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label">قیمت ورودی (Input Price)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg bg-light border-0 text-center"
                      name="inputPrice"
                      value={formData.inputPrice}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">قیمت خروجی (Output Price)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg bg-light border-0 text-center"
                      name="outputPrice"
                      value={formData.outputPrice}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">قیمت کش (Cache Price)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg bg-light border-0 text-center"
                      name="cachePrice"
                      value={formData.cachePrice}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* سایدبار تصویر و ذخیره */}
            <div className="col-lg-4">
              <div
                className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
                style={{ top: '20px' }}
              >
                <h5 className="fw-bold mb-4 border-bottom pb-3">تصویر شاخص</h5>

                <div 
                  className="image-upload-box mb-4 rounded-4 d-flex flex-column align-items-center justify-content-center"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  style={{ backgroundImage: displayImageUrl !== 'none' ? `url(${displayImageUrl})` : 'none' }}
                >
                  {isUploading ? (
                    <div className="text-center text-white p-3 rounded" style={{ zIndex: 2, background: 'rgba(0,0,0,0.6)' }}>
                      <div className="spinner-border mb-2" role="status"></div>
                      <div className="fw-bold">در حال آپلود...</div>
                    </div>
                  ) : displayImageUrl !== 'none' ? (
                    <div className="overlay rounded-4">
                      <span><i className="bi bi-camera me-2"></i>تغییر عکس</span>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-cloud-arrow-up fs-1 d-block mb-2"></i>
                      <span className="fw-semibold">آپلود تصویر</span>
                    </div>
                  )}

                  <input
                    type="file"
                    className="d-none"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2 btn-animate"
                  disabled={isSaving || isUploading}
                >
                  {isSaving ? (
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
                      <i className="bi bi-check-circle"></i>
                      ذخیره تغییرات
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AiOptionEdit;
