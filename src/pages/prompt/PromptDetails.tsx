// src/pages/prompt/PromptDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Bot, 
  ArrowLeft, // فلش بازگشت
  Edit2, 
  Copy, 
  Hash, 
  Calendar, 
  Layers, 
  FileText,
  User,
  CheckCircle2,
  Terminal
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const IMAGE_BASE_URL = `${API_BASE_URL}/api/v1/portal/upload/download?file=`;

interface PromptData {
  _id: string;
  name: string;
  personalityName: string;
  promptType: 'personal' | 'image';
  description: string;
  prompt: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const PromptDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // فرمت تاریخ
  const formatDate = (isoString?: string) => {
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
    const fetchPromptDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/prompt/details?_id=${id}`);
        const data = response.data?.prompt || response.data;
        if (data) setPrompt(data);
      } catch (error) {
        console.error(error);
        toast.error('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPromptDetails();
  }, [id]);

  const handleCopyPrompt = () => {
    if (prompt?.prompt) {
      navigator.clipboard.writeText(prompt.prompt);
      toast.success('کپی شد!');
    }
  };

  if (loading) return <div className="d-flex justify-content-center pt-5"><div className="spinner-border text-primary"></div></div>;
  if (!prompt) return <div className="text-center pt-5">پرامپت یافت نشد</div>;

  const imageSrc = prompt.image 
    ? (prompt.image.startsWith('http') ? prompt.image : `${IMAGE_BASE_URL}${prompt.image}`)
    : null;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* --- Header Buttons (Exactly like screenshot) --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* دکمه سبز سمت چپ (در فایل LTR سمت چپ است، در RTL سمت راست دیده می‌شود اگر Direction درست باشد. طبق عکس شما دکمه ویرایش سبز سمت چپ است) */}
        {/* طبق عکس: دکمه ویرایش سبز سمت چپ، دکمه بازگشت سفید سمت راست */}
        
        <Link 
          to={`/prompt/edit/${prompt._id}`}
          className="btn btn-success text-white rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
        >
          <Edit2 size={18} />
          <span>ویرایش اطلاعات</span>
        </Link>

        <button 
          onClick={() => navigate('/prompt/list')}
          className="btn btn-white bg-white border rounded-pill px-4 py-2 d-flex align-items-center gap-2 text-secondary shadow-sm hover-elevate"
        >
          <span>بازگشت به لیست</span>
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* --- Main Top Card --- */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        {/* نوار آبی بالا */}
        <div className="w-100 bg-primary" style={{ height: '4px' }}></div>
        
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
            
            {/* Left Side: Name & Subtitle */}
            <div className="text-center text-md-start order-2 order-md-1 flex-grow-1">
              <h2 className="fw-bolder text-dark mb-2">{prompt.name}</h2>
              <div className="text-muted mb-3 d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <span className="dir-ltr text-secondary fs-5">{prompt.personalityName || 'No Personality'}</span>
                <span className="text-muted">@</span>
              </div>
              <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 border border-success-subtle d-inline-flex align-items-center gap-1">
                <CheckCircle2 size={14} />
                فعال
              </span>
            </div>

            {/* Right Side: Avatar */}
            <div className="order-1 order-md-2 ms-md-4">
              <div 
                className="rounded-circle bg-primary-subtle d-flex justify-content-center align-items-center text-primary"
                style={{ width: '100px', height: '100px', fontSize: '2rem' }}
              >
                {imageSrc ? (
                  <img src={imageSrc} alt="" className="w-100 h-100 rounded-circle object-fit-cover" />
                ) : (
                  <User size={40} />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* --- Left Column: System Info (Dates/IDs) --- */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0" style={{ color: '#0f172a' }}>
                <Hash size={18} className="text-primary" />
                اطلاعات سیستمی
              </h6>
            </div>
            <div className="card-body p-4">
              
              {/* Item 1 */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-3 text-muted"><Hash size={18} /></div>
                  <span className="text-muted small">شناسه یکتا (ID)</span>
                </div>
                <span className="fw-medium text-dark dir-ltr font-monospace small">{prompt._id}</span>
              </div>

              {/* Item 2 */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-3 text-muted"><Calendar size={18} /></div>
                  <span className="text-muted small">تاریخ ثبت در سیستم</span>
                </div>
                <span className="fw-medium text-dark dir-rtl">{formatDate(prompt.createdAt)}</span>
              </div>

            </div>
          </div>
        </div>

        {/* --- Right Column: Prompt Specifics (Like Contact Info in image) --- */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                <Layers size={18} className="text-primary" />
                اطلاعات تکمیلی
              </h6>
            </div>
            <div className="card-body p-4">
              
              {/* Item 1 */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-3 text-muted"><FileText size={18} /></div>
                  <span className="text-muted small">نوع پرامپت</span>
                </div>
                <span className={`badge px-3 py-2 rounded-3 ${prompt.promptType === 'image' ? 'bg-purple-subtle text-purple' : 'bg-blue-subtle text-blue'}`}>
                  {prompt.promptType === 'image' ? 'تصویری' : 'شخصی'}
                </span>
              </div>

              {/* Item 2 */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded-3 text-muted"><Bot size={18} /></div>
                  <span className="text-muted small">شخصیت (Personality)</span>
                </div>
                <span className="fw-medium text-dark">{prompt.personalityName}</span>
              </div>

            </div>
          </div>
        </div>

        {/* --- Bottom Row: The Prompt Content (Essential for this entity) --- */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
             <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                <Terminal size={18} className="text-primary" />
                متن پرامپت
              </h6>
              <button onClick={handleCopyPrompt} className="btn btn-sm btn-light text-primary rounded-3 px-3 d-flex align-items-center gap-2">
                <Copy size={14} />
                <span>کپی</span>
              </button>
            </div>
            <div className="card-body p-4">
               {prompt.description && (
                 <div className="alert alert-light border-0 text-secondary mb-3 d-flex align-items-center gap-2 small">
                    <CheckCircle2 size={16} className="text-success" />
                    {prompt.description}
                 </div>
               )}
               <div className="bg-dark rounded-4 p-4 position-relative overflow-hidden dir-ltr text-start">
                  <pre className="text-light m-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace', fontSize: '14px', lineHeight: '1.7' }}>
                    {prompt.prompt}
                  </pre>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-blue-subtle { background-color: #eff6ff !important; }
        .text-blue { color: #3b82f6 !important; }
        .bg-purple-subtle { background-color: #faf5ff !important; }
        .text-purple { color: #a855f7 !important; }
        .hover-elevate:hover { transform: translateY(-2px); transition: transform 0.2s; }
        .dir-ltr { direction: ltr; }
        .dir-rtl { direction: rtl; }
      `}</style>
    </div>
  );
};

export default PromptDetails;
