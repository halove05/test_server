import { useEffect, useState } from 'react';
import { Plus, Save, Play, Settings2, Trash2, Loader2, BarChart3, TrendingUp, TrendingDown, FolderOpen, Target, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { strategyService } from '../services/strategyService';
import type { Condition, Strategy } from '../services/strategyService';
import { motion } from 'framer-motion';

export default function StrategyPage() {
  const [conditions, setConditions] = useState<Condition[]>([{ id: 1, type: 'RSI', operator: '<=', value: 30, action: 'BUY' }]);
  const [strategyName, setStrategyName] = useState('새로운 전략');
  const [investment, setInvestment] = useState(1000000);
  const [isStopLossActive, setIsStopLossActive] = useState(true);
  const [savedStrategies, setSavedStrategies] = useState<Strategy[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [targetSymbol, setTargetSymbol] = useState('005930');
  const [period, setPeriod] = useState(30);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  useEffect(() => { fetchStrategies(); }, []);

  const fetchStrategies = async () => {
    setIsLoadingList(true);
    try { setSavedStrategies(await strategyService.getStrategies()); } catch (error) { console.error(error); } finally { setIsLoadingList(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await strategyService.saveStrategy({ name: strategyName, conditions, investmentPerOrder: investment, isStopLossActive, stopLossRate: -5 });
      alert('저장 완료'); fetchStrategies();
    } catch (error) { alert('실패'); } finally { setIsSaving(false); }
  };

  const handleBacktest = async () => {
    setIsBacktesting(true);
    setBacktestResult(null);
    try {
      const result = await strategyService.runBacktest({ name: strategyName, conditions, investmentPerOrder: investment, isStopLossActive, stopLossRate: -5 }, targetSymbol, period);
      setBacktestResult(result);
    } catch (error) { alert('실패'); } finally { setIsBacktesting(false); }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Strategy Lab</h1>
          <p className="text-gray-500 font-bold">알고리즘 설계 및 과거 성과 시뮬레이션</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleBacktest} disabled={isBacktesting} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-premium"><Play size={20} /> RUN TEST</button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-red-500/20"><Save size={20} /> SAVE LAB</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium min-h-[400px]">
            <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3"><Settings2 className="text-orange-500" /> Condition Blocks</h2>
              <button onClick={() => setConditions([...conditions, { id: Date.now(), type: 'PRICE', operator: '<=', value: 70000, action: 'BUY' }])} className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold">ADD BLOCK</button>
            </div>
            <div className="space-y-4">
              {conditions.map((cond, index) => (
                <div key={cond.id} className="flex items-center gap-4 bg-gray-900/40 p-5 rounded-2xl border border-gray-800 group hover:border-gray-700 transition-all">
                  <span className="text-blue-500 font-black text-sm">IF</span>
                  <select className="bg-transparent text-white font-bold outline-none cursor-pointer" value={cond.type} onChange={(e) => { const n = [...conditions]; n[index].type = e.target.value; setConditions(n); }}>
                    <option value="RSI">RSI (14)</option><option value="PRICE">Price</option><option value="MA">MA (20)</option><option value="MACD">MACD</option><option value="NEWS">Sentiment</option>
                  </select>
                  <select className="bg-transparent text-gray-400 font-bold outline-none cursor-pointer" value={cond.operator} onChange={(e) => { const n = [...conditions]; n[index].operator = e.target.value; setConditions(n); }}>
                    <option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="==">==</option><option value="CROSS">CROSS</option>
                  </select>
                  <input type="text" value={cond.value} className="bg-gray-800 text-white rounded-lg px-3 py-1 w-24 text-center font-bold outline-none focus:ring-1 focus:ring-red-500" onChange={(e) => { const n = [...conditions]; n[index].value = e.target.value; setConditions(n); }} />
                  <span className="text-blue-500 font-black text-sm">THEN</span>
                  <select className="bg-transparent font-black outline-none cursor-pointer" value={cond.action} onChange={(e) => { const n = [...conditions]; n[index].action = e.target.value; setConditions(n); }}>
                    <option value="BUY" className="text-red-500">BUY</option><option value="SELL" className="text-blue-500">SELL</option>
                  </select>
                  <div className="flex-1"></div>
                  <button onClick={() => setConditions(conditions.filter(c => c.id !== cond.id))} className="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>

          {backtestResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium space-y-10">
              <div className="flex items-center justify-between border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3"><BarChart3 className="text-red-500" /> Simulation Analytics</h2>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{targetSymbol} / {period} Days</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Return</p><p className={`text-3xl font-black tracking-tighter ${backtestResult.totalReturn >= 0 ? 'text-red-500' : 'text-blue-500'}`}>{backtestResult.totalReturn}%</p></div>
                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Win Rate</p><p className="text-3xl font-black text-white tracking-tighter">{backtestResult.winRate}%</p></div>
                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Max Drawdown</p><p className="text-3xl font-black text-blue-400 tracking-tighter">{backtestResult.maxDrawdown}%</p></div>
                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Sharpe Ratio</p><p className="text-3xl font-black text-orange-400 tracking-tighter">{backtestResult.sharpeRatio}</p></div>
              </div>
              <div className="h-[300px] w-full">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">Equity Growth Curve</p>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={backtestResult.chartData}>
                    <defs><linearGradient id="backtestColor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="date" hide /><YAxis hide domain={['dataMin - 100000', 'dataMax + 100000']} />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '16px' }} itemStyle={{ fontWeight: 'black', color: '#fff' }} />
                    <Area type="monotone" dataKey="equity" stroke="#ef4444" strokeWidth={4} fill="url(#backtestColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 shadow-premium">
            <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2"><FolderOpen size={16} className="text-blue-500" /> Strategy Library</h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {savedStrategies.map((s) => (
                <div key={s.id} className="group p-4 bg-gray-900/40 rounded-2xl border border-gray-800 hover:border-gray-600 cursor-pointer transition-all" onClick={() => { setStrategyName(s.name); setConditions(s.conditions); setInvestment(s.investmentPerOrder); setIsStopLossActive(s.isStopLossActive); setBacktestResult(null); }}>
                  <p className="text-sm font-black text-white mb-1 truncate">{s.name}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">{s.conditions.length} Blocks · ₩ {s.investmentPerOrder.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium space-y-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Target size={16} className="text-red-500" /> Simulation Settings</h2>
            <div className="space-y-4">
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 mb-2 block">Ticker</label><input type="text" className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white font-black" value={targetSymbol} onChange={(e) => setTargetSymbol(e.target.value)} /></div>
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 mb-2 block">Window (Days)</label><select className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white font-black" value={period} onChange={(e) => setPeriod(parseInt(e.target.value))}><option value={7}>7 DAYS</option><option value={30}>30 DAYS</option><option value={90}>90 DAYS</option><option value={365}>1 YEAR</option></select></div>
            </div>
          </div>
          <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/10 flex gap-4">
            <AlertTriangle className="text-red-500 shrink-0" />
            <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic">과거의 성과가 미래의 수익을 보장하지 않습니다. 백테스트 데이터는 의사결정 보조용으로만 활용하십시오.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
