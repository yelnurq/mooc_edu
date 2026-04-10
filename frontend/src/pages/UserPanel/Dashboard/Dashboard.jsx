import React, { useEffect, useState, useCallback } from 'react';
import { 
  BookOpen, Clock, Award, ChevronRight, 
  FileText, ArrowUpRight, Zap, Star, 
  Layout, Trophy, Target, ExternalLink, AlertCircle
} from 'lucide-react';
import api from '../../../api/axios';

// --- Вспомогательный компонент для карточек статистики ---
const MiniStat = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
  </div>
);

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция загрузки данных с бэкенда
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Маршрут должен соответствовать вашему API
      const response = await api.get('/student/dashboard-stats');
      setData(response.data);
    } catch (err) {
      setError("Не удалось загрузить данные дашборда");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Синхронизация профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-10">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
          <h3 className="text-lg font-black text-slate-900 uppercase">{error}</h3>
          <button onClick={fetchDashboardData} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen font-sans">
      
{/* HEADER */}
<div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
  <div className="text-left">
    <div className="flex items-center gap-3 mb-2">
 
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Дашборд обучения</h1>
    </div>
    {/* Добавляем информацию о факультете и кафедре сюда */}
    <div className="flex flex-col gap-1">
        <p className="text-sm text-slate-500 font-medium tracking-tight flex items-center gap-2">
            <Layout size={14} className="text-blue-600" /> {data.user.faculty}
        </p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide ml-5">
            Кафедра: {data.user.department}
        </p>
    </div>
  </div>
  
  <div className="flex items-center gap-4 bg-slate-900 p-2 pr-6 rounded-2xl shadow-xl shadow-slate-200">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl border border-white/10 uppercase">
      {data.user.name.substring(0, 2)}
    </div>
    <div className="text-left text-white">
      <p className="text-[10px] font-black text-blue-400 leading-none uppercase tracking-widest">{data.user.name}</p>
      <p className="text-xs font-bold mt-1 opacity-80">{data.user.specialization || 'Студент'}</p>
    </div>
  </div>
</div>

      {/* STAT BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
        <MiniStat 
          icon={Zap} 
          label="Курсы (Окончено)" 
          value={`${data.stats.completed} / ${data.stats.total}`} 
          trend="Live Progress" 
          color="bg-blue-600" 
        />
        <MiniStat 
          icon={Star} 
          label="Средний балл" 
          value={data.stats.avg_progress} 
          trend="B+" 
          color="bg-amber-500" 
        />
        <MiniStat 
          icon={Clock} 
          label="Часов в системе" 
          value={data.stats.hours || '0'} 
          trend="Total" 
          color="bg-purple-600" 
        />
        <MiniStat 
          icon={Award} 
          label="Сертификатов" 
          value={data.stats.certificates_count || '0'} 
          trend="Verified" 
          color="bg-emerald-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          
        {/* СЕКЦИЯ: ПОСЛЕДНИЕ ТЕСТЫ */}
<section className="text-left">
  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
    <Target size={14} className="text-blue-600" /> Результаты последних тестов
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {data.recent_tests.length > 0 ? data.recent_tests.map((test) => (
      <div key={test.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-all shadow-sm group">
        <div>
          {/* Название курса и модуля */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter truncate max-w-[100px]">
              {test.course}
            </span>
            <ChevronRight size={8} className="text-slate-300" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">
              {test.module}
            </span>
          </div>
          
          <p className="text-xs font-black text-slate-800 leading-tight mb-4 line-clamp-2">
            {test.name}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mb-0.5">{test.date}</p>
            <p className={`text-xl font-black tracking-tighter ${test.color}`}>{test.score}%</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    )) : (
      <div className="col-span-3 p-8 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 text-center text-[10px] font-bold text-slate-400 uppercase">
        Тесты еще не пройдены
      </div>
    )}
  </div>
</section>

         {/* СЕКЦИЯ: АКТИВНЫЕ КУРСЫ */}
<section className="text-left">
  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
    <Zap size={14} className="text-blue-600" /> Список активных курсов
  </h2>
  <div className="space-y-4">
    {data.active_courses.length > 0 ? data.active_courses.map((course) => (
      <div key={course.id} className="bg-white p-6 rounded-[24px] border border-slate-200 hover:shadow-lg transition-all group flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">{course.title}</h3>
            {/* Добавил имя автора, раз оно есть в данных */}
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{course.instructor || 'В процессе обучения'}</p>
          </div>
        </div>
        <div className="w-full md:w-48">
          <div className="flex justify-between items-center mb-1.5">
            {/* ИСПРАВЛЕНО: course.progress вместо course.pivot?.progress */}
            <span className="text-[10px] font-black text-slate-900">{course.progress || 0}%</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Прогресс</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
              // ИСПРАВЛЕНО: course.progress
              style={{ width: `${course.progress || 0}%` }} 
            />
          </div>
        </div>
      </div>
    )) : (
      <div className="p-10 bg-white rounded-[24px] border border-dashed border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase">Нет активных курсов</p>
      </div>
    )}
  </div>
</section>
        </div>

 {/* SIDEBAR ANALYTICS */}
<div className="lg:col-span-4 space-y-6">
  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-left sticky top-10">
    <div className="mb-8 pb-8 border-b border-slate-50">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Общий прогресс</h4>
        <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">{data.stats.avg_progress}%</span>
            <span className="text-xs font-bold text-emerald-600 pb-2 flex items-center gap-1">
                <ArrowUpRight size={14} /> Live
            </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(37,99,235,0.2)] transition-all duration-1000" 
                style={{ width: `${data.stats.avg_progress}%` }} 
            />
        </div>
        <p className="text-[11px] font-bold text-slate-400 leading-tight uppercase tracking-tighter">
            Ты завершил {data.stats.completed_modules} из {data.stats.total_modules} модулей во всех курсах.
        </p>
    </div>

    {/* СТАТИСТИКА ПО КУРСАМ И МОДУЛЯМ */}
    <div className="space-y-4 mb-10 text-[10px] font-black uppercase tracking-widest">
        {/* КУРСЫ */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between mb-1">
                <span className="text-slate-500">Курсы</span>
                <span className="text-slate-900">{data.stats.completed} / {data.stats.total}</span>
            </div>
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-slate-400" 
                    style={{ width: `${(data.stats.completed / data.stats.total) * 100}%` }}
                />
            </div>
        </div>
<div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Пройдено лекций</span>
          </div>
          <span className="text-xs font-black text-emerald-900">{data.stats.completed_lessons} / {data.stats.total_lessons}</span>
        </div>
        <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
            style={{ width: `${data.stats.total_lessons > 0 ? (data.stats.completed_lessons / data.stats.total_lessons) * 100 : 0}%` }}
          />
        </div>
      </div>
      {/* КАРТОЧКА ТЕСТОВ (ДОБАВИТЬ СЮДА) */}
      <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-[9px] font-black text-purple-600 uppercase tracking-tighter">Выполнено тестов</span>
          </div>
          <span className="text-xs font-black text-purple-900">
            {data.stats.completed_quizzes} / {data.stats.total_quizzes}
          </span>
        </div>
        <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-600 rounded-full transition-all duration-700" 
            style={{ width: `${data.stats.total_quizzes > 0 ? (data.stats.completed_quizzes / data.stats.total_quizzes) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>

    <button className="w-full py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95">
      <FileText size={16} /> Выгрузить транскрипт
    </button>
  </div>
</div>
      </div>
    </main>
  );
};

export default StudentDashboard;