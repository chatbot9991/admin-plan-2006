import axios from 'axios';
import Cookies from 'js-cookie';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/portal`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api_auth = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});


const authInterceptor = (config: any) => {
  const token = Cookies.get('adminJwt');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};


api.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
api_auth.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));


const errorInterceptor = (error: any) => {
  if (error.response && error.response.status === 401) {
    const isLoginRequest = error.config.url.includes('/login');

    if (!isLoginRequest) {
      Cookies.remove('adminJwt');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, errorInterceptor);
api_auth.interceptors.response.use((response) => response, errorInterceptor);


export const verifyTokenService = async () => {
  return await api.get('/setting/read');
};
