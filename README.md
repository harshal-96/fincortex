# FinCortex — the agentic compliance layer for India's securities market

**SEBI Securities Market TechSprint @ GFF 2026 · Track 2 (Agentic Compliance) · RegTech + SupTech**

FinCortex (**Fin**ancial + **Cortex**) is a fabric of four compliance agents that sit
**in front of every order and every piece of advice** a market intermediary sends,
screen it against the live SEBI rulebook, **block non-compliant flow at source**, watch
the post-trade tape for manipulation, and **rewrite their own rules when SEBI issues a
new circular** — all while producing a regulator-ready, explainable audit trail.

> The differentiator: most "AI compliance" tools are a chatbot that *reads* SEBI
> circulars. FinCortex **enforces** them — it stops the trade, shows its reasoning with
> the exact citation, and updates itself when the regulator does. That transparency is
> precisely what SEBI says it wants from AI in the market.

---

## Run it (zero dependencies, offline, ~10 seconds)

```bash
npm start          # → http://127.0.0.1:4600
```

No build, no `npm install`, no internet, no API keys. Pure HTML/CSS/JS + a tiny Node
static server. **Press "▶ Play judge demo" for a 40-second guided walkthrough** that runs
the whole narrative on its own.

### Optional — turn on the live LLM in RegWatch (free, via OpenRouter)

RegWatch can call a **free OpenRouter model** to compile *any* pasted SEBI circular into a
rule. The key stays server-side (the browser only talks to a same-origin `/api/llm` proxy)
and it is **fully optional** — with no key, RegWatch runs a deterministic compiler and the
rest of the app is unaffected.

```bash
cp .env.example .env         # then paste a free key from https://openrouter.ai/keys
npm start
```

Pick the model in the RegWatch dropdown (defaults to Llama 3.3 70B free). The pill at the
top of the RegWatch view shows **● LLM connected** vs **● offline — deterministic**.

---

## The Overview opens with the stakes

The first screen leads with real, cited SEBI enforcement — **₹546 Cr** impounded from one
finfluencer (Avadhut Sathe, Dec 2025), **₹173 Cr** in the IEX insider case (Oct 2025), the
Infosys PIT order (Jan 2025), **₹1.06 L Cr** of FY25 retail F&O losses — then shows **three
real cases FinCortex would have stopped**; click one and it jumps straight into the Clearance
Agent and blocks it live. Outcome metrics (breaches prevented · time-to-comply · obligations
covered · records sealed) tie the whole product together in one glance.

## The headline: compliance-as-a-proof

Two capabilities set FinCortex apart from every "AI reads the circular" tool:

- **Regulation-as-code — issuance → enforcement in minutes, not weeks.** RegWatch reads a
  new SEBI circular and compiles it into an enforceable rule the same second. The view shows
  the collapse: **median ~24 days of manual legal interpretation → ~4 minutes.** This is the
  exact gap Problem 2 asks to close, and it mirrors the FCA's machine-executable-rulebook
  pilot — a move India can leapfrog.
- **A tamper-evident audit ledger — trust the math, not the firm.** Every decision is sealed
  with **real SHA-256** as `hash(previous hash + record)` — a chain. A regulator can verify
  the whole history from a single anchor hash without touching the firm's systems. The Audit
  view has a live **"simulate an insider altering a record"** button: alter one sealed record
  and its hash — and *every* hash after it — instantly stops matching the anchor, flagged in
  red. Compliance stops being a promise checked months later and becomes a provable fact.
  (Export a regulator evidence pack with the ledger head + per-record verification.)

## The four agents

| Agent | What it does |
|---|---|
| ⚡ **Clearance Agent** | Pre-trade / pre-advice gate. Screens every event through the enabled rulebook in ~38 ms and returns an explainable **CLEAR / REVIEW / BLOCK** verdict with per-rule evidence, the SEBI citation, and a "what would make this pass" remediation. |
| ◈ **Surveillance Agent** | Post-trade pattern monitoring — circular trading, spoofing, front-running, wash trades, finfluencer pumps — each scored with confidence, ₹ value, and a linked-PAN account graph; one click drafts a **Suspicious Transaction Report**. |
| ❋ **RegWatch Agent** | Reads a new SEBI circular in plain English and **compiles it into a machine-checkable rule** the Clearance Agent runs the same second — compliance that updates itself, no engineer in the loop. |
| ▤ **Reporting Agent** | Assembles the immutable decision trail into regulator-ready artefacts — daily compliance summary, per-decision clearance record, STRs — retained per the 8-year SDD rule. |

## Two more that close the loop

