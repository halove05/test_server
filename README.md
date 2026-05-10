# 🌊 QuantWave: Institutional-Grade Autonomous Trading Suite

QuantWave는 개인 투자자를 위한 최첨단 자율 주행 투자 플랫폼입니다. 한국투자증권(KIS) API와 인공지능(AI)을 결합하여 데이터 분석부터 실전 매매까지 전 과정을 자동화합니다.

## 🚀 Key Features

- **Real-Time Data Engine**: KIS API 연동을 통한 초정밀 실시간 지수 및 시세 데이터 제공.
- **Autonomous Execution**: 1분 단위 시장 스캔 및 사용자 정의 전략 기반 자율 매매 (BUY/SELL).
- **AI News Sentiment**: 실시간 종목 뉴스 헤드라인을 AI가 분석하여 감성 점수 산출 및 매매 필터링.
- **AI Strategy Designer**: 자연어 프롬프트를 통해 복잡한 기술적 매매 조건을 자동으로 생성.
- **Institutional Analytics**: MDD(최대 낙폭), Sharpe Ratio(샤프 지수) 등 전문 리스크 지표 실시간 산출.
- **Historical Backtesting**: 실제 과거 주가 데이터를 기반으로 한 정밀 전략 시뮬레이션.
- **Social Ecosystem**: 리더보드 탐색 및 상위 트레이더의 전략 즉시 복사 기능.
- **Fail-Safe Controls**: 일일 손실 제한(Stop-Loss) 및 전역 비상 정지(Kill Switch) 탑재.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion
- **Charts**: Recharts (Analytics), Lightweight Charts (TradingView Style)
- **Backend**: Cloudflare Pages Functions (Serverless API)
- **Storage**: Cloudflare KV (Access Token Caching & Portfolio Storage)
- **API**: Korea Investment & Securities (KIS) Open API

## 💻 Development

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행 (Frontend only)
npm run dev

# Cloudflare Functions 포함 로컬 테스트
npm run pages:dev
```

## 🌐 Deployment (Cloudflare Pages)

1. **Build Command**: `npm run build`
2. **Build Output**: `dist`
3. **KV Namespace Binding**: `KV`라는 이름의 네임스페이스를 생성하고 바인딩하십시오.
4. **Environment Variables (Secrets)**:
   - `JWT_SECRET`: 인증 토큰용 비밀키
   - `KIS_API_URL`: `https://openapi.koreainvestment.com:9443` (실전)
   - `KIS_APP_KEY`: 한국투자증권 앱 키
   - `KIS_APP_SECRET`: 한국투자증권 앱 시크릿
   - `KIS_CANO`: 계좌번호 (8자리)

---
*본 플랫폼은 투자 보조 도구이며, 모든 투자 결정과 그에 따른 책임은 사용자 본인에게 있습니다.*
