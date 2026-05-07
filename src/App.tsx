import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import SearchPage from '@/pages/SearchPage';
import StrategyPage from '@/pages/StrategyPage';
import TradingPage from '@/pages/TradingPage';
import AuthPage from '@/pages/AuthPage';
import MainLayout from '@/layouts/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/trading" element={<TradingPage />} />
          <Route path="/settings" element={<div>설정 페이지 (준비중)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;