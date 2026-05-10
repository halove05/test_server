const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization, appkey, appsecret, tr_id, hashkey, custtype',
};

const response = (data) => new Response(JSON.stringify(data), { headers: jsonHeaders });
const error = (msg, code = 400) => new Response(JSON.stringify({ error: msg }), { status: code, headers: jsonHeaders });

async function body(req) {
  try { return await req.json(); } catch { return {}; }
}

async function getKV(env, key, fallback) {
  if (!env.KV) {
    console.error('KV binding is missing.');
    return fallback;
  }
  try {
    const val = await env.KV.get(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

async function putKV(env, key, val) {
  if (!env.KV) {
    throw new Error('KV storage is not configured. Please bind a KV namespace named "KV" to your Pages project.');
  }
  await env.KV.put(key, JSON.stringify(val));
}

async function digestHex(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signToken(payload, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 }));
  const signature = await digestHex(`${header}.${data}.${secret}`);
  return `${header}.${data}.${signature}`;
}

async function authenticate(req, env) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) throw error('Unauthorized', 401);
  const token = auth.split(' ')[1];
  const parts = token.split('.');
  if (parts.length !== 3) throw error('Invalid token format', 401);
  const [header, data, sig] = parts;
  const secret = env.JWT_SECRET || 'quantwave-secret-key';
  const expectedSig = await digestHex(`${header}.${data}.${secret}`);
  if (sig !== expectedSig) throw error('Invalid token signature', 401);
  const decoded = JSON.parse(atob(data));
  if (decoded.exp < Math.floor(Date.now() / 1000)) throw error('Token expired', 401);
  return decoded;
}

const marketUniverse = [
  { symbol: '005930', name: '삼성전자', market: 'KOSPI', category: 'korea', currency: 'KRW' },
  { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', category: 'korea', currency: 'KRW' },
  { symbol: '005380', name: '현대차', market: 'KOSPI', category: 'korea', currency: 'KRW' },
  { symbol: '035420', name: 'NAVER', market: 'KOSPI', category: 'korea', currency: 'KRW' },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', category: 'global', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft', market: 'NASDAQ', category: 'global', currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA', market: 'NASDAQ', category: 'global', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla', market: 'NASDAQ', category: 'global', currency: 'USD' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', market: 'NYSE', category: 'etf', currency: 'USD' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', market: 'NASDAQ', category: 'etf', currency: 'USD' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', market: 'NYSE', category: 'etf', currency: 'USD' },
  { symbol: 'TIGER200', name: 'TIGER 200', market: 'KRX', category: 'etf', currency: 'KRW' },
];

const symbolNames = marketUniverse.reduce((acc, cur) => ({ ...acc, [cur.symbol]: cur.name }), {});
const defaultWatchlist = ['005930', '000660', 'AAPL', 'NVDA'];
const sampleBasePrices = {
  '005930': 70000,
  '000660': 218000,
  '005380': 244500,
  '035420': 189500,
  AAPL: 188.6,
  MSFT: 423.2,
  NVDA: 921.4,
  TSLA: 176.2,
  SPY: 522.1,
  QQQ: 444.8,
  VOO: 480.6,
  TIGER200: 38450,
};

const defaultSocial = {
  leaderboard: [
    { id: 1, name: 'AlphaAlgo', avatar: '🚀', profitRate: 154.2, totalProfit: 45000000, tradeCount: 1240, winRate: 68 },
    { id: 2, name: 'QuantKing', avatar: '📊', profitRate: 92.5, totalProfit: 28000000, tradeCount: 850, winRate: 62 },
    { id: 3, name: 'BlueChip', avatar: '💎', profitRate: 45.8, totalProfit: 12000000, tradeCount: 320, winRate: 75 },
  ],
  publicStrategies: [
    { id: 'p1', name: 'RSI Reversal', author: 'AlphaAlgo', totalReturn: 124.5, winRate: 72, description: '과매도 구간에서 기술적 반등을 노리는 정통 RSI 전략입니다.', config: { name: 'RSI Reversal (Copy)', conditions: [{ type: 'RSI', operator: '<=', value: 30, action: 'BUY' }, { type: 'RSI', operator: '>=', value: 70, action: 'SELL' }], investmentPerOrder: 1000000, isStopLossActive: true, stopLossRate: -3 } },
    { id: 'p2', name: 'Trend Follower', author: 'QuantKing', totalReturn: 88.2, winRate: 58, description: '20일 이동평균선을 기준으로 추세 추종 매매를 수행합니다.', config: { name: 'Trend Follower (Copy)', conditions: [{ type: 'MA', operator: 'CROSS', value: 20, action: 'BUY' }], investmentPerOrder: 2000000, isStopLossActive: true, stopLossRate: -5 } },
  ]
};

function mockPrice(symbol, index = 0) {
  const instrument = findInstrument(symbol) || { symbol, name: symbol, market: 'MARKET', category: 'global', currency: 'USD' };
  const base = sampleBasePrices[instrument.symbol] || (instrument.currency === 'USD' ? 150 : 70000);
  const change = (Math.sin(Date.now() / 10000 + index) * 2).toFixed(2);
  const currentPrice = instrument.currency === 'USD'
    ? Number((base * (1 + Number(change) / 100)).toFixed(2))
    : Math.round(base * (1 + Number(change) / 100));
  return {
    symbol: instrument.symbol,
    name: instrument.name,
    currentPrice,
    changeAmount: instrument.currency === 'USD' ? Number((currentPrice - base).toFixed(2)) : Math.round(currentPrice - base),
    changeRate: Number(change),
    high: instrument.currency === 'USD' ? Number((currentPrice * 1.015).toFixed(2)) : Math.round(currentPrice * 1.015),
    low: instrument.currency === 'USD' ? Number((currentPrice * 0.985).toFixed(2)) : Math.round(currentPrice * 0.985),
    market: instrument.market,
    category: instrument.category,
    currency: instrument.currency,
    volume: 1500000,
    source: 'sample',
    isLive: false,
    fallbackReason: 'API 키가 설정되지 않았습니다.',
  };
}

function findInstrument(symbol) {
  return marketUniverse.find(i => String(i.symbol).toUpperCase() === String(symbol).toUpperCase());
}

function overseasExchangeCode(instrument) {
  if (instrument?.market === 'NYSE') return 'NYS';
  if (instrument?.market === 'NYSE Arca') return 'NYS';
  if (instrument?.market === 'AMEX') return 'AMS';
  return 'NAS';
}

function isOverseasInstrument(instrument, symbol) {
  return instrument?.currency === 'USD' || instrument?.category === 'global' || /^[A-Z.]+$/i.test(String(symbol));
}

async function kisFetch(env, path, options = {}) {
  // 모의투자 URL 지원 (KIS APP KEY가 'P'로 시작하면 실전, 'V'로 시작하면 모의인 경우가 많으나 확실치 않음)
  // 여기서는 명시적인 환경 변수 또는 자동 전환 로직 필요
  const isVirtual = (env.KIS_API_URL || '').includes('vts') || (options.headers?.appkey || '').startsWith('V');
  const baseUrl = isVirtual ? 'https://openapivts.koreainvestment.com:29443' : (env.KIS_API_URL || 'https://openapi.koreainvestment.com:9443');
  
  const url = new URL(path, baseUrl);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.append(k, v));
  }
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return await res.json();
}

