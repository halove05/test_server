import { useEffect, useState } from 'react';
import { AlertTriangle, Power, PowerOff, ShieldAlert, Loader2, History, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { kisService } from '../services/kisService';
import { motion } from 'framer-motion';

export default function TradingPage() {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mode, setMode] = useState<'mock' | 'real'>('mock');
  const [summary, setSummary] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [balance, tradeLogs] = await Promise.all([
        kisService.getAccountBalance(mode),
        kisService.getTradeLogs(mode)
      ]);
      setSummary(balance);
      setHoldings(balance.holdings || []);
      setLogs(tradeLogs.reverse());
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  const handleToggle = async () => {
    if (!isLiveActive) {
      if (mode === 'real') { setShowConfirm(true); return; }
      try { await kisService.toggleEngine(true, mode); setIsLiveActive(true); } catch (error) { console.error(error); }
    } else {
      try { await kisService.toggleEngine(false, mode); setIsLiveActive(false); } catch (error) { console.error(error); }
    }
  };

  const confirmLive = async () => {
    try { await kisService.toggleEngine(true, 'real'); setIsLiveActive(true); setShowConfirm(false); } catch (error) { alert('실패'); }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Trading Station</h1>
        <p className="text-gray-500 font-bold">자동매매 엔진 및 실시간 포트폴리오 관리</p>
      </div>

      {/* Mode & Engine Control */}
      <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex p-1.5 bg-[#0d1117] rounded-2xl">
          <button onClick={() => setMode('mock')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${mode === 'mock' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500'}`}>PAPER TRADING</button>
          <button onClick={() => setMode('real')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${mode === 'real' ? 'bg-red-500/10 text-red-500 shadow-glow-red' : 'text-gray-500'}`}><ShieldAlert size={16} /> LIVE TRADING</button>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Engine Status</p>
            <p className={`font-black text-lg tracking-tight ${isLiveActive ? 'text-green-500' : 'text-gray-500'}`}>{isLiveActive ? 'ACTIVE (ON)' : 'STANDBY (OFF)'}</p>
          </div>
          <button onClick={handleToggle} className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-premium active:scale-95 ${isLiveActive ? 'bg-green-600 shadow-green-500/10' : 'bg-gray-800'}`}>
            {isLiveActive ? <Power size={32} className="text-white" /> : <PowerOff size={32} className="text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Performance Analytics Grid */}
      {summary?.metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Win Rate</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{summary.metrics.winRate}%</h3>
            <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${summary.metrics.winRate}%` }}></div>
            </div>
          </div>
          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Profit Factor</p>
            <h3 className={`text-3xl font-black tracking-tighter ${summary.metrics.profitFactor >= 1.5 ? 'text-green-500' : 'text-white'}`}>{summary.metrics.profitFactor}</h3>
            <p className="text-[10px] text-gray-600 font-bold mt-2">Gross Profit / Gross Loss</p>
          </div>
          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Avg Gain / Loss</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-red-500">+{summary.metrics.avgGain?.toLocaleString()}</span>
              <span className="text-gray-700">/</span>
              <span className="text-xl font-black text-blue-500">-{summary.metrics.avgLoss?.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Executed</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{summary.metrics.totalTrades} <span className="text-sm text-gray-600">Orders</span></h3>
          </div>
        </div>
      )}

      {/* Holdings & Logs */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-[#161b22] rounded-3xl border border-gray-800 shadow-premium overflow-hidden">
          <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3"><BarChart3 size={24} className="text-red-500" /> Active Positions</h2>
            {isLoading && <Loader2 className="animate-spin text-gray-500" size={20} />}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                  <th className="px-8 py-5">Stock</th>
                  <th className="px-8 py-5 text-right">Avg Price</th>
                  <th className="px-8 py-5 text-right">Current</th>
                  <th className="px-8 py-5 text-right">Qty</th>
                  <th className="px-8 py-5 text-right">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {holdings.map((pos) => (
                  <tr key={pos.symbol} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white">{pos.name}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase">{pos.symbol}</p>
                    </td>
                    <td className="px-8 py-6 text-right text-gray-400 font-bold">₩ {pos.averagePrice?.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right font-black text-white">₩ {pos.currentPrice?.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right text-gray-400 font-bold">{pos.quantity}</td>
                    <td className={`px-8 py-6 text-right font-black text-lg ${pos.profitRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>{pos.profitRate > 0 ? '+' : ''}{pos.profitRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trade Logs */}
      <div className="bg-[#161b22] rounded-3xl border border-gray-800 shadow-premium overflow-hidden">
        <div className="p-8 border-b border-gray-800 flex items-center gap-3 bg-gray-900/20">
          <History className="text-blue-500" size={24} />
          <h2 className="text-xl font-black text-white tracking-tight">Trade History</h2>
        </div>
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-[#161b22] z-10 shadow-lg">
              <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Ticker</th>
                <th className="px-8 py-5 text-center">Type</th>
                <th className="px-8 py-5 text-right">Price</th>
                <th className="px-8 py-5 text-right">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-8 py-5 text-[10px] text-gray-600 font-bold">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-black text-white">{log.name}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${log.orderType === 'BUY' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>{log.orderType}</span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-black text-white">₩ {log.price?.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right text-[10px] text-gray-500 font-bold">{log.quantity} SHARES</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#161b22] p-10 rounded-3xl max-w-lg border border-red-500/30 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-red-500/20 rounded-2xl"><AlertTriangle className="text-red-500" size={32} /></div>
              <h2 className="text-2xl text-white font-black tracking-tighter">실제 자동매매 가동</h2>
            </div>
            <p className="text-gray-400 font-bold leading-relaxed mb-10">귀하가 설정한 전략에 따라 즉시 실전 주문이 전송될 수 있습니다. 충분한 검증을 거치셨습니까?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-6 py-3 rounded-xl text-gray-500 font-black hover:text-white transition-colors uppercase text-sm">Cancel</button>
              <button onClick={confirmLive} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-500/20 uppercase text-sm">Agree & Launch</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
