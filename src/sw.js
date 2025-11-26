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
    
    // --- PERBAIKAN 1: AGAR NOTIFIKASI TIDAK MENUMPUK ---
    // Gunakan timestamp agar Tag-nya unik setiap notifikasi.
    // Browser akan menganggap ini notifikasi baru, bukan update dari yang lama.
    tag: `snack-push-${Date.now()}`, 

    // --- PERBAIKAN 2: AGAR KLIK MASUK KE HALAMAN NOTIFIKASI ---
    data: {
      url: '/notifications' // Paksa semua notifikasi lari ke halaman ini
    },
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 3. Event Listener: Saat Notifikasi Diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Tutup notifikasi di tray

  // Ambil URL dari data yang kita set di atas
  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Cek apakah tab aplikasi sudah terbuka?
      for (let client of windowClients) {
        const clientUrl = new URL(client.url);
        // Cek apakah tab tersebut sedang membuka URL yang dituju
        if (clientUrl.pathname === urlToOpen && 'focus' in client) {
          return client.focus(); // Fokus ke tab yang sudah ada
        }
      }
      // Kalau tidak ada tab yang cocok, buka window/tab baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});