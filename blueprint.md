# 프로젝트 블루프린트: 국내·해외 주식 자동거래 웹 플랫폼

## 1. 전체 서비스 개요
"국내·해외 주식 자동거래 웹 플랫폼"은 개인 투자자가 본인만의 투자 전략을 수립하고, 이를 기반으로 모의투자 및 실제 자동매매를 실행할 수 있는 데이터 기반의 웹 서비스입니다. 주관적인 판단을 배제하고 설정된 알고리즘과 지표에 따라 기계적인 매매를 수행하여 안정적인 수익 추구 및 리스크 관리를 돕는 '자동화 도구'입니다. 실제 투자는 전적으로 사용자의 책임 하에 증권사 API를 통해 이루어집니다.

## 2. 핵심 기능 정리
*   **통합 대시보드:** 한국/미국 주요 지수, 환율, 주요 대기업 주가 실시간 모니터링
*   **종목 분석:** 차트, 재무제표, 실시간 뉴스, 공시 정보 제공
*   **전략 빌더:** 이동평균선, RSI, MACD, 뉴스 감성 분석 등 다양한 지표를 활용한 매수/매도 조건 설정
*   **모의투자 (Paper Trading):** 가상 자산으로 전략 백테스팅 및 포워드 테스팅
*   **실제투자 (Live Trading):** 증권사 Open API 연동, 사용자 승인 기반 자동 매매 주문 실행
*   **리스크 관리:** 1일 최대 손실, 종목별 투자 비중 제한, 긴급 정지(Kill Switch) 기능

## 3. 전체 시스템 아키텍처
*   **Client (Frontend):** React (Vite, TypeScript, Tailwind CSS, Zustand, Recharts) - 실시간 시세 및 UI 렌더링
*   **Server (Backend):** Node.js (Express) or FastAPI - 비즈니스 로직, API 라우팅, 전략 실행 엔진
*   **Database:** PostgreSQL (사용자, 전략, 거래기록), Redis (실시간 시세 캐싱, Rate Limit)
*   **External API Integrations:**
    *   증권사 API (한국투자증권, 키움증권 등): 주문, 계좌 조회
    *   금융 데이터 API (Yahoo Finance, 알파벤티지, 공공데이터포털): 시세, 지수, 환율
    *   뉴스 API (Naver News, NewsAPI): 실시간 뉴스 데이터

## 4. 화면별 UI 구성
(Card Layout & Dark/Light mode, Responsive)
1.  **로그인/회원가입:** JWT 기반 인증
2.  **메인 대시보드:** 상단(환율, 주요 지수 티커), 중단(주요 관심종목 미니 차트), 하단(최신 시장 뉴스 및 내 포트폴리오 요약)
3.  **종목 검색/상세:** 검색바, 캔들스틱 차트, 호가창, 기업 정보 탭, 관련 뉴스 탭, 매수/매도 수동 주문 패널
4.  **전략 설정 페이지:** 조건 블록(If-Then) 조합형 UI, 지표 파라미터 입력폼, 백테스트 실행 버튼
5.  **모의/실제 투자 대시보드:** 현재 잔고, 보유 종목 수익률, 자동매매 활성화 토글, 체결 로그 테이블
6.  **설정 페이지:** API Key 등록(마스킹 처리), 리스크 한도 설정

## 5. 데이터베이스 테이블 설계 (PostgreSQL 기준)
*   `Users`: id, email, password_hash, role, created_at
*   `ApiKeys`: id, user_id, broker_name, encrypted_api_key, encrypted_secret_key
*   `Strategies`: id, user_id, name, conditions (JSON), is_active
*   `Portfolios`: id, user_id, mode (mock/real), balance
*   `Positions`: id, portfolio_id, symbol, average_price, quantity
*   `TradeLogs`: id, user_id, mode, symbol, type (buy/sell), price, quantity, timestamp, strategy_id

## 6. API 명세서 (주요 엔드포인트)
*   `POST /api/auth/login`: 로그인 및 JWT 발급
*   `POST /api/users/keys`: 증권사 API Key 등록 (암호화)
*   `GET /api/market/dashboard`: 지수, 환율, 주요 종목 요약 데이터
*   `GET /api/stocks/:symbol`: 특정 종목 상세 데이터 (차트, 호가)
*   `POST /api/strategies`: 신규 자동매매 전략 저장
*   `POST /api/trading/mock/order`: 모의투자 수동 주문
*   `POST /api/trading/real/toggle`: 실제 자동매매 엔진 ON/OFF

