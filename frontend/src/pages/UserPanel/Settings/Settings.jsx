import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Phone, Shield, 
  ChevronRight, Clock, GraduationCap, Building2,
  CheckCircle2, CreditCard, AlertCircle, RefreshCw,
  ShieldCheck, Database, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

// Используем StatCard как в CertificateVerify
const StatCard = ({ icon: Icon, label, value, colorClass, description }) => (
  <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all text-left group">
    <div className={`absolute top-0 left-0 w-1 h-full ${colorClass.split(' ')[1].replace('text-', 'bg-')}`} />
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{description}</p>
  </div>
);

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [data, setData] = useState({
    user: { name: '', email: '', mobile: '', faculty: '', department: '', specialization: '' },
    transactions: []
  });

  const [formData, setFormData] = useState({
    email: '', mobile: '', current_password: '', new_password: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/user/settings');
        setData(response.data);
        setFormData({
          email: response.data.user.email,
          mobile: response.data.user.mobile || '',
          current_password: '',
          new_password: '',
        });
      } catch (err) {
        console.error("Ошибка синхронизации:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const isPasswordChange = activeTab === 'security' && formData.new_password;

    try {
      await api.put('/user/settings', formData);
      if (isPasswordChange) {
        alert("Пароль изменен. Требуется повторный вход.");
        localStorage.clear();
        window.location.href = '/login'; 
      } else {
        alert("Данные обновлены");
        setData(prev => ({ ...prev, user: { ...prev.user, email: formData.email, mobile: formData.mobile } }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
      <RefreshCw className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] text-slate-900 min-h-screen">
      
      {/* HEADER (Стиль CertificateVerify) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Настройки аккаунта</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Управление личными данными, параметрами безопасности <br/> и просмотр истории транзакций.
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-900 text-white shadow-lg">
             Личный кабинет 2026
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-4 text-left">
          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Профиль', icon: User, color: 'text-blue-600' },
              { id: 'security', label: 'Безопасность', icon: Lock, color: 'text-indigo-600' },
              { id: 'history', label: 'История', icon: Clock, color: 'text-emerald-600' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  activeTab === item.id 
                  ? 'bg-white border-slate-200 shadow-sm ring-1 ring-slate-900/5' 
                  : 'bg-transparent border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} className="text-slate-400" />}
              </button>
            ))}
          </nav>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 mt-6">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Статус</p>
                  <p className="text-xl font-black text-slate-900 tracking-tight">Verified</p>
               </div>
               <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={24} /></div>
            </div>
            <div className="pt-4 border-t border-slate-50">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
                 Ваш аккаунт синхронизирован с государственной системой образования.
               </p>
            </div>
          </div>

          <StatCard 
            label="Безопасность" 
            value="SSL" 
            icon={Database} 
            colorClass="bg-blue-50 text-blue-600" 
            description="Данные зашифрованы" 
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 text-left">
          <AnimatePresence mode='wait'>
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col"
            >
              {/* Top Banner (как в результате CertificateVerify) */}
              <div className={`relative h-20 w-full flex items-center justify-between px-8 border-b border-slate-100 ${
                activeTab === 'profile' ? 'bg-blue-50' : activeTab === 'security' ? 'bg-indigo-50' : 'bg-emerald-50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    {activeTab === 'profile' ? <User className="text-blue-600" /> : activeTab === 'security' ? <Lock className="text-indigo-600" /> : <Clock className="text-emerald-600" />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      activeTab === 'profile' ? 'text-blue-600' : activeTab === 'security' ? 'text-indigo-600' : 'text-emerald-600'
                    }`}>
                      {activeTab === 'profile' ? 'Персональные данные' : activeTab === 'security' ? 'Настройки доступа' : 'История активности'}
                    </p>
                    <p className="text-sm font-black text-slate-900 tracking-tight">Управление разделом</p>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1">
                {activeTab === 'profile' && (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                          <GraduationCap size={12} /> Факультет
                        </p>
                        <p className="text-[11px] font-black text-slate-800 uppercase italic">{data.user.faculty || '—'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                          <Building2 size={12} /> Кафедра
                        </p>
                        <p className="text-[11px] font-black text-slate-800 uppercase italic">{data.user.department || '—'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Полное имя</label>
                        <input type="text" readOnly value={data.user.name} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 uppercase outline-none cursor-not-allowed" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
                          <input type="text" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 focus:border-blue-500 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-dashed border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-400">
                        <AlertCircle size={14} />
                        <p className="text-[9px] font-bold uppercase tracking-tight">ФИО меняется через деканат</p>
                      </div>
                      <button type="submit" disabled={loading} className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2">
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Сохранить изменения'}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-4 items-center">
                      <Shield size={20} className="text-indigo-600" />
                      <p className="text-[10px] font-bold text-indigo-700 uppercase leading-relaxed tracking-tight">
                        После смены пароля потребуется повторная авторизация на всех устройствах.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Текущий пароль</label>
                        <input type="password" placeholder="••••••••" value={formData.current_password} onChange={(e) => setFormData({...formData, current_password: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Новый пароль</label>
                        <input type="password" placeholder="MIN 8 CHARACTERS" value={formData.new_password} onChange={(e) => setFormData({...formData, new_password: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:border-indigo-500 outline-none" />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all mt-4">
                      {loading ? 'Синхронизация данных...' : 'Обновить безопасность'}
                    </button>
                  </form>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-3">
                    {data.transactions.length > 0 ? (
                      data.transactions.map((t) => (
                        <div key={t.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-white hover:shadow-sm transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white rounded-lg text-slate-400 group-hover:text-emerald-600 transition-colors">
                              <CreditCard size={18} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t.course}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{t.date} • {t.type}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1.5 ${t.status === 'approved' ? 'text-emerald-600' : 'text-amber-500'}`}>
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {t.status === 'approved' ? 'Success' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-200">
                        <Clock size={40} className="mb-4 opacity-20" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Пусто</h3>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900 flex justify-center mt-auto">
                 <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em]">Official University Security Protocol</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-left mt-16 pt-8 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          Все изменения требуют подтверждения и логируются в системе Digital Sign.
        </p>
      </div>
    </main>
  );
};

export default Settings;