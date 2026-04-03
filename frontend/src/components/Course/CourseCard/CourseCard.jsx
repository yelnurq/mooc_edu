import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, VolumeX, Heart, ArrowRight, Clock, BookOpen } from 'lucide-react';

export const CourseCard = ({ course, toggleFavorite, isFavorite }) => {
  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 1000); 
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShowPreview(false);
  };

  // Фейковая ссылка на YouTube (используем embed версию с параметрами)
  // controls=0 (скрыть кнопки), autoplay=1 (автозапуск), mute=1 (без звука), loop=1 (по кругу)
  const videoId = "dQw4w9WgXcQ"; // Классика, либо поставь любой другой ID
  const youtubeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1`;

  return (
    <div 
      className="group bg-white rounded-[2.5rem] border border-slate-200/60 flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Media Area --- */}
      <div className="relative h-56 m-2.5 rounded-[2rem] overflow-hidden bg-slate-900">
        <img 
          src={course.image} 
          alt="" 
          className={`w-full h-full object-cover transition-all duration-700 ${showPreview ? 'scale-110 blur-md opacity-30' : 'scale-100'}`} 
        />
        
        {/* YouTube Preview Wrapper */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 pointer-events-none" // pointer-events-none чтобы клики не уходили в iframe
            >
              <iframe
                className="w-full h-[150%] -translate-y-[15%] pointer-events-none" // Увеличиваем высоту и смещаем, чтобы скрыть черные полосы YouTube
                src={youtubeSrc}
                title="Course Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              
              {/* Overlay для стиля */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-2 bg-blue-600 px-2 py-1 rounded-lg shadow-lg">
                   <Play size={10} className="text-white fill-white" />
                   <span className="text-[9px] font-black text-white uppercase tracking-wider">Live Preview</span>
                </div>
                <VolumeX size={14} className="text-white/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <h3 className="text-left text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
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