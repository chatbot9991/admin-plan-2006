// src/pages/notify/NotifyCreate.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';

// ایمپورت کامپوننت جدید
import UserSelectorModal, { type User } from '../../components/UserSelectorModal';

const NotifyCreate: React.FC = () => {
  const navigate = useNavigate();

  // --- Form States ---
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    data: '',
  });

  const [sendToAll, setSendToAll] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Modal State ---
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSendToAll(e.target.checked);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!formData.title.trim()) return toast.warning('لطفا موضوع اعلان را وارد کنید');
    if (!formData.body.trim()) return toast.warning('لطفا توضیحات اعلان را وارد کنید');
    if (!sendToAll && selectedUsers.length === 0) {
      return toast.warning('لطفا گیرندگان را انتخاب کنید یا گزینه ارسال به همه را فعال کنید');
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        data: formData.data,
        user: {
          all: sendToAll,
          ids: sendToAll ? [] : selectedUsers.map((u) => u._id),
        },
      };

      await api.post('/notify/send', payload);

      toast.success('اعلان با موفقیت ایجاد و ارسال شد');
      navigate('/notifications/list');
    } catch (error) {
      console.error('Error sending notify:', error);
      toast.error('خطا در ارسال اعلان');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark mb-0">ایجاد اعلان</h3>
        <Link
          to="/notify/list"
          className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2"
        >
          <ArrowRight size={18} /> بازگشت
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        {/* Row 1: Subject */}
        <div className="mb-4">
          <label className="form-label text-muted mb-2">موضوع</label>
          <input
            type="text"
            name="title"
            className="form-control form-control-lg bg-light border-0"
            placeholder="موضوع را وارد کنید"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        {/* Row 2: Description & Data */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label text-muted mb-2">توضیحات</label>
            <textarea
              name="body"
              className="form-control bg-light border-0"
              placeholder="توضیحات را وارد کنید"
              rows={4}
              style={{ resize: 'none' }}
              value={formData.body}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="col-md-6">
            <label className="form-label text-muted mb-2">اطلاعات (Data)</label>
            <textarea
              name="data"
              className="form-control bg-light border-0"
              placeholder="اطلاعات را وارد کنید"
              rows={4}
              style={{ resize: 'none' }}
              value={formData.data}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>

        {/* Row 3: Send to All Toggle */}
        <div className="d-flex align-items-center justify-content-end mb-4 gap-3 border-bottom pb-4">
          <div className="form-check form-switch d-flex align-items-center gap-2 dir-rtl">
            <label className="form-check-label fw-bold text-dark order-1" htmlFor="sendToAllSwitch">
              ارسال به همه کاربران
            </label>
            <input
              className="form-check-input order-2"
              type="checkbox"
              role="switch"
              id="sendToAllSwitch"
              style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
              checked={sendToAll}
              onChange={handleToggleChange}
            />
          </div>
        </div>

        {/* Row 4: User Selection Section */}
        {!sendToAll && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">کاربران انتخاب شده</h5>
              <button
                className="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm d-flex align-items-center gap-2"
                onClick={() => setIsUserModalOpen(true)}
                style={{ backgroundColor: '#556ee6', borderColor: '#556ee6' }}
              >
                <Plus size={18} /> افزودن کاربر
              </button>
            </div>

            {/* Selected Users Table */}
            <div className="table-responsive border rounded-3">
              <table className="table text-center align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 text-secondary border-bottom">ردیف</th>
                    <th className="py-3 text-secondary border-bottom">نام کاربری</th>
                    <th className="py-3 text-secondary border-bottom">نام و نام خانوادگی</th>
                    <th className="py-3 text-secondary border-bottom">ایمیل</th>
                    <th className="py-3 text-secondary border-bottom">عملیات ها</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-5">
                        <h6 className="text-muted fw-bold mb-0">موردی برای نمایش وجود ندارد!</h6>
                      </td>
                    </tr>
                  ) : (
                    selectedUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td className="fw-bold text-dark dir-ltr">{user.username}</td>
                        <td>
                          {user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`
                            : '-'}
                        </td>
                        <td className="dir-ltr text-muted">{user.email || '-'}</td>
                        <td>
                          <button
                            onClick={() => removeUser(user._id)}
                            className="btn btn-sm text-danger hover-bg-danger rounded-circle p-2"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer: Submit Button */}
        <div className="mt-4 pt-3 border-top">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn text-white py-2 px-4 rounded-3 fw-bold shadow-sm d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#34c38f',
              borderColor: '#34c38f',
              minWidth: '140px',
              justifyContent: 'center',
            }}
          >
            {isSubmitting ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              'ایجاد اعلان'
            )}
          </button>
        </div>
      </div>

      {/* --- Reusable User Selector Modal --- */}
      <UserSelectorModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onConfirm={(users) => setSelectedUsers(users)}
        initialSelectedUsers={selectedUsers}
        multiSelect={true}
        title="افزودن گیرندگان"
      />

      <style>{`
        .dir-rtl { direction: rtl; }
        .dir-ltr { direction: ltr; }
        .hover-bg-danger:hover { background-color: rgba(220, 53, 69, 0.1); }
      `}</style>
    </div>
  );
};

export default NotifyCreate;
