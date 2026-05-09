import { useEffect, useState } from 'react';
import { Shield, Key, Bell, Save, AlertTriangle, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import apiClient from '../services/apiClient';

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [appKey, setAppKey] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [dailyLossLimit, setDailyLossLimit] = useState(5);
  const [maxInvestmentPerStock, setMaxInvestmentPerStock] = useState(20);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile');
      const { apiKeys, settings } = response.data;
      if (apiKeys) {
        setAppKey(apiKeys.appKey || '');
        setAppSecret(apiKeys.appSecret || '');
        setAccountNo(apiKeys.accountNo || '');
      }
      if (settings) {
        setDailyLossLimit(settings.dailyLossLimit || 5);
        setMaxInvestmentPerStock(settings.maxInvestmentPerStock || 20);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const handleSaveKeys = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/users/keys', { appKey, appSecret, accountNo });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      alert('API 키 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRisk = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/users/settings', { dailyLossLimit, maxInvestmentPerStock });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      alert('리스크 설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section>
        <h1 className="text-3xl font-bold text-white mb-2">설정</h1>
        <p className="text-gray-400">증권사 API 연동 및 리스크 관리 설정을 관리합니다.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/10">
            <Key size={20} />
            API 및 리스크 설정
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Brokerage Selection */}
          <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Key size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">증권사 API 설정</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">APP Key</label>
                  <div className="relative">
                    <input 
                      type={showApiKey ? "text" : "password"}
                      value={appKey}
                      onChange={(e) => setAppKey(e.target.value)}
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all pr-12"
                      placeholder="증권사 App Key"
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">APP Secret</label>
                  <input 
                    type="password"
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                    placeholder="증권사 App Secret"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">계좌번호 (CANO)</label>
                  <input 
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                    placeholder="8자리 계좌번호"
                  />
                </div>
              </div>
              <button onClick={handleSaveKeys} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all">API 키 저장</button>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Shield size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">리스크 관리 설정</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">1일 최대 손실 한도 (%)</label>
                <input 
                  type="number"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(parseFloat(e.target.value))}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">종목당 최대 투자 비중 (%)</label>
                <input 
                  type="number"
                  value={maxInvestmentPerStock}
                  onChange={(e) => setMaxInvestmentPerStock(parseFloat(e.target.value))}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>
            <button onClick={handleSaveRisk} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all">리스크 설정 저장</button>
          </div>

          {isSaved && (
            <div className="flex items-center justify-center gap-2 text-green-500 font-bold animate-bounce">
              <CheckCircle2 size={20} /> 설정이 성공적으로 반영되었습니다!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
