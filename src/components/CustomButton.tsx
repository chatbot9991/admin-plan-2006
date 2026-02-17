// src/components/CustomButton.tsx
import React from 'react';
import { Spinner } from 'react-bootstrap';

interface CustomButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // تایپ دقیق ایونت
  type?: "button" | "submit";
  isLoading?: boolean;
  className?: string; // برای اضافه کردن کلاس اضافی در صورت نیاز
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  text, 
  onClick, 
  type = "button", 
  isLoading = false,
  className = ""
}) => {
  return (
    <button 
      type={type} 
      className={`custom-btn custom-btn-primary ${className}`} // کلاس‌های CSS اینجا اعمال می‌شوند
      onClick={onClick}
      disabled={isLoading} // وقتی لودینگ است دکمه غیرفعال شود
    >
      {isLoading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="ms-2" // فاصله اسپینر از متن
          />
          <span>لطفاً صبر کنید...</span>
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default CustomButton;
