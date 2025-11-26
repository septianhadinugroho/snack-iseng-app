import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();

// 1. Precache file aset (Wajib untuk PWA)
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// 2. [BARU] Event Listener: SAAT TERIMA PUSH DARI SERVER (BACKGROUND)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Notifikasi Baru', body: 'Anda memiliki pesan baru', url: '/' };
  }

  const options = {
    body: data.body,
    icon: '/pwa-192.png', 
    badge: '/pwa-192.png', 
    vibrate: [100, 50, 100], 
    // --- PERBAIKAN DI SINI ---
    // Gunakan timestamp agar Tag-nya unik setiap notifikasi.
    // Ini bikin notifikasi muncul semua (berjejer), gak cuma 1 yang terakhir.
    tag: `snack-push-${Date.now()}`, 
    // -------------------------
    data: {
      url: data.url || '/notifications' 
    },
    renotify: true // Ini opsional kalau tag-nya udah unik, tapi aman dibiarkan true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 3. Event Listener: Saat Notifikasi Diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); 

  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        const clientUrl = new URL(client.url);
        if (clientUrl.pathname === urlToOpen && 'focus' in client) {
          return client.focus(); 
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});