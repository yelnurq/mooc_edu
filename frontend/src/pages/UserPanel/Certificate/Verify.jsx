import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, Award, Calendar, User, ArrowLeft, ShieldCheck, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

// --- КОМПОНЕНТ АНИМАЦИИ КНИГИ ---
const BookAnimation = ({ isLoading, isError, hasResult }) => {
  return (
    <div className="relative w-[500px] h-[600px] flex items-center justify-center" style={{ perspective: '2500px' }}>
      {/* Тень */}
      <motion.div 
        animate={{ 
          width: (isLoading || hasResult) ? '120%' : '80%',
          opacity: (isLoading || hasResult) ? 0.4 : 0.2
        }}
        className="absolute bottom-10 h-12 bg-black/40 blur-3xl rounded-[100%] transition-all duration-700" 
      />

      {/* ГЛАВНЫЙ КОНТЕЙНЕР КНИГИ */}
      <motion.div 
        animate={{ 
          x: (isLoading || hasResult) ? 150 : 0, // Сдвигаем книгу вправо, когда она открыта
        }}
        transition={{ type: 'spring', stiffness: 40, damping: 12 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-80 h-[520px] origin-left"
      >
        {/* КОРЕШОК (Spine) */}
        <div className="absolute left-0 top-0 w-[24px] h-full bg-slate-950 rounded-l-sm transform -translate-x-[12px] rotate-y-90" style={{ transformStyle: 'preserve-3d', zIndex: 50 }} />

        {/* ПЕРЕДНЯЯ ОБЛОЖКА (Теперь она анимируется отдельно) */}
        <motion.div 
          animate={{ rotateY: (isLoading || hasResult) ? -180 : 0 }}
          transition={{ type: 'spring', stiffness: 40, damping: 12 }}
          style={{ 
            transformStyle: 'preserve-3d', 
            transformOrigin: 'left center',
            zIndex: (isLoading || hasResult) ? 10 : 100 // Уходит вниз, когда открыта
          }}
          className="absolute inset-0 cursor-pointer"
        >
          {/* Лицевая сторона обложки */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-r-2xl border-l-[10px] border-black/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden" 
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
                <Award className="text-blue-200/50" size={100} />
              </div>
              <p className="text-blue-100/40 font-black text-xs uppercase tracking-[0.6em]">Digital Archive</p>
            </div>
            <div className="absolute inset-4 border border-blue-400/10 rounded-xl pointer-events-none" />
          </div>

          {/* Внутренняя сторона обложки (видна после открытия) */}
          <div 
            className="absolute inset-0 bg-slate-200 rounded-l-2xl shadow-inner border-r-4 border-slate-300" 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            <div className="p-12 h-full flex items-center justify-center">
               <ShieldCheck size={140} className="text-slate-400/20" />
            </div>
          </div>
        </motion.div>

   
        {/* ЗАДНЯЯ ОБЛОЖКА (Основание книги) */}
        <div 
          className="absolute inset-0 bg-slate-900 rounded-r-2xl border-l-[10px] border-black/40 shadow-sm"
          style={{ transform: 'translateZ(-1px)', zIndex: 1 }}
        />
      </motion.div>

      {/* СЕРТИФИКАТ (Выезжает, когда книга полностью открыта) */}
      <AnimatePresence>
        {hasResult && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 170 }}
            transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
            className="absolute w-[380px] h-[480px] bg-white shadow-[40px_40px_70px_rgba(0,0,0,0.2)] rounded-sm p-10 flex flex-col justify-between border border-slate-100 z-[60]"
          >
            {/* ... содержимое сертификата остается прежним ... */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
                <Award size={300} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Official Document</span>
                  <div className="h-1 w-12 bg-blue-600 rounded-full" />
                </div>
                <CheckCircle className="text-emerald-500" size={28} />
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Student Name</label>
                  <p className="text-3xl font-black text-slate-900 uppercase leading-none">{hasResult.student_name}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Certification</label>
                  <p className="text-lg font-bold text-slate-700 italic border-l-4 border-blue-600 pl-4">«{hasResult.course_title}»</p>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Issue Date</p>
                  <p className="text-xs font-black text-slate-900">{hasResult.issued_at}</p>
                </div>
                <div className="text-right font-mono text-[10px] font-bold bg-slate-100 px-3 py-1 rounded">
                   {hasResult.certificate_number}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
 
    </div>
  );
};

// --- ОСНОВНАЯ СТРАНИЦА ---
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
      // Искусственная задержка для красоты анимации
      setTimeout(() => {
        setResult(response.data.data);
        setLoading(false);
      }, 2500); 
    } catch (err) {
      setTimeout(() => {
        setError(err.response?.data?.message || 'Certificate ID not recognized in our database');
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 lg:p-12 font-sans overflow-hidden">
      {/* Фоновый декор */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-300/30 blur-[120px] rounded-full" />

      <button 
        onClick={() => navigate(-1)}
        className="fixed top-10 left-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all z-50 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Вернуться назад
      </button>

      <div className="max-w-[1500px] w-full flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* ФОРМА (Слева) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:max-w-lg shrink-0"
        >
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-[2px] w-12 bg-blue-600" />
               <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">Secured Gateway</span>
            </div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.8]">
              Валидация <br /> <span className="text-blue-600">статуса.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm">
              Введите серийный номер документа для мгновенного подтверждения его подлинности через реестр.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                <BookOpen className="text-slate-300 group-focus-within:text-blue-600 transition-colors" size={28} />
              </div>
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
                placeholder="HOMEP: CERT-XXXX..."
                className="w-full pl-20 pr-8 py-9 bg-white border-2 border-slate-200 rounded-[2rem] shadow-sm focus:ring-0 focus:border-blue-600 transition-all font-black text-base tracking-widest uppercase outline-none placeholder:text-slate-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !certNumber}
              className="w-full py-7 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] disabled:opacity-30 active:scale-[0.97] flex items-center justify-center gap-4"
            >
              {loading ? (
                 <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : "Проверить в архиве"}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="mt-10 flex items-start gap-5 text-red-600 bg-red-50 p-8 rounded-3xl border border-red-100 shadow-sm"
              >
                <div className="p-2 bg-red-100 rounded-lg"><AlertCircle size={24} /></div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Проверка отклонена</p>
                    <p className="text-sm font-bold opacity-80">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ВИЗУАЛИЗАЦИЯ (Справа) */}
        <div className="w-full flex-1 flex justify-center lg:justify-end items-center">
             <BookAnimation isLoading={loading} isError={!!error} hasResult={result} />
        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;