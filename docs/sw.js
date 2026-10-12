/* Rutin Zinciri: uygulamanın bağlantı yokken de açılmasını sağlar. Verilere dokunmaz. */
const CACHE = "rutin-zinciri-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function remember(req, res) {
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.includes("/api/")) return;   // senkron istekleri hep doğrudan gider
    /* Önce ağdan al ki güncellemeler gelsin; ağ yoksa ya da yavaşsa saklanan kopyayı aç */
    e.respondWith((async () => {
      const cached = await caches.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then((res) => (res.ok ? remember(req, res) : res));
      if (!cached) return fresh.catch(() => caches.match("index.html"));
      const slow = new Promise((resolve) => setTimeout(() => resolve(cached), 2500));
      return Promise.race([fresh.catch(() => cached), slow]);
    })());
    return;
  }

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => remember(req, res))));
  }
});
