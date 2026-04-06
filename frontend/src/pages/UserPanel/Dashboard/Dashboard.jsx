import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, ChevronRight, Play, LayoutGrid, 
  Search, Filter, ArrowRight, Folder, LayoutDashboard,
  GraduationCap, Zap, CheckCircle2
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' или 'courses'

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/my-courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Синхронизация данных...</span>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10">
        
        {/* --- ВЕРХНЯЯ ПАНЕЛЬ --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Личный кабинет</h1>
            <div className="flex items-center gap-4 mt-3">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Обзор
              </button>
              <button 
                onClick={() => setActiveTab('courses')}
                className={`text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'courses' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Мои курсы ({courses.length})
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm shadow-slate-100">
                <Zap size={16} className="text-amber-500" fill="currentColor" />
                <span className="text-xs font-black text-slate-900">12 Дней ударного обучения</span>
             </div>
          </div>
        </header>

        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* --- ЛЕВАЯ КОЛОНКА --- */}
            <div className="lg:col-span-8 space-y-10">
              
              {activeTab === 'overview' ? (
                <>
                  {/* ГЛАВНЫЙ КУРС */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                       <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                         <Play size={14} fill="currentColor"/> Сейчас изучаю
                       </h2>
                    </div>
                    <ActiveCourseHero course={courses[0]} />
                  </section>

                  {/* СТАТИСТИКА В ПЛИТКАХ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <StatCard title="Всего уроков" value="128" icon={<BookOpen size={20}/>} color="bg-blue-500" />
                     <StatCard title="Средний балл" value="94%" icon={<GraduationCap size={20}/>} color="bg-emerald-500" />
                  </div>
                </>
              ) : (
                /* СПИСОК ВСЕХ КУРСОВ */
                <section className="space-y-4">
                  {courses.map(course => (
                    <CourseRowItem key={course.id} course={course} />
                  ))}
                </section>
              )}
            </div>

            {/* --- ПРАВАЯ КОЛОНКА --- */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                 <div className="relative z-10 space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Твой прогресс</h3>
                    <div className="space-y-2">
                      <p className="text-3xl font-black">{calculateTotalProgress(courses)}%</p>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">Средний прогресс по всем активным программам</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${calculateTotalProgress(courses)}%` }} />
                    </div>
                 </div>
              </div>

              {/* БЛОК СЕРТИФИКАТОВ */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                   <Folder size={14} /> Доступные сертификаты
                </h3>
                <div className="flex flex-col items-center py-6 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-slate-200" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Пока нет завершенных курсов</p>
                </div>
              </div>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
};

/* --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ --- */
const calculateTotalProgress = (courses) => {
  if (courses.length === 0) return 0;
  const total = courses.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0);
  return Math.round(total / courses.length);
};

/* --- МИНИ-КОМПОНЕНТЫ --- */

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 flex items-center gap-5">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
      <LayoutDashboard size={40} className="text-slate-200" />
    </div>
    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Здесь пока пусто</h3>
    <p className="text-slate-400 text-sm mt-2 font-medium">Администратор еще не назначил вам учебные курсы.</p>
  </div>
);

const ActiveCourseHero = ({ course }) => (
  <div className="bg-white rounded-[3rem] border border-slate-200/60 p-2 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className="flex flex-col xl:flex-row xl:items-center gap-8 pr-8">
      <div className="w-full xl:w-72 h-48 rounded-[2.5rem] overflow-hidden shrink-0 shadow-inner">
        <img 
          src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt="" 
        />
      </div>
      <div className="flex-1 py-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Текущий прогресс</span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{course.title}</h3>
          </div>
          <div className="font-black text-lg text-slate-900">{course.pivot?.progress || 0}%</div>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${course.pivot?.progress || 0}%` }} />
        </div>
        <Link to={`/courses/${course.id}/learn`} className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">
          Учиться дальше <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </div>
);

const CourseRowItem = ({ course }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-200/60 flex flex-col md:flex-row md:items-center gap-6 hover:border-slate-300 transition-all group">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
      <div className="font-black text-slate-400 text-xs">#{course.id}</div>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{course.title}</h4>
      <div className="flex items-center gap-4 mt-1">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase"><Clock size={12}/> 12 уроков</span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase italic">Активен</span>
      </div>
    </div>
    <div className="flex items-center gap-8">
       <div className="text-right">
          <p className="text-sm font-black text-slate-900">{course.pivot?.progress || 0}%</p>
       </div>
       <Link to={`/courses/${course.id}/learn`} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
         <ChevronRight size={18} />
       </Link>
    </div>
  </div>
);

export default Dashboard;