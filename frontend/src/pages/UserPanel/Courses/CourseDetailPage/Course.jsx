import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, BookOpen, Clock, Layout, X,
  ChevronLeft, ChevronRight, Star // Добавил иконку Star для промо
} from 'lucide-react';
import api from '../../../../api/axios';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState([0]);
  const [activeContent, setActiveContent] = useState(null); 

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке курса:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  // Плоский список уроков из МОДУЛЕЙ (для навигации внутри модалки)
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap(module => 
      module.lessons.map(lesson => ({
        ...lesson,
        moduleTitle: module.title
      }))
    );
  }, [course]);

  const navigateLesson = (direction) => {
    const currentIndex = allLessons.findIndex(l => 
      (l.type === 'pdf' ? l.file_url : l.video_url) === activeContent.url
    );
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < allLessons.length) {
      const nextLesson = allLessons[nextIndex];
      setActiveContent({
        url: nextLesson.type === 'pdf' ? nextLesson.file_url : nextLesson.video_url,
        title: nextLesson.title,
        type: nextLesson.type,
        isFromModule: true // Пометка, что это урок из списка (для показа навигации)
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
      
      {/* --- МОДАЛЬНОЕ ОКНО --- */}
      {activeContent && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full flex justify-between items-center mb-4 text-white">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-black uppercase">
                {activeContent.type === 'pdf' ? 'Документ' : 'Видео'}
              </span>
              <h3 className="font-black uppercase tracking-widest text-sm truncate max-w-[150px] md:max-w-none">
                {activeContent.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Показываем стрелки навигации только если контент из модулей */}
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

      {/* Шапка курса */}
      <div className="bg-slate-900 pt-32 pb-24 px-8 text-white">
        <div className="max-w-5xl mx-auto">
          <Link to="/courses" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
            <ArrowLeft size={16} /> Назад к курсам
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">{course?.title}</h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">{course?.description || "Описание курса находится в разработке."}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 gap-8">
          
          {/* --- НОВЫЙ БЛОК: ОБЩИЕ МАТЕРИАЛЫ (ПРОМО / СИЛЛАБУС) --- */}
          {(course?.promo_video_url || course?.syllabus_url) && (
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Star className="text-white" fill="currentColor" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Введение в курс</h3>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-70">Общие материалы и промо</p>
                </div>
              </div>

              <div className="flex gap-3">
                {course?.promo_video_url && (
                  <button 
                    onClick={() => setActiveContent({ url: course.promo_video_url, title: "Промо-ролик", type: 'video', isFromModule: false })}
                    className="flex items-center gap-3 px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <PlayCircle size={18} /> Смотреть промо
                  </button>
                )}
                {course?.syllabus_url && (
                  <button 
                    onClick={() => setActiveContent({ url: course.syllabus_url, title: "Программа курса (PDF)", type: 'pdf', isFromModule: false })}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all border border-blue-400/30"
                  >
                    <FileText size={18} /> Силлабус PDF
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Список модулей */}
          <div className="space-y-4">
            <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] ml-4 mb-4">Учебные модули</h2>
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
                        <Layout size={12} /> {module.lessons?.length || 0} уроков
                      </span>
                    </div>
                  </div>
                  {openModules.includes(mIdx) ? <ChevronUp className="text-slate-300" /> : <ChevronDown className="text-slate-300" />}
                </button>

                {openModules.includes(mIdx) && (
                  <div className="px-8 pb-8 space-y-3">
                    {module.lessons?.map((lesson) => (
                      <div key={lesson.id} className="group flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                        <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lesson.type === 'pdf' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                            {lesson.type === 'pdf' ? <FileText size={20} /> : <PlayCircle size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{lesson.title}</h4>
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mt-0.5">
                              {lesson.type === 'pdf' ? 'PDF Материал' : 'Видео-урок'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveContent({ 
                            url: lesson.type === 'pdf' ? lesson.file_url : lesson.video_url, 
                            title: lesson.title, 
                            type: lesson.type,
                            isFromModule: true
                          })}
                          className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
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