import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, LayoutGrid, FilterX, Clock, 
  Sparkles, AlertCircle, BookOpen, CheckCircle2,
  TrendingUp, GraduationCap, ArrowRight, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';

// Компонент карточки статистики в стиле админки
const StatCard = ({ icon: Icon, label, value, colorClass, description }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md text-left">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{description}</p>
  </div>
);

const STATUS_OPTIONS = ['Все', 'В процессе', 'Завершено'];

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Все');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/my-courses');
      setCourses(response.data);
    } catch (err) {
      setError("Ошибка синхронизации данных");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const { filteredCourses, stats, pending } = useMemo(() => {
    const approved = courses.filter(c => c.status === 'approved');
    const pending = courses.filter(c => c.status === 'pending');
    
    const filtered = approved.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const progress = course.pivot?.progress || 0;
      if (selectedStatus === 'В процессе') return matchesSearch && progress < 100;
      if (selectedStatus === 'Завершено') return matchesSearch && progress === 100;
      return matchesSearch;
    });

    const total = approved.length;
    const completed = approved.filter(c => (c.pivot?.progress || 0) === 100).length;
    const avgProgress = total > 0 
      ? Math.round(approved.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0) / total) 
      : 0;

    return { filteredCourses: filtered, stats: { total, completed, avgProgress }, pending };
  }, [courses, searchQuery, selectedStatus]);

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <GraduationCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={16} />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-6">Загрузка программ</span>
      </div>
    );
  }

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tighter">Моё обучение</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">Персональный план развития</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          V2.9 • STUDENT MODE
        </div>
      </div>

      {/* STATS (ADMIN STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard 
          label="Всего курсов" 
          value={stats.total} 
          icon={BookOpen} 
          colorClass="bg-slate-100 text-slate-600" 
          description="Доступные программы" 
        />
        <StatCard 
          label="Общий прогресс" 
          value={`${stats.avgProgress}%`} 
          icon={TrendingUp} 
          colorClass="bg-indigo-100 text-indigo-600" 
          description="Средний показатель" 
        />
        <StatCard 
          label="Завершено" 
          value={stats.completed} 
          icon={CheckCircle2} 
          colorClass="bg-emerald-100 text-emerald-600" 
          description="Курсы со 100% прогрессом" 
        />
        <StatCard 
          label="В ожидании" 
          value={pending.length} 
          icon={Clock} 
          colorClass="bg-amber-100 text-amber-600" 
          description="Заявки на проверке" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: FILTERS & SEARCH */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-10 text-left space-y-8">
            
            {/* Search Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Поиск</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Название курса..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Статус</label>
              <div className="flex flex-col gap-2">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all border ${
                      selectedStatus === status 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {status}
                    {selectedStatus === status && <ArrowRight size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase">
                  <Sparkles size={12} className="text-amber-400" />
                  Удачного обучения!
               </div>
            </div>
          </div>
        </div>

        {/* MAIN LIST */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Pending Requests Alert Style */}
          {pending.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-white p-2 rounded-lg">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Ожидают подтверждения ({pending.length})</h4>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Доступ будет открыт в ближайшее время</p>
                </div>
              </div>
              <div className="flex -space-x-2">
                {pending.slice(0, 3).map(c => (
                  <div key={c.id} className="w-8 h-8 rounded-full bg-white border-2 border-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-500 shadow-sm">
                    {c.title.substring(0, 1)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error ? (
            <div className="p-20 bg-rose-50 rounded-[32px] border border-rose-100 text-center">
               <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
               <p className="font-bold text-rose-900">{error}</p>
               <button onClick={fetchCourses} className="mt-4 text-[10px] font-black uppercase text-rose-600 underline">Переподключиться</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredCourses.map((course) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={course.id}
                  >
                    <CourseCard course={course} isMyCourse={true} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {filteredCourses.length === 0 && !loading && (
            <div className="p-32 bg-white rounded-[32px] border border-dashed border-slate-200 text-center">
              <Database size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ничего не найдено</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Попробуйте изменить параметры фильтрации</p>
              <button 
                onClick={() => {setSelectedStatus('Все'); setSearchQuery('');}}
                className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
              >
                Сбросить поиск
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MyCourses;