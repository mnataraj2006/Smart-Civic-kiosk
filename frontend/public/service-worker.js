/**
 * service-worker.js — Smart Civic Kiosk Service Worker
 *
 * Strategy:
 *   - App shell (HTML/CSS/JS): Cache-First
 *   - API calls (/api/*): Network-First, fallback to cache if offline
 *   - Static assets: Stale-While-Revalidate
 *
 * This enables the Kiosk UI to load even without internet.
 */

const CACHE_NAME    = 'kiosk-shell-v3';
const API_CACHE     = 'kiosk-api-v1';
const OFFLINE_PAGE  = '/offline.html';

// App shell assets to pre-cache on install
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
];

// ── Install: pre-cache the shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      // Use addAll with error tolerance — don't fail install if one asset 404s
      return Promise.allSettled(SHELL_ASSETS.map(url => cache.add(url)));
    })
  );
});

// ── Activate: clear old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== API_CACHE)
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, etc. go directly to network)
  if (request.method !== 'GET') return;

  // Skip chrome-extension / browser internals
  if (!url.protocol.startsWith('http')) return;

  // ── API calls: Network-First ─────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          // Cache successful GET API responses for offline fallback
          if (networkRes.ok) {
            const copy = networkRes.clone();
            caches.open(API_CACHE).then(c => c.put(request, copy));
          }
          return networkRes;
        })
        .catch(() =>
          caches.match(request).then(cached =>
            cached || new Response(
              JSON.stringify({ success: false, error: 'You are offline. Cached data unavailable.', offline: true }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          )
        )
    );
    return;
  }

  // ── App shell / HTML: Cache-First, fallback to network ───────────────────
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request)
          .then(networkRes => {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, copy));
            return networkRes;
          })
          .catch(() => caches.match('/index.html'))
      )
    );
    return;
  }

  // ── Static assets: Stale-While-Revalidate ────────────────────────────────
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((networkRes) => {
            if (networkRes.ok) cache.put(request, networkRes.clone());
            return networkRes;
          })
          .catch(() => cached);   // offline → use cached
        return cached || networkFetch;
      })
    )
  );
});

// ── Background sync message handling ─────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
