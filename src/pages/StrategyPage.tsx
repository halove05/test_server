import { useEffect, useState } from 'react';
import { Plus, Save, Play, Settings2, Trash2, Loader2, BarChart3, TrendingUp, TrendingDown, FolderOpen, Target, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { strategyService } from '../services/strategyService';
import type { Condition, Strategy } from '../services/strategyService';
import { motion } from 'framer-motion';
import { useLocaleStore } from '@/store/useLocaleStore';

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
  const { locale, t } = useLocaleStore();

  const conditionLabels: Record<string, string> = {
    RSI: 'RSI 과매수/과매도',
    PRICE: '현재가',
    MA: '20일 이동평균',
    MACD: 'MACD 추세',
    NEWS: '뉴스 심리',
  };

  const actionLabels: Record<string, string> = {
    BUY: '매수',
    SELL: '매도',
  };

  const operatorLabels: Record<string, string> = {
    '<=': '이하이면',
    '>=': '이상이면',
    '==': '같으면',
    CROSS: '돌파하면',
  };

  const getConditionSentence = (cond: Condition) => {
    const metric = locale === 'ko' ? conditionLabels[cond.type] || cond.type : cond.type;
    const operator = locale === 'ko' ? operatorLabels[cond.operator] || cond.operator : cond.operator;
    const action = locale === 'ko' ? actionLabels[cond.action] || cond.action : cond.action;
    return locale === 'ko'
      ? `${metric} 값이 ${cond.value} ${operator} ${action} 신호로 판단합니다.`
      : `If ${metric} ${cond.operator} ${cond.value}, trigger ${cond.action}.`;
  };

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
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">{t('strategyLab')}</h1>
          <p className="text-gray-500 font-bold">{t('strategyLabDescription')}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleBacktest} disabled={isBacktesting} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-premium"><Play size={20} /> {t('runTest')}</button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-red-500/20"><Save size={20} /> {t('saveLab')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium min-h-[400px]">
            <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3"><Settings2 className="text-orange-500" /> {locale === 'ko' ? '매매 조건 만들기' : 'Condition Blocks'}</h2>
                <p className="text-xs text-gray-500 font-bold mt-2 leading-relaxed">
                  {locale === 'ko'
                    ? '조건은 “어떤 지표가 어떤 값이 되면 매수/매도한다”는 규칙입니다. 예: RSI가 30 이하이면 과매도라 보고 매수합니다.'
                    : 'A condition is a rule: when an indicator reaches a value, the strategy buys or sells.'}
                </p>
              </div>
              <button onClick={() => setConditions([...conditions, { id: Date.now(), type: 'PRICE', operator: '<=', value: 70000, action: 'BUY' }])} className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold">{locale === 'ko' ? '조건 추가' : 'ADD BLOCK'}</button>
            </div>
            <div className="space-y-4">
              {conditions.map((cond, index) => (
                <div key={cond.id} className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800 group hover:border-gray-700 transition-all space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_1fr_auto] gap-4 items-end">
                    <label className="space-y-2">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{locale === 'ko' ? '지표' : 'Indicator'}</span>
                      <select className="w-full bg-[#0d1117] text-white font-bold outline-none cursor-pointer rounded-xl border border-gray-800 px-3 py-3" value={cond.type} onChange={(e) => { const n = [...conditions]; n[index].type = e.target.value; setConditions(n); }}>
                        <option value="RSI">{locale === 'ko' ? 'RSI 과매수/과매도' : 'RSI (14)'}</option>
                        <option value="PRICE">{locale === 'ko' ? '현재가' : 'Price'}</option>
                        <option value="MA">{locale === 'ko' ? '20일 이동평균' : 'MA (20)'}</option>
                        <option value="MACD">{locale === 'ko' ? 'MACD 추세' : 'MACD'}</option>
                        <option value="NEWS">{locale === 'ko' ? '뉴스 심리' : 'Sentiment'}</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{locale === 'ko' ? '판단 기준' : 'Rule'}</span>
                      <select className="w-full bg-[#0d1117] text-gray-300 font-bold outline-none cursor-pointer rounded-xl border border-gray-800 px-3 py-3" value={cond.operator} onChange={(e) => { const n = [...conditions]; n[index].operator = e.target.value; setConditions(n); }}>
                        <option value="<=">{locale === 'ko' ? '이하이면' : '<='}</option>
                        <option value=">=">{locale === 'ko' ? '이상이면' : '>='}</option>
                        <option value="==">{locale === 'ko' ? '같으면' : '=='}</option>
                        <option value="CROSS">{locale === 'ko' ? '돌파하면' : 'CROSS'}</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{locale === 'ko' ? '값' : 'Value'}</span>
                      <input type="text" value={cond.value} className="w-full bg-[#0d1117] text-white rounded-xl border border-gray-800 px-3 py-3 text-center font-bold outline-none focus:ring-1 focus:ring-red-500" onChange={(e) => { const n = [...conditions]; n[index].value = e.target.value; setConditions(n); }} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{locale === 'ko' ? '실행' : 'Action'}</span>
                      <select className="w-full bg-[#0d1117] font-black outline-none cursor-pointer rounded-xl border border-gray-800 px-3 py-3" value={cond.action} onChange={(e) => { const n = [...conditions]; n[index].action = e.target.value; setConditions(n); }}>
                        <option value="BUY" className="text-red-500">{locale === 'ko' ? '매수' : 'BUY'}</option>
                        <option value="SELL" className="text-blue-500">{locale === 'ko' ? '매도' : 'SELL'}</option>
                      </select>
                    </label>
                    <button onClick={() => setConditions(conditions.filter(c => c.id !== cond.id))} className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={18} /></button>
                  </div>
                  <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-4 py-3 text-xs font-bold text-blue-200">
                    {getConditionSentence(cond)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {backtestResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium space-y-10">
              <div className="flex items-center justify-between border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3"><BarChart3 className="text-red-500" /> {locale === 'ko' ? '시뮬레이션 분석' : 'Simulation Analytics'}</h2>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{targetSymbol} / {period} {locale === 'ko' ? '일' : 'Days'}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Return</p><p className={`text-3xl font-black tracking-tighter ${backtestResult.totalReturn >= 0 ? 'text-red-500' : 'text-blue-500'}`}>{backtestResult.totalReturn}%</p></div>
                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{t('winRate')}</p><p className="text-3xl font-black text-white tracking-tighter">{backtestResult.winRate}%</p></div>
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
            <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2"><FolderOpen size={16} className="text-blue-500" /> {locale === 'ko' ? '전략 보관함' : 'Strategy Library'}</h2>
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
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Target size={16} className="text-red-500" /> {locale === 'ko' ? '시뮬레이션 설정' : 'Simulation Settings'}</h2>
            <div className="space-y-4">
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 mb-2 block">{t('ticker')}</label><input type="text" className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white font-black" value={targetSymbol} onChange={(e) => setTargetSymbol(e.target.value)} /></div>
              <div><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 mb-2 block">{locale === 'ko' ? '기간' : 'Window (Days)'}</label><select className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white font-black" value={period} onChange={(e) => setPeriod(parseInt(e.target.value))}><option value={7}>7 {locale === 'ko' ? '일' : 'DAYS'}</option><option value={30}>30 {locale === 'ko' ? '일' : 'DAYS'}</option><option value={90}>90 {locale === 'ko' ? '일' : 'DAYS'}</option><option value={365}>1 {locale === 'ko' ? '년' : 'YEAR'}</option></select></div>
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
