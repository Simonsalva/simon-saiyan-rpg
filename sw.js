const CACHE = 'saiyan-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || '⚡ Saiyan RPG', {
      body: data.body || 'Es hora de entrenar',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'saiyan',
      requireInteraction: data.urgent || false,
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});

// Scheduled alarm check every minute
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_CHECK') {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const mins = h * 60 + m;
    const blocks = e.data.blocks || [];
    blocks.forEach(b => {
      if (mins === b.time) {
        self.registration.showNotification(`${b.icon} ${b.title}`, {
          body: b.sub,
          icon: '/icon-192.png',
          vibrate: [300, 100, 300, 100, 300],
          tag: 'block_' + b.id,
          requireInteraction: true,
        });
      }
      // Warn 2 min before end
      if (mins === b.end - 2 && b.end > 0) {
        self.registration.showNotification(`⏰ Terminando: ${b.title}`, {
          body: '2 minutos para pasar al siguiente bloque',
          icon: '/icon-192.png',
          vibrate: [100, 50, 100],
          tag: 'warn_' + b.id,
        });
      }
    });
    // 3PM alarm
    if (h === 13 && m === 0) {
      self.registration.showNotification('⚠️ ¡PREPÁRATE PARA SALIR!', {
        body: 'Salida obligatoria a las 3:00 PM exacto',
        icon: '/icon-192.png',
        vibrate: [500, 200, 500, 200, 500],
        tag: 'alarm_3pm',
        requireInteraction: true,
      });
    }
    if (h === 14 && m === 30) {
      self.registration.showNotification('🚨 ¡30 MINUTOS PARA SALIR!', {
        body: '¿Ya estás completamente listo?',
        icon: '/icon-192.png',
        vibrate: [500, 200, 500, 200, 500, 200, 500],
        tag: 'alarm_330pm',
        requireInteraction: true,
      });
    }
  }
});
