import { useState } from 'react';
import { AlertTriangle, Power, PowerOff, ShieldAlert } from 'lucide-react';

export default function TradingPage() {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mode, setMode] = useState<'mock' | 'real'>('mock');

  const handleToggle = () => {
    if (!isLiveActive) {
      if (mode === 'real') {
        setShowConfirm(true);
      } else {
        setIsLiveActive(true);
      }
    } else {
      setIsLiveActive(false);
    }
  };

  const positions = [
    { symbol: '005930', name: '삼성전자', avgPrice: 72000, currentPrice: 74100, qty: 100, return: 2.91 },
    { symbol: 'TSLA', name: 'Tesla', avgPrice: 180.50, currentPrice: 175.22, qty: 10, return: -2.92 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">투자 관리 (Trading)</h1>
        <p className="text-gray-400">설정된 전략을 바탕으로 모의투자 및 실제투자를 실행하고 관리합니다.</p>
      </div>

      {/* Mode Selector & Status */}
      <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-2 p-1 bg-gray-900 rounded-lg">
          <button 
            onClick={() => setMode('mock')}
            className={`px-6 py-2 rounded-md font-bold transition-all ${mode === 'mock' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            모의투자
          </button>
          <button 
            onClick={() => setMode('real')}
            className={`px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 ${mode === 'real' ? 'bg-red-500/10 text-red-500 shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <ShieldAlert size={16} /> 실제투자
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">자동매매 엔진 상태</p>
            <p className={`font-bold ${isLiveActive ? 'text-green-500' : 'text-gray-500'}`}>
              {isLiveActive ? '가동 중 (ON)' : '정지됨 (OFF)'}
            </p>
          </div>
          <button 
            onClick={handleToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isLiveActive 
                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' 
                : 'bg-gray-800 hover:bg-gray-700 shadow-none'
            }`}
          >
            {isLiveActive ? <Power size={24} className="text-white" /> : <PowerOff size={24} className="text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Live Warning Notice */}
      {mode === 'real' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4">
          <AlertTriangle className="text-red-500 shrink-0" />
          <div>
            <h4 className="text-red-500 font-bold mb-1">실제 투자 모드 주의사항</h4>
            <p className="text-sm text-gray-300">
              현재 증권사 API와 연동되어 <span className="font-bold text-red-400">실제 자산으로 매매가 이루어집니다.</span>
              플랫폼은 설정된 알고리즘을 기계적으로 실행할 뿐이며, 시스템 오류나 급격한 시장 변동으로 인한 손실 책임은 전적으로 사용자에게 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Positions Table */}
      <div className="bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">보유 종목 (포지션)</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">종목</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">평단가</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">현재가</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">수량</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">수익률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {positions.map((pos) => (
              <tr key={pos.symbol} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{pos.name}</div>
                  <div className="text-xs text-gray-500">{pos.symbol}</div>
                </td>
                <td className="px-6 py-4 text-right text-gray-300">
                  {pos.avgPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-medium text-white">
                  {pos.currentPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-gray-300">
                  {pos.qty}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${pos.return > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  {pos.return > 0 ? '+' : ''}{pos.return}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Warning Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-lg border border-red-500 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="text-red-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl text-white font-bold">실제 자동매매 시작</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              자동매매 엔진을 켜면 귀하가 설정한 전략에 따라 <strong className="text-red-400">즉시 시장가 혹은 지정가로 주문이 전송</strong>될 수 있습니다. 
              충분한 모의투자(백테스트)를 거쳤는지 확인하세요.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-5 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
                취소
              </button>
              <button 
                onClick={() => { setIsLiveActive(true); setShowConfirm(false); }} 
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                동의하고 엔진 가동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
