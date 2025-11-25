// Fungsi ini dipanggil saat tombol Simpan/Hapus diklik
export const sendNotification = (title, message, type = 'info', url = '/notifications') => {
    // Trigger Notifikasi Browser Lokal (agar yang ngeklik langsung dapet feedback)
    if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                body: message,
                icon: '/pwa-192.png',
                badge: '/pwa-192.png',
                vibrate: [200, 100, 200],
                tag: `snack-${Date.now()}`, // <--- RAHASIA STACKING (Biar gak nimpa)
                data: { url },
                renotify: true,
            });
        });
    }
};