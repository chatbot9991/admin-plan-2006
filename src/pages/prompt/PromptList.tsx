// src/pages/prompt/PromptList.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Eye,
  RefreshCcw,
  Edit,
  Image as ImageIcon
} from 'lucide-react';

import { api } from '../../services/api';
import Pagination from '../../components/common/Pagination';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Interfaces ---
interface PromptData {
  _id: string;
  name: string;
  personalityName: string;
  promptType: string;
  image: string;
  description: string;
  prompt: string;
  createdAt: string;
}

interface ApiResponse {
  result: {
    data: PromptData[];
    total: { count: number }[];
  }[];
}

const PromptList: React.FC = () => {
  // --- States for Data ---
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const FILE_BASE_URL = `${API_BASE_URL}/api/v1/portal/ticket/image/download?imageFile=`;


  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- Helpers ---
  const formatDate = (isoString?: string) => {
    if (!isoString) return { date: '-', time: '-' };
    try {
      const dateObj = new Date(isoString);
      return {
        date: dateObj.toLocaleDateString('fa-IR'),
        time: dateObj.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

  // --- Core API Fetch Function ---
  const fetchPrompts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      // صفحه‌بندی
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const response = await api.get<ApiResponse>(`/prompt/list?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setPrompts(resultData.data || []);

        const totalCount = resultData.total && resultData.total.length > 0 ? resultData.total[0].count : 0;
        setTotal(totalCount);
      } else {
        const fallbackData = (response.data as any).data || [];
        const fallbackTotal = (response.data as any).total || 0;
        setPrompts(fallbackData);
        setTotal(fallbackTotal);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('خطا در دریافت لیست پرامپت‌ها');
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت پرامپت‌ها</h3>
          <p className="text-muted small mb-0">لیست تمامی پرامپت‌های سیستمی و هوش مصنوعی</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/prompt/create" className="btn-shine-effect">
            <span className="mx-2 fs-5">+</span> ایجاد پرامپت جدید
          </Link>
          <button
            onClick={fetchPrompts}
            className="btn btn-light rounded-pill p-2 shadow-sm border"
            title="بروزرسانی لیست"
          >
            <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: 'visible' }}>
        <table className="table modern-table">
          <thead>
            <tr>
              <th style={{ width: '5%', borderRadius: '0 15px 15px 0' }}>#</th>
              <th style={{ width: '25%' }}>نام و تصویر</th>
              <th style={{ width: '20%' }}>شخصیت (Personality)</th>
              <th className="text-center" style={{ width: '15%' }}>نوع پرامپت</th>
              <th className="text-center" style={{ width: '15%' }}>تاریخ ایجاد</th>
              <th className="text-center" style={{ width: '20%', borderRadius: '15px 0 0 15px' }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                </td>
              </tr>
            ) : prompts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted fw-bold">
                  هیچ پرامپتی یافت نشد!
                </td>
              </tr>
            ) : (
              prompts.map((prompt, index) => {
                const { date, time } = formatDate(prompt.createdAt);

                return (
                  <tr key={prompt._id} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {prompt.image ? (
                          <img
                            src={FILE_BASE_URL + prompt.image}
                            alt={prompt.name}
                            className="rounded-circle object-fit-cover shadow-sm border"
                            style={{ width: '45px', height: '45px' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('fallback-icon');
                            }}
                          />
                        ) : (
                          <div className="bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '45px', height: '45px' }}>
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-dark mb-1 text-truncate" style={{ maxWidth: '200px' }} title={prompt.name}>
                            {prompt.name || '-'}
                          </span>
                          <span className="text-muted small text-truncate" style={{ maxWidth: '200px' }} title={prompt.description}>
                            {prompt.description || 'بدون توضیحات'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="fw-medium text-dark">
                        {prompt.personalityName || '-'}
                      </span>
                    </td>

                    <td className="text-center">
                      <span className="badge bg-light text-secondary border rounded-pill fw-normal px-3 py-2">
                        {prompt.promptType || 'نامشخص'}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{date}</span>
                        <span className="text-muted small">{time}</span>
                      </div>
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Link
                          to={`/prompt/details/${prompt._id}`}
                          className="btn-action btn-soft-info"
                          title="مشاهده جزئیات"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/prompt/edit/${prompt._id}`}
                          className="btn-action btn-soft-primary"
                          title="ویرایش"
                        >
                          <Edit size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-4 d-flex justify-content-center w-100 pb-4">
          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Create Button Shine Effect */
        .btn-shine-effect { background: linear-gradient(45deg, #099773, #20c997); color: white; padding: 8px 20px; border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(32, 201, 151, 0.4); transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; font-weight: 600; }
        .btn-shine-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(32, 201, 151, 0.6); color: white; }

        /* Action Buttons - EXACT MATCH WITH AdminList / BlogList */
        .btn-action { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-info { background-color: #e3f2fd; color: #0dcaf0; }
        .btn-soft-info:hover { background-color: #0dcaf0; color: white; }
        .btn-soft-primary { background-color: #e7f5ff; color: #4dabf7; }
        .btn-soft-primary:hover { background-color: #4dabf7; color: white; }

        /* Modern Table Style */
        .modern-table { border-collapse: separate; border-spacing: 0 15px; }
        .modern-table thead th { border: none; background: transparent; color: #8898aa; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding-bottom: 10px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border-radius: 16px; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-5px) scale(1.005); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); z-index: 2; position: relative; }
        .modern-table td { border: none; padding: 20px 15px; }

        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default PromptList;
