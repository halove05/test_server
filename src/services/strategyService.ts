import apiClient from './apiClient';

export interface Condition {
  id: number;
  type: string;
  operator: string;
  value: number | string;
  action: string;
}

export interface Strategy {
  id?: number;
  name: string;
  conditions: Condition[];
  investmentPerOrder: number;
  isStopLossActive: boolean;
  stopLossRate: number;
}

export const strategyService = {
  getStrategies: async (): Promise<Strategy[]> => {
    const response = await apiClient.get('/strategies');
    return response.data;
  },

  saveStrategy: async (strategy: Strategy): Promise<Strategy> => {
    const response = await apiClient.post('/strategies', strategy);
    return response.data;
  },

  deleteStrategy: async (id: number): Promise<void> => {
    await apiClient.delete(`/strategies/${id}`);
    return;
  },

  runBacktest: async (strategy: Strategy, symbol: string, period: number) => {
    const response = await apiClient.post('/strategies/backtest', { strategy, symbol, period });
    return response.data;
  },

  generateFromAI: async (prompt: string): Promise<Condition[]> => {
    const response = await apiClient.post('/strategies/generate', { prompt });
    return response.data;
  }
};
