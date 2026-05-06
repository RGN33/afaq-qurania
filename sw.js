const cacheName = 'afaq-v2'; // غير الرقم ده (v2, v3..) كل ما تعمل تحديث كبير
const staticAssets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// مرحلة التثبيت: تخزين الملفات الأساسية
self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

// مرحلة التفعيل: مسح الكاش القديم
self.addEventListener('activate', e => {
  self.clients.claim();
});

// مرحلة جلب البيانات: (حاول تجيب من الكاش الأول، لو مفيش هات من النت)
self.addEventListener('fetch', async e => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached;
  }
}
