import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Star, TrendingUp, TrendingDown, Loader2, Globe, Zap, History } from 'lucide-react';
import { useMarketStore } from '@/store/useMarketStore';
import { marketService } from '@/services/marketService';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

interface SearchResult {
  symbol: string;
  name: string;
  market?: string;
  category?: 'korea' | 'global' | 'etf';
  currency?: 'KRW' | 'USD';
  source?: 'KIS' | 'sample';
  isLive?: boolean;
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <section>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Market Explorer</h1>
        <p className="text-gray-500 font-bold">국내 및 해외 5,000개 이상의 종목을 실시간으로 검색하세요.</p>
      </section>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
          {isSearching ? <Loader2 className="h-6 w-6 text-red-500 animate-spin" /> : <SearchIcon className="h-6 w-6 text-gray-500 group-focus-within:text-red-500 transition-colors" />}
        </div>
        <input
          type="text"
          className="block w-full pl-16 pr-6 py-6 bg-[#161b22] border border-gray-800 rounded-3xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 text-xl font-bold shadow-premium transition-all"
          placeholder="종목명 또는 티커를 입력하세요 (예: 삼성전자, AAPL, NVDA)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 right-6 flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 text-[10px] font-black text-gray-600 border border-gray-800 px-2 py-1 rounded-lg uppercase tracking-tighter">Enter to Search</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-[#161b22] rounded-3xl border border-gray-800 overflow-hidden shadow-premium">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                  <th className="px-8 py-5 w-16">Fav</th>
                  <th className="px-8 py-5">Instrument</th>
                  <th className="px-8 py-5 text-right">Price</th>
                  <th className="px-8 py-5 text-right">24H Change</th>
                  <th className="px-8 py-5 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                <AnimatePresence mode="popLayout">
                  {results.map((stock) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={stock.symbol} 
                      onClick={() => navigate(`/stock/${stock.symbol}`)}
                      className="hover:bg-gray-800/20 transition-all group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleFavorite(stock); 
                          }} 
                          className="p-2 rounded-xl hover:bg-gray-800 transition-colors focus:outline-none"
                        >
                          <Star className={`h-5 w-5 transition-all ${isFavorite(stock.symbol) ? 'text-yellow-400 fill-current scale-110' : 'text-gray-700 group-hover:text-gray-500'}`} />
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-black text-white group-hover:text-red-500 transition-colors">{stock.name}</span>
                            <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter ${stock.isLive ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {stock.isLive ? 'Live' : 'Mock'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{stock.symbol} · {stock.market || stock.category || 'GLOBAL MARKET'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <span className="text-base font-black text-white tracking-tight">
                          {formatCurrency(stock.price, stock.currency)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-xl ${stock.changeRate >= 0 ? 'bg-red-500/10 text-red-500 shadow-glow-red/10' : 'bg-blue-500/10 text-blue-500 shadow-glow-blue/10'}`}>
                          {stock.changeRate >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {formatPercent(stock.changeRate)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-gray-500 tracking-tight">
                        {stock.volume}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {results.length === 0 && !isSearching && (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-900/50 rounded-3xl border border-gray-800">
                          <Globe className="text-gray-700" size={40} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                            {query.length > 1 ? 'No results found for your query' : 'Begin your research'}
                          </p>
                          <p className="text-xs text-gray-600 font-bold mt-1">
                            {query.length > 1 ? 'Try checking for typos or searching by ticker symbol' : 'Search by stock name, ticker, or index code'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links / History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                <Zap size={20} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Hot Tickers</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {['NVDA', 'AAPL', 'TSLA', '005930', 'KODEX 200', 'QQQ', 'MSFT'].map(ticker => (
                <button 
                  key={ticker}
                  onClick={() => setQuery(ticker)}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-black text-gray-500 hover:text-white hover:border-red-500/50 transition-all uppercase tracking-widest"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                <History size={20} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Searches</h2>
            </div>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">No recent search history</p>
          </div>
        </div>
      </div>
    </div>
  );
}
