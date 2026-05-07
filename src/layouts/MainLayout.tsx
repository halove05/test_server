import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Search, Cpu, Wallet, Settings, TrendingUp } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-[#0b0e14] text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <TrendingUp className="text-red-500 w-8 h-8" />
          <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            QuantWave
          </span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="대시보드" />
          <NavItem to="/search" icon={<Search size={20} />} label="종목 검색" />
          <NavItem to="/strategy" icon={<Cpu size={20} />} label="전략 설정" />
          <NavItem to="/trading" icon={<Wallet size={20} />} label="투자 관리" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <NavItem to="/settings" icon={<Settings size={20} />} label="설정" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0b0e14]/50 backdrop-blur-md">
          <div className="flex gap-6 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-500">KOSPI</span>
              <span className="text-red-500 font-medium">2,580.42 +1.2%</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">NASDAQ</span>
              <span className="text-blue-500 font-medium">16,274.94 -0.5%</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">USD/KRW</span>
              <span className="text-red-500 font-medium">1,345.20 +0.3%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
              서버 가동 중
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
