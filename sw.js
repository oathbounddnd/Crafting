// --- Forgewright PWA Service Worker ---
const CACHE_NAME = 'forgewright-v1';
const APP_SHELL = [
  "/",
  "/index.html",
  "/Background.png",
  "/Impact_Hit_2_Flash_1_COLOR_1_1200x1200.webm",
  "/Explosion_Particles_1_Flash_Shattert_COLOR_4_1200x1200.webm",
  "/Enchant1.webm",
  "/Enchant2.webm",
  "/NecromancyRuneLoop_01_Regular_Green_400x400.webm",
  "/EnchantmentRuneLoop_01_Regular_Pink_400x400.webm",
  "/EvocationRuneLoop_01_Regular_Red_400x400.webm",
  "/DivinationRuneLoop_01_Regular_Yellow_400x400.webm",
  "/AbjurationRuneLoop_01_Regular_Blue_400x400.webm",
  "/ConjurationRuneLoop_01_Regular_Purple_400x400.webm",
  "/TransmutationRuneLoop_01_Regular_Blue_400x400.webm",
  "/IllusionRuneLoop_01_Regular_Grey_400x400.webm",
  "/Audio Background.ogg",
  "/Audio Effect (1).mp3",
  "/Audio Effect (2).mp3",
  "/Audio Effect (3).mp3",
  "/Audio Effect (4).mp3",
  "/Enchant Audio.ogg"
];

// Precache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

// Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // HTML navigation
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put('/index.html', copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first
  if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.webm|\.mp3|\.ogg|\.mp4|\.css|\.js|\.woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  // Default
  event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
