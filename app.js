/* ─── Default data extracted from guy_expense_etf_app_base.xlsx ─── */
const DEFAULTS = {
  inputs: {
    monthlyIncome: 700,
    monthlyExpenses: 5750.08,
    checkingBalance: 860.13,
    availableToWithdraw: 5360.13,
    lockedSavings: 41000,
    creditCurrentDue: 2768.27,
    creditLimit: 10000,
    creditRemaining: 4352.67,
    creditChargedSoFar: 240.09,
    emergencyFundMonths: 6,
    riskTolerance: "medium",
    investmentHorizon: "5+",
    essentialMonthly: 4025,
    dcaMonthly: 0
  },
  categories: [
    { id: 1, name: "רפואה ובתי מרקחת",   amount: 1341.67, type: "need",     source: "MAX", month: "June 2026" },
    { id: 2, name: "העברת כספים",          amount: 471.00,  type: "transfer", source: "MAX", month: "June 2026" },
    { id: 3, name: "מסעדות, קפה וברים",   amount: 408.50,  type: "want",     source: "MAX", month: "June 2026" },
    { id: 4, name: "חשמל ומחשבים",         amount: 347.47,  type: "need",     source: "MAX", month: "June 2026" },
    { id: 5, name: "קטגוריות נוספות",      amount: 439.72,  type: "other",    source: "MAX", month: "June 2026" }
  ],
  transactions: [
    { id: 1, date: "2026-05-12", account: "Pepper", description: "חיוב כרטיס מקס",    type: "expense",          amount: -179.62, source: "Pepper", category: "כרטיס אשראי", notes: "" },
    { id: 2, date: "2026-05-06", account: "Pepper", description: "חיוב כרטיס מקס",    type: "expense",          amount: -30.29,  source: "Pepper", category: "כרטיס אשראי", notes: "" },
    { id: 3, date: "2026-05-06", account: "Pepper", description: "העברה מגיא גרינברג", type: "income",           amount: 300,     source: "Pepper", category: "הכנסה",        notes: "" }
  ],
  monthlyTrend: [
    { month: "מרץ 2026",   amount: 5748 },
    { month: "אפריל 2026", amount: 5347 },
    { month: "מאי 2026",   amount: 6181 },
    { month: "יוני 2026",  amount: 3008 },
    { month: "יולי 2026",  amount: 1076 }
  ],
  settings: { currency: "ILS", language: "he", theme: "dark" },
  etfSettings: {
    watchlist: ["VTI","VOO","VT","QQQM","SCHD","VXUS","BND"],
    dataSource: "demo",
    cachedData: {},
    lastUpdated: null
  }
};

/* ─── State ─── */
const LS_KEY = "financeDashboardState_v1";

let state = loadState();

function loadState() {
  try {
    // Try new key first; fall back to old key for migration
    const raw = localStorage.getItem(LS_KEY) || localStorage.getItem("financeAppState");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.inputs &&
        typeof parsed.inputs.monthlyIncome === "number" &&
        Array.isArray(parsed.categories) &&
        Array.isArray(parsed.transactions)
      ) {
        if ("essentialExpenseRatio" in parsed.inputs && !("essentialMonthly" in parsed.inputs)) {
          parsed.inputs.essentialMonthly = parsed.inputs.essentialExpenseRatio * (parsed.inputs.monthlyExpenses || 5750.08);
        }
        mergeDefaults(parsed, DEFAULTS);
        return parsed;
      }
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULTS));
}

function mergeDefaults(loaded, defs) {
  for (const k of Object.keys(defs.inputs)) {
    if (!(k in loaded.inputs)) loaded.inputs[k] = defs.inputs[k];
  }
  if (!loaded.etfSettings) {
    loaded.etfSettings = JSON.parse(JSON.stringify(defs.etfSettings));
  } else {
    for (const k of Object.keys(defs.etfSettings)) {
      if (!(k in loaded.etfSettings)) loaded.etfSettings[k] = defs.etfSettings[k];
    }
  }
}

function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {}
  updateSaveStatus();
}

function updateSaveStatus() {
  const el = document.getElementById("autosave-status");
  if (!el) return;
  const t = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  el.textContent = "✓ נשמר אוטומטית — " + t;
  el.classList.add("status-saved");
}

/* ─── Helpers ─── */
function fmt(n) {
  if (n == null || isNaN(n)) return "חסר נתון";
  return "₪" + Math.abs(n).toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtSigned(n) {
  if (n == null || isNaN(n)) return "חסר נתון";
  const s = n >= 0 ? "+" : "-";
  return s + "₪" + Math.abs(n).toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(n, d) {
  if (!d) return "0.0%";
  return ((n / d) * 100).toFixed(1) + "%";
}
function uid() { return Date.now() + Math.random().toString(36).slice(2); }

/* ─── ETF Market Data ─── */
const ETF_METADATA = {
  VTI:  { name: "Vanguard Total Stock Market ETF",    expenseRatio: 0.03, return1y: 24.8,  return3y: 9.1,  return5y: 13.8, volatility: 14.9, dividendYield: 1.4, aum: 390, diversification: 92, demoPrice: 238.45, demoDailyChange:  0.42, category: "US Total Market",          region: "US",            currency: "USD",   dcaSuitability: 95, longTermScore: 95 },
  VOO:  { name: "Vanguard S&P 500 ETF",               expenseRatio: 0.03, return1y: 25.4,  return3y: 10.1, return5y: 14.6, volatility: 14.6, dividendYield: 1.3, aum: 500, diversification: 85, demoPrice: 543.21, demoDailyChange:  0.38, category: "US Large Cap S&P 500",     region: "US",            currency: "USD",   dcaSuitability: 95, longTermScore: 95 },
  VT:   { name: "Vanguard Total World Stock ETF",     expenseRatio: 0.07, return1y: 21.8,  return3y:  6.4, return5y: 10.9, volatility: 13.2, dividendYield: 2.0, aum:  40, diversification: 98, demoPrice: 112.34, demoDailyChange:  0.31, category: "Global All Market",        region: "Global",        currency: "Multi", dcaSuitability: 90, longTermScore: 95 },
  QQQM: { name: "Invesco Nasdaq-100 ETF",             expenseRatio: 0.15, return1y: 29.3,  return3y:  8.8, return5y: 20.5, volatility: 19.8, dividendYield: 0.6, aum:  38, diversification: 55, demoPrice: 198.76, demoDailyChange:  0.84, category: "US Technology Nasdaq-100", region: "US",            currency: "USD",   dcaSuitability: 85, longTermScore: 75 },
  SCHD: { name: "Schwab US Dividend Equity ETF",      expenseRatio: 0.06, return1y: 18.2,  return3y:  5.8, return5y: 12.1, volatility: 13.3, dividendYield: 3.4, aum:  60, diversification: 70, demoPrice:  28.15, demoDailyChange: -0.12, category: "US Dividend Equity",       region: "US",            currency: "USD",   dcaSuitability: 80, longTermScore: 80 },
  VXUS: { name: "Vanguard Total International ETF",  expenseRatio: 0.07, return1y: 17.1,  return3y:  2.1, return5y:  7.2, volatility: 13.7, dividendYield: 3.0, aum:  65, diversification: 95, demoPrice:  58.92, demoDailyChange:  0.21, category: "International Developed",  region: "International", currency: "Multi", dcaSuitability: 80, longTermScore: 85 },
  BND:  { name: "Vanguard Total Bond Market ETF",     expenseRatio: 0.03, return1y:  1.3,  return3y: -2.1, return5y:  1.1, volatility:  5.2, dividendYield: 3.5, aum: 110, diversification: 88, demoPrice:  73.45, demoDailyChange: -0.08, category: "US Total Bond Market",     region: "US",            currency: "USD",   dcaSuitability: 75, longTermScore: 70 }
};

function getEtfSettings() {
  if (!state.etfSettings || !Array.isArray(state.etfSettings.watchlist)) {
    state.etfSettings = JSON.parse(JSON.stringify(DEFAULTS.etfSettings));
  }
  if (typeof state.etfSettings.cachedData !== "object" || state.etfSettings.cachedData === null) {
    state.etfSettings.cachedData = {};
  }
  return state.etfSettings;
}

function normalizeInArray(arr, higherIsBetter) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max === min) return arr.map(() => 50);
  return arr.map(v => {
    const n = ((v - min) / (max - min)) * 100;
    return higherIsBetter ? n : 100 - n;
  });
}

function buildDemoData(symbols) {
  const result = {};
  symbols.forEach(sym => {
    if (ETF_METADATA[sym]) result[sym] = { ...ETF_METADATA[sym], isDemo: true };
  });
  return result;
}

async function fetchEtfMarketData(symbols) {
  try {
    const url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + symbols.join(",");
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const json = await resp.json();
    const quotes = json?.quoteResponse?.result ?? [];
    if (!quotes.length) throw new Error("empty");
    const result = {};
    quotes.forEach(q => {
      const sym  = q.symbol;
      const meta = ETF_METADATA[sym] || {};
      result[sym] = {
        name:            q.longName || q.shortName || meta.name || sym,
        expenseRatio:    meta.expenseRatio ?? null,
        return1y:        q.fiftyTwoWeekChangePercent != null ? +(q.fiftyTwoWeekChangePercent * 100).toFixed(2) : (meta.return1y ?? 0),
        return3y:        meta.return3y ?? 0,
        return5y:        meta.return5y ?? 0,
        volatility:      meta.volatility ?? 15,
        dividendYield:   q.trailingAnnualDividendYield != null ? +(q.trailingAnnualDividendYield * 100).toFixed(2) : (meta.dividendYield ?? 0),
        aum:             q.totalAssets != null ? +(q.totalAssets / 1e9).toFixed(1) : (meta.aum ?? 0),
        diversification: meta.diversification ?? 50,
        demoPrice:       q.regularMarketPrice ?? meta.demoPrice ?? 0,
        demoDailyChange: q.regularMarketChangePercent ?? meta.demoDailyChange ?? 0,
        category:        meta.category ?? "ETF",
        isDemo:          false
      };
    });
    symbols.forEach(sym => {
      if (!result[sym] && ETF_METADATA[sym]) result[sym] = { ...ETF_METADATA[sym], isDemo: true };
    });
    return { data: result, failed: false };
  } catch (_) {
    return { data: buildDemoData(symbols), failed: true };
  }
}

function scoreEtfs(symbols, marketData, risk) {
  const W = {
    low:    { expense: 0.25, ret: 0.20, vol: 0.30, liq: 0.10, div: 0.15 },
    medium: { expense: 0.25, ret: 0.25, vol: 0.20, liq: 0.15, div: 0.15 },
    high:   { expense: 0.20, ret: 0.35, vol: 0.10, liq: 0.20, div: 0.15 }
  };
  const w = W[risk] || W.medium;

  function safeNum(sym, field, fallback) {
    const v = marketData[sym]?.[field];
    return (v != null && !isNaN(Number(v))) ? Number(v) : fallback;
  }
  function isMissing(sym, field) {
    const v = marketData[sym]?.[field];
    return v == null || isNaN(Number(v));
  }

  const expArr  = symbols.map(s => safeNum(s, "expenseRatio",    0.5));
  const retArr  = symbols.map(s => safeNum(s, "return1y",        0));
  const volArr  = symbols.map(s => safeNum(s, "volatility",      20));
  const aumArr  = symbols.map(s => safeNum(s, "aum",             0));
  const divArr  = symbols.map(s => safeNum(s, "diversification", 50));
  const expNorm = normalizeInArray(expArr, false);
  const retNorm = normalizeInArray(retArr, true);
  const volNorm = normalizeInArray(volArr, false);
  const aumNorm = normalizeInArray(aumArr, true);
  const divNorm = normalizeInArray(divArr, true);

  return symbols.map((sym, i) => {
    const raw = expNorm[i]*w.expense + retNorm[i]*w.ret + volNorm[i]*w.vol + aumNorm[i]*w.liq + divNorm[i]*w.div;
    const missing = ["expenseRatio","return1y","volatility","aum","diversification"].filter(f => isMissing(sym, f)).length;
    return {
      symbol:       sym,
      score:        isNaN(raw) ? 0 : Math.round(raw),
      scoreQuality: missing >= 3 ? "missing" : missing >= 1 ? "partial" : "full",
      data:         marketData[sym],
      breakdown: {
        expense: Math.round(expNorm[i]),
        ret:     Math.round(retNorm[i]),
        vol:     Math.round(volNorm[i]),
        liq:     Math.round(aumNorm[i]),
        div:     Math.round(divNorm[i])
      }
    };
  }).sort((a, b) => b.score - a.score);
}

function scoreClass(s) { return s >= 65 ? "score-high" : s >= 40 ? "score-mid" : "score-low"; }

function getEtfTags(sym, data) {
  if (!data) return [];
  const tags = [];
  if (data.expenseRatio != null && data.expenseRatio <= 0.03) tags.push({ label: "דמי ניהול נמוכים", color: "green" });
  if (data.return1y    >  22)  tags.push({ label: "תשואה גבוהה",   color: "green"  });
  if (data.volatility  >  18)  tags.push({ label: "תנודתיות גבוהה",color: "orange" });
  if (data.volatility  <   8)  tags.push({ label: "יציבות גבוהה",  color: "green"  });
  if (data.dividendYield > 2.5)tags.push({ label: "דיבידנד גבוה",  color: "blue"   });
  if (data.diversification > 90) tags.push({ label: "פיזור גלובלי",color: "blue"   });
  if (data.aum         > 200)  tags.push({ label: "AUM גבוה",      color: "green"  });
  const meta = ETF_METADATA[sym];
  if (meta) {
    if (meta.region)   tags.push({ label: meta.region,   color: "blue" });
    if (meta.currency) tags.push({ label: meta.currency,  color: "blue" });
  }
  return tags;
}

function renderBreakdownRows(bd) {
  return [
    { label: "דמי ניהול", val: bd.expense },
    { label: "תשואה",     val: bd.ret     },
    { label: "יציבות",    val: bd.vol     },
    { label: "נזילות",    val: bd.liq     },
    { label: "פיזור",     val: bd.div     }
  ].map(it => `<div class="etfc-breakdown-row">
    <span class="etfc-breakdown-label">${it.label}</span>
    <div class="etfc-breakdown-bar-track"><div class="etfc-breakdown-bar-fill" style="width:${it.val}%"></div></div>
    <span class="etfc-breakdown-val">${it.val}</span>
  </div>`).join("");
}

function toggleEtfBreakdown(btn) {
  const bd = btn.nextElementSibling;
  const wasHidden = bd.classList.contains("hidden");
  bd.classList.toggle("hidden", !wasHidden);
  btn.textContent = wasHidden ? "▲ סגור פירוט" : "▼ פירוט ציון";
}

function renderEtfCards(scored) {
  const el = document.getElementById("etfc-cards-container");
  if (!el) return;
  if (!scored.length) {
    el.innerHTML = '<p class="small" style="padding:.75rem;text-align:center;">אין ETF ברשימה. הוסף סימול מעל.</p>';
    return;
  }
  el.innerHTML = scored.map((item, idx) => {
    const { symbol, score, scoreQuality, data, breakdown } = item;
    if (!data) return `<div class="etfc-card"><span class="etfc-symbol">${symbol}</span><p class="small" style="margin-top:.5rem;">אין נתונים לסימול זה — לא נמצא בנתוני ההדגמה.</p></div>`;
    const sc   = scoreClass(score);
    const tags = getEtfTags(symbol, data);
    const sign = (data.demoDailyChange || 0) >= 0 ? "+" : "";
    const r1y  = data.return1y  ?? 0;
    const r3y  = data.return3y  ?? 0;
    const r5y  = data.return5y  ?? 0;
    const qualityHtml = scoreQuality !== "full"
      ? `<div class="etfc-score-quality ${scoreQuality === "missing" ? "quality-missing" : "quality-partial"}">${scoreQuality === "missing" ? "מידע חסר — נדרש לבדוק ידנית" : "ציון חלקי — חסרים נתונים מסוימים"}</div>`
      : "";
    return `<div class="etfc-card ${idx === 0 ? "etfc-card-top" : ""}">
      <div class="etfc-card-header">
        <span class="etfc-symbol">${symbol}</span>
        <span class="etfc-rank">#${idx + 1}</span>
      </div>
      ${idx === 0 ? '<span class="etfc-best-badge">מדורג ראשון לפי הקריטריונים שהוגדרו</span>' : ""}
      <div class="etfc-name">${data.name || symbol}</div>
      <div class="etfc-price-row">
        <span class="etfc-price">$${(data.demoPrice || 0).toFixed(2)}</span>
        <span class="etfc-daily-change ${(data.demoDailyChange || 0) >= 0 ? "positive" : "negative"}">${sign}${Math.abs(data.demoDailyChange || 0).toFixed(2)}%</span>
        ${data.isDemo ? '<span class="etfc-tag demo">הדגמה</span>' : ""}
      </div>
      <div class="etfc-score-row">
        <span class="etfc-score-label">ציון</span>
        <span class="etfc-score-num ${sc}">${score}<span class="etfc-score-denom">/100</span></span>
        <div class="etfc-score-bar-track"><div class="etfc-score-bar-fill ${sc}" style="width:${score}%"></div></div>
      </div>
      ${qualityHtml}
      <div class="etfc-data-grid">
        <div class="etfc-data-item"><div class="dl">תשואה 1Y</div><div class="dv ${r1y >= 0 ? "positive" : "negative"}">${r1y.toFixed(1)}%</div></div>
        <div class="etfc-data-item"><div class="dl">תשואה 3Y</div><div class="dv ${r3y >= 0 ? "positive" : "negative"}">${r3y.toFixed(1)}%</div></div>
        <div class="etfc-data-item"><div class="dl">תשואה 5Y</div><div class="dv ${r5y >= 0 ? "positive" : "negative"}">${r5y.toFixed(1)}%</div></div>
        <div class="etfc-data-item"><div class="dl">דמי ניהול</div><div class="dv">${data.expenseRatio != null ? data.expenseRatio.toFixed(2) + "%" : "לא זמין"}</div></div>
        <div class="etfc-data-item"><div class="dl">תנודתיות</div><div class="dv">${(data.volatility ?? 0).toFixed(1)}%</div></div>
        <div class="etfc-data-item"><div class="dl">דיבידנד</div><div class="dv">${(data.dividendYield ?? 0).toFixed(1)}%</div></div>
      </div>
      ${tags.length ? `<div class="etfc-tags">${tags.map(t => `<span class="etfc-tag ${t.color}">${t.label}</span>`).join("")}</div>` : ""}
      <button class="etfc-breakdown-toggle" onclick="toggleEtfBreakdown(this)">▼ פירוט ציון</button>
      <div class="etfc-breakdown hidden">${renderBreakdownRows(breakdown)}</div>
    </div>`;
  }).join("");
}

function renderReturnChart(scored) {
  destroyChart("chart-etf-compare");
  const canvas   = document.getElementById("chart-etf-compare");
  const noDataEl = document.getElementById("etfc-chart-no-data");
  if (!scored.length) {
    if (canvas)   canvas.style.display = "none";
    if (noDataEl) noDataEl.classList.remove("hidden");
    return;
  }
  if (canvas)   canvas.style.display = "";
  if (noDataEl) noDataEl.classList.add("hidden");
  chartInstances["chart-etf-compare"] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: scored.map(s => s.symbol),
      datasets: [
        { label: "1Y %",  data: scored.map(s => s.data?.return1y  ?? 0), backgroundColor: "rgba(59,130,246,0.55)",  borderColor: "#3b82f6", borderWidth: 1 },
        { label: "3Y %",  data: scored.map(s => s.data?.return3y  ?? 0), backgroundColor: "rgba(139,92,246,0.55)",  borderColor: "#8b5cf6", borderWidth: 1 },
        { label: "5Y %",  data: scored.map(s => s.data?.return5y  ?? 0), backgroundColor: "rgba(34,211,105,0.55)",  borderColor: "#22d369", borderWidth: 1 }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: "#f0f0fa", font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: "#6b7280" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: { ticks: { color: "#6b7280" }, grid: { color: "rgba(255,255,255,0.05)" }, title: { display: true, text: "%", color: "#6b7280" } }
      }
    }
  });
}

function renderEtfContext(c) {
  const el = document.getElementById("etfc-context-banner");
  if (!el) return;
  if (c.monthlySurplus < 0) {
    el.innerHTML = "⚠ למרות שניתן להשוות ETFים, לפי התזרים החודשי הנוכחי האפליקציה לא מציעה הקצאת השקעה חודשית כרגע.";
    el.style.borderRightColor = "var(--red)";
  } else if (!c.efOk) {
    el.innerHTML = "⚠ קרן החירום עדיין לא מלאה. השוואת ETF מוצגת לצורך תכנון בלבד.";
    el.style.borderRightColor = "var(--orange)";
  } else if (c.etf > 0) {
    el.innerHTML = "ניתן להשתמש בהשוואה כדי לבחור ETF לבדיקה נוספת, אך אין לראות בכך ייעוץ השקעות.";
    el.style.borderRightColor = "var(--green)";
  } else {
    el.innerHTML = "השוואת ETF מוצגת לצורך מידע בלבד — אינה מהווה ייעוץ השקעות.";
    el.style.borderRightColor = "var(--blue)";
  }
}

function renderWatchlistChips(symbols) {
  const el = document.getElementById("etfc-chips");
  if (!el) return;
  el.innerHTML = symbols.map(sym =>
    `<span class="etfc-chip">${sym}<button onclick="removeEtfSymbol('${sym}')" aria-label="הסר ${sym}">×</button></span>`
  ).join("");
}

function removeEtfSymbol(sym) {
  const s = getEtfSettings();
  s.watchlist = s.watchlist.filter(x => x !== sym);
  delete s.cachedData[sym];
  saveState();
  renderEtfCompare();
}

function addEtfSymbol() {
  const inp = document.getElementById("etfc-add-symbol");
  if (!inp) return;
  const sym = inp.value.trim().toUpperCase().replace(/[^A-Z0-9.^-]/g, "");
  if (!sym) return;
  const s = getEtfSettings();
  if (s.watchlist.includes(sym)) { inp.value = ""; return; }
  s.watchlist.push(sym);
  s.cachedData = {};
  s.lastUpdated = null;
  inp.value = "";
  saveState();
  renderEtfCompare();
}

function refreshEtfData() {
  const s = getEtfSettings();
  s.cachedData = {};
  s.lastUpdated = null;
  saveState();
  renderEtfCompare();
}

async function renderEtfCompare() {
  const s    = getEtfSettings();
  const c    = calc();
  const risk = state.inputs.riskTolerance || "medium";
  const riskLabels = { low: "נמוכה", medium: "בינונית", high: "גבוהה" };

  const rdEl = document.getElementById("etfc-risk-display");
  if (rdEl) rdEl.textContent = riskLabels[risk] || risk;

  renderEtfContext(c);
  renderWatchlistChips(s.watchlist);

  const srcBadge = document.getElementById("etfc-source-label");
  if (srcBadge) {
    srcBadge.textContent  = s.dataSource === "live" ? "🟢 חי" : "🔵 הדגמה";
    srcBadge.className    = "etfc-source-badge" + (s.dataSource === "live" ? " live" : "");
  }

  const now   = Date.now();
  const stale = !s.lastUpdated || (now - s.lastUpdated) > 5 * 60 * 1000;

  if (stale || !Object.keys(s.cachedData).length) {
    const cardsEl = document.getElementById("etfc-cards-container");
    if (cardsEl) cardsEl.innerHTML = '<p class="small" style="padding:.75rem;text-align:center;">טוען נתונים...</p>';
    if (s.dataSource === "live") {
      const result  = await fetchEtfMarketData(s.watchlist);
      s.cachedData  = result.data;
      s.liveFetchFailed = result.failed;
    } else {
      s.cachedData  = buildDemoData(s.watchlist);
      s.liveFetchFailed = false;
    }
    s.lastUpdated = now;
    saveState();
  }

  // Demo / failure notice
  const noticeEl = document.getElementById("etfc-demo-notice");
  if (noticeEl) {
    if (s.dataSource === "demo") {
      noticeEl.textContent = "מצב דמו — הנתונים אינם מתעדכנים בזמן אמת.";
      noticeEl.className   = "etfc-demo-notice demo";
    } else if (s.liveFetchFailed) {
      noticeEl.textContent = "לא ניתן היה לעדכן נתוני שוק. מוצגים נתונים אחרונים שנשמרו או נתוני דמו.";
      noticeEl.className   = "etfc-demo-notice failed";
    } else {
      noticeEl.textContent = "";
      noticeEl.className   = "etfc-demo-notice hidden";
    }
  }

  const luEl = document.getElementById("etfc-last-updated");
  if (luEl && s.lastUpdated) {
    luEl.textContent = "עודכן: " + new Date(s.lastUpdated).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  }

  const validSymbols = s.watchlist.filter(sym => s.cachedData[sym]);
  const scored = scoreEtfs(validSymbols, s.cachedData, risk);
  renderEtfCards(scored);
  renderReturnChart(scored);
}

/* ─── Calculations ─── */
function calc() {
  const inp = state.inputs;
  const totalCatExpenses = state.categories.reduce((s, c) => s + (c.type !== "transfer" ? c.amount : 0), 0);
  const essentialExpenses = (inp.essentialMonthly > 0)
    ? inp.essentialMonthly
    : inp.monthlyExpenses * 0.7;
  const ef3  = essentialExpenses * 3;
  const ef6  = essentialExpenses * 6;
  const ef12 = essentialExpenses * 12;
  const emergencyTarget   = ef6;
  const liquidCash        = inp.availableToWithdraw;
  const liquidGap         = emergencyTarget - liquidCash;
  const efMonthsCovered   = essentialExpenses > 0 ? liquidCash / essentialExpenses : 0;
  const monthlySurplus    = inp.monthlyIncome - inp.monthlyExpenses;
  const ccPressure        = inp.creditCurrentDue / (inp.monthlyIncome || 1);
  const expenseRatio      = inp.monthlyExpenses / (inp.monthlyIncome || 1);
  const savingsRate       = monthlySurplus > 0 ? (monthlySurplus / inp.monthlyIncome) : 0;

  // ETF recommendation engine
  let etf = 0, cashSav = 0, label = "", explanation = "", split = "100% ייצוב תזרים";

  if (monthlySurplus <= 0) {
    label = "קודם לייצב תזרים";
    explanation = `ההוצאות החודשיות (${fmt(inp.monthlyExpenses)}) עולות על ההכנסה (${fmt(inp.monthlyIncome)}). גירעון של ${fmt(Math.abs(monthlySurplus))} לחודש. אין עודף להשקעה כרגע.`;
    split = "100% ייצוב תזרים";
  } else if (inp.investmentHorizon === "<1") {
    cashSav = monthlySurplus;
    label = "קודם לייצב תזרים";
    explanation = `אופק ההשקעה קצר מדי ל-ETF. מוצע לחסוך את כל העודף (${fmt(monthlySurplus)}) במזומן.`;
    split = "100% חיסכון מזומן";
  } else if (efMonthsCovered < 3) {
    cashSav = monthlySurplus;
    label = "קודם לבנות קרן חירום";
    explanation = `קרן החירום חסרה ${fmt(liquidGap)}. כל העודף החודשי (${fmt(monthlySurplus)}) יופנה לחיסכון מזומן.`;
    split = "100% קרן חירום";
  } else if (efMonthsCovered < 6) {
    const etfFraction = inp.riskTolerance === "low" ? 0.2 : inp.riskTolerance === "high" ? 0.5 : 0.3;
    cashSav = Math.round(monthlySurplus * (1 - etfFraction));
    etf = Math.round(monthlySurplus * etfFraction);
    label = "אפשר לשלב חיסכון ו־ETF";
    explanation = `קרן החירום קרובה ליעד. מוצע פיצול: ${fmt(cashSav)} לחיסכון, ${fmt(etf)} ל-ETF.`;
    split = `${Math.round((1 - etfFraction) * 100)}% חיסכון / ${Math.round(etfFraction * 100)}% ETF`;
  } else {
    let etfFraction = inp.riskTolerance === "low" ? 0.4 : inp.riskTolerance === "high" ? 0.8 : 0.6;
    if (inp.investmentHorizon === "1-5") etfFraction = Math.min(etfFraction, 0.5);
    cashSav = Math.round(monthlySurplus * (1 - etfFraction));
    etf = Math.round(monthlySurplus * etfFraction);
    label = "אפשר להגדיל חשיפה ל־ETF";
    explanation = `קרן החירום מכוסה. ניתן להשקיע ${fmt(etf)} ב-ETF ולחסוך ${fmt(cashSav)} במזומן.`;
    split = `${Math.round((1 - etfFraction) * 100)}% חיסכון / ${Math.round(etfFraction * 100)}% ETF`;
  }

  // Interpretation
  const topCat = [...state.categories].sort((a, b) => b.amount - a.amount)[0];
  const efProgress = Math.min((liquidCash / emergencyTarget) * 100, 100);

  const decisionSteps = [
    { rule: "תזרים חיובי",          pass: monthlySurplus > 0,  value: fmtSigned(monthlySurplus) },
    { rule: "קרן חירום ≥ 3 חודשים", pass: efMonthsCovered >= 3, value: efMonthsCovered.toFixed(1) + " חודשים" },
    { rule: "קרן חירום ≥ 6 חודשים", pass: efMonthsCovered >= 6, value: efMonthsCovered.toFixed(1) + " חודשים" },
    { rule: "יחס הוצאות < 95%",     pass: expenseRatio < 0.95, value: pct(inp.monthlyExpenses, inp.monthlyIncome) },
  ];

  return {
    essentialExpenses, emergencyTarget, liquidGap, monthlySurplus,
    ccPressure, expenseRatio, savingsRate, totalCatExpenses,
    etf, cashSav, label, explanation, split, efProgress,
    ef3, ef6, ef12, efMonthsCovered, decisionSteps,
    efOk: liquidCash >= emergencyTarget,
    topCat
  };
}

/* ─── Navigation ─── */
let activeScreen = "dashboard";
const screens = ["dashboard", "inputs", "categories", "transactions", "charts", "etf", "etf-compare"];

function showScreen(id) {
  activeScreen = id;
  screens.forEach(s => {
    document.getElementById("screen-" + s).classList.toggle("hidden", s !== id);
  });
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.screen === id);
  });
  if (id === "dashboard") renderDashboard();
  if (id === "inputs")    renderInputs();
  if (id === "categories") renderCategories();
  if (id === "transactions") renderTransactions();
  if (id === "charts")      renderCharts();
  if (id === "etf")         renderETF();
  if (id === "etf-compare") renderEtfCompare();
}

/* ─── Dashboard ─── */
function renderDashboard() {
  const c   = calc();
  const inp = state.inputs;
  const efPctStr = c.efProgress.toFixed(1) + "%";

  // Hero banner
  const heroSurplus = document.getElementById("hero-surplus");
  if (heroSurplus) {
    heroSurplus.textContent = fmtSigned(c.monthlySurplus);
    heroSurplus.className   = "hero-kpi-value currency " + (c.monthlySurplus >= 0 ? "positive" : "negative");
  }
  const heroMeta = document.getElementById("hero-meta");
  if (heroMeta) heroMeta.textContent = fmt(inp.monthlyIncome) + " הכנסה  —  " + fmt(inp.monthlyExpenses) + " הוצאות";

  // מצב החודש
  document.getElementById("dash-income").textContent        = fmt(inp.monthlyIncome);
  document.getElementById("dash-expenses").textContent      = fmt(inp.monthlyExpenses);
  document.getElementById("dash-surplus").textContent       = fmtSigned(c.monthlySurplus);
  document.getElementById("dash-surplus").className         = "card-value currency " + (c.monthlySurplus >= 0 ? "positive" : "negative");
  document.getElementById("dash-expense-ratio").textContent = pct(inp.monthlyExpenses, inp.monthlyIncome);

  const cfl = document.getElementById("cashflow-status-line");
  if (cfl) {
    if (c.monthlySurplus < 0) {
      cfl.textContent = "תזרים שלילי — לא מומלץ להשקיע החודש";
      cfl.className   = "cashflow-status negative-flow";
    } else {
      cfl.textContent = "תזרים חיובי — ניתן לשקול חיסכון או השקעה לפי מצב קרן החירום";
      cfl.className   = "cashflow-status positive-flow";
    }
  }

  // נזילות ונכסים
  document.getElementById("dash-balance").textContent  = fmt(inp.checkingBalance);
  document.getElementById("dash-withdraw").textContent = fmt(inp.availableToWithdraw);
  document.getElementById("dash-locked").textContent   = fmt(inp.lockedSavings);
  document.getElementById("dash-cc").textContent       = fmt(inp.creditCurrentDue);

  // קרן חירום
  document.getElementById("dash-ef-target").textContent = fmt(c.emergencyTarget);
  document.getElementById("dash-ef-liquid").textContent = fmt(inp.availableToWithdraw);

  const efGapEl = document.getElementById("dash-ef-gap");
  efGapEl.textContent = c.liquidGap > 0 ? "חסר " + fmt(c.liquidGap) : "היעד הושלם";
  efGapEl.className   = "number " + (c.liquidGap > 0 ? "negative" : "positive");

  const efStatusEl = document.getElementById("ef-status-text");
  if (efStatusEl) {
    efStatusEl.textContent = c.efOk ? "קרן החירום מלאה ✓" : "קרן החירום עדיין לא מלאה";
    efStatusEl.className   = "ef-status " + (c.efOk ? "ef-ok" : "ef-gap");
  }

  const bar = document.getElementById("ef-progress-bar");
  if (bar) { bar.style.width = efPctStr; bar.textContent = efPctStr; }

  // המלצה
  document.getElementById("dash-etf").textContent     = fmt(c.etf);
  document.getElementById("dash-cashsav").textContent = fmt(c.cashSav);
  document.getElementById("dash-label").textContent   = c.label;
  document.getElementById("dash-label").className     = "rec-label " + recLabelClass(c.label);

  renderDiagnostic(c);
  renderInterpretation(c);

  // EF milestones
  const ef3El  = document.getElementById("dash-ef-3");
  const ef6El  = document.getElementById("dash-ef-6");
  const ef12El = document.getElementById("dash-ef-12");
  const efMCEl = document.getElementById("dash-ef-months-covered");
  const ms3El  = document.getElementById("ef-ms-3");
  const ms6El  = document.getElementById("ef-ms-6");
  const ms12El = document.getElementById("ef-ms-12");
  if (ef3El)  ef3El.textContent  = fmt(c.ef3);
  if (ef6El)  ef6El.textContent  = fmt(c.ef6);
  if (ef12El) ef12El.textContent = fmt(c.ef12);
  if (efMCEl) efMCEl.textContent = c.efMonthsCovered.toFixed(1) + " חודשים מכוסים";
  if (ms3El)  ms3El.className  = "ef-ms " + (inp.availableToWithdraw >= c.ef3  ? "ef-milestone-reached" : "");
  if (ms6El)  ms6El.className  = "ef-ms " + (inp.availableToWithdraw >= c.ef6  ? "ef-milestone-reached" : "");
  if (ms12El) ms12El.className = "ef-ms " + (inp.availableToWithdraw >= c.ef12 ? "ef-milestone-reached" : "");

  // Decision chain
  const chainEl = document.getElementById("dash-decision-chain");
  if (chainEl && c.decisionSteps) {
    chainEl.innerHTML = c.decisionSteps.map(s =>
      `<div class="decision-step ${s.pass ? "pass" : "fail"}">` +
      `<span class="ds-rule">${s.rule}</span>` +
      `<span class="ds-val">${s.value}</span></div>`
    ).join("");
  }
}

function diagRow(label, value, status) {
  return `<div class="diagnostic-row">
    <span class="diag-label">${label}</span>
    <span class="diag-badge ${status}">${value}</span>
  </div>`;
}

function renderDiagnostic(c) {
  const inp = state.inputs;
  const rows = [];

  rows.push(diagRow("תזרים",
    c.monthlySurplus >= 0 ? "חיובי" : "שלילי",
    c.monthlySurplus >= 0 ? "ok" : "bad"));

  const hasCC = inp.creditCurrentDue > 0;
  rows.push(diagRow("חוב אשראי",
    hasCC ? fmt(inp.creditCurrentDue) : "לא קיים",
    hasCC ? "warn" : "ok"));

  rows.push(diagRow("קרן חירום",
    c.efOk ? "מלאה" : "לא מלאה",
    c.efOk ? "ok" : "warn"));

  rows.push(diagRow("השקעת ETF",
    c.etf > 0 ? "ניתן לשקול" : "לא מומלצת כרגע",
    c.etf > 0 ? "ok" : "bad"));

  // Priority action
  let action;
  if (c.monthlySurplus < 0) {
    const deficit = Math.abs(c.monthlySurplus);
    action = `להפחית הוצאות לפחות ב-<span class="currency negative">${fmt(deficit)}</span> כדי להגיע לאיזון`;
  } else if (hasCC) {
    action = "לתעדף סגירת חוב אשראי לפני הגדלת השקעות";
  } else if (!c.efOk) {
    action = "להעביר עודף חודשי לקרן חירום";
  } else {
    action = "ניתן לשקול הקצאה חודשית ל-ETF לפי סיבולת סיכון";
  }
  rows.push(`<div class="diag-action">📌 פעולה ראשונה: ${action}</div>`);

  document.getElementById("diagnostic-rows").innerHTML = rows.join("");
}

function recLabelClass(label) {
  if (label.includes("ייצב")) return "warn-red";
  if (label.includes("חירום")) return "warn-orange";
  if (label.includes("לשלב")) return "warn-yellow";
  return "warn-green";
}

function renderInterpretation(c) {
  const inp = state.inputs;
  const lines = [];

  if (c.monthlySurplus < 0) {
    lines.push(`<li class="neg">גירעון חודשי: ${fmt(Math.abs(c.monthlySurplus))}. ההוצאות גבוהות מההכנסה ב-${pct(Math.abs(c.monthlySurplus), inp.monthlyIncome)}.</li>`);
  } else {
    lines.push(`<li class="pos">עודף חודשי: ${fmt(c.monthlySurplus)} (${pct(c.monthlySurplus, inp.monthlyIncome)} מההכנסה).</li>`);
  }

  if (c.topCat) {
    lines.push(`<li>הקטגוריה הגדולה ביותר: <strong>${c.topCat.name}</strong> — ${fmt(c.topCat.amount)} (${pct(c.topCat.amount, inp.monthlyExpenses)} מההוצאות).</li>`);
  }

  const ccRatio = inp.creditCurrentDue / (inp.monthlyIncome || 1);
  if (ccRatio > 1) {
    lines.push(`<li class="neg">חיוב כרטיס האשראי (${fmt(inp.creditCurrentDue)}) גבוה מההכנסה החודשית — סיכון תזרימי גבוה.</li>`);
  } else if (ccRatio > 0.5) {
    lines.push(`<li class="warn">חיוב כרטיס האשראי (${fmt(inp.creditCurrentDue)}) הוא ${pct(inp.creditCurrentDue, inp.monthlyIncome)} מההכנסה — גבוה.</li>`);
  }

  if (c.liquidGap > 0) {
    lines.push(`<li class="warn">קרן החירום חסרה ${fmt(c.liquidGap)}. יעד: ${fmt(c.emergencyTarget)} (${inp.emergencyFundMonths} חודשי הוצאות בסיסיות).</li>`);
  } else {
    lines.push(`<li class="pos">קרן החירום מכוסה. מזומן זמין: ${fmt(inp.availableToWithdraw)}.</li>`);
  }

  if (c.etf > 0) {
    lines.push(`<li class="pos">ניתן להשקיע ${fmt(c.etf)} בחודש ב-ETF.</li>`);
  } else {
    lines.push(`<li>השקעת ETF לא מומלצת כרגע — קודם יש לייצב את התזרים.</li>`);
  }

  const totalAssets = inp.availableToWithdraw + inp.lockedSavings;
  lines.push(`<li>סה"כ נכסים נזילים + חיסכון נעול: ${fmt(totalAssets)}.</li>`);

  document.getElementById("interpretation-list").innerHTML = lines.join("");
}