- **Obligation Coverage Map.** Every obligation from the SEBI Master Circular for Stock
  Brokers & IAs is mapped to the FinCortex control that meets it — with a live coverage score
  (**79% covered · 2 at-risk · 5 gaps**) and a gap list. This is Problem 2's other half:
  *"map each obligation to evidence of fulfilment, identify and remediate gaps before they
  become regulatory findings."* The gaps are shown honestly, not hidden.
- **AI Disclosure — the compliance agent that is itself compliant.** SEBI now regulates the
  AI intermediaries use (Reg 16C, Feb 2025 + the June 2025 responsible-AI consultation).
  FinCortex is an AI system, so it files **its own** SEBI AI/ML disclosure, ships a model card
  (deterministic rulebook + LLM parser with human-in-loop + fallback), and publishes its
  responsible-AI safeguards — including the two still on its roadmap.

## The rules it enforces — grounded in the real 2022–2026 SEBI record

The engine ([`engine.js`](engine.js)) computes each verdict from the scenario inputs; the
citations and mechanics are accurate, not decorative:

1. **KYC / PMLA** — PMLA 2002 · SEBI KRA Regs 2011 · CKYC (CERSAI)
2. **Insider trading — trading window** — SEBI (PIT) Regs 2015 Reg 4 · **Circular 05-Aug-2022: system-driven PAN-level freeze** at exchange + depository during blackout; access logged in the **Structured Digital Database** (Reg 3(5), 8-yr retention)
3. **Suitability** — SEBI (Investment Advisers) Regs 2013 Reg 17
4. **Advertisement / finfluencer** — SEBI (Intermediaries) Regs amdt **29-Aug-2024** + circulars 22-Oct-2024 & 29-Jan-2025 (no unregistered advice, no return claims)
5. **Algo order tagging** — SEBI circular **04-Feb-2025**, exchange-assigned **Algo-ID**, mandatory **01-Apr-2026**
6. **Position / concentration limit** — SEBI F&O **MWPL** framework
7. **Research embargo** — SEBI (Research Analysts) Regs 2014 · information barrier

A decision is **BLOCK** if any hard rule fails, **REVIEW** if only a soft check trips,
else **CLEAR**.

---

## Why this wins the track

- **It reuses a battle-tested enforcement engine.** The rule-gate, explainability, and
  audit trail are adapted from a production multi-agent trading system (AERIS) whose
  whole job was enforcing discipline the operator wanted to break. That "enforce even
  against the operator" pattern *is* agentic compliance — retargeted from trader
  discipline to SEBI regulation.
- **It answers SEBI's stated fear of AI — opacity.** Every verdict shows its work: the
  rule, the evidence, the citation, the effective date, the fix.
- **RegWatch is the moat.** A compliance system that reads a circular and compiles a new
  enforceable rule with no code change is a genuinely novel, demoable capability.
- **It's judge-ready in 40 seconds** — the built-in demo mode narrates the whole story,
  and every number on screen is computed live.

## Views

Overview (₹ impact + live feed + blocks-by-rule) · Pre-Trade Clearance (the hero flow) ·
Surveillance (+ STR drafts) · Agent Fabric (the four agents + event flow) · RegWatch
(circular → compiled rule) · Rulebook (toggle to simulate policy) · Audit Log (exportable).
Dark/light theme toggle. Guided judge-demo auto-play.

## Architecture

```
 order / advice ─▶  ⚡ Clearance Agent ─▶ Rulebook (7 SEBI evaluators) ─▶ CLEAR / REVIEW / BLOCK
 trade tape     ─▶  ◈ Surveillance Agent ─▶ pattern flags + STR
 SEBI circular  ─▶  ❋ RegWatch Agent ─▶ compiled RuleSpec ─▶ (back into Clearance)
 every decision ─▶  ▤ Reporting Agent ─▶ immutable, 8-yr audit trail + filings
```

- `engine.js` — reference data, the SEBI rulebook, pure-function evaluators, agent fabric, RegWatch samples, report builders, demo script.
- `app.js` — the console UI, animated agent run, verdict rendering, demo driver, report modal, theme.
- `styles.css` — the visual system (dark + light).
- `serve.js` — dependency-free static server.

## Scope & honesty

A **hackathon prototype**, not a filing. The rulebook is a representative, demoable subset;
the position-limit and KYC checks use toy models over mock data to make the flow tangible;
the RegWatch compiler runs over curated sample circulars. A production build wires the same
architecture to real OMS feeds, a live KYC/KRA source, exchange position-limit and Algo-ID
APIs, and an LLM for open-vocabulary circular parsing. The *architecture* — pre-route gate +
explainable verdict + self-updating rulebook + immutable trail — is the load-bearing,
differentiated part, and it's real and running.

*Not affiliated with or endorsed by SEBI. Built for the GFF 2026 TechSprint.*
