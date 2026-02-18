// src/pages/blog/BlogEdit.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify'; // ⚠️ مسیر ایمپورت تست را طبق پروژه خود تنظیم کنید

interface Category {
  _id: string;
  title: string;
}

const BlogEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- States ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // داده‌های فرم
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    alt: '', // فیلد متن جایگزین
  });

  // مدیریت تصویر
  const [currentImage, setCurrentImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- دریافت اطلاعات اولیه ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. دریافت لیست دسته‌بندی‌ها
        const catResponse = await api.get('/blog-category/list');
        const resData = catResponse.data;

        let validCategories: Category[] = [];

        // منطق تشخیص ساختار آرایه دسته‌بندی‌ها
        if (resData && Array.isArray(resData.blogCategories)) {
          validCategories = resData.blogCategories;
        } else if (Array.isArray(resData)) {
          validCategories = resData;
        } else if (resData && Array.isArray(resData.list)) {
          validCategories = resData.list;
        } else if (resData && Array.isArray(resData.categories)) {
          validCategories = resData.categories;
        }

        setCategories(validCategories);

        // 2. دریافت جزئیات بلاگ
        if (id) {
          const blogResponse = await api.get(`/blog/details?_id=${id}`);
          const blogData = blogResponse.data.blog || blogResponse.data;

          if (blogData) {
            // استخراج ID دسته‌بندی
            const catIdRaw = blogData.categoryId;
            const finalCatId =
              typeof catIdRaw === 'object' && catIdRaw !== null ? catIdRaw._id : catIdRaw;

            setFormData({
              title: blogData.title || '',
              shortDescription: blogData.shortDescription || '',
              description: blogData.description || '',
              categoryId: finalCatId || '',
              alt: blogData.alt || '',
            });

            setCurrentImage(blogData.mainPic || '');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('خطا در دریافت اطلاعات اولیه');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- هندلرها ---

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      let finalImageId = currentImage;

      // آپلود عکس جدید در صورت وجود
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const uploadResponse = await api.post('/blog/image/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadResponse.data) {
          finalImageId = uploadResponse.data.file || uploadResponse.data.url || uploadResponse.data;
        }
      }

      // ساخت پی‌لود نهایی
      const payload = {
        _id: id,
        ...formData, // شامل title, shortDescription, description, categoryId, alt
        mainPic: finalImageId,
      };

      await api.put('/blog/update', payload);

      // ✅ استفاده از Toast به جای Alert
      toast.success('بلاگ با موفقیت ویرایش شد');

      navigate('/blog/list');
    } catch (error) {
      console.error('Error updating blog:', error);
      // ❌ استفاده از Toast برای خطا
      toast.error('خطا در ذخیره‌سازی اطلاعات. لطفا مجددا تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">ویرایش مقاله</h3>
          <p className="text-muted small">
            ویرایش: <span className="text-primary fw-bold">{formData.title}</span>
          </p>
        </div>
        <Link to="/blog/list" className="btn btn-outline-secondary rounded-pill px-4">
          بازگشت
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* ستون اصلی (فرم‌ها) */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              {/* ردیف اول: عنوان */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">عنوان مقاله</label>
                <input
                  type="text"
                  name="title"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* ردیف دوم: دسته‌بندی */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">دسته‌بندی</label>
                <select
                  name="categoryId"
                  className="form-select bg-light border-0 py-3"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    انتخاب کنید...
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <div className="text-danger small mt-1">دسته‌بندی‌ها یافت نشدند.</div>
                )}
              </div>

              {/* ردیف سوم: توضیحات کوتاه */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary">خلاصه (توضیحات کوتاه)</label>
                <textarea
                  name="shortDescription"
                  className="form-control bg-light border-0"
                  rows={3}
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* ردیف چهارم: متن اصلی (بزرگ) */}
              <div className="mb-2">
                <label className="form-label fw-bold text-dark fs-5">
                  <i className="bi bi-file-text me-2"></i>
                  متن کامل مقاله
                </label>
                <textarea
                  name="description"
                  className="form-control bg-light border-0 editor-textarea"
                  style={{
                    minHeight: '450px',
                    fontSize: '1.05rem',
                    lineHeight: '1.8',
                  }}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="متن اصلی مقاله خود را اینجا بنویسید..."
                ></textarea>
                <div className="form-text text-end mt-1">
                  تعداد کاراکتر: {formData.description.length}
                </div>
              </div>
            </div>
          </div>

          {/* ستون کناری (عکس و Alt) */}
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
              style={{ top: '20px' }}
            >
              <h5 className="fw-bold mb-3">تصویر شاخص</h5>

              {/* باکس آپلود عکس */}
              <div
                className="image-upload-box mb-3 rounded-4"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundImage: `url(${previewImage || currentImage})`,
                }}
              >
                {!previewImage && !currentImage && (
                  <div className="text-center text-muted">
                    <i className="bi bi-image fs-1 d-block mb-2"></i>
                    <span>آپلود تصویر</span>
                  </div>
                )}
                <div className="overlay rounded-4">
                  <span className="text-white fw-bold">تغییر عکس</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* فیلد Alt Text */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary small">
                  متن جایگزین (Alt Text)
                </label>
                <input
                  type="text"
                  name="alt"
                  className="form-control bg-light border-0"
                  value={formData.alt}
                  onChange={handleInputChange}
                  placeholder="توضیح کوتاه تصویر برای سئو"
                />
              </div>

              <hr className="my-4 text-muted opacity-25" />

              <button
                type="submit"
                className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow-lg btn-animate"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .editor-textarea:focus {
            background-color: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
            border: 1px solid #dee2e6 !important;
        }

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
          transition: all 0.3s;
        }
        .image-upload-box:hover { border-color: #0d6efd; }
        .image-upload-box .overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
        }
        .image-upload-box:hover .overlay { opacity: 1; }

        .btn-animate { transition: transform 0.2s; }
        .btn-animate:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default BlogEdit;
