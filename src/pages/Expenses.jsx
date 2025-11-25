import { useEffect, useState, useRef } from 'react';
import api from '../api';
import { Plus, Trash, Save, Edit, FileSpreadsheet, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast'; // Pastikan component Toast sudah ada

export default function Expenses() {
  const [history, setHistory] = useState([]);
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
  const [modal, setModal] = useState({ show: false, title: '', msg: '', action: null });

  // Form State
  const defaultItems = [{ name: '', quantity: '', price: '' }];
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [yieldEst, setYieldEst] = useState('');
  const [items, setItems] = useState(defaultItems);

  // --- HELPER NOTIFIKASI (WEB + PWA) ---
  const notify = (msg, type = 'success') => {
      setToast({ show: true, msg, type });
      // Trigger Notif Native HP/Browser (PWA)
      if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("Snack Iseng Belanja", { 
              body: msg, 
              icon: '/pwa-192.png',
              vibrate: [200, 100, 200]
          });
      }
  };

  const fetchData = async () => {
     try {
         const res = await api.get('/expenses');
         setHistory(res.data);
     } catch (e) { console.error("Gagal load data"); }
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
  const removeRow = (index) => { if(items.length > 1) setItems(items.filter((_, i) => i !== index)); };

  // --- Logic Submit ---
  const handleSubmit = () => {
      const validItems = items.filter(i => i.name && i.price);
      if(validItems.length === 0) return notify("Isi minimal 1 barang!", "error");
      setModal({ show: true, title: isEditing ? 'Update Data?' : 'Simpan Belanja?', msg: 'Pastikan nominal harga benar.', type: 'info', action: processSave });
  };

  const processSave = async () => {
      const payload = { date, yieldEstimate: yieldEst, description: `Hasil: ${yieldEst || '-'} bungkus`, items: items.filter(i=>i.name && i.price) };
      try {
          if (isEditing) {
              await api.put(`/expenses/${editId}`, payload);
              notify("Data Belanja Diupdate! ✏️");
          } else {
              await api.post('/expenses', payload);
              notify("Belanja Tercatat! 💸");
          }
          setItems(defaultItems); setYieldEst(''); setIsEditing(false); setEditId(null); setModal({show:false, ...modal}); fetchData();
      } catch (e) { notify("Gagal menyimpan data", "error"); }
  };

  const handleEdit = (exp) => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setDate(exp.date);
      setYieldEst(exp.yieldEstimate || '');
      setItems(exp.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })));
      setIsEditing(true);
      setEditId(exp.id);
  };
  const cancelEdit = () => { setIsEditing(false); setEditId(null); setItems(defaultItems); setYieldEst(''); };

  // --- Helper Format Tanggal Indo ---
  const formatDateIndo = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
                      {items.length>1 && <button onClick={()=>removeRow(idx)} className="text-red-400 p-1"><Trash size={14}/></button>}
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
      <div className="space-y-3">
          {currentItems.map(h => (
              <div key={h.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 relative">
                  <button onClick={()=>handleEdit(h)} className="absolute top-4 right-4 text-blue-500 bg-blue-50 dark:bg-gray-700 p-1.5 rounded-lg hover:bg-blue-100 transition"><Edit size={16}/></button>
                  
                  <div className="flex justify-between items-start mb-2 border-b dark:border-gray-700 pb-2 pr-10">
                      <div>
                          <span className="font-bold text-blue-600 dark:text-blue-400">Belanja {formatDateIndo(h.date)}</span>
                          <span className="text-xs text-gray-400 block">{h.items?.length} items</span>
                      </div>
                      <div className="text-right">
                          <span className="font-bold block">Rp {h.totalCost.toLocaleString()}</span>
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                             {h.yieldEstimate ? `Hasil: ${h.yieldEstimate} Bks` : 'Belum ada hasil'}
                          </span>
                      </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      {h.items?.map((item, i) => (
                          <div key={i} className="flex justify-between">
                              <span>• {item.name} ({item.quantity})</span>
                              <span>{item.price.toLocaleString()}</span>
                          </div>
                      ))}
                  </div>
              </div>
          ))}

          {/* PAGINATION CONTROLS */}
          {history.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-6 text-sm font-bold text-gray-600 dark:text-gray-300">
                <button onClick={()=>setCurrentPage(prev => Math.max(prev-1, 1))} disabled={currentPage===1} className="p-2 bg-white dark:bg-gray-800 rounded shadow disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={20}/></button>
                <span>Halaman {currentPage} / {totalPages}</span>
                <button onClick={()=>setCurrentPage(prev => Math.min(prev+1, totalPages))} disabled={currentPage===totalPages} className="p-2 bg-white dark:bg-gray-800 rounded shadow disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={20}/></button>
            </div>
          )}
      </div>
    </div>
  );
}