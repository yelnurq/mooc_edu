import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, FileText, PlayCircle, ChevronDown, 
  ChevronUp, Layout, X, Files, Play, ExternalLink, 
  Lock, User, Clock, CheckCircle, Loader2 
} from 'lucide-react';
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
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // Состояния для заявок
  const [enrollmentStatus, setEnrollmentStatus] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');

  // 1. Загрузка данных курса
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await api.get(`/courses/public/${id}`);
        setCourse(response.data);
        // Бекенд должен возвращать user_status: 'pending', 'approved' или null
        setEnrollmentStatus(response.data.user_status || null);
      } catch (error) {
        console.error("Ошибка при загрузке курса:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  // 2. Функция подачи заявки
 // Функция подачи заявки
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: location.pathname, autoEnroll: true } 
      });
      return;
    }

    // Если статус уже 'pending' или 'approved', не даем кликать повторно
    if (enrollmentStatus) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/courses/${id}/enroll`);
      
      // Если сервер вернул успех
      setEnrollmentStatus('pending');
    } catch (error) {
      console.error("Ошибка при подаче заявки:", error);
      
      // ЧИТАЕМ ОТВЕТ СЕРВЕРА
      if (error.response?.status === 400) {
        // Если ошибка 400, скорее всего заявка уже есть
        const errorMessage = error.response?.data?.message;
        
        if (errorMessage?.includes('already') || errorMessage?.includes('существует')) {
            setEnrollmentStatus('pending'); // Синхронизируем UI, если запись уже в базе
        } else {
            alert(errorMessage || "Запрос отклонен сервером.");
        }
      } else {
        alert("Не удалось отправить заявку. Проверьте соединение.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Авто-запись после возвращения с логина
  useEffect(() => {
    if (isAuthenticated && location.state?.autoEnroll && course && enrollmentStatus === null) {
      handleEnroll();
      // Очищаем state, чтобы действие не повторялось при обновлении страницы
      window.history.replaceState({}, document.title);
    }
  }, [isAuthenticated, course, enrollmentStatus, location.state]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'none';
    if (imagePath.startsWith('http')) return `url("${imagePath}")`;
    const cleanPath = imagePath.replace(/^storage\//, '');
    return `url("${ASSET_URL}${cleanPath}")`;
  };

  const handleOpenContent = (content) => {
    if (content.isFromModule) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      if (enrollmentStatus !== 'approved') {
        alert("Доступ к урокам откроется после одобрения вашей заявки администратором.");
        return;
      }
    }
    setActiveContent(content);
  };

  const toggleModule = (index) => {
    setOpenModules(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    return url;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse text-slate-400 font-black tracking-widest uppercase">Загрузка программы...</div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 relative font-sans">
      
      {/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА */}
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
            <button onClick={() => setActiveContent(null)} className="p-2 bg-white/10 hover:bg-red-500 rounded-xl transition-all">
              <X size={24} />
            </button>
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

      {/* ГЛАВНЫЙ БАННЕР */}
      <div 
        className="relative pt-20 pb-32 px-8 overflow-hidden bg-slate-900"
        style={{
            backgroundImage: getImageUrl(course?.image),
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="absolute inset-0 backdrop-blur-[3px]" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <Link to="/courses" className="self-start flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 font-bold text-xs uppercase tracking-widest bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
            <ArrowLeft size={16} /> Назад к списку
          </Link>
          
          <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] text-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            {course?.title}
          </h1>

          {/* КНОПКА ЗАЯВКИ */}
          <div className="mb-10 scale-110">
            {enrollmentStatus === 'approved' ? (
              <div className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 backdrop-blur-xl text-green-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl">
                <CheckCircle size={22} /> Вы зачислены на курс
              </div>
            ) : enrollmentStatus === 'pending' ? (
              <div className="flex items-center gap-3 bg-orange-500/20 border border-orange-500/50 backdrop-blur-xl text-orange-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl">
                <Clock size={22} className="animate-pulse" /> Заявка на рассмотрении
              </div>
            ) : (
              <button 
                onClick={handleEnroll}
                disabled={isSubmitting}
                className="group relative bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
                {isSubmitting ? 'Отправка...' : 'Записаться на курс'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-10 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
              {course?.author?.avatar ? (
                  <img src={course.author.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" alt="" />
              ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white border-2 border-blue-400">
                      <User size={24} />
                  </div>
              )}
              <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-400">Автор курса</span>
                  <span className="text-base font-black text-white">{course?.author_display_name || 'Инструктор'}</span>
              </div>
          </div>
          
          <div className="relative w-full max-w-3xl">
            <div className={`text-white/90 text-lg md:text-xl font-medium leading-relaxed text-center transition-all duration-700 overflow-hidden ${isDescExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'}`}>
              {course?.description || "Описание курса находится в разработке."}
            </div>
            {course?.description?.length > 150 && (
              <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="mt-6 mx-auto flex items-center gap-2 bg-white text-slate-900 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl transform hover:scale-105">
                {isDescExpanded ? <><ChevronUp size={16} /> Свернуть</> : <><ChevronDown size={16} /> Читать полностью</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* УЧЕБНАЯ ПРОГРАММА */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 gap-12">
          
          {/* Ресурсы */}
          {course?.resources?.length > 0 && (
            <div>
              <h2 className="text-slate-100 font-black text-[11px] uppercase tracking-[0.25em] ml-6 mb-6 flex items-center gap-2 drop-shadow-md">
                <Files size={16} className="text-blue-400" /> Дополнительные ресурсы
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {course.resources.map((res) => (
                  <div key={res.id} onClick={() => handleOpenContent({ url: res.type === 'pdf' ? res.file_url : res.video_url, title: res.title, type: res.type, isFromModule: false })}
                    className="group bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${res.type === 'pdf' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                        {res.type === 'pdf' ? <FileText size={26} /> : <Play size={26} fill="currentColor" />}
                      </div>
                      <div className="text-left">
                        <h3 className="font-black text-base text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{res.title}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/70 mt-1">Открытый доступ</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all"><ExternalLink size={18} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Модули */}
          <div className="space-y-4">
            <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] ml-4 mb-4 flex items-center gap-2">
              <Layout size={14} /> Учебная программа
            </h2>
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id} className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <button onClick={() => toggleModule(mIdx)} className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors text-left outline-none">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-xl">
                      {String(mIdx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900">{module.title}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{module.lessons?.length || 0} занятий в модуле</span>
                    </div>
                  </div>
                  {openModules.includes(mIdx) ? <ChevronUp className="text-slate-300" /> : <ChevronDown className="text-slate-300" />}
                </button>

                {openModules.includes(mIdx) && (
                  <div className="px-8 pb-8 space-y-3">
                    {module.lessons?.map((lesson) => {
                      const isLocked = enrollmentStatus !== 'approved';
                      return (
                        <div key={lesson.id} className={`group flex items-center justify-between p-5 rounded-2xl border border-slate-100 transition-all ${isLocked ? 'opacity-60 bg-slate-50/50' : 'hover:border-blue-200 hover:bg-blue-50/30'}`}>
                          <div className="flex items-center gap-5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? 'bg-slate-200 text-slate-400' : (lesson.type === 'pdf' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500')}`}>
                              {isLocked ? <Lock size={18} /> : (lesson.type === 'pdf' ? <FileText size={20} /> : <PlayCircle size={20} />)}
                            </div>
                            <div className="text-left">
                              <h4 className={`font-bold transition-colors ${isLocked ? 'text-slate-500' : 'text-slate-800 group-hover:text-blue-600'}`}>{lesson.title}</h4>
                              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mt-0.5">{lesson.type === 'pdf' ? 'Лекция PDF' : 'Видео-урок'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleOpenContent({ url: lesson.type === 'pdf' ? lesson.file_url : lesson.video_url, title: lesson.title, type: lesson.type, isFromModule: true })}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${isLocked ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border border-slate-200 hover:bg-slate-900 hover:text-white'}`}>
                            {isLocked && <Lock size={12} />}
                            {lesson.type === 'pdf' ? 'Читать' : 'Смотреть'}
                          </button>
                        </div>
                      );
                    })}
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