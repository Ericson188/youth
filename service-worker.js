self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('print-cache-v1').then((cache) => {
        return cache.addAll([
          './',
          './index.html',
          './manifest.json',
          './icons/youth.jpg',
          './icons/youth.jpg'
        ]);
      })
    );
    console.log('✅ Service Worker installed');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  });
  