// src/auth/RequireAuth.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { verifyTokenService } from "../services/api";
import { toast } from "react-toastify";
import logoIcon from "../assets/icons/logo.svg";

const RequireAuth = () => {
  const { token, logout } = useAuthStore();
  const location = useLocation();

  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsChecking(false);
        setIsVerified(false);
        return;
      }

      try {
        const response = await verifyTokenService();

        if (response.status === 200) {
          setIsVerified(true);
        } else {
          throw new Error("Invalid Token");
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        toast.error("نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.");
        logout();
        setIsVerified(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, []);

  if (isChecking) {
    // رنگ بنفش

    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center vh-100 w-100 bg-light position-fixed top-0 start-0 ح"
        style={{ zIndex: 2000, backdropFilter: "blur(5px)" }}
      >
        <div
          className="bg-white p-5 rounded-4 shadow-lg d-flex flex-column align-items-center text-center"
          style={{ minWidth: "320px" }}
        >
          {/* آیکون سپر امنیتی (قبلی) با رنگ بنفش */}
          <div className="mb-4" style={{ color: "#ae51f1" }}>
            <img src={logoIcon} />
          </div>

          {/* اسپینرهای بنفش */}
          <div className="d-flex gap-2 mb-4 mt-3">
            <div
              className="spinner-grow"
              style={{
                backgroundColor: "#ab36ff",
                width: "0.7rem",
                height: "0.7rem",
                animationDuration: "0.8s",
              }}
              role="status"
            ></div>
            <div
              className="spinner-grow"
              style={{
                backgroundColor: "#831fca",
                width: "0.7rem",
                height: "0.7rem",
                animationDuration: "0.8s",
                animationDelay: "0.15s",
              }}
              role="status"
            ></div>
            <div
              className="spinner-grow"
              style={{
                backgroundColor: "#6613a1",
                width: "0.7rem",
                height: "0.7rem",
                animationDuration: "0.8s",
                animationDelay: "0.3s",
              }}
              role="status"
            ></div>
          </div>

          <h5 className="fw-bold mb-2" style={{ color: "#4a4a4a" }}>
            بررسی امنیت
          </h5>
          <small
            className="text-muted"
            style={{ fontSize: "0.85rem", direction: "rtl" }}
          >
            درحال اعتبار سنجی توکن شما ...
          </small>
        </div>
      </div>
    );
  }

  if (!token || !isVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
