import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Phone, Shield, 
  ChevronRight, Clock, GraduationCap, Building2,
  CheckCircle2, CreditCard, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

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
    e.preventDefault();
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const SidebarItem = ({ id, icon: Icon, label, description, color }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-all text-left group relative overflow-hidden ${
        activeTab === id 
        ? 'bg-white border-slate-200 shadow-md ring-1 ring-blue-600/10' 
        : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-white/50'
      }`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full transition-all ${activeTab === id ? color : 'bg-transparent'}`} />
      <div className={`p-2.5 rounded-lg transition-all ${activeTab === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${activeTab === id ? 'text-slate-900' : 'text-slate-400'}`}>
          {label}
        </p>
        <p className="text-[11px] font-bold text-slate-500 mt-0.5">{description}</p>
      </div>
      <ChevronRight size={14} className={`ml-auto ${activeTab === id ? 'text-blue-600' : 'text-slate-300'}`} />
    </button>
  );

  return (
<main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] min-h-screen font-sans">      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8 mb-10 text-left">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Настройки аккаунта</h1>
          <p className="text-sm text-slate-500 font-medium">
            Управление личными данными, параметрами безопасности и история.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Система активна</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-10">
          <SidebarItem id="profile" icon={User} label="Профиль" description="Личные данные и вуз" color="bg-blue-600" />
          <SidebarItem id="security" icon={Lock} label="Безопасность" description="Пароль и доступ" color="bg-indigo-600" />
          <SidebarItem id="history" icon={Clock} label="История" description="Лог платежей и курсов" color="bg-emerald-600" />
        </div>

        {/* CONTENT CARD */}
<div className="lg:col-span-8 w-full min-w-0 lg:min-w-[700px]">  
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[650px] w-full">
            <div className={`absolute top-0 left-0 h-1 w-full transition-colors duration-300 ${activeTab === 'profile' ? 'bg-blue-600' : activeTab === 'security' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
            
            <div className="p-8 border-b border-slate-100 flex justify-between items-center w-full">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
                {activeTab === 'profile' && 'Персональная информация'}
                {activeTab === 'security' && 'Защита доступа'}
                {activeTab === 'history' && 'Транзакции и активность'}
              </h3>
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                {activeTab === 'profile' ? <User size={20} /> : activeTab === 'security' ? <Lock size={20} /> : <Clock size={20} />}
              </div>
            </div>

            <div className="p-8 md:p-10 flex-1 flex flex-col w-full overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.form 
                    key="profile"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSave} 
                    className="space-y-8 w-full flex-1 flex flex-col"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-1 text-left">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <GraduationCap size={12} /> Факультет
                        </p>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{data.user.faculty || '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-1 text-left">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Building2 size={12} /> Кафедра
                        </p>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{data.user.department || '—'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                      <div className="space-y-2 opacity-50">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Полное имя (ФИО)</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="text" readOnly value={data.user.name} className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="text" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Электронная почта</label>
                        <div className="relative">
                          <circle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between mt-auto w-full">
                      <div className="flex items-center gap-2 text-slate-400">
                        <AlertCircle size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-wider">Изменение ФИО доступно через деканат</p>
                      </div>
                      <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                        {loading ? 'Синхронизация...' : 'Сохранить изменения'}
                      </button>
                    </div>
                  </motion.form>
                )}

                {activeTab === 'security' && (
                  <motion.form 
                    key="security"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSave} 
                    className="space-y-6 w-full flex-1 flex flex-col text-left"
                  >
                    <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-4 items-center w-full">
                      <div className="p-2 bg-indigo-500 text-white rounded-lg flex-shrink-0"><Shield size={18} /></div>
                      <p className="text-xs font-bold text-indigo-700 leading-relaxed">После смены пароля все активные сессии будут завершены.</p>
                    </div>

                    <div className="space-y-5 flex-1 w-full">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Текущий пароль</label>
                        <input type="password" value={formData.current_password} onChange={(e) => setFormData({...formData, current_password: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Новый пароль</label>
                        <input type="password" value={formData.new_password} onChange={(e) => setFormData({...formData, new_password: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Минимум 8 символов" />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-600 transition-all mt-auto shadow-lg shadow-indigo-200">
                      {loading ? 'Обновление защиты...' : 'Обновить пароль и выйти'}
                    </button>
                  </motion.form>
                )}

                {activeTab === 'history' && (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 w-full flex-1 flex flex-col"
                  >
                    {data.transactions.length > 0 ? (
                      data.transactions.map((t) => (
                        <div key={t.id} className="p-5 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-emerald-200 hover:shadow-sm transition-all group text-left w-full">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors flex-shrink-0">
                              <CreditCard size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-tight">{t.course}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded">{t.type}</span>
                                <span className="text-[9px] font-bold text-slate-300">•</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                             <div className={`flex items-center gap-1.5 justify-end ${t.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                <CheckCircle2 size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {t.status === 'approved' ? 'Оплачено' : 'В обработке'}
                                </span>
                             </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-slate-300 w-full flex-1">
                         <Clock size={48} className="mb-4 opacity-20" />
                         <p className="font-bold text-sm tracking-tight">История операций пуста</p>
                         <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60">Здесь появятся ваши транзакции</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;