import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Clock, Award, ChevronRight, 
  FileText, ArrowUpRight, Zap, Star, 
  Layout, Trophy, Target, AlertCircle, User
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../../api/axios';

// --- Вспомогательный компонент для карточек статистики ---
const MiniStat = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-blue-600 transition-colors" />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
  </div>
);

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
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
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Синхронизация...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-10">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
          <h3 className="text-lg font-black text-slate-900 uppercase">{error}</h3>
          <button onClick={fetchDashboardData} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  const completedLectures = data.stats.completed_lessons || 0;
  const totalLectures = data.stats.total_lessons || 0;
  const remainingLectures = Math.max(0, totalLectures - completedLectures);
  
  const lecturePieData = [
    { name: 'Пройдено', value: completedLectures, color: '#2563eb' },
    { name: 'Осталось', value: remainingLectures, color: '#f1f5f9' },
  ];

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      
      {/* NEW HEADER (KPI STYLE) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="flex items-center gap-6 text-left">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <User size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.user.name}</h1>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-left">
              <Layout size={14} className="text-blue-600" />
              <span>{data.user.faculty}</span>
              <span className="text-slate-300">|</span>
              <span className='text-blue-800'>{data.user.specialization || 'Студент'}</span>
            </div>
          </div>
        </div>
        <Link to="/courses" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          Каталог курсов <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* STAT BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
        <MiniStat icon={Zap} label="Курсы (Окончено)" value={`${data.stats.completed} / ${data.stats.total}`} trend="Live" color="bg-blue-600" />
        <MiniStat icon={Star} label="Средний балл" value={data.stats.avg_progress} trend="B+" color="bg-amber-500" />
        <MiniStat icon={Clock} label="Часов в системе" value={data.stats.hours || '0'} trend="Total" color="bg-purple-600" />
        <MiniStat icon={Award} label="Сертификатов" value={data.stats.certificates_count || '0'} trend="Verified" color="bg-emerald-600" />
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
                <div key={test.id} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-blue-400 transition-all shadow-sm group">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter truncate max-w-[100px]">{test.course}</span>
                      <ChevronRight size={8} className="text-slate-300" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">{test.module}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-tight mb-4 line-clamp-2">{test.name}</p>
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
                <div className="col-span-3 p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-[10px] font-bold text-slate-400 uppercase">
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
                <Link 
                  to={`/app/courses/${course.id}`} 
                  key={course.id} 
                  className="block bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-4 items-center w-full md:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm tracking-tight">{course.title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{course.instructor || 'В процессе обучения'}</p>
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">{course.progress || 0}%</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Прогресс</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                          style={{ width: `${course.progress || 0}%` }} 
                        />
                      </div>
                    </div>
                    <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} className="text-blue-600" />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="p-10 bg-white rounded-xl border border-dashed border-slate-200 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Нет активных курсов</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-left sticky top-10">
            <div className="mb-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Прогресс лекций</h4>
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lecturePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {lecturePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0}%
                   </span>
                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Пройдено</span>
                </div>
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Общий прогресс</h4>
                <div className="flex items-end gap-3 mb-4">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{data.stats.avg_progress}%</span>
                    <span className="text-xs font-bold text-emerald-600 pb-2 flex items-center gap-1">
                        <ArrowUpRight size={14} /> Live
                    </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000" 
                        style={{ width: `${data.stats.avg_progress}%` }} 
                    />
                </div>
                <p className="text-[11px] font-bold text-slate-400 leading-tight uppercase tracking-tighter">
                  Общее количество модулей: <span className="text-slate-900 font-black">{data.stats.total_modules}</span>
                </p>
            </div>
            
            <button className="w-full py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95">
              <FileText size={16} /> Выгрузить транскрипт
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentDashboard;