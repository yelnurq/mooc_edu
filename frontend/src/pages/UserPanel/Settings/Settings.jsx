import React, { useState } from 'react';
import { 
  Lock, Save, ShieldCheck, Eye, EyeOff 
} from 'lucide-react';
import api from '../../../api/axios';

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/user/change-password', passwords);
      alert('Пароль успешно изменен');
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      console.error(err);
      alert('Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-50/50 flex flex-col custom-scrollbar overflow-y-auto">
      
      {/* HEADER */}
      <div className="px-10 py-12 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">Приватность</span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Настройки</h1>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
             <ShieldCheck size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest">Безопасность</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full py-12 px-10">
        
        <form onSubmit={handlePasswordChange} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-black text-xl text-slate-900">Изменение пароля</h3>
               <button 
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-slate-400 hover:text-blue-600 transition-colors"
               >
                 {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>

            <div className="space-y-6">
              {/* Текущий пароль */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Текущий пароль</label>
                <input 
                  type={showPasswords ? "text" : "password"}
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all" 
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Новый пароль */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Новый пароль</label>
                  <input 
                    type={showPasswords ? "text" : "password"}
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="Минимум 8 символов"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Подтверждение</label>
                  <input 
                    type={showPasswords ? "text" : "password"}
                    value={passwords.new_password_confirmation}
                    onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="Повторите пароль"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white p-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Обновление...' : <><Lock size={16}/> Обновить пароль</>}
              </button>
            </div>
          </section>

          <p className="text-center text-slate-400 text-xs font-medium">
            После смены пароля вам может потребоваться повторная авторизация на других устройствах.
          </p>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default SettingsPage;