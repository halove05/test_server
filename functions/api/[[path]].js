const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
};

const marketUniverse = [
  { symbol: '005930', name: '삼성전자', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 75200 },
  { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 218000 },
  { symbol: '005380', name: '현대차', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 244500 },
  { symbol: '000270', name: '기아', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 112300 },
  { symbol: '373220', name: 'LG에너지솔루션', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 394000 },
  { symbol: '207940', name: '삼성바이오로직스', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 823000 },
  { symbol: '005490', name: 'POSCO홀딩스', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 407000 },
  { symbol: '035420', name: 'NAVER', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 189500 },
  { symbol: '035720', name: '카카오', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 54800 },
  { symbol: '051910', name: 'LG화학', market: 'KOSPI', category: 'korea', currency: 'KRW', price: 412000 },
  { symbol: 'AAPL', name: 'Apple', market: 'NASDAQ', category: 'global', currency: 'USD', price: 188.6 },
  { symbol: 'MSFT', name: 'Microsoft', market: 'NASDAQ', category: 'global', currency: 'USD', price: 423.2 },
  { symbol: 'NVDA', name: 'NVIDIA', market: 'NASDAQ', category: 'global', currency: 'USD', price: 921.4 },
  { symbol: 'GOOGL', name: 'Alphabet', market: 'NASDAQ', category: 'global', currency: 'USD', price: 171.8 },
  { symbol: 'AMZN', name: 'Amazon', market: 'NASDAQ', category: 'global', currency: 'USD', price: 184.7 },
  { symbol: 'META', name: 'Meta Platforms', market: 'NASDAQ', category: 'global', currency: 'USD', price: 493.5 },
  { symbol: 'TSLA', name: 'Tesla', market: 'NASDAQ', category: 'global', currency: 'USD', price: 176.2 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', market: 'NYSE', category: 'global', currency: 'USD', price: 407.9 },
  { symbol: 'JPM', name: 'JPMorgan Chase', market: 'NYSE', category: 'global', currency: 'USD', price: 198.4 },
  { symbol: 'LLY', name: 'Eli Lilly', market: 'NYSE', category: 'global', currency: 'USD', price: 781.3 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', market: 'NYSE Arca', category: 'etf', currency: 'USD', price: 522.1 },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', market: 'NYSE Arca', category: 'etf', currency: 'USD', price: 480.6 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', market: 'NASDAQ', category: 'etf', currency: 'USD', price: 444.8 },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', market: 'NYSE Arca', category: 'etf', currency: 'USD', price: 257.9 },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', market: 'NYSE Arca', category: 'etf', currency: 'USD', price: 79.4 },
  { symbol: 'TIGER200', name: 'TIGER 200', market: 'KOSPI ETF', category: 'etf', currency: 'KRW', price: 38450 },
  { symbol: 'KODEX200', name: 'KODEX 200', market: 'KOSPI ETF', category: 'etf', currency: 'KRW', price: 38620 },
];

const symbolNames = Object.fromEntries(marketUniverse.map((item) => [item.symbol, item.name]));
const defaultWatchlist = ['005930', '000660', '005380', 'AAPL', 'MSFT', 'NVDA', 'SPY', 'QQQ', 'TIGER200'];

function findInstrument(symbol) {
  return marketUniverse.find((item) => item.symbol.toUpperCase() === String(symbol).toUpperCase());
}

function mockPrice(symbol, index = 0) {
  const instrument = findInstrument(symbol) || { symbol, name: symbol, market: 'MARKET', category: 'global', currency: 'USD', price: 100 + index };
  const wave = Math.sin((Date.now() / 3600000) + index) * 0.8;
  const changeRate = Number((wave + (index % 5 - 2) * 0.35).toFixed(2));
  const currentPrice = instrument.currency === 'USD'
    ? Number((instrument.price * (1 + changeRate / 100)).toFixed(2))
    : Math.round(instrument.price * (1 + changeRate / 100));
  return {
    symbol: instrument.symbol,
    name: instrument.name,
    market: instrument.market,
    category: instrument.category,
    currency: instrument.currency,
    currentPrice,
    price: currentPrice,
    changeAmount: instrument.currency === 'USD' ? Number((currentPrice - instrument.price).toFixed(2)) : Math.round(currentPrice - instrument.price),
    changeRate,
    high: instrument.currency === 'USD' ? Number((currentPrice * 1.015).toFixed(2)) : Math.round(currentPrice * 1.015),
    low: instrument.currency === 'USD' ? Number((currentPrice * 0.985).toFixed(2)) : Math.round(currentPrice * 0.985),
    volume: Math.floor(850000 + index * 173000),
  };
}

const defaultSocial = {
  leaderboard: [
    { id: 1, name: '퀀트킹_서울', avatar: 'K', profitRate: 145.2, totalProfit: 45000000, tradeCount: 120, winRate: 68 },
    { id: 2, name: '알고트레이더_X', avatar: 'A', profitRate: 98.4, totalProfit: 28000000, tradeCount: 85, winRate: 55 },
    { id: 3, name: '스마트_베어', avatar: 'S', profitRate: 72.1, totalProfit: 15000000, tradeCount: 210, winRate: 42 },
    { id: 4, name: '불스_아이', avatar: 'B', profitRate: 54.5, totalProfit: 12000000, tradeCount: 45, winRate: 72 },
  ],
  publicStrategies: [
    {
      id: 101,
      author: '퀀트킹_서울',
      name: '나스닥 추종 RSI 킬러',
      description: 'RSI 과매도 구간에서 강력한 매수세를 동반할 때 진입하는 추세 추종 전략입니다.',
      totalReturn: 124.5,
      winRate: 74,
      config: {
        name: '나스닥 추종 RSI 킬러',
        investmentPerOrder: 2000000,
        isStopLossActive: true,
        stopLossRate: -3,
        conditions: [
          { id: 1, type: 'RSI', operator: '<=', value: 32, action: 'BUY' },
          { id: 2, type: 'PRICE', operator: '>=', value: 50000, action: 'BUY' },
        ],
      },
    },
  ],
};

const textEncoder = new TextEncoder();
const memoryStore = globalThis.__QUANTWAVE_MEMORY_STORE__ || new Map();
globalThis.__QUANTWAVE_MEMORY_STORE__ = memoryStore;

function response(data, init = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: { ...jsonHeaders, ...(init.headers || {}) } });
}

