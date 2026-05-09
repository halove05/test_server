import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from '@/layouts/MainLayout';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const StrategyPage = lazy(() => import('@/pages/StrategyPage'));
const TradingPage = lazy(() => import('@/pages/TradingPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const StockDetail = lazy(() => import('@/pages/StockDetail'));
const SocialPage = lazy(() => import('@/pages/SocialPage'));

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0b0e14] text-sm font-bold text-gray-500">
      Loading...
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000, 
          style: { background: '#161b22', color: '#fff', border: '1px solid #30363d' } 
        }} 
      />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/strategy" element={<StrategyPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