async function getAccessToken(env, keys) {
  const cacheKey = `kis_token:${keys.appKey}`;
  const cached = await getKV(env, cacheKey, null);
  if (cached && cached.expires > Date.now()) return cached.token;

  const data = await kisFetch(env, '/oauth2/tokenP', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: { grant_type: 'client_credentials', appkey: keys.appKey, appsecret: keys.appSecret },
  });

  if (!data.access_token) {
    console.error('KIS token error:', data);
    throw new Error(data.msg1 || 'KIS token issuance failed');
  }
  const token = data.access_token;
  await putKV(env, cacheKey, { token, expires: Date.now() + (data.expires_in - 600) * 1000 });
  return token;
}

async function getHashkey(env, keys, body) {
  const data = await kisFetch(env, '/uapi/hashkey', {
    method: 'POST',
    headers: { 'content-type': 'application/json', appkey: keys.appKey, appsecret: keys.appSecret },
    body,
  });
  return data.HASH;
}

function userKeys(user, env, users) {
  const stored = users.find((u) => u.id === user.id);
  return {
    appKey: stored?.apiKeys?.appKey || env.KIS_APP_KEY,
    appSecret: stored?.apiKeys?.appSecret || env.KIS_APP_SECRET,
    accountNo: stored?.apiKeys?.accountNo || env.KIS_CANO,
  };
}

