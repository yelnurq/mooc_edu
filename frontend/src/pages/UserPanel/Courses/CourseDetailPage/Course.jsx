import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, Layout, X, ChevronLeft, ChevronRight, 
  Files, Play, ExternalLink, Lock 
} from 'lucide-react';
import api from '../../../../api/axios';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState([0]);
  const [activeContent, setActiveContent] = useState(null); 
  
  // Состояние для развертывания описания
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await api.get(`/courses/public/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке курса:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap(module => 
      module.lessons.map(lesson => ({
        ...lesson,
        moduleTitle: module.title
      }))
    );
  }, [course]);

  const handleOpenContent = (content) => {
    if (content.isFromModule && !isAuthenticated) {
      alert("Пожалуйста, войдите в аккаунт или приобретите курс, чтобы просмотреть этот урок.");
      navigate('/login');
      return;
    }
    setActiveContent(content);
  };

  const navigateLesson = (direction) => {
    const currentIndex = allLessons.findIndex(l => 
      (l.type === 'pdf' ? l.file_url : l.video_url) === activeContent.url
    );
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < allLessons.length) {
      const nextLesson = allLessons[nextIndex];
      handleOpenContent({
        url: nextLesson.type === 'pdf' ? nextLesson.file_url : nextLesson.video_url,
        title: nextLesson.title,
        type: nextLesson.type,
        isFromModule: true
      });
    }
  };

  useEffect(() => {
    if (activeContent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeContent]);

  const toggleModule = (index) => {
    setOpenModules(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse text-slate-400 font-black tracking-widest uppercase">Загрузка программы...</div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 relative">
      
      {/* --- МОДАЛЬНОЕ ОКНО ПРОСМОТРА --- */}
      {activeContent && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full flex justify-between items-center mb-4 text-white">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                {activeContent.type === 'pdf' ? 'Документ' : 'Видео'}
              </span>
              <h3 className="font-black uppercase tracking-widest text-sm truncate max-w-[200px] md:max-w-none">
                {activeContent.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {activeContent.isFromModule && (
                <>
                  <button 
                    onClick={() => navigateLesson(-1)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-10"
                    disabled={allLessons.findIndex(l => (l.type === 'pdf' ? l.file_url : l.video_url) === activeContent.url) === 0}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => navigateLesson(1)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-10"
                    disabled={allLessons.findIndex(l => (l.type === 'pdf' ? l.file_url : l.video_url) === activeContent.url) === allLessons.length - 1}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="w-px h-6 bg-white/20 mx-2" />
                </>
              )}
              <button onClick={() => setActiveContent(null)} className="p-2 bg-white/10 hover:bg-red-500 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto w-full flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {activeContent.type === 'pdf' ? (
              <iframe src={`${activeContent.url}#toolbar=0`} className="w-full h-full border-none bg-white" title="PDF" key={activeContent.url} />
            ) : (
              <iframe src={getEmbedUrl(activeContent.url)} className="w-full h-full border-none" allowFullScreen title="Video" key={activeContent.url} />
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-900 pt-24 pb-32 px-8 text-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <Link to="/courses" className="self-start flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
            <ArrowLeft size={16} /> Назад к курсам
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-center">{course?.title}</h1>
          
          {/* Улучшенное описание с эффектом развертывания */}
          <div className="relative w-full max-w-2xl">
            <div 
              className={`text-slate-400 text-lg font-medium leading-relaxed text-center transition-all duration-500 ease-in-out overflow-hidden ${
                isDescExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'
              }`}
            >
              {course?.description || "Описание курса находится в разработке."}
            </div>
            
            {/* Градиент для скрытия текста */}
            {!isDescExpanded && course?.description?.length > 150 && (
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
            )}

            {/* Кнопка управления */}
            {course?.description?.length > 150 && (
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-4 mx-auto flex items-center gap-2 text-blue-400 hover:text-blue-300 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {isDescExpanded ? (
                  <>Свернуть <ChevronUp size={14} /></>
                ) : (
                  <>Читать полностью <ChevronDown size={14} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 gap-12">
          
          {/* --- ОБЩИЕ МАТЕРИАЛЫ --- */}
          {course?.resources?.length > 0 && (
            <div>
              <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] ml-4 mb-4 flex items-center gap-2">
                <Files size={14} /> Общие материалы курса
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.resources.map((res) => (
                  <div 
                    key={res.id} 
                    className="group bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleOpenContent({ 
                      url: res.type === 'pdf' ? res.file_url : res.video_url, 
                      title: res.title, 
                      type: res.type,
                      isFromModule: false 
                    })}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${res.type === 'pdf' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                        {res.type === 'pdf' ? <FileText size={22} /> : <Play size={22} fill="currentColor" />}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900 leading-tight">{res.title}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                          Бесплатный доступ
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <ExternalLink size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- СПИСОК МОДУЛЕЙ --- */}
          <div className="space-y-4">
            <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] ml-4 mb-4 flex items-center gap-2">
              <Layout size={14} /> Учебная программа
            </h2>
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id} className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleModule(mIdx)}
                  className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-xl">
                      {String(mIdx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900">{module.title}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mt-1">
                         {module.lessons?.length || 0} занятий в модуле
                      </span>
                    </div>
                  </div>
                  {openModules.includes(mIdx) ? <ChevronUp className="text-slate-300" /> : <ChevronDown className="text-slate-300" />}
                </button>

                {openModules.includes(mIdx) && (
                  <div className="px-8 pb-8 space-y-3">
                    {module.lessons?.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className={`group flex items-center justify-between p-5 rounded-2xl border border-slate-100 transition-all ${!isAuthenticated ? 'opacity-75' : 'hover:border-blue-200 hover:bg-blue-50/30'}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isAuthenticated ? 'bg-slate-100 text-slate-400' : (lesson.type === 'pdf' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500')}`}>
                            {!isAuthenticated ? <Lock size={18} /> : (lesson.type === 'pdf' ? <FileText size={20} /> : <PlayCircle size={20} />)}
                          </div>
                          <div>
                            <h4 className={`font-bold transition-colors ${!isAuthenticated ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-600'}`}>{lesson.title}</h4>
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mt-0.5">
                              {lesson.type === 'pdf' ? 'Лекция PDF' : 'Видео-урок'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleOpenContent({ 
                            url: lesson.type === 'pdf' ? lesson.file_url : lesson.video_url, 
                            title: lesson.title, 
                            type: lesson.type,
                            isFromModule: true
                          })}
                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${!isAuthenticated ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-white border border-slate-200 hover:bg-slate-900 hover:text-white'}`}
                        >
                          {!isAuthenticated && <Lock size={12} />}
                          {lesson.type === 'pdf' ? 'Читать' : 'Смотреть'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;