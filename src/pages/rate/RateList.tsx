// src/pages/rate/RateList.tsx

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  RefreshCcw,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';

import { api } from '../../services/api';
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---
// توجه: چون در خروجی جیسون شما data خالی بود، فیلدهای احتمالی را قرار دادم.
// اگر نام فیلدها در بک‌ند فرق دارد، اینجا را اصلاح کنید.
interface Rate {
  _id: string;
  title: string;       // مثلا: دلار، یورو
  price: string | number;       // قیمت
  currency?: string;   // واحد پول (ریال/تومان)
  updatedAt: string;   // تاریخ آخرین بروزرسانی
}

interface ApiResponse {
  result: {
    data: Rate[];
    total: { count: number }[];
  }[];
}

const RateList: React.FC = () => {
  // --- States ---
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- Helpers ---
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('fa-IR').format(Number(price));
  };

  const formatDate = (isoString: string) => {
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

  // --- API Fetch ---
  const fetchRates = async () => {
    try {
      setLoading(true);
      
      // فقط پیج و لیمیت ارسال می‌شود (بدون فیلتر)
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const response = await api.get<ApiResponse>(`/rate/list?${params.toString()}`);

      // خواندن دیتا طبق ساختار: { result: [ { data: [], total: [] } ] }
      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setRates(resultData.data || []);
        
        const totalCount = resultData.total && resultData.total.length > 0 ? resultData.total[0].count : 0;
        setTotal(totalCount);
      } else {
        setRates([]);
        setTotal(0);
      }

    } catch (error) {
      console.error('Error fetching rates:', error);
      toast.error('خطا در دریافت لیست امتیاز‌ها');
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h3 className="fw-bolder text-dark mb-1 d-flex align-items-center gap-2">
            <TrendingUp className="text-primary" size={28} />
            مدیریت امتیاز‌ها
          </h3>
          <p className="text-muted small mb-0 ms-1">لیست لحظه‌ای قیمت‌ها</p>
        </div>
        
        <button
          onClick={fetchRates}
          className="btn btn-light rounded-pill p-2 shadow-sm border"
          title="بروزرسانی لیست"
        >
          <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
        </button>
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table modern-table mb-0">
            <thead className="bg-light">
              <tr>
                <th style={{ width: '10%', paddingLeft: '20px' }}>#</th>
                <th style={{ width: '30%' }}>عنوان امتیاز</th>
                <th className="text-center" style={{ width: '30%' }}>قیمت</th>
                <th className="text-center" style={{ width: '30%' }}>آخرین بروزرسانی</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center opacity-50">
                        <DollarSign size={48} className="mb-2" />
                        <span className="fw-bold">هیچ امتیازی یافت نشد!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rates.map((rate, index) => {
                  const { date, time } = formatDate(rate.updatedAt);
                  
                  return (
                    <tr key={rate._id || index} className="align-middle">
                      <td className="fw-bold text-secondary ps-4">
                        {(currentPage - 1) * limit + index + 1}
                      </td>

                      <td>
                          <span className="fw-bold text-dark fs-6">{rate.title || '---'}</span>
                      </td>

                      <td className="text-center">
                          <div className="d-inline-flex align-items-center gap-1 bg-primary-subtle text-primary px-3 py-1 rounded-pill fw-bold">
                              {formatPrice(rate.price)}
                              <small style={{ fontSize: '0.7rem' }}>
                                  {rate.currency || 'تومان'}
                              </small>
                          </div>
                      </td>

                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                          <Clock size={14} />
                          <span className="fw-medium">{date}</span>
                          <span className="small opacity-75">({time})</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="mt-4 d-flex justify-content-center">
          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Styles */}
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .modern-table { border-collapse: separate; border-spacing: 0; }
        .modern-table thead th { 
            border: none; 
            color: #64748b; 
            font-weight: 600; 
            font-size: 0.9rem; 
            padding: 18px 15px;
            background-color: #f8fafc;
        }
        .modern-table tbody tr { transition: all 0.2s ease; }
        .modern-table tbody tr:hover { background-color: #f8f9fa; }
        .modern-table td { border-bottom: 1px solid #f1f5f9; padding: 20px 15px; }
        .modern-table tbody tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default RateList;