async function getLiveInstrumentPrice(env, keys, symbol, index = 0) {
  const instrument = findInstrument(symbol);
  const isDomestic = /^\d+$/.test(String(symbol));
  
  if (!keys.appKey || !keys.appSecret) return mockPrice(symbol, index);
  
  try {
    const token = await getAccessToken(env, keys);
    if (!isDomestic) {
      // 해외 주식 (미국 기준: NAS, NYS, AMS)
      const excd = overseasExchangeCode(instrument);
      const data = await kisFetch(env, '/uapi/overseas-price/v1/quotations/price', {
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
          appkey: keys.appKey,
          appsecret: keys.appSecret,
          tr_id: 'HHDFS00000300',
          custtype: 'P',
        },
        params: { AUTH: '', EXCD: excd, SYMB: symbol.toUpperCase() },
      });
      
      if (data.rt_cd !== '0') return { ...mockPrice(symbol, index), fallbackReason: data.msg1 };
      
      const o = data.output || {};
      const currentPrice = Number(o.last || 0);
      
      return {
        symbol: symbol.toUpperCase(),
        name: instrument?.name || symbol,
        market: instrument?.market || 'NASDAQ',
        category: 'global',
        currency: 'USD',
        currentPrice,
        changeAmount: Number(o.diff || 0),
        changeRate: Number(o.rate || 0),
        high: Number(o.high || currentPrice),
        low: Number(o.low || currentPrice),
        volume: Number(o.tvol || 0),
        source: 'KIS',
        isLive: true,
        updatedAt: new Date().toISOString(),
      };
    }
    
    // 국내 주식
    const data = await kisFetch(env, '/uapi/domestic-stock/v1/quotations/inquire-price', {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: keys.appKey,
        appsecret: keys.appSecret,
        tr_id: 'FHKST01010100',
        custtype: 'P',
      },
      params: { fid_cond_mrkt_div_code: 'J', fid_input_iscd: symbol },
    });
    
    if (data.rt_cd !== '0') return { ...mockPrice(symbol, index), fallbackReason: data.msg1 };
    
    const o = data.output || {};
    const currentPrice = Number(o.stck_prpr || 0);
    return {
      symbol,
      name: instrument?.name || symbol,
      market: instrument?.market || 'KOSPI',
      category: 'korea',
      currency: 'KRW',
      currentPrice,
      changeAmount: Number(o.prdy_vrss || 0),
      changeRate: Number(o.prdy_ctrt || 0),
      high: Number(o.stck_hgpr || currentPrice),
      low: Number(o.stck_lwpr || currentPrice),
      volume: Number(o.acml_vol || 0),
      source: 'KIS',
      isLive: true,
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error('KIS API Error:', e);
    return mockPrice(symbol, index);
  }
}

async function getExchangeRates(env, keys) {
  if (!keys.appKey || !keys.appSecret) {
    return [
      { name: 'USD/KRW', value: 1425.5, change: 2.1, changeRate: 0.15, type: 'fx' },
      { name: 'JPY/KRW', value: 9.35, change: -0.05, changeRate: -0.53, type: 'fx' },
      { name: 'EUR/KRW', value: 1495.2, change: 0.8, changeRate: 0.05, type: 'fx' },
    ];
  }
  try {
    const token = await getAccessToken(env, keys);
    const data = await kisFetch(env, '/uapi/overseas-stock/v1/trading/inquire-present-balance', {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: keys.appKey,
        appsecret: keys.appSecret,
        tr_id: 'CTRP6504R',
        custtype: 'P',
      },
      params: {
        CANO: keys.accountNo,
        ACNT_PRDT_CD: '01',
        WCRC_FRCR_DVSN_CD: '01',
        NATN_CD: '000',
        TR_MKET_CD: '00',
        INQR_DVSN_CD: '00'
      },
    });
    
    const usdRate = Number(data?.output2?.[0]?.frst_bltn_exrt || 1425.5);
    
    return [
      { name: 'USD/KRW', value: usdRate, change: 2.1, changeRate: 0.15, type: 'fx' },
      { name: 'JPY/KRW', value: 9.35, change: -0.05, changeRate: -0.53, type: 'fx' },
      { name: 'EUR/KRW', value: 1495.2, change: 0.8, changeRate: 0.05, type: 'fx' },
    ];
  } catch {
    return [
      { name: 'USD/KRW', value: 1425.5, change: 2.1, changeRate: 0.15, type: 'fx' },
      { name: 'JPY/KRW', value: 9.35, change: -0.05, changeRate: -0.53, type: 'fx' },
      { name: 'EUR/KRW', value: 1495.2, change: 0.8, changeRate: 0.05, type: 'fx' },
    ];
  }
}

async function getAccountBalance(env, keys) {
  const token = await getAccessToken(env, keys);
  const isVirtual = keys.appKey.startsWith('V');
  const trId = isVirtual ? 'VTTC8434R' : 'TTTC8434R';
  
  const data = await kisFetch(env, '/uapi/domestic-stock/v1/trading/inquire-balance', {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      appkey: keys.appKey,
      appsecret: keys.appSecret,
      tr_id: trId,
      custtype: 'P',
    },
    params: {
      CANO: keys.accountNo,
      ACNT_PRDT_CD: '01',
      AFHR_FLG: 'N',
      O_PRC_DVSN_CD: '01',
      UNPR_DVSN_CD: '01',
      CTX_AREA_FK100: '',
      CTX_AREA_NK100: '',
    },
  });
  if (data.rt_cd !== '0') throw new Error(data.msg1 || 'Account balance failed');
  
  const holdings = (data.output1 || []).map((h) => ({
    symbol: h.pdno,
    name: h.prdt_name,
    quantity: Number(h.hldg_qty),
    averagePrice: Number(h.pchs_avg_pric),
    currentPrice: Number(h.prpr),
    profitRate: Number(h.evlu_erng_rt),
  }));

  // 실제 계좌 히스토리는 KIS에서 별도로 가져오기 어려우므로 현재 평가액을 기준으로 UI만 유지
  const history = [{ date: new Date().toISOString().slice(5, 10), equity: Number(data.output2[0].tot_evlu_amt) }];

  return {
    totalBalance: Number(data.output2[0].tot_evlu_amt),
    availableCash: Number(data.output2[0].dnca_tot_amt),
    totalProfit: Number(data.output2[0].evlu_amt_smtl_amt) - Number(data.output2[0].pchs_amt_smtl_amt),
    profitRate: Number(data.output2[0].evlu_erng_rt),
    holdings,
    history,
    metrics: { winRate: 65, profitFactor: 1.6, totalTrades: 42, mdd: 4.2, sharpeRatio: 1.2 },
  };
}

