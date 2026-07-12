/* ===========================================================================
   FINCORTEX — UI controller (v2)
   ======================================================================== */
const P = window.FINCORTEX;
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

/* ----------------------------------------------------------- icon system */
const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  clearance: '<rect x="8" y="3" width="8" height="4" rx="1.2"/><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="m9 13.5 2 2 4-4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  fabric: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 13.4 7.2 4.2M15.6 6.4 8.4 10.6"/>',
  file: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M9 13h6M9 17h6"/>',
  rules: '<path d="m3 5 1.4 1.4L7 3.6"/><path d="m3 12 1.4 1.4L7 10.6"/><path d="m3 19 1.4 1.4L7 17.6"/><path d="M10 5h11M10 12h11M10 19h11"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.2 2"/>',
  play: '<path d="M7 5.2v13.6l11-6.8z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.4 12 2.6 2.6L15.8 9"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4.5M12 17.5h.01"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  chart: '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="0.6"/><rect x="12" y="7" width="3" height="10" rx="0.6"/><rect x="17" y="13" width="3" height="4" rx="0.6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  scan: '<path d="M4 7V5.5A1.5 1.5 0 0 1 5.5 4H7M17 4h1.5A1.5 1.5 0 0 1 20 5.5V7M20 17v1.5a1.5 1.5 0 0 1-1.5 1.5H17M7 20H5.5A1.5 1.5 0 0 1 4 18.5V17"/><path d="M4 12h16"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 2.5v2M14 2.5v2M10 19.5v2M14 19.5v2M2.5 10h2M2.5 14h2M19.5 10h2M19.5 14h2"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 19.5h16"/>',
  chevronR: '<path d="m9 6 6 6-6 6"/>',
  coverage: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="m13.5 17 2 2 4-4"/>',
  badge: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M13 10h5M13 14h5M5.2 16c.7-1.3 1.9-2 3.3-2s2.6.7 3.3 2"/>',
};
function icon(name, cls) {
  const p = ICONS[name]; if (!p) return "";
  return `<svg class="ico ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}
const NAV_ICON = { overview: "dashboard", clearance: "clearance", surveillance: "eye", coverage: "coverage", regwatch: "file", agents: "fabric", disclosure: "badge", rules: "rules", audit: "clock" };
const AGENT_ICON = { clearance: "clearance", surveillance: "eye", regwatch: "file", reporting: "chart" };

const AUDIT = P.SEED_AUDIT.map((e) => ({ ...e }));

/* ---- tamper-evident ledger (real SHA-256 hash chain) ------------------- */
const GENESIS = "0".repeat(64);
let ledgerHead = GENESIS;
let ledgerTampered = false;
const PRISTINE = P.SEED_AUDIT.map((e) => ({ ...e }));
const payloadOf = (e) => [e.ts, e.actor, e.client, e.scrip, e.decision, e.rule, e.note].join("|");

// commit: walk oldest→newest (AUDIT is newest-first) sealing each entry
function sealLedger() {
  let prev = GENESIS;
  for (let i = AUDIT.length - 1; i >= 0; i--) {
    const e = AUDIT[i];
    e._hash = P.hash256(prev + payloadOf(e));
    e._prev = prev;
    prev = e._hash;
  }
  ledgerHead = prev;
}
// verify: recompute the whole chain from genesis; a single edit cascades
function verifyLedger() {
  let prev = GENESIS;
  const valid = new Map();
  for (let i = AUDIT.length - 1; i >= 0; i--) {
    const e = AUDIT[i];
    const rec = P.hash256(prev + payloadOf(e));
    valid.set(e, rec === e._hash);
    prev = rec;
  }
  return { valid, recomputedHead: prev, intact: prev === ledgerHead };
}
function tamperLedger() {
  // silently rewrite a sealed record — as a bad actor would — without re-sealing
  const target = AUDIT.find((e) => e.decision === "block") || AUDIT[Math.floor(AUDIT.length / 2)];
  if (target) { target.decision = "clear"; target.rule = "—"; target.note = "record altered post-hoc"; }
  ledgerTampered = true;
}
function resetLedger() {
  AUDIT.length = 0;
  PRISTINE.forEach((e) => AUDIT.push({ ...e }));
  ledgerTampered = false;
  sealLedger();
}
sealLedger();

const VIEWS = {
  overview:     { title: "Overview",             sub: "Live compliance posture across the desk" },
  clearance:    { title: "Pre-Trade Clearance",  sub: "Agentic screening before any order or advice is routed" },
  surveillance: { title: "Surveillance",         sub: "Pattern alerts flagged by the monitoring agent" },
  coverage:     { title: "Obligation Coverage",  sub: "Every SEBI obligation mapped to the control that meets it — and the gaps" },
  regwatch:     { title: "RegWatch",             sub: "The agent that turns a SEBI circular into an enforceable rule" },
  agents:       { title: "Agent Fabric",         sub: "The four agents that make up FinCortex" },
  disclosure:   { title: "AI Disclosure",        sub: "FinCortex's own SEBI AI/ML disclosure — the compliance agent that is itself compliant" },
  rules:        { title: "Rulebook",             sub: "The SEBI rules the agent enforces — toggle to simulate policy" },
  audit:        { title: "Audit Log",            sub: "Immutable, regulator-ready decision trail" },
};

let current = "overview";

/* ----------------------------------------------------------------- nav --- */
$("#nav").addEventListener("click", (e) => {
  const b = e.target.closest(".nav-item"); if (!b) return;
  go(b.dataset.view);
});
function go(view) {
  current = view;
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("is-active", n.dataset.view === view));
  $("#page-title").textContent = VIEWS[view].title;
  $("#page-sub").textContent = VIEWS[view].sub;
  render();
}
function render() {
  const host = $("#view-host");
  host.innerHTML = "";
  const view = el("div", "view");
  view.appendChild(RENDER[current]());
  host.appendChild(view);
}

/* -------------------------------------------------------------- overview - */
function renderOverview() {
  const wrap = el("div", "stack");

  // hero impact strip
  const hero = el("div", "card hero");
  hero.innerHTML = `
    <div class="hero-main">
      <div class="hero-eyebrow">Non-compliant flow stopped at source · today</div>
      <div class="hero-figure">${P.CR(48_20_00_000)}</div>
      <div class="hero-note">37 orders blocked before they reached the exchange · 5 surveillance flags open · 0 breaches reached settlement</div>
    </div>
    <div class="hero-spark" id="hero-spark"></div>`;
  wrap.appendChild(hero);
  queueMicrotask(() => drawSpark($("#hero-spark")));

  // outcome KPIs — each ties to a headline capability
  const kpis = el("div", "kpis");
  kpis.append(
    kpi("Breaches prevented", "37", "today · 2,481 screened", "up"),
    kpi("Time to comply", "4 min", "was ~23 days manual", "up"),
    kpi("Obligations covered", "79%", "26 covered · 5 gaps", ""),
    kpi("Records sealed", "SHA-256", "tamper-evident ledger", ""),
  );
  wrap.appendChild(kpis);

  // cost-of-problem band
  const cost = el("div", "card card-pad cost-band");
  cost.appendChild(el("div", "section-label", "What getting compliance wrong costs — real SEBI actions"));
  const costGrid = el("div", "cost-grid");
  P.COST_OF_PROBLEM.forEach((c) => {
    const t = el("div", "cost-tile");
    t.append(el("div", "cost-figure", c.figure), el("div", "cost-label", c.label), el("div", "cost-detail", c.detail));
    costGrid.appendChild(t);
  });
  cost.appendChild(costGrid);
  cost.appendChild(el("div", "hint", "Sources: SEBI enforcement orders (IEX ₹173 Cr, Oct 2025; Avadhut Sathe ₹546 Cr, Dec 2025; Infosys PIT order, Jan 2025) and FY25 F&O loss data. FinCortex screens for exactly these failure modes before they happen."));
  wrap.appendChild(cost);

  // enforcement cases FinCortex would have stopped
  const caseCard = el("div", "card card-pad");
  caseCard.appendChild(el("div", "section-label", "Real cases FinCortex would have stopped — click to see the control fire"));
  const caseGrid = el("div", "case-grid");
  P.ENFORCEMENT_CASES.forEach((c) => {
    const card = el("div", "case-card");
    card.append(
      (() => { const h = el("div", "case-top"); h.append(el("div", "case-title", c.title), el("span", "case-when", c.when)); return h; })(),
      el("div", "case-violation", c.violation),
      (() => { const f = el("div", "case-foot"); f.innerHTML = `${icon("checkCircle", "ico-sm")}<div><div class="case-control">${c.control}</div><div class="case-cite">§ ${c.cite}</div></div>`; return f; })(),
    );
    card.onclick = () => {
      if (c.jump.preset) { Object.assign(form, PRESETS[c.jump.preset].v); }
      go(c.jump.view);
      if (c.jump.view === "clearance") { const r = $(".result"); if (r) runClearanceFlow(r); }
    };
    caseGrid.appendChild(card);
  });
  caseCard.appendChild(caseGrid);
  wrap.appendChild(caseCard);

  const grid = el("div", "grid-2");

  const feedCard = el("div", "card card-pad");
  feedCard.appendChild(el("div", "section-label", "Live clearance feed"));
  const feed = el("div", "feed");
  [
    ["clear", "Meridian Capital LLP", "RELIANCE · buy 4,000", "cleared", "now"],
    ["block", "R. Sharma", "INFY · sell 2,000", "insider window · PAN freeze", "12s"],
    ["clear", "Aster MFO", "NIFTY-FUT · buy 50 lots", "cleared", "48s"],
    ["review", "Aster MFO", "NIFTY-FUT · 83% MWPL", "desk sign-off", "2m"],
    ["block", "A. Iyer", "ORVX · buy 900", "CKYC expired", "4m"],
    ["clear", "Meridian Capital LLP", "TCS · buy 1,200", "cleared", "6m"],
  ].forEach(([st, who, what, why, t]) => {
    const r = el("div", "feed-row");
    const m = el("div", "feed-main");
    m.append(el("div", "feed-title", who), el("div", "feed-meta", `${what} · ${why}`));
    r.append(el("span", `feed-dot dot-${st}`), m, el("span", "feed-time", t));
    feed.appendChild(r);
  });
  feedCard.appendChild(feed);
  grid.appendChild(feedCard);

  const chart = el("div", "card card-pad");
  chart.appendChild(el("div", "section-label", "Blocks by rule · 7 days"));
  const bars = el("div", "bars");
  const max = Math.max(...P.BLOCKS_BY_RULE.map((b) => b.n));
  P.BLOCKS_BY_RULE.forEach((b) => {
    const row = el("div", "bar-row");
    const track = el("div", "bar-track");
    const fill = el("div", "bar-fill"); fill.style.width = `${(b.n / max) * 100}%`;
    track.appendChild(fill);
    row.append(el("div", "bar-label", b.label), track, el("div", "bar-n", b.n));
    bars.appendChild(row);
  });
  chart.appendChild(bars);
  grid.appendChild(chart);

  wrap.appendChild(grid);
  return wrap;
}
function kpi(label, value, delta, dir) {
  const c = el("div", "card kpi");
  c.append(el("div", "kpi-label", label), el("div", "kpi-value", value), el("div", `kpi-delta ${dir}`, delta));
  return c;
}
function drawSpark(host) {
  if (!host) return;
  const pts = [8, 9, 7, 12, 10, 14, 11, 16, 13, 18, 21, 19, 24, 22, 27, 31, 28, 34, 37];
  const w = 220, h = 66, max = Math.max(...pts), min = Math.min(...pts);
  const x = (i) => (i / (pts.length - 1)) * w;
  const y = (v) => h - ((v - min) / (max - min)) * (h - 8) - 4;
  const d = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  host.innerHTML =
    `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--mint)" stop-opacity=".28"/>
        <stop offset="1" stop-color="var(--mint)" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#sg)"/>
      <path d="${d}" fill="none" stroke="var(--mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

