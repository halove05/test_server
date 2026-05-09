import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Star, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useMarketStore } from '@/store/useMarketStore';
import { marketService } from '@/services/marketService';

interface SearchResult {
  symbol: string;
  name: string;
  market?: string;
  category?: 'korea' | 'global' | 'etf';
  currency?: 'KRW' | 'USD';
  price: number;
  changeRate: number;
  volume: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { favorites, addFavorite, removeFavorite } = useMarketStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        try {
          const data = await marketService.searchStocks(query);
          setResults(data);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const isFavorite = (symbol: string) => favorites.some(f => f.symbol === symbol);

  const toggleFavorite = (stock: SearchResult) => {
    if (isFavorite(stock.symbol)) {
      removeFavorite(stock.symbol);
    } else {
      addFavorite(stock.symbol);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">종목 검색</h1>
        <p className="text-gray-400">국내 및 해외 주식을 검색하고 관심 종목에 추가하세요.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? <Loader2 className="h-6 w-6 text-red-500 animate-spin" /> : <SearchIcon className="h-6 w-6 text-gray-500" />}
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-[#161b22] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg shadow-lg"
          placeholder="종목명 또는 티커를 입력하세요 (예: 삼성전자, AAPL, QQQ, TIGER)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
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
              {results.map((stock) => (
                <tr 
                  key={stock.symbol} 
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="hover:bg-gray-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleFavorite(stock); 
                      }} 
                      className="focus:outline-none"
                    >
                      <Star className={`h-6 w-6 ${isFavorite(stock.symbol) ? 'text-yellow-400 fill-current' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{stock.name}</span>
                      <span className="text-xs text-gray-500">{stock.symbol} · {stock.market || stock.category || 'MARKET'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-white">
                      {stock.currency === 'USD' ? `$ ${stock.price.toFixed(2)}` : `₩ ${stock.price.toLocaleString()}`}
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
              {results.length === 0 && !isSearching && query.length > 1 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
              {query.length <= 1 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    종목명이나 티커를 입력하여 검색을 시작하세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
