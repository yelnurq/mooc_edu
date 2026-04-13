import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, Clock, AlertCircle, BookOpen, CheckCircle2,
  TrendingUp, Database, X, GraduationCap,  Layers, PlayCircle,
  ArrowUpRight, Award, PlusCircle, PieChart, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { Link } from 'react-router-dom';


const ProgressCircle = ({ progress }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
        <motion.circle
          cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="text-blue-600"
        />
      </svg>
      <span className="absolute text-[9px] font-black text-slate-900">{progress}%</span>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, colorClass, description, onClick, isPrimary }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className={`w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all text-left group 
      ${onClick ? 'hover:border-blue-400 hover:shadow-md cursor-pointer' : ''} 
      ${isPrimary ? 'ring-1 ring-blue-600/10' : ''}`}
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

const MyCourseCard = ({ course }) => {
  const progress = course.pivot?.progress || 0;
  const isCompleted = progress === 100;

  const examResult = useMemo(() => {
    if (course.pivot?.exam_score !== undefined && course.pivot?.exam_score !== null) {
      return { score: course.pivot.exam_score };
    }
    if (course.quiz && course.quiz_results) {
      return course.quiz_results.find(res => Number(res.quiz_id) === Number(course.quiz.id));
    }
    return null;
  }, [course]);

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm ${
        isCompleted ? 'border-emerald-200 hover:shadow-emerald-100' : 'border-slate-200 hover:border-blue-400 hover:shadow-lg'
      }`}
    >
      {/* ИЗОБРАЖЕНИЕ КУРСА */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        {course.image ? (
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <BookOpen className="text-slate-300" size={32} />
          </div>
        )}
        
        {/* Оверлей для статуса поверх картинки */}
        <div className="absolute top-3 left-3 flex gap-2">
            {isCompleted && examResult && (
                <span className="text-[9px] font-black px-2 py-1 rounded bg-slate-900/80 backdrop-blur-md text-white uppercase tracking-wider border border-white/10 shadow-xl">
                  Балл: {examResult.score}%
                </span>
            )}
            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-xl ${
                isCompleted ? 'bg-emerald-500/80 text-white' : 'bg-blue-600/80 text-white'
            }`}>
                {isCompleted ? 'Завершен' : 'В работе'}
            </span>
        </div>
      </div>

      <div className="p-6 text-left">
        <div className="space-y-1 mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 h-10">
            {course.title}
          </h3>
          
          <div className="flex items-center gap-1.5">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               {course.author_display_name || 'Инструктор'}
             </p>
             <span className="text-slate-300 text-[10px]">•</span>
             <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest">
               {course.category || 'Общая'}
             </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 pt-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Layers size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-tight">
              {course.modules_count || 0} мод.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <PlayCircle size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-tight">
              {course.lessons_count || 0} лекц.
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.1em]">
            <span className={isCompleted ? 'text-emerald-600' : 'text-slate-400'}>
              {isCompleted ? 'Материал освоен' : 'Ваш прогресс'}
            </span>
            <span className="text-slate-900">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
            />
          </div>
        </div>
      </div>

      <Link 
        to={`/app/courses/${course.id}`}
        className={`w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all border-t ${
          isCompleted 
            ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100 hover:bg-emerald-50' 
            : 'bg-slate-50/50 text-slate-600 border-slate-100 hover:bg-blue-600 hover:text-white'
        }`}
      >
        {isCompleted ? 'Повторить материал' : 'Продолжить обучение'}
      </Link>
    </motion.div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [showPendingModal, setShowPendingModal] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/my-courses');
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Sync Error:", err);
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

  const STATUS_OPTIONS = [
    { id: 'Все', label: 'Весь план' },
    { id: 'В процессе', label: 'В работе' },
    { id: 'Завершено', label: 'Завершено' }
  ];

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
      <div className="text-left">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight ">Моё обучение</h1>
        <p className="text-[13px] text-slate-500 font-medium mt-1">
          Отслеживайте прогресс по дисциплинам, контролируйте результаты экзаменов <br/> и завершайте учебные модули в едином пространстве.
        </p>
      </div>

        <div className="flex items-center gap-4">
          <Link to="/courses" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <PlusCircle size={14} /> Каталог
          </Link>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedStatus(opt.id)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  selectedStatus === opt.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-6 text-left">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="ПОИСК ПО НАЗВАНИЮ..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold uppercase outline-none focus:border-blue-500 shadow-sm transition-all placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Прогресс</p>
                  <p className="text-xl font-black text-slate-900 tracking-tight">Общий итог</p>
               </div>
               <ProgressCircle progress={stats.avgProgress} />
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                  <span>Завершено</span>
                  <span className="text-emerald-600">{stats.completed} / {stats.total}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} 
                  />
               </div>
            </div>
          </div>

          <StatCard 
            label="На проверке" 
            value={pending.length} 
            icon={Clock} 
            colorClass="bg-amber-50 text-amber-600" 
            description="Заявки на модерации" 
            onClick={pending.length > 0 ? () => setShowPendingModal(true) : null}
          />
        </div>

        {/* MAIN GRID */}
        <div className="lg:col-span-3 text-left">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredCourses.map((course) => (
                  <MyCourseCard key={course.id} course={course} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                 <PieChart size={32} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">Пусто</h3>
              <p className="text-[11px] font-medium text-slate-400 max-w-[240px] leading-relaxed mb-8 uppercase">
                Ни одного курса не найдено. Попробуйте изменить фильтры или загляните в каталог.
              </p>
              <Link to="/app/courses" className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all shadow-lg">
                В каталог
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <div className="p-8 flex justify-between items-center border-b border-slate-50 text-left">
                <div>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 rounded uppercase tracking-widest">Статус</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Ожидают подтверждения</h3>
                </div>
                <button onClick={() => setShowPendingModal(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto bg-slate-50/30 text-left">
                {pending.map(c => (
                  <div key={c.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={18} /></div>
                    <p className="text-sm font-bold text-slate-800">{c.title}</p>
                  </div>
                ))}
              </div>
              <div className="p-6">
                <button onClick={() => setShowPendingModal(false)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all">Понятно</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
{!loading && (
      <div className="text-left mt-16 pt-8 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-wide max-w-4xl">
          Ваш текущий план развития выполнен на <span className="text-slate-900 font-bold">{stats.avgProgress}%</span>. 
          Это отличный темп — продолжайте активное изучение материалов для скорейшего достижения целевых показателей и подтверждения квалификации.
        </p>
      </div>
    )}
    </main>
  );
};

export default MyCourses;