import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star, BookOpen, CheckCircle2, PlayCircle, Heart, ArrowRight } from 'lucide-react';

export const CourseCard = ({ course, toggleFavorite, isFavorite }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);

  // Логика задержки в 1.5 секунды
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 1000); // Поставил 1 сек, 1.5 может показаться слишком долгим в вебе
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };

  return (
    <div 
      className="group bg-white rounded-[2.5rem] border border-slate-200/60 flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Media Area --- */}
      <div className="relative h-56 m-2.5 rounded-[2rem] overflow-hidden bg-slate-100">
        <img src={course.image} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        
        {/* Визуальный индикатор, что можно навести для видео/инфо */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <PlayCircle className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500" size={48} />
        </div>

        <button 
          onClick={() => toggleFavorite(course.id)}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-sm transition-all hover:scale-110"
        >
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"} />
        </button>
      </div>

      {/* --- TOOLTIP (Framer Motion) --- */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-x-2.5 top-2.5 bottom-2.5 z-20 bg-slate-900/95 backdrop-blur-md rounded-[2rem] p-6 text-white flex flex-col shadow-2xl border border-white/10"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Программа курса</span>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold">{course.rating}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
               {/* Пример программы обучения */}
               {['Основы архитектуры', 'Работа с базой данных', 'Тестирование и Deploy'].map((step, idx) => (
                 <div key={idx} className="flex items-center gap-3">
                   <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                   <span className="text-xs font-medium text-slate-200">{step}</span>
                 </div>
               ))}
            </div>

            <div className="mt-auto flex flex-col gap-3">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                  "Узнайте, как строить масштабируемые приложения на {course.category} с нуля до уровня Pro."
                </p>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-900/20">
                  Смотреть интро
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Standard Content --- */}
      <div className="p-7 pt-2 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>{course.category}</span>
            <span className="text-slate-300">•</span>
            <span>{course.level}</span>
        </div>

        <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 mb-8">
            <img src={course.author.avatar} className="w-7 h-7 rounded-full object-cover shadow-sm" alt="" />
            <span className="text-xs font-bold text-slate-600">{course.author.name}</span>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            <div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {course.duration}ч</div>
            <div className="flex items-center gap-1.5"><BookOpen size={14} className="text-blue-500" /> {course.lessons}</div>
          </div>
          <button className="p-2.5 bg-slate-100 text-slate-900 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
             <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};