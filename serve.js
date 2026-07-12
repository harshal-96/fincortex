// Zero-dependency static server + OpenRouter LLM proxy.
// `npm start` → http://127.0.0.1:4600
// The OpenRouter key is read server-side from .env / env vars and never sent to the browser.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml" };

// --- minimal .env loader (no dependency) ---------------------------------
(function loadEnv() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const key = m[1];
      let val = m[2].replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch { /* no .env — fine, samples still work */ }
})();

const OPENROUTER_KEY = () => process.env.OPENROUTER_API_KEY || "";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

function readBody(req) {
  return new Promise((resolve) => {
    let data = ""; req.on("data", (c) => (data += c));
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); } });
  });
}
function json(res, code, obj) {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(obj));
}

// --- OpenRouter proxy ----------------------------------------------------
async function handleLLM(req, res) {
  const key = OPENROUTER_KEY();
  if (!key) return json(res, 200, { error: "no_key", message: "OPENROUTER_API_KEY not set — RegWatch is running in offline (deterministic) mode." });
  const body = await readBody(req);
  const payload = {
    model: body.model || DEFAULT_MODEL,
    messages: body.messages || [],
    temperature: body.temperature ?? 0,
    max_tokens: body.max_tokens ?? 700,
  };
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:4600",
        "X-Title": "FinCortex — Agentic Compliance",
      },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!r.ok) return json(res, 200, { error: "upstream", status: r.status, message: data.error?.message || text.slice(0, 300) });
    return json(res, 200, data);
  } catch (e) {
    return json(res, 200, { error: "network", message: String(e && e.message || e) });
  }
}

function start(port) {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/api/llm/status") return json(res, 200, { configured: !!OPENROUTER_KEY(), model: DEFAULT_MODEL });
    if (req.url === "/api/llm" && req.method === "POST") return handleLLM(req, res);

    let url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/") url = "/index.html";
    else if (url.endsWith("/")) url += "index.html";
    const file = path.join(ROOT, path.normalize(url));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") { console.log(`port ${port} busy, trying ${port + 1}…`); start(port + 1); }
    else throw e;
  });
  server.listen(port, "127.0.0.1", () => {
    const mode = OPENROUTER_KEY() ? `LLM proxy ON · model ${DEFAULT_MODEL}` : "offline mode (no OPENROUTER_API_KEY)";
    console.log(`\n  FinCortex console → http://127.0.0.1:${port}\n  RegWatch: ${mode}\n  Ctrl+C to stop.\n`);
  });
}
start(Number(process.argv[2]) || 4600);
