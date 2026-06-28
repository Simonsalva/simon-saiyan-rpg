// ============================================================
//  SIMÓN SAIYAN RPG — Service Worker (network-first)
//  Siempre busca la versión NUEVA primero. Nunca te deja
//  atascado en una versión vieja (ese fue el bug anterior).
//  Si no hay internet, usa lo último guardado.
// ============================================================

const CACHE = 'saiyan-v' + Date.now();

// Instalación: activa la versión nueva de inmediato, sin esperar.
self.addEventListener('install', function (e) {
  self.skipWaiting();
});

// Activación: borra TODOS los cachés viejos y toma control ya.
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Fetch: intenta la red primero (versión fresca). Si falla, usa caché.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) {
        c.put(e.request, copy);
      });
      return res;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
