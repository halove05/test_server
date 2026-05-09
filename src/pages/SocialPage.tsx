import { useEffect, useState } from 'react';
import { Trophy, Users, Star, TrendingUp, Copy, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { socialService } from '../services/socialService';
import type { LeaderboardEntry, PublicStrategy } from '../services/socialService';
import { strategyService } from '../services/strategyService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SocialPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [strategies, setStrategies] = useState<PublicStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'marketplace'>('leaderboard');
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

  const handleCopyStrategy = async (strategy: PublicStrategy) => {
    try {
      await strategyService.saveStrategy(strategy.config);
      toast.success(`'${strategy.name}' 전략을 나의 라이브러리에 복사했습니다!`, {
        icon: '📋',
      });
      navigate('/strategy');
    } catch (error) {
      toast.error('전략 복사에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium tracking-tight">커뮤니티 데이터를 연결 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <section>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Social Trading</h1>
        <p className="text-gray-500 font-bold">탑 트레이더들의 전략을 살펴보고 자신만의 포트폴리오에 적용하세요.</p>
      </section>

      <div className="flex p-1.5 bg-[#161b22] rounded-2xl w-fit shadow-premium">
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500'}`}
        >
          <Trophy size={18} /> LEADERBOARD
        </button>
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'marketplace' ? 'bg-[#1f242c] text-white shadow-premium' : 'text-gray-500'}`}
        >
          <Users size={18} /> MARKETPLACE
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'leaderboard' ? (
          <motion.div 
            key="leaderboard"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-[#161b22] rounded-3xl border border-gray-800 shadow-premium overflow-hidden"
          >
            <div className="p-8 border-b border-gray-800 bg-gray-900/20">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <Trophy className="text-yellow-500" /> Top Virtual Portfolios
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-gray-800">
                    <th className="px-8 py-5">Rank</th>
                    <th className="px-8 py-5">Trader</th>
                    <th className="px-8 py-5 text-right">Profit Rate</th>
                    <th className="px-8 py-5 text-right">Total P/L</th>
                    <th className="px-8 py-5 text-center">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-800/20 transition-colors group">
                      <td className="px-8 py-6">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' : 
                          index === 1 ? 'bg-gray-400/20 text-gray-400 border border-gray-400/20' : 
                          index === 2 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/20' : 
                          'text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-black text-white shadow-lg">
                            {entry.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{entry.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{entry.tradeCount} Trades</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-red-500 text-lg">+{entry.profitRate}%</td>
                      <td className="px-8 py-6 text-right font-black text-white">₩ {entry.totalProfit.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-black text-green-500">{entry.winRate}%</span>
                          <div className="w-16 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${entry.winRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="marketplace"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {strategies.map((strat) => (
              <div key={strat.id} className="bg-[#161b22] p-8 rounded-3xl border border-gray-800 shadow-premium flex flex-col hover:border-gray-600 transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-1">{strat.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={12} className="text-blue-500" /> Author: {strat.author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-red-500 tracking-tighter">+{strat.totalReturn}%</p>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Historical ROR</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8 flex-1">
                  {strat.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-900/50 p-3 rounded-2xl border border-gray-800 text-center">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Win Rate</p>
                    <p className="text-sm font-black text-white">{strat.winRate}%</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-2xl border border-gray-800 text-center">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Avg Drawdown</p>
                    <p className="text-sm font-black text-white">-4.2%</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleCopyStrategy(strat)}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 active:scale-95"
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
