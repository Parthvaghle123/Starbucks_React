import axios from 'axios';

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const setupTokenInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (!window.location.pathname.startsWith('/admin')) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/';
      return Promise.reject(new Error('Token expired'));
    }
    return config;
  });
};

export { setupTokenInterceptor, isTokenExpired };