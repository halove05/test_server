import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || '서버 통신 중 오류가 발생했습니다.';
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth-storage');
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    } else if (error.response?.status === 500) {
      console.error('Server Error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
