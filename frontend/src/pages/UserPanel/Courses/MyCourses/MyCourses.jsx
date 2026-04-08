import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, LayoutGrid, FilterX, Clock, 
  Sparkles, AlertCircle, BookOpen, CheckCircle2,
  TrendingUp, GraduationCap, ArrowRight, Database, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, colorClass, description, onClick }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className={`w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all text-left ${onClick ? 'hover:border-indigo-400 hover:shadow-md cursor-pointer' : ''}`}
  >
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
  </button>
);

const STATUS_OPTIONS = ['Все', 'В процессе', 'Завершено'];

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [showPendingModal, setShowPendingModal] = useState(false); // Состояние модалки

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

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen text-slate-900 relative">
      
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

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Всего курсов" value={stats.total} icon={BookOpen} colorClass="bg-slate-100 text-slate-600" description="Доступные программы" />
        <StatCard label="Общий прогресс" value={`${stats.avgProgress}%`} icon={TrendingUp} colorClass="bg-indigo-100 text-indigo-600" description="Средний показатель" />
        <StatCard label="Завершено" value={stats.completed} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" description="Курсы со 100% прогрессом" />
        
        {/* Кликабельная карточка ожидания */}
        <StatCard 
          label="В ожидании" 
          value={pending.length} 
          icon={Clock} 
          colorClass="bg-amber-100 text-amber-600" 
          description="Нажмите, чтобы посмотреть" 
          onClick={pending.length > 0 ? () => setShowPendingModal(true) : null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-10 text-left space-y-8">
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
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          {error ? (
            <div className="p-20 bg-rose-50 rounded-[32px] border border-rose-100 text-center">
               <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
               <p className="font-bold text-rose-900">{error}</p>
               <button onClick={fetchCourses} className="mt-4 text-[10px] font-black uppercase text-rose-600 underline">Переподключиться</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 gap-6">
      <AnimatePresence mode='popLayout'>
        {filteredCourses.map((course) => {
          // Получаем прогресс из данных сводной таблицы (pivot)
          const progress = course.pivot?.progress || 0;

          return (
            <motion.div 
              layout 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              key={course.id}
              className="space-y-3" // Отступ между карточкой и прогресс-баром
            >
              
              <div className="px-2">
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Прогресс обучения</span>
                  <span className="text-[10px] font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-sm">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                  />
                </div>
              </div>
              <Link to={`/app/courses/${course.id}`} className="block transition-transform active:scale-[0.98]">
                <CourseCard course={course} isMyCourse={true} />
                </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  )}
          {filteredCourses.length === 0 && !loading && (
            <div className="p-32 bg-white rounded-[32px] border border-dashed border-slate-200 text-center">
              <Database size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ничего не найдено</h3>
              <button onClick={() => {setSelectedStatus('Все'); setSearchQuery('');}} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                Сбросить поиск
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: PENDING COURSES LIST */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
              
              <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-amber-100 text-amber-600">
                      Ожидание доступа
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Заявки в обработке</h3>
                </div>
                <button onClick={() => setShowPendingModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1 space-y-3">
                {pending.map((course) => (
                  <div key={course.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 text-left shadow-sm">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                      <BookOpen size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{course.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={10} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Подано: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase">
                      In Review
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <button 
                  onClick={() => setShowPendingModal(false)}
                  className="w-full py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-600 transition-all"
                >
                  Понятно
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default MyCourses;