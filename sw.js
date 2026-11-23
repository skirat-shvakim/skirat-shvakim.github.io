/* בורסה בפיג'מה — service worker: fresh edition first, saved copy when the network is slow or offline. */
const V = 'bp-v1';
const SHELL = ['/', '/money.js', '/glossary.json', '/apple-touch-icon.png?v=2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
  await self.clients.claim();
})()));

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), ms));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);

  // Fonts: cache first (they never change).
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
      if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    })));
    return;
  }
  if (u.origin !== location.origin) return; // analytics etc. untouched

  // Site files: always try the network first (today's edition), fall back to the saved copy.
  e.respondWith((async () => {
    const key = r.mode === 'navigate' ? new Request(u.origin + u.pathname) : r;
    const net = fetch(u.href, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(key, cp)); }
      return res;
    });
    try {
      return await Promise.race([net, timeout(6000)]);
    } catch (err) {
      const hit = await caches.match(key, { ignoreSearch: true });
      return hit || net;
    }
  })());
});
