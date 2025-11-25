import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();

// 1. Precache file aset (Wajib untuk PWA)
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// 2. Event Listener: Saat Notifikasi Diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Tutup notifikasi di tray

  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Cek apakah tab aplikasi sudah terbuka?
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus(); // Kalau ada, fokuskan ke tab itu
        }
      }
      // Kalau tidak ada, buka window/tab baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});