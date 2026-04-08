import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, Layout, X, Files, Play, ExternalLink, 
  Lock, User, Clock, CheckCircle, Loader2, Info, BookOpen,
  Sparkles,
  Tag,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

const ASSET_URL = "http://localhost:8000/storage/";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState([0]);
  const [activeContent, setActiveContent] = useState(null); 
  const [enrollmentStatus, setEnrollmentStatus] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await api.get(`/courses/public/${id}`);
        setCourse(response.data);
        setEnrollmentStatus(response.data.user_status || null);
      } catch (error) {
        console.error("Ошибка:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname, autoEnroll: true } });
      return;
    }
    if (enrollmentStatus) return;
    setIsSubmitting(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrollmentStatus('pending');
    } catch (error) {
      if (error.response?.status === 400) setEnrollmentStatus('pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleModule = (index) => {
    setOpenModules(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
const getYoutubeEmbed = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );
const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    // hqdefault или maxresdefault для лучшего качества
    return (match && match[2].length === 11) 
        ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` 
        : null;
};
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* MODAL */}
      <AnimatePresence>
        {activeContent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex flex-col p-4 md:p-12"
          >
            <div className="max-w-6xl mx-auto w-full flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-xl">{activeContent.title}</h3>
              <button onClick={() => setActiveContent(null)} className="p-3 bg-white/10 text-white hover:bg-red-500 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="max-w-6xl mx-auto w-full flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl">
              <iframe 
                src={activeContent.type === 'pdf' ? `${activeContent.url}#toolbar=0` : activeContent.url} 
                className="w-full h-full border-none bg-white" 
                title="content" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1640px] mx-auto px-6 lg:px-12 py-12">
        {/* BACK BUTTON */}
        <Link to="/courses" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-12 font-black text-[10px] uppercase tracking-[0.2em]">
          <ArrowLeft size={16} /> Назад к курсам
        </Link>

        <div className="flex flex-col xl:flex-row gap-16">
          
          {/* LEFT CONTENT */}
          <div className="flex-1 space-y-12">
{/* HEADER WITH PROMO SECTION */}
<div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
  
  {/* LEFT: TITLE & STATS */}
{/* LEFT: TITLE & STATS */}
<header className="flex-1 min-w-0 space-y-8"> {/* min-w-0 лечит баг с переполнением flex-контейнеров */}
  <div className="space-y-6">
    <div className="flex flex-wrap items-center gap-3">      
      {course?.category && (
        <span className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
          {course.category.name}
        </span>
      )}
      <div className="flex items-center gap-1.5 text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
        <User size={12} className="text-blue-500" />
        <span>{course?.students_count || 0} Студентов</span>
      </div>
    </div>

    <h1 
      style={{ fontWeight: 500 }} 
      className="text-left text-4xl md:text-5xl xl:text-6xl text-slate-900 tracking-tighter leading-[1.1] w-full"
    >
      {course?.title}
    </h1>
  </div>

  {/* QUICK STATS ROW */}
  <div className="flex flex-wrap items-center gap-6 py-2 border-t border-slate-100 pt-8">
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Сложность</span>
      <span className="text-sm font-bold text-slate-700">{course?.level || 'Все уровни'}</span>
    </div>
    <div className="w-px h-8 bg-slate-200 hidden sm:block" />
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Обновлено</span>
      <span className="text-sm font-bold text-slate-700">
        {course?.updated_at ? new Date(course.updated_at).toLocaleDateString('ru-RU') : 'Недавно'}
      </span>
    </div>
  </div>
</header>

{/* RIGHT: PROMO VIDEO CARD */}
<div className="w-full lg:w-[450px] xl:w-[550px] shrink-0">
  <div 
    onClick={() => {
      if (course?.promo_video_url) {
        setActiveContent({ 
          url: getYoutubeEmbed(course.promo_video_url), 
          title: `Промо: ${course?.title}`, 
          type: 'video' 
        });
      }
    }}
    className={`relative aspect-video w-full overflow-hidden rounded-[2rem] border-[6px] border-white shadow-2xl shadow-blue-900/10 group cursor-pointer bg-slate-200 ${!course?.promo_video_url && 'cursor-default'}`}
  >
    {/* ИЗОБРАЖЕНИЕ-ОБЛОЖКА ИЗ YOUTUBE */}
    <div className="absolute inset-0 z-0">
      {course?.promo_video_url ? (
        <img 
          src={getYoutubeThumbnail(course.promo_video_url)} 
          alt="Video Preview"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => { e.target.src = '/placeholder-course.jpg'; }} // Резерв, если у видео нет maxres
        />
      ) : (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
           <Sparkles className="text-slate-200" size={48} />
        </div>
      )}
      {/* Затемняющий градиент поверх обложки */}
      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors" />
    </div>
    
    {/* UI элементы поверх обложки */}
    {course?.promo_video_url ? (
      <>
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative">
            {/* Анимированный пульсирующий круг */}
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl text-blue-600 transition-transform group-hover:scale-110">
              <Play size={32} fill="currentColor" className="ml-1" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center z-20">
          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            Посмотреть промо-ролик
          </span>
        </div>
      </>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center z-10">
         <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
           Промо скоро появится
         </span>
      </div>
    )}
  </div>
</div>
</div>

            {/* DESCRIPTION */}
            <section className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Info size={16} className="text-blue-600" />
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">О программе</h3>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed text-left border-l-4 border-blue-600 pl-6 text-[14px]">
                {course?.description || "Описание курса уточняется."}
              </p>
            </section>
 {/* RESOURCES (НОВЫЙ БЛОК) */}
  {course?.resources && course.resources.length > 0 && (
    <section className="space-y-6">
      <div className="flex items-center gap-2 px-2">
        <Files size={16} className="text-blue-600" />
        <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Дополнительные ресурсы</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {course.resources.map((res, index) => (
          <a 
            key={index}
            href={res.file_url || res.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-lg transition-colors">
                {res.type === 'link' ? <ExternalLink size={18} /> : <FileText size={18} />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{res.title}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{res.type}</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </a>
        ))}
      </div>
    </section>
  )}
            {/* CURRICULUM */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <Layout size={16} className="text-blue-600" />
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Учебный план</h3>
              </div>
              
              <div className="space-y-4">
                {course?.modules?.map((module, mIdx) => (
                  <div key={module.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <button 
                      onClick={() => toggleModule(mIdx)}
                      className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-5">
                        <span className="text-2xl font-black text-slate-200">{(mIdx + 1).toString().padStart(2, '0')}</span>
                        <h4 className="font-bold text-slate-900 text-lg">{module.title}</h4>
                      </div>
                      {openModules.includes(mIdx) ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </button>
                    
                    <AnimatePresence>
                      {openModules.includes(mIdx) && (
                        <motion.div 
                          initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          className="overflow-hidden border-t border-slate-50"
                        >
                          <div className="p-4 space-y-2">
                            {module.lessons?.map((lesson) => {
                              const isLocked = enrollmentStatus !== 'approved';
                              return (
                                <div key={lesson.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-blue-50/50 transition-colors group">
                                  <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                                      {isLocked ? <Lock size={16} /> : (lesson.type === 'pdf' ? <FileText size={16} /> : <PlayCircle size={16} />)}
                                    </div>
                                    <div>
                                      <p className={`text-sm font-bold ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>{lesson.title}</p>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{lesson.type}</p>
                                    </div>
                                  </div>
                                  {!isLocked && (
                                    <button 
                                      onClick={() => setActiveContent({ url: lesson.type === 'pdf' ? lesson.file_url : lesson.video_url, title: lesson.title, type: lesson.type })}
                                      className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest"
                                    >
                                      Открыть
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-full xl:w-96 shrink-0">
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 sticky top-24 space-y-8">
{/* COURSE COVER */}
<div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 mb-8 group">
  <img 
    src={course?.image ? `${ASSET_URL}${course.image}` : '/placeholder-course.jpg'} 
    alt={course?.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
</div>              
              {/* AUTHOR */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-blue-600" />
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Преподаватель</h3>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            
                  <div>
                    <p className="font-bold text-left text-slate-900">{course?.author_display_name || 'Инструктор'}</p>
                  </div>
                </div>
              </div>

              {/* ENROLL ACTION */}
              <div className="pt-8 border-t border-slate-100">
                {enrollmentStatus === 'approved' ? (
                  <div className="w-full py-5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest">
                    <CheckCircle size={18} /> Вы зачислены
                  </div>
                ) : enrollmentStatus === 'pending' ? (
                  <div className="w-full py-5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest">
                    <Clock size={18} className="animate-pulse" /> На рассмотрении
                  </div>
                ) : (
                  <button 
                    onClick={handleEnroll}
                    disabled={isSubmitting}
                    className="w-full py-6 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Начать обучение'}
                  </button>
                )}
              </div>

           {/* ADDITIONAL INFO */}
<div className="space-y-4 pt-6 border-t border-slate-100">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      <Layout size={14} className="text-slate-300" />
      <span>Модули</span>
    </div>
    <span className="text-[11px] font-bold text-slate-900">{course?.modules?.length || 0} блоков</span>
  </div>

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      <FileText size={14} className="text-slate-300" />
      <span>Материалы</span>
    </div>
    <span className="text-[11px] font-bold text-slate-900">
      {course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} уроков
    </span>
  </div>

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      <Sparkles size={14} className="text-blue-500" />
      <span>Документ</span>
    </div>
    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Сертификат</span>
  </div>

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      <Clock size={14} className="text-slate-300" />
      <span>Доступ</span>
    </div>
    <span className="text-[11px] font-bold text-slate-900">Пожизненный</span>
  </div>

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      <Tag size={14} className="text-slate-300" />
      <span>Язык</span>
    </div>
    <span className="text-[11px] font-bold text-slate-900">Русский</span>
  </div>
</div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;