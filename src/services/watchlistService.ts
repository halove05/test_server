import apiClient from './apiClient';

export const watchlistService = {
  getWatchlist: async (): Promise<string[]> => {
    const response = await apiClient.get('/watchlist');
    return response.data;
  },

  addToWatchlist: async (symbol: string): Promise<string[]> => {
    const response = await apiClient.post('/watchlist', { symbol });
    return response.data;
  },

  removeFromWatchlist: async (symbol: string): Promise<string[]> => {
    const response = await apiClient.delete(`/watchlist/${symbol}`);
    return response.data;
  }
};