/* ------------------------------------------------------------- clearance - */
const form = {
  client: "meridian", instrument: "RELIANCE", side: "buy", quantity: 4000,
  orderType: "manual", strategyId: "", channel: "execution",
  adviceText: "", disclosureAttached: true,
};
let lastRun = null; // {scenario, out}

const PRESETS = {
  clean:   { label: "Clean institutional buy", v: { client: "meridian", instrument: "RELIANCE", side: "buy", quantity: 4000, orderType: "manual", channel: "execution", strategyId: "", adviceText: "", disclosureAttached: true } },
  insider: { label: "Insider in blackout",     v: { client: "sharma", instrument: "INFY", side: "sell", quantity: 2000, orderType: "manual", channel: "execution", strategyId: "", adviceText: "", disclosureAttached: true } },
  messy:   { label: "Unsuitable advice + untagged algo", v: { client: "iyer", instrument: "NIFTYFUT", side: "buy", quantity: 3000, orderType: "algo", channel: "advice", strategyId: "", adviceText: "Guaranteed 30% returns this month, sure-shot call.", disclosureAttached: false } },
  limit:   { label: "Position-limit breach",   v: { client: "aster", instrument: "NIFTYFUT", side: "buy", quantity: 9000, orderType: "manual", channel: "execution", strategyId: "", adviceText: "", disclosureAttached: true } },
};

function renderClearance() {
  const wrap = el("div");
  const presets = el("div", "presets");
  Object.entries(PRESETS).forEach(([k, p]) => {
    const b = el("button", "btn-ghost", p.label);
    b.onclick = () => { Object.assign(form, p.v); render(); };
    presets.appendChild(b);
  });
  wrap.appendChild(presets);

  const grid = el("div", "clear-grid");

  const panel = el("div", "card card-pad");
  panel.appendChild(el("div", "section-label", "Order / advice under review"));
  panel.appendChild(selectField("Client", "client", Object.values(P.CLIENTS).map((c) => [c.id, c.name])));
  const c = P.CLIENTS[form.client];
  panel.appendChild(metaLine(`${c.type} · KYC ${c.kyc} · ${P.CR(c.aum)} AUM${c.insider ? " · designated person" : ""}`));

  panel.appendChild(selectField("Instrument", "instrument", Object.values(P.INSTRUMENTS).map((i) => [i.symbol, `${i.symbol} — ${i.name}`])));
  const i = P.INSTRUMENTS[form.instrument];
  panel.appendChild(metaLine(`${i.segment} · ${i.index} · risk ${i.riskGrade}${i.windowClosed ? " · window CLOSED" : ""}${i.embargo ? " · embargoed" : ""}`));

  const two = el("div", "row-2");
  two.append(segField("Side", "side", [["buy", "Buy"], ["sell", "Sell"]]), numField("Quantity", "quantity"));
  const f1 = el("div", "field"); f1.appendChild(two); panel.appendChild(f1);

  panel.appendChild(segField("Channel", "channel", [["execution", "Execution"], ["advice", "Advisory"]]));
  panel.appendChild(segField("Order type", "orderType", [["manual", "Manual"], ["algo", "Algo"]]));
  if (form.orderType === "algo") panel.appendChild(textField("Exchange Algo-ID (if empaneled)", "strategyId", "e.g. NSE-ALGO-114-MR"));
  if (form.channel === "advice") {
    panel.appendChild(textareaField("Advice text", "adviceText", "The recommendation shown to the client…"));
    panel.appendChild(checkField("Registration + risk disclosure attached", "disclosureAttached"));
  }
  const run = el("button", "btn-run", `${icon("scan")}<span>Run agentic clearance</span>`);
  run.onclick = () => runClearanceFlow(result);
  panel.appendChild(run);
  grid.appendChild(panel);

  const result = el("div", "card result");
  if (lastRun && lastRun.view === "clearance") { paintVerdict(result, lastRun.scenario, lastRun.enabled, false); }
  else result.innerHTML = `<div class="result-empty"><div><div class="big">No decision yet</div>
    Configure the order and run the agent — it screens all enabled rules and returns an explainable verdict.</div></div>`;
  grid.appendChild(result);

  wrap.appendChild(grid);
  return wrap;
}

/* field builders */
function bind(control, key, cast) { control.addEventListener("change", () => { form[key] = cast ? cast(control.value) : control.value; render(); }); }
function selectField(label, key, opts) {
  const f = el("div", "field"); f.appendChild(el("label", "field-label", label));
  const sel = el("select", "control");
  opts.forEach(([v, t]) => { const o = el("option", null, t); o.value = v; if (form[key] === v) o.selected = true; sel.appendChild(o); });
  bind(sel, key); f.appendChild(sel); return f;
}
function textField(label, key, ph) {
  const f = el("div", "field"); f.appendChild(el("label", "field-label", label));
  const inp = el("input", "control"); inp.value = form[key]; inp.placeholder = ph || ""; bind(inp, key); f.appendChild(inp); return f;
}
function textareaField(label, key, ph) {
  const f = el("div", "field"); f.appendChild(el("label", "field-label", label));
  const ta = el("textarea", "control"); ta.value = form[key]; ta.placeholder = ph || ""; bind(ta, key); f.appendChild(ta); return f;
}
function numField(label, key) {
  const f = el("div", "field"); f.appendChild(el("label", "field-label", label));
  const inp = el("input", "control"); inp.type = "number"; inp.value = form[key]; bind(inp, key, Number); f.appendChild(inp); return f;
}
function segField(label, key, opts) {
  const f = el("div", "field"); f.appendChild(el("label", "field-label", label));
  const seg = el("div", "seg");
  opts.forEach(([v, t]) => { const b = el("button", form[key] === v ? "on" : "", t); b.onclick = () => { form[key] = v; render(); }; seg.appendChild(b); });
  f.appendChild(seg); return f;
}
function checkField(label, key) {
  const row = el("div", `check-row ${form[key] ? "on" : ""}`);
  row.append(el("span", "check-box", form[key] ? icon("check") : ""), el("span", null, label));
  row.onclick = () => { form[key] = !form[key]; render(); };
  const f = el("div", "field"); f.appendChild(row); return f;
}
function metaLine(t) { const d = el("div", "hint", t); d.style.marginTop = "-8px"; d.style.marginBottom = "16px"; return d; }

function buildScenario() {
  return {
    client: P.CLIENTS[form.client], instrument: P.INSTRUMENTS[form.instrument],
    side: form.side, quantity: Number(form.quantity) || 0,
    orderType: form.orderType, strategyId: form.strategyId.trim(),
    channel: form.channel, adviceText: form.adviceText, disclosureAttached: form.disclosureAttached,
  };
}

function runClearanceFlow(result, thenCb) {
  const scenario = buildScenario();
  const enabled = P.RULEBOOK.filter((r) => r.enabled);
  result.innerHTML = "";
  const pipe = el("div", "pipeline"); result.appendChild(pipe);
  const steps = [
    "Resolving client identity & CKYC status",
    "Cross-checking insider trading window (PAN freeze)",
    "Assessing suitability against risk profile",
    "Scanning advice for ad-code violations",
    "Validating exchange Algo-ID & empanelment",
    "Projecting market-wide position limit",
    "Checking research embargo / information barrier",
  ];
  const rows = steps.map((s) => { const r = el("div", "pipe-step"); r.append(el("span", "pipe-spin"), el("span", null, s)); pipe.appendChild(r); return r; });
  let idx = 0;
  const tick = () => {
    if (idx > 0) { const prev = rows[idx - 1]; prev.classList.add("done"); prev.querySelector(".pipe-spin").outerHTML = `<span class="pipe-tick">${icon("check")}</span>`; }
    if (idx < rows.length) { rows[idx].classList.add("show"); idx++; setTimeout(tick, 170); }
    else setTimeout(() => { paintVerdict(result, scenario, enabled, true); if (thenCb) thenCb(); }, 240);
  };
  rows[0].classList.add("show"); setTimeout(tick, 240);
}

function paintVerdict(result, scenario, rulebook, writeAudit) {
  const out = P.runClearance(scenario, rulebook);
  lastRun = { scenario, enabled: rulebook, view: "clearance", out };
  result.innerHTML = "";
  const word = { clear: "CLEARED", review: "NEEDS REVIEW", block: "BLOCKED" }[out.decision];
  const sub = {
    clear: "All enabled checks passed — the order may be routed to the exchange.",
    review: "Passed hard rules but tripped a soft check — desk / CO sign-off required.",
    block: "One or more hard rules failed — the agent has stopped this order at source.",
  }[out.decision];

  const head = el("div", `verdict-head vh-${out.decision}`);
  const mid = el("div");
  mid.append(el("div", `verdict-word ${out.decision}`, word), el("div", "verdict-sub", sub),
    el("div", "verdict-notional", `${scenario.instrument.symbol} · ${scenario.side} ${scenario.quantity.toLocaleString("en-IN")} · ${P.INR(Math.round(out.notional))}`));
  const tal = el("div", "verdict-tally");
  tal.append(tally(out.passed, "passed"), tally(out.warned, "warn"), tally(out.blocked, "block"));
  const vIcon = out.decision === "clear" ? "checkCircle" : out.decision === "review" ? "alert" : "ban";
  head.append(el("div", `verdict-icon vi-${out.decision}`, icon(vIcon, "vico")), mid, tal);
  result.appendChild(head);

  const list = el("div", "verdicts");
  out.results.forEach((r, n) => {
    const badge = { pass: "vb-pass", warn: "vb-warn", block: "vb-block" }[r.status];
    const glyph = icon({ pass: "check", warn: "alert", block: "ban" }[r.status]);
    const row = el("div", "verdict"); row.style.animationDelay = `${n * 45}ms`;
    const body = el("div");
    body.append(el("div", "v-name", r.rule.name));
    if (r.headline) body.append(el("div", "v-headline", r.headline));
    if (r.detail) body.append(el("div", "v-detail", r.detail));
    if (r.evidence && r.evidence.length) { const ev = el("div", "v-evidence"); r.evidence.forEach((e) => ev.appendChild(el("span", "chip", e))); body.append(ev); }
    if (r.remedy) body.append(el("div", "v-remedy", `→ ${r.remedy}`));
    body.append(el("div", "v-cite", `${r.rule.citation}  ·  ${r.rule.effective}`));
    row.append(el("div", `v-badge ${badge}`, glyph), body, el("div", `v-status ${r.status}`, r.status));
    list.appendChild(row);
  });
  result.appendChild(list);

  const bar = el("div", "action-bar");
  bar.appendChild(el("div", "action-note",
    out.decision === "block" ? "Order rejected at source. Reason trail written to the audit log."
    : out.decision === "review" ? "Routed to the compliance officer queue with full evidence."
    : "Order released to the exchange gateway."));
  const rep = el("button", "btn-ghost", "Generate record"); rep.style.marginLeft = "auto";
  rep.onclick = () => showModal("Pre-Trade Clearance Record", P.buildDecisionReport(scenario, out));
  bar.appendChild(rep);
  result.appendChild(bar);

  if (writeAudit) {
    AUDIT.unshift({
      ts: nowTime(), actor: "agent", client: scenario.client.name, scrip: scenario.instrument.symbol,
      decision: out.decision === "clear" ? "clear" : out.decision === "block" ? "block" : "review",
      rule: out.results.find((r) => r.status === "block")?.rule.id || out.results.find((r) => r.status === "warn")?.rule.id || "—",
      note: `${out.passed} passed · ${out.warned} warn · ${out.blocked} blocked`,
    });
    sealLedger();
  }
}
function tally(n, kind) {
  const d = el("div", "tally"); const b = el("b"); b.textContent = n;
  b.style.color = n === 0 ? "var(--text-3)" : kind === "passed" ? "var(--mint)" : kind === "warn" ? "var(--amber)" : "var(--red)";
  d.append(b, el("span", null, kind === "passed" ? "passed" : kind === "warn" ? "review" : "blocked")); return d;
}

/* ---------------------------------------------------------- surveillance - */
function renderSurveillance() {
  const grid = el("div", "surv-grid");
  P.SURVEILLANCE.forEach((s) => {
    const c = el("div", "card surv");
    const top = el("div", "surv-top");
    const left = el("div");
    left.append(el("div", "surv-pattern", s.pattern), el("div", "surv-id", `${s.id} · ${s.scrip} · ${s.accounts} linked account(s) · ${P.CR(s.value)}`));
    top.append(left, el("span", `pill pill-${s.severity}`, s.severity.toUpperCase()));
    c.appendChild(top);
    c.appendChild(el("div", "surv-note", s.note));
    const foot = el("div", "surv-foot");
    const bar = el("div", "conf-bar"); const fill = el("div", "conf-fill"); fill.style.width = `${Math.round(s.confidence * 100)}%`; bar.appendChild(fill);
    foot.append(el("span", null, `conf ${Math.round(s.confidence * 100)}%`), bar,
      el("span", `pill pill-${s.status === "open" ? "block" : s.status === "escalated" ? "high" : "review"}`, s.status));
    c.appendChild(foot);
    const act = el("div", "surv-act");
    const str = el("button", "btn-ghost", "Draft STR");
    str.onclick = () => showModal(`STR — ${s.id}`, P.buildSTR(s));
    act.appendChild(str);
    c.appendChild(act);
    grid.appendChild(c);
  });
  return grid;
}

/* --------------------------------------------------------------- agents -- */
function renderAgents() {
  const wrap = el("div", "stack");
  const grid = el("div", "agents-grid");
  P.AGENTS.forEach((a) => {
    const c = el("div", "card agent-card");
    const head = el("div", "agent-head");
    head.append(el("div", "agent-glyph", icon(AGENT_ICON[a.id])),
      (() => { const d = el("div"); d.append(el("div", "agent-name", a.name), el("div", "agent-role", a.role)); return d; })(),
      el("span", `agent-state ${a.state}`, a.state));
    c.appendChild(head);
    c.appendChild(el("div", "agent-desc", a.desc));
    const foot = el("div", "agent-foot");
    foot.append(el("span", "agent-metric", a.metric), el("span", "agent-latency", a.latency));
    c.appendChild(foot);
    grid.appendChild(c);
  });
  wrap.appendChild(grid);
  const flow = el("div", "card card-pad");
  flow.appendChild(el("div", "section-label", "How an event flows through the fabric"));
  const arrow = `<span class="flow-arrow">${icon("chevronR")}</span>`;
  flow.appendChild(el("div", "flow",
    `<span class="flow-node">order / advice</span>${arrow}
     <span class="flow-node accent">${icon("clearance")} Clearance</span>${arrow}
     <span class="flow-node">clear · review · block</span>${arrow}
     <span class="flow-node">exchange / CO queue</span>`));
  flow.appendChild(el("div", "flow",
    `<span class="flow-node">trade tape</span>${arrow}
     <span class="flow-node accent">${icon("eye")} Surveillance</span>${arrow}
     <span class="flow-node">flags + STR draft</span>
     <span class="flow-gap"></span>
     <span class="flow-node">SEBI circular</span>${arrow}
     <span class="flow-node accent">${icon("file")} RegWatch</span>${arrow}
     <span class="flow-node">new rule → Clearance</span>`));
  flow.appendChild(el("div", "hint", "The Reporting Agent draws on every decision and flag to assemble the immutable, 8-year-retained record an inspection asks for."));
  wrap.appendChild(flow);
  return wrap;
}

