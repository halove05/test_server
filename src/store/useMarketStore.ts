import { create } from 'zustand';
import { marketService } from '../services/marketService';
import type { StockPrice } from '../services/marketService';

interface MarketState {
  favorites: StockPrice[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  addFavorite: (symbol: string) => Promise<void>;
  removeFavorite: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      // 초기 샘플 종목들 정보 가져오기
      const symbols = ['005930', '000660', 'AAPL', 'MSFT', 'NVDA', 'SPY', 'QQQ'];
      const prices = await Promise.all(
        symbols.map(symbol => marketService.getStockPrice(symbol))
      );
      set({ favorites: prices, isLoading: false });
    } catch (error) {
      set({ error: '데이터를 불러오는데 실패했습니다.', isLoading: false });
    }
  },

  addFavorite: async (symbol: string) => {
    try {
      const stock = await marketService.getStockPrice(symbol);
      set((state) => ({
        favorites: [...state.favorites, stock]
      }));
    } catch (error) {
      console.error('Failed to add favorite', error);
    }
  },

  removeFavorite: (symbol) => set((state) => ({
    favorites: state.favorites.filter(s => s.symbol !== symbol)
  })),
}));
