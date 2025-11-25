import { useEffect, useState } from 'react';
import api from '../api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, Wallet, ShoppingCart, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner'; // ⬅️ IMPORT BARU
import PullToRefresh from '../components/PullToRefresh'; // ⬅️ IMPORT BARU

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState({});
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // ⬅️ STATE LOADING BARU
  const navigate = useNavigate();

  // ⬅️ PISAHKAN FUNGSI FETCH JADI REUSABLE
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (e) {
      console.error("Gagal load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u || { username: 'Admin' });
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    fetchData(); // ⬅️ PANGGIL FETCH DATA
  }, [isDark]);

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
    if (newVal) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // ⬅️ TAMPILKAN LOADING KALAU DATA MASIH KOSONG
  if (loading) return <LoadingSpinner text="Memuat Dashboard..." />;

  const chartData = {
    labels: data.chart.map(c => c.productName),
    datasets: [{
      label: 'Terjual',
      data: data.chart.map(c => c.totalQty),
      backgroundColor: '#f97316',
      borderRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 10 },
        grid: { color: isDark ? '#374151' : '#e5e7eb' }
      },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  return (
    // ⬅️ BUNGKUS DENGAN PULL TO REFRESH
    <PullToRefresh onRefresh={fetchData}>
      <div className="p-5 pb-24 space-y-6">
        <ConfirmModal 
          isOpen={showModal} 
          onClose={()=>setShowModal(false)} 
          onConfirm={confirmLogout}
          title="Logout?"
          message="Yakin mau istirahat dulu bos?"
          type="danger"
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
              Halo, {user.username}! 👋
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Owner Snack Iseng</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowModal(true)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Pesanan" val={data.cards.totalOrders} icon={ShoppingCart} color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" />
          <StatCard title="Masuk" val={`Rp ${data.cards.income.toLocaleString()}`} icon={Wallet} color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" />
          <StatCard title="Keluar" val={`Rp ${data.cards.expenseTotal.toLocaleString()}`} icon={TrendingUp} color="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300" />
          <StatCard title="Profit" val={`Rp ${data.cards.profit.toLocaleString()}`} icon={Activity} color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-200">Grafik Penjualan</h3>
          </div>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-3 dark:text-white">Aktivitas Terkini</h3>
          <div className="space-y-3">
            {data.history.map((h, i) => (
              <div key={i} className="flex gap-3 text-sm border-b dark:border-gray-700 pb-2 last:border-0">
                <span className={`w-2 h-2 mt-1.5 rounded-full ${h.type==='ORDER'?'bg-green-500':'bg-red-500'}`}></span>
                <div>
                  <p className="dark:text-gray-300">{h.action}</p>
                  <p className="text-[10px] text-gray-400">{new Date(h.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

const StatCard = ({ title, val, icon: Icon, color }) => (
  <div className={`p-4 rounded-3xl flex flex-col justify-between h-28 ${color.split(' ')[0]} bg-opacity-50 dark:bg-opacity-20 border border-transparent dark:border-gray-700`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 ${color.split(' ')[1]}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[10px] uppercase opacity-60 font-bold dark:text-gray-300">{title}</p>
      <p className={`text-lg font-bold truncate ${color.split(' ')[1]}`}>{val}</p>
    </div>
  </div>
);