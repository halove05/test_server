import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShoppingCart, 
  Loader2,
  LineChart as LineChartIcon,
  Layers,
  BrainCircuit,
  Info,
  Calendar,
  BarChart3,
  Newspaper
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, CartesianGrid, Legend } from 'recharts';
import { marketService } from '@/services/marketService';
import type { StockPrice, ChartData, OrderBook, Fundamentals } from '@/services/marketService';
import { kisService } from '@/services/kisService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import apiClient from '@/services/apiClient';
import TradingViewChart from '@/components/TradingViewChart';

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [stock, setStock] = useState<StockPrice | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null);
  const [specificNews, setSpecificNews] = useState<any[]>([]);
  const [aiSignal, setAiSignal] = useState<any>(null);
  const [period, setPeriod] = useState<'1D' | '1M'>('1D');
  const [isLoading, setIsLoading] = useState(true);
  
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradingMode, setTradingMode] = useState<'mock' | 'real'>('mock');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      try {
        const [priceData, chart, book, signal, fund, news] = await Promise.all([
          marketService.getStockPrice(symbol),
          marketService.getChartData(symbol, period),
          marketService.getOrderBook(symbol),
          apiClient.get(`/market/signal/${symbol}`).then(res => res.data),
          marketService.getFundamentals(symbol),
          marketService.getSpecificNews(symbol)
        ]);
        setStock(priceData);
        setChartData(chart);
        setOrderBook(book);
        setAiSignal(signal);
        setFundamentals(fund);
        setSpecificNews(news);
        if (price === 0) setPrice(priceData.currentPrice);
      } catch (error) {
        console.error('Failed to fetch stock detail', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [symbol, period]);

  const handleOrder = async () => {
    if (!symbol || !stock) return;
    setIsSubmitting(true);
    try {
      await kisService.placeOrder({ symbol, orderType, price, quantity, mode: tradingMode });
      toast.success(`${orderType === 'BUY' ? '매수' : '매도'} 주문이 접수되었습니다.`, { icon: '🚀' });
    } catch (error: any) {
      toast.error('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !stock) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium tracking-tight">Market Link Established...</p>
      </div>
    );
  }

  if (!stock) return <div className="text-center py-20"><button onClick={() => navigate(-1)} className="text-red-500 font-bold">뒤로 가기</button></div>;

  const isUp = stock.changeAmount >= 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tighter">{stock.name || symbol}</h1>
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded uppercase font-black tracking-widest">{symbol} · {stock.market || 'MARKET'}</span>
              <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-black tracking-widest ${stock.isLive ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                {stock.isLive ? '실시간 KIS' : '샘플 시세'}
              </span>
            </div>
            {!stock.isLive && stock.fallbackReason && (
              <p className="mt-2 max-w-2xl text-xs font-bold text-yellow-500/80">
                KIS 실시간 시세를 가져오지 못해 샘플 시세를 표시 중입니다. 설정에서 KIS App Key, App Secret, 계좌번호를 저장하거나 Cloudflare 환경변수를 확인하세요.
              </p>
            )}
          </div>
        </div>
        
        {aiSignal && (
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${aiSignal.signal === 'BUY' ? 'bg-red-500/10 border-red-500/20 text-red-500' : aiSignal.signal === 'SELL' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
            <BrainCircuit size={20} className={aiSignal.signal !== 'HOLD' ? 'animate-pulse' : ''} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">AI Signal</p>
              <p className="text-sm font-black tracking-tight">{aiSignal.signal} ({aiSignal.score}pts)</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Main Chart Card */}
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 block">Live Price</span>
                <div className="flex items-end gap-3">
                  <h2 className="text-6xl font-black text-white tracking-tighter">{stock.currency === 'USD' ? '$ ' : '₩ '}{stock.currentPrice.toLocaleString()}</h2>
                  <div className={`flex items-center gap-1 text-xl font-black mb-1.5 ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
                    {isUp ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    {stock.changeRate}%
                  </div>
                </div>
              </div>
              <div className="flex gap-2 p-1 bg-gray-900 rounded-xl">
                <button onClick={() => setPeriod('1D')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${period === '1D' ? 'bg-gray-800 text-white shadow-premium' : 'text-gray-500'}`}>INTRA-DAY</button>
                <button onClick={() => setPeriod('1M')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${period === '1M' ? 'bg-gray-800 text-white shadow-premium' : 'text-gray-500'}`}>DAILY (1M)</button>
              </div>
            </div>

            <div className="space-y-10">
              <div className="h-[400px] w-full">
                <TradingViewChart data={chartData} height={400} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-800/50 pt-8">
                <div className="h-[120px]">
                  <div className="flex items-center justify-between mb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Activity size={14} className="text-green-500" /><span>RSI (14)</span></div>
                    <span className="text-white">{chartData[chartData.length-1]?.rsi?.toFixed(1)}</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}><YAxis domain={[0, 100]} hide /><Area type="monotone" dataKey="rsi" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} dot={false} /></AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-900/30 rounded-2xl p-5 border border-gray-800">
                  <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-gray-500 uppercase tracking-widest"><Info size={14} className="text-blue-500" /><span>AI Analysis Logic</span></div>
                  <p className="text-xs font-bold text-gray-400 leading-relaxed">{aiSignal?.reason || '분석 데이터를 계산 중입니다...'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Fundamentals Card */}
            <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                  <BarChart3 size={24} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">재무 핵심 지표</h2>
              </div>
              {fundamentals ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">PER (주가수익비율)</p>
                    <p className="text-lg font-black text-white">{fundamentals.per}x</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">PBR (주가순자산비율)</p>
                    <p className="text-lg font-black text-white">{fundamentals.pbr}x</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">EPS (주당순이익)</p>
                    <p className="text-lg font-black text-white">₩ {fundamentals.eps.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">배당수익률</p>
                    <p className="text-lg font-black text-green-500">{fundamentals.dividendYield}%</p>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-gray-800">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">52주 최고/최저</p>
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 font-bold text-sm">₩ {fundamentals.w52High.toLocaleString()}</span>
                      <div className="flex-1 h-1 bg-gray-800 rounded-full relative">
                        <div className="absolute top-0 bottom-0 bg-gray-600" style={{ left: '30%', right: '40%' }}></div>
                      </div>
                      <span className="text-blue-500 font-bold text-sm">₩ {fundamentals.w52Low.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : <Loader2 className="animate-spin" />}
            </div>

            {/* Specific News Card */}
            <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
                  <Newspaper size={24} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">종목 관련 소식</h2>
              </div>
              <div className="space-y-6">
                {specificNews.map((news) => (
                  <div key={news.id} className="group cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-blue-500 uppercase">{news.source}</span>
                      <span className="text-[10px] text-gray-600 font-bold">방금 전</span>
                    </div>
                    <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors leading-snug">
                      {news.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Depth */}
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
            <div className="flex items-center gap-3 mb-8"><div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><Layers size={24} /></div><h2 className="text-xl font-bold text-white tracking-tight">Market Depth Analysis</h2></div>
            {orderBook ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  {orderBook.asks.map((level, idx) => (
                    <div key={`ask-${idx}`} className="relative h-9 flex items-center justify-between px-4 rounded-lg bg-blue-500/5 group">
                      <div className="absolute right-0 top-0 bottom-0 bg-blue-500/10 rounded-r-lg transition-all duration-700" style={{ width: `${Math.min(100, (level.volume / 30000) * 100)}%` }}></div>
                      <span className="text-blue-400 font-black text-xs z-10">{level.price.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-600 font-bold z-10">{level.volume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {orderBook.bids.map((level, idx) => (
                    <div key={`bid-${idx}`} className="relative h-9 flex items-center justify-between px-4 rounded-lg bg-red-500/5 group">
                      <div className="absolute left-0 top-0 bottom-0 bg-red-500/10 rounded-l-lg transition-all duration-700" style={{ width: `${Math.min(100, (level.volume / 30000) * 100)}%` }}></div>
                      <span className="text-red-400 font-black text-xs z-10">{level.price.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-600 font-bold z-10">{level.volume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <Loader2 className="mx-auto animate-spin" />}
          </div>
        </div>

        {/* Sidebar: Order Panel */}
        <div className="space-y-6">
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium sticky top-6">
            <div className="flex items-center gap-3 mb-8"><div className="p-2 bg-red-500/10 rounded-xl text-red-500"><ShoppingCart size={20} /></div><h2 className="text-lg font-bold text-white">Execution</h2></div>
            <div className="flex p-1.5 bg-[#0d1117] rounded-2xl mb-8">
              <button onClick={() => setTradingMode('mock')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${tradingMode === 'mock' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500'}`}>MOCK</button>
              <button onClick={() => setTradingMode('real')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${tradingMode === 'real' ? 'bg-red-500/10 text-red-500' : 'text-gray-500'}`}>LIVE</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setOrderType('BUY')} className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${orderType === 'BUY' ? 'bg-red-500/10 border-red-500 text-red-500 shadow-glow-red' : 'border-gray-800 text-gray-600'}`}>BUY</button>
              <button onClick={() => setOrderType('SELL')} className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${orderType === 'SELL' ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-glow-blue' : 'border-gray-800 text-gray-600'}`}>SELL</button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Price</label><input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value))} className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-all font-black text-lg" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Quantity</label><input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none font-black text-lg" /></div>
              <div className="pt-6 border-t border-gray-800/50">
                <div className="flex justify-between items-end mb-6"><span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total</span><span className="text-xl font-black text-white">₩ {(price * quantity).toLocaleString()}</span></div>
                <button onClick={handleOrder} disabled={isSubmitting} className={`w-full py-5 rounded-2xl font-black text-white shadow-premium transition-all ${isSubmitting ? 'bg-gray-800' : orderType === 'BUY' ? 'bg-red-600' : 'bg-blue-600'}`}>EXECUTE {orderType}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
