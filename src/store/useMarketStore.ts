import { create } from 'zustand';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  changeRate: number;
}

interface MarketState {
  favorites: Stock[];
  addFavorite: (stock: Stock) => void;
  removeFavorite: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  favorites: [
    { symbol: '005930', name: '삼성전자', price: 74100, changeRate: 1.5 },
    { symbol: 'NVDA', name: 'NVIDIA', price: 894.32, changeRate: -1.2 }
  ],
  addFavorite: (stock) => set((state) => ({ favorites: [...state.favorites, stock] })),
  removeFavorite: (symbol) => set((state) => ({
    favorites: state.favorites.filter(s => s.symbol !== symbol)
  })),
}));
