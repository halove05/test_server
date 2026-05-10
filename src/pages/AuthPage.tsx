import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, TrendingUp, Shield } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await apiClient.post(endpoint, { email, password });
      
      loginStore(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '인증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>

      {/* Brand Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-12 relative z-10"
      >
        <div className="w-14 h-14 bg-red-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-red-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
          <TrendingUp className="text-white" size={32} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">QuantWave</h1>
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mt-1 ml-1">Autonomous Alpha</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#161b22]/80 backdrop-blur-xl p-10 rounded-[32px] border border-gray-800 shadow-premium relative z-10"
      >
        <div className="mb-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-gray-500 font-bold text-sm">
            {isLogin ? 'Access your automated trading dashboard.' : 'Join the elite community of quantitative traders.'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-3"
          >
            <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 ml-1 uppercase tracking-widest">Email Identity</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500">
                <Mail className="h-5 w-5 text-gray-700" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-6 py-4 bg-[#0d1117] border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                placeholder="name@nexus.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 ml-1 uppercase tracking-widest">Secure Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500">
                <Lock className="h-5 w-5 text-gray-700" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-6 py-4 bg-[#0d1117] border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span className="uppercase tracking-widest">{isLogin ? 'Establish Link' : 'Initialize Account'}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-800/50 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            {isLogin ? 'New to the Nexus?' : 'Already identified?'} 
            <span className="text-red-500 ml-2 border-b border-red-500/30 hover:border-red-500 pb-0.5">{isLogin ? 'Register Now' : 'Login Here'}</span>
          </button>
        </div>
      </motion.div>

      {/* Security Badge */}
      <div className="mt-8 flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
        <Shield size={14} className="text-gray-500" />
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">End-to-End Encryption Active</span>
      </div>
    </div>
  );
}
