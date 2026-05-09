import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';

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
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <TrendingUp className="text-white" size={28} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter">QuantWave</h1>
      </div>

      <div className="w-full max-w-md bg-[#161b22] p-10 rounded-3xl border border-gray-800 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? '다시 오신 것을 환영합니다' : '새로운 시작을 함께하세요'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? '계정에 로그인하여 자동매매를 관리하세요.' : '간단한 가입으로 인공지능 트레이딩을 시작하세요.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium animate-in shake duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">이메일 주소</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-[#0d1117] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">비밀번호</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-[#0d1117] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? '로그인' : '회원가입'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'} 
            <span className="text-red-500 ml-2 font-bold">{isLogin ? '회원가입' : '로그인'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
