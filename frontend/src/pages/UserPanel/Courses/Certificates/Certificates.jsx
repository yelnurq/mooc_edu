import React, { useState, useMemo } from 'react';
import { 
  Search, Award, Download, ExternalLink, 
  ShieldCheck, Calendar, Filter, Star, 
  Database, X, Share2, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, colorClass, description }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all text-left">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{description}</p>
  </div>
);

const CATEGORIES = ['Все', 'Разработка', 'Архитектура', 'Базы данных'];

const MyCertificates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  // Демо-данные (замени на запрос к API)
  const certificates = [
    { id: 1, title: 'React & Laravel Fullstack Expert', date: '2026-03-15', category: 'Разработка', id_code: 'CERT-882-99', type: 'Professional' },
    { id: 2, title: 'Advanced Software Architecture', date: '2026-02-10', category: 'Архитектура', id_code: 'CERT-441-22', type: 'Academic' },
    { id: 3, title: 'Database Optimization Masterclass', date: '2026-01-05', category: 'Базы данных', id_code: 'CERT-102-55', type: 'Specialized' },
  ];

  const filteredCerts = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Все' || cert.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen text-slate-900 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tighter">Достижения</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">Цифровой реестр сертификатов</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          VERIFIED BY KAZUTB
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
        <StatCard label="Всего наград" value={certificates.length} icon={Award} colorClass="bg-indigo-50 text-indigo-600" description="Подтвержденные компетенции" />
        <StatCard label="Последний получен" value="15 Мар" icon={Calendar} colorClass="bg-emerald-50 text-emerald-600" description="React & Laravel Expert" />
        <StatCard label="Ранг студента" value="A+" icon={Star} colorClass="bg-amber-50 text-amber-600" description="Топ 5% в этом семестре" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR: FILTERS */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-10 text-left space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Поиск</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Название или код..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Категория</label>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all border ${
                      selectedCategory === cat 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="w-full py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                <Printer size={14} /> Печать реестра
            </button>
          </div>
        </div>

        {/* MAIN: CERTIFICATES GRID */}
        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredCerts.map((cert) => (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  key={cert.id}
                  className="group bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between"
                >
                  <div className="text-left">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Award size={24} />
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest">
                          {cert.type}
                        </span>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{cert.id_code}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                      {cert.title}
                    </h3>
                    <div className="flex items-center gap-4 text-slate-400">
                       <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold uppercase">{cert.date}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <Filter size={12} />
                          <span className="text-[10px] font-bold uppercase">{cert.category}</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex gap-2">
                    <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95">
                      <Download size={14} /> PDF
                    </button>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95">
                      <ExternalLink size={16} />
                    </button>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95">
                      <Share2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredCerts.length === 0 && (
            <div className="p-32 bg-white rounded-[32px] border border-dashed border-slate-200 text-center">
              <Database size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Сертификаты не найдены</h3>
              <button 
                onClick={() => {setSelectedCategory('Все'); setSearchQuery('');}} 
                className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
export default MyCertificates;