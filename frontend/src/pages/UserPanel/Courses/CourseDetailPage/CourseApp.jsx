import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle, Menu, X, 
  ChevronRight, Lock, Check, Layout, 
  Maximize2, Minimize2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

const CourseAppPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState([0]);

  // Ссылка для автоматического скролла к активному уроку
  const activeLessonRef = useRef(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/courses/${id}`);
        const data = response.data;
        
        setCourse(data);
        const completedIds = (data.completed_lessons_ids || []).map(id => Number(id));
        setCompletedLessons(completedIds);
        
        const allLessons = data.modules?.flatMap(m => m.lessons) || [];
        const nextToComplete = allLessons.find(l => !completedIds.includes(Number(l.id)));
        
        const initialLesson = nextToComplete || allLessons[0];
        setActiveLesson(initialLesson);

        if (initialLesson) {
          const mIdx = data.modules.findIndex(m => 
            m.lessons.some(l => Number(l.id) === Number(initialLesson.id))
          );
          if (mIdx !== -1) setOpenModules([mIdx]);
        }
      } catch (err) {
        setError(err.response?.status === 403 ? 'ACCESS_DENIED' : 'SERVER_ERROR');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const flatLessons = useMemo(() => course?.modules?.flatMap(m => m.lessons) || [], [course]);

  const progressPercentage = useMemo(() => {
    if (!flatLessons.length) return 0;
    return Math.round((completedLessons.length / flatLessons.length) * 100);
  }, [flatLessons, completedLessons]);

  const currentIndex = flatLessons.findIndex(l => Number(l.id) === Number(activeLesson?.id));

  const isLessonLocked = (lessonId) => {
    const lessonIdx = flatLessons.findIndex(l => Number(l.id) === Number(lessonId));
    if (lessonIdx <= 0) return false;
    const prevLesson = flatLessons[lessonIdx - 1];
    return !completedLessons.includes(Number(prevLesson.id));
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      await api.post(`/lessons/${activeLesson.id}/complete`);
      const lessonId = Number(activeLesson.id);
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons(prev => [...prev, lessonId]);
      }
      handleNextLesson();
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setCompleting(false);
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < flatLessons.length - 1) {
      const next = flatLessons[currentIndex + 1];
      setActiveLesson(next);
      const mIdx = course.modules.findIndex(m => m.lessons.some(l => Number(l.id) === Number(next.id)));
      if (!openModules.includes(mIdx)) setOpenModules(prev => [...prev, mIdx]);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1` : url;
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Загрузка программы...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Доступ ограничен</h3>
      <p className="text-slate-500 max-w-sm mb-6 text-sm">Пожалуйста, убедитесь в оплате курса или обратитесь в поддержку.</p>
      <button onClick={() => navigate('/courses')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Вернуться к курсам</button>
    </div>
  );

  return (
    <div className="h-screen flex bg-white overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed lg:relative z-50 h-full bg-slate-50 border-r transition-all duration-500 ease-in-out flex-shrink-0
        ${isSidebarOpen ? 'w-[320px]' : 'w-0 -translate-x-full lg:translate-x-0'}`}
      >
        <div className="w-[320px] h-full flex flex-col bg-slate-50">
          <div className="p-6 h-[81px] border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Layout size={18} />
              </div>
              <h2 className="font-black text-[11px] uppercase tracking-widest text-slate-900">Программа</h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id} className="space-y-1">
                <button 
                  onClick={() => setOpenModules(prev => prev.includes(mIdx) ? prev.filter(i => i !== mIdx) : [...prev, mIdx])}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all
                  ${openModules.includes(mIdx) ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/60'}`}
                >
                  <span className="font-bold text-[12px] text-slate-700 text-left pr-4 leading-tight">{module.title}</span>
                  {openModules.includes(mIdx) ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                
                <AnimatePresence initial={false}>
                  {openModules.includes(mIdx) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-2 pl-2 space-y-1 border-l-2 border-slate-200 my-2">
                        {module.lessons?.map((lesson) => {
                          const locked = isLessonLocked(lesson.id);
                          const active = Number(activeLesson?.id) === Number(lesson.id);
                          const done = completedLessons.includes(Number(lesson.id));

                          return (
                            <button
                              key={lesson.id}
                              disabled={locked}
                              onClick={() => setActiveLesson(lesson)}
                              ref={active ? activeLessonRef : null}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group
                                ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-white'}
                                ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors
                                ${active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-50'}
                              `}>
                                {locked ? <Lock size={12} /> : done ? <CheckCircle size={12} className={active ? 'text-white' : 'text-green-500'} /> : 
                                  (lesson.type === 'pdf' ? <FileText size={12}/> : <PlayCircle size={12}/>)}
                              </div>
                              <span className={`text-[11px] font-medium truncate ${active ? 'text-white' : 'text-slate-600'}`}>
                                {lesson.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-[81px] px-4 md:px-8 flex items-center justify-between border-b bg-white relative z-30">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex flex-col min-w-0">
                <h2 className="text-sm font-bold text-slate-900 truncate pr-4">{activeLesson?.title}</h2>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1">
                     {[...Array(3)].map((_, i) => (
                       <div key={i} className={`w-1 h-1 rounded-full ${i <= currentIndex / 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                     ))}
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     Модуль {openModules[0] + 1 || 1} • Урок {currentIndex + 1}/{flatLessons.length}
                   </span>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
               <span className="text-[9px] font-black text-slate-400 uppercase">Прогресс курса</span>
               <span className="text-xs font-bold text-blue-600">{progressPercentage}%</span>
            </div>

            {activeLesson && !completedLessons.includes(Number(activeLesson.id)) ? (
              <button 
                onClick={handleCompleteLesson} 
                disabled={completing} 
                className="group bg-green-500 hover:bg-green-600 text-white h-10 px-4 md:px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-100 disabled:opacity-50"
              >
                {completing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} className="group-hover:scale-110 transition-transform"/>}
                <span className="hidden sm:inline">Завершить урок</span>
                <span className="sm:hidden">Готово</span>
              </button>
            ) : (
              <div className="bg-emerald-50 text-emerald-600 h-10 px-4 md:px-6 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 border border-emerald-100">
                <CheckCircle size={16} /> <span className="hidden sm:inline">Урок пройден</span>
              </div>
            )}
            
            <button 
              onClick={handleNextLesson} 
              disabled={currentIndex === flatLessons.length - 1 || !completedLessons.includes(Number(activeLesson?.id))} 
              className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-4 md:px-5 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-10 transition-all flex items-center gap-2"
            >
              <span className="hidden sm:inline">Далее</span> <ChevronRight size={16} />
            </button>
          </div>
        </header>

        {/* PROGRESS BAR */}
        <div className="w-full h-1 bg-slate-100 relative shrink-0">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "circOut" }}
          />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-0 md:p-6 lg:p-12 overflow-y-auto custom-scrollbar">
          
          <motion.div 
            key={activeLesson?.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-6xl relative group"
          >
            {/* Декоративная подложка */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative aspect-video bg-black shadow-2xl rounded-0 md:rounded-[2.5rem] overflow-hidden border-[6px] md:border-[12px] border-white ring-1 ring-slate-200">
              {activeLesson?.type === 'pdf' ? (
                <iframe 
                  src={activeLesson.file_url ? `${activeLesson.file_url}#toolbar=0` : ''} 
                  className="w-full h-full border-none bg-white" 
                  title="PDF Content"
                />
              ) : (
                <iframe 
                  src={getEmbedUrl(activeLesson?.video_url)} 
                  className="w-full h-full border-none" 
                  allow="autoplay; fullscreen" 
                  allowFullScreen 
                  title="Video Content"
                />
              )}
            </div>

            {/* Подсказка под видео */}
            <div className="mt-6 hidden md:flex items-center justify-between px-6">
              <div className="flex items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">HD Quality</span>
                </div>
                {activeLesson?.type === 'pdf' && (
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14}/> Режим чтения
                  </span>
                )}
              </div>
              
              <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
                <Maximize2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-inherit">Во весь экран</span>
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default CourseAppPage;