function error(message, status = 500) {
  return response({ error: message }, { status });
}

async function body(request) {
  if (request.method === 'GET') return {};
  const text = await request.text();
  return text ? JSON.parse(text) : {};
}

async function digestHex(input) {
  const hash = await crypto.subtle.digest('SHA-256', textEncoder.encode(input));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function base64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', textEncoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function signToken(payload, secret) {
  const header = base64Url(textEncoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const encodedPayload = base64Url(textEncoder.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 })));
  const data = `${header}.${encodedPayload}`;
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), textEncoder.encode(data));
  return `${data}.${base64Url(new Uint8Array(signature))}`;
}

async function verifyToken(token, secret) {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const data = `${header}.${payload}`;
  const valid = await crypto.subtle.verify('HMAC', await hmacKey(secret), decodeBase64Url(signature), textEncoder.encode(data));
  if (!valid) return null;
  const parsed = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
  if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return parsed;
}

async function getKV(env, key, fallback) {
  if (!env.KV) {
    return memoryStore.has(key) ? JSON.parse(memoryStore.get(key)) : fallback;
  }
  const raw = await env.KV.get(key);
  return raw ? JSON.parse(raw) : fallback;
}

async function putKV(env, key, data) {
  if (!env.KV) {
    memoryStore.set(key, JSON.stringify(data));
    return;
  }
  await env.KV.put(key, JSON.stringify(data));
}

async function authenticate(request, env) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const user = token ? await verifyToken(token, env.JWT_SECRET || 'quantwave-secret-key') : null;
  if (!user) throw new Response(null, { status: 401 });
  return user;
}

