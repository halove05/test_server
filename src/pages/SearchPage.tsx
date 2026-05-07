import { useState } from 'react';
import { Search as SearchIcon, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketStore } from '@/store/useMarketStore';

const dummyResults = [
  { symbol: '005930', name: '삼성전자', price: 74100, changeRate: 1.5, volume: '12,450,000' },
  { symbol: '000660', name: 'SK하이닉스', price: 182300, changeRate: 2.1, volume: '4,200,000' },
  { symbol: '373220', name: 'LG에너지솔루션', price: 395000, changeRate: -0.5, volume: '850,000' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, changeRate: 0.8, volume: '55,000,000' },
  { symbol: 'TSLA', name: 'Tesla', price: 175.22, changeRate: -1.2, volume: '88,000,000' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { favorites, addFavorite, removeFavorite } = useMarketStore();

  const isFavorite = (symbol: string) => favorites.some(f => f.symbol === symbol);

  const toggleFavorite = (stock: { symbol: string; name: string; price: number; changeRate: number; volume: string }) => {
    if (isFavorite(stock.symbol)) {
      removeFavorite(stock.symbol);
    } else {
      addFavorite({ symbol: stock.symbol, name: stock.name, price: stock.price, changeRate: stock.changeRate });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">종목 검색</h1>
        <p className="text-gray-400">국내 및 해외 주식을 검색하고 관심 종목에 추가하세요.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-[#161b22] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg shadow-lg"
          placeholder="종목명 또는 티커(기호)를 입력하세요 (예: 삼성전자, AAPL)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">관심</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">종목명 (티커)</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">현재가</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">전일대비</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">거래량</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {dummyResults.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-gray-800/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(stock); }} className="focus:outline-none">
                    <Star className={`h-6 w-6 ${isFavorite(stock.symbol) ? 'text-yellow-400 fill-current' : 'text-gray-600 group-hover:text-gray-400'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{stock.name}</span>
                    <span className="text-xs text-gray-500">{stock.symbol}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-medium text-white">
                    {stock.price > 1000 ? `₩ ${stock.price.toLocaleString()}` : `$ ${stock.price.toFixed(2)}`}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`inline-flex items-center gap-1 text-sm font-bold ${stock.changeRate > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                    {stock.changeRate > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {stock.changeRate > 0 ? '+' : ''}{stock.changeRate}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                  {stock.volume}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
