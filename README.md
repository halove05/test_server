# QuantWave

React, Vite, Cloudflare Pages Functions 기반의 투자 대시보드입니다. 프론트엔드는 Cloudflare Pages 정적 산출물로 배포하고, `/api/*` 요청은 Pages Functions에서 처리합니다.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand
- Recharts, Lightweight Charts
- Cloudflare Pages Functions
- Cloudflare KV

## Development

```bash
npm install
npm run dev
```

Cloudflare Functions까지 로컬에서 확인하려면:

```bash
npm run pages:dev
```

## Build

```bash
npm run lint
npm run build
```

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Functions directory: `functions`
- Required binding: KV namespace named `KV`

Set these variables/secrets in Cloudflare Pages:

- `JWT_SECRET`
- `KIS_API_URL`
- `KIS_APP_KEY` optional
- `KIS_APP_SECRET` optional
- `KIS_CANO` optional

Update `wrangler.toml` with real KV namespace IDs before deploying from Wrangler.