## 7. 자동매매 로직 설계
1.  **데이터 수집 틱 (Ticker):** 1분/5분 단위로 등록된 관심종목의 시세 및 보조지표(이평선, RSI) 계산
2.  **조건 검사 엔진:** `Strategies` 테이블에 활성화된 사용자별 전략 로드
3.  **트리거:** 실시간 가격이 조건(예: RSI < 30)을 만족하면 신호(Signal) 발생
4.  **리스크 검증:** 1일 손실 한도, 종목 최대 비중 한도 검사
5.  **실행:** 모의투자면 로컬 DB 업데이트, 실제투자면 증권사 API로 주문 전송 후 로컬 DB 로그 기록

## 8. 모의투자 로직 설계
*   회원가입 시 가상 자산 `Portfolio` 자동 생성
*   매수 시: 가상 잔고 차감 -> `Positions` 에 종목 및 수량 추가
*   매도 시: `Positions` 수량 차감 -> 매도 대금 가상 잔고 추가 -> `TradeLogs` 에 손익 기록
*   증권사 수수료 및 슬리피지(Slippage)를 가정하여 매수/매도 가격에 가상의 패널티 적용

## 9. 실제투자 연동 방식
*   사용자가 설정에서 증권사 App Key, App Secret 입력
*   서버는 AES-256-GCM 알고리즘으로 양방향 암호화하여 DB 저장
*   주문 발생 시: 암호화된 키를 메모리에서 복호화 -> 증권사 OAuth 토큰 발급 -> 주문 API 호출
*   **중요:** UI에 "실제 주문이 발생하며 투자 손실의 책임은 사용자에게 있습니다" 명시적 동의 체크박스 필수

## 10. 보안 및 리스크 관리 설계
*   **보안:** HTTPS 필수. API Key 원문 DB 저장 금지. 프론트엔드 환경변수에 민감 정보 노출 금지.
*   **리스크 관리 (Kill Switch):** 비정상적인 폭락 감지 시 서버 단에서 전체 자동매매 일시 정지 기능.
*   Rate Limiting을 두어 API 과부하 방지.

## 11. 프론트엔드 폴더 구조 (React + Vite)
```
src/
├── assets/          # 이미지, 아이콘
├── components/      # 재사용 가능한 UI 컴포넌트
├── hooks/           # 커스텀 훅
├── layouts/         # 기본 레이아웃 (Navbar, Sidebar)
├── pages/           # 라우팅 페이지
├── services/        # API 호출 함수 (axios)
│   ├── apiClient.ts    # axios 인스턴스 설정
│   ├── marketService.ts # 시세 및 지수 서비스
│   ├── kisService.ts    # 한국투자증권 연동 서비스
│   └── newsService.ts   # 뉴스 데이터 서비스
├── store/           # 전역 상태 관리 (Zustand)
│   ├── useAuthStore.ts
│   └── useMarketStore.ts
├── types/           # TypeScript 타입 정의
├── utils/           # 유틸 함수
├── App.tsx
└── main.tsx
```

## 12. 백엔드 구조 (Cloudflare Pages Functions)
```
functions/
└── api/
    └── [[path]].js  # /api/* 요청 처리

public/
└── _routes.json     # Functions 라우팅 제한

wrangler.toml        # Pages/KV 바인딩 설정
```

## 13. 주요 코드 예시
(UI 단의 실제투자 ON/OFF 버튼 예시는 채팅 응답 참조)

## 14. 실행 방법
1.  **Frontend:** `npm install` -> `npm run dev`
2.  **Cloudflare 로컬:** `npm run pages:dev`
3.  **배포:** Cloudflare Pages에서 Build command `npm run build`, output `dist`, KV binding `KV` 설정

## 15. 확장 가능 기능
*   AI 뉴스 감성 분석 기반 투자 신호 생성
*   소셜 트레이딩 (우수 사용자 전략 모의투자 복사)
*   TradingView 고급 차트 연동

## 16. 개발 시 주의사항
*   **법적 고지:** 투자 자문으로 해석되지 않도록 '도구'임을 명시하고 수익을 보장하는 문구를 배제합니다.
*   네트워크 오류 및 API 점검에 대비한 강력한 예외 처리 및 롤백 로직이 필요합니다.
