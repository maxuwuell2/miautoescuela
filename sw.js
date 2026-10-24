// Service worker de Miautoescuela: guarda la app para abrirla sin conexión. Primero la red (para estar al día) y, si no hay,
// lo guardado. La versión cambia en cada construcción y borra lo viejo.
const CACHE = 'miau-20261024224903';
const BASE = ['./', 'index.html', 'app.js', 'efectos.js', 'css/base.css', 'css/iconos.css', 'css/app.css', 'vendor/fuentes/fuentes.css',
  'vendor/gsap/index.js', 'vendor/gsap/gsap-core.js', 'vendor/gsap/CSSPlugin.js', 'manifest.webmanifest', 'icono.svg',
  'peg/peg-animo.svg', 'peg/peg-asoma.svg', 'peg/peg-bien.svg', 'peg/peg-duda.svg', 'peg/peg-onsen.svg', 'peg/peg-sueno.svg', 'peg/peg-uy.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // «no-cache»: pregunta siempre al servidor si hay versión nueva (si no la hay, responde rápido con lo de siempre)
  e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then((r) => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
});
