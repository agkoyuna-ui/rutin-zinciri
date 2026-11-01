"use strict";
/*
 * Rutin Zinciri: ev ağı senkron programı
 *
 * Bu bilgisayarda çalışır, verileri pc/veri/rutin-data.json dosyasında tutar.
 * Uygulamayı http://localhost:8765 adresinde sunar; telefon aynı Wi-Fi'deyken
 * bu programa bağlanıp eşitlenir. Ek paket gerektirmez, sadece Node.js.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const dgram = require("dgram");
const crypto = require("crypto");
const { exec } = require("child_process");

const PORT = Number(process.env.RUTIN_PORT) || 8765;
const HOST = process.env.RUTIN_HOST || "0.0.0.0";
const PAGES_ORIGIN = process.env.RUTIN_SITE_ORIGIN || "https://agkoyuna-ui.github.io";
const PAGES_URL = PAGES_ORIGIN + "/rutin-zinciri/";
const APP_DIR = path.join(__dirname, "..", "docs");
const DATA_DIR = process.env.RUTIN_VERI || path.join(__dirname, "veri");
const DATA_FILE = path.join(DATA_DIR, "rutin-data.json");
const BACKUP_FILE = path.join(DATA_DIR, "rutin-data.yedek.json");
const KEY_FILE = path.join(DATA_DIR, "kod.txt");

const MAX_BODY = 512 * 1024;   // tek istekte en fazla 512 KB
const MAX_DAYS = 3000;         // dosyada en fazla gün kaydı
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const FIELD_RE = /^[a-z0-9_]{1,32}$/;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

/* ---------- veri ---------- */
/* resetAt: kayıtların silindiği an; bundan eski düzenlemeler hiçbir cihazdan geri kabul edilmez */
let data = { days: {}, cfg: null, cfgT: 0, resetAt: 0 };
let saveTimer = null;

function plain(x) { return x && typeof x === "object" && !Array.isArray(x) ? x : {}; }
function okAmount(n) { return typeof n === "number" && isFinite(n) && n >= 0 && n < 100000; }
function okStamp(t) { return typeof t === "number" && isFinite(t) && t >= 0; }

function cleanDay(e) {
  const out = { v: {}, ft: {}, t: 0 }, v = plain(e && e.v), ft = plain(e && e.ft);
  for (const f of Object.keys(v)) {
    if (!FIELD_RE.test(f) || !okAmount(v[f])) continue;
    out.v[f] = v[f];
    out.ft[f] = okStamp(ft[f]) ? ft[f] : 0;
    if (out.ft[f] > out.t) out.t = out.ft[f];
  }
  return out;
}

function loadData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  let raw = null;
  try { raw = fs.readFileSync(DATA_FILE, "utf8"); } catch (e) { return; }
  let d = null;
  try { d = JSON.parse(raw); } catch (e) {
    /* bozuk dosyayı silme, kenara al ve yedekten devam et */
    try { fs.renameSync(DATA_FILE, path.join(DATA_DIR, "rutin-data.bozuk-" + Date.now() + ".json")); } catch (e2) {}
    try { d = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8")); } catch (e3) { d = null; }
  }
  if (!d || typeof d !== "object") return;
  const days = plain(d.days);
  for (const date of Object.keys(days)) if (DATE_RE.test(date)) data.days[date] = cleanDay(days[date]);
  if (d.cfg && typeof d.cfg === "object" && !Array.isArray(d.cfg)) data.cfg = d.cfg;
  data.cfgT = okStamp(d.cfgT) ? d.cfgT : 0;
  data.resetAt = okStamp(d.resetAt) ? d.resetAt : 0;
  try { fs.copyFileSync(DATA_FILE, BACKUP_FILE); } catch (e) {}
}

function saveNow() {
  clearTimeout(saveTimer); saveTimer = null;
  const sorted = {};
  for (const date of Object.keys(data.days).sort()) sorted[date] = data.days[date];
  const json = JSON.stringify({ days: sorted, cfg: data.cfg, cfgT: data.cfgT, resetAt: data.resetAt });
  const tmp = DATA_FILE + ".tmp";
  try {
    fs.writeFileSync(tmp, json);
    fs.renameSync(tmp, DATA_FILE);
  } catch (e) {
    /* dosya kısa süreliğine kilitliyse (örneğin OneDrive) doğrudan yaz */
    try { fs.writeFileSync(DATA_FILE, json); } catch (e2) { console.error("Veri kaydedilemedi:", e2.message); }
  }
}
function saveSoon() { if (!saveTimer) saveTimer = setTimeout(saveNow, 150); }

/* Her madde için en son düzenleme geçerli olur; iki cihazın aynı güne yazdıkları birleşir. */
function mergeIncoming(body) {
  let changed = 0;
  const days = plain(body.days);
  for (const date of Object.keys(days)) {
    if (!DATE_RE.test(date)) continue;
    const inc = plain(days[date]), v = plain(inc.v), ft = plain(inc.ft);
    let cur = data.days[date];
    for (const f of Object.keys(v)) {
      if (!FIELD_RE.test(f) || !okAmount(v[f])) continue;
      const t = okStamp(ft[f]) ? ft[f] : 0;
      if (t < data.resetAt) continue;
      if (!cur) {
        if (Object.keys(data.days).length >= MAX_DAYS) break;
        cur = data.days[date] = { v: {}, ft: {}, t: 0 };
      }
      if (!(f in cur.v) || t > (cur.ft[f] || 0)) {
        cur.v[f] = v[f]; cur.ft[f] = t;
        if (t > cur.t) cur.t = t;
        changed++;
      }
    }
  }
  if (body.cfg && typeof body.cfg === "object" && !Array.isArray(body.cfg)) {
    const cfgT = okStamp(body.cfgT) ? body.cfgT : 0;
    let size = Infinity;
    try { size = JSON.stringify(body.cfg).length; } catch (e) {}
    if (cfgT > data.cfgT && cfgT >= data.resetAt && size < 20000) { data.cfg = body.cfg; data.cfgT = cfgT; changed++; }
  }
  if (changed) saveSoon();
  return changed;
}

/* ---------- eşleştirme kodu ---------- */
function normKey(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function loadKey() {
  try {
    const k = normKey(fs.readFileSync(KEY_FILE, "utf8"));
    if (k.length >= 8) return k;
  } catch (e) {}
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";   // karışan harfler (i, l, o, 0, 1) yok
  let k = "";
  for (let i = 0; i < 10; i++) k += abc[crypto.randomInt(abc.length)];
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(KEY_FILE, k.slice(0, 5) + "-" + k.slice(5) + "\n");
  return k;
}
function keyMatches(given) {
  const a = Buffer.from(normKey(given)), b = Buffer.from(KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function prettyKey() { return KEY.slice(0, 5) + "-" + KEY.slice(5); }

/* ---------- ağ ---------- */
function isPrivate(ip) {
  return /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
}
function lanIps() {
  const out = [], ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const a of ifs[name] || []) {
      const v4 = a.family === "IPv4" || a.family === 4;
      if (v4 && !a.internal && isPrivate(a.address)) out.push(a.address);
    }
  }
  return out;
}
/* İnternete çıkan ağ kartının adresi; paket göndermez, sadece yolu sorar. */
function primaryIp() {
  return new Promise((resolve) => {
    let done = false;
    const s = dgram.createSocket("udp4");
    const finish = (ip) => { if (done) return; done = true; try { s.close(); } catch (e) {} resolve(ip); };
    s.on("error", () => finish(null));
    try {
      s.connect(53, "8.8.8.8", () => { let a = null; try { a = s.address().address; } catch (e) {} finish(a); });
    } catch (e) { finish(null); }
    setTimeout(() => finish(null), 500);
  });
}
async function homeIp() {
  const p = await primaryIp(), all = lanIps();
  if (p && isPrivate(p)) return p;
  return all.length ? all[0] : null;
}
function isLoopback(addr) { return addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1"; }
const LOOP_HOSTS = ["localhost:" + PORT, "127.0.0.1:" + PORT, "[::1]:" + PORT];
function hostAllowed(host) {
  /* Tanımadığımız bir alan adıyla gelen isteği kabul etme (DNS yönlendirme saldırılarına karşı) */
  host = String(host || "").toLowerCase();
  if (LOOP_HOSTS.includes(host)) return true;
  if (lanIps().some((ip) => host === ip + ":" + PORT)) return true;
  const name = os.hostname().toLowerCase();
  return host === name + ":" + PORT || host === name + ".local:" + PORT;
}

/* ---------- http ---------- */
function send(res, code, body, headers) {
  const h = Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }, headers || {});
  res.writeHead(code, h);
  res.end(body === undefined ? undefined : JSON.stringify(body));
}
function corsFor(req) {
  if (req.headers.origin !== PAGES_ORIGIN) return {};
  return {
    "Access-Control-Allow-Origin": PAGES_ORIGIN,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Rutin-Key",
    "Access-Control-Allow-Private-Network": "true",
    "Access-Control-Max-Age": "86400"
  };
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error("size"), { code: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function serveStatic(req, res, pathname) {
  const name = pathname === "/" ? "index.html" : pathname.slice(1);
  if (!/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(name)) return send(res, 404, { error: "notfound" });
  fs.readFile(path.join(APP_DIR, name), (err, buf) => {
    if (err) return send(res, 404, { error: "notfound" });
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(name).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff"
    });
    res.end(req.method === "HEAD" ? undefined : buf);
  });
}

