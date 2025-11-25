import { useEffect, useState } from 'react';
import api from '../api';
import { Package, Crown, Edit2, Tag, X, Check, Box } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import PullToRefresh from '../components/PullToRefresh';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.products);
      const statsObj = {};
      res.data.variantStats.forEach(s => statsObj[s.productName] = parseInt(s.total));
      setStats(statsObj);
    } catch (e) {
      console.error("Gagal load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getData(); }, []);

  const maxSold = Math.max(...Object.values(stats), 0);

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setEditPrice(p.price);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice(0);
  };

  const savePrice = async (id) => {
    try {
        await api.put(`/products/${id}`, { price: editPrice });
        setEditingId(null);
        getData();
    } catch (error) {
        alert("Gagal update harga");
    }
  };

  if (loading) return <LoadingSpinner text="Memuat Produk..." />;

  return (
    <PullToRefresh onRefresh={getData}>
      <div className="pb-24 p-4 min-h-screen">
        {/* Header Decoration */}
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            <Box className="text-orange-500 fill-orange-100" size={28}/> 
            Varian Produk
            </h1>
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold">
                {products.length} Varian
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => {
            const sold = stats[p.name] || 0;
            const isBestSeller = sold > 0 && sold === maxSold;
            const isEditing = editingId === p.id;

            return (
              <div 
                key={p.id} 
                className={`relative rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 h-[140px] shadow-sm hover:shadow-md
                    ${isBestSeller 
                        ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white ring-2 ring-orange-200 dark:ring-orange-900' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                    }`}
              >
                
                {/* MODE EDIT (OVERLAY FULL CARD) */}
                {isEditing ? (
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl z-20 p-2 flex flex-col justify-center items-center gap-2 border-2 border-blue-500 animate-fade-in">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Edit Harga {p.name}</label>
                        <input 
                            autoFocus 
                            type="number" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-center font-bold text-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none"
                            value={editPrice} 
                            onChange={e=>setEditPrice(e.target.value)} 
                        />
                        <div className="flex gap-2 w-full">
                            <button onClick={handleCancelEdit} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 rounded-lg flex justify-center items-center hover:bg-gray-300 transition">
                                <X size={16} />
                            </button>
                            <button onClick={()=>savePrice(p.id)} className="flex-1 bg-blue-600 text-white py-1 rounded-lg flex justify-center items-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                                <Check size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    // MODE NORMAL
                    <>
                        {isBestSeller && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-orange-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 transform rotate-3 z-10">
                            <Crown size={12} fill="currentColor"/> BEST
                        </div>
                        )}

                        <div>
                            <div className="flex items-start justify-between">
                                <div className={`p-1.5 rounded-lg mb-2 inline-flex ${isBestSeller ? 'bg-white/20 text-white' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'}`}>
                                    <Tag size={14} />
                                </div>
                                <button onClick={()=>handleEditClick(p)} className={`p-1.5 rounded-full transition ${isBestSeller ? 'text-white/80 hover:bg-white/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    <Edit2 size={14}/>
                                </button>
                            </div>
                            
                            <h2 className={`text-sm font-bold leading-tight line-clamp-2 ${!isBestSeller && 'text-gray-800 dark:text-white'}`}>
                                {p.name}
                            </h2>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-dashed border-white/20 dark:border-gray-700 flex justify-between items-end">
                            <div>
                                <p className={`text-[10px] mb-0.5 ${isBestSeller ? 'text-white/80' : 'text-gray-400'}`}>Harga</p>
                                <p className="font-mono font-bold text-sm">
                                    {(p.price)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-[10px] mb-0.5 ${isBestSeller ? 'text-white/80' : 'text-gray-400'}`}>Terjual</p>
                                <p className="font-bold text-lg leading-none">{sold}</p>
                            </div>
                        </div>
                    </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PullToRefresh>
  );
}