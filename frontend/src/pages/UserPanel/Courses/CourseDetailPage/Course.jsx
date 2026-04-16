import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, Layout, X, Files, Play, ExternalLink, 
  Lock, User, Clock, CheckCircle, Loader2, Info,
  Sparkles, ArrowRight, Tag, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

// Константа ASSET_URL больше не нужна для S3, так как API присылает полные ссылки

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
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
      setShowEnrollModal(true);
    } catch (error) {
      if (error.response?.status === 400) {
        setEnrollmentStatus('pending');
        setShowEnrollModal(true);
      }
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

  const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
        ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` 
        : null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* MODAL FOR CONTENT VIEWING */}
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
                // Используем url из MinIO или Youtube
                src={activeContent.type === 'pdf' ? `${activeContent.url}#toolbar=0` : activeContent.url} 
                className="w-full h-full border-none bg-white" 
                title="content" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENROLL SUCCESS MODAL */}
      <AnimatePresence>
        {showEnrollModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Clock size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Заявка отправлена!</h3>
              <div className="space-y-4 text-slate-500 font-medium leading-relaxed mb-10 text-sm md:text-base">
                <p>Ваша заявка на курс <span className="text-slate-900 font-bold">"{course?.title}"</span> успешно принята.</p>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900">
                  Для получения полного доступа, пожалуйста, <span className="font-bold underline">обратитесь в учебный отдел для оплаты обучения</span>.
                </div>
              </div>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg"
              >
                Хорошо, понятно
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1640px] mx-auto px-6 lg:px-12 py-12">
        <Link to="/courses" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-12 font-black text-[10px] uppercase tracking-[0.2em]">
          <ArrowLeft size={16} /> Назад к курсам
        </Link>

        <div className="flex flex-col xl:flex-row gap-16">
          <div className="flex-1 space-y-12">
            <div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
              <header className="flex-1 min-w-0 space-y-8">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">      
                    {course?.category && (
                      <span className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                        {course.category.name}
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontWeight: 500 }} className="text-left text-4xl md:text-5xl xl:text-6xl text-slate-900 tracking-tighter leading-[1.1] w-full">
                    {course?.title}
                  </h1>
                </div>

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

              {/* PROMO VIDEO CARD */}
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
                  <div className="absolute inset-0 z-0">
                    {course?.promo_video_url ? (
                      <img 
                        src={getYoutubeThumbnail(course.promo_video_url)} 
                        alt="Video Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { e.target.src = '/placeholder-course.jpg'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                         <Sparkles className="text-slate-200" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors" />
                  </div>
                  
                  {course?.promo_video_url ? (
                    <>
                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="relative">
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

            <section className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Info size={16} className="text-blue-600" />
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">О программе</h3>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed text-left border-l-4 border-blue-600 pl-6 text-[14px]">
                {course?.description || "Описание курса уточняется."}
              </p>
            </section>

            {/* RESOURCES (Files from MinIO or Links) */}
            {course?.resources && course.resources.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <Files size={16} className="text-blue-600" />
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Дополнительные ресурсы</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.resources.map((res, index) => {
                    const isVideo = res.type === 'video' || (res.link_url && (res.link_url.includes('youtube.com') || res.link_url?.includes('youtu.be')));

                    const handleClick = (e) => {
                      if (isVideo) {
                        e.preventDefault();
                        setActiveContent({ 
                          url: getYoutubeEmbed(res.link_url), 
                          title: res.title, 
                          type: 'video' 
                        });
                      }
                      // Если PDF, то открываем в модалке (необязательно, можно и во вкладке)
                      if (res.type === 'pdf' && res.file_url) {
                        e.preventDefault();
                        setActiveContent({
                           url: res.file_url,
                           title: res.title,
                           type: 'pdf'
                        });
                      }
                    };

                    return (
                      <a 
                        key={index}
                        href={res.file_url || res.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={handleClick}
                        className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-lg transition-colors">
                            {isVideo ? <PlayCircle size={18} /> : (res.type === 'link' ? <ExternalLink size={18} /> : <FileText size={18} />)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{res.title}</p>
                            <p className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                              {isVideo ? 'Видео' : res.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </a>
                    );
                  })}
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
                                <div 
                                  key={lesson.id} 
                                  className={`flex items-center justify-between p-4 rounded-xl transition-colors group ${
                                    isLocked ? 'cursor-not-allowed' : 'hover:bg-blue-50/50 cursor-pointer'
                                  }`}
                                  onClick={() => {
                                    if (!isLocked) {
                                      // Если это PDF, можем показать в модалке, либо перейти в плеер курса
                                      if (lesson.type === 'pdf' && lesson.file_url) {
                                         setActiveContent({ url: lesson.file_url, title: lesson.title, type: 'pdf' });
                                      } else {
                                         navigate(`/app/courses/${id}`);
                                      }
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-4 text-left">
                                    <div className={`p-2 rounded-lg ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                                      {isLocked ? (
                                        <Lock size={16} />
                                      ) : (
                                        lesson.type === 'pdf' ? <FileText size={16} /> : <PlayCircle size={16} />
                                      )}
                                    </div>
                                    <div>
                                      <p className={`text-sm font-bold ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
                                        {lesson.title}
                                      </p>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {lesson.type}
                                      </p>
                                    </div>
                                  </div>
                                  {!isLocked && (
                                    <div className="flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase tracking-widest">
                                      Смотреть <ArrowRight size={14} />
                                    </div>
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
              {/* COURSE COVER (FROM MinIO) */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 mb-8 group bg-slate-100">
                <img 
                  src={course?.image_url || '/placeholder-course.jpg'} 
                  alt={course?.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>               

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-blue-600" />
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Преподаватель</h3>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-bold text-left text-slate-900">{course?.author_display_name || 'Инструктор'}</p>
                </div>
              </div>

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