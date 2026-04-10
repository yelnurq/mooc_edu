import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, Clock, AlertCircle, BookOpen, CheckCircle2,
  TrendingUp, ArrowRight, Database, X, GraduationCap, 
  ArrowUpRight, LayoutGrid, Filter,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, colorClass, description, onClick, isPrimary }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className={`w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all text-left group ${onClick ? 'hover:border-blue-400 hover:shadow-md cursor-pointer' : ''} ${isPrimary ? 'ring-1 ring-blue-600/10' : ''}`}
  >
    <div className={`absolute top-0 left-0 w-1 h-full ${isPrimary ? 'bg-blue-600' : 'bg-slate-200'}`} />
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{description}</p>
  </button>
);

const STATUS_OPTIONS = [
  { id: 'Все', label: 'Весь план' },
  { id: 'В процессе', label: 'В работе' },
  { id: 'Завершено', label: 'Завершено' }
];

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [showPendingModal, setShowPendingModal] = useState(false);

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
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Моё обучение</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Персональный трек развития и мониторинг прогресса по учебным дисциплинам.
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedStatus(opt.id)}
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${selectedStatus === opt.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Всего курсов" 
            value={stats.total} 
            icon={BookOpen} 
            colorClass="bg-blue-100 text-blue-600" 
            description="Активные программы" 
            isPrimary={true} 
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
            description={pending.length > 0 ? "Нажмите для просмотра" : "Нет активных заявок"} 
            onClick={pending.length > 0 ? () => setShowPendingModal(true) : null}
          />
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по названию курса..." 
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-blue-500 shadow-sm text-left transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[400px]">
          {error ? (
            <div className="bg-white p-20 rounded-2xl border border-slate-200 text-center shadow-sm">
               <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
               <p className="font-bold text-slate-800">{error}</p>
               <button onClick={fetchCourses} className="mt-4 text-[11px] font-black uppercase text-blue-600 hover:underline tracking-widest">Переподключиться</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredCourses.map((course) => {
                  const progress = course.pivot?.progress || 0;
                  return (
                    <motion.div 
                      layout 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      key={course.id}
                      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1 text-left">
                 
                            <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                          </div>
                          <Link to={`/app/courses/${course.id}`} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <ArrowUpRight size={18} />
                          </Link>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Прогресс обучения</span>
                            <span className={progress === 100 ? 'text-emerald-500' : 'text-slate-900'}>{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-50">
                           <CourseCard course={course} isMyCourse={true} hideProgress={true} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {filteredCourses.length === 0 && !loading && !error && (
            <div className="p-32 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
              <Database size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-lg font-bold text-slate-900">Курсы не найдены</h3>
              <p className="text-sm text-slate-400 mt-1">Попробуйте изменить параметры фильтрации или поиска</p>
              <button onClick={() => {setSelectedStatus('Все'); setSearchQuery('');}} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
                Сбросить поиск
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PENDING MODAL (KPI STYLE) */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh] border border-slate-200"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              
              <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
                <div className="text-left">
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-50 text-amber-600 border border-amber-100">
                    На модерации
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Ожидают подтверждения</h3>
                </div>
                <button onClick={() => setShowPendingModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1 space-y-3">
                {pending.map((course) => (
                  <div key={course.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 text-left shadow-sm group">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{course.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar size={10} /> Статус: Проверка данных
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <button 
                  onClick={() => setShowPendingModal(false)}
                  className="w-full py-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all shadow-md"
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