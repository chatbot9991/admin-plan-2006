import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

// --- تنظیمات پایه ---
const BASE_URL = 'https://dev.backend.mobo.land/api/v1/portal/blog/image/download?imageFile=';

interface Category {
  _id: string;
  title: string;
  description: string;
  status: string;
  version: number;
}

interface BlogData {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  mainPic: string;
  alt: string;
  categoryId: Category;
  status: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  anotherPics: string[];
  version: number;
}

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // فرمت تاریخ
  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/blog/details?_id=${id}`);
        if (response.data && response.data.blog) {
          setBlog(response.data.blog);
        }
      } catch (error) {
        console.error('Error fetching blog details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center mt-5">
        <h3>بلاگ یافت نشد!</h3>
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/blog/list')}>
          بازگشت به لیست
        </button>
      </div>
    );
  }

  const mainImageSrc = blog.mainPic.startsWith('http')
    ? blog.mainPic
    : `${BASE_URL}${blog.mainPic}`;
  const isActive = blog.status === 'active';

  return (
    <div
      className="container-fluid p-4 fade-in"
      style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}
    >
      {/* --- دکمه‌های هدر --- */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 d-flex justify-content-between align-items-center">
          {/* دکمه بازگشت + عنوان */}
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-light border d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-secondary hover-dark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span>بازگشت</span>
            </button>
            <div className="d-none d-md-block border-start ps-3 ms-2">
              <h5 className="mb-0 fw-bold text-dark">جزئیات بلاگ</h5>
            </div>
          </div>

          {/* دکمه ویرایش */}
          <Link
            to={`/blog/edit/${blog._id}`}
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>ویرایش این پست</span>
          </Link>
        </div>
      </div>
      {/* --- پایان هدر --- */}

      <div className="row g-4">
        {/* --- ستون اصلی (محتوا) --- */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            {/* تصویر شاخص */}
            <div className="position-relative bg-light" style={{ minHeight: '300px' }}>
              <img
                src={mainImageSrc}
                alt={blog.alt}
                className="w-100 h-100 object-fit-cover"
                style={{ maxHeight: '450px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x400?text=No+Image';
                }}
              />
              <div className="position-absolute top-0 start-0 m-3">
                <span
                  className={`badge rounded-pill px-3 py-2 shadow-sm ${isActive ? 'bg-success' : 'bg-warning text-dark'}`}
                >
                  {isActive ? 'منتشر شده' : 'پیش‌نویس'}
                </span>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <h1 className="fw-bold text-dark mb-4">{blog.title}</h1>

              <div className="bg-light p-3 rounded-3 border-start border-4 border-primary mb-4">
                <p className="text-secondary fs-5 mb-0">{blog.shortDescription}</p>
              </div>

              <div className="blog-content mt-5">
                <div dangerouslySetInnerHTML={{ __html: blog.description }} />
              </div>

              {/* گالری تصاویر */}
              {blog.anotherPics && blog.anotherPics.length > 0 && (
                <div className="mt-5 pt-4 border-top">
                  <h5 className="mb-3 fw-bold">سایر تصاویر</h5>
                  <div className="row g-2">
                    {blog.anotherPics.map((pic, idx) => (
                      <div key={idx} className="col-4 col-md-3">
                        <img
                          src={pic.startsWith('http') ? pic : `${BASE_URL}${pic}`}
                          className="img-thumbnail rounded-3 w-100"
                          alt={`gallery-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- ستون کناری (اطلاعات) --- */}
        <div className="col-lg-4">
          {/* کارت دسته‌بندی */}
          <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
              <h6 className="text-muted fw-bold mb-3 fs-7">دسته‌بندی</h6>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary-subtle p-3 rounded-3 text-primary">
                  {/* آیکون اصلاح شده */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{blog.categoryId?.title}</h6>
                  <small className="text-muted">{blog.categoryId?.description}</small>
                </div>
              </div>
            </div>
          </div>

          {/* کارت اطلاعات متا */}
          <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
              <h6 className="text-muted fw-bold mb-3 fs-7">جزئیات انتشار</h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">تاریخ انتشار</span>
                  <span className="fw-medium">{formatDate(blog.publishDate)}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">آخرین بروزرسانی</span>
                  <span className="fw-medium">{formatDate(blog.updatedAt)}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">نسخه</span>
                  <span className="badge bg-secondary" style={{ margin: '4px' }}>
                    {blog.version}
                  </span>
                </li>
                <li className="list-group-item px-0 pt-3">
                  <span className="text-muted d-block mb-1">تگ Alt تصویر</span>
                  <div className="bg-light p-2 rounded text-muted small">{blog.alt}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-dark:hover { background-color: #e2e8f0 !important; color: #000 !important; }
        .object-fit-cover { object-fit: cover; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0; }
        .blog-content { line-height: 1.8; color: #334155; }
        .fs-7 { font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase; }
      `}</style>
    </div>
  );
};

export default BlogDetails;
