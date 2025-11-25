import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Expenses from './pages/Expenses';
import Products from './pages/Products';
import QrisPage from './pages/QrisPage';
import BottomNav from './components/BottomNav';
import NotificationManager from './components/NotificationManager';
import Notifications from './pages/Notifications';

const Protected = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  // Layout Container HP
  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-800 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <NotificationManager />
      {children}
      <BottomNav />
    </div>
  );
};

function App() {
  // Request Izin Notifikasi saat app dibuka pertama kali
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Menu Utama */}
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/orders" element={<Protected><Orders /></Protected>} />
      <Route path="/expenses" element={<Protected><Expenses /></Protected>} />
      <Route path="/products" element={<Protected><Products /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
      
      {/* Halaman QRIS (Tanpa BottomNav biar Fullscreen aesthetic, tapi tetep Protected) */}
      <Route path="/qris" element={
        <Protected>
           {/* Kita override style Protected di page QRIS sendiri */}
           <QrisPage />
        </Protected>
      } />
    </Routes>
  );
}

export default App;