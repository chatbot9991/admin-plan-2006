// src/components/PlanSelectorModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Search, Check, Layers, Loader2 } from 'lucide-react';
import { api } from '../services/api';

// اصلاح اینترفیس بر اساس خروجی واقعی API
export interface Plan {
  _id: string;
  name: string; // در API شما name است، نه title
  price: number | string; // ممکن است استرینگ باشد
  description?: string;
}

interface PlanSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: Plan) => void;
  selectedPlanId?: string;
}

const PlanSelectorModal: React.FC<PlanSelectorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedPlanId,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/plan/menu');
      // هندل کردن ساختارهای مختلف احتمالی ریسپانس
      const data = response.data;
      if (Array.isArray(data)) {
        setPlans(data);
      } else if (data.plans && Array.isArray(data.plans)) {
        setPlans(data.plans);
      } else if (data.list && Array.isArray(data.list)) {
        setPlans(data.list);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error loading plans', error);
    } finally {
      setLoading(false);
    }
  };

  // فیلتر کردن بر اساس name
  const filteredPlans = plans.filter((p) =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="psm-overlay">
      <div className="psm-content fade-in-up">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
          <h5 className="fw-bold mb-0">انتخاب اشتراک (Plan)</h5>
          <button onClick={onClose} className="btn btn-light rounded-circle p-2">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="position-relative mb-3">
          <Search
            className="position-absolute text-muted"
            size={18}
            style={{ top: '12px', right: '12px' }}
          />
          <input
            type="text"
            className="form-control pe-5 bg-light border-0"
            placeholder="جستجوی نام پلن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="psm-list custom-scrollbar">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="animate-spin text-primary" size={30} />
            </div>
          ) : filteredPlans.length === 0 ? (
            <p className="text-center text-muted py-4">پلنی یافت نشد.</p>
          ) : (
            filteredPlans.map((plan) => {
              const isSelected = selectedPlanId === plan._id;
              return (
                <div
                  key={plan._id}
                  onClick={() => {
                    // نگاشت کردن آبجکت به فرمت مورد انتظار کامپوننت والد (در صورت نیاز به title)
                    onConfirm({ ...plan, title: plan.name } as any);
                    onClose();
                  }}
                  className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-subtle border border-primary'
                      : 'bg-white border hover-shadow'
                  }`}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className={`p-2 rounded-circle ${isSelected ? 'bg-primary text-white' : 'bg-light text-secondary'}`}
                    >
                      <Layers size={20} />
                    </div>
                    <div>
                      {/* استفاده از plan.name */}
                      <h6 className="fw-bold mb-0 text-dark">{plan.name}</h6>
                      {/* <small className="text-muted">
                            {plan.price 
                                ? Number(plan.price).toLocaleString() 
                                : "0"
                            } تومان
                        </small> */}
                    </div>
                  </div>
                  {isSelected && <Check size={20} className="text-primary" />}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .psm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1060; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
        .psm-content { background: white; width: 95%; max-width: 450px; padding: 20px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        .psm-list { max-height: 400px; overflow-y: auto; }
        .fade-in-up { animation: fadeInUp 0.3s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hover-shadow:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateY(-1px); }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default PlanSelectorModal;