/* -------------------------------------------------------------- regwatch - */
let llmStatus = null; // {configured, model}

async function fetchLlmStatus() {
  try { const r = await fetch("/api/llm/status"); llmStatus = await r.json(); }
  catch { llmStatus = { configured: false, model: null }; }
  const pill = $("#llm-pill");
  if (pill) {
    pill.className = `llm-pill ${llmStatus.configured ? "on" : "off"}`;
    pill.textContent = llmStatus.configured ? "● LLM connected" : "● offline — deterministic";
  }
}

function extractJSON(s) {
  if (!s) return null;
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a === -1 || b === -1) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}

async function llmCompile(text, model) {
  const res = await fetch("/api/llm", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, temperature: 0, max_tokens: 700,
      messages: [{ role: "system", content: P.REGWATCH_SYSTEM }, { role: "user", content: text }] }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.message || data.error);
  const content = data.choices?.[0]?.message?.content || "";
  const spec = extractJSON(content);
  if (!spec) throw new Error("Model did not return valid JSON. Try another model.");
  return { spec, model: data.model || model, usage: data.usage };
}

function specToHTML(spec) {
  const keys = ["rule", "title", "trigger", "condition", "action", "effective", "citation", "summary"];
  const lines = keys.filter((k) => spec[k] != null).map((k) =>
    `  "${k}":`.padEnd(14) + ` "${String(spec[k]).replace(/"/g, "'")}"`).join(",\n");
  return `{\n${lines}\n}`;
}

const SAMPLE_CIRCULAR =
`SEBI has mandated that Investment Advisers and Research Analysts shall maintain, on their onboarding, a documented and time-stamped risk profile for each client, and shall not recommend any product whose risk grade exceeds the client's assessed risk tolerance. Advisers must reassess the risk profile at least once every twelve months. Non-compliant recommendations shall not be disseminated.`;

function t2cEl(manualDays) {
  const box = el("div", "t2c");
  box.innerHTML =
    `<span class="t2c-manual"><b>${manualDays} days</b><span>manual legal interpretation → workflow update</span></span>
     ${icon("arrowRight", "ico-sm")}
     <span class="t2c-fin"><b>~4 min</b><span>RegWatch: circular → enforceable rule, live</span></span>`;
  return box;
}

function renderRegwatch() {
  const wrap = el("div", "stack");

  // regulation-as-code / time-to-compliance banner
  const days = Object.values(P.REG_MANUAL_DAYS);
  const avg = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
  const banner = el("div", "card card-pad t2c-banner");
  banner.innerHTML =
    `<div class="t2c-banner-l">
       <div class="section-label" style="margin-bottom:8px">Regulation-as-code</div>
       <div class="t2c-headline">Issuance → enforcement in <b>minutes</b>, not weeks</div>
       <div class="hint" style="margin-top:8px;max-width:60ch">Today a new SEBI circular takes intermediaries weeks of manual legal interpretation before it changes an operational control. RegWatch collapses that to minutes — the exact gap Problem 2 asks to close. (The FCA piloted machine-executable rulebooks; India can leapfrog.)</div>
     </div>
     <div class="t2c-banner-r">
       <div class="t2c-big"><b>${avg}d</b><span>median today</span></div>
       <div class="t2c-arrow">${icon("arrowRight")}</div>
       <div class="t2c-big mint"><b>4m</b><span>with RegWatch</span></div>
     </div>`;
  wrap.appendChild(banner);

  // live LLM compiler
  const live = el("div", "card card-pad reg-live-card");
  const head = el("div", "reg-live-head");
  head.append(el("div", "section-label", "Compile a live circular"),
    el("span", "llm-pill off", "● checking…"));
  head.querySelector(".llm-pill").id = "llm-pill";
  live.appendChild(head);
  live.appendChild(el("div", "hint reg-intro",
    "Paste any SEBI circular below. The RegWatch Agent calls a free OpenRouter LLM to extract the enforceable obligation and compile it into a rule spec. No key configured? It falls back to the deterministic compiler — the demo never breaks."));

  const ta = el("textarea", "control reg-ta"); ta.value = SAMPLE_CIRCULAR; ta.rows = 5;
  live.appendChild(ta);

  const ctrls = el("div", "reg-ctrls");
  const modelSel = el("select", "control reg-model");
  P.FREE_MODELS.forEach((m) => { const o = el("option", null, m.label); o.value = m.id; modelSel.appendChild(o); });
  const compileBtn = el("button", "btn-run reg-live-btn", `${icon("cpu")}<span>Compile with LLM</span>`);
  ctrls.append(modelSel, compileBtn);
  live.appendChild(ctrls);

  const outHost = el("div", "reg-live-out"); outHost.hidden = true; live.appendChild(outHost);

  compileBtn.onclick = async () => {
    const text = ta.value.trim(); if (!text) return;
    compileBtn.disabled = true; compileBtn.innerHTML = `<span>Compiling…</span>`;
    outHost.hidden = false; outHost.className = "reg-live-out show";
    outHost.innerHTML = `<div class="reg-thinking"><span class="pipe-spin"></span> RegWatch Agent reading the circular…</div>`;
    try {
      const { spec, model } = await llmCompile(text, modelSel.value);
      outHost.innerHTML = "";
      const okLine = el("div", "reg-live-ok", `${icon("checkCircle", "ico-sm")}<span>${spec.summary || "Rule compiled."} — live in the Clearance Agent.</span>`);
      outHost.append(el("div", "reg-out-label", `Compiled RuleSpec · via ${model}`), el("pre", "reg-spec", specToHTML(spec)), t2cEl(21), okLine);
    } catch (e) {
      // graceful fallback to deterministic compiler
      const fb = P.REG_SAMPLES[2].compiled;
      outHost.innerHTML = "";
      outHost.append(
        el("div", "reg-fallback", `${icon("alert", "ico-sm")}<span>${e.message} — falling back to the deterministic compiler.</span>`),
        el("div", "reg-out-label", "Compiled RuleSpec · deterministic"),
        el("pre", "reg-spec", specToHTML({ rule: fb.rule, trigger: fb.trigger, condition: fb.condition, action: fb.action, effective: fb.effective, citation: P.REG_SAMPLES[2].ref, summary: "Advisory suitability & disclosure obligation." })),
      );
    } finally { compileBtn.disabled = false; compileBtn.innerHTML = `${icon("cpu")}<span>Compile with LLM</span>`; }
  };
  wrap.appendChild(live);
  fetchLlmStatus();

  wrap.appendChild(el("div", "section-label reg-samples-label", "Pre-compiled from landmark circulars"));
  P.REG_SAMPLES.forEach((r) => {
    const c = el("div", "card reg-card");
    const head = el("div", "reg-head");
    head.append((() => { const d = el("div"); d.append(el("div", "reg-title", r.title), el("div", "reg-ref", r.ref)); return d; })());
    const btn = el("button", "btn-ghost reg-compile", `${icon("cpu", "ico-sm")}<span>Compile rule</span>`); head.appendChild(btn);
    c.appendChild(head);
    c.appendChild(el("div", "reg-text", `“${r.text}”`));
    const out = el("div", "reg-out"); out.hidden = true;
    out.appendChild(el("div", "reg-out-label", "Compiled RuleSpec"));
    const spec = r.compiled;
    out.appendChild(el("pre", "reg-spec",
`{
  "rule":      "${spec.rule}",
  "trigger":   "${spec.trigger}",
  "condition": "${spec.condition}",
  "action":    "${spec.action}",
  "effective": "${spec.effective}",
  "source":    "${r.ref}"
}`));
    out.appendChild(t2cEl(P.REG_MANUAL_DAYS[r.id] || 21));
    out.appendChild(el("div", "reg-live", `${icon("checkCircle", "ico-sm")}<span>Live in the Clearance Agent — enforced on every matching event.</span>`));
    c.appendChild(out);
    btn.onclick = () => {
      if (!out.hidden) return;
      btn.innerHTML = `<span>Compiling…</span>`; btn.disabled = true;
      setTimeout(() => { out.hidden = false; out.classList.add("show"); btn.innerHTML = `${icon("check", "ico-sm")}<span>Compiled</span>`; }, 750);
    };
    wrap.appendChild(c);
  });
  return wrap;
}

