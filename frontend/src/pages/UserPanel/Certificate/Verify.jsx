import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, Award, Calendar, ArrowLeft, ShieldCheck, BookOpen, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const BookAnimation = ({ isLoading, isError, errorMsg, hasResult }) => {
  const isOpen = (isLoading || hasResult || isError);
  const showFlippingPages = isLoading && !hasResult && !isError;

  return (
    <div className="relative w-[500px] h-[600px] flex items-center justify-center" style={{ perspective: '2500px' }}>
      {/* Тень под книгой */}
      <motion.div 
        animate={{ 
          width: isOpen ? '120%' : '80%',
          opacity: isOpen ? 0.3 : 0.15,
          x: isOpen ? 40 : 0
        }}
        className="absolute bottom-10 h-12 bg-black/40 blur-3xl rounded-[100%] transition-all duration-700" 
      />

      <motion.div 
        animate={{ x: isOpen ? 150 : 0 }}
        transition={{ type: 'spring', stiffness: 40, damping: 14 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-80 h-[520px] origin-left"
      >
        {/* КОРЕШОК */}
        <div className="absolute left-0 top-0 w-[19px] h-full bg-slate-950 rounded-l-sm transform -translate-x-[12px] rotate-y-90" style={{ transformStyle: 'preserve-3d', zIndex: 60 }} />

        {/* ПЕРЕДНЯЯ ОБЛОЖКА */}
        <motion.div 
          animate={{ rotateY: isOpen ? -180 : 0 }}
          transition={{ type: 'spring', stiffness: 40, damping: 12 }}
          style={{ 
            transformStyle: 'preserve-3d', 
            transformOrigin: 'left center',
            zIndex: isOpen ? 10 : 100 
          }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-r-2xl border-l-[10px] border-black/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
                <Award className="text-blue-200/50" size={100} />
              </div>
              <p className="text-blue-100/40 font-black text-[10px] uppercase tracking-[0.5em]">Digital Records</p>
            </div>
          </div>

          <div className="absolute inset-0 bg-slate-200 rounded-l-2xl shadow-inner border-r-4 border-slate-300" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            <div className="p-12 h-full flex items-center justify-center">
               <ShieldCheck size={140} className="text-slate-400/20" />
            </div>
          </div>
        </motion.div>

  {/* ЛЕВАЯ СТАТИЧНАЯ СТРАНИЦА */}
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: isOpen ? 1 : 0 }}
  transition={{ delay: 0.5 }}
  className="absolute inset-[4px] bg-white rounded-l-md border-r border-slate-200 overflow-hidden"
  style={{ 
    transform: 'rotateY(-180deg)', 
    transformOrigin: 'left center', 
    zIndex: 10 // Базовый уровень стопки
  }}
>
  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
  <div className="p-10 space-y-6 relative z-10">
    <div className="h-2 w-full bg-slate-100 rounded-full" />
    <div className="h-2 w-5/6 bg-slate-50 rounded-full" />
    <div className="h-2 w-4/6 bg-slate-100 rounded-full" />
  </div>
  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent" />
</motion.div>

{/* АНИМИРОВАННЫЕ СТРАНИЦЫ */}
<AnimatePresence>
  {showFlippingPages && (
    <motion.div 
      key="flipping-container"
      exit={{ opacity: 0 }} 
      className="absolute inset-0"
      style={{ transformStyle: 'preserve-3d', zIndex: 50 }} // Контейнер всегда сверху
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ rotateY: 0, x: 0, opacity: 1 }}
          animate={{ 
            rotateY: -180,
            x: -i * 0.8, // Чуть увеличил сдвиг для видимости стопки
            scale: 1 - (i * 0.002),
          }}
          transition={{ 
            repeat: 0, 
            duration: 1.5, 
            delay: i * 0.3, // Ускорил темп
            ease: [0.645, 0.045, 0.355, 1] 
          }}
          style={{ 
            transformOrigin: 'left center',
            backfaceVisibility: 'hidden',
            zIndex: 100 - i, // Важно: каждая новая страница ДОЛЖНА быть выше предыдущей в стопке
            position: 'absolute',
            inset: '4px',
            transformStyle: 'preserve-3d',
          }}
          className="bg-white rounded-r-md border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Тень при перевороте */}
          <motion.div 
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, delay: i * 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent w-[200%]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent w-10 h-full" />
          <div className="p-10 space-y-6">
            <div className="h-2 w-full bg-slate-100 rounded-full" />
            <div className="h-2 w-5/6 bg-slate-50 rounded-full" />
            <div className="h-2 w-4/6 bg-slate-100 rounded-full" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>
{/* АНИМИРОВАННЫЕ СТРАНИЦЫ: ЭФФЕКТ НАКОПЛЕНИЯ СТОПКИ СЛЕВА (Physically Accurate Flip) */}
<AnimatePresence mode="wait">
  {showFlippingPages && (
    <motion.div 
      key="flipping-container"
      exit={{ opacity: 0 }} 
      className="absolute inset-0"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          // --- НАЧАЛЬНОЕ СОСТОЯНИЕ (Страница справа) ---
          initial={{ 
            rotateY: 0, 
            skewY: 0, 
            scaleX: 1, 
            x: 0,
            opacity: 1 // Страница видна, когда она справа
          }}
          
          // --- АНИМАЦИЯ (Page Flip) ---
          animate={{ 
            rotateY: -180, // Полный переворот влево
            skewY: [0, -12, 0], // Имитация изгиба
            scaleX: [1, 0.9, 1], // Имитация сжатия в центре дуги
            
            // --- ЭФФЕКТ НАКОПЛЕНИЯ (Конечная точка слева) ---
            // Мы немного сдвигаем страницы влево и уменьшаем масштаб,
            // чтобы создать "стопку" с эффектом перспективы.
            x: -i * 0.5, 
            scale: 1 - (i * 0.001), 
          }}
          
          // --- НАСТРОЙКИ ПЕРЕХОДА ---
          transition={{ 
            // КРИТИЧНО: repeat: 0. Страницы НЕ должны крутиться бесконечно.
            repeat: 0, 
            duration: 1.8, 
            // Задержка между страницами, чтобы они ложились по очереди
            delay: i * 0.5, 
            ease: [0.645, 0.045, 0.355, 1] 
          }}
          
          // --- СТИЛИ ---
          style={{ 
            transformOrigin: 'left center',
            backfaceVisibility: 'hidden', // Скрываем "спину" страницы
            
            // Расчет z-index: страницы должны быть выше обложки (10).
            // Чтобы верхняя страница стопки была последней приземлившейся:
            zIndex: 40 + i, 
            
            position: 'absolute',
            inset: '4px',
            transformStyle: 'preserve-3d',
          }}
          className="bg-white rounded-r-md border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Динамическая тень на странице при повороте */}
          <motion.div 
            animate={{ 
              opacity: [0, 0.3, 0],
              x: ['-100%', '0%', '100%'] 
            }}
            transition={{ 
              repeat: 0, // Тень тоже один раз
              duration: 1.8, 
              delay: i * 0.5,
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent w-[200%]"
          />

          {/* Контент страницы (мягкий градиент у корешка) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent w-10 h-full" />
          <div className="p-10 space-y-6">
            <div className="h-2 w-full bg-slate-100 rounded-full" />
            <div className="h-2 w-5/6 bg-slate-50 rounded-full" />
            <div className="h-2 w-4/6 bg-slate-100 rounded-full" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>
{/* ПРАВАЯ СТАТИЧНАЯ СТРАНИЦА */}
<AnimatePresence>
  {isOpen && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-[4px] bg-white rounded-r-md border-l border-slate-200" 
      style={{ zIndex: 5 }}
    >
       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
    </motion.div>
  )}
</AnimatePresence>
        {/* ЗАДНЯЯ ОБЛОЖКА */}
        <div className="absolute inset-0 bg-slate-900 rounded-r-2xl border-l-[10px] border-black/40 shadow-sm" style={{ transform: 'translateZ(-2px)', zIndex: 1 }} />
      </motion.div>

      {/* ВЫЛЕТАЮЩИЕ ДОКУМЕНТЫ (РЕЗУЛЬТАТ ИЛИ ОШИБКА) */}
      <AnimatePresence>
        {/* КЕЙС: УСПЕХ */}
        {hasResult && !isError && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 170 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
            className="absolute w-[380px] h-[480px] bg-white shadow-[40px_40px_70px_rgba(0,0,0,0.2)] rounded-sm p-10 flex flex-col justify-between border border-slate-100 z-[70]"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
                <Award size={300} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Official Document</span>
                  <div className="h-1 w-12 bg-blue-600 rounded-full" />
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle className="text-emerald-500" size={24} />
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <p className="text-3xl font-black text-slate-900 leading-none">{hasResult.student_name}</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Qualification</label>
                  <p className="text-lg font-bold text-slate-700 italic border-l-4 border-blue-600 pl-4">«{hasResult.course_title}»</p>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Issue Date</p>
                  <p className="text-xs font-black text-slate-900 leading-none flex items-center gap-1"><Calendar size={12}/> {hasResult.issued_at}</p>
                </div>
                <p className="text-[10px] font-mono font-black bg-slate-900 text-white px-3 py-1.5 rounded">
                    {hasResult.certificate_number}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* КЕЙС: ОШИБКА */}
        {isError && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 170 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
            className="absolute w-[380px] h-[480px] bg-red-50 shadow-[40px_40px_70px_rgba(220,38,38,0.15)] rounded-sm p-10 flex flex-col justify-between border border-red-100 z-[70]"
          >
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
                <XCircle size={300} className="text-red-200" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">System Alert</span>
                  <div className="h-1 w-12 bg-red-600 rounded-full" />
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-4xl font-black text-slate-900 leading-[0.9]">ДОКУМЕНТ <br/><span className="text-red-600">НЕ НАЙДЕН</span></h2>
                <div className="h-[2px] w-full bg-red-200" />
                <p className="text-slate-600 font-bold text-sm leading-relaxed">
                  {errorMsg || "Введенный серийный номер отсутствует в базе данных или был аннулирован."}
                </p>
              </div>

              <div className="pt-8 border-t border-red-200">
                 <p className="text-[9px] font-bold text-red-400 uppercase tracking-[0.2em]">Пожалуйста, проверьте корректность ввода и повторите попытку.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ЭКРАН ОЖИДАНИЯ */}
      {!isLoading && !hasResult && !isError && (
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute z-[110] flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex items-center justify-center text-blue-600 border border-white">
            <Search size={48} strokeWidth={2.5} />
          </div>
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
      }, 2500); 
    } catch (err) {
      setTimeout(() => {
        setError(err.response?.data?.message || 'ID не распознан');
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 lg:p-12 font-sans overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-10 left-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all z-50 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Назад
      </button>

      <div className="max-w-[1500px] w-full flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:max-w-lg">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-[2px] w-12 bg-blue-600" />
               <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">Verify Module</span>
            </div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.8]">
              Валидация <br /> <span className="text-blue-600">статуса.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm">
              Введите серийный номер для мгновенного подтверждения подлинности через реестр.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                <BookOpen className="text-slate-300" size={28} />
              </div>
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
                placeholder="CERT-XXXX-XXXX"
                className="w-full pl-20 pr-8 py-9 bg-white border-2 border-slate-200 rounded-[2rem] focus:border-blue-600 transition-all font-black tracking-widest uppercase outline-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !certNumber}
              className="w-full py-7 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-4"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Проверить архив"}
            </button>
          </form>
        </motion.div>

        <div className="w-full flex-1 flex justify-center lg:justify-end items-center">
          <BookAnimation 
            isLoading={loading} 
            isError={!!error} 
            errorMsg={error} 
            hasResult={result} 
          />
        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;