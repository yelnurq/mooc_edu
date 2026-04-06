import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle, Menu, X, 
  ChevronRight, Download, BookOpen, Lock
} from 'lucide-react';
import api from '../../../../api/axios';

const CourseAppPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Добавлено состояние ошибки
  const [activeLesson, setActiveLesson] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState([0]);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
        
        if (response.data.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(response.data.modules[0].lessons[0]);
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        
        // Если 401 — не авторизован
        if (error.response?.status === 401) {
          navigate('/login');
        } 
        // Если 403 (Нет доступа) или 404 (Не найден)
        else if (error.response?.status === 403 || error.response?.status === 404) {
          setError('ACCESS_DENIED');
        } else {
          setError('UNKNOWN_ERROR');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, navigate]);

  const flatLessons = useMemo(() => {
    return course?.modules?.flatMap(m => m.lessons) || [];
  }, [course]);

  const currentIndex = flatLessons.findIndex(l => l.id === activeLesson?.id);

  const toggleModule = (idx) => {
    setOpenModules(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const handleNextLesson = () => {
    if (currentIndex < flatLessons.length - 1) {
      setActiveLesson(flatLessons[currentIndex + 1]);
    }
  };

  // --- СОСТОЯНИЕ ЗАГРУЗКИ ---
  if (loading) return (
    <div className="h-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Входим в учебный класс...</span>
      </div>
    </div>
  );

  // --- СОСТОЯНИЕ ОШИБКИ (НЕТ ДОСТУПА) ---
  if (error === 'ACCESS_DENIED') {
    return (
      <div className="h-full flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Доступ ограничен</h2>
          <p className="text-slate-500 font-medium mb-8">
            У вас нет доступа к этому курсу, либо он не существует. Пожалуйста, убедитесь, что вы записаны на обучение.
          </p>
          <button 
            onClick={() => navigate('/courses')}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
          >
            Вернуться к списку курсов
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white overflow-hidden relative">
      {/* ... (остальной ваш JSX код без изменений) ... */}
      
      {/* Кнопка открытия сайдбара */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-6 bottom-6 z-[60] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl hover:bg-blue-600 transition-all lg:flex hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* --- ЛЕВЫЙ САЙДБАР --- */}
      <aside className={`
        absolute lg:relative z-50 h-full bg-slate-50 border-r border-slate-100 transition-all duration-500 ease-in-out
        ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:opacity-0'}
      `}>
        <div className="w-80 h-full flex flex-col">
          <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <div>
              <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">Программа</h2>
              <p className="text-[10px] font-bold text-slate-900 truncate max-w-[180px]">{course?.title}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <X size={18} className="text-slate-500" />
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
                    <span className="font-black text-[11px] uppercase tracking-tight text-slate-700">{module.title}</span>
                  </div>
                  {openModules.includes(mIdx) ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                </button>
                {openModules.includes(mIdx) && (
                  <div className="mt-2 ml-3 space-y-1 border-l-2 border-slate-200">
                    {module.lessons?.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setActiveLesson(lesson);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 pl-6 text-left transition-all relative
                          ${activeLesson?.id === lesson.id ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}
                        `}
                      >
                        <div className={`p-1.5 rounded-md ${activeLesson?.id === lesson.id ? 'bg-blue-100' : 'bg-slate-100'}`}>
                          {lesson.type === 'pdf' ? <FileText size={12}/> : <PlayCircle size={12}/>}
                        </div>
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

      {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
      <main className="flex-1 flex flex-col bg-white overflow-y-auto relative custom-scrollbar">
        {/* Хлебные крошки */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Текущий урок</span>
              <h2 className="text-sm font-black text-slate-900">{activeLesson?.title}</h2>
            </div>
          </div>
          <button 
            onClick={handleNextLesson}
            disabled={currentIndex === flatLessons.length - 1}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 disabled:opacity-20 transition-all flex items-center gap-2"
          >
            Далее <ChevronRight size={14} />
          </button>
        </div>

        {/* Плеер */}
        <div className="flex-1 bg-slate-50 flex items-center justify-center p-0 md:p-10">
          <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl rounded-0 md:rounded-[2.5rem] overflow-hidden border-8 border-white">
            {activeLesson?.type === 'pdf' ? (
              <iframe src={`${activeLesson.file_url}#toolbar=0`} className="w-full h-full border-none bg-white" title="Doc" key={activeLesson.id} />
            ) : (
              <iframe src={getEmbedUrl(activeLesson?.video_url)} className="w-full h-full border-none" allowFullScreen title="Vid" key={activeLesson?.id} />
            )}
          </div>
        </div>

        {/* Инфо */}
        <div className="p-10 max-w-5xl mx-auto w-full">
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">{activeLesson?.title}</h2>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            {activeLesson?.description || "Материалы урока."}
          </p>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default CourseAppPage;