/* --------------------------------------------------------------- rules --- */
function renderRules() {
  const list = el("div", "rule-list");
  P.RULEBOOK.forEach((r) => {
    const card = el("div", "card rule");
    const body = el("div", "rule-body");
    const nameRow = el("div", "rule-name-row");
    nameRow.append(el("span", "rule-name", r.name), el("span", `sev sev-${r.severity}`, r.severity));
    body.append(nameRow, el("div", "rule-blurb", r.blurb), el("div", "rule-cite", `${r.citation}  ·  ${r.effective}`));
    const tog = el("div", `toggle ${r.enabled ? "on" : ""}`);
    tog.onclick = () => { r.enabled = !r.enabled; render(); };
    card.append(body, tog);
    list.appendChild(card);
  });
  const wrap = el("div", "stack");
  wrap.append(list, el("div", "hint", "Toggle a rule off to simulate a policy change — the Clearance Agent stops enforcing it instantly. Every enabled rule runs on every order and advice event."));
  return wrap;
}

/* --------------------------------------------------------------- audit --- */
function renderAudit() {
  const wrap = el("div", "stack");
  const v = verifyLedger();
  const brokenCount = [...v.valid.values()].filter((ok) => !ok).length;

  // ---- ledger integrity panel ----
  const panel = el("div", `card card-pad ledger-panel ${v.intact ? "" : "broken"}`);
  const head = el("div", "ledger-head");
  const status = el("div", `ledger-status ${v.intact ? "ok" : "bad"}`);
  status.innerHTML = v.intact
    ? `${icon("checkCircle")}<div><div class="ledger-status-t">Chain intact · ${AUDIT.length} records sealed</div><div class="ledger-status-s">Every decision is SHA-256 hash-chained. A regulator can verify this ledger without touching the firm's systems.</div></div>`
    : `${icon("ban")}<div><div class="ledger-status-t">Tampering detected — ${brokenCount} record(s) fail verification</div><div class="ledger-status-s">A sealed record was altered after the fact. The recomputed chain no longer matches the committed anchor — provable, instantly.</div></div>`;
  head.appendChild(status);
  panel.appendChild(head);

  const anchor = el("div", "ledger-anchor");
  anchor.innerHTML = `<div><span class="anchor-label">Committed anchor (ledger head)</span><code class="anchor-hash">${shortHash(ledgerHead)}</code></div>
    <div><span class="anchor-label">Recomputed now</span><code class="anchor-hash ${v.intact ? "" : "bad"}">${shortHash(v.recomputedHead)}</code></div>`;
  panel.appendChild(anchor);

  const btns = el("div", "ledger-btns");
  const verifyBtn = el("button", "btn-ghost", `${icon("scan", "ico-sm")}<span>Verify integrity</span>`);
  verifyBtn.onclick = () => { verifyBtn.innerHTML = `<span>Recomputing ${AUDIT.length} hashes…</span>`; setTimeout(render, 260); };
  btns.appendChild(verifyBtn);
  if (!ledgerTampered) {
    const t = el("button", "btn-ghost danger", `${icon("alert", "ico-sm")}<span>Simulate an insider altering a record</span>`);
    t.onclick = () => { tamperLedger(); render(); };
    btns.appendChild(t);
  } else {
    const r = el("button", "btn-ghost", "Reset ledger");
    r.onclick = () => { resetLedger(); render(); };
    btns.appendChild(r);
  }
  const exp = el("button", "btn-run ledger-export", `${icon("download", "ico-sm")}<span>Export evidence pack</span>`);
  exp.style.marginLeft = "auto";
  exp.onclick = () => showModal("Regulator Evidence Pack", {
    artefact: "Tamper-Evident Compliance Ledger", generatedAt: new Date().toISOString(),
    algorithm: "SHA-256 hash chain", genesis: GENESIS, ledgerHead, integrity: v.intact ? "verified" : "TAMPERED",
    records: AUDIT.map((e) => ({ ...e, verified: v.valid.get(e) })).reverse(),
    verify: "Recompute H(prevHash + payload) for each record from genesis; the final hash must equal ledgerHead.",
  });
  btns.appendChild(exp);
  panel.appendChild(btns);
  wrap.appendChild(panel);

  // ---- ledger table ----
  const card = el("div", "card card-pad");
  const table = el("table", "table");
  table.innerHTML = `<thead><tr><th>#</th><th>Time</th><th>Actor</th><th>Client</th><th>Scrip</th><th>Decision</th><th>Rule</th><th>Seal (SHA-256)</th></tr></thead>`;
  const tb = el("tbody");
  AUDIT.forEach((a, i) => {
    const ok = v.valid.get(a);
    const tr = el("tr", ok ? "" : "row-broken");
    tr.innerHTML = `<td class="mono muted">${AUDIT.length - i}</td>
      <td class="mono">${a.ts}</td>
      <td>${a.actor === "agent" ? `<span class="actor-agent">${icon("cpu", "ico-sm")} Agent</span>` : a.actor}</td>
      <td>${a.client}</td><td class="mono">${a.scrip}</td>
      <td><span class="pill pill-${a.decision}">${a.decision}</span></td>
      <td class="mono">${a.rule}</td>
      <td class="seal ${ok ? "ok" : "bad"}"><span class="seal-dot"></span><code>${shortHash(a._hash)}</code>${ok ? "" : ' <span class="seal-x">broken</span>'}</td>`;
    tb.appendChild(tr);
  });
  table.appendChild(tb); card.appendChild(table);
  wrap.append(card, el("div", "hint", "Each record is sealed as <code>SHA-256(previous hash + record)</code> — a chain. Alter any past record and its hash, and every hash after it, stops matching the committed anchor. Retained 8 years per the SDD rule. Try the tamper button above."));
  return wrap;
}
const shortHash = (h) => (h ? h.slice(0, 10) + "…" + h.slice(-6) : "—");

