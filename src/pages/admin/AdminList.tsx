// src/pages/admin/AdminList.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  RefreshCcw,
  Edit,
  RotateCw,
  KeyRound,
  Lock,
} from 'lucide-react';

import { api } from '../../services/api';
import Pagination from '../../components/common/Pagination';

// --- Interfaces ---

interface Admin {
  _id: string;
  email: string;
  mobile: string;
  adminName: string;
  family: string;
  status: string; // "active" | "inactive" | "deactive"
  role: string;
  createdAt: number; // در JSON ارسالی به صورت Timestamp است
  updatedAt: number;
  version?: number;
}

interface ApiResponse {
  result: {
    data: Admin[];
    total: { count: number }[];
  }[];
}

const AdminList: React.FC = () => {
  // --- States for Data ---
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // --- Modals State ---
  
  // 1. Status Change Modal
  const [statusTarget, setStatusTarget] = useState<{
    id: string;
    status: string;
    fullName: string;
  } | null>(null);

  // 2. Password Change Modal
  const [passwordTarget, setPasswordTarget] = useState<{
    id: string;
    fullName: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // --- Helpers ---
  // تبدیل Timestamp (عدد) به تاریخ و زمان شمسی
  const formatDate = (timestamp: number) => {
    if (!timestamp) return { date: '-', time: '-' };
    try {
      const dateObj = new Date(timestamp);
      return {
        date: dateObj.toLocaleDateString('fa-IR'),
        time: dateObj.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-pill px-3 py-2">مدیر کل</span>;
      case 'admin':
        return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-3 py-2">ادمین</span>;
      case '_': // بر اساس خروجی دیتای شما
        return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-3 py-2">تعریف نشده</span>;
      default:
        return <span className="badge bg-dark bg-opacity-10 text-dark border border-dark rounded-pill px-3 py-2">{role}</span>;
    }
  };

  // --- Core API Fetch Function ---
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const response = await api.get<ApiResponse>(`/admin/list?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const resultData = response.data.result[0];
        setAdmins(resultData.data || []);
        const totalCount =
          resultData.total && resultData.total.length > 0 ? resultData.total[0].count : 0;
        setTotal(totalCount);
      } else {
        setAdmins([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('خطا در دریافت لیست ادمین‌ها');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  // Status Logic
  const openStatusModal = (admin: Admin) => {
    setStatusTarget({ 
      id: admin._id, 
      status: admin.status, 
      fullName: `${admin.adminName} ${admin.family}`.trim() 
    });
  };

  const closeStatusModal = () => {
    setStatusTarget(null);
  };

  const confirmStatusChange = async () => {
    if (!statusTarget) return;
    setIsProcessing(true);
    try {
      const newStatus = statusTarget.status === 'active' ? 'deactive' : 'active';
      await api.put(`/admin/changeStatus`, { "adminId": statusTarget.id, status: newStatus });

      setAdmins((prev) =>
        prev.map((a) => (a._id === statusTarget.id ? { ...a, status: newStatus } : a))
      );

      toast.success('وضعیت ادمین تغییر کرد');
      closeStatusModal();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تغییر وضعیت');
    } finally {
      setIsProcessing(false);
    }
  };

  // Password Logic
  const openPasswordModal = (admin: Admin) => {
    setPasswordTarget({ 
      id: admin._id, 
      fullName: `${admin.adminName} ${admin.family}`.trim() 
    });
    setNewPassword('');
  };

  const closePasswordModal = () => {
    setPasswordTarget(null);
    setNewPassword('');
  };

  const confirmPasswordChange = async () => {
    if (!passwordTarget || !newPassword) {
      toast.warn('لطفا رمز عبور جدید را وارد کنید');
      return;
    }
    if (newPassword.length < 6) {
      toast.warn('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    setIsProcessing(true);
    try {
      await api.put(`/admin/password/update`, { "_id": passwordTarget.id, password: newPassword });
      toast.success('رمز عبور با موفقیت تغییر کرد');
      closePasswordModal();
    } catch (error) {
      console.error(error);
      toast.error('خطا در تغییر رمز عبور');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Render ---
  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      
      {/* 1. Modal تغییر وضعیت */}
      {statusTarget && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box bg-warning-subtle">
              <RotateCw className="text-warning" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">تغییر وضعیت ادمین</h4>
            <p className="text-muted text-center mt-2 mb-4 px-3">
              وضعیت حساب کاربری <strong>"{statusTarget.fullName}"</strong> به
              <span
                className={`fw-bold mx-1 ${statusTarget.status === 'active' ? 'text-danger' : 'text-success'}`}
              >
                {statusTarget.status === 'active' ? 'غیرفعال' : 'فعال'}
              </span>
              تغییر کند؟
            </p>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                className="btn btn-light flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={closeStatusModal}
                disabled={isProcessing}
              >
                انصراف
              </button>
              <button
                className="btn btn-warning text-white flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={confirmStatusChange}
                disabled={isProcessing}
              >
                {isProcessing ? '...' : 'بله، تغییر بده'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal تغییر رمز عبور */}
      {passwordTarget && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="modal-icon-box bg-purple-subtle">
              <Lock className="text-purple" size={32} />
            </div>
            <h4 className="fw-bold text-dark mt-3">تغییر رمز عبور</h4>
            <p className="text-muted text-center mt-1 mb-3 px-3">
              رمز عبور جدید برای <strong>"{passwordTarget.fullName}"</strong> وارد کنید.
            </p>
            
            <div className="w-100 mb-4">
              <input 
                type="text" 
                className="form-control text-center rounded-pill bg-light border-0 py-3 font-monospace shadow-sm"
                placeholder="رمز عبور جدید..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
              />
            </div>

            <div className="d-flex gap-2 w-100 justify-content-center">
              <button
                className="btn btn-light flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={closePasswordModal}
                disabled={isProcessing}
              >
                انصراف
              </button>
              <button
                className="btn btn-purple text-white flex-grow-1 py-2 rounded-pill fw-bold"
                onClick={confirmPasswordChange}
                disabled={isProcessing}
              >
                {isProcessing ? '...' : 'تایید تغییر رمز'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت ادمین‌ها</h3>
          <p className="text-muted small mb-0">لیست مدیران سیستم و تنظیمات دسترسی</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/blog/create" className="btn-shine-effect">
            <span className="mx-2 fs-5">+</span> ثبت ادمین جدید
          </Link>
          <button
            onClick={fetchAdmins}
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
              <th style={{ width: '25%' }}>مشخصات کاربری</th>
              <th className="text-center" style={{ width: '10%' }}>نقش</th>
              <th className="text-center" style={{ width: '15%' }}>شماره تماس</th>
              <th className="text-center" style={{ width: '15%' }}>
                تاریخ ایجاد
              </th>
              <th className="text-center" style={{ width: '10%' }}>
                وضعیت
              </th>
              <th className="text-center" style={{ width: '20%', borderRadius: '15px 0 0 15px' }}>
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">در حال دریافت اطلاعات...</p>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted fw-bold">
                  هیچ ادمینی یافت نشد!
                </td>
              </tr>
            ) : (
              admins.map((admin, index) => {
                const { date, time } = formatDate(admin.createdAt);
                const isActive = admin.status === 'active';
                const fullName = `${admin.adminName || ''} ${admin.family || ''}`.trim();

                return (
                  <tr key={admin._id} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark mb-1">
                          {fullName || 'بدون نام'}
                        </span>
                        <span className="text-muted small" dir="ltr" style={{ textAlign: 'right' }}>
                          {admin.email || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="text-center">
                      {getRoleBadge(admin.role)}
                    </td>

                    <td className="text-center">
                      <span className="text-dark fw-bold font-monospace" style={{ letterSpacing: '1px' }}>
                        {admin.mobile || '-'}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{date}</span>
                        <span className="text-muted small">{time}</span>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
                        <span className="dot"></span>
                        {isActive ? 'فعال' : 'غیرفعال'}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        
                        <Link
                          to={`/admin/edit/${admin._id}`}
                          className="btn-action btn-soft-primary"
                          title="ویرایش"
                        >
                          <Edit size={18} />
                        </Link>

                        <button
                          className="btn-action btn-soft-purple"
                          title="تغییر رمز عبور"
                          onClick={() => openPasswordModal(admin)}
                        >
                          <KeyRound size={18} />
                        </button>

                        <button
                          className="btn-action btn-soft-warning"
                          title="تغییر وضعیت"
                          onClick={() => openStatusModal(admin)}
                        >
                          <RotateCw size={18} />
                        </button>
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
        <div className="d-flex justify-content-center w-100 pb-4">
          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* CSS Styles - Exact match with BlogList + Extra Modal Theme */}
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Modal Styles */
        .custom-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .custom-modal-content { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .modal-icon-box { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .bg-warning-subtle { background-color: #fff3cd; }
        .bg-purple-subtle { background-color: #f3e8ff; }
        .text-purple { color: #9333ea; }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* Button Styles */
        .btn-shine-effect { background: linear-gradient(45deg, #099773, #20c997); color: white; padding: 8px 20px; border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(32, 201, 151, 0.4); transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; font-weight: 600; }
        .btn-shine-effect:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(32, 201, 151, 0.6); color: white; }
        
        .btn-purple { background-color: #9333ea; border: none; transition: all 0.2s; }
        .btn-purple:hover { background-color: #7e22ce; transform: translateY(-1px); }

        /* Table Styles */
        .modern-table { border-collapse: separate; border-spacing: 0 15px; }
        .modern-table thead th { border: none; background: transparent; color: #8898aa; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding-bottom: 10px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border-radius: 16px; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-5px) scale(1.005); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); z-index: 2; position: relative; }
        .modern-table td { border: none; padding: 20px 15px; }

        /* Pills & Status */
        .status-pill { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-pill.active { background-color: #e6fffa; color: #20c997; }
        .status-pill.inactive { background-color: #f1f3f5; color: #868e96; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background-color: currentColor; margin-left: 6px; }

        /* Action Buttons */
        .btn-action { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-info { background-color: #e3f2fd; color: #0dcaf0; }
        .btn-soft-info:hover { background-color: #0dcaf0; color: white; }
        .btn-soft-primary { background-color: #e7f5ff; color: #4dabf7; }
        .btn-soft-primary:hover { background-color: #4dabf7; color: white; }
        .btn-soft-warning { background-color: #fff3cd; color: #ffc107; }
        .btn-soft-warning:hover { background-color: #ffc107; color: white; }
        
        /* Purple Action Button for Password */
        .btn-soft-purple { background-color: #f3e8ff; color: #9333ea; }
        .btn-soft-purple:hover { background-color: #9333ea; color: white; }
      `}</style>
    </div>
  );
};

export default AdminList;
