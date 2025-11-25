import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Bell, CheckCircle, Trash2, Edit, ShoppingBag, DollarSign, ArrowLeft } from 'lucide-react';
import PullToRefresh from '../components/PullToRefresh';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Notifications() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setLogs(res.data);
    } catch (e) {
      console.error("Gagal load notif");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getIcon = (type, action) => {
    const act = action.toLowerCase();
    if (act.includes('hapus')) return <Trash2 size={18} className="text-red-500" />;
    if (act.includes('edit')) return <Edit size={18} className="text-blue-500" />;
    if (type === 'ORDER') return <ShoppingBag size={18} className="text-green-600" />;
    if (type === 'EXPENSE') return <DollarSign size={18} className="text-orange-600" />;
    return <CheckCircle size={18} className="text-gray-500" />;
  };

  return (
    <PullToRefresh onRefresh={fetchLogs}>
      <div className="pb-24 p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-2">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
           </button>
           <h1 className="text-xl font-bold text-gray-800 dark:text-white">Pusat Notifikasi</h1>
        </div>

        {loading ? <LoadingSpinner text="Memuat Aktivitas..." fullHeight={false} /> : (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                <Bell size={48} className="mb-2 opacity-20" />
                <p className="text-sm">Belum ada aktivitas tercatat.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-start animate-fade-in">
                  <div className={`p-2.5 rounded-full shrink-0 mt-0.5 ${log.type === 'ORDER' ? 'bg-green-50 dark:bg-green-900/20' : log.type === 'EXPENSE' ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {getIcon(log.type, log.action)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{log.action}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                      {new Date(log.createdAt).toLocaleString('id-ID', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}