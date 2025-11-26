import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();

// 1. Precache file aset (Wajib untuk PWA)
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// 2. [BARU] Event Listener: SAAT TERIMA PUSH DARI SERVER (BACKGROUND)
// Ini akan jalan walau aplikasi ditutup/di-kill dari recent apps
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Notifikasi Baru', body: 'Anda memiliki pesan baru', url: '/' };
  }

  const options = {
    body: data.body,
    icon: '/pwa-192.png', // Pastikan file ini ada di folder public
    badge: '/pwa-192.png', // Icon kecil monochrome di status bar Android
    vibrate: [100, 50, 100], // Pola getar
    tag: 'snack-push', // Tag biar tidak menumpuk terlalu banyak
    data: {
      url: data.url || '/notifications' // URL tujuan saat diklik
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 3. Event Listener: Saat Notifikasi Diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Tutup notifikasi di tray

  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Cek apakah tab aplikasi sudah terbuka?
      for (let client of windowClients) {
        // Cek base URL agar lebih akurat
        const clientUrl = new URL(client.url);
        if (clientUrl.pathname === urlToOpen && 'focus' in client) {
          return client.focus(); // Kalau ada tab yg pas, fokuskan ke situ
        }
      }
      // Kalau tidak ada atau URL beda, buka window/tab baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});