function userKeys(user, env, users) {
  const stored = users.find((item) => item.id === user.id);
  if (stored?.apiKeys?.appKey) return stored.apiKeys;
  return { appKey: env.KIS_APP_KEY, appSecret: env.KIS_APP_SECRET, accountNo: env.KIS_CANO };
}

async function kisFetch(env, path, options = {}) {
  const base = env.KIS_API_URL || 'https://openapi.koreainvestment.com:9443';
  const url = new URL(path, base);
  Object.entries(options.params || {}).forEach(([key, value]) => url.searchParams.set(key, value));
  const res = await fetch(url, { method: options.method || 'GET', headers: options.headers, body: options.body ? JSON.stringify(options.body) : undefined });
  return res.json();
}

async function getAccessToken(env, keys) {
  if (!keys?.appKey || !keys?.appSecret) throw new Error('KIS API keys are missing');
  const cacheKey = `kis-token:${keys.appKey}`;
  const cached = await getKV(env, cacheKey, null);
  if (cached && Date.now() < cached.expiredAt - 60000) return cached.token;
  const data = await kisFetch(env, '/oauth2/tokenP', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: { grant_type: 'client_credentials', appkey: keys.appKey, appsecret: keys.appSecret },
  });
  if (!data.access_token) throw new Error('Failed to get KIS access token');
  await putKV(env, cacheKey, { token: data.access_token, expiredAt: Date.now() + (data.expires_in || 86400) * 1000 });
  return data.access_token;
}

async function getHashkey(env, keys, orderBody) {
  try {
    const data = await kisFetch(env, '/uapi/hashkey', {
      method: 'POST',
      headers: { 'content-type': 'application/json', appkey: keys.appKey, appsecret: keys.appSecret },
      body: orderBody,
    });
    return data.HASH || '';
  } catch {
    return '';
  }
}

async function getCurrentPrice(env, keys, symbol) {
  const token = await getAccessToken(env, keys);
  const data = await kisFetch(env, '/uapi/domestic-stock/v1/quotations/inquire-price', {
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, appkey: keys.appKey, appsecret: keys.appSecret, tr_id: 'FHKST01010100', custtype: 'P' },
    params: { fid_cond_mrkt_div_code: 'J', fid_input_iscd: symbol },
  });
  if (data.rt_cd !== '0') throw new Error(data.msg1 || 'KIS price request failed');
  const o = data.output;
  return {
    symbol,
    currentPrice: Number(o.stck_prpr || 0),
    changeAmount: Number(o.prdy_vrss || 0),
    changeRate: Number(o.prdy_ctrt || 0),
    high: Number(o.stck_hgpr || 0),
    low: Number(o.stck_lwpr || 0),
    volume: Number(o.acml_vol || 0),
    marketCap: Number(o.hts_avls || 0),
  };
}

async function getAccountBalance(env, keys) {
  const token = await getAccessToken(env, keys);
  const isVirtual = (env.KIS_API_URL || '').includes('vts');
  const data = await kisFetch(env, '/uapi/domestic-stock/v1/trading/inquire-balance', {
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, appkey: keys.appKey, appsecret: keys.appSecret, tr_id: isVirtual ? 'VTTC8434R' : 'TTTC8434R', custtype: 'P' },
    params: { CANO: keys.accountNo || '00000000', ACNT_PRDT_CD: '01', AFHR_FLPR_YN: 'N', OFL_YN: '', INQR_DVSN: '02', UNPR_DVSN: '01', FUND_STTL_ICLD_YN: 'N', FNCG_AMT_AUTO_RDPT_YN: 'N', PRCS_DVSN: '00', CTX_AREA_FK100: '', CTX_AREA_NK100: '' },
  });
  if (data.rt_cd !== '0') throw new Error(data.msg1 || 'KIS balance request failed');
  const holdings = (data.output1 || []).map((item) => ({
    symbol: item.pdno,
    name: item.prdt_name,
    quantity: Number(item.hldg_qty || 0),
    averagePrice: Number(item.pchs_avg_pric || 0),
    currentPrice: Number(item.prpr || 0),
    profitRate: Number(item.evlu_erng_rt || 0),
    evaluationAmount: Number(item.evlu_amt || 0),
  })).filter((holding) => holding.quantity > 0);
  const summary = data.output2?.[0] || {};
  return { totalBalance: Number(summary.tot_evlu_amt || 0), availableCash: Number(summary.dnca_tot_amt || 0), totalProfit: Number(summary.evlu_erng_rt_smtl || 0), holdings };
}

