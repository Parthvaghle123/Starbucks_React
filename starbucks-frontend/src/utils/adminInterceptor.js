import axios from 'axios';

// Create axios interceptor for admin API calls
const setupAdminInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

export default setupAdminInterceptor;