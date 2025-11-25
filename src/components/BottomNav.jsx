import { Home, Package, ShoppingBag, DollarSign, QrCode } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const activeClass = "text-primary font-bold text-orange-600"; // Tambah warna biar makin nyala pas aktif
  const inactiveClass = "text-gray-400 font-medium hover:text-gray-600";

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className={`flex flex-col items-center justify-center w-full transition-colors ${location.pathname === to ? activeClass : inactiveClass}`}>
      <Icon size={22} strokeWidth={location.pathname === to ? 2.5 : 2} />
      <span className="text-[10px] mt-1">{label}</span>
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 pb-safe flex justify-between px-2 items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto">
      {/* 1. Home */}
      <NavItem to="/" icon={Home} label="Home" />
      
      {/* 2. Stok (Gantiin Logout) */}
      <NavItem to="/products" icon={Package} label="Product" />
      
      {/* 3. Tombol QRIS (Tengah & Menonjol) */}
      <div className="relative -top-6 mx-2">
        <Link to="/qris" className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-orange-500 to-red-600 text-white rounded-full shadow-lg shadow-orange-200 ring-4 ring-gray-50 active:scale-95 transition-transform">
          <QrCode size={26} />
        </Link>
      </div>

      {/* 4. Pesanan */}
      <NavItem to="/orders" icon={ShoppingBag} label="Order" />

      {/* 5. Belanja */}
      <NavItem to="/expenses" icon={DollarSign} label="Beli" />
    </div>
  );
}