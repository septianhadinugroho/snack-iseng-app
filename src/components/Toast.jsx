import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, Bell } from 'lucide-react';

export default function Toast({ show, message, type = 'success', onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hilang otomatis dalam 3 detik
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
    notification: <Bell size={20} />
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down w-[90%] max-w-sm">
      <div className={`${styles[type] || 'bg-gray-800 text-white'} px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3`}>
        {icons[type]}
        <p className="font-bold text-sm">{message}</p>
      </div>
    </div>
  );
}