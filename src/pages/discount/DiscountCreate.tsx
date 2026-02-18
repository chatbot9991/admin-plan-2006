// src/pages/discount/DiscountCreate.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Plus, Layers, Users, Tag, Check, X, Trash2 } from 'lucide-react';

// Date Picker
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css';

import { api } from '../../services/api';
import PlanSelectorModal, { type Plan } from '../../components/PlanSelectorModal';
import UserSelectorModal, { type User } from '../../components/UserSelectorModal';

const DiscountCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- Form States ---
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');

  // Dates
  const [startDate, setStartDate] = useState<DateObject | null>(
    new DateObject({ calendar: persian, locale: persian_fa })
  );
  const [endDate, setEndDate] = useState<DateObject | null>(null);

  // Toggles
  const [specificPlanMode, setSpecificPlanMode] = useState(false);
  const [specificUserMode, setSpecificUserMode] = useState(false);

  // Selections
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return toast.warning('لطفا عنوان تخفیف را وارد کنید');
    if (!amount) return toast.warning('لطفا مقدار تخفیف را وارد کنید');
    if (!startDate || !endDate) return toast.warning('لطفا بازه زمانی را مشخص کنید');

    if (specificPlanMode && !selectedPlan) {
      toast.warning('لطفا پلن مورد نظر را انتخاب کنید');
      return;
    }

    if (specificUserMode && selectedUsers.length === 0) {
      toast.warning('لطفا کاربران مورد نظر را انتخاب کنید');
      return;
    }

    setLoading(true);

    try {
      const start = startDate.toDate().toISOString().split('T')[0];
      const end = endDate.toDate().toISOString().split('T')[0];

      const payload = {
        title,
        amount: amount,
        type,
        startDate: start,
        endDate: end,
        plan: specificPlanMode ? selectedPlan?._id : null,
        users: specificUserMode ? selectedUsers.map((u) => u._id) : [],
      };

      await api.post('/discount/create', payload);
      toast.success('تخفیف با موفقیت ایجاد شد');
      navigate('/discount/list');
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error('خطا در ایجاد تخفیف');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  return (
    <div className="container-fluid p-4 fade-in" style={{ maxWidth: '1400px' }}>
      {/* --- Modals --- */}
      <PlanSelectorModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onConfirm={(plan) => setSelectedPlan(plan)}
        selectedPlanId={selectedPlan?._id}
      />

      <UserSelectorModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onConfirm={(users) => {
          const newUsers = users.filter(
            (newU) => !selectedUsers.some((existU) => existU._id === newU._id)
          );
          setSelectedUsers([...selectedUsers, ...newUsers]);
        }}
        initialSelectedUsers={selectedUsers}
        multiSelect={true}
        title="افزودن کاربر به لیست"
      />

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* --- Left Column: Preview Card --- */}
          <div className="col-lg-4 order-lg-last">
            <div
              className="preview-card p-4 rounded-4 shadow-lg sticky-top position-relative overflow-hidden"
              style={{ top: '20px', minHeight: '420px' }}
            >
              {/* Background Circles */}
              <div className="bg-circle-1"></div>
              <div className="bg-circle-2"></div>

              <div className="position-relative z-index-2 text-center text-white mb-4 mt-3">
                <div
                  className="icon-box bg-white text-primary rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{ width: '70px', height: '70px' }}
                >
                  <Tag size={32} />
                </div>
                <h3 className="fw-bolder mb-2 text-shadow">{title || 'عنوان تخفیف'}</h3>
                <p className="text-white small opacity-75">پیش‌نمایش کارت تخفیف شما</p>
              </div>

              {/* Details Box */}
              <div className="position-relative z-index-2 details-box bg-white bg-opacity-10 rounded-4 p-4 mb-4 backdrop-blur border border-white border-opacity-25">
                <div className="d-flex justify-content-between mb-3 border-bottom border-white border-opacity-25 pb-2">
                  <span className="text-white fw-light small">مقدار تخفیف:</span>
                  <span className="fw-bolder fs-4 text-white text-shadow">
                    {amount ? Number(amount).toLocaleString() : '---'}
                    <small className="fs-6 ms-1 fw-light">
                      {type === 'percentage' ? '%' : 'تومان'}
                    </small>
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white fw-light small">شروع:</span>
                  <span className="fw-bold dir-rtl small text-white">
                    {startDate?.format('YYYY/MM/DD') || '---'}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-white fw-light small">پایان:</span>
                  <span className="fw-bold dir-rtl small text-white">
                    {endDate?.format('YYYY/MM/DD') || '---'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-white-glass w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 hover-scale position-relative z-index-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm text-primary" />
                ) : (
                  <Check size={22} strokeWidth={3} className="text-primary" />
                )}
                <span className="text-primary">انتشار نهایی تخفیف</span>
              </button>
            </div>
          </div>

          {/* --- Right Column: Form --- */}
          <div className="col-lg-8 order-lg-first">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              {/* Title & Amount */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-secondary fw-bold small ms-1">
                    عنوان تخفیف
                  </label>
                  <input
                    type="text"
                    className="form-control custom-input fw-bold"
                    placeholder="مثلا: تخفیف نوروزی"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary fw-bold small ms-1">
                    مقدار و نوع
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      type="number"
                      className="form-control custom-input fw-bold"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <div
                      className="d-flex bg-light rounded-3 p-1 border border-light"
                      style={{ height: '48px' }}
                    >
                      <button
                        type="button"
                        className={`btn rounded-3 fw-bold px-3 transition-all d-flex align-items-center gap-1 ${type === 'percentage' ? 'btn-percent-active' : 'text-muted'}`}
                        onClick={() => setType('percentage')}
                        style={{ minWidth: '90px', justifyContent: 'center' }}
                      >
                        <span>%</span> درصد
                      </button>
                      <button
                        type="button"
                        className={`btn rounded-3 fw-bold px-3 transition-all d-flex align-items-center gap-1 ${type === 'fixed' ? 'btn-amount-active' : 'text-muted'}`}
                        onClick={() => setType('fixed')}
                        style={{ minWidth: '90px', justifyContent: 'center' }}
                      >
                        <span>$</span> مبلغ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Date Picker (Fixed Alignment) --- */}
              <div className="row g-4 mb-5 position-relative">
                {/* Start Date */}
                <div className="col-md-6" style={{ zIndex: 1002, position: 'relative' }}>
                  <label className="form-label text-secondary fw-bold small ms-1">تاریخ شروع</label>
                  <div className="custom-input-group d-flex align-items-center rounded-3 px-3">
                    <CalendarIcon size={18} className="text-muted ms-2" />
                    <div className="flex-grow-1 h-100">
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={startDate}
                        onChange={setStartDate}
                        minDate={new DateObject({ calendar: persian, locale: persian_fa })}
                        inputClass="custom-date-input"
                        placeholder="انتخاب تاریخ"
                        containerStyle={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* End Date */}
                <div className="col-md-6" style={{ zIndex: 1001, position: 'relative' }}>
                  <label className="form-label text-secondary fw-bold small ms-1">
                    تاریخ پایان
                  </label>
                  <div className="custom-input-group d-flex align-items-center rounded-3 px-3">
                    <CalendarIcon size={18} className="text-muted ms-2" />
                    <div className="flex-grow-1 h-100">
                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={endDate}
                        onChange={setEndDate}
                        minDate={
                          startDate || new DateObject({ calendar: persian, locale: persian_fa })
                        }
                        inputClass="custom-date-input"
                        placeholder="انتخاب تاریخ"
                        containerStyle={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-5 border-light" />

              {/* --- Plan Section --- */}
              <div className="mb-5 position-relative" style={{ zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-info bg-opacity-10 text-info rounded-3">
                      <Layers size={22} />
                    </div>
                    <h5 className="fw-bold text-dark mb-0">محدودیت اشتراک</h5>
                  </div>

                  <div className="form-check form-switch d-flex align-items-center gap-2 dir-rtl">
                    <label
                      className="form-check-label fw-bold text-muted cursor-pointer"
                      htmlFor="planSwitch"
                    >
                      انتخاب اشتراک خاص
                    </label>
                    <input
                      className="form-check-input custom-toggle shadow-sm"
                      type="checkbox"
                      id="planSwitch"
                      checked={specificPlanMode}
                      onChange={(e) => {
                        setSpecificPlanMode(e.target.checked);
                        if (!e.target.checked) setSelectedPlan(null);
                      }}
                      style={{ width: '3.2em', height: '1.6em' }}
                    />
                  </div>
                </div>

                <div
                  className={`p-4 rounded-4 transition-all ${specificPlanMode ? 'bg-cyan-soft border border-info border-opacity-25' : 'bg-light opacity-50'}`}
                >
                  {specificPlanMode ? (
                    selectedPlan ? (
                      <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border border-info-subtle animate-fade-in">
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                            <Layers size={24} />
                          </div>
                          <div>
                            <h6 className="fw-bold text-dark mb-0">{selectedPlan.name}</h6>
                            <small className="text-muted">پلن انتخابی</small>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-light text-danger hover-bg-danger rounded-circle p-2 transition-all"
                          onClick={() => setSelectedPlan(null)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="dashed-btn w-100 py-4 fw-bold text-info d-flex flex-column align-items-center justify-content-center gap-2 bg-white rounded-4"
                        onClick={() => setShowPlanModal(true)}
                      >
                        <div className="icon-circle bg-info bg-opacity-10 mb-1">
                          <Plus size={24} />
                        </div>
                        انتخاب اشتراک
                      </button>
                    )
                  ) : (
                    <div className="text-center text-muted py-2">
                      <small>کد تخفیف روی تمام پلن‌ها اعمال خواهد شد.</small>
                    </div>
                  )}
                </div>
              </div>

              {/* --- User Section --- */}
              <div className="position-relative" style={{ zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                      <Users size={22} />
                    </div>
                    <h5 className="fw-bold text-dark mb-0">کاربران هدف</h5>
                  </div>

                  <div className="form-check form-switch d-flex align-items-center gap-2 dir-rtl">
                    <label
                      className="form-check-label fw-bold text-muted cursor-pointer"
                      htmlFor="userSwitch"
                    >
                      انتخاب کاربران خاص
                    </label>
                    <input
                      className="form-check-input custom-toggle shadow-sm"
                      type="checkbox"
                      id="userSwitch"
                      checked={specificUserMode}
                      onChange={(e) => {
                        setSpecificUserMode(e.target.checked);
                        if (!e.target.checked) setSelectedUsers([]);
                      }}
                      style={{ width: '3.2em', height: '1.6em' }}
                    />
                  </div>
                </div>

                <div
                  className={`p-4 rounded-4 transition-all ${specificUserMode ? 'bg-primary-soft border border-primary border-opacity-25' : 'bg-light opacity-50'}`}
                >
                  {specificUserMode ? (
                    <div className="animate-fade-in">
                      {selectedUsers.length > 0 && (
                        <div className="mb-3 d-flex flex-wrap gap-2">
                          {selectedUsers.map((user) => (
                            <div
                              key={user._id}
                              className="user-pill d-flex align-items-center bg-white border border-primary border-opacity-10 text-dark px-3 py-2 rounded-pill shadow-sm"
                            >
                              <div className="d-flex align-items-center gap-2 border-end pe-2 me-2">
                                <Users size={14} className="text-primary" />
                                <span className="small fw-bold">{user.username}</span>
                              </div>
                              <button
                                type="button"
                                className="btn p-0 text-danger d-flex align-items-center hover-scale"
                                onClick={() => handleRemoveUser(user._id)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        className="dashed-btn w-100 py-4 fw-bold text-primary d-flex flex-column align-items-center justify-content-center gap-2 bg-white rounded-4"
                        onClick={() => setShowUserModal(true)}
                      >
                        <div className="icon-circle bg-primary bg-opacity-10 mb-1">
                          <Plus size={24} />
                        </div>
                        {selectedUsers.length > 0 ? 'افزودن کاربر دیگر' : 'انتخاب کاربران'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-muted py-2">
                      <small>کد تخفیف برای تمام کاربران فعال خواهد بود.</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        /* --- Colors & Gradients --- */
        .preview-card {
            background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
            box-shadow: 0 15px 35px -5px rgba(14, 165, 233, 0.4);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .bg-cyan-soft { background-color: #ecfeff; }
        .bg-primary-soft { background-color: #eff6ff; }
        
        /* --- Modern Inputs --- */
        .custom-input, .custom-input-group {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            height: 48px; /* Fixed Height */
            border-radius: 12px;
            transition: all 0.2s;
        }
        .custom-input {
             padding: 0.6rem 0.8rem;
        }
        
        .custom-input:focus, .custom-input-group:focus-within {
            background-color: #fff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        /* --- Custom Date Picker Input Styles --- */
        .custom-date-input {
            width: 100%;
            height: 100%;
            border: none !important;
            background: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            font-weight: bold;
            color: #212529;
            text-align: right;
            padding: 0;
            cursor: pointer;
        }
        /* Override rmdp container to be flex */
        .rmdp-container {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            height: 100% !important;
        }

        /* --- Custom Type Buttons (Orange / Green) --- */
        .btn-percent-active {
            background-color: #f97316 !important; /* Orange */
            color: white !important;
            box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
            border: none;
        }
        .btn-amount-active {
            background-color: #10b981 !important; /* Mint Green */
            color: white !important;
            box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
            border: none;
        }

        /* --- White Button (Matches Blue Card) --- */
        .btn-white-glass {
            background-color: #ffffff;
            color: #2563eb; 
            transition: all 0.3s ease;
            border: 2px solid white;
        }
        .btn-white-glass:hover {
            background-color: #f1f5f9;
            color: #1d4ed8;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        /* --- Toggle Switch --- */
        .custom-toggle {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
            background-color: #cbd5e1; 
            border: 2px solid #94a3b8; 
        }
        .custom-toggle:checked {
            background-color: #3b82f6; 
            border-color: #3b82f6;
        }

        /* --- Dashed Button --- */
        .dashed-btn {
            border: 2px dashed #cbd5e1;
            transition: all 0.2s ease;
        }
        .dashed-btn:hover {
            border-color: #94a3b8;
            background-color: #f8fafc !important;
            transform: translateY(-2px);
        }
        .icon-circle {
            width: 48px; height: 48px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
        }

        /* --- Preview Card Aesthetics --- */
        .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .bg-circle-1 {
            position: absolute; width: 250px; height: 250px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%; top: -80px; left: -80px;
        }
        .bg-circle-2 {
            position: absolute; width: 180px; height: 180px;
            background: rgba(255,255,255,0.08);
            border-radius: 50%; bottom: -40px; right: -40px;
        }
        .backdrop-blur { backdrop-filter: blur(8px); }

        /* --- Utilities --- */
        .hover-scale:hover { transform: scale(1.02); }
        .hover-bg-danger:hover { background-color: #fee2e2 !important; color: #dc2626 !important; }
        .cursor-pointer { cursor: pointer; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Z-Index Fixes */
        .z-index-2 { z-index: 2; }
      `}</style>
    </div>
  );
};

export default DiscountCreate;
