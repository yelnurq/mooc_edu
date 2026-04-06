import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, ChevronRight, 
  Play, Calendar, LayoutGrid, 
  CheckCircle2, Search, Filter, 
  ArrowRight, Folder
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Загрузка личного кабинета</span>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Мое обучение</h1>
            <p className="text-slate-500 font-medium mt-2">У вас {courses.length} активных курсов в программе</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Поиск по курсам..." 
                className="pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all w-full md:w-64"
              />
            </div>
            <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </header>

        {/* --- ОСНОВНАЯ СЕТКА --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ЛЕВАЯ ЧАСТЬ: КУРСЫ (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ГЛАВНЫЙ ФОКУС (Последний запущенный курс) */}
            {courses[0] && (
              <section>
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                     <Play size={14} fill="currentColor"/> Продолжить просмотр
                   </h2>
                </div>
                <ActiveCourseHero course={courses[0]} />
              </section>
            )}

            {/* СПИСОК ВСЕХ КУРСОВ */}
            <section className="space-y-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                 <LayoutGrid size={14} /> Учебный план
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {courses.slice(1).map(course => (
                  <CourseRowItem key={course.id} course={course} />
                ))}
              </div>
            </section>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: ИНФО И РАСПИСАНИЕ (4/12) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* БЛОК СТАТИСТИКИ (Чисто учебная) */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <BookOpen size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Всего пройдено</p>
                      <p className="text-xl font-black">24 из 56 уроков</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[42%]" />
                  </div>
                  <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    Получить сертификат <ArrowRight size={14} />
                  </button>
               </div>
            </div>

            {/* ПЛАНЕР / ЗАМЕТКИ */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8">
              <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Calendar size={14} /> Ближайшие дедлайны
              </h3>
              <div className="space-y-6">
                <DeadlineItem 
                  title="Домашнее задание №4" 
                  course="UI/UX Design Masterclass" 
                  date="Завтра, 18:00"
                  type="urgent"
                />
                <DeadlineItem 
                  title="Тестирование модуля" 
                  course="React Native" 
                  date="24 Октября"
                  type="normal"
                />
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

/* --- МИНИ-КОМПОНЕНТЫ --- */

const ActiveCourseHero = ({ course }) => (
  <div className="bg-white rounded-[3rem] border border-slate-200/60 p-2 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className="flex flex-col xl:flex-row xl:items-center gap-8 pr-8">
      <div className="w-full xl:w-80 h-52 rounded-[2.5rem] overflow-hidden shrink-0 shadow-inner">
        <img 
          src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt="" 
        />
      </div>
      <div className="flex-1 py-6 pl-6 xl:pl-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">Продолжить модуль 3</span>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{course.title}</h3>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-black text-sm text-slate-900">
            64%
          </div>
        </div>
        <div className="w-full h-2 bg-slate-50 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-slate-900 rounded-full w-[64%]" />
        </div>
        <div className="flex items-center gap-4">
          <Link to={`/courses/${course.id}/learn`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
            Запустить плеер
          </Link>
          <button className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">
            Программа <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CourseRowItem = ({ course }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-200/60 flex flex-col md:flex-row md:items-center gap-6 hover:border-slate-300 transition-all group">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
      <Folder size={24} className="text-slate-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{course.title}</h4>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">12 уроков • 4 часа контента</p>
    </div>
    <div className="flex items-center gap-8">
       <div className="hidden sm:block text-right">
          <p className="text-[10px] font-black uppercase text-slate-400">Прогресс</p>
          <p className="text-sm font-black text-slate-900">80%</p>
       </div>
       <Link to={`/courses/${course.id}/learn`} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
         <ChevronRight size={20} />
       </Link>
    </div>
  </div>
);

const DeadlineItem = ({ title, course, date, type }) => (
  <div className="flex gap-4 group">
    <div className={`w-1 bg-slate-100 rounded-full transition-colors ${type === 'urgent' ? 'group-hover:bg-red-500' : 'group-hover:bg-blue-500'}`} />
    <div className="py-1">
      <h4 className="text-[13px] font-black text-slate-900 leading-tight">{title}</h4>
      <p className="text-[11px] font-bold text-slate-400 mt-1">{course}</p>
      <div className="flex items-center gap-2 mt-2">
        <Clock size={12} className="text-slate-300" />
        <span className={`text-[10px] font-black uppercase tracking-widest ${type === 'urgent' ? 'text-red-500' : 'text-slate-400'}`}>
          {date}
        </span>
      </div>
    </div>
  </div>
);

export default Dashboard;