async function handle(req, res) {
  const host = req.headers.host;
  if (!hostAllowed(host)) return send(res, 403, { error: "host", message: "Bu adresle bağlanılamaz." });
  const url = new URL(req.url, "http://" + host);
  const pathname = url.pathname;
  const cors = corsFor(req);
  const origin = req.headers.origin;
  const originOk = !origin || origin === PAGES_ORIGIN || origin === "http://" + String(host).toLowerCase();

  if (!pathname.startsWith("/api/")) {
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "method" });
    return serveStatic(req, res, pathname);
  }
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  if (!originOk) return send(res, 403, { error: "origin", message: "Bu siteden bağlanılamaz." });

  if (pathname === "/api/ping") return send(res, 200, { ok: true, app: "rutin-zinciri" }, cors);

  if (pathname === "/api/pair") {
    /* Kodu sadece bu bilgisayarda açılan uygulamaya ver */
    const site = req.headers["sec-fetch-site"];
    const local = isLoopback(req.socket.remoteAddress) && LOOP_HOSTS.includes(String(host).toLowerCase()) && (!site || site === "same-origin" || site === "none");
    if (!local || req.method !== "GET") return send(res, 403, { error: "local", message: "Sadece bu bilgisayardan görülebilir." });
    const ip = await homeIp();
    const addr = ip ? ip + ":" + PORT : null;
    return send(res, 200, {
      ok: true, key: prettyKey(), addr: addr,
      link: addr ? PAGES_URL + "#pc=" + addr + "&kod=" + prettyKey() : null,
      lanLink: addr ? "http://" + addr + "/#kod=" + prettyKey() : null
    });
  }

  if (pathname === "/api/sync") {
    if (!keyMatches(req.headers["x-rutin-key"])) {
      await new Promise((r) => setTimeout(r, 300));   // tahmin denemelerini yavaşlat
      return send(res, 401, { error: "key", message: "Kod yanlış." }, cors);
    }
    if (req.method === "POST") {
      let body = null;
      try { body = JSON.parse(await readBody(req)); }
      catch (e) { return send(res, e && e.code === 413 ? 413 : 400, { error: "body", message: "Geçersiz veri." }, cors); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return send(res, 400, { error: "body", message: "Geçersiz veri." }, cors);
      mergeIncoming(body);
    } else if (req.method !== "GET") {
      return send(res, 405, { error: "method" }, cors);
    }
    return send(res, 200, { ok: true, data: data, now: Date.now() }, cors);
  }

  return send(res, 404, { error: "notfound" }, cors);
}

/* ---------- başlat ---------- */
const OPEN = process.argv.includes("--ac");
function openBrowser() { exec('start "" "http://localhost:' + PORT + '/"'); }

loadData();
const KEY = loadKey();

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error("Hata:", e && e.message);
    if (!res.headersSent) send(res, 500, { error: "server", message: "Programda bir hata oluştu." });
    else res.end();
  });
});
server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.log("Rutin Zinciri zaten çalışıyor.");
    if (OPEN) openBrowser();
    setTimeout(() => process.exit(0), 300);
  } else {
    console.error("Program başlatılamadı:", e.message);
    process.exit(1);
  }
});
server.listen(PORT, HOST, async () => {
  const ip = await homeIp();
  console.log("");
  console.log("  Rutin Zinciri çalışıyor.");
  console.log("");
  console.log("  Bu bilgisayarda : http://localhost:" + PORT);
  if (ip) console.log("  Ev ağındaki adres: " + ip + ":" + PORT);
  console.log("  Telefonu bağlamak için uygulamada Ayarlar > Telefonu bağla bölümüne bak.");
  console.log("");
  console.log("  Bu pencere açık kaldıkça telefon eşitlenebilir. Kapatmak için pencereyi kapat.");
  console.log("");
  if (OPEN) openBrowser();
});

function shutdown() { if (saveTimer) saveNow(); process.exit(0); }
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGHUP", shutdown);
process.on("exit", () => { if (saveTimer) saveNow(); });
