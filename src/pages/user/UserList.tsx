// src/pages/user/UserList.tsx

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Search,
  Eye,
  Edit,
  Power,
  PackagePlus,
  PackageMinus,
  Smartphone,
  Wallet,
  ShieldAlert, // آیکون محدودیت
  KeyRound,
  Layers,
} from 'lucide-react';

import { api } from '../../services/api';
import Filter from '../../components/common/Filter';
import Pagination from '../../components/common/Pagination';

// Import Modals
import UserStatusModal from '../../components/modals/UserStatusModal';
import UserPasswordModal from '../../components/modals/UserPasswordModal';
import UserWalletModal from '../../components/modals/UserWalletModal';
import UserPlanModal from '../../components/modals/UserPlanModal';
import UserUnsetPlanModal from '../../components/modals/UserUnsetPlanModal';
import RequestUpdateModal from '../../components/modals/RequestUpdateModal';
import UpdateAllUsersModal from '../../components/modals/UpdateAllUsersModal';
import UserLimitModal from '../../components/modals/UserLimitModal'; // <-- ایمپورت مودال محدودیت

// --- Interfaces ---

interface User {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  status?: string | boolean;
  createdAt?: string;
  plan?: { _id: string; name?: string } | null;
  planId?: string;
  limit?: boolean; // فیلد محدودیت
  numberOfUserOnline?: number; // فیلد تعداد آنلاین
}

