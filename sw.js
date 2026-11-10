// Service worker de Miautoescuela: guarda la app para abrirla al instante y sin conexión. La versión cambia en cada
// construcción: la nueva se descarga entera (sin pasar por la caché del navegador) y borra lo viejo.
const CACHE = 'miau-20261110230712';
const CSS = ['sistema', 'marco', 'secciones', 'sesion', 'escena', 'efectos', 'tu', 'chuleta', 'peligro', 'bienvenida'].map((c) => `css/${c}.css`);
const FUENTES = ['barlow-latin-400', 'barlow-latin-500', 'barlow-latin-600', 'barlow-latin-700', 'barlow-condensed-latin-600', 'barlow-condensed-latin-700', 'barlow-condensed-latin-800']
  .map((f) => `vendor/fuentes/barlow/${f}-normal.woff2`);
const BASE = ['./', 'index.html', 'app.js', ...CSS, 'vendor/fuentes/barlow.css', ...FUENTES,
  'vendor/gsap/index.js', 'vendor/gsap/gsap-core.js', 'vendor/gsap/CSSPlugin.js', 'manifest.webmanifest', 'icono.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero lo guardado (arranca al momento aunque la red vaya lenta o no haya) y, si no está, la red (y se guarda).
// Las versiones nuevas llegan solas: cada vez que abres la app, el navegador mira si sw.js ha cambiado; si sí, esta
// versión nueva se instala con todo lo suyo, toma el control y la página se recarga (lo hace index.html).
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const navegacion = e.request.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const guardado = await c.match(navegacion ? 'index.html' : e.request, { ignoreSearch: navegacion });
    if (guardado) return guardado;
    try {
      const r = await fetch(e.request);
      if (r.ok && !navegacion) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      return (await c.match('index.html')) || Response.error();
    }
  }));
});
