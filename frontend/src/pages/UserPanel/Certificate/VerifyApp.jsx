import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CheckCircle2, AlertCircle, Calendar, 
  ArrowRight, ShieldCheck, Database, 
  ChevronLeft, Award, Globe, FileText, Trophy,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';

// --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ---
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

const CertificateVerify = () => {
  const [certNumber, setCertNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    
    // Очищаем номер от символа # и лишних пробелов
    const cleanNumber = certNumber.replace(/#/g, '').trim();
    
    if (!cleanNumber) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Отправляем на бэкенд уже очищенный номер
      const response = await api.get(`/certificates/verify/${cleanNumber}`);
      
      setTimeout(() => {
        setResult(response.data.data);
        setLoading(false);
      }, 600);
    } catch (err) {
      setTimeout(() => {
        setError(err.response?.data?.message || 'Идентификатор не найден в реестре');
        setLoading(false);
      }, 600);
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Верификация</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Официальный сервис проверки подлинности документов <br/> и квалификационных сертификатов платформы.
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-900 text-white shadow-lg">
             Реестр 2026
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-6 text-left">
          <form onSubmit={handleVerify} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="ID СЕРТИФИКАТА..." 
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold uppercase outline-none focus:border-blue-500 shadow-sm transition-all"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
              />
            </div>
            
            {/* КНОПКА ПОИСКА */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>ПРОВЕРИТЬ СТАТУС <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Система</p>
                  <p className="text-xl font-black text-slate-900 tracking-tight">Digital Sign</p>
               </div>
               <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={24} /></div>
            </div>
            <div className="pt-4 border-t border-slate-50">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
                 Все выданные сертификаты защищены уникальным UUID.
               </p>
            </div>
          </div>

          <StatCard 
            label="Безопасность" 
            value="SSL" 
            icon={Globe} 
            colorClass="bg-blue-50 text-blue-600" 
            description="Защищенное соединение" 
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 text-left">
          <AnimatePresence mode='wait'>
            {loading ? (
              <div className="h-64 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                 <RefreshCw className="animate-spin text-blue-600" size={32} />
              </div>
            ) : result ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
              >
                <div className="relative h-24 w-full bg-emerald-50 flex items-center justify-between px-8 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Award size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Документ верифицирован</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">#{result.certificate_number}</p>
                    </div>
                  </div>
                  <CheckCircle2 size={32} className="text-emerald-500 opacity-20" />
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Владелец</p>
                      <p className="text-xl font-black text-slate-900 uppercase">{result.student_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Статус в реестре</p>
                      <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 size={16} /> АКТИВЕН / ПОДЛИННЫЙ
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 mb-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Курс</p>
                    <h3 className="text-lg font-black text-slate-800 uppercase italic">
                      {result.course_title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed border-slate-200">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Дата выдачи</p>
                      <p className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1.5 mt-1">
                        <Calendar size={14} className="text-slate-300" /> {result.issued_at}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID Документа</p>
                      <p className="text-[11px] font-black text-slate-800 uppercase mt-1">{result.uuid || result.certificate_number}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-900 flex justify-center">
                   <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em]">Official Verification Record</p>
                </div>
              </motion.div>
            ) : error ? (
              <div className="bg-white border-2 border-red-50 rounded-3xl p-20 text-center flex flex-col items-center shadow-sm">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">Документ не найден</h3>
                <p className="text-[11px] font-medium text-slate-400 max-w-[240px] leading-relaxed uppercase">
                  {error}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                    <FileText size={32} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Ожидание запроса</h3>
                <p className="text-[11px] font-medium text-slate-300 max-w-[240px] leading-relaxed uppercase">
                  Введите идентификатор документа для проверки.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-left mt-16 pt-8 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-wide flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          Все данные передаются по защищенному протоколу.
        </p>
      </div>
    </main>
  );
};

export default CertificateVerify;