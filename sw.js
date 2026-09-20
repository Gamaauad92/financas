/* guarda as telas do aplicativo para abrir mesmo sem internet.
   Os dados NÃO passam por aqui: login e OneDrive vão sempre direto à rede. */
const CACHE = "financas-v1";
const ARQS = ["./", "./index.html", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png", "./icone-maskable-512.png"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS)).then(()=> self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(()=> self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const u = new URL(e.request.url);
  if(e.request.method !== "GET" || u.origin !== location.origin) return;
  const pagina = e.request.mode === "navigate";
  // a página vem da rede quando possível (pega atualizações); sem rede, do cache
  e.respondWith(
    fetch(e.request).then(r=>{
      if(r.ok){ const c = r.clone(); caches.open(CACHE).then(k => k.put(pagina ? "./index.html" : e.request, c)); }
      return r;
    }).catch(()=> caches.match(pagina ? "./index.html" : e.request).then(r => r || caches.match("./")))
  );
});
