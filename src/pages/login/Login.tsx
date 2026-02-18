// src/pages/Login.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { api_auth } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import CustomButton from '../../components/CustomButton';

import loginBg from '../../assets/images/login-bg.png';
import logoIcon from '../../assets/icons/logo.svg';
import userIcon from '../../assets/icons/email.svg';
import lockIcon from '../../assets/icons/key.svg';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const loginToStore = useAuthStore((state) => state.login);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.warning('لطفا نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);

    if (!validateEmail(formData.email)) {
      toast.error('فرمت ایمیل وارد شده صحیح نیست! لطفا یک ایمیل معتبر وارد کنید.');
      setLoading(false);
      return;
    }

    try {
      const response = await api_auth.post('/portal/signin_email_pass', {
        email: formData.email,
        password: formData.password,
      });

      const result = response.data;
      const user = result.existingAdmin;
      const token = result.adminJwt;
      if (result) {
        loginToStore(token, user);
        toast.success('ورود با موفقیت انجام شد');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Login Failed:', error);
      setLoading(false);
      const msg = error.response?.data?.message || 'نام کاربری یا رمز عبور اشتباه است';

      toast.error(msg);
    }
  };

  return (
    <Container fluid className="p-0 login-container" dir="rtl">
      <Row className="g-0 h-100">
        <Col
          md={4}
          lg={5}
          className="d-flex flex-column justify-content-center align-items-center bg-white p-4 p-md-5 order-2 order-md-1 position-relative"
          style={{ minHeight: '100vh' }}
        >
          <div className="logo text-center mb-4">
            <img src={logoIcon} alt="Logo" style={{ height: '75px' }} />
          </div>
          <div className="title text-center mb-2">
            <h1 className="fw-bold mb-3 fs-2">ورود به پنل مدیریت</h1>
            <p className="text-muted small">لطفا اطلاعات کاربری خود را وارد کنید</p>
          </div>

          <div style={{ width: '100%', maxWidth: '400px' }}>
            <Form onSubmit={handleLogin}>
              <div className="custom-input-wrapper mb-4">
                <img src={userIcon} alt="icon" className="custom-input-icon" />
                <div className="custom-input-divider"></div>
                <Form.Control
                  type="text"
                  placeholder="نام کاربری"
                  className="custom-input-field p-0"
                  style={{ boxShadow: 'none' }}
                  value={formData.email}
                  onChange={(e) => handleChange(e, 'email')}
                />
              </div>

              <div className="custom-input-wrapper mb-5">
                <img src={lockIcon} alt="icon" className="custom-input-icon" />
                <div className="custom-input-divider"></div>
                <Form.Control
                  type="password"
                  placeholder="رمز عبور"
                  className="custom-input-field p-0"
                  style={{ boxShadow: 'none' }}
                  value={formData.password}
                  onChange={(e) => handleChange(e, 'password')}
                />
              </div>

              <div className="mt-4">
                <CustomButton text="ورود به پنل" type="submit" isLoading={loading} />
              </div>
            </Form>
          </div>
        </Col>

        <Col md={8} lg={7} className="d-none d-md-block order-1 order-md-2 p-0">
          <div
            className="login-image-section"
            style={{
              backgroundImage: `url(${loginBg})`,
              height: '100vh',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
