import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle, Menu, X, 
  ChevronRight, Lock, Check 
} from 'lucide-react';
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
        if (err.response?.status === 403 || err.response?.status === 404) {
          setError('ACCESS_DENIED');
        } else {
          setError('SERVER_ERROR');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const flatLessons = useMemo(() => {
    return course?.modules?.flatMap(m => m.lessons) || [];
  }, [course]);

  // РАСЧЕТ ПРОГРЕССА
  const progressPercentage = useMemo(() => {
    if (!flatLessons.length) return 0;
    const completedCount = completedLessons.length;
    return Math.round((completedCount / flatLessons.length) * 100);
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
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div></div>;

  return (
    <div className="h-full flex bg-white overflow-hidden relative">
      {/* SIDEBAR */}
      <aside className={`absolute lg:relative z-50 h-full bg-slate-50 border-r transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 -translate-x-full lg:w-0 lg:opacity-0'}`}>
        <div className="w-80 h-full flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-white">
            <h2 className="font-black text-[11px] uppercase tracking-widest text-slate-400">Программа</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id}>
                <button onClick={() => setOpenModules(prev => prev.includes(mIdx) ? prev.filter(i => i !== mIdx) : [...prev, mIdx])}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl mb-1 ${openModules.includes(mIdx) ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}>
                  <span className="font-black text-[11px] uppercase text-slate-700">{module.title}</span>
                  {openModules.includes(mIdx) ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
                
                {openModules.includes(mIdx) && (
                  <div className="ml-3 space-y-1 border-l-2 border-slate-200">
                    {module.lessons?.map((lesson) => {
                      const locked = isLessonLocked(lesson.id);
                      const active = Number(activeLesson?.id) === Number(lesson.id);
                      const done = completedLessons.includes(Number(lesson.id));

                      return (
                        <button
                          key={lesson.id}
                          disabled={locked}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-3 p-3 pl-6 text-left transition-all relative
                            ${active ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-500'}
                            ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}
                          `}
                        >
                          {locked ? (
                            <Lock size={14} className="text-slate-300 shrink-0" />
                          ) : done ? (
                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                          ) : (
                            <div className="shrink-0">{lesson.type === 'pdf' ? <FileText size={14}/> : <PlayCircle size={14}/>}</div>
                          )}
                          <span className="text-xs truncate">{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {/* HEADER */}
        <div className="px-8 py-4 flex items-center justify-between border-b bg-white z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl"><Menu size={20} /></button>}
            <div className="flex flex-col">
                <h2 className="text-sm font-black text-slate-900 truncate max-w-[200px] md:max-w-md">{activeLesson?.title}</h2>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Урок {currentIndex + 1} из {flatLessons.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeLesson && !completedLessons.includes(Number(activeLesson.id)) ? (
              <button onClick={handleCompleteLesson} disabled={completing} className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-transform active:scale-95">
                {completing ? '...' : <><Check size={14}/> Завершить</>}
              </button>
            ) : (
              <div className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" /> Пройдено
              </div>
            )}
            <button 
              onClick={handleNextLesson} 
              disabled={currentIndex === flatLessons.length - 1 || !completedLessons.includes(Number(activeLesson?.id))} 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 flex items-center gap-2"
            >
              Далее <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* НОВЫЙ ПРОГРЕСС БАР (МЕЖДУ ШАПКОЙ И КОНТЕНТОМ) */}
        <div className="w-full h-1.5 bg-slate-100 relative shrink-0">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-slate-50 flex items-center justify-center p-0 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl rounded-0 md:rounded-[2.5rem] overflow-hidden border-8 border-white relative">
            {activeLesson?.type === 'pdf' ? (
              <iframe src={activeLesson.file_url ? `${activeLesson.file_url}#toolbar=0` : ''} className="w-full h-full border-none bg-white" key={`pdf-${activeLesson.id}`} />
            ) : (
              <iframe src={getEmbedUrl(activeLesson?.video_url)} className="w-full h-full border-none" allowFullScreen key={`vid-${activeLesson?.id}`} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseAppPage;