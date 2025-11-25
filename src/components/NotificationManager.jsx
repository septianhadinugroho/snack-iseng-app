import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NotificationManager() {
  const lastLogIdRef = useRef(null);
  const navigate = useNavigate();

  const showBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(title, { // Hapus "Snack Iseng:" biar judul bersih
        body: body,
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        tag: `snack-${Date.now()}`,
        vibrate: [200, 100, 200],
      });
      
      notif.onclick = () => {
        window.focus();
        notif.close();
        navigate('/notifications');
      };
    }
  };

  // Helper untuk menentukan Judul berdasarkan Action Log
  const getTitle = (type, action) => {
    const act = action.toLowerCase();
    if (type === 'ORDER') {
        if (act.includes('hapus')) return 'Order Dihapus 🗑️';
        if (act.includes('edit')) return 'Order Diupdate ✏️';
        return 'Order Baru! 💰';
    }
    if (type === 'EXPENSE') {
        if (act.includes('hapus')) return 'Belanja Dihapus 🗑️';
        if (act.includes('edit')) return 'Belanja Diupdate ✏️';
        return 'Belanja Stok Baru 🛒';
    }
    return 'Info Sistem 🔔';
  };

  const checkNewNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const logs = res.data;

      if (logs.length > 0) {
        const latestLog = logs[0];

        if (lastLogIdRef.current === null) {
          lastLogIdRef.current = latestLog.id;
          return;
        }

        if (latestLog.id > lastLogIdRef.current) {
          const newItems = logs.filter(l => l.id > lastLogIdRef.current);
          
          // Loop notifikasi baru
          newItems.reverse().forEach(item => {
             // Karena item.action dari backend sekarang sudah detail:
             // "Order #123: Asep - Balado (2) - Total Rp 10.000"
             // Kita bisa pakai judul yang simpel saja.
             
             let title = 'Info Sistem 🔔';
             if(item.type === 'ORDER') title = 'Pesanan Baru! 💰';
             if(item.type === 'EXPENSE') title = 'Belanja Stok 🛒';
             if(item.action.toLowerCase().includes('hapus')) title = 'Data Dihapus 🗑️';
             if(item.action.toLowerCase().includes('edit')) title = 'Data Diupdate ✏️';

             showBrowserNotification(title, item.action); // Body-nya sudah detail dari backend
          });

          lastLogIdRef.current = latestLog.id;
        }
      }
    } catch (error) { /* Silent fail */ }
  };

  useEffect(() => {
    // Interval polling 5 detik
    const interval = setInterval(checkNewNotifications, 5000);
    checkNewNotifications();
    return () => clearInterval(interval);
  }, []);

  return null;
}