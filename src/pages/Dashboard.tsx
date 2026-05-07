import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Newspaper, Activity, CreditCard } from 'lucide-react';

const mockChartData = [
  { time: '09:00', price: 72000 },
  { time: '10:00', price: 72500 },
  { time: '11:00', price: 71800 },
  { time: '12:00', price: 73000 },
  { time: '13:00', price: 73500 },
  { time: '14:00', price: 73200 },
  { time: '15:00', price: 74100 },
];

const majorStocks = [
  { name: '삼성전자', symbol: '005930', price: '74,100', change: '+1.5%', isUp: true },
  { name: 'SK하이닉스', symbol: '000660', price: '182,300', change: '+2.1%', isUp: true },
  { name: 'NVIDIA', symbol: 'NVDA', price: '894.32', change: '-1.2%', isUp: false },
  { name: 'Tesla', symbol: 'TSLA', price: '175.22', change: '+0.8%', isUp: true },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-2">시장 현황</h1>
        <p className="text-gray-400">2026년 5월 7일 목요일, 오늘의 주요 증시 흐름입니다.</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {majorStocks.map((stock) => (
          <div key={stock.symbol} className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all shadow-lg group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stock.name}</p>
                <h3 className="text-2xl font-bold text-white">{stock.price}</h3>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stock.isUp ? 'text-red-500' : 'text-blue-500'}`}>
                {stock.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stock.change}
              </div>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stock.isUp ? '#ef4444' : '#3b82f6'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={stock.isUp ? '#ef4444' : '#3b82f6'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={stock.isUp ? '#ef4444' : '#3b82f6'} 
                    fillOpacity={1} 
                    fill={`url(#gradient-${stock.symbol})`} 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-[#161b22] p-8 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Activity className="text-red-500" />
              <h2 className="text-xl font-bold text-white">삼성전자 (005930) 실시간 추이</h2>
            </div>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '3M', '1Y'].map((t) => (
                <button key={t} className="px-3 py-1 text-xs rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area type="monotone" dataKey="price" stroke="#ef4444" fill="url(#mainGradient)" strokeWidth={3} />
                <defs>
                  <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio & News Section */}
        <div className="space-y-8">
          {/* Portfolio Summary */}
          <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-orange-500" />
              <h2 className="text-lg font-bold text-white">내 자산 요약</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">총 평가 자산</p>
                <h3 className="text-2xl font-bold text-white">₩ 124,500,000</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">총 수익률</p>
                  <p className="text-red-500 font-bold">+12.4%</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">오늘의 수익</p>
                  <p className="text-red-500 font-bold">+₩ 1,240,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Latest News */}
          <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <Newspaper className="text-blue-500" />
              <h2 className="text-lg font-bold text-white">주요 뉴스</h2>
            </div>
            <div className="space-y-4">
              <NewsItem title="엔비디아, 차세대 블랙웰 칩 수요 폭증 예고" time="10분 전" sentiment="positive" />
              <NewsItem title="한은, 기준금리 동결 가능성 시사..." time="45분 전" sentiment="neutral" />
              <NewsItem title="테슬라, 독일 기가팩토리 생산 차질 소식에 하락" time="1시간 전" sentiment="negative" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsItem({ title, time, sentiment }: { title: string, time: string, sentiment: 'positive' | 'negative' | 'neutral' }) {
  const sentimentColor = {
    positive: 'bg-green-500/10 text-green-500',
    negative: 'bg-red-500/10 text-red-500',
    neutral: 'bg-gray-500/10 text-gray-400'
  }[sentiment];

  return (
    <div className="group cursor-pointer">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${sentimentColor}`}>
          {sentiment}
        </span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-1">
        {title}
      </p>
    </div>
  );
}
