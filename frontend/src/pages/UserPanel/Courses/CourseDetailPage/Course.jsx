import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, Layout, X, ChevronLeft, ChevronRight, 
  Files, Play, ExternalLink, Lock, User 
} from 'lucide-react';
import api from '../../../../api/axios';

const ASSET_URL = "http://localhost:8000/storage/";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState([0]);
  const [activeContent, setActiveContent] = useState(null); 
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

  // Функция для формирования корректного пути к картинке
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'none';
    if (imagePath.startsWith('http')) return `url("${imagePath}")`;
    // Убираем лишний storage/, если он уже есть в пути из БД
    const cleanPath = imagePath.replace(/^storage\//, '');
    return `url("${ASSET_URL}${cleanPath}")`;
  };

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

      {/* --- ГЛАВНЫЙ БАННЕР С ФОНОМ КУРСА --- */}
      <div 
        className="relative pt-24 pb-48 px-8 overflow-hidden bg-slate-900"
        style={{
            backgroundImage: getImageUrl(course?.image),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Слои оверлеев: темный фильтр + размытие + градиент в основной фон страницы */}
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="absolute inset-0 backdrop-blur-[3px]" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <Link to="/courses" className="self-start flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 font-bold text-xs uppercase tracking-widest bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
            <ArrowLeft size={16} /> Назад к списку
          </Link>
          
          <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] text-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            {course?.title}
          </h1>

          {/* Блок автора */}
          <div className="flex items-center gap-4 mb-10 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
              {course?.author?.avatar ? (
                  <img src={course.author.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" alt="" />
              ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-inner">
                      <User size={24} />
                  </div>
              )}
              <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-400">Автор курса</span>
                  <span className="text-base font-black text-white">{course?.author_display_name || 'Инструктор'}</span>
              </div>
          </div>
          
          <div className="relative w-full max-w-3xl">
            <div 
              className={`text-white/90 text-lg md:text-xl font-medium leading-relaxed text-center transition-all duration-700 ease-in-out overflow-hidden ${
                isDescExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'
              }`}
            >
              {course?.description || "Описание курса находится в разработке."}
            </div>

            {course?.description?.length > 150 && (
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-6 mx-auto flex items-center gap-2 bg-white text-slate-900 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl transform hover:scale-105 active:scale-95"
              >
                {isDescExpanded ? (
                  <>Свернуть <ChevronUp size={16} /></>
                ) : (
                  <>Читать полностью <ChevronDown size={16} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- КОНТЕНТ (ПРОГРАММА) --- */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 gap-12">
          
          {/* --- ОБЩИЕ МАТЕРИАЛЫ --- */}
          {course?.resources?.length > 0 && (
            <div>
              <h2 className="text-slate-500 font-black text-[11px] uppercase tracking-[0.25em] ml-6 mb-6 flex items-center gap-2">
                <Files size={16} className="text-blue-600" /> Дополнительные ресурсы
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {course.resources.map((res) => (
                  <div 
                    key={res.id} 
                    className="group bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer active:scale-[0.98]"
                    onClick={() => handleOpenContent({ 
                      url: res.type === 'pdf' ? res.file_url : res.video_url, 
                      title: res.title, 
                      type: res.type,
                      isFromModule: false 
                    })}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${res.type === 'pdf' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                        {res.type === 'pdf' ? <FileText size={26} /> : <Play size={26} fill="currentColor" />}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{res.title}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/70 mt-1">Free Access</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                      <ExternalLink size={18} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- СПИСОК МОДУЛЕЙ --- */}
          <div className="space-y-5">
            <h2 className="text-slate-500 font-black text-[11px] uppercase tracking-[0.25em] ml-6 mb-6 flex items-center gap-2">
              <Layout size={16} className="text-blue-600" /> Программа обучения
            </h2>
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id} className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm overflow-hidden transition-all hover:border-slate-300 hover:shadow-md">
                <button 
                  onClick={() => toggleModule(mIdx)}
                  className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-900/20">
                      {String(mIdx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 tracking-tight">{module.title}</h3>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mt-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {module.lessons?.length || 0} уроков
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${openModules.includes(mIdx) ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                    <ChevronDown size={24} />
                  </div>
                </button>

                {openModules.includes(mIdx) && (
                  <div className="px-8 pb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    {module.lessons?.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className={`group flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 transition-all ${!isAuthenticated ? 'opacity-70 grayscale-[0.5]' : 'hover:border-blue-200 hover:bg-blue-50/40'}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${!isAuthenticated ? 'bg-slate-100 text-slate-400' : (lesson.type === 'pdf' ? 'bg-orange-50 text-orange-500 group-hover:scale-110' : 'bg-blue-50 text-blue-500 group-hover:scale-110')}`}>
                            {!isAuthenticated ? <Lock size={20} /> : (lesson.type === 'pdf' ? <FileText size={24} /> : <PlayCircle size={24} />)}
                          </div>
                          <div>
                            <h4 className={`text-lg font-black transition-colors ${!isAuthenticated ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-600'}`}>{lesson.title}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                              {lesson.type === 'pdf' ? 'Теоретический блок' : 'Практическое видео'}
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
                          className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${!isAuthenticated ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' : 'bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm'}`}
                        >
                          {!isAuthenticated && <Lock size={14} />}
                          {lesson.type === 'pdf' ? 'Открыть' : 'Смотреть'}
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