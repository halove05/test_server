import axios from 'axios';

// 실제 운영 환경에서는 백엔드 서버를 통해 호출하는 것이 보안상 안전합니다.
// 여기서는 프론트엔드에서 직접 호출하는 구조를 예시로 작성합니다.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
