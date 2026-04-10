import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, Award, Calendar, User, ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const BookAnimation = ({ isLoading, isError, hasResult }) => {
  return (
    <div className="relative w-[450px] h-[600px] flex items-center justify-center" style={{ perspective: '2000px' }}>
      {/* Тень под книгой */}
      <div className="absolute bottom-10 w-[80%] h-10 bg-black/20 blur-3xl rounded-[100%]" />

      <motion.div 
        animate={{ 
          rotateY: hasResult ? -160 : 0,
          x: hasResult ? 150 : 0,
          scale: isLoading ? 1.05 : 1 
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        className="relative w-80 h-[480px] bg-slate-900 rounded-r-2xl shadow-[20px_20px_50px_rgba(0,0,0,0.3)] origin-left preserve-3d border-y border-r border-slate-800"
      >
        {/* Лицевая обложка */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-r-2xl border-l-[12px] border-black/30 flex flex-col items-center justify-center overflow-hidden" style={{ backfaceVisibility: 'hidden', zIndex: 10 }}>
            {/* Текстура обложки */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/10">
                    <Award className="text-blue-200/40" size={100} />
                </div>
                <div className="w-20 h-1 bg-blue-400/30 rounded-full mb-4" />
                <p className="text-blue-100/30 font-black text-[10px] uppercase tracking-[0.5em]">Digital Archive</p>
            </div>
        </div>

        {/* Внутренняя часть обложки (когда открыта) */}
        <div className="absolute inset-0 bg-slate-100 rounded-l-2xl shadow-inner rotate-y-180" style={{ backfaceVisibility: 'hidden' }}>
             <div className="p-10 opacity-20">
                <div className="w-full h-full border-2 border-slate-300 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={120} className="text-slate-400" />
                </div>
             </div>
        </div>

        {/* Анимированные страницы при загрузке */}
        <AnimatePresence>
          {isLoading && [1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -180 }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.8, 
                delay: i * 0.1,
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-gradient-to-l from-white to-slate-50 origin-left rounded-r-md border border-slate-200 shadow-sm"
              style={{ backfaceVisibility: 'hidden', zIndex: 5 - i }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Лист с результатом (лежит "внутри" книги) */}
      <AnimatePresence>
        {hasResult && (
            <motion.div 
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 160 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute w-[340px] h-[440px] bg-white shadow-2xl rounded-sm p-8 flex flex-col justify-between border-y border-r border-slate-100"
            >
                {/* Водяной знак на бумаге */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <Award size={250} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="px-3 py-1 bg-emerald-50 rounded text-emerald-600 text-[9px] font-black uppercase tracking-tighter border border-emerald-100">
                            Authentic
                        </div>
                        <ShieldCheck className="text-blue-600" size={24} />
                    </div>

                    <div className="space-y-6">
                        <div className="border-l-2 border-blue-600 pl-4">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student / Holder</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{hasResult.student_name}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Certified Course</p>
                            <p className="text-lg font-bold text-slate-700 leading-tight italic">«{hasResult.course_title}»</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Issue Date</p>
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                                <Calendar size={12} /> {hasResult.issued_at}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Verify ID</p>
                            <p className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-1 rounded italic uppercase">
                                {hasResult.certificate_number}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Ожидание ввода */}
      {!isLoading && !hasResult && !isError && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute z-20 flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-600">
            <Search size={40} />
          </div>
          <p className="text-blue-900 font-black text-[10px] uppercase tracking-[0.4em] bg-blue-50 px-4 py-2 rounded-full">System Ready</p>
        </motion.div>
      )}
    </div>
  );
};

const CertificateVerify = () => {
  const [certNumber, setCertNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certNumber.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.get(`/certificates/verify/${certNumber.trim()}`);
      setTimeout(() => {
        setResult(response.data.data);
        setLoading(false);
      }, 2000); 
    } catch (err) {
      setTimeout(() => {
        setError(err.response?.data?.message || 'Certificate not found in records');
        setLoading(false);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 lg:p-12 font-sans overflow-hidden">
      {/* Сетка на фоне */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />

      <button 
        onClick={() => navigate(-1)}
        className="fixed top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all z-50 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад к порталу
      </button>

      <div className="max-w-[1400px] w-full flex flex-col lg:flex-row items-center justify-between gap-20 relative z-10">
        
        {/* ЛЕВАЯ ЧАСТЬ: ИНТЕРФЕЙС */}
        <div className="w-full lg:max-w-md shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="text-left mb-12"
          >
            <div className="inline-block px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full mb-8">
              Verification Office
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.85]">
              Проверка <br /> <span className="text-blue-600 italic">документа.</span>
            </h1>
            <p className="text-slate-500 font-medium text-base leading-relaxed max-w-sm">
              Глобальная система верификации образовательных достижений. Введите уникальный ключ доступа ниже.
            </p>
          </motion.div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <ShieldCheck className="text-slate-300 group-focus-within:text-blue-600 transition-colors" size={24} />
              </div>
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
                placeholder="ID: CERT-2026-XXXX"
                className="w-full pl-16 pr-6 py-8 bg-white border-2 border-slate-200 rounded-3xl shadow-sm focus:ring-0 focus:border-blue-600 transition-all font-bold text-sm tracking-widest uppercase outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !certNumber}
              className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-30 active:scale-[0.98]"
            >
              {loading ? "Синхронизация..." : "Запустить валидацию"}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center gap-4 text-red-600 bg-red-50 p-6 rounded-2xl border border-red-100"
              >
                <AlertCircle size={24} />
                <p className="text-xs font-black uppercase tracking-tighter">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ВИЗУАЛИЗАЦИЯ */}
        <div className="w-full flex-1 flex justify-center lg:justify-end items-center">
             <BookAnimation isLoading={loading} isError={!!error} hasResult={result} />
        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;