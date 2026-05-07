import { useState } from 'react';
import { Plus, Save, Play, Settings2, Trash2 } from 'lucide-react';

export default function StrategyPage() {
  const [conditions, setConditions] = useState([
    { id: 1, type: 'RSI', operator: '<=', value: 30, action: 'BUY' }
  ]);

  const addCondition = () => {
    setConditions([...conditions, { id: Date.now(), type: 'MA_CROSS', operator: '==', value: 'GOLDEN', action: 'BUY' }]);
  };

  const removeCondition = (id: number) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">전략 설정 (Strategy Builder)</h1>
          <p className="text-gray-400">자신만의 자동매매 조건 알고리즘을 시각적으로 구성합니다.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Play size={18} /> 백테스트 실행
          </button>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20">
            <Save size={18} /> 전략 저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Builder Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 shadow-xl min-h-[400px]">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings2 className="text-orange-500" /> 조건 블록
              </h2>
              <button onClick={addCondition} className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
                <Plus size={16} /> 조건 추가
              </button>
            </div>

            <div className="space-y-4">
              {conditions.map((cond, index) => (
                <div key={cond.id} className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800 group">
                  <span className="text-gray-500 font-mono text-sm w-6">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="text-blue-400 font-bold">IF</span>
                  
                  <select className="bg-gray-800 text-white border border-gray-700 rounded p-2 focus:ring-1 focus:ring-red-500 outline-none">
                    <option>RSI (14일)</option>
                    <option>이동평균선 (20일)</option>
                    <option>MACD</option>
                    <option>뉴스 감성점수</option>
                    <option>현재가</option>
                  </select>

                  <select className="bg-gray-800 text-white border border-gray-700 rounded p-2 focus:ring-1 focus:ring-red-500 outline-none">
                    <option>&lt;= (이하)</option>
                    <option>&gt;= (이상)</option>
                    <option>== (일치)</option>
                    <option>크로스 (돌파)</option>
                  </select>

                  <input type="text" defaultValue={cond.value} className="bg-gray-800 text-white border border-gray-700 rounded p-2 w-24 text-center focus:ring-1 focus:ring-red-500 outline-none" />

                  <span className="text-blue-400 font-bold ml-2">THEN</span>

                  <select className="bg-gray-800 text-white border border-gray-700 rounded p-2 font-bold focus:ring-1 focus:ring-red-500 outline-none">
                    <option className="text-red-500">매수 (BUY)</option>
                    <option className="text-blue-500">매도 (SELL)</option>
                    <option className="text-gray-300">관심등록</option>
                  </select>

                  <div className="flex-1"></div>
                  
                  <button onClick={() => removeCondition(cond.id)} className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {conditions.length === 0 && (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                  조건이 없습니다. '조건 추가' 버튼을 눌러 전략을 구성하세요.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Settings & Help */}
        <div className="space-y-6">
          <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">공통 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">전략 이름</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-red-500 outline-none" defaultValue="낙폭과대 매수 전략 1" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">종목당 1회 투자 금액</label>
                <div className="relative">
                  <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 pl-8 text-white focus:ring-1 focus:ring-red-500 outline-none" defaultValue="1000000" />
                  <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-red-600 rounded bg-gray-900 border-gray-700" defaultChecked />
                  <span className="text-sm text-gray-300">손절라인 활성화 (-5%)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20">
            <h3 className="text-blue-400 font-bold mb-2">💡 팁</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              RSI 지표가 30 이하로 떨어지면 시장이 '과매도' 상태에 있다고 판단하여 매수 시점으로 볼 수 있습니다. 반대로 70 이상이면 '과매수' 상태로 매도 시점으로 고려됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
