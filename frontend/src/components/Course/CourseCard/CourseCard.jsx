import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, VolumeX, Heart, ArrowRight, BookOpen, Layers, User } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  // YouTube ID берем из данных или оставляем дефолтный
  const videoId = course.preview_video_id || "dQw4w9WgXcQ"; 
  const youtubeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`;

  return (
    <Link 
      to={`/courses/${course.id}`}
      className="group bg-white rounded-[2.5rem] border border-slate-200/60 flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden relative h-full cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Media Area --- */}
      <div className="relative h-56 m-2.5 rounded-[2rem] overflow-hidden bg-slate-900">
        <img 
          src={course.image ? `${ASSET_URL}${course.image}` : '/api/placeholder/400/320'}
          alt={course.title} 
          className={`w-full h-full object-cover transition-all duration-700 ${showPreview ? 'scale-110 blur-md opacity-30' : 'scale-100 group-hover:scale-105'}`} 
        />
        
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
                   <span className="text-[9px] font-black text-white uppercase tracking-wider">Preview</span>
                </div>
                <VolumeX size={14} className="text-white/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка "Избранное" — используем div с ролью кнопки, чтобы не вкладывать button в link */}
        <div 
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(course.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFavorite(course.id);
            }
          }}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-white/90 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-95 group/heart cursor-pointer"
        >
          <Heart 
            size={16} 
            className={`${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400 group-hover/heart:text-red-400"}`} 
          />
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="p-7 pt-2 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">      
            <span className="text-left text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {course.category?.name || 'Общее'}
            </span>
        </div>

        <h3 className="text-left text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* --- Author Block --- */}
        <div className="flex items-center gap-3 mb-6">
            {course.author?.avatar ? (
              <img 
                src={course.author.avatar} 
                className="w-7 h-7 rounded-full object-cover shadow-sm ring-2 ring-slate-50" 
                alt={course.author_display_name} 
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-slate-50">
                <User size={12} className="text-slate-400" />
              </div>
            )}
            <span className="text-xs font-bold text-slate-600">
              {course.author_display_name || 'Инструктор'}
            </span>
        </div>

        {/* --- Stats Footer --- */}
        <div className="mt-auto">
          <div className="flex items-center justify-between pt-5 border-t border-slate-50">
            <div className="flex items-center gap-4">
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

            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;