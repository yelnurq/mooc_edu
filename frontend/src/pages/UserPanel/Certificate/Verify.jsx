import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, Award, Calendar, User, ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const BookAnimation = ({ isLoading, isError, hasResult }) => {
  return (
    <div className="relative w-64 h-80 flex items-center justify-center">
      {/* Основа книги */}
      <motion.div 
        animate={{ 
          rotateY: hasResult ? -10 : 0,
          scale: isLoading ? 1.1 : 1 
        }}
        className="relative w-48 h-64 bg-slate-900 rounded-r-lg shadow-2xl origin-left preserve-3d"
        style={{ perspective: '1000px' }}
      >
        {/* Обложка */}
        <div className="absolute inset-0 bg-blue-700 rounded-r-lg border-l-8 border-blue-900 flex items-center justify-center">
           <Award className="text-blue-100/20" size={80} />
        </div>

        {/* Анимированные страницы (только при загрузке) */}
        <AnimatePresence>
          {isLoading && [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -180 }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.6, 
                delay: i * 0.2,
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-white origin-left rounded-r-sm border border-slate-100"
              style={{ backfaceVisibility: 'hidden' }}
            />
          ))}
        </AnimatePresence>

        {/* Состояние ошибки - книга захлопнута и красная подсветка */}
        {isError && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-red-900/20 rounded-r-lg shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          />
        )}
      </motion.div>

      {/* Иконка поиска, парящая над книгой в ожидании */}
      {!isLoading && !hasResult && !isError && (
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute z-10 text-blue-500 bg-white p-4 rounded-full shadow-xl"
        >
          <Search size={32} />
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
      // Имитируем небольшую задержку, чтобы анимация страниц была заметна
      setTimeout(() => {
        setResult(response.data.data);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setTimeout(() => {
        setError(err.response?.data?.message || 'Сертификат не найден');
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 lg:p-20 font-sans overflow-hidden">
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all z-50"
      >
        <ArrowLeft size={16} /> Назад
      </button>

      <div className="max-w-[1300px] w-full flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* ЛЕВАЯ ЧАСТЬ: ФОРМА */}
        <div className="w-full lg:max-w-md shrink-0 z-10">
          <div className="text-left mb-10">
            <h1 style={{ fontWeight: 500 }} className="text-5xl text-slate-900 tracking-tighter mb-6 leading-[0.9]">
              Проверка <br /> сертификата
            </h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed border-l-4 border-blue-600 pl-4">
              Введите идентификационный номер для подтверждения подлинности документа в реестре.
            </p>
          </div>

          <form onSubmit={handleVerify} className="relative group">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
                placeholder="CERT-XXXX-XXXX"
                className="w-full pl-16 pr-6 py-6 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-xs tracking-widest uppercase outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !certNumber}
              className="mt-4 w-full py-5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-20"
            >
              {loading ? "Ищем в архивах..." : <><CheckCircle size={14}/> Проверить подлинность</>}
            </button>
          </form>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: АНИМАЦИЯ И РЕЗУЛЬТАТ */}
        <div className="w-full flex-1 flex flex-col items-center lg:items-end justify-center min-h-[500px] relative">
          
          <div className="relative flex items-center justify-center w-full max-w-2xl">
            {/* Сама книга */}
            <div className="absolute lg:right-0">
               <BookAnimation isLoading={loading} isError={!!error} hasResult={!!result} />
            </div>

            {/* Контент поверх или рядом */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="bg-white/80 backdrop-blur-md border border-red-100 p-8 rounded-[2rem] shadow-xl text-center lg:text-right max-w-xs z-20 mr-20"
                >
                  <AlertCircle size={32} className="text-red-500 mb-4 ml-auto" />
                  <p className="font-black text-[10px] uppercase text-red-400 mb-1">Ошибка доступа</p>
                  <p className="text-slate-800 font-bold">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className="bg-white p-10 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-white w-full z-20"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Запись найдена</span>
                  </div>

                  <div className="space-y-8 mb-10">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <User size={12} className="text-blue-600" /> Владелец
                      </p>
                      <p className="text-3xl font-black text-slate-900">{result.student_name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <BookOpen size={12} className="text-blue-600" /> Программа
                      </p>
                      <p className="text-xl font-bold text-slate-700 italic">«{result.course_title}»</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Выдан</p>
                      <p className="text-sm font-black text-slate-900">{result.issued_at}</p>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-600 font-mono text-xs font-bold">
                      {result.certificate_number}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;