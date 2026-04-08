import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, Layout, X, Files, Play, ExternalLink, 
  Lock, User, Clock, CheckCircle, Loader2, Info, BookOpen
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

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
        <Link to="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-12 font-black text-[10px] uppercase tracking-[0.2em]">
          <ArrowLeft size={16} /> Назад к курсам
        </Link>

        <div className="flex flex-col xl:flex-row gap-16">
          
          {/* LEFT CONTENT */}
          <div className="flex-1 space-y-12">
            <header>
              <h1 style={{ fontWeight: 500 }} className="text-4xl md:text-6xl text-slate-900 tracking-tighter mb-8 leading-[1.1]">
                {course?.title}
              </h1>
              <div className="flex items-center gap-3 bg-white w-fit px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <BookOpen size={16} className="text-blue-600" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  {course?.modules?.length || 0} Модулей обучения
                </span>
              </div>
            </header>

            {/* DESCRIPTION */}
            <section className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Info size={16} className="text-blue-600" />
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">О программе</h3>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed border-l-4 border-blue-600 pl-6 text-lg">
                {course?.description || "Описание курса уточняется."}
              </p>
            </section>

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
              
              {/* AUTHOR */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-blue-600" />
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Преподаватель</h3>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {course?.author_display_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{course?.author_display_name || 'Инструктор'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fullstack Developer</p>
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
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Доступ</span>
                  <span className="text-slate-900">Пожизненный</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Язык</span>
                  <span className="text-slate-900">Русский</span>
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