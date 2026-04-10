import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, Calendar, ArrowLeft, ShieldCheck, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const BookAnimation = ({ isLoading, isError, errorMsg, hasResult }) => {
  const isOpen = (isLoading || hasResult || isError);
  const showFlippingPages = isLoading && !hasResult && !isError;

  return (
    <div className="relative w-full max-w-[700px] h-[500px] md:h-[650px] flex items-center justify-center" style={{ perspective: '3000px' }}>
      {/* Тень под книгой */}
      <motion.div 
        animate={{ 
          width: isOpen ? '120%' : '70%',
          opacity: isOpen ? 0.25 : 0.1,
          x: isOpen ? 120 : 60 
        }}
        className="absolute bottom-6 h-12 bg-black/40 blur-3xl rounded-[100%] transition-all duration-700" 
      />

      <motion.div 
        animate={{ x: isOpen ? 180 : 60 }} 
        transition={{ type: 'spring', stiffness: 35, damping: 14 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-72 md:w-[360px] h-[480px] md:h-[540px] origin-left"
      >
        {/* КОРЕШОК */}
        <div className="absolute left-0 top-0 w-[22px] h-full bg-slate-950 rounded-l-sm transform -translate-x-[14px] rotate-y-90" style={{ transformStyle: 'preserve-3d', zIndex: 60 }} />

        {/* ПЕРЕДНЯЯ ОБЛОЖКА */}
        <motion.div 
          animate={{ rotateY: isOpen ? -179.9 : 0 }}
          transition={{ type: 'spring', stiffness: 35, damping: 12 }}
          style={{ 
            transformStyle: 'preserve-3d', 
            transformOrigin: 'left center',
            zIndex: isOpen ? 10 : 100 
          }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-r-2xl border-l-[10px] border-black/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden" 
               style={{ backfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}>
            <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="relative z-10 flex flex-col items-center text-center p-8">
              {/* ЛОГОТИП НА ОБЛОЖКЕ */}
              <div className="mb-8 p-4 rounded-2xl bg-white shadow-xl">
                <img src="/images/icons/logo.png" alt="University Logo" className="w-24 h-24 object-contain" />
              </div>
              <p className="text-blue-100/40 font-black text-[10px] uppercase tracking-[0.5em]">Digital Records</p>
              <p className="text-white/20 text-[8px] mt-2 font-bold uppercase tracking-widest">Official University Registry</p>
            </div>
          </div>

          <div className="absolute inset-0 bg-white rounded-r-md shadow-inner" 
               style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
            <div className="p-10 space-y-6 relative z-10">
              <div className="h-2 w-full bg-slate-100 rounded-full" />
              <div className="h-2 w-5/6 bg-slate-50 rounded-full" />
              <div className="pt-20 flex justify-center opacity-10 grayscale">
                 <img src="/images/icons/logo.png" alt="watermark" className="w-32 opacity-30" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* АНИМИРОВАННЫЕ СТРАНИЦЫ */}
        <AnimatePresence>
          {showFlippingPages && (
            <motion.div key="flipping-container" exit={{ opacity: 0 }} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', zIndex: 30 }}>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: -179.8 }}
                  transition={{ duration: 1.2, delay: 0.2 + (i * 0.3), ease: [0.645, 0.045, 0.355, 1] }}
                  style={{ 
                    transformOrigin: 'left center',
                    backfaceVisibility: 'hidden',
                    zIndex: 20 + i, 
                    position: 'absolute',
                    inset: '4px 4px 4px 0px',
                    width: '100%',
                    transformStyle: 'preserve-3d',
                  }}
                  className="bg-white rounded-r-md border border-slate-200 shadow-sm"
                >
                  <div className="p-10 space-y-6">
                    <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-2 w-5/6 bg-slate-50 rounded-full" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ПРАВАЯ СТАТИЧНАЯ СТРАНИЦА */}
        {isOpen && (
          <div className="absolute inset-[4px] bg-white rounded-r-md border-l border-slate-200 shadow-inner" 
               style={{ zIndex: 5, transform: 'translateZ(-1px)' }}>
             <div className="p-12 space-y-6 opacity-20">
                <div className="h-2 w-full bg-slate-100 rounded-full" />
                <div className="h-2 w-5/6 bg-slate-100 rounded-full" />
             </div>
          </div>
        )}

        {/* ЗАДНЯЯ ОБЛОЖКА */}
        <div className="absolute inset-0 bg-slate-900 rounded-r-2xl border-l-[10px] border-black/40 shadow-sm" style={{ transform: 'translateZ(-5px)', zIndex: 1 }} />
      </motion.div>

      {/* РЕЗУЛЬТАТЫ */}
      <AnimatePresence>
        {(hasResult || isError) && (
          <motion.div 
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 260 }}
            exit={{ opacity: 0, x: 80 }}
            className={`absolute w-[340px] md:w-[400px] h-[460px] md:h-[520px] rounded-sm p-10 flex flex-col justify-between border z-[70] shadow-2xl ${
              isError ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'
            }`}
          >
            {hasResult && !isError ? (
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <img src="/images/icons/logo.png" alt="University" className="h-12 object-contain" />
                    <CheckCircle className="text-emerald-500" size={28} />
                  </div>
                  <div className="space-y-8">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">ФИО СТУДЕНТА</label>
                      <p className="text-2xl font-black text-slate-900 leading-tight">{hasResult.student_name}</p>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">КВАЛИФИКАЦИЯ / КУРС</label>
                      <p className="text-md font-bold text-slate-700 italic border-l-4 border-blue-600 pl-4">«{hasResult.course_title}»</p>
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-900 flex items-center gap-1"><Calendar size={14}/> {hasResult.issued_at}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1">Дата выдачи документа</p>
                  </div>
                  <p className="text-[10px] font-mono font-black bg-slate-900 text-white px-3 py-1.5 rounded">{hasResult.certificate_number}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                <div>
                  <AlertCircle className="text-red-600 mb-6" size={40} />
                  <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">ДОКУМЕНТ <br/><span className="text-red-600">НЕ НАЙДЕН</span></h2>
                  <p className="text-slate-600 font-bold text-sm mt-4 leading-relaxed">{errorMsg || "Введенный серийный номер отсутствует в базе данных университета."}</p>
                </div>
                <div className="pt-6 border-t border-red-200 text-[9px] font-black text-red-400 uppercase tracking-widest text-center">Проверьте правильность ввода ID</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


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
      }, 2500); 
    } catch (err) {
      setTimeout(() => {
        setError(err.response?.data?.message || 'ID не найден');
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-8 lg:pt-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-4 xl:gap-20">
          
          {/* ЛЕВЫЙ БЛОК */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="w-full lg:w-[45%] xl:w-[40%] order-2 lg:order-1"
          >
            <div className="mb-10">
              <h1 className="text-left text-4xl md:text-5xl xl:text-7xl text-slate-900 tracking-tighter mb-6 leading-tight font-medium">
                Контроль <br /> 
                <span className="text-blue-600">подлинности.</span>
              </h1>
              <p className="text-left text-slate-500 font-medium leading-relaxed border-l-4 border-blue-600 pl-5 text-lg">
                Мгновенная верификация университетских документов. Введите уникальный ID для подтверждения подлинности диплома или сертификата.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">База данных активна</span>
              </div>
              <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                 <ShieldCheck size={14} className="text-blue-600" />
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Защищенное соединение</span>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4 w-full">
              <div className="relative group">
                <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                <input 
                  type="text" 
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
                  placeholder="ID ДОКУМЕНТА: CERT-XXXX" 
                  className="w-full pl-14 pr-6 py-6 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-sm shadow-sm uppercase tracking-widest outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !certNumber}
                className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-30 flex items-center justify-center gap-4 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Проверить в базе</span>
                    <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* ПРАВЫЙ БЛОК: Анимация */}
          <div className="w-full lg:w-[55%] xl:w-[60%] flex justify-center items-center h-[500px] lg:h-[700px] relative order-1 lg:order-2 overflow-visible">
              <div className="scale-[0.7] sm:scale-90 xl:scale-110 transition-transform duration-500">
                <BookAnimation 
                  isLoading={loading} 
                  isError={!!error} 
                  errorMsg={error} 
                  hasResult={result} 
                />
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;