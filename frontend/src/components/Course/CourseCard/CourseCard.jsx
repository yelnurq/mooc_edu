import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, VolumeX, Heart, ArrowRight, 
  BookOpen, Layers, User, Share2, Check 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ASSET_URL = "http://localhost:8000/storage/";

export const CourseCard = ({ course, toggleFavorite, isFavorite }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const courseUrl = `${window.location.origin}/courses/${course.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: course.title,
        url: courseUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(courseUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const videoId = course.preview_video_id || "dQw4w9WgXcQ"; 
  const youtubeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`;

  return (
    <Link 
      to={`/courses/${course.id}`}
      className="group bg-white rounded-3xl border border-slate-200 flex flex-col hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden relative h-full cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Media Area --- */}
      <div className="relative h-56 m-3 rounded-2xl overflow-hidden bg-slate-900">
        <img 
          src={course.image && `${ASSET_URL}${course.image}`}
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-2 bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg">
                   <Play size={10} className="text-white fill-white" />
                   <span className="text-[9px] font-black text-white uppercase tracking-wider">Live Preview</span>
                </div>
                <VolumeX size={14} className="text-white/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <div 
            role="button"
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-sm transition-all hover:bg-white active:scale-95 group/share cursor-pointer flex items-center justify-center border border-slate-100"
          >
            {copied ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Share2 size={16} className="text-slate-400 group-hover/share:text-blue-600" />
            )}
            
            <AnimatePresence>
              {copied && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap shadow-xl"
                >
                  Скопировано
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div 
            role="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(course.id);
            }}
            className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-sm transition-all hover:bg-white active:scale-95 group/heart cursor-pointer flex items-center justify-center border border-slate-100"
          >
            <Heart 
              size={16} 
              className={`${isFavorite ? "fill-red-500 text-red-500" : "text-slate-400 group-hover/heart:text-red-500"}`} 
            />
          </div>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="p-7 pt-2 flex flex-col flex-1 text-left">
        <div className="flex items-center gap-2 mb-4">      
            <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-blue-100/50">
              {course.category?.name || 'General'}
            </span>
        </div>

        <h3 className="text-xl font-black text-slate-900 leading-[1.3] mb-8 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* --- Stats & Author Footer --- */}
        <div className="mt-auto">
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center gap-5">
                {/* Модули */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Модули</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Layers size={13} className="text-blue-600" />
                    {course.modules_count || 0}
                  </div>
                </div>

                {/* Уроки */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Уроки</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <BookOpen size={13} className="text-indigo-600" />
                    {course.lessons_count || 0}
                  </div>
                </div>

                {/* Автор (теперь здесь) */}
                <div className="flex flex-col gap-1.5 border-l border-slate-100 pl-5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Автор</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] truncate">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{course.author_display_name || 'Expert'}</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;