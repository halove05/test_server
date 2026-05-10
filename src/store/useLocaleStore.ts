import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'ko' | 'en';

type TranslationKey =
  | 'activePositions'
  | 'allocation'
  | 'apiRiskSettings'
  | 'apiSettings'
  | 'appKey'
  | 'appSecret'
  | 'avgGainLoss'
  | 'cancel'
  | 'clearAllHistory'
  | 'dailyLossLimit'
  | 'dashboard'
  | 'dayChange'
  | 'engineStatus'
  | 'globalPulse'
  | 'growthAnalytics'
  | 'hold'
  | 'language'
  | 'languageDescription'
  | 'liveEngine'
  | 'livePrice'
  | 'liveTrading'
  | 'logout'
  | 'marketOverview'
  | 'marketOverviewDescription'
  | 'marketPulse'
  | 'maxInvestmentPerStock'
  | 'noNotifications'
  | 'notifications'
  | 'paperTrading'
  | 'premiumUser'
  | 'price'
  | 'riskSettings'
  | 'runTest'
  | 'saveApiKeys'
  | 'saveLab'
  | 'saveRiskSettings'
  | 'settings'
  | 'settingsDescription'
  | 'socialTrading'
  | 'standby'
  | 'stockSearch'
  | 'strategyLab'
  | 'strategyLabDescription'
  | 'strategySettings'
  | 'ticker'
  | 'totalExecuted'
  | 'tradeHistory'
  | 'tradingManagement'
  | 'tradingStation'
  | 'tradingStationDescription'
  | 'winRate'
  | 'addStocks'
  | 'noWatchlistStocks'
  | 'leaderboard'
  | 'publicStrategies';

const translations: Record<Locale, Record<TranslationKey, string>> = {
  ko: {
    activePositions: '보유 포지션',
    allocation: '자산 배분',
    apiRiskSettings: 'API 및 리스크 설정',
    apiSettings: '증권사 API 설정',
    appKey: '앱 키',
    appSecret: '앱 시크릿',
    avgGainLoss: '평균 이익 / 손실',
    cancel: '취소',
    clearAllHistory: '알림 전체 삭제',
    dailyLossLimit: '1일 최대 손실 한도 (%)',
    dashboard: '대시보드',
    dayChange: '일간 변동',
    engineStatus: '엔진 상태',
    globalPulse: '글로벌 심리',
    growthAnalytics: '성장 분석',
    hold: '보유',
    language: '표시 언어',
    languageDescription: '앱의 주요 화면 문구를 한국어 또는 영어로 전환합니다.',
    liveEngine: '실시간 엔진',
    livePrice: '실시간 가격',
    liveTrading: '실전 투자',
    logout: '로그아웃',
    marketOverview: '시장 개요',
    marketOverviewDescription: '실시간 시장 데이터',
    marketPulse: '시장 흐름',
    maxInvestmentPerStock: '종목당 최대 투자 비중 (%)',
    noNotifications: '알림이 없습니다',
    notifications: '알림',
    paperTrading: '모의 투자',
    premiumUser: '프리미엄 사용자',
    price: '가격',
    riskSettings: '리스크 관리 설정',
    runTest: '테스트 실행',
    saveApiKeys: 'API 키 저장',
    saveLab: '전략 저장',
    saveRiskSettings: '리스크 설정 저장',
    settings: '설정',
    settingsDescription: '증권사 API 연동 및 리스크 관리 설정을 관리합니다.',
    socialTrading: '소셜 트레이딩',
    standby: '대기 중',
    stockSearch: '종목 검색',
    strategyLab: '전략 연구소',
    strategyLabDescription: '알고리즘 설계 및 과거 성과 시뮬레이션',
    strategySettings: '전략 설정',
    ticker: '종목',
    totalExecuted: '총 체결',
    tradeHistory: '거래 내역',
    tradingManagement: '투자 관리',
    tradingStation: '트레이딩 스테이션',
    tradingStationDescription: '자동매매 엔진 및 실시간 포트폴리오 관리',
    winRate: '승률',
    addStocks: '종목 추가',
    noWatchlistStocks: '관심 종목이 없습니다.',
    leaderboard: '리더보드',
    publicStrategies: '공개 전략',
  },
  en: {
    activePositions: 'Active Positions',
    allocation: 'Allocation',
    apiRiskSettings: 'API & Risk Settings',
    apiSettings: 'Brokerage API Settings',
    appKey: 'APP Key',
    appSecret: 'APP Secret',
    avgGainLoss: 'Avg Gain / Loss',
    cancel: 'Cancel',
    clearAllHistory: 'Clear All History',
    dailyLossLimit: 'Daily Loss Limit (%)',
    dashboard: 'Dashboard',
    dayChange: 'Day Change',
    engineStatus: 'Engine Status',
    globalPulse: 'Global Pulse',
    growthAnalytics: 'Growth Analytics',
    hold: 'Hold',
    language: 'Display Language',
    languageDescription: 'Switch major app labels between Korean and English.',
    liveEngine: 'Live Engine',
    livePrice: 'Live Price',
    liveTrading: 'Live Trading',
    logout: 'Logout',
    marketOverview: 'Market Overview',
    marketOverviewDescription: 'real-time market data',
    marketPulse: 'Market Pulse',
    maxInvestmentPerStock: 'Max Investment Per Stock (%)',
    noNotifications: 'No notifications yet',
    notifications: 'Notifications',
    paperTrading: 'Paper Trading',
    premiumUser: 'Premium User',
    price: 'Price',
    riskSettings: 'Risk Management Settings',
    runTest: 'Run Test',
    saveApiKeys: 'Save API Keys',
    saveLab: 'Save Lab',
    saveRiskSettings: 'Save Risk Settings',
    settings: 'Settings',
    settingsDescription: 'Manage brokerage API integration and risk settings.',
    socialTrading: 'Social Trading',
    standby: 'Standby',
    stockSearch: 'Stock Search',
    strategyLab: 'Strategy Lab',
    strategyLabDescription: 'Design algorithms and simulate historical performance',
    strategySettings: 'Strategy Settings',
    ticker: 'Ticker',
    totalExecuted: 'Total Executed',
    tradeHistory: 'Trade History',
    tradingManagement: 'Trading',
    tradingStation: 'Trading Station',
    tradingStationDescription: 'Automated engine and real-time portfolio management',
    winRate: 'Win Rate',
    addStocks: 'Add Stocks',
    noWatchlistStocks: 'No stocks in watchlist.',
    leaderboard: 'Leaderboard',
    publicStrategies: 'Public Strategies',
  },
};

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'ko',
      setLocale: (locale) => {
        document.documentElement.lang = locale;
        set({ locale });
      },
      t: (key) => translations[get().locale][key] || translations.ko[key],
    }),
    {
      name: 'locale-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.locale) document.documentElement.lang = state.locale;
      },
    }
  )
);