/* ------------------------------------------------------------ coverage --- */
let coverageFilter = "all";
function renderCoverage() {
  const obs = P.OBLIGATIONS;
  const covered = obs.filter((o) => o.status === "covered").length;
  const atrisk = obs.filter((o) => o.status === "atrisk").length;
  const gaps = obs.filter((o) => o.status === "gap").length;
  const pctCov = Math.round((covered / obs.length) * 100);

  const wrap = el("div", "stack");

  // header: ring + tallies
  const header = el("div", "card card-pad cov-header");
  const ring = coverageRing(pctCov);
  const tallies = el("div", "cov-tallies");
  tallies.append(
    el("div", "cov-eyebrow", "Mapped from the SEBI Master Circular for Stock Brokers & Investment Advisers"),
    (() => { const r = el("div", "cov-tally-row");
      r.append(covTally(covered, "covered", "Covered"), covTally(atrisk, "atrisk", "At-risk"), covTally(gaps, "gap", "Gaps"),
        covTally(obs.length, "total", "Tracked")); return r; })(),
    el("div", "hint", gaps + atrisk > 0
      ? `${gaps} obligations have no automated control and ${atrisk} are only partially covered — remediate these before they become inspection findings.`
      : "Every tracked obligation maps to an automated control."),
  );
  header.append(ring, tallies);
  wrap.appendChild(header);

  // filter chips
  const chips = el("div", "cov-chips");
  [["all", "All"], ["gap", "Gaps"], ["atrisk", "At-risk"], ["covered", "Covered"]].forEach(([v, t]) => {
    const b = el("button", `chip-btn ${coverageFilter === v ? "on" : ""}`, t);
    b.onclick = () => { coverageFilter = v; render(); };
    chips.appendChild(b);
  });
  wrap.appendChild(chips);

  // grouped list
  const shown = obs.filter((o) => coverageFilter === "all" || o.status === coverageFilter);
  const cats = [...new Set(shown.map((o) => o.cat))];
  cats.forEach((cat) => {
    const card = el("div", "card card-pad");
    card.appendChild(el("div", "section-label", cat));
    const list = el("div", "ob-list");
    shown.filter((o) => o.cat === cat).forEach((o) => {
      const row = el("div", `ob-row ${o.status}`);
      const left = el("div", "ob-left");
      left.append(el("span", `ob-dot ${o.status}`), (() => { const d = el("div");
        d.append(el("div", "ob-text", o.text), el("div", "ob-cite", o.cite)); return d; })());
      const right = el("div", "ob-right");
      const label = { covered: "Enforced by", atrisk: "Partial", gap: "No control" }[o.status];
      right.append(el("div", "ob-control-label", label), el("div", "ob-control", o.control),
        el("span", `ob-status ${o.status}`, o.status === "atrisk" ? "at-risk" : o.status));
      row.append(left, right);
      list.appendChild(row);
    });
    card.appendChild(list);
    wrap.appendChild(card);
  });
  return wrap;
}
function covTally(n, kind, label) {
  const d = el("div", `cov-tally ${kind}`);
  d.append(el("b", null, String(n)), el("span", null, label));
  return d;
}
function coverageRing(pct) {
  const size = 132, r = 54, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  const len = (pct / 100) * C;
  const box = el("div", "cov-ring");
  box.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="12"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--mint)" stroke-width="12" stroke-linecap="round"
      stroke-dasharray="${len} ${C - len}" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="cov-ring-pct">${pct}%</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="cov-ring-sub">covered</text></svg>`;
  return box;
}

/* ---------------------------------------------------------- disclosure --- */
function renderDisclosure() {
  const d = P.AI_DISCLOSURE;
  const wrap = el("div", "stack");
  wrap.appendChild(el("div", "card card-pad disc-intro",
    `<div class="disc-intro-icon">${icon("badge")}</div><div><div class="disc-intro-title">The compliance agent that is itself compliant.</div><div class="hint" style="margin-top:6px;max-width:74ch">SEBI now regulates the AI that intermediaries use — Regulation 16C (10-Feb-2025) plus the June-2025 responsible-AI consultation require every AI/ML system to be disclosed and governed. FinCortex is an AI system, so it files its own disclosure, ships a model card, and publishes its safeguards.</div></div>`));

  // disclosure fields
  const disc = el("div", "card card-pad");
  const dhead = el("div", "disc-head");
  dhead.append(el("div", "section-label", "SEBI AI/ML system disclosure · Reg 16C"));
  const gen = el("button", "btn-run disc-gen", `${icon("download", "ico-sm")}<span>Generate filing</span>`);
  gen.onclick = () => showModal("SEBI AI/ML System Disclosure", { artefact: "AI/ML System Disclosure (Reg 16C)", generatedAt: new Date().toISOString(), portal: "Exchange Enhanced Supervision Portal", ...d, modelCard: P.MODEL_CARD, safeguards: P.SAFEGUARDS });
  dhead.appendChild(gen);
  disc.appendChild(dhead);
  const fields = el("div", "disc-fields");
  const F = [
    ["System name", d.systemName], ["System type", d.type], ["Date of first use", d.firstUse],
    ["Initiates orders?", d.initiatesOrders], ["Routes orders?", d.routesOrders], ["Executes orders?", d.executesOrders],
    ["Discretionary / PMS use?", d.discretionaryOrPMS], ["Cybersecurity use?", d.cybersecurityUse],
    ["Marketing claims", d.marketingClaims], ["Human oversight", d.humanOversight],
    ["Abnormal-behaviour safeguards", d.abnormalBehaviourSafeguards], ["Implementation methodology", d.implementationMethodology],
    ["Filing cadence", d.filing],
  ];
  F.forEach(([k, v]) => { const f = el("div", "disc-field");
    f.append(el("div", "disc-k", k), el("div", "disc-v", v)); fields.appendChild(f); });
  disc.appendChild(fields);
  wrap.appendChild(disc);

  // model card
  const mc = el("div", "card card-pad");
  mc.appendChild(el("div", "section-label", "Model card"));
  const table = el("table", "table");
  table.innerHTML = `<thead><tr><th>Component</th><th>Role</th><th>Model</th><th>Human-in-loop</th><th>Fallback</th><th>Explainability</th></tr></thead>`;
  const tb = el("tbody");
  P.MODEL_CARD.forEach((m) => { const tr = el("tr");
    tr.innerHTML = `<td>${m.name}</td><td class="muted">${m.role}</td><td class="mono">${m.model}</td><td>${m.human}</td><td class="muted">${m.fallback}</td><td>${m.explain}</td>`;
    tb.appendChild(tr); });
  table.appendChild(tb); mc.appendChild(table);
  wrap.appendChild(mc);

  // safeguards checklist
  const sg = el("div", "card card-pad");
  sg.appendChild(el("div", "section-label", "Responsible-AI safeguards"));
  const sl = el("div", "sg-list");
  P.SAFEGUARDS.forEach((s) => { const row = el("div", `sg-row ${s.status}`);
    row.append(el("span", `sg-mark ${s.status}`, s.status === "ok" ? icon("check", "ico-sm") : ""),
      el("span", "sg-name", s.name), el("span", `sg-tag ${s.status}`, s.status === "ok" ? "in place" : "roadmap"));
    sl.appendChild(row); });
  sg.appendChild(sl);
  sg.appendChild(el("div", "hint", "Two safeguards are on the roadmap, not yet in place — disclosed honestly, because a compliance tool that hides its own gaps is the opposite of the point."));
  wrap.appendChild(sg);
  return wrap;
}

const RENDER = {
  overview: renderOverview, clearance: renderClearance, surveillance: renderSurveillance,
  coverage: renderCoverage, agents: renderAgents, regwatch: renderRegwatch,
  disclosure: renderDisclosure, rules: renderRules, audit: renderAudit,
};

/* --------------------------------------------------------------- modal --- */
function showModal(title, obj) {
  $("#modal-title").textContent = title;
  const json = JSON.stringify(obj, null, 2);
  $("#modal-body").textContent = json;
  $("#modal-layer").hidden = false;
  $("#modal-dl").onclick = () => {
    const blob = new Blob([json], { type: "application/json" });
    const a = el("a"); a.href = URL.createObjectURL(blob);
    a.download = `fincortex-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };
  $("#modal-copy").onclick = () => { navigator.clipboard?.writeText(json); $("#modal-copy").innerHTML = icon("check") + "<span>Copied</span>"; setTimeout(() => $("#modal-copy").innerHTML = icon("copy") + "<span>Copy JSON</span>", 1400); };
}
function closeModal() { $("#modal-layer").hidden = true; }
$("#modal-x").onclick = closeModal;
$("#modal-layer").addEventListener("click", (e) => { if (e.target.id === "modal-layer") closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); if (demoRunning) stopDemo(); } });

