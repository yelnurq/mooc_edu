import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle, Play, Menu, X, 
  ChevronLeft, ChevronRight, Download, BookOpen
} from 'lucide-react';
import api from '../../../../api/axios';

const CourseAppPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openModules, setOpenModules] = useState([0]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
        if (response.data.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(response.data.modules[0].lessons[0]);
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        if (error.response?.status === 401) navigate('/login');
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

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Входим в учебный класс...</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex bg-white overflow-hidden relative">
      
      {/* Кнопка открытия сайдбара (плавающая, если он закрыт) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-6 bottom-6 z-[60] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl hover:bg-blue-600 transition-all lg:flex hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* --- ЛЕВЫЙ САЙДБАР (ПРОГРАММА) --- */}
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
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id} className="mb-2">
                <button 
                  onClick={() => toggleModule(mIdx)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${openModules.includes(mIdx) ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center transition-colors ${openModules.includes(mIdx) ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
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
                        className={`w-full flex items-center gap-3 p-3 pl-6 text-left transition-all relative group
                          ${activeLesson?.id === lesson.id 
                            ? 'text-blue-600 font-bold before:absolute before:left-[-2px] before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-600 bg-blue-50/50' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                          }
                        `}
                      >
                        <div className={`p-1.5 rounded-md ${activeLesson?.id === lesson.id ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                          {lesson.type === 'pdf' ? <FileText size={12}/> : <PlayCircle size={12}/>}
                        </div>
                        <span className="text-xs truncate">{lesson.title}</span>
                        {/* Заглушка прогресса */}
                        {Math.random() > 0.8 && <CheckCircle size={12} className="ml-auto text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- ОСНОВНОЙ КОНТЕНТ (ПЛЕЕР) --- */}
      <main className="flex-1 flex flex-col bg-white overflow-y-auto relative custom-scrollbar">
        
        {/* Хлебные крошки / Навигация под топбаром */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl lg:flex hidden mr-2">
                <Menu size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Текущий урок</span>
              <h2 className="text-sm font-black text-slate-900">{activeLesson?.title}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-slate-100 pr-6">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-400">Прогресс модуля</p>
                  <p className="text-[10px] font-black text-slate-900 text-right">35%</p>
                </div>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 w-[35%]"></div>
                </div>
             </div>
             <button 
              onClick={handleNextLesson}
              disabled={currentIndex === flatLessons.length - 1}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 disabled:opacity-20 disabled:hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
             >
                Далее <ChevronRight size={14} />
             </button>
          </div>
        </div>

        {/* Область просмотра */}
        <div className="flex-1 bg-slate-50 flex items-center justify-center p-0 md:p-10">
          <div className="w-full max-w-5xl aspect-video bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-0 md:rounded-[2.5rem] overflow-hidden border-8 border-white">
            {activeLesson?.type === 'pdf' ? (
              <iframe 
                  src={`${activeLesson.file_url}#toolbar=0`} 
                  className="w-full h-full border-none bg-white" 
                  title="Document" 
                  key={activeLesson.id}
              />
            ) : (
              <iframe 
                  src={getEmbedUrl(activeLesson?.video_url)} 
                  className="w-full h-full border-none" 
                  allowFullScreen 
                  title="Video" 
                  key={activeLesson?.id}
              />
            )}
          </div>
        </div>

        {/* Информация об уроке */}
        <div className="p-10 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                      Урок {currentIndex + 1} / {flatLessons.length}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {activeLesson?.type === 'pdf' ? 'Теория' : 'Видео'}
                  </span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">{activeLesson?.title}</h2>
              <p className="text-slate-500 text-lg leading-relaxed font-medium max-w-3xl">
                  {activeLesson?.description || "К этому уроку пока нет дополнительного описания. Ознакомьтесь с видеоматериалом или прикрепленным PDF файлом для полного понимания темы."}
              </p>
            </div>

            <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
               {activeLesson?.type === 'pdf' && (
                  <a href={activeLesson.file_url} download className="flex items-center justify-center gap-3 px-6 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-slate-900 transition-all group">
                      <Download size={16} className="group-hover:translate-y-0.5 transition-transform"/> Скачать PDF
                  </a>
               )}
               <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                  <h4 className="font-black text-[9px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <BookOpen size={14}/> Резюме урока
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-bold">
                    После изучения материала рекомендуем пройти тест в конце модуля.
                  </p>
               </div>
            </div>
          </div>
        </div>

      </main>

      {/* Глобальные стили для скроллбара */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default CourseAppPage;