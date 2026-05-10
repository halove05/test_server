import { useEffect, useState } from 'react';
import { Shield, Key, Bell, Save, AlertTriangle, Eye, EyeOff, CheckCircle2, Loader2, Globe, Target } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useLocaleStore } from '@/store/useLocaleStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [appKey, setAppKey] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  
  const [dailyLossLimit, setDailyLossLimit] = useState(5);
  const [maxInvestment, setMaxInvestment] = useState(20);
  const [isSavingRisk, setIsSavingRisk] = useState(false);
  
  const { locale, setLocale, t } = useLocaleStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/users/profile');
        const { apiKeys, settings } = res.data;
        if (apiKeys) {
          setAppKey(apiKeys.appKey || '');
          setAppSecret(apiKeys.appSecret || '');
          setAccountNo(apiKeys.accountNo || '');
        }
        if (settings) {
          setDailyLossLimit(settings.dailyLossLimit || 5);
          setMaxInvestment(settings.maxInvestmentPerStock || 20);
        }
      } catch (e) { console.error(e); }
    };
    fetchProfile();
  }, []);

  const saveKeys = async () => {
    setIsSavingKeys(true);
    try {
      await apiClient.post('/users/keys', { appKey, appSecret, accountNo });
      toast.success(t('saveApiKeys') + ' 성공');
    } catch (e) { toast.error('저장 실패'); }
    finally { setIsSavingKeys(false); }
  };

  const saveRisk = async () => {
    setIsSavingRisk(true);
    try {
      await apiClient.post('/users/settings', { dailyLossLimit, maxInvestmentPerStock: maxInvestment });
      toast.success(t('saveRiskSettings') + ' 성공');
    } catch (e) { toast.error('저장 실패'); }
    finally { setIsSavingRisk(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <section>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">{t('settings')}</h1>
        <p className="text-gray-500 font-bold">{t('settingsDescription')}</p>
      </section>

      <div className="grid grid-cols-1 gap-8">
        {/* Language Selection */}
        <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium group">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><Globe size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('language')}</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t('languageDescription')}</p>
            </div>
          </div>
          <div className="flex p-1.5 bg-[#0d1117] rounded-2xl w-fit">
            <button onClick={() => setLocale('ko')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${locale === 'ko' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500'}`}>한국어</button>
            <button onClick={() => setLocale('en')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${locale === 'en' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500'}`}>English</button>
          </div>
        </div>

        {/* API Credentials */}
        <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500"><Key size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{t('apiSettings')}</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">KIS API Connection</p>
              </div>
            </div>
            <button 
              onClick={saveKeys} 
              disabled={isSavingKeys}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isSavingKeys ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {t('saveApiKeys')}
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{t('appKey')}</label>
                <input type="text" value={appKey} onChange={(e) => setAppKey(e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all font-bold" placeholder="EX...) PSLeifQEUwPsyjv1..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Account Number</label>
                <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all font-bold" placeholder="8자리 계좌번호" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{t('appSecret')}</label>
              <div className="relative">
                <input type={showSecret ? 'text' : 'password'} value={appSecret} onChange={(e) => setAppSecret(e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all font-bold pr-14" placeholder="App Secret Key" />
                <button onClick={() => setShowSecret(!showSecret)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 flex gap-4 mt-4">
              <Shield size={20} className="text-red-500 shrink-0" />
              <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic">API 키는 본인의 브라우저 및 계정에만 안전하게 저장되며, 자동매매 실행 시 증권사 서버와의 통신에만 사용됩니다.</p>
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500"><Target size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{t('riskSettings')}</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Autonomous Safety Layer</p>
              </div>
            </div>
            <button 
              onClick={saveRisk} 
              disabled={isSavingRisk}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isSavingRisk ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {t('saveRiskSettings')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{t('dailyLossLimit')}</label>
                <span className="text-red-500 font-black text-lg">{dailyLossLimit}%</span>
              </div>
              <input type="range" min="1" max="20" step="1" value={dailyLossLimit} onChange={(e) => setDailyLossLimit(parseInt(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
              <p className="text-[10px] text-gray-600 font-bold">일일 평가 손익이 해당 수치에 도달하면 엔진을 즉시 정지합니다.</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{t('maxInvestmentPerStock')}</label>
                <span className="text-blue-500 font-black text-lg">{maxInvestment}%</span>
              </div>
              <input type="range" min="5" max="100" step="5" value={maxInvestment} onChange={(e) => setMaxInvestment(parseInt(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <p className="text-[10px] text-gray-600 font-bold">한 종목에 할당할 수 있는 최대 자산 비중을 제한합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
