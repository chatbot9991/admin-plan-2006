// src/components/common/Filter.tsx

import React from 'react';
import { Search, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

export interface FilterOption {
  id: string | number;
  name: string;
}

interface FilterProps {
  type: 'text' | 'dropdown' | 'date-range';
  label?: string;
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  options?: FilterOption[];
  className?: string;
}

const Filter: React.FC<FilterProps> = ({
  type,
  label,
  placeholder,
  value,
  onChange,
  options = [],
  className = '',
}) => {
  return (
    <div className={`filter-wrapper ${className}`}>
      {/* Label */}
      {label && (
        <label className="form-label text-muted small fw-bold mb-2 ms-1 d-block">{label}</label>
      )}

      <div className="position-relative">
        {/* --- Text Filter --- */}
        {type === 'text' && onChange && (
          <>
            <input
              type="text"
              className="form-control custom-input ps-5"
              placeholder={placeholder || 'جستجو...'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <Search
              size={18}
              className="position-absolute text-muted"
              style={{ top: '50%', right: '15px', transform: 'translateY(-50%)' }}
            />
          </>
        )}

        {/* --- Dropdown Filter --- */}
        {type === 'dropdown' && onChange && (
          <>
            <select
              className="form-select custom-input ps-4 cursor-pointer form-select-no-icon"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">{placeholder || 'انتخاب کنید'}</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="position-absolute text-muted pointer-events-none"
              style={{ top: '50%', left: '15px', transform: 'translateY(-50%)' }}
            />
          </>
        )}

        {/* --- Date Range Filter (خام) --- */}
        {type === 'date-range' && onChange && (
          <div className="custom-date-picker-wrapper">
            <DatePicker
              range
              rangeHover
              dateSeparator=" ~ "
              // مستقیماً آبجکت‌های DateObject را به والد پاس می‌دهیم
              onChange={(dateObjects) => onChange(dateObjects)}
              value={value || []}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              format="YYYY/MM/DD"
              portal
              zIndex={9999}
              render={(value: string, openCalendar: () => void) => (
                <div onClick={openCalendar} className="cursor-pointer w-100 position-relative">
                  <input
                    readOnly
                    className="form-control custom-input ps-5 text-start cursor-pointer bg-white ltr-placeholder"
                    value={value}
                    placeholder={placeholder || 'تاریخ شروع ~ تاریخ پایان'}
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                  <CalendarIcon
                    size={18}
                    className="position-absolute text-muted pointer-events-none"
                    style={{ top: '50%', right: '15px', transform: 'translateY(-50%)' }}
                  />
                </div>
              )}
            >
              <button
                style={{ margin: '5px', padding: '5px 10px', fontSize: '12px' }}
                className="btn btn-sm btn-light w-100 text-primary fw-bold"
              >
                تایید تاریخ
              </button>
            </DatePicker>
          </div>
        )}
      </div>

      <style>{`
        .custom-input {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background-color: #f8f9fa;
          padding: 10px 12px;
          height: 48px;
          font-size: 0.9rem;
          color: #334155;
          width: 100%;
        }
        .custom-input:focus {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        .form-select-no-icon {
            -webkit-appearance: none !important;
            appearance: none !important;
            background-image: none !important;
        }
        .pointer-events-none { pointer-events: none; }
        .cursor-pointer { cursor: pointer; }
        
        /* استایل‌های تقویم */
        .rmdp-range {
            background-color: #3b82f6 !important;
            box-shadow: 0 0 3px #3b82f6;
        }
        .rmdp-range-hover {
            background-color: rgba(59, 130, 246, 0.5) !important;
        }
        .rmdp-day.rmdp-selected span:not(.highlight) {
            background-color: #2563eb !important;
        }
        .rmdp-today span {
            background-color: #1e293b !important;
        }
      `}</style>
    </div>
  );
};

export default Filter;