interface ApiResponse {
  result: {
    data: User[];
    total: { count: number }[];
  }[];
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // فیلترها
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempMobile, setTempMobile] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ name: '', email: '', mobile: '' });
  const [showFilters, setShowFilters] = useState(true);

  // --- Modal States ---
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalState, setModalState] = useState<{
    status: boolean;
    password: boolean;
    wallet: boolean;
    plan: boolean;
    unsetPlan: boolean;
    requestUpdate: boolean;
    updateAll: boolean;
    limitModal: boolean; // <-- اضافه شدن استیت مودال محدودیت
  }>({
    status: false,
    password: false,
    wallet: false,
    plan: false,
    unsetPlan: false,
    requestUpdate: false,
    updateAll: false,
    limitModal: false, // <-- مقدار اولیه
  });

  // --- دریافت لیست کاربران ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const where: any = {};
      if (appliedFilters.name) where.name = appliedFilters.name;
      if (appliedFilters.email) where.email = appliedFilters.email;
      if (appliedFilters.mobile) where.mobile = appliedFilters.mobile;

      if (Object.keys(where).length > 0) {
        const filterJson = JSON.stringify({ where });
        params.append('filter', filterJson);
      }

      const response = await api.get<ApiResponse>(`/user/list?${params.toString()}`);

      if (response.data && response.data.result && response.data.result.length > 0) {
        const aggResult = response.data.result[0];
        setUsers(aggResult.data || []);
        setTotal(aggResult.total && aggResult.total.length > 0 ? aggResult.total[0].count : 0);
      } else {
        setUsers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({ name: tempName, email: tempEmail, mobile: tempMobile });
  };

  const handleResetFilters = () => {
    setTempName('');
    setTempEmail('');
    setTempMobile('');
    setCurrentPage(1);
    setAppliedFilters({ name: '', email: '', mobile: '' });
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  // --- Modal Handlers ---

  const openModal = (
    type:
      | 'status'
      | 'password'
      | 'wallet'
      | 'plan'
      | 'unsetPlan'
      | 'requestUpdate'
      | 'updateAll'
      | 'limitModal',
    user: User
  ) => {
    setSelectedUser(user);
    setModalState((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = () => {
    setModalState({
      status: false,
      password: false,
      wallet: false,
      plan: false,
      unsetPlan: false,
      requestUpdate: false,
      updateAll: false,
      limitModal: false,
    });
    setSelectedUser(null);
  };

  const handleModalSuccess = () => {
    fetchUsers();
  };

  return (
    <div className="container-fluid p-4 fade-in position-relative" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bolder text-dark mb-1">مدیریت کاربران</h3>
          <p className="text-muted small mb-0">مشاهده و مدیریت کاربران سیستم</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={fetchUsers}
            className="btn btn-light rounded-3 p-2 shadow-sm border d-flex align-items-center justify-content-center"
            style={{ width: '42px', height: '42px' }}
          >
            <RefreshCcw size={20} className={loading ? 'spin-anim' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{ overflow: 'visible', zIndex: 10 }}
      >
        <div
          className="card-header bg-white border-0 p-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="d-flex align-items-center gap-2 text-primary fw-bold">
            <FilterIcon size={20} /> <span>جستجو و فیلتر</span>
          </div>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        <div className={`collapse ${showFilters ? 'show' : ''}`}>
          <div className="card-body bg-light border-top p-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="نام"
                  placeholder="جستجو..."
                  value={tempName}
                  onChange={setTempName}
                />
              </div>
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="ایمیل"
                  placeholder="ایمیل..."
                  value={tempEmail}
                  onChange={setTempEmail}
                />
              </div>
              <div className="col-12 col-md-3">
                <Filter
                  type="text"
                  label="موبایل"
                  placeholder="0912..."
                  value={tempMobile}
                  onChange={setTempMobile}
                />
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleApplyFilters}
                  style={{ height: '48px', borderRadius: '12px' }}
                >
                  <Search size={18} /> <span>اعمال فیلتر</span>
                </button>
                {(tempName || tempEmail || tempMobile) && (
                  <button
                    className="btn btn-danger-soft w-75 px-3"
                    onClick={handleResetFilters}
                    style={{ height: '48px', borderRadius: '12px' }}
                  >
                    حذف فیلتر
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="table modern-table" style={{ minWidth: '1150px' }}>
          <thead>
            <tr>
              <th style={{ width: '5%', borderRadius: '0 15px 15px 0' }}>#</th>
              <th style={{ width: '22%' }}>مشخصات کاربر</th>
              <th className="text-center" style={{ width: '18%' }}>
                ایمیل
              </th>
              <th className="text-center" style={{ width: '12%' }}>
                موبایل
              </th>
              <th className="text-center" style={{ width: '8%' }}>
                وضعیت
              </th>
              <th className="text-center" style={{ width: '35%', borderRadius: '15px 0 0 15px' }}>
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted fw-bold">
                  کاربری یافت نشد!
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                const displayName =
                  user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`
                    : user.username || 'نامشخص';
                return (
                  <tr key={user._id || index} className="align-middle">
                    <td className="fw-bold text-secondary ps-3">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{displayName}</span>
                        <code
                          className="text-primary bg-primary-subtle px-2 py-1 rounded mt-1"
                          style={{ width: 'fit-content', fontSize: '11px' }}
                        >
                          {user._id}
                        </code>
                      </div>
                    </td>
                    <td className="text-center text-muted dir-ltr">{user.email || '-'}</td>
                    <td className="text-center fw-medium dir-ltr">{user.mobile || '-'}</td>
                    <td className="text-center">
                      <span
                        className={`badge rounded-pill px-3 py-2 border ${user.status === 'active' || user.status === true ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
                      >
                        {user.status === 'active' || user.status === true ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Link
                          to={`/user/details/${user._id}`}
                          className="btn-action btn-soft-info"
                          title="مشاهده"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/user/edit/${user._id}`}
                          className="btn-action btn-soft-warning"
                          title="ویرایش"
                        >
                          <Edit size={18} />
                        </Link>

                        <button
                          onClick={() => openModal('status', user)}
                          className="btn-action btn-soft-secondary"
                          title="تغییر وضعیت"
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => openModal('plan', user)}
                          className="btn-action btn-soft-info"
                          title="تخصیص پلن"
                        >
                          <PackagePlus size={18} />
                        </button>
                        <button
                          onClick={() => openModal('unsetPlan', user)}
                          className="btn-action btn-soft-danger"
                          title="حذف پلن"
                        >
                          <PackageMinus size={18} />
                        </button>
                        <button
                          onClick={() => openModal('wallet', user)}
                          className="btn-action btn-soft-success"
                          title="کیف پول"
                        >
                          <Wallet size={18} />
                        </button>

                        {/* دکمه مودال محدودیت‌ها که حالا به درستی وصل شده است */}
                        <button
                          onClick={() => openModal('limitModal', user)}
                          className="btn-action btn-soft-warning"
                          title="محدودیت‌ها"
                        >
                          <ShieldAlert size={18} />
                        </button>

                        <button
                          onClick={() => openModal('password', user)}
                          className="btn-action btn-soft-dark"
                          title="تغییر رمز"
                        >
                          <KeyRound size={18} />
                        </button>

                        <button
                          onClick={() => openModal('requestUpdate', user)}
                          className="btn-action btn-soft-info"
                          title="آپدیت کلاینت"
                        >
                          <Smartphone size={18} />
                        </button>
                        <button
                          onClick={() => openModal('updateAll', user)}
                          className="btn-action btn-soft-purple"
                          title="آپدیت تمام نسخه‌های کاربر"
                        >
                          <Layers size={18} />
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
        <div className="mt-4 d-flex justify-content-center">
          <Pagination
            totalItems={total}
            pageSize={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modals Injection */}
      {selectedUser && (
        <>
          <UserStatusModal
            isOpen={modalState.status}
            onClose={closeModal}
            userId={selectedUser._id}
            currentStatus={selectedUser.status}
            onSuccess={handleModalSuccess}
          />
          <UserPasswordModal
            isOpen={modalState.password}
            onClose={closeModal}
            userId={selectedUser._id}
            onSuccess={handleModalSuccess}
          />
          <UserWalletModal
            isOpen={modalState.wallet}
            onClose={closeModal}
            userId={selectedUser._id}
            onSuccess={handleModalSuccess}
          />
          <UserPlanModal
            isOpen={modalState.plan}
            onClose={closeModal}
            userId={selectedUser._id}
            currentPlanId={selectedUser.plan?._id || selectedUser.planId}
            onSuccess={handleModalSuccess}
          />
          <UserUnsetPlanModal
            isOpen={modalState.unsetPlan}
            onClose={closeModal}
            user={selectedUser}
            onSuccess={handleModalSuccess}
          />
          <RequestUpdateModal
            isOpen={modalState.requestUpdate}
            onClose={closeModal}
            user={selectedUser}
            onSuccess={handleModalSuccess}
          />
          <UpdateAllUsersModal
            isOpen={modalState.updateAll}
            onClose={closeModal}
            user={selectedUser}
            onSuccess={handleModalSuccess}
          />

          {/* تزریق مودال محدودیت‌ها */}
          <UserLimitModal
            isOpen={modalState.limitModal}
            onClose={closeModal}
            user={selectedUser}
            onSuccess={handleModalSuccess}
          />
        </>
      )}

      {/* Global Styles */}
      <style>{`
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .cursor-pointer { cursor: pointer; }
        .dir-ltr { direction: ltr; }
        .btn-danger-soft { background-color: #fff5f5; color: #ef4444; border: 1px solid #fee2e2; transition: all 0.2s; }
        .btn-danger-soft:hover { background-color: #fee2e2; color: #b91c1c; }
        .modern-table { border-collapse: separate; border-spacing: 0 15px; }
        .modern-table thead th { border: none; background: transparent; color: #8898aa; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding-bottom: 10px; }
        .modern-table tbody tr { background-color: #ffffff; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; border-radius: 16px; }
        .modern-table tbody tr td:first-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
        .modern-table tbody tr td:last-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
        .modern-table tbody tr:hover { transform: translateY(-5px) scale(1.005); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); z-index: 2; position: relative; }
        .modern-table td { border: none; padding: 15px 10px; }
        .btn-action { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; transition: all 0.2s; cursor: pointer; }
        .btn-soft-primary { background-color: #e7f5ff; color: #3b82f6; } .btn-soft-primary:hover { background-color: #3b82f6; color: white; }
        .btn-soft-warning { background-color: #fff8e1; color: #f59e0b; } .btn-soft-warning:hover { background-color: #f59e0b; color: white; }
        .btn-soft-secondary { background-color: #f1f5f9; color: #64748b; } .btn-soft-secondary:hover { background-color: #64748b; color: white; }
        .btn-soft-info { background-color: #cffafe; color: #06b6d4; } .btn-soft-info:hover { background-color: #06b6d4; color: white; }
        .btn-soft-danger { background-color: #fee2e2; color: #ef4444; } .btn-soft-danger:hover { background-color: #ef4444; color: white; }
        .btn-soft-success { background-color: #d1fae5; color: #10b981; } .btn-soft-success:hover { background-color: #10b981; color: white; }
        .btn-soft-dark { background-color: #e2e8f0; color: #334155; } .btn-soft-dark:hover { background-color: #334155; color: white; }
        .btn-soft-purple { background-color: #f3e8ff; color: #a855f7; } .btn-soft-purple:hover { background-color: #a855f7; color: white; }
      `}</style>
    </div>
  );
};

export default UserList;
