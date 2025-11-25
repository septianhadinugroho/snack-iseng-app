import { useEffect, useState, useRef } from 'react';
import api from '../api';
import { Plus, Trash2, Save, Edit, FileSpreadsheet, ChevronLeft, ChevronRight, ShoppingBag, Package } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PullToRefresh from '../components/PullToRefresh';
// [HAPUS] import { sendNotification } from '../utils/notify'; <-- HAPUS IMPORT INI

export default function Expenses() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Upload State
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Notification State
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [modal, setModal] = useState({ show: false, title: '', msg: '', action: null, type: 'info' });

  // Form State
  const defaultItems = [{ name: '', quantity: '', price: '' }];
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [yieldEst, setYieldEst] = useState('');
  const [items, setItems] = useState(defaultItems);

  // --- HELPER NOTIFIKASI (CUMA TOAST SAJA) ---
  const notify = (msg, type = 'success') => {
      setToast({ show: true, msg, type });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await api.get('/expenses');
        setHistory(res.data);
    } catch (e) { 
        console.error("Gagal load data"); 
    } finally {
        setLoading(false);
    }
  };
  useEffect(() => { fetchData() }, []);

  // --- Logic Upload ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
        await api.post('/expenses/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        
        // [HAPUS sendNotification DI SINI]
        notify("Import Excel Berhasil! 📂");
        
        fetchData();
    } catch (err) { notify("Gagal Import File", "error"); }
    finally { setIsUploading(false); if(fileInputRef.current) fileInputRef.current.value=''; }
  };

  // --- Logic Item Change ---
  const handleItemChange = (index, field, val) => {
      const newItems = [...items];
      newItems[index][field] = val;
      setItems(newItems);
  };
  const addItemRow = () => setItems([...items, { name: '', quantity: '', price: '' }]);

  // --- Logic Remove Item ---
  const removeRow = (index) => {
      const itemToDelete = items[index];

      if (isEditing && itemToDelete.id) {
          setModal({
              show: true,
              title: 'Hapus Item Database?',
              msg: 'Item ini akan dihapus permanen & total harga diupdate.',
              type: 'danger',
              action: async () => {
                  try {
                      await api.delete(`/expenses/items/${itemToDelete.id}`);
                      const newItems = items.filter((_, i) => i !== index);
                      setItems(newItems.length ? newItems : defaultItems);
                      notify("Item berhasil dihapus 🗑️");
                      setModal({ ...modal, show: false });
                      fetchData(); 
                  } catch (e) {
                      notify("Gagal menghapus item", "error");
                      setModal({ ...modal, show: false });
                  }
              }
          });
      } else {
          if(items.length > 1) {
              setItems(items.filter((_, i) => i !== index));
          } else {
              setItems(defaultItems);
          }
      }
  };

  // --- LOGIC DELETE EXPENSE ---
  const handleDeleteExpense = (id) => {
      setModal({
          show: true,
          title: 'Hapus Nota Belanja?',
          msg: 'Data belanja ini beserta isinya akan hilang selamanya.',
          type: 'danger',
          action: async () => {
              try {
                  await api.delete(`/expenses/${id}`);
                  
                  // [HAPUS sendNotification DI SINI]
                  // Cukup Toast Saja
                  notify("Nota belanja dihapus 🗑️", "error");
                  
                  fetchData();
                  if (editId === id) cancelEdit();
              } catch (e) {
                  notify("Gagal hapus nota", "error");
              } finally {
                  setModal({ ...modal, show: false });
              }
          }
      });
  };

  // --- Logic Submit ---
  const handleSubmit = () => {
      const validItems = items.filter(i => i.name && i.price);
      if(validItems.length === 0) return notify("Isi minimal 1 barang!", "error");
      setModal({ show: true, title: isEditing ? 'Update Data?' : 'Simpan Belanja?', msg: 'Pastikan nominal harga benar.', type: 'info', action: processSave });
  };

  // --- LOGIC SAVE ---
  const processSave = async () => {
      const validItems = items.filter(i => i.name && i.price);
      
      const payloadItems = validItems.map(i => ({
          id: i.id || null,
          name: i.name,
          quantity: i.quantity,
          price: i.price
      }));

      const payload = { 
          date, 
          yieldEstimate: yieldEst, 
          description: `Hasil: ${yieldEst || '-'} bungkus`, 
          items: payloadItems 
      };

      try {
          if (isEditing) {
              await api.put(`/expenses/${editId}`, payload);
              
              // [HAPUS sendNotification DI SINI]
              notify("Data Belanja Diupdate! ✏️");
          } else {
              await api.post('/expenses', payload);
              
              // [HAPUS sendNotification DI SINI]
              notify("Belanja Tercatat! 💸");
          }
          cancelEdit();
          fetchData();
      } catch (e) { notify("Gagal menyimpan data", "error"); }
      finally { setModal({ ...modal, show: false }); }
  };

  const handleEdit = (exp) => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setDate(exp.date);
      setYieldEst(exp.yieldEstimate || '');
      setItems(exp.items.map(i => ({ 
          id: i.id,
          name: i.name, 
          quantity: i.quantity, 
          price: i.price 
      })));
      setIsEditing(true);
      setEditId(exp.id);
  };

  const cancelEdit = () => { 
      setIsEditing(false); 
      setEditId(null); 
      setItems(defaultItems); 
      setYieldEst(''); 
      setDate(new Date().toISOString().split('T')[0]);
  };

  // --- Helper Format Tanggal Indo ---
  const formatDateIndo = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  // --- LOGIC PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  return (
    <div className="pb-24 p-4 dark:text-gray-100">
      <Toast show={toast.show} message={toast.msg} type={toast.type} onClose={()=>setToast({...toast, show:false})} />
      <ConfirmModal isOpen={modal.show} onClose={()=>setModal({...modal,show:false})} onConfirm={modal.action} title={modal.title} message={modal.msg} type={modal.type}/>

      <h1 className="text-2xl font-bold mb-4 flex justify-between items-center">
          <span>{isEditing?'Edit Belanja':'Catat Belanja 🛒'}</span>
          {isEditing && <button onClick={cancelEdit} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold">Batal</button>}
      </h1>

      {/* UPLOAD BUTTON */}
      {!isEditing && (
         <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800 flex justify-between items-center mb-6">
             <div className="text-sm text-blue-800 dark:text-blue-300 font-bold">Import dari Excel</div>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx" className="hidden"/>
             <button onClick={()=>fileInputRef.current.click()} disabled={isUploading} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex gap-2 shadow-md active:scale-95 transition">
                 {isUploading?'Loading...':<><FileSpreadsheet size={14}/> Upload</>}
             </button>
         </div>
      )}

      {/* FORM */}
      <div className={`p-4 rounded-2xl shadow-sm border mb-6 transition-colors ${isEditing ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/10' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
          <div className="flex gap-3 mb-4">
              <div className="flex-1"><label className="text-xs text-gray-400">Tanggal</label><input type="date" className="w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2 text-sm" value={date} onChange={e=>setDate(e.target.value)} /></div>
              <div className="w-1/3"><label className="text-xs text-gray-400">Hasil (Bks)</label><input type="number" className="w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2 text-sm" value={yieldEst} onChange={e=>setYieldEst(e.target.value)} /></div>
          </div>
          <div className="space-y-2 mb-4">
              {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                      <input placeholder="Nama" className="flex-1 min-w-0 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded p-2 text-xs" value={item.name} onChange={e=>handleItemChange(idx, 'name', e.target.value)} />
                      <input placeholder="Qty" className="w-16 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded p-2 text-xs" value={item.quantity} onChange={e=>handleItemChange(idx, 'quantity', e.target.value)} />
                      <input type="number" placeholder="Rp" className="w-20 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded p-2 text-xs" value={item.price} onChange={e=>handleItemChange(idx, 'price', e.target.value)} />
                      <button onClick={()=>removeRow(idx)} className="text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg active:scale-95"><Trash2 size={14}/></button>
                  </div>
              ))}
          </div>
          <div className="flex gap-2">
              <button onClick={addItemRow} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1 hover:bg-gray-200"><Plus size={14}/> Tambah</button>
              <button onClick={handleSubmit} className={`flex-1 text-white py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1 shadow-md active:scale-95 transition ${isEditing ? 'bg-blue-600' : 'bg-orange-600'}`}><Save size={14}/> {isEditing ? 'Update' : 'Simpan'}</button>
          </div>
      </div>

      {/* HISTORY LIST */}
      <h3 className="font-bold mb-3">Riwayat Belanja</h3>

      {loading ? (
        <LoadingSpinner text="Memuat Riwayat Belanja..." fullHeight={false} />
      ) : (
        <PullToRefresh onRefresh={fetchData}>
            <div className="space-y-4">
                {currentItems.length > 0 ? currentItems.map(h => (
                    <div key={h.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden relative">
                        
                        {/* HEADER */}
                        <div className="p-4 flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 text-lg">Belanja</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formatDateIndo(h.date)}</p>
                                
                                <div className="flex gap-2 mt-2">
                                    <div className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                                        <ShoppingBag size={12} />
                                        {h.items?.length} Items
                                    </div>
                                    
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${h.yieldEstimate ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                                        <Package size={12} />
                                        {h.yieldEstimate ? `Hasil: ${h.yieldEstimate} Bks` : 'Hasil: -'}
                                    </div>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-2">
                                <button onClick={()=>handleEdit(h)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 transition">
                                    <Edit size={16}/>
                                </button>
                                <button onClick={()=>handleDeleteExpense(h.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-gray-700 dark:text-red-400 transition">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>

                        {/* LIST ITEM */}
                        <div className="px-4 py-2">
                            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1"></div>
                            <div className="space-y-1.5 py-2">
                                {h.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                                        <span>• {item.name} <span className="text-gray-400">({item.quantity})</span></span>
                                        <span className="font-mono">{item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Belanja</span>
                            <span className="text-lg font-black text-gray-800 dark:text-white">Rp {h.totalCost.toLocaleString()}</span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-gray-400 text-sm">Belum ada data belanja.</div>
                )}

                {/* PAGINATION */}
                {history.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-4 mt-6 text-sm font-bold text-gray-600 dark:text-gray-300 pb-6">
                        <button onClick={()=>setCurrentPage(prev => Math.max(prev-1, 1))} disabled={currentPage===1} className="p-2 bg-white dark:bg-gray-800 rounded shadow disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={20}/></button>
                        <span>Halaman {currentPage} / {totalPages}</span>
                        <button onClick={()=>setCurrentPage(prev => Math.min(prev+1, totalPages))} disabled={currentPage===totalPages} className="p-2 bg-white dark:bg-gray-800 rounded shadow disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={20}/></button>
                    </div>
                )}
            </div>
        </PullToRefresh>
      )}
    </div>
  );
}