import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Clock, BookOpen, Play, ChevronRight, Lock, 
  Trophy, Star, PlayCircle, BarChart3, GraduationCap 
} from 'lucide-react';
import api from '../../../../api/axios';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/my-courses');
        setCourses(response.data);
      } catch (err) { 
        console.error("Ошибка загрузки курсов:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCourses();
  }, []);

  const approved = useMemo(() => 
    courses.filter(c => c.status === 'approved' && c.title.toLowerCase().includes(searchQuery.toLowerCase())), 
    [courses, searchQuery]
  );
  
  const pending = useMemo(() => 
    courses.filter(c => c.status === 'pending'), 
    [courses]
  );

  const stats = useMemo(() => {
    const total = approved.length;
    const completed = approved.filter(c => (c.pivot?.progress || 0) === 100).length;
    const avgProgress = total > 0 
      ? Math.round(approved.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0) / total) 
      : 0;
    return { total, completed, avgProgress };
  }, [approved]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Загружаем вашу библиотеку...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10 text-left pb-20">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            <GraduationCap size={12} /> Учебный портал
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Моё обучение</h2>
          <p className="text-slate-500 font-medium">Сегодня отличный день, чтобы узнать что-то новое!</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Найти курс по названию..." 
            className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl w-full lg:w-96 shadow-sm focus:ring-4 ring-indigo-500/5 outline-none transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

   

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Курсов активно" value={stats.total} icon={BookOpen} trend="В процессе" color="bg-blue-500" />
        <StatCard label="Средний прогресс" value={`${stats.avgProgress}%`} icon={BarChart3} trend="Общий показатель" color="bg-indigo-500" />
        <StatCard label="Завершено" value={stats.completed} icon={Trophy} trend="Сертификатов" color="bg-emerald-500" />
      </div>

      {/* PENDING SECTION */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <div className="h-4 w-1 bg-amber-400 rounded-full" /> Ожидают активации
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pending.map(course => (
              <div key={course.id} className="p-4 bg-white border border-slate-100 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center"><Lock size={18} className="text-slate-300" /></div>
                <div className="min-w-0"><h4 className="text-sm font-bold text-slate-700 truncate">{course.title}</h4></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ACTIVE COURSES LIST */}
      <section className="space-y-6">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <div className="h-4 w-1 bg-indigo-500 rounded-full" /> Мои программы
        </h3>

        <div className="grid grid-cols-1 gap-5">
          {approved.length > 0 ? (
            approved.map(course => (
              <Link 
                key={course.id} 
                to={`/app/courses/${course.id}`} 
                className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 pr-8 flex flex-col md:flex-row items-center gap-6 hover:border-indigo-500/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-full md:w-56 aspect-video rounded-[1.8rem] overflow-hidden shrink-0 relative">
                  <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-duration-700" alt="" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="flex-1 w-full space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase">{course.category || 'Premium'}</span>
                    <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                  </div>

                  {/* PROGRESS DETAILS */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Прогресс обучения</span>
                        <span className="text-[11px] font-bold text-slate-700">
                          Модуль {course.pivot?.current_module || 1} из {course.modules_count || 0} 
                          <span className="text-slate-300 mx-2">|</span> 
                          {course.pivot?.completed_lessons || 0} из {course.lessons_count || 0} уроков
                        </span>
                      </div>
                      <span className="text-sm font-black text-indigo-600">{course.pivot?.progress || 0}%</span>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{width: `${course.pivot?.progress || 0}%`}} 
                      />
                    </div>
                    
                    {/* MODULE INDICATORS */}
                    <div className="flex gap-1.5">
                      {Array.from({ length: Math.min(course.modules_count || 0, 12) }).map((_, idx) => (
                        <div 
                          key={idx}
                          className={`h-1 flex-1 rounded-full ${idx < (course.pivot?.current_module || 1) ? 'bg-indigo-400' : 'bg-slate-100'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex w-12 h-12 rounded-full bg-slate-50 items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 bg-white border border-dashed border-slate-200 rounded-[3rem] text-center">
               <p className="text-slate-400 font-bold">У вас пока нет активных курсов</p>
               <Link to="/app/catalog" className="inline-block mt-4 text-indigo-600 font-black text-sm uppercase">Перейти в каталог</Link>
            </div>
          )}
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="pt-10 border-t border-slate-100 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight tracking-tight">Рекомендовано для вас</h3>
            <p className="text-sm text-slate-400 font-medium">Основано на вашем опыте</p>
          </div>
          <Link to="/app/catalog" className="text-xs font-black text-indigo-600 uppercase tracking-widest">Все курсы</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group bg-slate-50 border border-slate-100 rounded-[2rem] p-4 hover:bg-white hover:shadow-xl transition-all">
              <div className="aspect-video rounded-[1.5rem] overflow-hidden mb-4 bg-indigo-100" />
              <div className="px-2 space-y-3 text-left">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase rounded">Advanced</span>
                <h4 className="font-black text-slate-800">Продвинутая разработка систем</h4>
                <button className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}><Icon size={24} /></div>
    <div className="text-left">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 italic">{trend}</p>
    </div>
  </div>
);

export default MyCourses;