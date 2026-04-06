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
  
  // Состояния данных
  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  
  // Состояния интерфейса
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState([0]);

  // 1. Загрузка данных курса и прогресса
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/courses/${id}`);
        const data = response.data;
        
        setCourse(data);
        const completedIds = data.completed_lessons_ids || [];
        setCompletedLessons(completedIds);
        
        // Логика выбора урока: находим первый невыполненный
        const allLessons = data.modules?.flatMap(m => m.lessons) || [];
        const nextToComplete = allLessons.find(l => !completedIds.includes(l.id));
        
        // Устанавливаем активный урок (либо следующий невыполненный, либо самый первый)
        const initialLesson = nextToComplete || allLessons[0];
        setActiveLesson(initialLesson);

        // Автоматически раскрываем модуль активного урока
        if (initialLesson) {
          const mIdx = data.modules.findIndex(m => 
            m.lessons.some(l => l.id === initialLesson.id)
          );
          if (mIdx !== -1) setOpenModules([mIdx]);
        }
      } catch (err) {
        console.error("Ошибка загрузки курса:", err);
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

  // Группировка всех уроков в один массив для навигации "Вперед/Назад"
  const flatLessons = useMemo(() => {
    return course?.modules?.flatMap(m => m.lessons) || [];
  }, [course]);

  const currentIndex = flatLessons.findIndex(l => l.id === activeLesson?.id);

  // 2. Логика завершения урока
  const handleCompleteLesson = async () => {
    if (!activeLesson || completing) return;
    
    setCompleting(true);
    try {
      await api.post(`/lessons/${activeLesson.id}/complete`);
      
      // Обновляем локальный стейт выполненных уроков
      if (!completedLessons.includes(activeLesson.id)) {
        setCompletedLessons(prev => [...prev, activeLesson.id]);
      }

      // Переходим к следующему уроку автоматически
      handleNextLesson();
    } catch (err) {
      console.error("Не удалось сохранить прогресс:", err);
    } finally {
      setCompleting(false);
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < flatLessons.length - 1) {
      const next = flatLessons[currentIndex + 1];
      setActiveLesson(next);
      
      // Раскрываем модуль следующего урока, если он в другом модуле
      const mIdx = course.modules.findIndex(m => m.lessons.some(l => l.id === next.id));
      if (!openModules.includes(mIdx)) setOpenModules(prev => [...prev, mIdx]);
    }
  };

  // Помощник для YouTube/Vimeo
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const toggleModule = (idx) => {
    setOpenModules(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
    </div>
  );

  if (error === 'ACCESS_DENIED') return (
    <div className="h-full flex items-center justify-center p-10 text-center">
      <div className="max-w-sm">
        <Lock className="mx-auto mb-4 text-red-400" size={48} />
        <h2 className="text-xl font-bold mb-2">Доступ ограничен</h2>
        <p className="text-slate-500 mb-6">У вас нет доступа к этому курсу. Пожалуйста, обратитесь к администратору.</p>
        <button onClick={() => navigate('/app/dashboard')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">Вернуться в кабинет</button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex bg-white overflow-hidden relative">
      
      {/* САЙДБАР С ПРОГРАММОЙ */}
      <aside className={`absolute lg:relative z-50 h-full bg-slate-50 border-r border-slate-100 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 -translate-x-full lg:w-0 lg:opacity-0'}`}>
        <div className="w-80 h-full flex flex-col">
          <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <div>
              <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">Программа</h2>
              <p className="text-[10px] font-bold text-slate-900 truncate max-w-[180px]">{course?.title}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors lg:hidden">
              <X size={18} />
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors hidden lg:block">
              <Menu size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id} className="mb-2">
                <button 
                  onClick={() => toggleModule(mIdx)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${openModules.includes(mIdx) ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${openModules.includes(mIdx) ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {mIdx + 1}
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-tight text-slate-700 text-left">{module.title}</span>
                  </div>
                  {openModules.includes(mIdx) ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                </button>
                
                {openModules.includes(mIdx) && (
                  <div className="mt-2 ml-3 space-y-1 border-l-2 border-slate-200">
                    {module.lessons?.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full flex items-center gap-3 p-3 pl-6 text-left transition-all relative
                          ${activeLesson?.id === lesson.id ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}
                        `}
                      >
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle size={14} className="text-green-500 shrink-0" />
                        ) : (
                          <div className={`shrink-0 ${activeLesson?.id === lesson.id ? 'text-blue-600' : 'text-slate-300'}`}>
                            {lesson.type === 'pdf' ? <FileText size={14}/> : <PlayCircle size={14}/>}
                          </div>
                        )}
                        <span className="text-xs truncate">{lesson.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ОСНОВНАЯ ЧАСТЬ */}
      <main className="flex-1 flex flex-col bg-white overflow-y-auto relative custom-scrollbar">
        
        {/* Хедер урока */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl mr-2">
                <Menu size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Текущий урок</span>
              <h2 className="text-sm font-black text-slate-900">{activeLesson?.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Кнопка завершения */}
            {activeLesson && !completedLessons.includes(activeLesson.id) ? (
              <button 
                onClick={handleCompleteLesson}
                disabled={completing}
                className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {completing ? '...' : <><Check size={14}/> Завершить</>}
              </button>
            ) : (
              <div className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" /> Пройдено
              </div>
            )}

            <button 
              onClick={handleNextLesson}
              disabled={currentIndex === flatLessons.length - 1}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 disabled:opacity-20 transition-all flex items-center gap-2"
            >
              Далее <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Плеер / Контент */}
        <div className="flex-1 bg-slate-50 flex items-center justify-center p-0 md:p-10">
          <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl rounded-0 md:rounded-[2.5rem] overflow-hidden border-8 border-white">
            {activeLesson ? (
              activeLesson.type === 'pdf' ? (
                <iframe 
                  src={activeLesson.file_url ? `${activeLesson.file_url}#toolbar=0` : null} 
                  className="w-full h-full border-none bg-white" 
                  title="Document" 
                  key={`pdf-${activeLesson.id}`}
                />
              ) : (
                <iframe 
                  src={getEmbedUrl(activeLesson.video_url)} 
                  className="w-full h-full border-none" 
                  allowFullScreen 
                  title="Video" 
                  key={`vid-${activeLesson.id}`}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-white font-bold uppercase tracking-widest text-[10px]">
                Выберите урок из списка
              </div>
            )}
          </div>
        </div>

        {/* Описание */}
        <div className="p-10 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-1 w-12 bg-blue-600 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Описание материала</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            {activeLesson?.title}
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            {activeLesson?.description || "К этому уроку пока нет текстового описания."}
          </p>
        </div>
      </main>

      {/* Кастомный скроллбар */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}} />
    </div>
  );
};

export default CourseAppPage;