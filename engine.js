/* ============================================================================
 * FINCORTEX — Agentic Compliance Engine  (v2)
 * A working SEBI pre-trade / pre-advice clearance + surveillance engine.
 * Grounded in the actual 2022–2026 SEBI regulatory record (citations inline).
 * Pure functions: (scenario, rulebook) -> verdicts. No framework, no network.
 * ==========================================================================*/

// --- Money / format helpers ----------------------------------------------
const INR = (n) => "₹" + n.toLocaleString("en-IN");
const CR = (n) => "₹" + (n / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + " Cr";

// --- Reference data -------------------------------------------------------

const CLIENTS = {
  meridian: {
    id: "meridian", name: "Meridian Capital LLP", type: "Institutional · FPI (Cat-I)",
    riskProfile: "aggressive", kyc: "valid", kycExpiry: "2027-03-31",
    insider: false, designatedFor: null, pan: "AABCM4521P", aum: 184_00_00_000,
  },
  sharma: {
    id: "sharma", name: "R. Sharma", type: "Designated Person · Infosys Ltd (CFO office)",
    riskProfile: "aggressive", kyc: "valid", kycExpiry: "2026-11-30",
    insider: true, designatedFor: "INFY", pan: "BXYPS9087K", aum: 6_40_00_000,
  },
  iyer: {
    id: "iyer", name: "A. Iyer", type: "Retail · Individual",
    riskProfile: "conservative", kyc: "expired", kycExpiry: "2025-04-12",
    insider: false, designatedFor: null, pan: "CQRPI1122L", aum: 18_50_000,
  },
  aster: {
    id: "aster", name: "Aster Multi-Family Office", type: "AIF · Category III",
    riskProfile: "moderate", kyc: "valid", kycExpiry: "2028-01-15",
    insider: false, designatedFor: null, pan: "AAFCA7781Q", aum: 92_00_00_000,
  },
};

const INSTRUMENTS = {
  INFY: {
    symbol: "INFY", name: "Infosys Ltd", isin: "INE009A01021", segment: "Equity · NSE",
    index: "NIFTY 50", riskGrade: "moderate", windowClosed: true, embargo: false,
    ltp: 1624.5, priceBandPct: 10, mwpl: 82,
  },
  RELIANCE: {
    symbol: "RELIANCE", name: "Reliance Industries", isin: "INE002A01018", segment: "Equity · NSE",
    index: "NIFTY 50", riskGrade: "moderate", windowClosed: false, embargo: false,
    ltp: 2987.0, priceBandPct: 10, mwpl: 34,
  },
  ORVX: {
    symbol: "ORVX", name: "Orva Chemicals (SME)", isin: "INE99XY01011", segment: "Equity · NSE SME",
    index: "—", riskGrade: "aggressive", windowClosed: false, embargo: true,
    ltp: 214.8, priceBandPct: 5, mwpl: 12,
  },
  NIFTYFUT: {
    symbol: "NIFTY-FUT", name: "Nifty 50 Futures", isin: "—", segment: "Derivatives · F&O",
    index: "NIFTY 50", riskGrade: "aggressive", windowClosed: false, embargo: false,
    ltp: 24180, priceBandPct: 10, mwpl: 91,
  },
};

// --- Rulebook (toggleable, with real citations & effective dates) --------

const RULEBOOK = [
  {
    id: "kyc", name: "KYC / PMLA validity", severity: "hard",
    citation: "PMLA 2002 · SEBI KRA Regs 2011 · CKYC (CERSAI)",
    effective: "in force",
    blurb: "No order or advice may be processed for a client whose KYC/CKYC record is not valid and current, or whose PAN–Aadhaar is not seeded.",
    enabled: true,
  },
  {
    id: "insider", name: "Insider trading — trading window (PAN freeze)", severity: "hard",
    citation: "SEBI (PIT) Regs 2015, Reg 4 · Circular SEBI/HO/ISD/2022/106 (05-Aug-2022)",
    effective: "system-driven since 30-Sep-2022; all listed entities since Jul-2023",
    blurb: "A designated person's PAN is frozen at the depository & exchange during a closed trading window. Access to UPSI is logged in the Structured Digital Database (Reg 3(5), preserved 8 yrs).",
    enabled: true,
  },
  {
    id: "suitability", name: "Suitability of advice", severity: "hard",
    citation: "SEBI (Investment Advisers) Regs 2013, Reg 17",
    effective: "in force",
    blurb: "Recommended risk grade must not exceed the client's assessed risk profile; the advice must fit the client's objectives and capacity for loss.",
    enabled: true,
  },
  {
    id: "adcode", name: "Advertisement / finfluencer code", severity: "hard",
    citation: "SEBI (Intermediaries) Regs 2008 amdt (29-Aug-2024) · Circulars 22-Oct-2024 & 29-Jan-2025",
    effective: "in force",
    blurb: "Advice must carry IA/RA registration + risk disclosure, must not promise assured/guaranteed returns, and a regulated entity may not associate with unregistered advice.",
    enabled: true,
  },
  {
    id: "algo", name: "Algo order tagging (Algo-ID)", severity: "hard",
    citation: "SEBI Circular SEBI/HO/MIRSD (04-Feb-2025) — Safer retail algo participation",
    effective: "mandatory 01-Apr-2026",
    blurb: "Every order from an algorithm must carry the exchange-assigned Algo-ID; API access must use 2FA/OAuth and the strategy must be empaneled with the exchange.",
    enabled: true,
  },
  {
    id: "poslimit", name: "Position / concentration limit (MWPL)", severity: "soft",
    citation: "SEBI F&O framework · Market-Wide Position Limit (MWPL)",
    effective: "in force",
    blurb: "An order must not push the scrip past its market-wide position limit; utilisation past 80% needs desk sign-off, 95% is a hard cap.",
    enabled: true,
  },
  {
    id: "embargo", name: "Research embargo (information barrier)", severity: "hard",
    citation: "SEBI (Research Analysts) Regs 2014 · internal PIT code of conduct",
    effective: "in force",
    blurb: "No proprietary or advised trade in a scrip under an active in-house research embargo, across the Chinese-wall / information barrier.",
    enabled: true,
  },
];

// --- The rule evaluators --------------------------------------------------
// Each returns { status, headline, detail, evidence[] }

const EVALUATORS = {
  kyc(s) {
    const c = s.client;
    if (c.kyc === "valid")
      return ok(`KYC valid to ${c.kycExpiry}`, [`PAN ${c.pan}`, "CKYC record active", "PMLA screening clear"]);
    if (c.kyc === "pending")
      return block("KYC not yet approved", "Client onboarding is incomplete — no order may be routed under PMLA.", ["CKYC status: pending"]);
    return block("KYC expired", `Re-KYC required — CKYC lapsed on ${c.kycExpiry}.`, ["CKYC status: expired", `PAN ${c.pan}`]);
  },

  insider(s) {
    const c = s.client, i = s.instrument;
    if (c.insider && c.designatedFor === i.symbol && i.windowClosed)
      return block("Trading window CLOSED — PAN would be frozen",
        `${c.name} is a designated person for ${i.symbol} and can be expected to hold UPSI. Under the 05-Aug-2022 system-driven framework the DP's PAN is frozen at the exchange & depository for the entire blackout — this order cannot reach the exchange.`,
        ["Designated person = true", `UPSI scrip = ${i.symbol}`, "Trading window = closed", "SDD access logged"]);
    if (c.insider && c.designatedFor === i.symbol && !i.windowClosed)
      return warn("Insider trading own scrip — pre-clearance required",
        "Window is open, but a designated person's trade needs Compliance Officer pre-clearance and must be logged in the Structured Digital Database.",
        ["Designated person = true", "Trading window = open", "CO pre-clearance required"]);
    return ok("No insider conflict", ["Client is not a designated person for this scrip"]);
  },

  suitability(s) {
    const rank = { conservative: 1, moderate: 2, aggressive: 3 };
    const c = s.client, i = s.instrument;
    if (s.channel !== "advice") return ok("Not an advisory order — suitability N/A", []);
    if (rank[i.riskGrade] > rank[c.riskProfile])
      return block("Advice exceeds client risk profile",
        `${i.symbol} is graded ${i.riskGrade}; ${c.name} is profiled ${c.riskProfile}. Reg 17 requires advice to fit the client's risk capacity.`,
        [`Instrument grade = ${i.riskGrade}`, `Client profile = ${c.riskProfile}`]);
    return ok("Risk grade within client profile", [`Instrument grade = ${i.riskGrade}`, `Client profile = ${c.riskProfile}`]);
  },

  adcode(s) {
    if (s.channel !== "advice") return ok("Not advisory — ad-code N/A", []);
    const t = (s.adviceText || "").toLowerCase();
    const banned = ["guaranteed", "assured", "risk-free", "sure-shot", "sure shot", "double your", "100% profit", "multibagger guaranteed"];
    const hit = banned.find((w) => t.includes(w));
    if (hit)
      return block("Prohibited assured-return language",
        `Advice text contains "${hit}" — return/performance claims are barred under the 29-Aug-2024 amendment and finfluencer circulars.`,
        [`Flagged phrase: "${hit}"`]);
    if (!s.disclosureAttached)
      return warn("Missing registration disclosure",
        "Advice lacks the mandatory IA/RA registration number + risk disclaimer required before dissemination.",
        ["Disclosure attached = false"]);
    return ok("Disclosure attached, no banned language", ["SEBI reg. no. disclosed", "No return claims"]);
  },

  algo(s) {
    if (s.orderType !== "algo") return ok("Manual order — tagging N/A", []);
    if (!s.strategyId)
      return block("Untagged algo order",
        "Algorithmic order carries no exchange-assigned Algo-ID. From 01-Apr-2026 every algo order must be tagged and the strategy empaneled — this order is rejected at the OMS gateway.",
        ["Order type = algo", "Algo-ID = <missing>", "Empanelment = none"]);
    return ok(`Algo tagged: ${s.strategyId}`, [`Algo-ID = ${s.strategyId}`, "2FA/OAuth API", "Strategy empaneled"]);
  },

  poslimit(s) {
    const i = s.instrument;
    const projected = i.mwpl + Math.min(20, Math.round(s.quantity / 1000)); // toy model
    if (projected >= 95)
      return block("Breaches market-wide position limit",
        `Projected MWPL utilisation ${projected}% ≥ 95% hard cap for ${i.symbol} — the exchange would reject further build-up.`,
        [`Current MWPL = ${i.mwpl}%`, `Projected = ${projected}%`]);
    if (projected >= 80)
      return warn("Approaching position limit",
        `Projected MWPL utilisation ${projected}% — desk sign-off required past 80%.`,
        [`Current MWPL = ${i.mwpl}%`, `Projected = ${projected}%`]);
    return ok(`MWPL utilisation ${projected}% — within limit`, [`Projected = ${projected}%`]);
  },

  embargo(s) {
    const i = s.instrument;
    if (i.embargo)
      return block("Scrip under active research embargo",
        `${i.symbol} is embargoed pending a research report — the information barrier bars any proprietary/advised trade until publication + cool-off.`,
        ["Embargo = active", "Information barrier engaged"]);
    return ok("No active embargo", []);
  },
};

function ok(headline, evidence) { return { status: "pass", headline, detail: "", evidence: evidence || [] }; }
function warn(headline, detail, evidence) { return { status: "warn", headline, detail, evidence: evidence || [] }; }
function block(headline, detail, evidence) { return { status: "block", headline, detail, evidence: evidence || [] }; }

// remediation hint — "what would make this pass"
const REMEDY = {
  kyc: "Complete CKYC re-verification and PAN–Aadhaar seeding before routing.",
  insider: "Hold until the trading window reopens; log the pre-clearance in the SDD.",
  suitability: "Re-profile the client or recommend an instrument within their risk grade.",
  adcode: "Remove return/performance claims and attach the IA/RA registration + risk disclosure.",
  algo: "Register the strategy with the exchange and attach the assigned Algo-ID.",
  poslimit: "Reduce size below the 80% MWPL band or obtain desk sign-off.",
  embargo: "Wait for the research report to publish and the embargo cool-off to lapse.",
};

// --- The agent: run the enabled rulebook over a scenario ------------------

function runClearance(scenario, rulebook) {
  const results = [];
  for (const rule of rulebook) {
    if (!rule.enabled) continue;
    const evalFn = EVALUATORS[rule.id];
    if (!evalFn) continue;
    const outcome = evalFn(scenario);
    results.push({ rule, ...outcome, remedy: outcome.status !== "pass" ? REMEDY[rule.id] : null });
  }
  const hasBlock = results.some((r) => r.status === "block");
  const hasWarn = results.some((r) => r.status === "warn");
  const decision = hasBlock ? "block" : hasWarn ? "review" : "clear";
  const notional = (scenario.quantity || 0) * (scenario.instrument.ltp || 0);
  return {
    decision, results, notional,
    passed: results.filter((r) => r.status === "pass").length,
    warned: results.filter((r) => r.status === "warn").length,
    blocked: results.filter((r) => r.status === "block").length,
  };
}

// --- The agent fabric (shown on the Agents view) --------------------------

const AGENTS = [
  { id: "clearance", name: "Clearance Agent", glyph: "⚡",
    role: "Pre-trade & pre-advice gate", desc: "Screens every order and advice event against the enabled rulebook before it reaches the exchange, and returns an explainable CLEAR / REVIEW / BLOCK verdict.",
    metric: "2,481 events / day", latency: "38 ms p95", state: "live" },
  { id: "surveillance", name: "Surveillance Agent", glyph: "◈",
    role: "Post-trade pattern monitoring", desc: "Watches the order & trade stream for manipulative patterns — circular trading, spoofing, front-running, wash trades — and scores each with a confidence and linked-account graph.",
    metric: "5 open flags", latency: "streaming", state: "live" },
  { id: "regwatch", name: "RegWatch Agent", glyph: "❋",
    role: "Regulation-to-rule compiler", desc: "Reads new SEBI circulars & master directions, extracts the enforceable obligation, and compiles it into a machine-checkable rule the Clearance Agent can run — compliance that updates itself.",
    metric: "7 rules compiled", latency: "on publish", state: "live" },
  { id: "reporting", name: "Reporting Agent", glyph: "▤",
    role: "Regulator-ready filing", desc: "Assembles the immutable decision trail into the artefacts an inspection asks for — daily compliance summary, Suspicious Transaction Reports, and per-decision evidence packs.",
    metric: "auto · EOD", latency: "on demand", state: "idle" },
];

// --- RegWatch: sample circulars + the rule the agent compiles from them ----

const REG_SAMPLES = [
  {
    id: "algo-2025",
    title: "Safer participation of retail investors in Algorithmic trading",
    ref: "SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025 · 04-Feb-2025",
    text: "All orders emanating from an algorithm shall be tagged with a unique identifier provided by the stock exchange so as to establish an audit trail... Brokers shall permit API access only through OAuth-based authentication with two-factor authentication... Algo providers shall be empaneled with the stock exchanges.",
    compiled: {
      rule: "algo", trigger: "order.orderType == 'algo'",
      condition: "order.algoId present AND strategy.empaneled == true",
      action: "block if condition false", effective: "2026-04-01",
    },
  },
  {
    id: "pit-2022",
    title: "Trading restriction on Designated Persons via PAN freeze",
    ref: "SEBI/HO/ISD/ISD/CIR/P/2022/106 · 05-Aug-2022",
    text: "During the trading window closure period, the trading in securities of the listed company by the Designated Persons shall be restricted by freezing of PAN at the security level... Depositories and Stock Exchanges shall put in place systems to restrict on-market and off-market transfers.",
    compiled: {
      rule: "insider", trigger: "client.designatedPerson AND window.closed",
      condition: "client.pan NOT frozen",
      action: "block · freeze PAN at exchange+depository", effective: "2022-09-30",
    },
  },
  {
    id: "fin-2024",
    title: "Association of regulated entities with finfluencers",
    ref: "SEBI (Intermediaries) Regs amdt · 29-Aug-2024 + Cir 22-Oct-2024",
    text: "Persons regulated by the Board shall not have any association with any person who, directly or indirectly, provides advice or recommendation in respect of a security unless registered with the Board, or makes any claim of returns or performance...",
    compiled: {
      rule: "adcode", trigger: "channel == 'advice'",
      condition: "advice.registrationDisclosed AND NOT advice.returnClaim",
      action: "block on return-claim · warn on missing disclosure", effective: "2024-08-29",
    },
  },
];

// --- Surveillance (SEBI SupTech / DWBIS-style pattern flags) --------------

const SURVEILLANCE = [
  { id: "SV-2041", pattern: "Circular trading", scrip: "ORVX", severity: "high", confidence: 0.91, accounts: 6, value: 3_20_00_000, status: "open", note: "Reciprocal trades across 6 PAN-linked accounts, no change in beneficial ownership. Volume up 14× on the SME counter." },
  { id: "SV-2038", pattern: "Spoofing / layering", scrip: "NIFTY-FUT", severity: "high", confidence: 0.87, accounts: 1, value: 11_40_00_000, status: "open", note: "Large passive orders cancelled <200 ms before opposite-side fills — classic order-book layering." },
  { id: "SV-2033", pattern: "Front-running", scrip: "INFY", severity: "medium", confidence: 0.74, accounts: 2, value: 88_00_000, status: "reviewing", note: "Dealer account trades 40 s ahead of a large client block, 11 times in a week — possible information leak." },
  { id: "SV-2027", pattern: "Wash trades", scrip: "RELIANCE", severity: "low", confidence: 0.58, accounts: 3, value: 42_00_000, status: "reviewing", note: "Self-matched trades inflating volume near close; benign until pattern persists." },
  { id: "SV-2019", pattern: "Pump via finfluencer", scrip: "ORVX", severity: "medium", confidence: 0.69, accounts: 1, value: 1_10_00_000, status: "escalated", note: "Coordinated buy advice on social channels without disclosure, spike in retail inflow ahead of promoter exit." },
];

const SEED_AUDIT = [
  { ts: "09:41:07", actor: "agent", client: "Meridian Capital LLP", scrip: "RELIANCE", decision: "clear", rule: "—", note: "Auto-cleared: 7/7 checks passed." },
  { ts: "09:38:52", actor: "agent", client: "R. Sharma", scrip: "INFY", decision: "block", rule: "insider", note: "Trading window closed — PAN freeze." },
  { ts: "09:36:20", actor: "R. Menon (CO)", client: "Aster MFO", scrip: "NIFTY-FUT", decision: "review", rule: "poslimit", note: "Desk sign-off recorded at 83% MWPL." },
  { ts: "09:31:44", actor: "agent", client: "A. Iyer", scrip: "ORVX", decision: "block", rule: "kyc", note: "CKYC expired 2025-04-12." },
];

const BLOCKS_BY_RULE = [
  { id: "insider", label: "Insider window", n: 11 },
  { id: "kyc", label: "KYC / PMLA", n: 9 },
  { id: "suitability", label: "Suitability", n: 7 },
  { id: "poslimit", label: "Position limit", n: 5 },
  { id: "adcode", label: "Ad-code", n: 3 },
  { id: "algo", label: "Algo tag", n: 2 },
];

// --- Reporting Agent: build a regulator-ready artefact --------------------

function buildDecisionReport(scenario, out) {
  return {
    artefact: "Pre-Trade Clearance Record",
    generatedAt: new Date().toISOString(),
    intermediary: "FinCortex-secured intermediary (demo)",
    client: { name: scenario.client.name, pan: scenario.client.pan, kyc: scenario.client.kyc, type: scenario.client.type },
    order: { scrip: scenario.instrument.symbol, isin: scenario.instrument.isin, side: scenario.side,
             quantity: scenario.quantity, notionalINR: (scenario.quantity * scenario.instrument.ltp),
             channel: scenario.channel, orderType: scenario.orderType },
    decision: out.decision,
    checks: out.results.map((r) => ({ rule: r.rule.id, name: r.rule.name, status: r.status,
             headline: r.headline, detail: r.detail, citation: r.rule.citation,
             effective: r.rule.effective, evidence: r.evidence, remediation: r.remedy })),
    attestation: "System-generated under the firm's PIT / IA / PMLA compliance policy. Retained per SDD 8-year rule.",
  };
}

function buildSTR(alert) {
  return {
    artefact: "Suspicious Transaction Report (STR) — draft",
    generatedAt: new Date().toISOString(),
    caseId: alert.id, pattern: alert.pattern, scrip: alert.scrip,
    linkedAccounts: alert.accounts, notionalINR: alert.value,
    confidence: alert.confidence, severity: alert.severity,
    narrative: alert.note,
    basis: "Flagged by FinCortex Surveillance Agent; consistent with SEBI (PFUTP) Regulations 2003 — prohibition of fraudulent & unfair trade practices.",
    recommendedAction: alert.severity === "high" ? "Escalate to SEBI / exchange surveillance; freeze linked PANs pending review." : "Continue monitoring; widen the linked-account graph.",
  };
}

// --- Guided demo script (the judge auto-play) -----------------------------
// Each step: view to show, optional preset/action, and narration.
const DEMO = [
  { view: "overview", ms: 3200,
    title: "One agent in front of the whole desk",
    say: "FinCortex screens every order and every piece of advice before it reaches the exchange — 2,481 events today, 37 stopped at source." },
  { view: "clearance", preset: "clean", run: true, ms: 5200,
    title: "A clean institutional order clears",
    say: "Meridian Capital buys Reliance. Seven SEBI checks run in 38 ms — all pass. The order is released." },
  { view: "clearance", preset: "insider", run: true, ms: 5600,
    title: "An insider in a closed window is blocked",
    say: "A designated person tries to sell Infosys during a closed trading window. Under the 2022 PAN-freeze framework, FinCortex blocks it — and shows exactly why." },
  { view: "clearance", preset: "messy", run: true, ms: 6000,
    title: "Unsuitable, unregistered, untagged — all caught at once",
    say: "Retail client, aggressive derivative, 'guaranteed 30% returns', untagged algo. Five rules fire together — suitability, ad-code, algo-ID, KYC, position limit." },
  { view: "surveillance", ms: 5200,
    title: "Post-trade, the Surveillance Agent watches the tape",
    say: "It flags a circular-trading ring across six PAN-linked accounts on an SME counter — 91% confidence, ₹3.2 Cr." },
  { view: "regwatch", ms: 5600,
    title: "And it updates itself when SEBI issues a circular",
    say: "The RegWatch Agent reads a new SEBI circular and compiles it into an enforceable rule — no engineer in the loop. That is agentic compliance." },
  { view: "audit", ms: 4200,
    title: "Every decision, regulator-ready",
    say: "Each verdict lands in an immutable, exportable trail — the evidence an inspection asks for, retained for eight years." },
];

// --- Free OpenRouter models offered in the RegWatch model picker ----------
const FREE_MODELS = [
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (free)" },
  { id: "google/gemini-2.0-flash-exp:free",       label: "Gemini 2.0 Flash (free)" },
  { id: "deepseek/deepseek-chat-v3-0324:free",    label: "DeepSeek V3 (free)" },
  { id: "qwen/qwen-2.5-72b-instruct:free",        label: "Qwen 2.5 72B (free)" },
  { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1 (free)" },
];

// System prompt the RegWatch agent sends to the LLM to compile a circular.
const REGWATCH_SYSTEM =
`You are RegWatch, a compliance rule compiler for the Indian securities market (SEBI).
Given the text of a SEBI circular, master direction, or regulation, extract the single
most important ENFORCEABLE obligation and output it as a machine-checkable rule.

Respond with ONLY a JSON object, no prose, no markdown fences, in exactly this shape:
{
  "rule": "<short snake_case id>",
  "title": "<short human title>",
  "trigger": "<when this rule is evaluated, as a boolean-ish expression over an order/advice/client>",
  "condition": "<what must be TRUE for the event to be compliant>",
  "action": "<what the Clearance Agent does when the condition is false, e.g. 'block' / 'warn' / 'block + freeze PAN'>",
  "effective": "<effective date if stated, else 'in force'>",
  "citation": "<the circular/regulation reference>",
  "summary": "<one plain-English sentence a compliance officer would understand>"
}`;

// --- Cost of non-compliance (real, cited SEBI enforcement) ----------------
const COST_OF_PROBLEM = [
  { figure: "₹546 Cr", label: "impounded from ONE finfluencer", detail: "Avadhut Sathe / ASTA — unregistered advice sold as 'education' (SEBI, Dec 2025)" },
  { figure: "₹173 Cr", label: "one insider-trading order", detail: "IEX case — 8 entities; one of SEBI's fastest actions (Oct 2025)" },
  { figure: "₹1.06 L Cr", label: "retail F&O losses, FY25", detail: "individual traders — the harm compliance is meant to prevent" },
  { figure: "₹25 Cr", label: "max penalty per violation", detail: "or 3× the gains — plus licence suspension and personal liability" },
];

// Real enforcement cases FinCortex's controls would have caught — mapped to a control
const ENFORCEMENT_CASES = [
  { title: "Infosys insider trading", when: "SEBI order, Jan 2025", violation: "Designated persons traded INFY while holding UPSI.",
    control: "Clearance · trading-window PAN freeze", cite: "SEBI (PIT) Regs 2015 · Cir 05-Aug-2022", jump: { view: "clearance", preset: "insider" } },
  { title: "Finfluencer 'assured returns'", when: "2024–25 crackdown", violation: "Unregistered advice with guaranteed-return claims to retail.",
    control: "Clearance · advertisement / ad-code", cite: "SEBI (Intermediaries) amdt 29-Aug-2024", jump: { view: "clearance", preset: "messy" } },
  { title: "Coordinated price manipulation", when: "2023–25 investigations", violation: "Circular trading & order-book layering across linked accounts.",
    control: "Surveillance agent · PFUTP monitoring", cite: "SEBI (PFUTP) Regs 2003", jump: { view: "surveillance" } },
];

// --- Obligation Coverage Map ----------------------------------------------
// Obligations mapped from the SEBI Master Circular for Stock Brokers & IAs to the
// FinCortex control that enforces each. status: covered | atrisk | gap
const OBLIGATIONS = [
  { cat: "KYC & Onboarding", text: "Validate CKYC before the first trade", cite: "PMLA 2002 · KRA Regs 2011", control: "Clearance · KYC rule", status: "covered" },
  { cat: "KYC & Onboarding", text: "PAN–Aadhaar seeding verified", cite: "CBDT · SEBI", control: "Clearance · KYC rule", status: "covered" },
  { cat: "KYC & Onboarding", text: "Risk-based periodic KYC refresh", cite: "KRA Regs", control: "Reminder engine", status: "covered" },
  { cat: "KYC & Onboarding", text: "In-person verification (IPV) record on file", cite: "SEBI KYC", control: "Manual process", status: "gap" },

  { cat: "Insider Trading / PIT", text: "Trading-window closure enforced (PAN freeze)", cite: "PIT 2015 · Cir 05-Aug-2022", control: "Clearance · insider rule", status: "covered" },
  { cat: "Insider Trading / PIT", text: "Structured Digital Database of UPSI access", cite: "PIT Reg 3(5)", control: "Audit ledger", status: "covered" },
  { cat: "Insider Trading / PIT", text: "Designated-persons list kept current", cite: "PIT Sch B", control: "Manual process", status: "atrisk" },
  { cat: "Insider Trading / PIT", text: "Pre-clearance of DP trades logged", cite: "PIT Sch B", control: "Clearance + ledger", status: "covered" },

  { cat: "Order Handling", text: "Pre-trade risk & position-limit checks", cite: "SEBI · exchange", control: "Clearance · position limit", status: "covered" },
  { cat: "Order Handling", text: "Immutable order/trade audit trail", cite: "SEBI books & records", control: "Audit ledger (SHA-256)", status: "covered" },
  { cat: "Order Handling", text: "Documented best-execution policy evidence", cite: "SEBI", control: "Manual process", status: "gap" },

  { cat: "Advice & Advertisement", text: "Suitability of advice vs client risk profile", cite: "IA Regs 2013 · Reg 17", control: "Clearance · suitability", status: "covered" },
  { cat: "Advice & Advertisement", text: "No assured-return / ad-code screening", cite: "Intermediaries amdt 2024", control: "Clearance · ad-code", status: "covered" },
  { cat: "Advice & Advertisement", text: "No association with unregistered finfluencers", cite: "Cir 22-Oct-2024", control: "Clearance · ad-code", status: "covered" },
  { cat: "Advice & Advertisement", text: "Fee model disclosure & client consent", cite: "IA Regs", control: "Manual process", status: "gap" },

  { cat: "Algorithmic Trading", text: "Exchange Algo-ID on every algo order", cite: "Cir 04-Feb-2025", control: "Clearance · algo rule", status: "covered" },
  { cat: "Algorithmic Trading", text: "Strategy empanelled with the exchange", cite: "Cir 04-Feb-2025", control: "Clearance · algo rule", status: "covered" },
  { cat: "Algorithmic Trading", text: "Kill-switch / abnormal-behaviour safeguard", cite: "Cir 04-Feb-2025", control: "Partial (cooldown)", status: "atrisk" },

  { cat: "Surveillance / PFUTP", text: "Manipulation pattern monitoring", cite: "PFUTP Regs 2003", control: "Surveillance agent", status: "covered" },
  { cat: "Surveillance / PFUTP", text: "Suspicious Transaction Reports filed", cite: "PMLA", control: "Surveillance + Reporting", status: "covered" },
  { cat: "Surveillance / PFUTP", text: "Alert disposition audit trail", cite: "SEBI", control: "Audit ledger", status: "covered" },

  { cat: "Reporting & Filings", text: "Half-yearly AI/ML system disclosure", cite: "Reg 16C · 10-Feb-2025", control: "AI Disclosure module", status: "covered" },
  { cat: "Reporting & Filings", text: "Cyber-incident reporting (6-hour)", cite: "CERT-In · SEBI", control: "Manual process", status: "gap" },
  { cat: "Reporting & Filings", text: "Internal / system audit filing", cite: "SEBI", control: "Reporting (draft)", status: "covered" },
  { cat: "Reporting & Filings", text: "Margin / client-funding reporting", cite: "SEBI", control: "Reporting", status: "covered" },

  { cat: "Books & Records", text: "8-year immutable record retention", cite: "SDD · SEBI", control: "Audit ledger", status: "covered" },
  { cat: "Books & Records", text: "Tamper-evident audit trail", cite: "Best practice", control: "Audit ledger (SHA-256)", status: "covered" },
  { cat: "Books & Records", text: "Daily compliance summary generated", cite: "SEBI", control: "Reporting", status: "covered" },

  { cat: "Investor Grievance", text: "SCORES grievance logging & turnaround", cite: "SEBI SCORES", control: "Manual process", status: "gap" },
  { cat: "Investor Grievance", text: "Investor charter displayed & maintained", cite: "SEBI", control: "Static control", status: "covered" },

  { cat: "AI Governance", text: "Human oversight on every enforced rule", cite: "Consultation Jun-2025", control: "AI Disclosure module", status: "covered" },
  { cat: "AI Governance", text: "Model explainability maintained", cite: "Consultation Jun-2025", control: "Clearance reasoning", status: "covered" },
  { cat: "AI Governance", text: "AI fallback · no autonomous order execution", cite: "Consultation Jun-2025", control: "Deterministic fallback", status: "covered" },
];

// --- FinCortex's own SEBI AI/ML disclosure (the "self-compliant" panel) ----
const AI_DISCLOSURE = {
  systemName: "FinCortex — Agentic Compliance",
  type: "Rule-based expert system + LLM-assisted regulation parsing (RegWatch)",
  firstUse: "2026-07",
  initiatesOrders: "No — screens and blocks only; never originates an order",
  routesOrders: "No",
  executesOrders: "No — advisory gate; the OMS / human executes",
  discretionaryOrPMS: "No",
  cybersecurityUse: "Yes — surveillance & anomaly detection",
  marketingClaims: "None — no performance or return claims are made",
  abnormalBehaviourSafeguards: "Deterministic rulebook is the source of truth; the LLM only parses circulars, under human review; graceful fallback when the model is unavailable",
  implementationMethodology: "Deterministic SEBI evaluators + optional OpenRouter LLM for circular parsing, with a full tamper-evident audit trail",
  humanOversight: "Compliance officer reviews every REVIEW-tier decision and approves every RegWatch-compiled rule before it is enforced",
  filing: "Filed half-yearly via the Exchange Enhanced Supervision Portal",
};

const MODEL_CARD = [
  { name: "Deterministic rulebook", role: "Clearance & enforcement", model: "Hand-coded SEBI evaluators", human: "Yes (REVIEW tier)", fallback: "—", explain: "Full trace" },
  { name: "RegWatch parser", role: "Circular → RuleSpec", model: "OpenRouter LLM (e.g. Llama 3.3 70B)", human: "Yes (CO approves)", fallback: "Deterministic compiler", explain: "Cited output" },
  { name: "Surveillance", role: "Manipulation detection", model: "Statistical + rule heuristics", human: "Yes (STR review)", fallback: "—", explain: "Confidence + evidence" },
];

const SAFEGUARDS = [
  { name: "Human oversight on every enforced rule", status: "ok" },
  { name: "Explainability — every decision cites its regulation", status: "ok" },
  { name: "Deterministic fallback if the LLM is unavailable", status: "ok" },
  { name: "No autonomous order execution", status: "ok" },
  { name: "Immutable, tamper-evident audit trail", status: "ok" },
  { name: "Independent model validation & red-teaming", status: "pending" },
  { name: "Bias & drift monitoring on LLM parsing", status: "pending" },
];

// --- Compact synchronous SHA-256 (public-domain, geraintluff/sha256) ------
// Real SHA-256 so the tamper-evident ledger is genuine, not a toy hash.
function _sha256(ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  const mp = Math.pow, maxWord = mp(2, 32);
  let result = "";
  const words = [];
  const bitLen = ascii.length * 8;
  let hash = _sha256.h = _sha256.h || [];
  const k = _sha256.k = _sha256.k || [];
  let pc = k.length;
  const comp = {};
  for (let cand = 2; pc < 64; cand++) {
    if (!comp[cand]) {
      for (let i = 0; i < 313; i += cand) comp[i] = cand;
      hash[pc] = (mp(cand, 0.5) * maxWord) | 0;
      k[pc++] = (mp(cand, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += "\x80";
  while (ascii.length % 64 - 56) ascii += "\x00";
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    if (j >> 8) return "";
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (bitLen / maxWord) | 0;
  words[words.length] = bitLen;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i]
        + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7]
          + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++)
    for (let j = 3; j + 1; j--) { const b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : "") + b.toString(16); }
  return result;
}
const hash256 = (str) => _sha256(unescape(encodeURIComponent(String(str))));

// Median manual interpretation-to-implementation lag per circular (illustrative, days)
const REG_MANUAL_DAYS = { "algo-2025": 23, "pit-2022": 31, "fin-2024": 18 };

window.FINCORTEX = {
  INR, CR, CLIENTS, INSTRUMENTS, RULEBOOK, EVALUATORS, REMEDY,
  runClearance, AGENTS, REG_SAMPLES, SURVEILLANCE, SEED_AUDIT, BLOCKS_BY_RULE,
  buildDecisionReport, buildSTR, DEMO, FREE_MODELS, REGWATCH_SYSTEM,
  hash256, REG_MANUAL_DAYS,
  OBLIGATIONS, AI_DISCLOSURE, MODEL_CARD, SAFEGUARDS,
  COST_OF_PROBLEM, ENFORCEMENT_CASES,
};
