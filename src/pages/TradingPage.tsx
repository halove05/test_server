import { useEffect, useState } from 'react';
import { AlertTriangle, Power, PowerOff, ShieldAlert, Loader2, History, BarChart3 } from 'lucide-react';
import { kisService } from '../services/kisService';
import { motion } from 'framer-motion';
import { useLocaleStore } from '@/store/useLocaleStore';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

export default function TradingPage() {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mode, setMode] = useState<'mock' | 'real'>('mock');
  const [summary, setSummary] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const { locale, t } = useLocaleStore();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [balanceRes, logsRes] = await Promise.all([
        kisService.getAccountBalance(mode),
        kisService.getTradeLogs(mode)
      ]);
      setSummary(balanceRes);
      setHoldings(balanceRes.holdings || []);
      setLogs(logsRes || []);
      
      // 엔진 상태 동기화
      const engineRes = await apiClient.post('/trading/real/toggle', {}); 
      setIsLiveActive(engineRes.data.active && engineRes.data.mode === mode);
    } catch (error) {
      console.error('Trading page refresh failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // 자동 매매 루프 (엔진이 켜져있을 때만)
    let scanInterval: any;
    if (isLiveActive) {
      scanInterval = setInterval(async () => {
        setIsScanning(true);
        try {
          await apiClient.post('/trading/scan');
          fetchData(); // 주문 결과 반영을 위해 데이터 갱신
        } catch (e) {
          console.error('Scan failed', e);
        } finally {
          setIsScanning(false);
        }
      }, 60000); // 1분마다 스캔
    }

    return () => clearInterval(scanInterval);
  }, [isLiveActive, mode]);

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">{t('tradingStation')}</h1>
          <p className="text-gray-500 font-bold">{t('tradingStationDescription')}</p>
        </div>
        <div className="bg-[#161b22] px-6 py-4 rounded-2xl border border-gray-800 shadow-premium flex flex-col items-end">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Equity</p>
          <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(summary?.totalBalance || 0)}</p>
        </div>
      </div>

      {/* Mode & Engine Control */}
      <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex p-1.5 bg-[#0d1117] rounded-2xl z-10">
          <button onClick={() => setMode('mock')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${mode === 'mock' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500'}`}>{t('paperTrading')}</button>
          <button onClick={() => setMode('real')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${mode === 'real' ? 'bg-red-500/10 text-red-500 shadow-glow-red' : 'text-gray-500'}`}><ShieldAlert size={16} /> {t('liveTrading')}</button>
        </div>

        <div className="flex items-center gap-8 z-10">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              {isScanning && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex items-center gap-1 text-[8px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter"
                >
                  <Loader2 size={10} className="animate-spin" /> Scanning
                </motion.span>
              )}
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{t('engineStatus')}</p>
            </div>
            <p className={`font-black text-lg tracking-tight ${isLiveActive ? 'text-green-500' : 'text-gray-500'}`}>{isLiveActive ? (locale === 'ko' ? '가동 중' : 'ACTIVE') : t('standby')}</p>
          </div>
          <button onClick={handleToggle} className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-premium active:scale-95 ${isLiveActive ? 'bg-green-600 shadow-glow-green' : 'bg-gray-800 hover:bg-gray-700'}`}>
            {isLiveActive ? <Power size={32} className="text-white animate-pulse" /> : <PowerOff size={32} className="text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Performance Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium group">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">{t('winRate')}</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{summary?.metrics?.winRate || 0}%</h3>
          <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${summary?.metrics?.winRate || 0}%` }} className="h-full bg-green-500"></motion.div>
          </div>
        </div>
        <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Sharpe Ratio</p>
          <h3 className={`text-3xl font-black tracking-tighter ${summary?.metrics?.sharpeRatio >= 1.0 ? 'text-green-500' : 'text-white'}`}>{summary?.metrics?.sharpeRatio || '0.00'}</h3>
          <p className="text-[10px] text-gray-600 font-bold mt-2">Risk-Adj. Return</p>
        </div>
        <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Max Drawdown</p>
          <h3 className="text-3xl font-black text-blue-400 tracking-tighter">{summary?.metrics?.mdd || 0}%</h3>
          <p className="text-[10px] text-gray-600 font-bold mt-2">Peak to Valley</p>
        </div>
        <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Profit</p>
          <div className="flex flex-col">
            <h3 className={`text-2xl font-black tracking-tighter ${(summary?.totalProfit || 0) >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
              {formatCurrency(summary?.totalProfit || 0)}
            </h3>
            <p className={`text-xs font-bold ${(summary?.profitRate || 0) >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
              {formatPercent(summary?.profitRate || 0)}
            </p>
          </div>
        </div>
        <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{t('totalExecuted')}</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{summary?.metrics?.totalTrades || 0} <span className="text-sm text-gray-600">{locale === 'ko' ? '건' : 'Orders'}</span></h3>
        </div>
      </div>

      {/* Holdings & Logs */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-[#161b22] rounded-3xl border border-gray-800 shadow-premium overflow-hidden">
          <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3"><BarChart3 size={24} className="text-red-500" /> {t('activePositions')}</h2>
            {isLoading && <Loader2 className="animate-spin text-gray-500" size={20} />}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                  <th className="px-8 py-5">{locale === 'ko' ? '종목' : 'Stock'}</th>
                  <th className="px-8 py-5 text-right">{locale === 'ko' ? '평균가' : 'Avg Price'}</th>
                  <th className="px-8 py-5 text-right">{locale === 'ko' ? '현재가' : 'Current'}</th>
                  <th className="px-8 py-5 text-right">{locale === 'ko' ? '수량' : 'Qty'}</th>
                  <th className="px-8 py-5 text-right">{locale === 'ko' ? '수익률' : 'Return'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {holdings.map((pos) => (
                  <tr key={pos.symbol} className="hover:bg-gray-800/20 transition-colors group cursor-pointer" onClick={() => navigate(`/stock/${pos.symbol}`)}>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white group-hover:text-red-500 transition-colors">{pos.name}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase">{pos.symbol}</p>
                    </td>
                    <td className="px-8 py-6 text-right text-gray-400 font-bold">{formatCurrency(pos.averagePrice)}</td>
                    <td className="px-8 py-6 text-right font-black text-white">{formatCurrency(pos.currentPrice)}</td>
                    <td className="px-8 py-6 text-right text-gray-400 font-bold">{formatNumber(pos.quantity)}</td>
                    <td className={`px-8 py-6 text-right font-black text-lg ${pos.profitRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {formatPercent(pos.profitRate)}
                    </td>
                  </tr>
                ))}
                {holdings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">보유 포지션이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trade Logs */}
      <div className="bg-[#161b22] rounded-3xl border border-gray-800 shadow-premium overflow-hidden">
        <div className="p-8 border-b border-gray-800 flex items-center gap-3 bg-gray-900/20">
          <History className="text-blue-500" size={24} />
          <h2 className="text-xl font-black text-white tracking-tight">{t('tradeHistory')}</h2>
        </div>
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-[#161b22] z-10 shadow-lg">
              <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                <th className="px-8 py-5">{locale === 'ko' ? '시간' : 'Timestamp'}</th>
                <th className="px-8 py-5">{t('ticker')}</th>
                <th className="px-8 py-5 text-center">{locale === 'ko' ? '구분' : 'Type'}</th>
                <th className="px-8 py-5 text-right">{t('price')}</th>
                <th className="px-8 py-5 text-right">{locale === 'ko' ? '수량' : 'Qty'}</th>
                <th className="px-8 py-5">{locale === 'ko' ? '매매 사유' : 'Reason / Indicators'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-8 py-5 text-[10px] text-gray-600 font-bold">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-black text-white">{log.name}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${log.orderType === 'BUY' ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-glow-red/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-glow-blue/20'}`}>{log.orderType}</span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-black text-white">{formatCurrency(log.price)}</td>
                  <td className="px-8 py-5 text-right text-[10px] text-gray-500 font-bold">{formatNumber(log.quantity)} SHARES</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800">{log.reason || 'Manual Trade'}</span>
                    </div>
                  </td>
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
              <button onClick={() => setShowConfirm(false)} className="px-6 py-3 rounded-xl text-gray-500 font-black hover:text-white transition-colors uppercase text-sm">{t('cancel')}</button>
              <button onClick={confirmLive} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-500/20 uppercase text-sm">Agree & Launch</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
