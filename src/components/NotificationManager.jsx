import { useEffect } from 'react';
import api from '../api';

// Helper Wajib: Mengubah String Base64 dari Server menjadi Uint8Array agar bisa dibaca Browser
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationManager() {
  
  useEffect(() => {
    const subscribeUserToPush = async () => {
      // 1. Cek apakah browser mendukung Service Worker & Push Manager
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log("Push Notif tidak didukung di browser ini.");
        return;
      }

      try {
        // 2. Tunggu Service Worker siap
        const registration = await navigator.serviceWorker.ready;

        // 3. Cek apakah user sudah subscribe sebelumnya?
        let subscription = await registration.pushManager.getSubscription();

        // Kalau belum subscribe, kita buat subscription baru
        if (!subscription) {
          // Ambil VAPID Public Key dari Backend kita
          const { data } = await api.get('/vapid-public-key');
          const publicVapidKey = data.publicKey;

          if (!publicVapidKey) return;

          // Lakukan proses langganan ke Server Browser (Chrome/FCM)
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        // 4. Kirim data subscription (endpoint & keys) ke Backend kita untuk disimpan di DB
        await api.post('/subscribe', subscription);
        console.log("Berhasil terhubung ke Push Notification Server!");

      } catch (error) {
        console.error("Gagal Subscribe Push Notification:", error);
      }
    };

    // Jalankan logika di atas HANYA JIKA user sudah login & izin notifikasi sudah 'granted'
    const token = localStorage.getItem('token');
    if (token) {
        if (Notification.permission === 'granted') {
            subscribeUserToPush();
        } else if (Notification.permission !== 'denied') {
            // Minta izin kalau belum pernah ditanya
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    subscribeUserToPush();
                }
            });
        }
    }
  }, []);

  return null; // Komponen ini tidak merender UI apa-apa
}