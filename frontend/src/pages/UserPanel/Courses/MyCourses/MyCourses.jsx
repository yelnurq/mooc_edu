import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, LayoutGrid, FilterX, Clock, 
  Tag, BarChart3, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';

// --- КОНСТАНТЫ И АНИМАЦИИ ---
const STATUS_OPTIONS = ['Все', 'В процессе', 'Завершено'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const StatsWidget = ({ stats }) => (
  <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400 mb-6">Ваша активность</h3>
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">Средний прогресс</span>
        <span className="text-xl font-black">{stats.avgProgress}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${stats.avgProgress}%` }} 
          className="h-full bg-indigo-500" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase">Курсов</p>
          <p className="text-lg font-black">{stats.total}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase">Ударный режим</p>
          <p className="text-lg font-black">7 дн.</p>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-[480px] bg-white rounded-2xl animate-pulse border border-slate-200" />
    ))}
  </div>
);

// --- ОСНОВНОЙ КОМПОНЕНТ ---

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
      setError("Не удалось загрузить курсы. Пожалуйста, попробуйте позже.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Фильтрация данных
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
    const avgProgress = total > 0 
      ? Math.round(approved.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0) / total) 
      : 0;

    return { filteredCourses: filtered, stats: { total, avgProgress }, pending };
  }, [courses, searchQuery, selectedStatus]);

  const handleReset = () => {
    setSelectedStatus('Все');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-[1640px] mx-auto px-6 lg:px-12 py-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 style={{ fontWeight: 500 }} className="text-5xl text-slate-900 tracking-tighter">
              Моё обучение
            </h1>
            <p className="text-slate-500 font-medium max-w-md leading-relaxed border-l-4 border-indigo-600 pl-4">
              Ваш персональный учебный план и история достижений в Zeynoalla Workspace.
            </p>
          </div>
          
          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ПОИСК ПО МОИМ КУРСАМ..." 
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-xl focus:ring-0 focus:border-indigo-600 transition-all font-bold text-xs shadow-sm uppercase tracking-wider outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="flex flex-col xl:flex-row gap-12">
          
          {/* SIDEBAR */}
          <aside className="w-full xl:w-80 shrink-0 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center gap-2 mb-8">
                <LayoutGrid size={16} className="text-indigo-600" />
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Фильтрация</h3>
              </div>

              <nav className="space-y-1">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`text-left w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[13px] font-medium transition-all ${
                      selectedStatus === status 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <Tag size={14} className={selectedStatus === status ? 'text-indigo-200' : 'text-slate-300'} />
                    {status}
                  </button>
                ))}
              </nav>

              <div className="mt-10">
                <StatsWidget stats={stats} />
              </div>

              {pending.length > 0 && (
                <div className="mt-8 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} className="text-amber-600" />
                    <h4 className="text-[10px] font-black uppercase text-amber-900 tracking-widest">На проверке ({pending.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {pending.map(c => (
                      <div key={c.id} className="text-[11px] font-bold text-amber-700 bg-white/60 p-3 rounded-lg border border-amber-100/50 truncate">
                        {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm mb-10 w-fit">
              <div className={`w-3 h-3 rounded-sm ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-tight">
                {filteredCourses.length} программ доступно
              </span>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center py-20 bg-rose-50 rounded-3xl border border-rose-100 text-rose-600">
                <AlertCircle size={40} className="mb-4" />
                <p className="font-bold">{error}</p>
                <button onClick={fetchCourses} className="mt-4 text-xs font-black uppercase underline tracking-widest">Попробовать снова</button>
              </div>
            ) : loading ? (
              <SkeletonGrid />
            ) : (
              <>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode='popLayout'>
                    {filteredCourses.map((course) => (
                      <motion.div
                        layout
                        variants={itemVariants}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={course.id}
                      >
                        <CourseCard course={course} isMyCourse={true} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {filteredCourses.length === 0 && (
                  <div className="py-24 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm px-10 max-w-2xl mx-auto">
                    <FilterX size={48} className="mx-auto mb-8 text-slate-200" />
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Ничего не нашли</h3>
                    <p className="text-slate-400 mt-4 font-medium mx-auto">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
                    <button 
                      onClick={handleReset} 
                      className="mt-10 bg-indigo-600 text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      Сбросить всё
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;