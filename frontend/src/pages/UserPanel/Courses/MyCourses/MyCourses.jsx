import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, BookOpen, ChevronRight, Star, 
  BarChart3, GraduationCap, CheckCircle2,
  Clock, Calendar, Zap, Trophy, Filter,
  Layout, Bell, Lock, Target, PlayCircle
} from 'lucide-react';
import api from '../../../../api/axios';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/my-courses');
        setCourses(response.data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Фильтрация данных на основе статуса и поиска
  const approved = useMemo(() => 
    courses.filter(c => c.status === 'approved' && c.title.toLowerCase().includes(searchQuery.toLowerCase())), 
    [courses, searchQuery]
  );
  
  const pending = useMemo(() => 
    courses.filter(c => c.status === 'pending'), 
    [courses]
  );

  const filteredCourses = useMemo(() => {
    if (activeTab === 'active') return approved.filter(c => (c.pivot?.progress || 0) < 100);
    if (activeTab === 'completed') return approved.filter(c => (c.pivot?.progress || 0) === 100);
    return approved;
  }, [approved, activeTab]);

  // Статистика из реальных данных
  const stats = useMemo(() => {
    const total = approved.length;
    const completed = approved.filter(c => (c.pivot?.progress || 0) === 100).length;
    const avgProgress = total > 0 
      ? Math.round(approved.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0) / total) 
      : 0;
    
    return { total, completed, avgProgress, streak: 7, points: 1250 };
  }, [approved]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Загрузка Zeynoalla Workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white border rounded-lg mx-auto px-10 py-10min-h-screen font-sans">
      
      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Моё обучение</h1>
            <p className="text-slate-400 text-sm font-medium">Рады видеть вас снова! Продолжайте рост.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Поиск по курсам..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 ring-indigo-500/5 outline-none transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* ТАБЫ */}
        <div className="flex items-center justify-between border-b border-slate-100">
          <div className="flex gap-8">
            {['all', 'active', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize transition-all relative ${
                  activeTab === tab ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'
                }`}
              >
                {tab === 'all' ? 'Все' : tab === 'active' ? 'В процессе' : 'Завершено'}
                {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* СЕКЦИЯ PENDING */}
        {pending.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse" /> Ожидают доступа
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pending.map(c => (
                <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-70">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300"><Lock size={18}/></div>
                  <span className="text-xs font-bold text-slate-600 truncate">{c.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ГРИД АКТИВНЫХ КУРСОВ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => <CourseCard key={course.id} course={course} />)
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <p className="text-slate-300 font-bold text-sm">Здесь пока пусто</p>
            </div>
          )}
        </section>
      </main>

      {/* САЙДБАР СТАТИСТИКИ */}
      <aside className="w-full lg:w-[400px] bg-[#fcfdfe] border-l border-slate-50 p-8 md:p-10 space-y-10">
        <div className="grid grid-cols-2 gap-4">
          <StatMiniCard icon={<BookOpen size={18}/>} label="Курсов" value={stats.total} color="text-blue-600" bg="bg-blue-50" />
          <StatMiniCard icon={<Zap size={18}/>} label="Ударно" value={`${stats.streak} дн.`} color="text-orange-600" bg="bg-orange-50" />
          <StatMiniCard icon={<Trophy size={18}/>} label="Финиш" value={stats.completed} color="text-indigo-600" bg="bg-indigo-50" />
          <StatMiniCard icon={<Target size={18}/>} label="Прогресс" value={`${stats.avgProgress}%`} color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-7 space-y-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Активность</h3>
          <div className="flex items-end justify-between h-36 px-2">
            {[30, 55, 40, 85, 60, 20, 45].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className={`w-2.5 rounded-full ${i === 3 ? 'bg-indigo-600' : 'bg-slate-100'}`} style={{ height: `${h}%` }} />
                <span className="text-[9px] font-bold text-slate-300 uppercase">{'пвссчпв'[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest px-2">События</h3>
           <ScheduleItem title="Тест: Основы Laravel" date="Завтра" time="10:00" />
           <ScheduleItem title="Вручение сертификата" date="15 Апр" time="12:00" />
        </div>
      </aside>
    </div>
  );
};

// --- КОМПОНЕНТЫ КАРТОЧЕК ---

const CourseCard = ({ course }) => {
  const progress = course.pivot?.progress || 0;
  return (
    <Link to={`/app/courses/${course.id}`} className="group block space-y-5">
      <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-slate-100">
        <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={course.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        
        {/* PROGRESS OVERLAY */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Модуль {course.pivot?.current_module}</span>
              <span className="text-[10px] font-bold text-white">{progress}%</span>
            </div>
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded">{course.category}</span>
          <span className="text-[10px] font-bold text-slate-400">
            {course.pivot?.completed_lessons} / {course.lessons_count} уроков
          </span>
        </div>
        <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">{course.title}</h3>
        <p className="text-xs text-slate-400 font-medium line-clamp-1 italic">Далее: {course.last_lesson_title}</p>
      </div>
    </Link>
  );
};

const StatMiniCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white border border-slate-50 p-5 rounded-[2rem] space-y-3 shadow-sm">
    <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  </div>
);

const ScheduleItem = ({ title, date, time }) => (
  <div className="flex items-center gap-4 p-4 bg-white border border-slate-50 rounded-2xl group cursor-pointer hover:border-indigo-100 transition-all">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center group-hover:bg-indigo-50 transition-colors">
      <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 uppercase leading-none">{date}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h5 className="text-xs font-bold text-slate-800 truncate">{title}</h5>
      <p className="text-[10px] font-medium text-slate-400">{time}</p>
    </div>
    <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-400" />
  </div>
);

export default MyCourses;