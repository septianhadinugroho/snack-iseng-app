import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-xs shadow-2xl scale-100 animate-pop-in">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full mb-4 ${type === 'danger' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition">
              Batal
            </button>
            <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'}`}>
              Ya, Lanjut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}