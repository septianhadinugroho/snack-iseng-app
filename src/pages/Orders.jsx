import { useEffect, useState, useRef } from 'react';
import api from '../api';
import { Search, Trash2, Edit, FileSpreadsheet, Eye, ChevronLeft, ChevronRight, X, FileText } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

export default function Orders() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState('new');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Filter & Pagination
  const [historyTab, setHistoryTab] = useState('ongoing'); 
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Edit & Detail
  const [detailOrder, setDetailOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // UI States
  const [modal, setModal] = useState({ show: false, title: '', msg: '', action: null, type: 'info' });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Upload
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form
  const defaultForm = { 
      customerName: '', items: [], paymentMethod: 'Cash', 
      isPaid: false, isReceived: false, description: '', 
      date: new Date().toISOString().split('T')[0] 
  };
  const [form, setForm] = useState(defaultForm);

  // --- HELPER NOTIFIKASI (FIXED FOR MOBILE PWA) ---
  const notify = (msg, type = 'success') => {
      setToast({ show: true, msg, type }); // Tampilkan Toast di layar

      // Cek support notifikasi & izin
      if ('Notification' in window && Notification.permission === 'granted') {
          // CARA BARU: Gunakan Service Worker Registration
          if (navigator.serviceWorker) {
              navigator.serviceWorker.ready.then((registration) => {
                  registration.showNotification("Snack Iseng", {
                      body: msg,
                      icon: '/pwa-192.png', // Pastikan icon ini ada
                      badge: '/pwa-192.png', // Icon kecil di status bar (Android)
                      vibrate: [200, 100, 200],
                      tag: 'snack-notif', // Agar notif tidak menumpuk
                      renotify: true // Agar getar lagi kalau ada notif baru dengan tag sama
                  });
              });
          } else {
              // Fallback untuk browser lama/desktop biasa
              new Notification("Snack Iseng", { 
                  body: msg, 
                  icon: '/pwa-192.png' 
              });
          }
      }
  };

  // --- HELPER FORMAT TANGGAL ---
  const formatDateIndo = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('id-ID', { 
          day: '2-digit', month: '2-digit', year: 'numeric' 
      });
  };

  const fetchData = async () => {
    try {
        const [p, o] = await Promise.all([api.get('/products'), api.get('/orders')]);
        setProducts(p.data.products);
        setOrders(o.data);
    } catch (e) { console.error("Gagal load data"); }
  };
  useEffect(() => { fetchData(); }, []);

  // --- LOGIC FORM ITEM ---
  const addItem = (prod) => {
    const exist = form.items.find(i => i.productId === prod.id);
    if(exist) setForm({...form, items: form.items.map(i => i.productId === prod.id ? {...i, quantity: i.quantity+1} : i)});
    else setForm({...form, items: [...form.items, { productId: prod.id, productName: prod.name, quantity: 1 }]});
  };
  const removeItem = (pid) => setForm({...form, items: form.items.filter(i => i.productId !== pid)});

  // --- LOGIC SUBMIT ---
  const handleSubmit = async () => {
      if(!form.customerName || form.items.length===0) return notify("Isi nama & barang dulu!", "error");
      
      if (isEditing) {
          setModal({ show: true, title: 'Simpan Perubahan?', msg: 'Data lama akan ditimpa.', type: 'info', action: processSubmit });
      } else {
          await processSubmit();
      }
  };

  const processSubmit = async () => {
      const payload = { ...form, paymentMethod: form.isPaid ? form.paymentMethod : null };
      try {
          if (isEditing) {
              await api.put(`/orders/${editId}`, payload);
              notify("Pesanan Diupdate! ✏️");
          } else {
              await api.post('/orders', payload);
              notify("Pesanan Masuk! 💰");
          }
          resetForm();
          fetchData();
          setActiveTab('history');
      } catch (e) { 
          console.error(e);
          notify("Gagal simpan data", "error"); 
      }
  };

  const resetForm = () => {
      setForm(defaultForm);
      setIsEditing(false);
      setEditId(null);
      setModal({ ...modal, show: false });
  };

  // --- LOGIC EDIT & DELETE ---
  const handleEdit = (order) => {
      setForm({
          customerName: order.customerName,
          date: order.date,
          isPaid: order.paymentStatus,
          isReceived: order.isReceived, 
          paymentMethod: order.paymentMethod || 'Cash',
          description: order.description || '',
          items: order.items.map(i => ({ productId: i.ProductId, productName: i.productName, quantity: i.quantity }))
      });
      setIsEditing(true);
      setEditId(order.id);
      setDetailOrder(null); 
      setActiveTab('new');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
      setModal({
          show: true, title: 'Hapus Pesanan?', msg: 'Data hilang selamanya.', type: 'danger', 
          action: async () => {
              try {
                  await api.delete(`/orders/${id}`);
                  notify("Pesanan Dihapus! 🗑️", "error");
                  fetchData();
              } catch(e) { notify("Gagal hapus", "error"); } 
              finally { setModal({ ...modal, show: false }); setDetailOrder(null); }
          }
      });
  };

  // --- FILTERING & PAGINATION ---
  const filteredBase = orders.filter(o => {
      const matchName = o.customerName.toLowerCase().includes(search.toLowerCase());
      const orderDate = new Date(o.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if(start) start.setHours(0,0,0,0);
      if(end) end.setHours(23,59,59,999);
      if(orderDate) orderDate.setHours(12,0,0,0);
      const matchDate = (!start || orderDate >= start) && (!end || orderDate <= end);
      return matchName && matchDate;
  });

  const ongoingOrders = filteredBase.filter(o => !o.paymentStatus || !o.isReceived);
  const completedOrders = filteredBase.filter(o => o.paymentStatus && o.isReceived);
  const currentList = historyTab === 'ongoing' ? ongoingOrders : completedOrders;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentList.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [historyTab, search, startDate, endDate]);

  // --- UPLOAD EXCEL ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    setIsUploading(true);
    try {
        await api.post('/orders/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify("Import Berhasil! 📊"); fetchData(); setActiveTab('history');
    } catch (err) { notify("Gagal Import", "error"); }
    finally { setIsUploading(false); if(fileInputRef.current) fileInputRef.current.value=''; }
  };

  return (
    <div className="pb-24 dark:text-gray-100">
      <Toast show={toast.show} message={toast.msg} type={toast.type} onClose={()=>setToast({...toast, show:false})} />
      <ConfirmModal isOpen={modal.show} onClose={()=>setModal({...modal,show:false})} onConfirm={modal.action} title={modal.title} message={modal.msg} type={modal.type}/>
      
      <div className="sticky top-0 bg-white dark:bg-gray-900 z-20 flex border-b dark:border-gray-700 shadow-sm">
        <button onClick={()=>setActiveTab('new')} className={`flex-1 p-3 font-bold text-sm ${activeTab==='new'?'text-orange-500 border-b-2 border-orange-500':'text-gray-400'}`}>{isEditing?'Mode Edit':'Input Baru'}</button>
        <button onClick={()=>setActiveTab('history')} className={`flex-1 p-3 font-bold text-sm ${activeTab==='history'?'text-orange-500 border-b-2 border-orange-500':'text-gray-400'}`}>Riwayat</button>
      </div>

      <div className="p-4">
        {activeTab === 'new' ? (
          <div className="space-y-4 animate-fade-in">
             {isEditing ? (
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 flex justify-between items-center">
                     <span className="text-sm font-bold text-blue-600">Mode Edit Aktif</span>
                     <button onClick={resetForm} className="text-xs bg-white dark:bg-gray-800 shadow px-3 py-1 rounded-lg text-red-500 font-bold">Batal</button>
                 </div>
             ) : (
                 <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800 flex justify-between items-center">
                     <span className="text-xs font-bold text-green-700 dark:text-green-300">Import Excel</span>
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx" className="hidden" />
                     <button onClick={()=>fileInputRef.current.click()} disabled={isUploading} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1 shadow-sm">
                         {isUploading ? 'Loading...' : <><FileSpreadsheet size={14}/> Upload</>}
                     </button>
                 </div>
             )}

            <div className="flex gap-2">
                <input type="date" className="bg-white dark:bg-gray-800 p-2 rounded-xl border dark:border-gray-700 text-sm" value={form.date} onChange={e=>setForm({...form, date: e.target.value})}/>
                <input className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-xl border dark:border-gray-700 outline-none" placeholder="Nama Customer" value={form.customerName} onChange={e=>setForm({...form, customerName: e.target.value})} />
            </div>
            
            <div className="flex flex-wrap gap-2">
                {products.map(p => (
                   <button key={p.id} onClick={()=>addItem(p)} className="px-3 py-1.5 bg-orange-50 dark:bg-gray-800 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-gray-700 text-xs font-medium active:scale-95">
                      {p.name}
                   </button>
                ))}
            </div>

            {form.items.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700">
                    {form.items.map(i => (
                        <div key={i.productId} className="flex justify-between py-1 border-b dark:border-gray-700 items-center text-sm">
                            <span>{i.productName} x{i.quantity}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{i.quantity*5000}</span>
                                <button onClick={()=>removeItem(i.productId)} className="text-red-400 bg-red-50 p-1 rounded-full"><Trash2 size={12}/></button>
                            </div>
                        </div>
                    ))}
                    <div className="font-bold mt-2 pt-2 border-t dark:border-gray-700 flex justify-between"><span>Total</span><span>Rp {form.items.reduce((a,b)=>a+(b.quantity*5000),0).toLocaleString()}</span></div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 space-y-4">
                 <div className="flex items-center justify-between">
                     <span className="text-sm font-bold">Snack Diterima?</span>
                     <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 gap-1">
                         <button onClick={()=>setForm({...form, isReceived: false})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${!form.isReceived ? 'bg-white dark:bg-gray-700 shadow text-red-500' : 'text-gray-400'}`}>Belum</button>
                         <button onClick={()=>setForm({...form, isReceived: true})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${form.isReceived ? 'bg-white dark:bg-gray-700 shadow text-green-500' : 'text-gray-400'}`}>Sudah</button>
                     </div>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm font-bold">Status Bayar?</span>
                     <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 gap-1">
                         <button onClick={()=>setForm({...form, isPaid: false})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${!form.isPaid ? 'bg-white dark:bg-gray-700 shadow text-red-500' : 'text-gray-400'}`}>Belum</button>
                         <button onClick={()=>setForm({...form, isPaid: true})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${form.isPaid ? 'bg-white dark:bg-gray-700 shadow text-green-500' : 'text-gray-400'}`}>Lunas</button>
                     </div>
                 </div>
                 {form.isPaid && (
                     <div className="animate-fade-in-down">
                         <label className="text-xs text-gray-400 block mb-1">Metode Pembayaran</label>
                         <select className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-sm" value={form.paymentMethod} onChange={e=>setForm({...form, paymentMethod: e.target.value})}>
                             <option value="Cash">Cash</option>
                             <option value="QRIS">QRIS</option>
                         </select>
                     </div>
                 )}
                 <textarea className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border dark:border-gray-700" placeholder="Deskripsi..." value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows="1"></textarea>
            </div>

            <button onClick={handleSubmit} className={`w-full text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 ${isEditing?'bg-blue-600':'bg-orange-600'}`}>{isEditing?'UPDATE PESANAN':'SIMPAN PESANAN'}</button>
          </div>
        ) : (
          /* HISTORY TAB */
          <div className="space-y-4 animate-fade-in">
              {/* FILTER & SEARCH SECTION */}
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border dark:border-gray-700 space-y-2">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                      <input className="w-full pl-9 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-sm" placeholder="Cari nama..." value={search} onChange={e=>setSearch(e.target.value)} />
                  </div>
                  <div className="flex gap-2 items-center">
                      <input type="date" className="flex-1 min-w-0 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-xs" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                      <span className="text-gray-400">-</span>
                      <input type="date" className="flex-1 min-w-0 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-xs" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                  </div>
              </div>

              <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
                  <button onClick={()=>setHistoryTab('ongoing')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${historyTab==='ongoing'?'bg-white dark:bg-gray-700 shadow text-orange-600':'text-gray-500'}`}>
                      Dalam Proses ({ongoingOrders.length})
                  </button>
                  <button onClick={()=>setHistoryTab('completed')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${historyTab==='completed'?'bg-white dark:bg-gray-700 shadow text-green-600':'text-gray-500'}`}>
                      Selesai ({completedOrders.length})
                  </button>
              </div>

              {currentItems.length > 0 ? currentItems.map(o => (
                  <div key={o.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 relative">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <p className="font-bold text-gray-800 dark:text-gray-100">{o.customerName}</p>
                              <div className="flex gap-2 text-[10px] mt-1 text-gray-500">
                                  <span>📅 {formatDateIndo(o.date)}</span>
                                  {o.admin && <span>👮‍♂️ {o.admin.username}</span>}
                              </div>
                              
                              {o.description && (
                                  <div className="flex items-center gap-1 mt-1 text-[10px] text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded w-fit max-w-[200px]">
                                      <FileText size={10}/> <span className="truncate">{o.description}</span>
                                  </div>
                              )}

                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1">
                                  🛒 {o.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                              </p>
                          </div>
                          <div className="flex gap-1">
                              <button onClick={()=>setDetailOrder(o)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600"><Eye size={16} /></button>
                              <button onClick={()=>handleEdit(o)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Edit size={16} /></button>
                              <button onClick={()=>handleDelete(o.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                      </div>

                      <div className="flex justify-between items-center border-t dark:border-gray-700 pt-2 mt-2">
                          <div className="flex gap-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${o.paymentStatus?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{o.paymentStatus?'LUNAS':'BELUM'}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${o.isReceived?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>{o.isReceived?'DITERIMA':'DIPROSES'}</span>
                          </div>
                          <p className="font-bold text-gray-800 dark:text-gray-100">Rp {o.totalPrice.toLocaleString()}</p>
                      </div>
                  </div>
              )) : (
                  <div className="text-center py-10 text-gray-400 text-sm">Tidak ada pesanan.</div>
              )}

              {currentList.length > itemsPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                      <button onClick={()=>setCurrentPage(prev => Math.max(prev-1, 1))} disabled={currentPage===1} className="p-2 bg-white dark:bg-gray-800 rounded shadow disabled:opacity-50"><ChevronLeft size={20}/></button>
                      <span>Halaman {currentPage} / {totalPages}</span>
                      <button onClick={()=>setCurrentPage(prev => Math.min(prev+1, totalPages))} disabled={currentPage===totalPages} className="p-2 bg-white dark:bg-gray-800 rounded shadow disabled:opacity-50"><ChevronRight size={20}/></button>
                  </div>
              )}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-pop-in">
                  <button onClick={()=>setDetailOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
                  <h2 className="text-xl font-bold mb-1">{detailOrder.customerName}</h2>
                  <div className="flex gap-2 text-xs mb-4 text-gray-500"><span>📅 {formatDateIndo(detailOrder.date)}</span><span>👮‍♂️ {detailOrder.admin?.username || '-'}</span></div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-sm space-y-2 mb-4 border dark:border-gray-700">
                      {detailOrder.items.map(i => (<div key={i.id} className="flex justify-between"><span>{i.productName} ({i.quantity})</span><span>{(i.quantity * 5000).toLocaleString()}</span></div>))}
                      <div className="border-t dark:border-gray-600 pt-2 font-bold flex justify-between mt-2"><span>Total</span><span>Rp {detailOrder.totalPrice.toLocaleString()}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className={`p-2 rounded font-bold text-center ${detailOrder.paymentStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{detailOrder.paymentStatus ? 'SUDAH BAYAR' : 'BELUM BAYAR'}</div>
                      <div className={`p-2 rounded font-bold text-center ${detailOrder.isReceived ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{detailOrder.isReceived ? 'SUDAH DITERIMA' : 'BELUM DITERIMA'}</div>
                  </div>

                  {/* INI YANG BARU: TAMPILIN METODE BAYAR KALO SUDAH LUNAS */}
                  {detailOrder.paymentStatus && (
                      <div className="mb-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
                          <span className="text-xs text-gray-500">Pembayaran via:</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                              {detailOrder.paymentMethod || 'Cash'} 
                          </span>
                      </div>
                  )}

                  {detailOrder.description && (
                      <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-800/30 text-xs text-yellow-800 dark:text-yellow-200">
                          <p className="font-bold flex items-center gap-1 mb-1"><FileText size={12}/> Catatan:</p>
                          <p>{detailOrder.description}</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}