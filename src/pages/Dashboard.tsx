import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
  Loader2, 
  PieChart as PieIcon, 
  LineChart, 
  Star, 
  Trash2,
  Zap,
  Gauge,
  TrendingUp,
  TrendingDown,
  Newspaper,
  ArrowUpRight
} from 'lucide-react';
import { marketService } from '../services/marketService';
import type { StockPrice, ChartData } from '../services/marketService';
import { newsService } from '../services/newsService';
import { kisService } from '../services/kisService';
import { watchlistService } from '../services/watchlistService';
import { motion } from 'framer-motion';
import apiClient from '@/services/apiClient';
import { useLocaleStore } from '@/store/useLocaleStore';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

export default function Dashboard() {
  const [watchlistStocks, setWatchlistStocks] = useState<StockPrice[]>([]);
  const [movers, setMovers] = useState<{ gainers: any[], losers: any[] }>({ gainers: [], losers: [] });
  const [sentiment, setSentiment] = useState<any>(null);
  const [indices, setIndices] = useState<any[]>([]);
  const [accountSummary, setAccountSummary] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [engineMode, setEngineMode] = useState<'mock' | 'real'>('mock');
  const [moversType, setMoversType] = useState<'gainers' | 'losers'>('gainers');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { locale, t } = useLocaleStore();

  const fetchData = async () => {
    try {
      const watchlistSymbols = await watchlistService.getWatchlist();
      
      // 엔진 상태 먼저 확인
      const engineRes = await apiClient.post('/trading/real/toggle', {}); // GET 대용 (현재 상태만 반환하도록 설계됨)
      const currentMode = engineRes.data.mode || 'mock';
      setEngineMode(currentMode);

      const [watchlistPrices, topMovers, sent, latestNews, marketIndices, balance] = await Promise.all([
        Promise.all(watchlistSymbols.map(s => marketService.getStockPrice(s))),
        marketService.getTopMovers(),
        apiClient.get('/market/sentiment').then(res => res.data),
        newsService.getLatestNews(),
        marketService.getMarketIndices(),
        kisService.getAccountBalance(currentMode)
      ]);

      setWatchlistStocks(watchlistPrices);
      setMovers(topMovers);
      setSentiment(sent);
      setNews(latestNews);
      setIndices(marketIndices);
      setAccountSummary(balance);
    } catch (error) {
      console.error('Dashboard refresh failed', error);
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

  if (isLoading && watchlistStocks.length === 0 && indices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium tracking-tight">Market Pulse Connecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black text-white tracking-tighter">{t('marketOverview')}</h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${engineMode === 'real' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
              {engineMode === 'real' ? 'Live Account' : 'Paper Trading'}
            </span>
          </div>
          <p className="text-gray-400 font-medium">
            {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} {t('marketOverviewDescription')}
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {indices.map((idx) => (
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              key={idx.name} 
              className="flex flex-col bg-[#161b22] px-6 py-4 rounded-2xl border border-gray-800/50 whitespace-nowrap shadow-premium backdrop-blur-sm group transition-all"
            >
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 group-hover:text-gray-400">{idx.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-white tracking-tighter">
                  {idx.type === 'fx' ? `₩ ${formatNumber(idx.value)}` : formatNumber(idx.value)}
                </span>
                <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${idx.change >= 0 ? 'bg-red-500/10 text-red-500 shadow-glow-red/20' : 'bg-blue-500/10 text-blue-500 shadow-glow-blue/20'}`}>
                  {idx.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(idx.changeRate)}%
                </div>
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
              <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500">
                <LineChart size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{locale === 'ko' ? '자산 성장 곡선' : 'Equity Curve'}</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('growthAnalytics')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{formatCurrency(accountSummary?.totalBalance || 0)}</span>
              <span className={`text-xs font-bold ${accountSummary?.totalProfit >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {accountSummary?.totalProfit >= 0 ? '+' : ''}{accountSummary?.profitRate}%
              </span>
            </div>
          </div>
          <div className="h-[320px] w-full">
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
                  formatter={(value: any) => [formatCurrency(value), locale === 'ko' ? '총 자산' : 'Total Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke="#ef4444" strokeWidth={4} fill="url(#equityColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Sentiment Gauge */}
        <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <Gauge size={18} className="text-blue-500 group-hover:rotate-12 transition-transform" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">{t('globalPulse')}</h2>
          </div>
          
          <div className="relative mt-8">
            <svg className="w-56 h-28" viewBox="0 0 100 50">
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
            <div className="text-center -mt-6">
              <h3 className="text-4xl font-black text-white tracking-tighter">{sentiment?.value}%</h3>
              <p className={`text-xs font-black uppercase tracking-widest mt-1 ${sentiment?.value > 70 ? 'text-red-500' : sentiment?.value < 30 ? 'text-blue-500' : 'text-green-500'}`}>
                {sentiment?.label || 'ANALYZING...'}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mt-10 w-full">
            <p className="text-center text-[11px] font-bold text-gray-400 leading-relaxed">
              {sentiment?.description || '시장 데이터를 기반으로 AI가 실시간 매수/매도 심리를 분석 중입니다.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Watchlist */}
        <div className="lg:col-span-3 bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500">
                <Star size={24} className="fill-current" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{locale === 'ko' ? '관심 종목' : 'Active Watchlist'}</h2>
            </div>
            <button onClick={() => navigate('/search')} className="text-xs font-black text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest">+ {t('addStocks')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                  <th className="pb-4 pl-2">{t('ticker')}</th>
                  <th className="pb-4 text-right">{t('price')}</th>
                  <th className="pb-4 text-right">{t('dayChange')}</th>
                  <th className="pb-4 text-center">{locale === 'ko' ? '관리' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {watchlistStocks.map((s) => (
                  <tr key={s.symbol} className="group cursor-pointer hover:bg-gray-800/20 transition-colors" onClick={() => navigate(`/stock/${s.symbol}`)}>
                    <td className="py-5 pl-2">
                      <p className="text-sm font-black text-white mb-0.5 group-hover:text-red-500 transition-colors">{s.name || s.symbol}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{s.symbol} · {s.market || 'MARKET'}</p>
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-black ${s.isLive ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {s.isLive ? 'LIVE' : 'MOCK'}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-right font-black text-white text-base">
                      {formatCurrency(s.currentPrice, s.currency)}
                    </td>
                    <td className={`py-5 text-right font-black ${s.changeRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {s.changeRate >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatPercent(s.changeRate)}
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <button onClick={(e) => { e.stopPropagation(); removeWatchlist(s.symbol); }} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {watchlistStocks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                      {t('noWatchlistStocks')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pulse & Allocation */}
        <div className="space-y-8">
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
                <PieIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">{t('allocation')}</h2>
            </div>
            <div className="h-[200px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getPieData()} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                    {getPieData().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {getPieData().slice(0, 4).map((item, index) => (
                <div key={item.name} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-glow" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{((item.value / getPieData().reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500">
                  <Zap size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">{t('marketPulse')}</h2>
              </div>
              <div className="flex p-1 bg-gray-900 rounded-lg">
                <button 
                  onClick={() => setMoversType('gainers')}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${moversType === 'gainers' ? 'bg-gray-800 text-white shadow-premium' : 'text-gray-500'}`}
                >
                  UP
                </button>
                <button 
                  onClick={() => setMoversType('losers')}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${moversType === 'losers' ? 'bg-gray-800 text-white shadow-premium' : 'text-gray-500'}`}
                >
                  DOWN
                </button>
              </div>
            </div>
            <div className="space-y-5">
              {(moversType === 'gainers' ? movers.gainers : movers.losers).slice(0, 5).map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between cursor-pointer group" onClick={() => navigate(`/stock/${stock.symbol}`)}>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white group-hover:text-red-500 transition-colors">{stock.name}</span>
                    <span className="text-[9px] text-gray-600 font-bold uppercase">{stock.symbol}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${moversType === 'gainers' ? 'text-red-500' : 'text-blue-500'}`}>
                      {moversType === 'gainers' ? '+' : ''}{stock.changeRate}%
                    </span>
                    <p className="text-[9px] text-gray-600 font-bold">{formatNumber(stock.currentPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Feed Section */}
      <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
        <div className="flex items-center justify-between mb-10 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
              <Newspaper size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{locale === 'ko' ? '시장 핵심 뉴스' : 'Market Intelligence'}</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">AI Sentiment Analysis Active</p>
            </div>
          </div>
          <button className="text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">View All News</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <div key={item.id} className="group relative bg-[#0d1117]/50 p-6 rounded-2xl border border-gray-800 hover:border-red-500/30 transition-all flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{item.source}</span>
                  <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                  <span className="text-[9px] text-gray-600 font-bold">{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                  item.sentiment === 'positive' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                  item.sentiment === 'negative' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                  'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                  {item.sentiment || 'neutral'}
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-4 group-hover:text-red-500 transition-colors line-clamp-2 leading-relaxed flex-1">
                {item.title}
              </h3>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-1">
                  <div className="h-1 w-12 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.score > 0.6 ? 'bg-green-500' : item.score < 0.4 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(item.score || 0.5) * 100}%` }}></div>
                  </div>
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">AI Score</span>
                </div>
                <ArrowUpRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
