import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Cpu, 
  Wallet, 
  Settings, 
  TrendingUp, 
  Bell, 
  LogOut, 
  Menu,
  X,
  Trophy,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/services/apiClient';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { t } = useLocaleStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: any) => !n.read).length);
    } catch (e) { console.error(e); }
  };

  const handleMarkAsRead = async () => {
    try {
      await apiClient.post('/notifications/read');
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const handleClearNotifications = async () => {
    try {
      await apiClient.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: t('dashboard') },
    { to: '/search', icon: <Search size={20} />, label: t('stockSearch') },
    { to: '/strategy', icon: <Cpu size={20} />, label: t('strategySettings') },
    { to: '/social', icon: <Trophy size={20} />, label: t('socialTrading') },
    { to: '/trading', icon: <Wallet size={20} />, label: t('tradingManagement') },
    { to: '/settings', icon: <Settings size={20} />, label: t('settings') },
  ];

  return (
    <div className="flex h-screen bg-[#0b0e14] text-gray-200 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-gray-800 flex-col bg-[#0b0e14]">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">QuantWave</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} isActive={location.pathname === item.to} />
          ))}
        </nav>

        <div className="p-6 border-t border-gray-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border border-gray-700 flex items-center justify-center font-bold text-white shadow-lg">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('premiumUser')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all font-bold text-sm">
            <LogOut size={18} />{t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-800/50 flex items-center justify-between px-6 lg:px-10 bg-[#0b0e14]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('liveEngine')}</span>
              </div>
              <button 
                onClick={async () => {
                  if(confirm('모든 자동매매를 즉시 중단하시겠습니까?')) {
                    try {
                      await apiClient.post('/trading/stop-all');
                      window.location.reload(); // 상태 반영을 위해 새로고침
                    } catch(e) { alert('정지 실패'); }
                  }
                }}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-full border border-red-500/20 transition-all group"
              >
                <AlertTriangle size={14} className="group-hover:animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-widest">Kill Switch</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) handleMarkAsRead(); }}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-2xl transition-all relative"
            >
              <Bell size={22} />
              {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#0b0e14] rounded-full animate-bounce"></span>}
            </button>
            <div className="h-8 w-px bg-gray-800 mx-2 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-500 font-bold tracking-tighter mt-1 italic">Level 4 Quant</p>
              </div>
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 font-black">
                {user?.email?.[0].toUpperCase() || 'Q'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 relative custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden h-20 border-t border-gray-800 bg-[#0d1117]/95 backdrop-blur-xl flex items-center justify-around px-2 z-30">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-1.5 p-2 transition-all ${location.pathname === item.to ? 'text-red-500 scale-110' : 'text-gray-500'}`}>
              {item.icon}<span className="text-[10px] font-black uppercase tracking-tighter">{item.label.substring(0,2)}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 w-80 bg-[#0b0e14] border-r border-gray-800 z-50 lg:hidden flex flex-col p-8">
              <div className="flex justify-between items-center mb-12"><div className="flex items-center gap-3"><TrendingUp className="text-red-500" size={28} /><span className="text-2xl font-black text-white tracking-tighter">QuantWave</span></div><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button></div>
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${location.pathname === item.to ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:bg-gray-800/50'}`}>{item.icon}{item.label}</Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notification History Sidebar */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifications(false)} className="fixed inset-0 z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-20 right-0 bottom-20 w-full sm:w-96 bg-[#161b22]/95 backdrop-blur-2xl border-l border-gray-800 shadow-2xl z-50 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-white tracking-tighter">{t('notifications')}</h3><button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-white"><X size={20} /></button></div>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {notifications.map((n) => (
                  <NotificationItem key={n.id} {...n} time={new Date(n.timestamp).toLocaleTimeString()} />
                ))}
                {notifications.length === 0 && <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">{t('noNotifications')}</div>}
              </div>
              {notifications.length > 0 && (
                <button onClick={handleClearNotifications} className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl text-xs transition-all uppercase tracking-widest">{t('clearAllHistory')}</button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ to, icon, label, isActive }: { to: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <Link to={to} className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all font-black text-sm relative group ${isActive ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 translate-x-2' : 'text-gray-500 hover:text-white hover:bg-gray-800/30'}`}>
      <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-red-400'}>{icon}</span>
      <span className="tracking-tight">{label}</span>
      {isActive && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-white rounded-full" initial={false} />}
    </Link>
  );
}

function NotificationItem({ type, title, body, time }: { type: 'trade' | 'risk' | 'system', title: string, body: string, time: string }) {
  const icons = {
    trade: <Wallet size={16} className="text-green-500" />,
    risk: <AlertTriangle size={16} className="text-red-500" />,
    system: <Activity size={16} className="text-blue-500" />
  };

  return (
    <div className="p-4 bg-[#0d1117] rounded-2xl border border-gray-800 hover:border-gray-600 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {icons[type]}
          <span className="text-[10px] font-black text-white uppercase tracking-tight">{title}</span>
        </div>
        <span className="text-[9px] text-gray-600 font-bold">{time}</span>
      </div>
      <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{body}</p>
    </div>
  );
}
