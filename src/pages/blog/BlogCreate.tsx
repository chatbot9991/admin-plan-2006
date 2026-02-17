// src/pages/blog/BlogCreate.tsx

import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { toast } from "react-toastify"; // ⚠️ اطمینان حاصل کنید مسیر ایمپورت صحیح است

interface Category {
  _id: string;
  title: string;
}

const BlogCreate: React.FC = () => {
  const navigate = useNavigate();

  // --- States ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // داده‌های فرم (شروع با مقادیر خالی)
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    alt: "",
  });

  // مدیریت تصویر
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- دریافت دسته‌بندی‌ها ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const catResponse = await api.get("/blog-category/list");
        const resData = catResponse.data;
        
        let validCategories: Category[] = [];

        // منطق تشخیص هوشمند ساختار آرایه دسته‌بندی‌ها
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
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("خطا در دریافت دسته‌بندی‌ها");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
    
    // اعتبارسنجی ساده کلاینت
    if (!formData.categoryId) {
        toast.warning("لطفا یک دسته‌بندی انتخاب کنید");
        return;
    }

    setIsSubmitting(true);

    try {
      let finalImageId = "";

      // 1. آپلود عکس (اگر انتخاب شده باشد)
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        const uploadResponse = await api.post("/blog/image/upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadResponse.data) {
           finalImageId = uploadResponse.data.file || uploadResponse.data.url || uploadResponse.data;
        }
      }

      // 2. ارسال داده‌های ساخت بلاگ
      const payload = {
        ...formData, // title, shortDescription, description, categoryId, alt
        mainPic: finalImageId,
      };

      // ⚠️ نکته: آدرس ساخت معمولاً /add یا /create است. لطفا با بک‌ند چک کنید.
      await api.post("/blog/create", payload);

      toast.success("بلاگ با موفقیت ایجاد شد");
      navigate("/blog/list");

    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("خطا در ایجاد مقاله. لطفا مجددا تلاش کنید.");
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
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">ایجاد مقاله جدید</h3>
          <p className="text-muted small">
            اطلاعات مقاله جدید را وارد کنید
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
                  placeholder="عنوان جذاب برای مقاله..."
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
                  <option value="" disabled>انتخاب کنید...</option>
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
                  placeholder="چکیده‌ای از آنچه در این مقاله خواهید خواند..."
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
                  style={{ minHeight: "450px", fontSize: "1.05rem", lineHeight: "1.8" }}
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
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "20px" }}>
              
              <h5 className="fw-bold mb-3">تصویر شاخص</h5>
              
              {/* باکس آپلود عکس */}
              <div
                className="image-upload-box mb-3 rounded-4"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundImage: previewImage ? `url(${previewImage})` : 'none',
                }}
              >
                {!previewImage && (
                  <div className="text-center text-muted">
                    <i className="bi bi-cloud-arrow-up fs-1 d-block mb-2"></i>
                    <span>آپلود تصویر</span>
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

              {/* فیلد Alt Text */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary small">متن جایگزین (Alt Text)</label>
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
                {isSubmitting ? "در حال ایجاد..." : "انتشار مقاله"}
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
            box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.15); /* سبز برای ایجاد */
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
        .image-upload-box:hover { border-color: #198754; background-color: #f1f8f5; }
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

export default BlogCreate;
