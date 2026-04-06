import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle, Lock, Play, Menu, X, 
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
        // По умолчанию открываем первый урок первого модуля
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

  // Плоский список всех уроков для навигации "Вперед/Назад"
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Готовим учебный класс...</span>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      
      {/* --- ВЕРХНЯЯ ПАНЕЛЬ (HEADER) --- */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-50 bg-white">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <Link to="/courses" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={18} />
            <span className="font-black text-[10px] uppercase tracking-widest hidden md:block">Выйти из класса</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 mx-2 hidden md:block" />
          <h1 className="font-black text-sm text-slate-900 truncate max-w-[200px] md:max-w-md">
            {course?.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Ваш прогресс</span>
                <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[35%] rounded-full"></div>
                </div>
            </div>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                Завершить урок
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- ЛЕВЫЙ САЙДБАР (ПРОГРАММА) --- */}
        <aside className={`
          absolute lg:relative z-40 h-full bg-slate-50 border-r border-slate-100 transition-all duration-300
          ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:opacity-0'}
        `}>
          <div className="w-80 h-full flex flex-col">
            <div className="p-6 border-b border-slate-200/50 flex justify-between items-center">
              <h2 className="font-black text-[11px] uppercase tracking-[0.15em] text-slate-500">Содержание курса</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X size={18}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {course?.modules?.map((module, mIdx) => (
                <div key={module.id} className="mb-2">
                  <button 
                    onClick={() => toggleModule(mIdx)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white transition-all group"
                  >
                    <span className="font-bold text-xs text-slate-600 group-hover:text-slate-900 flex items-center gap-2">
                       <span className="w-5 h-5 rounded-md bg-slate-200 text-[10px] flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {mIdx + 1}
                       </span>
                       {module.title}
                    </span>
                    {openModules.includes(mIdx) ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>

                  {openModules.includes(mIdx) && (
                    <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200">
                      {module.lessons?.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-3 p-3 pl-5 text-left transition-all relative
                            ${activeLesson?.id === lesson.id 
                              ? 'text-blue-600 font-bold before:absolute before:left-[-2px] before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-600 bg-blue-50/50' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                            }
                          `}
                        >
                          {lesson.type === 'pdf' ? <FileText size={14}/> : <PlayCircle size={14}/>}
                          <span className="text-[13px] truncate">{lesson.title}</span>
                          {/* Иконка выполненного урока (заглушка) */}
                          {Math.random() > 0.7 && <CheckCircle size={12} className="ml-auto text-emerald-500" />}
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
        <main className="flex-1 flex flex-col bg-white overflow-y-auto relative">
          
          {/* Область просмотра */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center p-0 md:p-6">
            <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl rounded-0 md:rounded-3xl overflow-hidden border border-white/5">
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

          {/* Информация об уроке под плеером */}
          <div className="p-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">
                        Урок {currentIndex + 1} из {flatLessons.length}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-600">
                        {activeLesson?.type === 'pdf' ? 'Теория' : 'Видеопрактика'}
                    </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">{activeLesson?.title}</h2>
                <p className="text-slate-500 leading-relaxed font-medium">
                    {activeLesson?.description || "К этому уроку пока нет дополнительного описания, но скоро оно появится!"}
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-3">
                 <button className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                    Следующий урок <ChevronRight size={16}/>
                 </button>
                 {activeLesson?.type === 'pdf' && (
                    <a href={activeLesson.file_url} download className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-900 transition-all">
                        <Download size={16}/> Скачать PDF
                    </a>
                 )}
              </div>
            </div>

            {/* Дополнительные материалы именно для этого урока */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-10">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <BookOpen size={14}/> Заметки к уроку
                    </h4>
                    <p className="text-sm text-slate-600">Используйте этот урок как базу для выполнения домашнего задания №{currentIndex + 1}.</p>
                </div>
                <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100">
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                        <Play size={14}/> Ресурсы
                    </h4>
                    <p className="text-sm text-blue-600/80">Все исходные файлы доступны в репозитории курса.</p>
                </div>
            </div>
          </div>

          {/* Нижняя навигация (Float) */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex justify-between items-center px-8 lg:hidden">
              <button 
                disabled={currentIndex === 0}
                onClick={() => setActiveLesson(flatLessons[currentIndex - 1])}
                className="p-3 bg-slate-100 rounded-xl disabled:opacity-30"
              >
                <ChevronLeft size={20}/>
              </button>
              <span className="font-black text-[10px] uppercase tracking-tighter">Урок {currentIndex + 1}</span>
              <button 
                disabled={currentIndex === flatLessons.length - 1}
                onClick={() => setActiveLesson(flatLessons[currentIndex + 1])}
                className="p-3 bg-slate-900 text-white rounded-xl disabled:opacity-30"
              >
                <ChevronRight size={20}/>
              </button>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />
    </div>
  );
};

export default CourseAppPage;