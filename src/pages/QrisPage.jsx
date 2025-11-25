import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QrisPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-600 flex flex-col items-center justify-center p-6 text-white relative">
      <button onClick={() => navigate(-1)} className="absolute top-10 left-6 bg-white/20 p-3 rounded-full backdrop-blur-sm z-50">
          <ArrowLeft size={24} />
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-2xl text-center w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">SCAN QRIS</h2>
        <p className="text-gray-500 mb-6 text-sm">Pembayaran Snack Iseng</p>
        
        <div className="bg-gray-100 border-1 border-dashed border-gray-300 rounded-xl aspect-square flex items-center justify-center overflow-hidden mb-6 relative">
             {/* Ganti src ini dengan file QRIS aslimu di folder public */}
             <img src="/qris.png" alt="QRIS" className="w-full h-full object-cover" />
             {/* <p className="text-gray-400 text-xs">Upload gambar QRIS ke folder public<br/>lalu ganti kodingan ini</p> */}
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm font-bold text-gray-800">Menerima Semua E-Wallet</p>
        </div>
        <p className="text-xs text-gray-400">Gopay, Ovo, Dana, ShopeePay, BCA</p>
      </div>
      
      <p className="mt-8 text-white/80 text-sm font-medium">Tunjukkan ke pelanggan</p>
    </div>
  )
}