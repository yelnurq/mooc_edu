import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle, Menu, X, 
  ChevronRight, Lock, Check, Layout, 
  Download, MessageSquare, Info, BookOpen,
  ExternalLink, FileArchive, Maximize2, Minimize2,
  ArrowRight, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

const CourseAppPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [openModules, setOpenModules] = useState([0]);
  const [activeTab, setActiveTab] = useState('description');

  // Загрузка данных
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

  // Авто-скролл к активному уроку в сайдбаре
  useEffect(() => {
    if (activeLesson) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`lesson-${activeLesson.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeLesson]);

  const flatLessons = useMemo(() => course?.modules?.flatMap(m => m.lessons) || [], [course]);
  const courseResources = useMemo(() => course?.course_resources || [], [course]);

  const progressPercentage = useMemo(() => {
    if (!flatLessons.length) return 0;
    return Math.round((completedLessons.length / flatLessons.length) * 100);
  }, [flatLessons, completedLessons]);

  const currentIndex = flatLessons.findIndex(l => Number(l.id) === Number(activeLesson?.id));
  const nextLesson = flatLessons[currentIndex + 1];

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
      if (nextLesson) handleNextLesson();
    } catch (err) {
      console.error("Ошибка при завершении:", err);
    } finally {
      setCompleting(false);
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      setActiveLesson(nextLesson);
      const mIdx = course.modules.findIndex(m => m.lessons.some(l => Number(l.id) === Number(nextLesson.id)));
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

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText size={20} />;
    if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive size={20} />;
    return <Download size={20} />;
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
       <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Подготовка окружения...</p>
    </div>
  );

  return (
    <div className={`h-screen w-full flex bg-white overflow-hidden relative font-sans ${isFocusMode ? 'focus-mode' : ''}`}>
      
      {/* SIDEBAR */}
      {!isFocusMode && (
        <aside className={`h-full bg-slate-50 border-r transition-all duration-300 ease-in-out flex-shrink-0 z-[60] relative ${isSidebarOpen ? 'w-[320px]' : 'w-[80px]'}`}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 h-[81px] border-b flex justify-between items-center bg-white overflow-hidden">
              <div className="flex items-center gap-3 min-w-max">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <BookOpen size={20} />
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-black text-[11px] uppercase tracking-widest text-slate-900 truncate">Программа</h2>
                    <span className="text-[9px] text-slate-400 font-bold truncate max-w-[150px]">{course?.title}</span>
                  </div>
                )}
              </div>
              {isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar overflow-x-hidden" ref={sidebarRef}>
              {course?.modules?.map((module, mIdx) => (
                <div key={module.id} className="space-y-2">
                  {isSidebarOpen ? (
                    <button 
                      onClick={() => setOpenModules(prev => prev.includes(mIdx) ? prev.filter(i => i !== mIdx) : [...prev, mIdx])}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${openModules.includes(mIdx) ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/60'}`}
                    >
                      <span className="font-bold text-[11px] text-slate-700 text-left leading-tight truncate pr-2 uppercase">{module.title}</span>
                      {openModules.includes(mIdx) ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 border-b border-slate-200 text-[10px] font-black text-slate-300">{mIdx + 1}</div>
                  )}
                  
                  <AnimatePresence>
                    {(openModules.includes(mIdx) || !isSidebarOpen) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className={`${isSidebarOpen ? 'ml-2 pl-2 border-l-2 border-slate-100 space-y-1' : 'space-y-2'}`}>
                          {module.lessons?.map((lesson) => {
                            const locked = isLessonLocked(lesson.id);
                            const active = Number(activeLesson?.id) === Number(lesson.id);
                            const done = completedLessons.includes(Number(lesson.id));
                            return (
                              <button
                                id={`lesson-${lesson.id}`}
                                key={lesson.id}
                                disabled={locked}
                                onClick={() => setActiveLesson(lesson)}
                                className={`flex items-center rounded-xl transition-all group ${isSidebarOpen ? 'w-full gap-3 p-2.5 text-left' : 'w-12 h-12 justify-center mx-auto'} ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'} ${locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                  {locked ? <Lock size={12} /> : done ? <Check size={14} className={active ? 'text-white' : 'text-green-500'} /> : (lesson.type === 'pdf' ? <FileText size={14}/> : <PlayCircle size={14}/>)}
                                </div>
                                {isSidebarOpen && <span className="text-[11px] font-semibold truncate leading-none">{lesson.title}</span>}
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

            {isSidebarOpen && (
              <div className="p-4 bg-white border-t">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Твой прогресс</span>
                    <span className="text-xs font-bold text-blue-600">{progressPercentage}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-blue-600" />
                 </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative w-full">
        
        <header className="h-[81px] px-4 md:px-8 flex items-center justify-between border-b bg-white shrink-0 z-30">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {!isSidebarOpen && !isFocusMode && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shrink-0 transition-transform active:scale-95">
                <Menu size={20} />
              </button>
            )}
            <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
                   <Link to="/app/courses" className="hover:text-blue-600">Курсы</Link>
                   <ChevronRight size={10} />
                   <span className="truncate max-w-[100px]">{course?.title}</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 truncate">{activeLesson?.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="hidden sm:flex items-center justify-center h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title={isFocusMode ? "Выйти из режима фокуса" : "Режим фокуса"}
            >
              {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {activeLesson && !completedLessons.includes(Number(activeLesson.id)) ? (
              <button onClick={handleCompleteLesson} disabled={completing} className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 md:px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-100">
                {completing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={16} />}
                <span className="hidden sm:inline">Готово</span>
              </button>
            ) : (
              <div className="bg-slate-50 text-emerald-600 h-10 px-4 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 border border-emerald-100">
                <CheckCircle size={16} /> <span className="hidden sm:inline">Пройдено</span>
              </div>
            )}
            
            <button 
              onClick={handleNextLesson} 
              disabled={!nextLesson || !completedLessons.includes(Number(activeLesson?.id))} 
              className="bg-slate-900 hover:bg-blue-600 text-white h-10 px-4 rounded-xl flex items-center gap-2 transition-all disabled:opacity-20"
            >
              <span className="hidden md:inline font-black text-[10px] uppercase tracking-widest">Вперед</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          
          {/* PLAYER SECTION */}
          <div className={`w-full bg-slate-900 flex justify-center transition-all duration-500 ${isFocusMode ? 'p-0 h-[80vh]' : 'p-4 md:p-8 lg:p-12'}`}>
            <div className={`w-full max-w-6xl aspect-video bg-black shadow-2xl overflow-hidden relative group ${isFocusMode ? 'h-full' : 'rounded-3xl border-[6px] border-white/5'}`}>
              {activeLesson?.type === 'pdf' ? (
                <iframe src={activeLesson.file_url ? `${activeLesson.file_url}#toolbar=0` : ''} className="w-full h-full border-none bg-white" title="PDF" />
              ) : (
                <iframe src={getEmbedUrl(activeLesson?.video_url)} className="w-full h-full border-none" allow="autoplay; fullscreen" allowFullScreen title="Video" />
              )}
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full p-6 md:p-12 pb-32">
             <div className="flex flex-col lg:flex-row gap-12">
                
                <div className="flex-1">
                   <div className="flex items-center gap-8 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'description', label: 'Инструкции', icon: <Info size={16} /> },
                        { id: 'files', label: `Ресурсы (${courseResources.length})`, icon: <Download size={16} /> },
                        { id: 'support', label: 'Помощь', icon: <MessageSquare size={16} /> }
                      ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                          {tab.icon} {tab.label}
                          {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                        </button>
                      ))}
                   </div>

                   <div className="min-h-[300px]">
                      <AnimatePresence mode="wait">
                        {activeTab === 'description' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="desc">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Описание урока</h3>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                              {activeLesson?.description || "Инструкции отсутствуют."}
                            </div>
                            
                            {/* Блок "Что дальше" */}
                            {nextLesson && completedLessons.includes(Number(activeLesson?.id)) && (
                              <div className="mt-12 p-8 bg-white border border-slate-200 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:border-blue-400 transition-all" onClick={handleNextLesson}>
                                <div>
                                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Следующий этап</p>
                                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{nextLesson.title}</h4>
                                </div>
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <ArrowRight size={20} />
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {activeTab === 'files' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="files" className="space-y-3">
                             <h3 className="text-xl font-bold text-slate-900 mb-6">Материалы для скачивания</h3>
                             {courseResources.length > 0 ? (
                               courseResources.map((resource, index) => (
                                 <a key={resource.id || index} href={resource.file_url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.5rem] hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                          {getFileIcon(resource.title || resource.file_url)}
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{resource.title || 'Ресурс'}</span>
                                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Нажмите, чтобы загрузить</span>
                                       </div>
                                    </div>
                                    <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-600" />
                                 </a>
                               ))
                             ) : (
                               <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Файлы отсутствуют</p>
                               </div>
                             )}
                          </motion.div>
                        )}

                        {activeTab === 'support' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="support" className="bg-slate-900 rounded-[2.5rem] p-10 text-white">
                             <h3 className="text-2xl font-bold mb-4">Нужна помощь?</h3>
                             <p className="text-slate-400 text-sm mb-8 leading-relaxed">Если возникли сложности с уроком или вы нашли ошибку, свяжитесь с куратором курса.</p>
                             <div className="flex flex-wrap gap-4">
                               <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95">
                                 Задать вопрос
                               </button>
                               <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all">
                                 Сообщество
                               </button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>

                {/* SIDE INFO */}
                {!isFocusMode && (
                  <div className="lg:w-[320px] space-y-6">
                     <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Инфо-панель</h4>
                        <div className="space-y-5">
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] text-slate-400 font-bold uppercase">Формат</span>
                              <span className="text-[11px] font-black text-slate-900 uppercase bg-slate-100 px-2 py-1 rounded-md">{activeLesson?.type || 'Видео'}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] text-slate-400 font-bold uppercase">Урок</span>
                              <span className="text-[11px] font-black text-slate-900">{currentIndex + 1} / {flatLessons.length}</span>
                           </div>
                           <div className="pt-6 border-t flex flex-col gap-4">
                              <button className="w-full py-4 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-[10px] uppercase tracking-widest">
                                <Share2 size={14} /> Поделиться
                              </button>
                           </div>
                        </div>
                     </div>
                 
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .focus-mode header { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default CourseAppPage;