async function getChart(env, keys, symbol, period) {
  const token = await getAccessToken(env, keys);
  const daily = period !== '1D';
  const params = daily
    ? {
        fid_cond_mrkt_div_code: 'J',
        fid_input_iscd: symbol,
        fid_input_date_1: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10).replace(/-/g, ''),
        fid_input_date_2: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        fid_period_div_code: 'D',
        fid_org_adj_prc: '1',
      }
    : { fid_etc_cls_code: '', fid_cond_mrkt_div_code: 'J', fid_input_iscd: symbol, fid_pw_data_insp_cnt: '30', fid_pw_data_insp_hr_grpt_code: '5' };
  const data = await kisFetch(env, daily ? '/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice' : '/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice', {
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, appkey: keys.appKey, appsecret: keys.appSecret, tr_id: daily ? 'FHKST03010100' : 'FHKST03010200', custtype: 'P' },
    params,
  });
  if (data.rt_cd !== '0') throw new Error(data.msg1 || 'KIS chart request failed');
  return (data.output2 || []).map((item) => daily ? {
    date: `${item.stck_bsop_date.slice(4, 6)}/${item.stck_bsop_date.slice(6, 8)}`,
    price: Number(item.stck_clpr || 0),
    open: Number(item.stck_oprc || 0),
    high: Number(item.stck_hgpr || 0),
    low: Number(item.stck_lwpr || 0),
    volume: Number(item.acml_vol || 0),
  } : {
    time: `${item.stck_cntg_hour.slice(0, 2)}:${item.stck_cntg_hour.slice(2, 4)}`,
    price: Number(item.stck_prpr || 0),
    open: Number(item.stck_oprc || 0),
    high: Number(item.stck_hgpr || 0),
    low: Number(item.stck_lwpr || 0),
    volume: Number(item.cntg_vol || 0),
  }).reverse();
}

function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  return prices.slice(prices.length - period).reduce((sum, value) => sum + value, 0) / period;
}