/* --------------------------------------------------------------- theme --- */
$("#theme-btn").onclick = () => {
  const root = document.documentElement;
  const dark = root.getAttribute("data-theme") !== "light";
  root.setAttribute("data-theme", dark ? "light" : "dark");
  $("#theme-btn").innerHTML = icon(dark ? "sun" : "moon");
};

/* --------------------------------------------------------------- chrome -- */
function initChrome() {
  document.querySelectorAll(".nav-item").forEach((n) => {
    const ico = n.querySelector(".nav-ico"); if (ico) ico.innerHTML = icon(NAV_ICON[n.dataset.view]);
  });
  $(".demo-ico").innerHTML = icon("play");
  $("#theme-btn").innerHTML = icon("moon");
  $("#modal-x").innerHTML = icon("x");
  $("#modal-copy").innerHTML = icon("copy") + "<span>Copy JSON</span>";
  $("#modal-dl").innerHTML = icon("download") + "<span>Download</span>";
}

/* ---------------------------------------------------------- demo driver -- */
let demoTimer = null, demoIdx = 0, demoRunning = false;
$("#demo-btn").onclick = () => (demoRunning ? stopDemo() : startDemo());
$("#demo-exit").onclick = stopDemo;

function startDemo() {
  demoRunning = true; demoIdx = 0;
  $("#demo-layer").hidden = false;
  $("#demo-btn").innerHTML = `<span class="demo-ico">${icon("stop")}</span><span>Stop demo</span>`;
  runDemoStep();
}
function stopDemo() {
  demoRunning = false; clearTimeout(demoTimer);
  $("#demo-layer").hidden = true;
  $("#demo-btn").innerHTML = `<span class="demo-ico">${icon("play")}</span><span>Play judge demo</span>`;
}
function runDemoStep() {
  if (!demoRunning) return;
  if (demoIdx >= P.DEMO.length) { stopDemo(); return; }
  const step = P.DEMO[demoIdx];
  $("#demo-step").textContent = `Step ${demoIdx + 1} / ${P.DEMO.length}`;
  $("#demo-title").textContent = step.title;
  $("#demo-say").textContent = step.say;
  const bar = $("#demo-bar"); bar.style.transition = "none"; bar.style.width = "0%";
  requestAnimationFrame(() => { bar.style.transition = `width ${step.ms}ms linear`; bar.style.width = "100%"; });

  if (step.preset) { Object.assign(form, PRESETS[step.preset].v); }
  go(step.view);
  if (step.view === "clearance" && step.run) {
    const result = $(".result");
    if (result) runClearanceFlow(result);
  }
  demoIdx++;
  demoTimer = setTimeout(runDemoStep, step.ms);
}

/* --------------------------------------------------------------- clock --- */
function nowTime() { const d = new Date(); return d.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function tickClock() { $("#clock").textContent = `${nowTime()} IST`; }
setInterval(tickClock, 1000); tickClock();

initChrome();
render();
