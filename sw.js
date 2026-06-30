// ============================================================
//  SIMÓN SAIYAN RPG — Service Worker (network-first + push)
//  Siempre busca la versión NUEVA primero. Nunca te deja
//  atascado en una versión vieja. Si no hay internet, usa caché.
//  Además: recibe notificaciones push del servidor.
// ============================================================

const CACHE = 'saiyan-v' + Date.now();

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

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

// ============================================================
//  PUSH: recibe notificaciones del servidor (app cerrada)
// ============================================================
self.addEventListener('push', function (e) {
  var data = { title: '⚡ THE SYSTEM', body: 'Tienes una misión.' };
  try {
    if (e.data) data = e.data.json();
  } catch (err) {
    try { data.body = e.data.text(); } catch (e2) {}
  }
  var options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'saiyan',
    renotify: true,
    vibrate: [120, 60, 120],
    requireInteraction: !!data.danger,
    data: { url: data.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(data.title || '⚡ THE SYSTEM', options));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
