import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, VolumeX, Heart, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Для корректной работы этого компонента, Laravel должен возвращать:
 * 1. category (объект с полем name)
 * 2. modules_count (через ->withCount('modules'))
 * 3. lessons_count (через ->withCount('lessons'))
 */

const ASSET_URL = "http://localhost:8000/storage/";

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

  // YouTube Preview
  const videoId = "dQw4w9WgXcQ"; 
  const youtubeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1`;

  return (
    <div 
      className="group bg-white rounded-[2.5rem] border border-slate-200/60 flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden relative h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Media Area --- */}
      <div className="relative h-56 m-2.5 rounded-[2rem] overflow-hidden bg-slate-900">
        <img 
          src={`${ASSET_URL}${course.image}`}
          alt={course.title} 
          className={`w-full h-full object-cover transition-all duration-700 ${showPreview ? 'scale-110 blur-md opacity-30' : 'scale-100'}`} 
        />
        
        {/* YouTube Preview Wrapper */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 pointer-events-none"
            >
              <iframe
                className="w-full h-[150%] -translate-y-[15%] pointer-events-none"
                src={youtubeSrc}
                title="Course Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              
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
            e.preventDefault();
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
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {course.category?.name || 'Общее'}
            </span>
            <span className="text-slate-300">•</span>
            <span>{course.level || 'Все уровни'}</span>
        </div>

        <h3 className="text-left text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {course.author && (
          <div className="flex items-center gap-3 mb-6">
              <img src={course.author.avatar} className="w-7 h-7 rounded-full object-cover shadow-sm ring-2 ring-slate-50" alt="" />
              <span className="text-xs font-bold text-slate-600">{course.author.name}</span>
          </div>
        )}

        {/* --- Stats Footer --- */}
        <div className="mt-auto space-y-5">
          <div className="flex items-center gap-6 pt-5 border-t border-slate-50">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Модули</span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Layers size={14} className="text-blue-600" />
                </div>
                {course.modules_count || 0}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Уроки</span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <BookOpen size={14} className="text-indigo-600" />
                </div>
                {course.lessons_count || 0}
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-50">
            <Link 
              to={`/courses/${course.id}`}
              className="flex items-center justify-center w-full gap-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-900 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all group/btn shadow-sm"
            >
              Подробнее 
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;