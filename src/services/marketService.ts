import apiClient from './apiClient';

export interface StockPrice {
  symbol: string;
  name?: string;
  market?: string;
  category?: 'korea' | 'global' | 'etf';
  currency?: 'KRW' | 'USD';
  source?: 'KIS' | 'sample';
  isLive?: boolean;
  updatedAt?: string;
  fallbackReason?: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;
  high: number;
  low: number;
  volume: number;
}

export interface ChartData {
  time: string;
  date?: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume: number;
  sma20?: number;
  rsi?: number;
  bbUpper?: number;
  bbLower?: number;
}

export interface OrderBookLevel {
  price: number;
  volume: number;
}

export interface OrderBook {
  symbol: string;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
}

export interface Fundamentals {
  per: number;
  pbr: number;
  eps: number;
  bps: number;
  dividendYield: number;
  w52High: number;
  w52Low: number;
  marketCap: number;
}

export const marketService = {
  getMarketIndices: async () => {
    try { const response = await apiClient.get('/market/indices'); return response.data; } 
    catch { return [ { name: 'KOSPI', value: 2750.32, change: 15.2, changeRate: 0.55 }, { name: 'KOSDAQ', value: 890.15, change: -2.1, changeRate: -0.23 } ]; }
  },

  getStockPrice: async (symbol: string): Promise<StockPrice> => {
    try { const response = await apiClient.get(`/market/stock/${symbol}`); return response.data; }
    catch { return { symbol, currentPrice: 75000, changeAmount: 500, changeRate: 0.67, high: 76000, low: 74500, volume: 1200000 }; }
  },

  getChartData: async (symbol: string, period: string = '1D'): Promise<ChartData[]> => {
    try { const response = await apiClient.get(`/market/chart/${symbol}?period=${period}`); return response.data; }
    catch { return Array.from({ length: 20 }, (_, i) => ({ time: `${10 + i}:00`, price: 75000, volume: 1000 })); }
  },

  searchStocks: async (query: string) => {
    const response = await apiClient.get(`/market/search?q=${query}`);
    return response.data;
  },

  getTopMovers: async () => {
    const response = await apiClient.get('/market/movers');
    return response.data;
  },

  getOrderBook: async (symbol: string): Promise<OrderBook> => {
    try { const response = await apiClient.get(`/market/orderbook/${symbol}`); return response.data; }
    catch { return { symbol, asks: [], bids: [] }; }
  },

  getFundamentals: async (symbol: string): Promise<Fundamentals> => {
    const response = await apiClient.get(`/market/fundamentals/${symbol}`);
    return response.data;
  },

  getSpecificNews: async (symbol: string) => {
    const response = await apiClient.get(`/market/news/${symbol}`);
    return response.data;
  }
};