function calculateRSI(prices, period = 14) {
  if (prices.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let index = prices.length - period; index < prices.length; index += 1) {
    const diff = prices[index] - prices[index - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  return 100 - (100 / (1 + gains / losses));
}

function calculateBollingerBands(prices, period = 20, multiplier = 2) {
  const sma = calculateSMA(prices, period);
  if (sma === null) return null;
  const subset = prices.slice(prices.length - period);
  const variance = subset.map((price) => (price - sma) ** 2).reduce((sum, value) => sum + value, 0) / period;
  const stdDev = Math.sqrt(variance);
  return { upper: sma + multiplier * stdDev, lower: sma - multiplier * stdDev };
}

function enrichChart(rawData) {
  const prices = rawData.map((item) => item.price);
  return rawData.map((item, index) => {
    const subset = prices.slice(0, index + 1);
    const bb = calculateBollingerBands(subset, 20);
    return { ...item, sma20: calculateSMA(subset, 20), rsi: calculateRSI(subset, 14), bbUpper: bb?.upper, bbLower: bb?.lower };
  });
}

function mockChart() {
  return Array.from({ length: 30 }, (_, index) => ({
    time: `${9 + Math.floor(index / 2)}:${index % 2 ? '30' : '00'}`,
    price: Math.round(75000 + Math.sin(index / 3) * 1200 + Math.random() * 600),
    open: Math.round(75000 + Math.sin(index / 3) * 1000),
    high: Math.round(76000 + Math.sin(index / 3) * 1000),
    low: Math.round(74200 + Math.sin(index / 3) * 1000),
    volume: Math.floor(Math.random() * 10000) + 1000,
  }));
}

function defaultPortfolio() {
  let balance = 90000000;
  const history = Array.from({ length: 31 }, (_, offset) => {
    const date = new Date(Date.now() - (30 - offset) * 86400000);
    balance += (Math.random() - 0.45) * balance * 0.02;
    return { date: date.toISOString().slice(0, 10), equity: Math.floor(balance) };
  });
  return { balance: 100000000, holdings: [], logs: [], history };
}

function portfolioSummary(data) {
  let totalEvaluation = data.balance;
  let totalProfit = 0;
  let totalCost = 0;
  const holdings = data.holdings.map((holding) => {
    const currentPrice = holding.currentPrice || holding.averagePrice;
    const evaluationAmount = currentPrice * holding.quantity;
    const cost = holding.averagePrice * holding.quantity;
    const profit = evaluationAmount - cost;
    totalEvaluation += evaluationAmount;
    totalProfit += profit;
    totalCost += cost;
    return { ...holding, currentPrice, evaluationAmount, profit, profitRate: cost > 0 ? Number(((profit / cost) * 100).toFixed(2)) : 0 };
  });
  return {
    totalBalance: Math.floor(totalEvaluation),
    availableCash: Math.floor(data.balance),
    totalProfit: Math.floor(totalProfit),
    profitRate: totalCost > 0 ? Number(((totalProfit / totalCost) * 100).toFixed(2)) : 0,
    holdings,
    history: data.history || [],
    metrics: { winRate: 0, profitFactor: 0, totalTrades: data.logs.length, avgGain: 0, avgLoss: 0 },
  };
}

async function pushNotification(env, userId, notification) {
  const key = `notifications:${userId}`;
  const notifications = await getKV(env, key, []);
  const item = { ...notification, id: Date.now(), timestamp: new Date().toISOString(), read: false };
  await putKV(env, key, [item, ...notifications].slice(0, 50));
  return item;
}

function marketStatus() {
  const now = new Date();
  const day = now.getUTCDay();
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  if (day === 0 || day === 6) return { isOpen: false, status: 'CLOSED', message: '주말 휴장' };
  if (minutes >= 0 && minutes <= 390) return { isOpen: true, status: 'OPEN', message: '정규장 운영 중' };
  return { isOpen: false, status: 'CLOSED', message: '장 마감' };
}

function latestNews() {
  return [
    { id: '1', title: '삼성전자, HBM3E 공급망 진입 기대감 확대', summary: '반도체 업황 개선 기대가 이어지고 있습니다.', source: '경제뉴스', sentiment: 'positive', score: 0.85, publishedAt: new Date().toISOString() },
    { id: '2', title: '미국 연준, 고금리 장기화 가능성 시사', summary: '글로벌 위험자산 선호가 둔화될 수 있습니다.', source: '글로벌금융', sentiment: 'negative', score: -0.72, publishedAt: new Date().toISOString() },
    { id: '3', title: 'SK하이닉스, AI 메모리 수요 증가 수혜', summary: 'HBM 중심의 실적 개선 기대가 커졌습니다.', source: 'IT데일리', sentiment: 'positive', score: 0.92, publishedAt: new Date().toISOString() },
  ];
}

async function route(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '');
  const parts = path.split('/').filter(Boolean);
  const method = request.method;
  const payload = await body(request);
  const users = await getKV(env, 'users', []);

  if (method === 'POST' && path === 'auth/signup') {
    const email = String(payload.email || '').trim().toLowerCase();
    if (!email || !payload.password) return error('Email and password are required.', 400);
    if (users.some((user) => user.email === email)) return error('이미 존재하는 이메일입니다.', 400);
    const id = Date.now();
    const salt = crypto.randomUUID();
    const passwordHash = await digestHex(`${salt}:${payload.password}`);
    const user = { id, email, passwordHash, salt, apiKeys: {}, settings: { dailyLossLimit: 5, maxInvestmentPerStock: 20 } };
    users.push(user);
    await putKV(env, 'users', users);
    const token = await signToken({ id, email }, env.JWT_SECRET || 'quantwave-secret-key');
    return response({ token, user: { id, email } });
  }

  if (method === 'POST' && path === 'auth/login') {
    const email = String(payload.email || '').trim().toLowerCase();
    const user = users.find((item) => item.email === email);
    if (!user || user.passwordHash !== await digestHex(`${user.salt}:${payload.password}`)) return error('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    const token = await signToken({ id: user.id, email: user.email }, env.JWT_SECRET || 'quantwave-secret-key');
    return response({ token, user: { id: user.id, email: user.email } });
  }

  if (path === 'market/status') return response(marketStatus());
  if (path === 'market/sentiment') return response({ value: 58, score: 0.18, label: 'neutral', description: '대형 기술주와 반도체, 대표 ETF 흐름을 함께 반영한 중립권 심리입니다.', updatedAt: new Date().toISOString() });
  if (path === 'news/latest') return response(latestNews());
  if (path === 'social/leaderboard') return response(defaultSocial.leaderboard);
  if (path === 'social/strategies') return response(defaultSocial.publicStrategies);
  if (parts[0] === 'market' && parts[1] === 'news' && parts[2]) {
    return response([
      { id: 's1', title: `${parts[2]} 핵심 사업 부문 실적 개선 가시화`, source: '마켓데일리', publishedAt: new Date().toISOString() },
      { id: 's2', title: `외국인/기관, ${parts[2]} 집중 매수세 유입`, source: '금융플러스', publishedAt: new Date().toISOString() },
    ]);
  }

  const user = await authenticate(request, env);
  const keys = userKeys(user, env, users);

  if (path === 'users/profile') {
    const stored = users.find((item) => item.id === user.id);
    if (!stored) return error('사용자를 찾을 수 없습니다.', 404);
    const { passwordHash, salt, ...profile } = stored;
    return response(profile);
  }

  if (method === 'POST' && path === 'users/keys') {
    const index = users.findIndex((item) => item.id === user.id);
    users[index].apiKeys = { appKey: payload.appKey, appSecret: payload.appSecret, accountNo: payload.accountNo };
    await putKV(env, 'users', users);
    return response({ status: 'success' });
  }

  if (method === 'POST' && path === 'users/settings') {
    const index = users.findIndex((item) => item.id === user.id);
    users[index].settings = { dailyLossLimit: Number(payload.dailyLossLimit), maxInvestmentPerStock: Number(payload.maxInvestmentPerStock) };
    await putKV(env, 'users', users);
    return response({ status: 'success' });
  }

  if (path === 'notifications') {
    const key = `notifications:${user.id}`;
    if (method === 'GET') return response(await getKV(env, key, []));
    if (method === 'DELETE') {
      await putKV(env, key, []);
      return response({ status: 'success' });
    }
  }

  if (method === 'POST' && path === 'notifications/read') {
    const key = `notifications:${user.id}`;
    const notifications = await getKV(env, key, []);
    await putKV(env, key, notifications.map((item) => ({ ...item, read: true })));
    return response({ status: 'success' });
  }

  if (path === 'market/indices') {
    return response([{ name: 'KOSPI', value: 2750.32, change: 15.2, changeRate: 0.55 }, { name: 'KOSDAQ', value: 890.15, change: -2.1, changeRate: -0.23 }]);
  }

  if (path === 'market/search') {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const filtered = marketUniverse.filter((item) => {
      const haystack = `${item.symbol} ${item.name} ${item.market} ${item.category}`.toLowerCase();
      return haystack.includes(q);
    });
    return response(filtered.map((item, index) => ({ ...mockPrice(item.symbol, index), volume: mockPrice(item.symbol, index).volume.toLocaleString() })));
  }

  if (path === 'market/movers') {
    const data = marketUniverse.map((item, index) => mockPrice(item.symbol, index)).sort((a, b) => b.changeRate - a.changeRate);
    return response({ gainers: data.slice(0, 5), losers: [...data].reverse().slice(0, 5) });
  }

  if (parts[0] === 'market' && parts[1] === 'stock' && parts[2]) {
    const instrument = findInstrument(parts[2]);
    if (instrument?.category !== 'korea') return response(mockPrice(parts[2], marketUniverse.indexOf(instrument)));
    try {
      const live = await getCurrentPrice(env, keys, parts[2]);
      return response({ ...mockPrice(parts[2]), ...live, name: instrument?.name, market: instrument?.market, category: instrument?.category, currency: instrument?.currency || 'KRW' });
    } catch {
      return response(mockPrice(parts[2], marketUniverse.findIndex((item) => item.symbol === parts[2])));
    }
  }

  if (parts[0] === 'market' && parts[1] === 'signal' && parts[2]) {
    const instrument = findInstrument(parts[2]);
    const score = instrument?.category === 'etf' ? 62 : instrument?.category === 'global' ? 68 : 58;
    return response({ symbol: parts[2], signal: score >= 65 ? 'BUY' : 'HOLD', score, reason: `${instrument?.name || parts[2]}의 모멘텀과 변동성을 기준으로 중립 이상의 흐름을 보입니다.` });
  }

  if (parts[0] === 'market' && parts[1] === 'chart' && parts[2]) {
    try {
      return response(enrichChart(await getChart(env, keys, parts[2], url.searchParams.get('period') || '1D')));
    } catch {
      return response(enrichChart(mockChart()));
    }
  }

  if (parts[0] === 'market' && parts[1] === 'orderbook' && parts[2]) {
    const base = mockPrice(parts[2]).currentPrice;
    const tick = mockPrice(parts[2]).currency === 'USD' ? 0.5 : 100;
    const asks = Array.from({ length: 10 }, (_, index) => ({ price: base + (10 - index) * tick, volume: 10000 + index * 3500 }));
    const bids = Array.from({ length: 10 }, (_, index) => ({ price: base - (index + 1) * tick, volume: 12000 + index * 3000 }));
    return response({ symbol: parts[2], asks, bids });
  }

  if (parts[0] === 'market' && parts[1] === 'fundamentals' && parts[2]) {
    return response({ per: 15.4, pbr: 1.2, eps: 4500, bps: 62000, dividendYield: 2.1, w52High: 85000, w52Low: 65000, marketCap: 4500000 });
  }

  if (path === 'watchlist') {
    const key = `watchlist:${user.id}`;
    if (method === 'GET') return response(await getKV(env, key, defaultWatchlist));
    if (method === 'POST') {
      const list = await getKV(env, key, []);
      const next = list.includes(payload.symbol) ? list : [...list, payload.symbol];
      await putKV(env, key, next);
      return response(next);
    }
  }

  if (method === 'DELETE' && parts[0] === 'watchlist' && parts[1]) {
    const key = `watchlist:${user.id}`;
    const next = (await getKV(env, key, [])).filter((symbol) => symbol !== parts[1]);
    await putKV(env, key, next);
    return response(next);
  }

  if (path === 'strategies') {
    const key = `strategies:${user.id}`;
    if (method === 'GET') return response(await getKV(env, key, []));
    if (method === 'POST') {
      const strategies = await getKV(env, key, []);
      const saved = { ...payload, id: Date.now() };
      await putKV(env, key, [...strategies, saved]);
      return response(saved);
    }
  }

  if (method === 'DELETE' && parts[0] === 'strategies' && parts[1]) {
    const key = `strategies:${user.id}`;
    const next = (await getKV(env, key, [])).filter((strategy) => strategy.id !== Number(parts[1]));
    await putKV(env, key, next);
    return response({ status: 'success' });
  }

  if (method === 'POST' && path === 'strategies/backtest') {
    const initial = 10000000;
    const chartData = Array.from({ length: Number(payload.period || 30) }, (_, index) => ({
      date: new Date(Date.now() - (Number(payload.period || 30) - index) * 86400000).toISOString().slice(0, 10),
      equity: Math.floor(initial * (1 + index * 0.003 + Math.sin(index / 3) * 0.015)),
    }));
    const totalReturn = Number((((chartData.at(-1).equity - initial) / initial) * 100).toFixed(2));
    return response({ totalReturn, winRate: 58, maxDrawdown: 7.2, sharpeRatio: 1.21, chartData });
  }

  if (method === 'POST' && path === 'strategies/generate') {
    return response([{ id: Date.now(), type: 'RSI', operator: '<=', value: 30, action: 'BUY' }]);
  }

  if (path === 'trading/balance') {
    if (url.searchParams.get('mode') === 'real') {
      try {
        return response(await getAccountBalance(env, keys));
      } catch (err) {
        return error(err.message, 500);
      }
    }
    const data = await getKV(env, `portfolio:${user.id}`, defaultPortfolio());
    return response(portfolioSummary(data));
  }

  if (path === 'trading/logs') {
    const data = await getKV(env, `portfolio:${user.id}`, defaultPortfolio());
    return response(data.logs || []);
  }

  if (method === 'POST' && path === 'trading/real/toggle') {
    await putKV(env, `engine:${user.id}`, { active: Boolean(payload.active), mode: payload.mode || 'mock', updatedAt: new Date().toISOString() });
    await pushNotification(env, user.id, { type: 'system', title: payload.active ? '엔진 가동 시작' : '엔진 가동 중지', body: payload.active ? '자동매매 엔진 상태가 활성화되었습니다.' : '자동매매 엔진 상태가 중지되었습니다.' });
    return response({ status: 'success', isEngineActive: Boolean(payload.active), mode: payload.mode || 'mock' });
  }

  if (method === 'POST' && path === 'trading/order') {
    const data = await getKV(env, `portfolio:${user.id}`, defaultPortfolio());
    const amount = Number(payload.price) * Number(payload.quantity);
    if (payload.mode === 'real') return error('실전 주문은 KIS 계좌 조회까지 연결되어 있으며 주문 실행은 별도 승인 후 활성화하세요.', 400);
    if (payload.orderType === 'BUY') {
      if (data.balance < amount) return error('잔액이 부족합니다.', 400);
      data.balance -= amount;
      const existing = data.holdings.find((holding) => holding.symbol === payload.symbol);
      if (existing) {
        existing.averagePrice = ((existing.averagePrice * existing.quantity) + amount) / (existing.quantity + Number(payload.quantity));
        existing.quantity += Number(payload.quantity);
      } else {
        data.holdings.push({ symbol: payload.symbol, name: payload.name || symbolNames[payload.symbol] || payload.symbol, quantity: Number(payload.quantity), averagePrice: Number(payload.price), currentPrice: Number(payload.price) });
      }
    } else {
      const existing = data.holdings.find((holding) => holding.symbol === payload.symbol);
      if (!existing || existing.quantity < Number(payload.quantity)) return error('매도 가능한 수량이 부족합니다.', 400);
      data.balance += amount;
      existing.quantity -= Number(payload.quantity);
      data.holdings = data.holdings.filter((holding) => holding.quantity > 0);
    }
    data.logs.unshift({ symbol: payload.symbol, name: payload.name || symbolNames[payload.symbol] || payload.symbol, orderType: payload.orderType, price: Number(payload.price), quantity: Number(payload.quantity), timestamp: new Date().toISOString() });
    await putKV(env, `portfolio:${user.id}`, data);
    await pushNotification(env, user.id, { type: 'trade', title: `${payload.orderType === 'BUY' ? '매수' : '매도'} 주문 체결`, body: `${payload.symbol} ${payload.quantity}주가 체결되었습니다.`, symbol: payload.symbol });
    return response({ status: 'success', data });
  }

  return error('Not found', 404);
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return new Response(null, { headers: jsonHeaders });
  try {
    return await route(context);
  } catch (err) {
    if (err instanceof Response) return err;
    return error(err.message || 'Internal Server Error', 500);
  }
}
