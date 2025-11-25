import { useEffect, useState } from 'react';
import api from '../api';
import { Package, Crown, Edit2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState(0);

  const getData = async () => {
    const res = await api.get('/products');
    setProducts(res.data.products);
    const statsObj = {};
    res.data.variantStats.forEach(s => statsObj[s.productName] = parseInt(s.total));
    setStats(statsObj);
  };

  useEffect(() => { getData(); }, []);

  // Cari Best Seller (Nilai Max)
  const maxSold = Math.max(...Object.values(stats));

  const savePrice = async (id) => {
    await api.put(`/products/${id}`, { price: editPrice });
    setEditingId(null);
    getData();
  };

  return (
    <div className="pb-24 p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
         <Package className="text-orange-500"/> Product Management
      </h1>

      {/* GANTI JADI GRID-COLS-2 BIAR KECIL */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => {
            const sold = stats[p.name] || 0;
            const isBestSeller = sold > 0 && sold === maxSold;

            return (
                <div key={p.id} className={`p-3 rounded-2xl relative overflow-hidden transition-all flex flex-col justify-between h-full ${isBestSeller ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border dark:border-gray-700'}`}>
                    
                    {isBestSeller && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-orange-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                            <Crown size={10}/> BEST
                        </div>
                    )}

                    <div>
                        <h2 className={`text-sm font-bold leading-tight ${!isBestSeller && 'dark:text-white'}`}>{p.name}</h2>
                        <div className="mt-2">
                            {editingId === p.id ? (
                                <div className="flex gap-1 flex-col">
                                    <input autoFocus type="number" className="w-full px-1 py-0.5 rounded text-black text-xs" value={editPrice} onChange={e=>setEditPrice(e.target.value)} />
                                    <button onClick={()=>savePrice(p.id)} className="bg-green-500 text-white px-1 rounded text-xs py-0.5">OK</button>
                                </div>
                            ) : (
                                <p className={`text-xs cursor-pointer flex items-center gap-1 ${isBestSeller ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`} onClick={()=>{setEditingId(p.id); setEditPrice(p.price)}}>
                                    Rp {p.price.toLocaleString()} <Edit2 size={10}/>
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-white/20 dark:border-gray-700">
                         <p className={`text-[8px] uppercase font-bold ${isBestSeller ? 'text-white/80' : 'text-gray-400'}`}>Terjual</p>
                         <p className="text-lg font-bold leading-none">{sold}</p>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}