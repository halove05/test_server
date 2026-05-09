import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Newspaper, 
  Activity, 
  CreditCard, 
  Loader2, 
  PieChart as PieIcon, 
  LineChart, 
  Star, 
  Trash2,
  Zap,
  Gauge
} from 'lucide-react';
import { marketService } from '../services/marketService';
import type { StockPrice, ChartData } from '../services/marketService';
import { newsService } from '../services/newsService';
import type { NewsItem as NewsItemType } from '../services/newsService';
import { kisService } from '../services/kisService';
import { watchlistService } from '../services/watchlistService';
import { motion } from 'framer-motion';
import apiClient from '@/services/apiClient';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

export default function Dashboard() {
  const [majorStocks, setMajorStocks] = useState<StockPrice[]>([]);
  const [watchlistStocks, setWatchlistStocks] = useState<StockPrice[]>([]);
  const [movers, setMovers] = useState<{ gainers: any[], losers: any[] }>({ gainers: [], losers: [] });
  const [sentiment, setSentiment] = useState<any>(null);
  const [mainChartData, setMainChartData] = useState<ChartData[]>([]);
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [indices, setIndices] = useState<any[]>([]);
  const [accountSummary, setAccountSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const watchlistSymbols = await watchlistService.getWatchlist();
      const majorSymbols = ['005930', '000660', '005380', '035420', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY', 'QQQ', 'VOO', 'TIGER200'];
      
      const [majorPrices, watchlistPrices, topMovers, sent, chart, latestNews, marketIndices, balance] = await Promise.all([
        Promise.all(majorSymbols.map(s => marketService.getStockPrice(s))),
        Promise.all(watchlistSymbols.map(s => marketService.getStockPrice(s))),
        marketService.getTopMovers(),
        apiClient.get('/market/sentiment').then(res => res.data),
        marketService.getChartData('005930'),
        newsService.getLatestNews(),
        marketService.getMarketIndices(),
        kisService.getAccountBalance('mock')
      ]);

      setMajorStocks(majorPrices);
      setWatchlistStocks(watchlistPrices);
      setMovers(topMovers);
      setSentiment(sent);
      setMainChartData(chart);
      setNews(latestNews);
      setIndices(marketIndices);
      setAccountSummary(balance);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const removeWatchlist = async (symbol: string) => {
    await watchlistService.removeFromWatchlist(symbol);
    fetchData();
  };

  const getPieData = () => {
    if (!accountSummary) return [];
    const data = accountSummary.holdings.map((h: any) => ({
      name: h.name,
      value: h.evaluationAmount
    }));
    data.push({ name: '현금', value: accountSummary.availableCash });
    return data;
  };

  if (isLoading && majorStocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium tracking-tight">시장 데이터를 연결하는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Market Overview</h1>
          <p className="text-gray-400 font-medium">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} 실시간 데이터
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {indices.map((idx) => (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              key={idx.name} 
              className="flex flex-col bg-[#161b22] px-6 py-3 rounded-2xl border border-gray-800 whitespace-nowrap shadow-premium"
            >
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{idx.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-white tracking-tighter">{idx.value?.toLocaleString()}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${idx.change >= 0 ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.changeRate)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                <LineChart size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Equity Curve</h2>
            </div>
            <span className="text-[10px] font-black text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700 uppercase tracking-widest">Growth Analytics</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accountSummary?.history || []}>
                <defs>
                  <linearGradient id="equityColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 1000000', 'dataMax + 1000000']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#8b949e', fontWeight: 'bold', marginBottom: '8px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'black', fontSize: '16px' }}
                  formatter={(value: any) => [`₩ ${value.toLocaleString()}`, 'Total Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke="#ef4444" strokeWidth={4} fill="url(#equityColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Sentiment Gauge */}
        <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <Gauge size={18} className="text-blue-500" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Global Pulse</h2>
          </div>
          
          <div className="relative mt-8">
            <svg className="w-48 h-24" viewBox="0 0 100 50">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: (sentiment?.value || 50) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke={sentiment?.value > 70 ? '#ef4444' : sentiment?.value < 30 ? '#3b82f6' : '#10b981'} 
                strokeWidth="12" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="text-center -mt-4">
              <h3 className="text-3xl font-black text-white tracking-tighter">{sentiment?.value}%</h3>
              <p className={`text-xs font-black uppercase tracking-widest mt-1 ${sentiment?.value > 70 ? 'text-red-500' : sentiment?.value < 30 ? 'text-blue-500' : 'text-green-500'}`}>
                {sentiment?.label || 'ANALYZING...'}
              </p>
            </div>
          </div>
          
          <p className="text-center text-[11px] font-bold text-gray-500 mt-8 leading-relaxed max-w-[200px]">
            {sentiment?.description || '시장 데이터를 기반으로 AI가 실시간 매수/매도 심리를 분석 중입니다.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Watchlist */}
        <div className="lg:col-span-3 bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Star size={24} className="fill-current" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Watchlist</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                  <th className="pb-4 pl-2">Ticker</th>
                  <th className="pb-4 text-right">Price</th>
                  <th className="pb-4 text-right">Day Change</th>
                  <th className="pb-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {watchlistStocks.map((s) => (
                  <tr key={s.symbol} className="group cursor-pointer hover:bg-gray-800/20 transition-colors" onClick={() => navigate(`/stock/${s.symbol}`)}>
                    <td className="py-5 pl-2">
                      <p className="text-sm font-black text-white mb-0.5">{s.name || s.symbol}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{s.symbol} · {s.market || 'MARKET'}</p>
                    </td>
                    <td className="py-5 text-right font-black text-white text-base">
                      {s.currency === 'USD' ? '$ ' : '₩ '}{s.currentPrice.toLocaleString()}
                    </td>
                    <td className={`py-5 text-right font-black ${s.changeRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      <span className="text-xs mr-1">{s.changeRate >= 0 ? '▲' : '▼'}</span>
                      {Math.abs(s.changeRate)}%
                    </td>
                    <td className="py-5 text-center">
                      <button onClick={(e) => { e.stopPropagation(); removeWatchlist(s.symbol); }} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pulse & Allocation */}
        <div className="space-y-8">
          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <PieIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Allocation</h2>
            </div>
            <div className="h-[180px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getPieData()} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {getPieData().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {getPieData().slice(0, 3).map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-white">{((item.value / getPieData().reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                <Zap size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Market Pulse</h2>
            </div>
            <div className="space-y-4">
              {movers.gainers.slice(0, 3).map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{stock.name}</span>
                  <span className="text-xs font-black text-red-500">+{stock.changeRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsItem({ title, time, sentiment }: { title: string, time: string, sentiment: 'positive' | 'negative' | 'neutral' }) {
  const sentimentColor = {
    positive: 'bg-green-500/10 text-green-500',
    negative: 'bg-red-500/10 text-red-500',
    neutral: 'bg-gray-500/10 text-gray-400'
  }[sentiment];

  return (
    <div className="group cursor-pointer">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${sentimentColor}`}>
          {sentiment}
        </span>
        <span className="text-[10px] text-gray-600 font-bold">{time}</span>
      </div>
      <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors line-clamp-1 leading-tight">
        {title}
      </p>
    </div>
  );
}
