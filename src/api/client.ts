import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  // NOTE: Storing JWT in localStorage is an XSS tradeoff accepted for MVP.
  // A production hardening pass should evaluate httpOnly cookies or in-memory
  // token storage with silent refresh. See OWASP Token Storage Cheat Sheet.
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // TODO: Replace hard navigation with in-app state reset once we add
      // a global auth event bus. Hard nav loses React state/cache but is
      // acceptable for MVP to guarantee a clean slate on token expiry.
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