/* ─── Inputs ─── */
function renderInputs() {
  const inp = state.inputs;
  const fields = [
    ["inp-income",         "monthlyIncome"],
    ["inp-expenses",       "monthlyExpenses"],
    ["inp-checking",       "checkingBalance"],
    ["inp-withdraw",       "availableToWithdraw"],
    ["inp-locked",         "lockedSavings"],
    ["inp-cc-due",         "creditCurrentDue"],
    ["inp-cc-limit",       "creditLimit"],
    ["inp-ef-essential",   "essentialMonthly"]
  ];
  fields.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.value = inp[key];
  });
  document.getElementById("inp-risk").value    = inp.riskTolerance;
  document.getElementById("inp-horizon").value = inp.investmentHorizon;
  document.getElementById("inp-ef-months").value = inp.emergencyFundMonths;
  const etfSrcEl = document.getElementById("inp-etf-source");
  if (etfSrcEl) etfSrcEl.value = getEtfSettings().dataSource;
}

function bindInputs() {
  const fields = [
    ["inp-income",    "monthlyIncome",    "number"],
    ["inp-expenses",  "monthlyExpenses",  "number"],
    ["inp-checking",  "checkingBalance",  "number"],
    ["inp-withdraw",  "availableToWithdraw", "number"],
    ["inp-locked",    "lockedSavings",    "number"],
    ["inp-cc-due",    "creditCurrentDue", "number"],
    ["inp-cc-limit",  "creditLimit",      "number"],
    ["inp-ef-essential", "essentialMonthly", "number"],
    ["inp-dca-monthly",  "dcaMonthly",       "number"],
    ["inp-risk",      "riskTolerance",    "text"],
    ["inp-horizon",   "investmentHorizon","text"],
    ["inp-ef-months", "emergencyFundMonths","number"]
  ];
  fields.forEach(([id, key, type]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      state.inputs[key] = type === "number" ? parseFloat(el.value) || 0 : el.value;
      saveState();
      if (activeScreen === "dashboard") renderDashboard();
      if (activeScreen === "etf") renderETF();
    });
  });

  const etfSrcEl = document.getElementById("inp-etf-source");
  if (etfSrcEl) {
    etfSrcEl.addEventListener("change", () => {
      const s = getEtfSettings();
      s.dataSource  = etfSrcEl.value;
      s.cachedData  = {};
      s.lastUpdated = null;
      saveState();
    });
  }
}

/* ─── Categories ─── */
let catFilter = "";

function renderCategories() {
  const inp = state.inputs;
  const total = state.categories.reduce((s, c) => s + c.amount, 0);
  const c = calc();
  document.getElementById("cat-total").textContent = fmt(total);
  document.getElementById("cat-vs-expenses").textContent =
    total !== inp.monthlyExpenses
      ? `⚠ סה"כ קטגוריות (${fmt(total)}) שונה מהוצאות חודשיות (${fmt(inp.monthlyExpenses)}). הפרש: ${fmt(Math.abs(total - inp.monthlyExpenses))}`
      : `✓ הסכומים תואמים`;
  document.getElementById("cat-vs-expenses").className =
    total !== inp.monthlyExpenses ? "mismatch-warn" : "mismatch-ok";

  const tbody = document.getElementById("cat-tbody");
  const filtered = catFilter
    ? state.categories.filter(c => c.name.includes(catFilter))
    : state.categories;

  tbody.innerHTML = filtered.map(cat => `
    <tr>
      <td><input class="inline-edit" value="${cat.name}" onchange="updateCat(${cat.id},'name',this.value)" /></td>
      <td><input class="inline-edit num" type="number" value="${cat.amount}" onchange="updateCat(${cat.id},'amount',parseFloat(this.value)||0)" /></td>
      <td class="percent">${pct(cat.amount, total)}</td>
      <td class="percent">${pct(cat.amount, inp.monthlyIncome)}</td>
      <td>
        <select class="inline-select" onchange="updateCat(${cat.id},'type',this.value)">
          ${["need","want","savings","investment","debt","transfer","other"].map(t =>
            `<option value="${t}" ${cat.type===t?"selected":""}>${typeLabelHe(t)}</option>`
          ).join("")}
        </select>
      </td>
      <td>${cat.source}</td>
      <td><button class="btn-icon btn-del" onclick="deleteCat(${cat.id})">✕</button></td>
    </tr>`).join("");
}

function typeLabelHe(t) {
  return { need:"צורך", want:"רצון", savings:"חיסכון", investment:"השקעה", debt:"חוב", transfer:"העברה", other:"אחר" }[t] || t;
}

function updateCat(id, field, val) {
  const cat = state.categories.find(c => c.id === id);
  if (cat) { cat[field] = val; saveState(); renderCategories(); }
}

function deleteCat(id) {
  state.categories = state.categories.filter(c => c.id !== id);
  saveState(); renderCategories();
}

function addCategory() {
  const name = document.getElementById("new-cat-name").value.trim();
  const amount = parseFloat(document.getElementById("new-cat-amount").value) || 0;
  const type = document.getElementById("new-cat-type").value;
  if (!name) return;
  state.categories.push({ id: Date.now(), name, amount, type, source: "Manual", month: "נוכחי" });
  document.getElementById("new-cat-name").value = "";
  document.getElementById("new-cat-amount").value = "";
  saveState(); renderCategories();
}

function resetCategories() {
  state.categories = JSON.parse(JSON.stringify(DEFAULTS.categories));
  saveState(); renderCategories();
}

/* ─── Transactions ─── */
let txFilter = { month: "", category: "", search: "", sortBy: "date", sortDir: -1 };

function renderTransactions() {
  let txs = [...state.transactions];

  if (txFilter.month)    txs = txs.filter(t => t.date.startsWith(txFilter.month));
  if (txFilter.category) txs = txs.filter(t => t.category === txFilter.category);
  if (txFilter.search)   txs = txs.filter(t => t.description.includes(txFilter.search));

  txs.sort((a, b) => {
    if (txFilter.sortBy === "date")   return txFilter.sortDir * (a.date > b.date ? 1 : -1);
    if (txFilter.sortBy === "amount") return txFilter.sortDir * (a.amount - b.amount);
    return 0;
  });

  const tbody = document.getElementById("tx-tbody");
  tbody.innerHTML = txs.map(tx => `
    <tr>
      <td class="date-cell">${tx.date}</td>
      <td>${tx.description}</td>
      <td><span class="currency ${tx.amount < 0 ? 'negative' : 'positive'}">${fmtSigned(tx.amount)}</span></td>
      <td>${tx.source}</td>
      <td>${tx.category}</td>
      <td>${typeLabelTx(tx.type)}</td>
      <td>${tx.notes || ""}</td>
      <td>
        <button class="btn-icon btn-edit" onclick="openEditTx(${tx.id})">✎</button>
        <button class="btn-icon btn-del" onclick="deleteTx(${tx.id})">✕</button>
      </td>
    </tr>`).join("");

  // populate category filter dropdown
  const cats = [...new Set(state.transactions.map(t => t.category))];
  const sel = document.getElementById("tx-filter-cat");
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = `<option value="">כל הקטגוריות</option>` + cats.map(c => `<option value="${c}" ${c===cur?"selected":""}>${c}</option>`).join("");
  }
}

function typeLabelTx(t) {
  return { expense:"הוצאה", income:"הכנסה", transfer:"העברה", debt:"חוב" }[t] || t;
}

function deleteTx(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveState(); renderTransactions();
}

function openEditTx(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  document.getElementById("tx-edit-id").value          = tx.id;
  document.getElementById("tx-edit-date").value        = tx.date;
  document.getElementById("tx-edit-desc").value        = tx.description;
  document.getElementById("tx-edit-amount").value      = tx.amount;
  document.getElementById("tx-edit-source").value      = tx.source;
  document.getElementById("tx-edit-category").value    = tx.category;
  document.getElementById("tx-edit-type").value        = tx.type;
  document.getElementById("tx-edit-notes").value       = tx.notes || "";
  document.getElementById("tx-modal").classList.remove("hidden");
}

