import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, VolumeX, Heart, ArrowRight, Clock, BookOpen } from 'lucide-react';

export const CourseCard = ({ course, toggleFavorite, isFavorite }) => {
  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);

  // Задержка перед воспроизведением
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 1000); 
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShowPreview(false);
  };

  return (
    <div 
      className="group bg-white rounded-[2.5rem] border border-slate-200/60 flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Media / Video Area --- */}
      <div className="relative h-56 m-2.5 rounded-[2rem] overflow-hidden bg-slate-900">
        {/* Основная обложка */}
        <img 
          src={course.image} 
          alt="" 
          className={`w-full h-full object-cover transition-all duration-700 ${showPreview ? 'scale-110 blur-sm opacity-50' : 'scale-100'}`} 
        />
        
        {/* Плеер (появляется через Framer Motion) */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-black"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-laptop-34440-large.mp4" // Тестовый ролик (замени на свой)
              />
              {/* Overlay элементы видео */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                   <Play size={10} className="text-white fill-white" />
                   <span className="text-[10px] font-black text-white uppercase tracking-tighter">Preview Mode</span>
                </div>
                <VolumeX size={14} className="text-white/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка избранного всегда сверху */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(course.id);
          }}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-95"
        >
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"} />
        </button>
      </div>

      {/* --- Content Area --- */}
      <div className="p-7 pt-2 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{course.category}</span>
            <span className="text-slate-300">•</span>
            <span>{course.level}</span>
        </div>

        <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 mb-8">
            <img src={course.author.avatar} className="w-7 h-7 rounded-full object-cover shadow-sm ring-2 ring-slate-50" alt="" />
            <span className="text-xs font-bold text-slate-600">{course.author.name}</span>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            <div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {course.duration}ч</div>
            <div className="flex items-center gap-1.5"><BookOpen size={14} className="text-blue-500" /> {course.lessons}</div>
          </div>
          <button className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-100 active:scale-90">
             <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};