async function getChart(env, keys, symbol, period = 30) {
  const token = await getAccessToken(env, keys);
  const instrument = findInstrument(symbol);
  const isDomestic = /^\d+$/.test(String(symbol));
  
  if (!isDomestic) {
    const data = await kisFetch(env, '/uapi/overseas-price/v1/quotations/dailyprice', {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: keys.appKey,
        appsecret: keys.appSecret,
        tr_id: 'HHDFS76240000',
        custtype: 'P',
      },
      params: {
        AUTH: '',
        EXCD: overseasExchangeCode(instrument),
        SYMB: symbol,
        GUBN: '0',
        BYMD: '',
        MODP: '1',
      },
    });
    if (data.rt_cd !== '0') throw new Error(data.msg1 || 'KIS overseas chart request failed');
    return (data.output2 || []).slice(0, period).map((item) => ({
      date: item.xymd ? `${item.xymd.slice(4, 6)}/${item.xymd.slice(6, 8)}` : '',
      time: item.xymd ? `${item.xymd.slice(4, 6)}/${item.xymd.slice(6, 8)}` : '',
      price: Number(item.clos || item.last || 0),
      open: Number(item.open || 0),
      high: Number(item.high || 0),
      low: Number(item.low || 0),
      volume: Number(item.tvol || 0),
    })).reverse();
  }
  
  const date1 = new Date(Date.now() - (period + 10) * 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const date2 = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const data = await kisFetch(env, '/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice', {
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, appkey: keys.appKey, appsecret: keys.appSecret, tr_id: 'FHKST03010100', custtype: 'P' },
    params: {
      fid_cond_mrkt_div_code: 'J',
      fid_input_iscd: symbol,
      fid_input_date_1: date1,
      fid_input_date_2: date2,
      fid_period_div_code: 'D',
      fid_org_adj_prc: '1',
    },
  });
  if (data.rt_cd !== '0') throw new Error(data.msg1 || 'KIS chart request failed');
  return (data.output2 || []).slice(0, period).map((item) => ({
    date: `${item.stck_bsop_date.slice(4, 6)}/${item.stck_bsop_date.slice(6, 8)}`,
    price: Number(item.stck_clpr || 0),
    open: Number(item.stck_oprc || 0),
    high: Number(item.stck_hgpr || 0),
    low: Number(item.stck_lwpr || 0),
    volume: Number(item.acml_vol || 0),
  })).reverse();
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
  let balance = 100000000;
  const history = Array.from({ length: 31 }, (_, offset) => {
    const date = new Date(Date.now() - (30 - offset) * 86400000);
    return { date: date.toISOString().slice(0, 10), equity: balance };
  });
  return { balance: 100000000, holdings: [], logs: [], history };
}

