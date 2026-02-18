// src/components/common/Filter.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';
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
  // استیت برای باز/بسته بودن منوی دراپ‌داون
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // تشخیص کلیک خارج از کادر برای بستن منو
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // پیدا کردن نام آیتم انتخاب شده برای نمایش
  const getSelectedName = () => {
    if (!value) return placeholder || 'انتخاب کنید';
    const selected = options.find((opt) => String(opt.id) === String(value));
    return selected ? selected.name : placeholder || 'انتخاب کنید';
  };

  const handleSelect = (val: string | number) => {
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`filter-wrapper ${className}`}>
      {/* Label */}
      {label && (
        <label className="form-label text-muted small fw-bold mb-2 ms-1 d-block">{label}</label>
      )}

      <div className="position-relative" ref={type === 'dropdown' ? dropdownRef : null}>
        
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

        {/* --- Custom Dropdown Filter (اصلاح شده) --- */}
        {type === 'dropdown' && onChange && (
          <>
            {/* دکمه اصلی دراپ‌داون */}
            <div
              className={`form-control custom-input d-flex align-items-center justify-content-between cursor-pointer ${
                isOpen ? 'focus-ring' : ''
              }`}
              onClick={() => setIsOpen(!isOpen)}
              style={{ paddingRight: '15px', paddingLeft: '15px' }}
            >
              <span className={`text-truncate ${!value ? 'text-muted' : 'text-dark fw-medium'}`}>
                {getSelectedName()}
              </span>
              <ChevronDown
                size={18}
                className="text-muted transition-transform"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  minWidth: '18px'
                }}
              />
            </div>

            {/* لیست آیتم‌ها (شناور روی صفحه) */}
            {isOpen && (
              <div className="custom-dropdown-menu shadow-lg fade-in-dropdown">
                <ul className="list-unstyled m-0 p-1">
                  {/* گزینه "همه" یا ریست */}
                  <li
                    className={`dropdown-item-custom ${!value ? 'selected' : ''}`}
                    onClick={() => handleSelect('')}
                  >
                    <span className="text-muted small">{placeholder || 'همه موارد'}</span>
                    {!value && <Check size={14} className="text-primary" />}
                  </li>
                  
                  {/* گزینه‌های اصلی */}
                  {options.map((opt) => {
                    const isSelected = String(opt.id) === String(value);
                    return (
                      <li
                        key={opt.id}
                        className={`dropdown-item-custom ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(opt.id)}
                      >
                        <span>{opt.name}</span>
                        {isSelected && <Check size={16} className="text-primary" />}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {/* --- Date Range Filter --- */}
        {type === 'date-range' && onChange && (
          <div className="custom-date-picker-wrapper">
            <DatePicker
              range
              rangeHover
              dateSeparator=" ~ "
              onChange={(dateObjects) => onChange(dateObjects)}
              value={value || []}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              format="YYYY/MM/DD"
              portal
              zIndex={9999} // Z-index بالا برای تقویم
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
        /* استایل‌های مشترک اینپوت */
        .custom-input {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background-color: #f8f9fa;
          height: 48px;
          font-size: 0.9rem;
          color: #334155;
          width: 100%;
          transition: all 0.2s ease;
        }

        .custom-input:focus,
        .custom-input.focus-ring {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        
        /* استایل منوی شناور دراپ‌داون */
        .custom-dropdown-menu {
          position: absolute;
          top: calc(100% + 5px); /* فاصله کم از فیلد */
          left: 0;
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          z-index: 9999; /* مهم: باعث می‌شود روی همه‌چیز قرار بگیرد */
          overflow: hidden;
          max-height: 250px;
          overflow-y: auto;
        }
        
        .fade-in-dropdown {
           animation: fadeInDrop 0.2s ease-out forwards;
        }

        /* آیتم‌های داخل لیست */
        .dropdown-item-custom {
          padding: 10px 15px;
          font-size: 0.9rem;
          color: #475569;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
          margin: 4px;
        }

        .dropdown-item-custom:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }

        .dropdown-item-custom.selected {
          background-color: #eff6ff;
          color: #2563eb;
          font-weight: 500;
        }

        /* اسکرول بار زیبا */
        .custom-dropdown-menu::-webkit-scrollbar {
            width: 5px;
        }
        .custom-dropdown-menu::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 10px;
        }

        @keyframes fadeInDrop {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pointer-events-none { pointer-events: none; }
        .cursor-pointer { cursor: pointer; }
        
        .custom-date-picker-wrapper input {
            background-color: #f8f9fa !important;
        }

        /* استایل‌های DatePicker */
        .rmdp-range { background-color: #3b82f6 !important; box-shadow: 0 0 3px #3b82f6; }
        .rmdp-range-hover { background-color: rgba(59, 130, 246, 0.5) !important; }
        .rmdp-day.rmdp-selected span:not(.highlight) { background-color: #2563eb !important; }
        .rmdp-today span { background-color: #1e293b !important; }
      `}</style>
    </div>
  );
};

export default Filter;
