import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (error) {
      alert('Ups! Username atau password salah nih 😅');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 p-6 relative overflow-hidden">
      {/* Decoration Circles */}
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-60 h-60 bg-yellow-300 opacity-20 rounded-full blur-3xl"></div>

      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full max-w-xs border border-white/50 animate-pop-in">
        <div className="text-center mb-8">
            <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
                🍿
            </div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Snack Iseng</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
               CMS Admin Gacor <Sparkles size={14} className="text-yellow-500"/>
            </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Username</label>
            <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition text-sm font-medium" 
              value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Password</label>
            <input type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition text-sm font-medium" 
              value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Sabar...' : <>GAS MASUK <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 mt-8">
            © 2025 Snack Iseng Corp.
        </p>
      </div>
    </div>
  );
}