import apiClient from './apiClient';
import type { Strategy } from './strategyService';

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  profitRate: number;
  totalProfit: number;
  tradeCount: number;
  winRate: number;
}

export interface PublicStrategy {
  id: number;
  author: string;
  name: string;
  description: string;
  totalReturn: number;
  winRate: number;
  config: Strategy;
}

export const socialService = {
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get('/social/leaderboard');
    return response.data;
  },

  getPublicStrategies: async (): Promise<PublicStrategy[]> => {
    const response = await apiClient.get('/social/strategies');
    return response.data;
  },

  copyStrategy: async (id: string | number): Promise<void> => {
    await apiClient.post(`/social/copy/${id}`);
    return;
  }
};
