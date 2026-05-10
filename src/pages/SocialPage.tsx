import { useEffect, useState } from 'react';
import { Trophy, Users, Star, TrendingUp, Copy, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { socialService } from '../services/socialService';
import type { LeaderboardEntry, PublicStrategy } from '../services/socialService';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocaleStore } from '@/store/useLocaleStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SocialPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [strategies, setStrategies] = useState<PublicStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'strategies'>('leaderboard');
  const { t } = useLocaleStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lb, strats] = await Promise.all([
          socialService.getLeaderboard(),
          socialService.getPublicStrategies()
        ]);
        setLeaderboard(lb);
        setStrategies(strats);
      } catch (error) {
        console.error('Failed to fetch social data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = async (id: number | string) => {
    try {
      await socialService.copyStrategy(id);
      toast.success('전략이 내 보관함으로 복사되었습니다!', { icon: '📥' });
      setTimeout(() => navigate('/strategy'), 1500);
    } catch (e) {
      toast.error('복사 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium tracking-tight">Syncing Social Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <section>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Social Lab</h1>
        <p className="text-gray-500 font-bold">전 세계 우수 트레이더들의 전략을 분석하고 내 계좌로 복사하세요.</p>
      </section>

      {/* Tabs */}
      <div className="flex p-1.5 bg-[#161b22] rounded-2xl w-fit border border-gray-800 shadow-premium">
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-8 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'leaderboard' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Trophy size={16} /> {t('leaderboard')}
        </button>
        <button 
          onClick={() => setActiveTab('strategies')}
          className={`px-8 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'strategies' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Star size={16} /> {t('publicStrategies')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'leaderboard' ? (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 gap-6"
          >
            <div className="bg-[#161b22] rounded-3xl border border-gray-800 overflow-hidden shadow-premium">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                    <th className="px-8 py-5">Rank</th>
                    <th className="px-8 py-5">Trader</th>
                    <th className="px-8 py-5 text-right">Profit Rate</th>
                    <th className="px-8 py-5 text-right">Total Profit</th>
                    <th className="px-8 py-5 text-right">Trades</th>
                    <th className="px-8 py-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-gray-800/20 transition-all group">
                      <td className="px-8 py-6">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-gray-400/20 text-gray-400' : idx === 2 ? 'bg-orange-800/20 text-orange-800' : 'text-gray-600'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-800 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-gray-700">{entry.avatar}</div>
                          <div>
                            <p className="text-sm font-black text-white group-hover:text-red-500 transition-colors">{entry.name}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Verified Trader</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-red-500 text-lg">+{entry.profitRate}%</td>
                      <td className="px-8 py-6 text-right font-black text-white">₩ {entry.totalProfit.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right font-bold text-gray-500">{entry.tradeCount}</td>
                      <td className="px-8 py-6 text-center">
                        <button className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-red-500/50 transition-all">
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="strategies"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {strategies.map((strat) => (
              <div key={strat.id} className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium hover:border-red-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-red-500 transition-colors">{strat.name}</h3>
                    <p className="text-xs font-bold text-gray-500 flex items-center gap-2">by <span className="text-gray-300">{strat.author}</span> <ShieldCheck size={12} className="text-blue-500" /></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Success Rate</p>
                    <p className="text-lg font-black text-green-500">{strat.winRate}%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8 h-12 overflow-hidden line-clamp-2">{strat.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Return</p>
                    <p className="text-xl font-black text-white">+{strat.totalReturn}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Avg Trade</p>
                    <p className="text-xl font-black text-white">3.2d</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopy(strat.id)}
                  className="w-full py-4 bg-gray-800 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-premium flex items-center justify-center gap-3 active:scale-95"
                >
                  <Copy size={20} /> COPY STRATEGY
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