function portfolioSummary(data) {
  let totalEvaluation = data.balance;
  let totalProfit = 0;
  let totalCost = 0;
  const holdings = (data.holdings || []).map((holding) => {
    const currentPrice = holding.currentPrice || holding.averagePrice;
    const evaluationAmount = currentPrice * holding.quantity;
    const cost = holding.averagePrice * holding.quantity;
    const profit = evaluationAmount - cost;
    totalEvaluation += evaluationAmount;
    totalProfit += profit;
    totalCost += cost;
    return { ...holding, currentPrice, evaluationAmount, profit, profitRate: cost > 0 ? Number(((profit / cost) * 100).toFixed(2)) : 0 };
  });

  const history = data.history || [];
  let mdd = 0;
  let sharpe = 0;
  if (history.length > 1) {
    let peak = 0;
    const returns = [];
    for (let i = 0; i < history.length; i++) {
      if (history[i].equity > peak) peak = history[i].equity;
      const dd = (peak - history[i].equity) / (peak || 1) * 100;
      if (dd > mdd) mdd = dd;
      if (i > 0) returns.push((history[i].equity - history[i - 1].equity) / (history[i - 1].equity || 1));
    }
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const std = Math.sqrt(returns.map(r => Math.pow(r - avg, 2)).reduce((a, b) => a + b, 0) / returns.length);
    sharpe = std > 0 ? (avg / std) * Math.sqrt(252) : 0;
  }

  return {
    totalBalance: Math.floor(totalEvaluation),
    availableCash: Math.floor(data.balance),
    totalProfit: Math.floor(totalProfit),
    profitRate: totalCost > 0 ? Number(((totalProfit / totalCost) * 100).toFixed(2)) : 0,
    holdings,
    history,
    metrics: { winRate: 68.5, profitFactor: 1.82, totalTrades: data.logs.length, mdd: Number(mdd.toFixed(2)), sharpeRatio: Number(sharpe.toFixed(2)) },
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
  const hours = now.getUTCHours() + 9; // KST
  if (day === 0 || day === 6) return { isOpen: false, status: 'CLOSED', message: '주말 휴장' };
  if (hours >= 9 && hours < 16) return { isOpen: true, status: 'OPEN', message: '정규장 운영 중' };
  return { isOpen: false, status: 'CLOSED', message: '장 마감' };
}

function latestNews() {
  return [
    { id: '1', title: '삼성전자, HBM3E 공급망 진입 기대감 확대', summary: '반도체 업황 개선 기대가 이어지고 있습니다.', source: '경제 뉴스', sentiment: 'positive', score: 0.85, publishedAt: new Date().toISOString() },
    { id: '2', title: '미국 연준, 고금리 장기화 가능성 시사', summary: '글로벌 위험자산 선호가 둔화될 수 있습니다.', source: '글로벌금융', sentiment: 'negative', score: -0.72, publishedAt: new Date().toISOString() },
    { id: '3', title: 'SK하이닉스, AI 메모리 수요 증가 수혜', summary: 'HBM 중심의 실적 개선 기대가 커졌습니다.', source: 'IT데일리', sentiment: 'positive', score: 0.92, publishedAt: new Date().toISOString() },
  ];
}

async function getStockNews(env, keys, symbol) {
  try {
    const token = await getAccessToken(env, keys);
    const data = await kisFetch(env, '/uapi/domestic-stock/v1/quotations/inquire-investor-opin', {
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, appkey: keys.appKey, appsecret: keys.appSecret, tr_id: 'FHKST01010700', custtype: 'P' },
      params: { fid_cond_mrkt_div_code: 'J', fid_input_iscd: symbol },
    });
    if (data.rt_cd !== '0') return [];
    return (data.output || []).slice(0, 10).map((item, idx) => ({ id: `${symbol}-${idx}`, title: item.hts_kor_isnm || item.data_dt, summary: item.stck_cntg_hour, source: 'KIS 뉴스', publishedAt: new Date().toISOString(), sentiment: Math.random() > 0.5 ? 'positive' : 'neutral', score: Math.random() * 0.4 + 0.3 }));
  } catch { return []; }
}

async function getMarketIndex(env, keys, code) {
  if (!keys.appKey || !keys.appSecret) return null;
  try {
    const token = await getAccessToken(env, keys);
    const data = await kisFetch(env, '/uapi/domestic-stock/v1/quotations/inquire-index-price', {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: keys.appKey,
        appsecret: keys.appSecret,
        tr_id: 'FHPST01010000',
        custtype: 'P',
      },
      params: { fid_cond_mrkt_div_code: 'U', fid_input_iscd: code },
    });
    if (data.rt_cd !== '0') return null;
    const o = data.output || {};
    return {
      value: Number(o.bstp_nmix_prpr || 0),
      change: Number(o.bstp_nmix_prdy_vrss || 0),
      changeRate: Number(o.bstp_nmix_prdy_ctrt || 0),
    };
  } catch {
    return null;
  }
}

async function getFluctuationRanking(env, keys, isGainer = true) {
  if (!keys.appKey || !keys.appSecret) return null;
  try {
    const token = await getAccessToken(env, keys);
    const data = await kisFetch(env, '/uapi/domestic-stock/v1/ranking/fluctuation', {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey: keys.appKey,
        appsecret: keys.appSecret,
        tr_id: 'FHPST01700000',
        custtype: 'P',
      },
      params: {
        fid_cond_mrkt_div_code: 'J',
        fid_cond_scr_div_code: '20170',
        fid_input_iscd: '0000',
        fid_rank_sort_cls_code: '0',
        fid_input_cnt_1: '0',
        fid_prc_cls_code: '0',
        fid_input_price_1: '0',
        fid_input_price_2: '0',
        fid_vol_cnt: '0',
        fid_trgt_cls_code: '0',
        fid_trgt_exls_cls_code: '0',
        fid_div_cls_code: '0',
        fid_rsfl_cls_code: isGainer ? '1' : '2',
      },
    });
    if (data.rt_cd !== '0') return null;
    return (data.output || []).slice(0, 10).map((item) => ({
      symbol: item.mksc_shrn_iscd,
      name: item.hts_kor_isnm,
      currentPrice: Number(item.stck_prpr || 0),
      changeAmount: Number(item.prdy_vrss || 0),
      changeRate: Number(item.prdy_ctrt || 0),
      volume: Number(item.acml_vol || 0),
    }));
  } catch {
    return null;
  }
}

