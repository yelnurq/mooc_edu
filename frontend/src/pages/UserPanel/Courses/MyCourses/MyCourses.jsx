import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, BookOpen, ChevronRight, Lock } from 'lucide-react';
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
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  const approved = useMemo(() => courses.filter(c => c.status === 'approved' && c.title.toLowerCase().includes(searchQuery.toLowerCase())), [courses, searchQuery]);
  const pending = useMemo(() => courses.filter(c => c.status === 'pending'), [courses]);

  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Загрузка библиотеки...</div>;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Моё обучение</h2>
          <p className="text-sm text-slate-400">Все ваши программы и заявки на доступ</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" placeholder="Поиск по курсам..." 
            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-72 focus:ring-2 ring-indigo-500/10 outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ОЖИДАЮТ ОДОБРЕНИЯ */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock size={14}/> В процессе активации
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(course => (
              <div key={course.id} className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center gap-4 opacity-75">
                <div className="w-12 h-12 bg-slate-200 rounded-lg grayscale shrink-0"><img src={course.image} className="w-full h-full object-cover rounded-lg"/></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-700 truncate uppercase tracking-tight">{course.title}</h4>
                  <p className="text-[9px] font-bold text-amber-600 uppercase mt-1">Доступ проверяется</p>
                </div>
                <Lock size={14} className="text-amber-300" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* АКТИВНЫЕ КУРСЫ */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Мои программы ({approved.length})</h3>
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          {approved.length > 0 ? (
            approved.map(course => (
              <Link key={course.id} to={`/app/courses/${course.id}`} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 group">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                  <img src={course.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-indigo-500" style={{width: `${course.pivot?.progress || 0}%`}} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{course.pivot?.progress || 0}% пройден</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))
          ) : (
            <div className="p-20 text-center">
              <BookOpen size={40} className="mx-auto text-slate-100 mb-4" />
              <p className="text-sm text-slate-400 font-medium">Активных курсов пока нет</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyCourses;