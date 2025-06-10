const filesCache = 'meu-cache-v1';
const file = "src/assets/scweb/ui.scweb"; // muda isso aqui

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(filesCache).then(cache => {
      return cache.addAll([file]);
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.endsWith(".scweb")) {
    event.respondWith(
      caches.match(event.request.url).then(response => {
        return response || fetch(file).then(fetchResp => {
          return caches.open(filesCache).then(cache => {
            cache.put(event.request.url, fetchResp.clone());
            return fetchResp;
          });
        });
      })
    );
  }
});