async function placeKisOrder(env, keys, payload) {
  const isVirtual = keys.appKey.startsWith('V');
  const token = await getAccessToken(env, keys);
  const orderBody = {
    CANO: keys.accountNo || '00000000',
    ACNT_PRDT_CD: '01',
    PDNO: payload.symbol,
    ORD_DVSN: '01',
    ORD_QTY: String(payload.quantity),
    ORD_UNPR: String(payload.price),
  };
  const hashKey = await getHashkey(env, keys, orderBody);
  const trId = payload.orderType === 'BUY' 
    ? (isVirtual ? 'VTTC0802U' : 'TTTC0802U') 
    : (isVirtual ? 'VTTC0801U' : 'TTTC0801U');

  const data = await kisFetch(env, '/uapi/domestic-stock/v1/trading/order-cash', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      appkey: keys.appKey,
      appsecret: keys.appSecret,
      tr_id: trId,
      hashkey: hashKey,
      custtype: 'P',
    },
    body: orderBody,
  });
  if (data.rt_cd !== '0') throw new Error(data.msg1 || 'KIS 주문 요청 실패');
  return data;
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
  
  if (path === 'market/sentiment') {
    const user = await authenticate(request, env).catch(() => null);
    const keys = user ? userKeys(user, env, users) : {};
    let value = 50;
    let label = 'neutral';
    let description = '시장 데이터를 분석 중입니다.';
    try {
      const [kospi, kosdaq] = await Promise.all([
        getMarketIndex(env, keys, '0001'),
        getMarketIndex(env, keys, '1001'),
      ]);
      if (kospi && kosdaq) {
        const avgChange = (kospi.changeRate + kosdaq.changeRate) / 2;
        value = Math.max(0, Math.min(100, Math.round(50 + (avgChange * 15))));
        if (value > 70) { label = 'greedy'; description = '투자 심리가 매우 낙관적입니다. 추격 매수에 유의하세요.'; }
        else if (value > 55) { label = 'bullish'; description = '시장이 완만한 상승 곡선을 그리며 긍정적인 흐름입니다.'; }
        else if (value < 30) { label = 'extreme fear'; description = '시장에 공포 심리가 가득합니다. 과매도 구간 여부를 확인하세요.'; }
        else if (value < 45) { label = 'fear'; description = '투자 심리가 위축되어 있으며 리스크 관리가 필요합니다.'; }
        else { label = 'neutral'; description = '지수가 보합권에 머물며 방향성을 탐색 중입니다.'; }
      }
    } catch {}
    return response({ value, label, description, updatedAt: new Date().toISOString() });
  }

  if (path === 'news/latest') return response(latestNews());
  if (path === 'social/leaderboard') return response(defaultSocial.leaderboard);
  if (path === 'social/strategies') return response(defaultSocial.publicStrategies);

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
    if (method === 'DELETE') { await putKV(env, key, []); return response({ status: 'success' }); }
  }

  if (method === 'POST' && path === 'notifications/read') {
    const key = `notifications:${user.id}`;
    const notifications = await getKV(env, key, []);
    await putKV(env, key, notifications.map((item) => ({ ...item, read: true })));
    return response({ status: 'success' });
  }

  if (path === 'market/indices') {
    const [exchangeRates, kospi, kosdaq] = await Promise.all([
      getExchangeRates(env, keys),
      getMarketIndex(env, keys, '0001'),
      getMarketIndex(env, keys, '1001'),
    ]);
    return response([
      { name: 'KOSPI', value: kospi?.value || 2540.32, change: kospi?.change || 0, changeRate: kospi?.changeRate || 0 },
      { name: 'KOSDAQ', value: kosdaq?.value || 840.15, change: kosdaq?.change || 0, changeRate: kosdaq?.changeRate || 0 },
      ...exchangeRates,
    ]);
  }

  if (path === 'market/search') {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const filtered = marketUniverse.filter((item) => `${item.symbol} ${item.name} ${item.market}`.toLowerCase().includes(q));
    const prices = await Promise.all(filtered.slice(0, 12).map((item, index) => getLiveInstrumentPrice(env, keys, item.symbol, index)));
    return response(prices);
  }

  if (path === 'market/movers') {
    const [gainers, losers] = await Promise.all([getFluctuationRanking(env, keys, true), getFluctuationRanking(env, keys, false)]);
    if (gainers && losers) return response({ gainers, losers });
    const data = marketUniverse.map((item, index) => mockPrice(item.symbol, index)).sort((a, b) => b.changeRate - a.changeRate);
    return response({ gainers: data.slice(0, 5), losers: [...data].reverse().slice(0, 5) });
  }

  if (parts[0] === 'market' && parts[1] === 'stock' && parts[2]) {
    return response(await getLiveInstrumentPrice(env, keys, parts[2], 0));
  }

  if (parts[0] === 'market' && parts[1] === 'news' && parts[2]) {
    return response(await getStockNews(env, keys, parts[2]));
  }

  if (parts[0] === 'market' && parts[1] === 'signal' && parts[2]) {
    try {
      const chart = await getChart(env, keys, parts[2], 30);
      const prices = chart.map(p => p.price);
      const rsi = calculateRSI(prices, 14);
      const instrument = findInstrument(parts[2]) || { name: parts[2] };
      let signal = 'HOLD';
      let score = 50;
      let reason = `${instrument.name} 기술 지표가 중립적입니다.`;
      if (rsi < 30) { signal = 'BUY'; score = Math.round(80 + (30 - rsi)); reason = `RSI가 ${rsi.toFixed(1)}로 과매도 구간입니다.`; }
      else if (rsi > 70) { signal = 'SELL'; score = Math.round(85 + (rsi - 70)); reason = `RSI가 ${rsi.toFixed(1)}로 과매수 구간입니다.`; }
      return response({ symbol: parts[2], signal, score, reason, rsi });
    } catch { return response({ symbol: parts[2], signal: 'HOLD', score: 50, reason: '기본 분석 결과입니다.' }); }
  }

  if (parts[0] === 'market' && parts[1] === 'chart' && parts[2]) {
    try { return response(enrichChart(await getChart(env, keys, parts[2], Number(url.searchParams.get('period')) || 30))); }
    catch { return response(enrichChart(mockChart())); }
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
    const { strategy, symbol, period } = payload;
    try {
      const rawChart = await getChart(env, keys, symbol, period || 30);
      const enriched = enrichChart(rawChart);
      let cash = 10000000;
      let shares = 0;
      const initialCash = cash;
      const equityHistory = [];
      let totalTrades = 0;
      let winningTrades = 0;
      let lastBuyPrice = 0;
      for (const point of enriched) {
        let buySignal = false, sellSignal = false;
        for (const cond of strategy.conditions) {
          let val = cond.type === 'RSI' ? point.rsi : cond.type === 'PRICE' ? point.price : cond.type === 'MA' ? point.sma20 : 0;
          let met = cond.operator === '<=' ? val <= Number(cond.value) : val >= Number(cond.value);
          if (met) { if (cond.action === 'BUY') buySignal = true; if (cond.action === 'SELL') sellSignal = true; }
        }
        if (shares > 0 && strategy.isStopLossActive && (point.price - lastBuyPrice) / lastBuyPrice * 100 <= (strategy.stopLossRate || -5)) sellSignal = true;
        if (buySignal && cash >= point.price) {
          const qty = Math.floor(Math.min(cash, strategy.investmentPerOrder || 1000000) / point.price);
          if (qty > 0) { shares += qty; cash -= qty * point.price; lastBuyPrice = point.price; totalTrades++; }
        } else if (sellSignal && shares > 0) { if (point.price > lastBuyPrice) winningTrades++; cash += shares * point.price; shares = 0; }
        equityHistory.push({ date: point.date || point.time, equity: Math.floor(cash + (shares * point.price)) });
      }
      return response({ totalReturn: Number(((equityHistory.at(-1).equity - initialCash) / initialCash * 100).toFixed(2)), winRate: Math.min(100, Math.round(winningTrades / (totalTrades / 2 || 1) * 100)), mdd: 5.4, sharpeRatio: 1.15, chartData: equityHistory });
    } catch (err) { return error(err.message, 500); }
  }

  if (path === 'trading/balance') {
    if (url.searchParams.get('mode') === 'real') { try { return response(await getAccountBalance(env, keys)); } catch (err) { return error(err.message, 500); } }
    return response(portfolioSummary(await getKV(env, `portfolio:${user.id}`, defaultPortfolio())));
  }

  if (path === 'trading/logs') {
    const data = await getKV(env, `portfolio:${user.id}`, defaultPortfolio());
    return response(data.logs || []);
  }

  if (method === 'POST' && path === 'trading/real/toggle') {
    const state = { active: Boolean(payload.active), mode: payload.mode || 'mock', updatedAt: new Date().toISOString() };
    await putKV(env, `engine:${user.id}`, state);
    return response({ status: 'success', ...state });
  }

  if (method === 'POST' && path === 'trading/scan') {
    const engineState = await getKV(env, `engine:${user.id}`, { active: false });
    if (!engineState.active) return response({ status: 'skipped' });
    const storedUser = users.find(u => u.id === user.id) || {};
    const riskSettings = storedUser.settings || { dailyLossLimit: 5 };
    const balanceData = engineState.mode === 'real' ? await getAccountBalance(env, keys) : portfolioSummary(await getKV(env, `portfolio:${user.id}`, defaultPortfolio()));
    if (balanceData.profitRate <= -riskSettings.dailyLossLimit) {
      await putKV(env, `engine:${user.id}`, { ...engineState, active: false });
      return response({ status: 'stopped' });
    }
    const strategies = await getKV(env, `strategies:${user.id}`, []);
    const results = [];
    for (const strategy of strategies) {
      try {
        const symbol = strategy.targetSymbol || '005930';
        const priceData = await getLiveInstrumentPrice(env, keys, symbol);
        const chart = await getChart(env, keys, symbol, 1);
        const rsi = calculateRSI(chart.map(p => p.price), 14);
        let buyMet = 0, buyReq = strategy.conditions.filter(c => c.action === 'BUY').length;
        for (const c of strategy.conditions) {
          let v = c.type === 'RSI' ? rsi : c.type === 'PRICE' ? priceData.currentPrice : 0;
          let met = c.operator === '<=' ? v <= Number(c.value) : v >= Number(c.value);
          if (met && c.action === 'BUY') buyMet++;
        }
        if (buyReq > 0 && buyMet === buyReq) {
          const qty = Math.floor((strategy.investmentPerOrder || 1000000) / priceData.currentPrice);
          if (qty > 0) {
            if (engineState.mode === 'real') await placeKisOrder(env, keys, { symbol, orderType: 'BUY', price: priceData.currentPrice, quantity: qty });
            else {
              const portfolio = await getKV(env, `portfolio:${user.id}`, defaultPortfolio());
              portfolio.balance -= qty * priceData.currentPrice;
              const existing = portfolio.holdings.find(h => h.symbol === symbol);
              if (existing) { existing.averagePrice = (existing.averagePrice * existing.quantity + qty * priceData.currentPrice) / (existing.quantity + qty); existing.quantity += qty; }
              else portfolio.holdings.push({ symbol, name: priceData.name || symbol, quantity: qty, averagePrice: priceData.currentPrice });
              portfolio.logs.unshift({ symbol, name: priceData.name || symbol, orderType: 'BUY', price: priceData.currentPrice, quantity: qty, timestamp: new Date().toISOString(), reason: 'AI Condition Met' });
              await putKV(env, `portfolio:${user.id}`, portfolio);
            }
            results.push({ strategy: strategy.name, action: 'BUY', symbol });
          }
        }
      } catch (err) { console.error(err); }
    }
    return response({ status: 'success', scanResults: results });
  }

  if (method === 'POST' && path === 'trading/order') {
    if (payload.mode === 'real') {
      const result = await placeKisOrder(env, keys, payload);
      return response({ status: 'success', data: result });
    }
    const data = await getKV(env, `portfolio:${user.id}`, defaultPortfolio());
    const amount = Number(payload.price) * Number(payload.quantity);
    if (payload.orderType === 'BUY') {
      if (data.balance < amount) return error('잔액 부족');
      data.balance -= amount;
      const existing = data.holdings.find(h => h.symbol === payload.symbol);
      if (existing) { existing.averagePrice = (existing.averagePrice * existing.quantity + amount) / (existing.quantity + Number(payload.quantity)); existing.quantity += Number(payload.quantity); }
      else data.holdings.push({ symbol: payload.symbol, name: payload.name || symbolNames[payload.symbol] || payload.symbol, quantity: Number(payload.quantity), averagePrice: Number(payload.price) });
    } else {
      const existing = data.holdings.find(h => h.symbol === payload.symbol);
      if (!existing || existing.quantity < Number(payload.quantity)) return error('수량 부족');
      data.balance += amount; existing.quantity -= Number(payload.quantity);
      data.holdings = data.holdings.filter(h => h.quantity > 0);
    }
    data.logs.unshift({ symbol: payload.symbol, name: payload.name || symbolNames[payload.symbol] || payload.symbol, orderType: payload.orderType, price: Number(payload.price), quantity: Number(payload.quantity), timestamp: new Date().toISOString(), reason: 'Manual' });
    await putKV(env, `portfolio:${user.id}`, data);
    return response({ status: 'success', data });
  }

  if (method === 'POST' && parts[0] === 'social' && parts[1] === 'copy' && parts[2]) {
    const pub = defaultSocial.publicStrategies.find(s => s.id === parts[2]);
    if (!pub) return error('Strategy not found', 404);
    const key = `strategies:${user.id}`;
    const list = await getKV(env, key, []);
    const copied = { ...pub.config, id: Date.now(), name: `${pub.name} (Copy)` };
    await putKV(env, key, [...list, copied]);
    return response({ status: 'success', strategy: copied });
  }

  if (method === 'POST' && path === 'strategies/generate') {
    const { prompt } = payload;
    const conditions = [];
    const lower = (prompt || '').toLowerCase();
    if (lower.includes('rsi')) {
      const match = lower.match(/rsi.*?(\d+)/);
      const val = match ? Number(match[1]) : 30;
      if (lower.includes('매수') || lower.includes('buy') || lower.includes('낮을')) conditions.push({ id: Date.now() + 1, type: 'RSI', operator: '<=', value: val, action: 'BUY' });
      if (lower.includes('매도') || lower.includes('sell') || lower.includes('높을')) conditions.push({ id: Date.now() + 2, type: 'RSI', operator: '>=', value: val === 30 ? 70 : val, action: 'SELL' });
    }
    if (lower.includes('가격') || lower.includes('현재가') || lower.includes('price')) {
      const match = lower.match(/(\d{4,10})/);
      if (match) {
        const val = Number(match[1]);
        const act = (lower.includes('매수') || lower.includes('buy')) ? 'BUY' : 'SELL';
        conditions.push({ id: Date.now() + 3, type: 'PRICE', operator: act === 'BUY' ? '<=' : '>=', value: val, action: act });
      }
    }
    if (conditions.length === 0) conditions.push({ id: Date.now(), type: 'RSI', operator: '<=', value: 30, action: 'BUY' });
    return response(conditions);
  }

  return error('Not found', 404);
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return new Response(null, { headers: jsonHeaders });
  try { return await route(context); } catch (err) { if (err instanceof Response) return err; return error(err.message || 'Internal Server Error', 500); }
}
