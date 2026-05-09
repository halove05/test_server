import apiClient from './apiClient';

/**
 * 한국투자증권(KIS) API 연동 서비스
 * 보안을 위해 API Key와 Secret은 서버 사이드(Backend)에서 처리하는 것을 권장합니다.
 */
export const kisService = {
  // 토큰 발급 (서버에서 대행 처리 가정)
  getAccessToken: async () => {
    const response = await apiClient.post('/auth/kis/token');
    return response.data.access_token;
  },

  // 국내 주식 주문
  placeOrder: async (orderData: {
    symbol: string;
    orderType: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    mode?: 'mock' | 'real';
  }) => {
    const response = await apiClient.post('/trading/order', orderData);
    return response.data;
  },

  // 계좌 잔고 조회
  getAccountBalance: async (mode: 'mock' | 'real' = 'mock') => {
    const response = await apiClient.get(`/trading/balance?mode=${mode}`);
    return response.data;
  },

  // 자동매매 엔진 상태 변경
  toggleEngine: async (active: boolean, mode: 'mock' | 'real' = 'mock') => {
    const response = await apiClient.post('/trading/real/toggle', { active, mode });
    return response.data;
  },

  // 거래 내역 조회
  getTradeLogs: async (mode: 'mock' | 'real' = 'mock') => {
    const response = await apiClient.get(`/trading/logs?mode=${mode}`);
    return response.data;
  }
};