function saveTxEdit() {
  const id = parseInt(document.getElementById("tx-edit-id").value);
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  tx.date        = document.getElementById("tx-edit-date").value;
  tx.description = document.getElementById("tx-edit-desc").value;
  tx.amount      = parseFloat(document.getElementById("tx-edit-amount").value) || 0;
  tx.source      = document.getElementById("tx-edit-source").value;
  tx.category    = document.getElementById("tx-edit-category").value;
  tx.type        = document.getElementById("tx-edit-type").value;
  tx.notes       = document.getElementById("tx-edit-notes").value;
  saveState();
  closeTxModal();
  renderTransactions();
}

function addNewTx() {
  state.transactions.unshift({
    id: Date.now(),
    date: document.getElementById("tx-new-date").value || new Date().toISOString().slice(0,10),
    description: document.getElementById("tx-new-desc").value || "עסקה חדשה",
    amount: parseFloat(document.getElementById("tx-new-amount").value) || 0,
    source: document.getElementById("tx-new-source").value || "Manual",
    category: document.getElementById("tx-new-category").value || "אחר",
    type: document.getElementById("tx-new-type").value || "expense",
    notes: ""
  });
  saveState(); renderTransactions();
}

function closeTxModal() {
  document.getElementById("tx-modal").classList.add("hidden");
}

/* ─── Charts ─── */
let chartInstances = {};

function renderCharts() {
  const inp = state.inputs;
  const c = calc();

  destroyChart("chart-donut-cat");
  destroyChart("chart-bar-cat");
  destroyChart("chart-trend");
  destroyChart("chart-nwsd");
  destroyChart("chart-save-invest");
  destroyChart("chart-ef-milestones");

  const catNames  = state.categories.map(c => c.name);
  const catAmts   = state.categories.map(c => c.amount);
  const palette   = ["#3b82f6","#8b5cf6","#06b6d4","#22d369","#f59e0b","#f43f5e","#c026d3","#64748b"];

  // Donut — by category
  chartInstances["chart-donut-cat"] = new Chart(document.getElementById("chart-donut-cat"), {
    type: "doughnut",
    data: { labels: catNames, datasets: [{ data: catAmts, backgroundColor: palette }] },
    options: { plugins: { legend: { labels: { color: "#f0f0fa", font: { size: 11 } } } }, cutout: "65%" }
  });

  // Bar — by category
  chartInstances["chart-bar-cat"] = new Chart(document.getElementById("chart-bar-cat"), {
    type: "bar",
    data: {
      labels: catNames,
      datasets: [{ label: "סכום ₪", data: catAmts, backgroundColor: palette }]
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#6b7280" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: { ticks: { color: "#f0f0fa" }, grid: { color: "rgba(255,255,255,0.05)" } }
      }
    }
  });

  // Line — monthly trend
  const trend = state.monthlyTrend || DEFAULTS.monthlyTrend;
  chartInstances["chart-trend"] = new Chart(document.getElementById("chart-trend"), {
    type: "bar",
    data: {
      labels: trend.map(t => t.month),
      datasets: [{
        label: "חיוב כרטיס ₪",
        data: trend.map(t => t.amount),
        backgroundColor: "rgba(59,130,246,0.50)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        type: "bar"
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "#f0f0fa" } } },
      scales: {
        x: { ticks: { color: "#6b7280" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: { ticks: { color: "#6b7280" }, grid: { color: "rgba(255,255,255,0.05)" } }
      }
    }
  });

  // Donut — needs/wants/savings/other
  const groups = { "צורך": 0, "רצון": 0, "חיסכון/השקעה": 0, "העברה": 0, "אחר": 0 };
  state.categories.forEach(cat => {
    if (cat.type === "need")  groups["צורך"] += cat.amount;
    else if (cat.type === "want") groups["רצון"] += cat.amount;
    else if (cat.type === "savings" || cat.type === "investment") groups["חיסכון/השקעה"] += cat.amount;
    else if (cat.type === "transfer") groups["העברה"] += cat.amount;
    else groups["אחר"] += cat.amount;
  });
  chartInstances["chart-nwsd"] = new Chart(document.getElementById("chart-nwsd"), {
    type: "doughnut",
    data: {
      labels: Object.keys(groups),
      datasets: [{ data: Object.values(groups), backgroundColor: ["#22d369","#3b82f6","#8b5cf6","#f59e0b","#475569"] }]
    },
    options: { plugins: { legend: { labels: { color: "#f0f0fa" } } }, cutout: "65%" }
  });

  // Emergency fund progress bar (HTML, not chart)
  const efBar = document.getElementById("ef-chart-bar");
  if (efBar) {
    const pctVal = Math.min((inp.availableToWithdraw / c.emergencyTarget) * 100, 100).toFixed(1);
    efBar.style.width = pctVal + "%";
    document.getElementById("ef-chart-label").textContent =
      `${fmt(inp.availableToWithdraw)} מתוך ${fmt(c.emergencyTarget)} (${pctVal}%)`;
  }

  // Save vs Invest donut
  const siCanvas = document.getElementById("chart-save-invest");
  if (siCanvas) {
    const hasSurplus = c.cashSav > 0 || c.etf > 0;
    chartInstances["chart-save-invest"] = new Chart(siCanvas, {
      type: "doughnut",
      data: {
        labels: ["חיסכון מזומן", "השקעת ETF"],
        datasets: [{ data: hasSurplus ? [c.cashSav || 0, c.etf || 0] : [1, 0], backgroundColor: ["#3b82f6", "#22d369"] }]
      },
      options: { plugins: { legend: { labels: { color: "#f0f0fa", font: { size: 11 } } } }, cutout: "65%" }
    });
  }

  // EF milestones horizontal bar
  const efMilCanvas = document.getElementById("chart-ef-milestones");
  if (efMilCanvas) {
    const liq = inp.availableToWithdraw;
    chartInstances["chart-ef-milestones"] = new Chart(efMilCanvas, {
      type: "bar",
      data: {
        labels: ["מזומן זמין", "יעד 3M", "יעד 6M", "יעד 12M"],
        datasets: [{
          data: [liq, c.ef3, c.ef6, c.ef12],
          backgroundColor: [
            liq >= c.ef6  ? "rgba(34,211,105,0.65)" : "rgba(59,130,246,0.65)",
            liq >= c.ef3  ? "rgba(34,211,105,0.45)" : "rgba(251,146,60,0.45)",
            liq >= c.ef6  ? "rgba(34,211,105,0.45)" : "rgba(251,146,60,0.45)",
            liq >= c.ef12 ? "rgba(34,211,105,0.45)" : "rgba(251,146,60,0.45)"
          ]
        }]
      },
      options: {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#6b7280", callback: v => "₪" + Math.round(v / 1000) + "K" }, grid: { color: "rgba(255,255,255,0.05)" } },
          y: { ticks: { color: "#f0f0fa" }, grid: { color: "rgba(255,255,255,0.05)" } }
        }
      }
    });
  }
}

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

