// Proper Look-out offline support. Pages: network first (so updates arrive), cached copy when offline.
const CACHE = 'plo-49bf81387cdc';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const PICS = ["./pics/fitz-1.webp","./pics/ever-1.webp","./pics/ever-2.webp","./pics/mccain-1.webp","./pics/solong-1.webp","./pics/doria-1.webp","./pics/ingstad-1.webp","./pics/ingstad-3.webp","./pics/florida-1.webp","./pics/busan-1.webp"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => Promise.all(PICS.map(u => c.add(u).catch(() => null))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('plo-') === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    const home = u.pathname.endsWith('/') || u.pathname.endsWith('/index.html');
    e.respondWith(fetch(r).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(home ? './index.html' : r, copy)); } return res; })
      .catch(() => (home ? Promise.resolve(null) : caches.match(r, {ignoreSearch: true})).then(m => m || caches.match('./index.html')).then(m => m || caches.match('./'))));
    return;
  }
  if (u.origin === location.origin || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })));
  }
});