/* ─── ETF Screen ─── */
function renderETF() {
  const c   = calc();
  const inp = state.inputs;

  const dcaInput = document.getElementById("inp-dca-monthly");
  if (dcaInput) dcaInput.value = state.inputs.dcaMonthly || 0;

  // Existing fields
  document.getElementById("etf-label").textContent         = c.label;
  document.getElementById("etf-label").className           = "etf-label-big " + recLabelClass(c.label);
  document.getElementById("etf-explanation").textContent   = c.explanation;
  document.getElementById("etf-etf-amt").textContent       = fmt(c.etf);
  document.getElementById("etf-cash-amt").textContent      = fmt(c.cashSav);
  document.getElementById("etf-split").textContent         = c.split;
  document.getElementById("etf-surplus").textContent       = fmtSigned(c.monthlySurplus);
  document.getElementById("etf-surplus").className         = "val currency " + (c.monthlySurplus >= 0 ? "positive" : "negative");
  document.getElementById("etf-ef-gap").textContent        = c.liquidGap > 0 ? fmt(c.liquidGap) + " חסר" : "✓ מכוסה";
  document.getElementById("etf-ef-gap").className          = "number " + (c.liquidGap > 0 ? "negative" : "positive");
  document.getElementById("etf-cc-pressure").textContent   = pct(inp.creditCurrentDue, inp.monthlyIncome);
  document.getElementById("etf-expense-ratio").textContent = pct(inp.monthlyExpenses, inp.monthlyIncome);

  // ── החלטת החודש ──
  const decisionVal    = document.getElementById("etf-decision-value");
  const decisionReason = document.getElementById("etf-decision-reason");
  const decisionAction = document.getElementById("etf-decision-action");

  if (decisionVal && decisionReason && decisionAction) {
    if (c.monthlySurplus <= 0) {
      const over = fmt(Math.abs(c.monthlySurplus));
      decisionVal.textContent    = "לא להשקיע החודש";
      decisionVal.className      = "decision-value negative";
      decisionReason.textContent = `ההוצאות גבוהות מההכנסה ב-${over}`;
      decisionAction.textContent = "קודם לייצב תזרים ולצמצם הוצאות לפחות עד איזון";
    } else if (!c.efOk) {
      decisionVal.textContent    = "עדיפות: קרן חירום";
      decisionVal.className      = "decision-value warn";
      decisionReason.textContent = `קרן החירום חסרה ${fmt(c.liquidGap)}. יש לצבור מזומן לפני הגדלת חשיפת ETF.`;
      decisionAction.textContent = "להעביר את העודף החודשי לחיסכון נזיל עד השלמת קרן החירום";
    } else {
      const horizonLabel = { "<1": "פחות משנה", "1-5": "1–5 שנים", "5+": "5+ שנים" }[inp.investmentHorizon] || inp.investmentHorizon;
      const riskLabel    = { "low": "נמוכה", "medium": "בינונית", "high": "גבוהה" }[inp.riskTolerance] || inp.riskTolerance;
      decisionVal.textContent    = "ניתן לשקול השקעת ETF";
      decisionVal.className      = "decision-value positive";
      decisionReason.textContent = `קרן החירום מכוסה ויש עודף חודשי של ${fmt(c.monthlySurplus)}.`;
      decisionAction.textContent = `סיבולת סיכון ${riskLabel} · אופק ${horizonLabel} → מוצע ${fmt(c.etf)} ל-ETF ו-${fmt(c.cashSav)} לחיסכון`;
    }
  }

  // ── כמה צריך לצמצם ──
  const reductionEl = document.getElementById("etf-reduction-text");
  if (reductionEl) {
    if (c.monthlySurplus < 0) {
      reductionEl.innerHTML = `צריך לצמצם לפחות <span class="currency negative">${fmt(Math.abs(c.monthlySurplus))}</span> בחודש כדי להגיע לתזרים מאוזן.`;
    } else {
      reductionEl.textContent = "אין צורך בצמצום כדי להתאזן — התזרים החודשי חיובי.";
    }
  }

  // ── סימולציית קיצוץ ──
  const scenarioSection = document.getElementById("etf-scenario-section");
  if (scenarioSection) {
    if (c.monthlySurplus >= 0) {
      scenarioSection.classList.add("hidden");
    } else {
      scenarioSection.classList.remove("hidden");
      const cuts = [500, 1000, 1500];
      const rows = cuts.map(cut => {
        const result = c.monthlySurplus + cut;
        let badge;
        if (result < 0) {
          badge = `<span class="scenario-result neg">עדיין גירעון של <span class="currency">${fmt(Math.abs(result))}</span></span>`;
        } else if (result === 0) {
          badge = `<span class="scenario-result pos">מאוזן</span>`;
        } else {
          badge = `<span class="scenario-result pos">עודף של <span class="currency">${fmt(result)}</span></span>`;
        }
        return `<div class="scenario-row">
          <span class="scenario-cut">קיצוץ <span class="currency">${fmt(cut)}</span></span>
          ${badge}
        </div>`;
      });
      document.getElementById("scenario-rows").innerHTML = rows.join("");
    }
  }
  renderDCA(c);
}

/* ─── DCA Calculator ─── */
function renderDCA(c) {
  const monthly = (state.inputs.dcaMonthly > 0) ? state.inputs.dcaMonthly : c.etf;

  const displayEl = document.getElementById("dca-monthly-display");
  const totalEl   = document.getElementById("dca-total-1yr");
  const rowsEl    = document.getElementById("dca-breakdown-rows");

  if (displayEl) displayEl.textContent = fmt(monthly);
  if (totalEl)   totalEl.textContent   = fmt(monthly * 12);

  if (rowsEl) {
    if (monthly <= 0) {
      rowsEl.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:.6rem;color:var(--text-sub)">אין הקצאת ETF — הזן סכום ידני לסימולציה</td></tr>`;
    } else {
      rowsEl.innerHTML = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        return `<tr><td>${m}</td><td class="currency">${fmt(monthly)}</td><td class="currency">${fmt(monthly * m)}</td></tr>`;
      }).join("");
    }
  }
}

/* ─── Import / Export ─── */
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "finance_data_" + new Date().toISOString().slice(0,10) + ".json";
  a.click();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      state = JSON.parse(ev.target.result);
      saveState();
      showScreen(activeScreen);
      alert("נתונים יובאו בהצלחה.");
    } catch { alert("שגיאה בקריאת הקובץ."); }
  };
  reader.readAsText(file);
}

function exportCSV() {
  const header = "תאריך,תיאור,סכום,מקור,קטגוריה,סוג,הערות\n";
  const rows = state.transactions.map(t =>
    [t.date, `"${t.description}"`, t.amount, t.source, t.category, t.type, `"${t.notes||""}"`].join(",")
  ).join("\n");
  const blob = new Blob(["﻿" + header + rows], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "transactions.csv";
  a.click();
}

function resetAll() {
  if (!confirm("לאפס את כל הנתונים לברירות המחדל מהקובץ?")) return;
  state = JSON.parse(JSON.stringify(DEFAULTS));
  localStorage.removeItem("financeAppState");
  saveState();
  showScreen("dashboard");
}

/* ─── Boot ─── */
window.addEventListener("DOMContentLoaded", () => {
  bindInputs();

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.screen));
  });

  document.getElementById("btn-export-json").addEventListener("click", exportJSON);
  document.getElementById("btn-import-json").addEventListener("change", importJSON);
  document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
  document.getElementById("btn-reset-all").addEventListener("click", resetAll);
  document.getElementById("btn-reset-inputs").addEventListener("click", resetAll);

  document.getElementById("btn-add-cat").addEventListener("click", addCategory);
  document.getElementById("btn-reset-cats").addEventListener("click", resetCategories);

  document.getElementById("cat-search").addEventListener("input", e => { catFilter = e.target.value; renderCategories(); });

  document.getElementById("tx-search").addEventListener("input", e => { txFilter.search = e.target.value; renderTransactions(); });
  document.getElementById("tx-filter-month").addEventListener("input", e => { txFilter.month = e.target.value; renderTransactions(); });
  document.getElementById("tx-filter-cat").addEventListener("change", e => { txFilter.category = e.target.value; renderTransactions(); });
  document.getElementById("tx-sort-date").addEventListener("click", () => { txFilter.sortBy = "date"; txFilter.sortDir *= -1; renderTransactions(); });
  document.getElementById("tx-sort-amount").addEventListener("click", () => { txFilter.sortBy = "amount"; txFilter.sortDir *= -1; renderTransactions(); });
  document.getElementById("btn-add-tx").addEventListener("click", addNewTx);
  document.getElementById("btn-save-tx-edit").addEventListener("click", saveTxEdit);
  document.getElementById("btn-cancel-tx-edit").addEventListener("click", closeTxModal);

  document.getElementById("btn-refresh-etf").addEventListener("click", refreshEtfData);
  document.getElementById("btn-add-etf-symbol").addEventListener("click", addEtfSymbol);
  document.getElementById("etfc-add-symbol").addEventListener("keydown", e => { if (e.key === "Enter") addEtfSymbol(); });

  showScreen("dashboard");
});
