import React, { useState, useEffect, useCallback } from 'react';
import { 
  Target, Zap, Award, User, BookOpen, 
  Clock, BarChart3, Loader2, ClipboardCheck, 
  ChevronRight, ArrowUpRight, GraduationCap,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../../../api/axios';

// --- УТИЛИТА ДЛЯ ДАТЫ ---
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(dateString));
};

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (SKELETONS) ---
const StatSkeleton = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-3">
        <div className="h-2 w-16 bg-slate-100 rounded" />
        <div className="h-6 w-24 bg-slate-100 rounded" />
      </div>
      <div className="w-10 h-10 bg-slate-50 rounded-lg" />
    </div>
    <div className="h-2 w-32 bg-slate-100 rounded" />
  </div>
);

const CourseSkeleton = () => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-10 h-10 bg-slate-50 rounded-lg" />
      <div className="w-16 h-4 bg-slate-50 rounded" />
    </div>
    <div className="h-3 w-full bg-slate-50 rounded mb-2" />
    <div className="h-3 w-2/3 bg-slate-50 rounded mb-4" />
    <div className="h-1.5 w-full bg-slate-50 rounded-full" />
  </div>
);

// --- ОСНОВНЫЕ КОМПОНЕНТЫ ---
const StatCard = ({ icon: Icon, label, value, colorClass, description, isPrimary, unitText }) => (
  <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md ${isPrimary ? 'ring-1 ring-blue-600/10' : ''}`}>
    <div className={`absolute top-0 left-0 w-1 h-full ${isPrimary ? 'bg-blue-600' : 'bg-slate-200'}`} />
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1 text-left">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value ?? '—'}</h3> 
          {unitText && <span className="text-[10px] font-bold text-slate-400 uppercase">{unitText}</span>}
        </div>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight text-left leading-relaxed">{description}</p>
  </div>
);

const CourseCard = ({ course }) => (
  <Link to={`/app/courses/${course.id}`} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
          <BookOpen size={18} />
        </div>
        <span className="text-[9px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase tracking-wider">
          {course.progress}% пройденo
        </span>
      </div>
      <h4 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2 h-8">
        {course.title}
      </h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{course.instructor || 'Инструктор'}</p>
    </div>
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-slate-900 group-hover:bg-blue-600 transition-all duration-700" style={{ width: `${course.progress}%` }} />
    </div>
  </Link>
);

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/student/dashboard-stats');
      setData(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  return (
    <main className="w-full max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="flex items-center gap-6 text-left">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <User size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                {loading ? "Загрузка..." : data?.user?.name}
            </h1>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold text-left">
              <GraduationCap size={14} className="text-blue-600" />
              <span>{loading ? "Факультет" : data?.user?.faculty}</span>
              <span className="text-slate-300">|</span>
              <span className='text-blue-800'>{loading ? "Студент" : (data?.user?.specialization || 'Студент')}</span>
            </div>
          </div>
        </div>
        <Link to="/courses" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          Каталог курсов <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: STATS */}
        <div className="lg:col-span-1 space-y-6">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-20" />
            </>
          ) : (
            <>
              <StatCard 
                icon={Star} 
                label="Общий прогресс" 
                value={data?.stats?.avg_progress} 
                unitText="%" 
                isPrimary={true} 
                colorClass="bg-blue-50 text-blue-600" 
                description="Средний показатель по всем дисциплинам" 
              />
              <StatCard 
                icon={Zap} 
                label="Пройдено лекций" 
                value={`${data?.stats?.completed_lessons}/${data?.stats?.total_lessons}`} 
                colorClass="bg-amber-50 text-amber-600" 
                description="Завершенные учебные материалы" 
              />
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  <span>Выполнено модулей</span>
                  <span>{Math.round((data?.stats?.completed_lessons / data?.stats?.total_lessons) * 100) || 0}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(data?.stats?.completed_lessons / data?.stats?.total_lessons) * 100}%` }} />
                </div>
              </div>
            </>
          )}
        </div>

     {/* CENTER: CHART */}
<div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
  <div className="flex justify-between items-center mb-8 text-left">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-900 rounded-lg text-white"><BarChart3 size={18} /></div>
      <div>
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight leading-none text-left">Активность за неделю</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-left">Пройденные лекции и тесты</p>
      </div>
    </div>
    <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Лекции</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Тесты</span>
        </div>
    </div>
  </div>
  
  <div className="flex-1 min-h-[220px] w-full">
    {loading ? (
        <div className="w-full h-full bg-slate-50 rounded-lg animate-pulse" />
    ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data?.chart_data || []}>
            <defs>
              <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
            />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}
            />
            {/* Линия Лекций */}
            <Area 
                name="Лекции"
                type="monotone" 
                dataKey="lessons" 
                stroke="#2563eb" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorLessons)" 
            />
            {/* Линия Тестов */}
            <Area 
                name="Тесты"
                type="monotone" 
                dataKey="quizzes" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorQuizzes)" 
            />
          </AreaChart>
        </ResponsiveContainer>
    )}
  </div>
</div>
      </div>

      {/* ACTIVE COURSES GRID */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={18} className="text-slate-900" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight text-left">Мои Дисциплины</h3>
          </div>
          <Link to="/app/my-courses" className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1 hover:underline">
            Все курсы <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {loading ? (
             [1,2,3,4].map(i => <CourseSkeleton key={i} />)
          ) : (
            data?.active_courses?.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight text-left">Последние тесты</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/30 text-[10px] uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-left">Курс / Тест</th>
                  <th className="px-6 py-4 font-bold text-center">Результат</th>
                  <th className="px-6 py-4 font-bold text-right">Статус</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-slate-50">
  {loading ? (
    <tr>
      <td colSpan="3" className="px-6 py-10 text-center">
        <Loader2 className="animate-spin inline text-blue-500" />
      </td>
    </tr>
  ) : data?.recent_tests?.length > 0 ? (
    data.recent_tests.map((test) => (
      <tr key={test.id} className="hover:bg-slate-50/50 transition-colors group">
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              {test.name}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
              {test.course}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded border border-blue-100">
            {test.score}%
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <span
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
              test.score >= 50 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            {test.score >= 50 ? "Сдано" : "Не сдано"}
          </span>
        </td>
      </tr>
    ))
  ) : (
    /* СОСТОЯНИЕ, ЕСЛИ ТЕСТОВ НЕТ */
    <tr>
      <td colSpan="3" className="px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-slate-50 rounded-full text-slate-300">
            <ClipboardCheck size={24} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Вы еще не проходили тесты
          </p>
        </div>
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
          
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
                <div className="h-28 bg-white border border-slate-100 rounded-xl animate-pulse" />
                <div className="h-28 bg-white border border-slate-100 rounded-xl animate-pulse" />
            </>
          ) : (
            <>
                <StatCard icon={Award} label="Сертификаты" value={data?.stats?.certificates_count} colorClass="bg-emerald-50 text-emerald-600" description="Получено за все время" hideUnit />
            </>
          )}
          <button className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
            <BarChart3 size={16} /> Полный отчет
          </button>
        </div>
      </div>
      {/* ТАБЛИЦА ЭКЗАМЕНОВ */}
<div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-8">
  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
    <div className="flex items-center gap-2">
      <Award size={18} className="text-blue-600" />
      <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight text-left">Результаты экзаменов</h3>
    </div>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50/30 text-[10px] uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">
          <th className="px-6 py-4 font-bold text-left">Дисциплина / Экзамен</th>
          <th className="px-6 py-4 font-bold text-center">Верных ответов</th>
          <th className="px-6 py-4 font-bold text-center">Баллы (Процент)</th>
          <th className="px-6 py-4 font-bold text-right">Дата сдачи</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {loading ? (
          <tr><td colSpan="4" className="px-6 py-10 text-center"><Loader2 className="animate-spin inline text-blue-500" /></td></tr>
        ) : data?.exams?.length > 0 ? (
          data.exams.map((exam) => (
            <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800">{exam.course_title}</span>
                  <span className="text-[10px] text-blue-500 font-bold uppercase mt-0.5">{exam.quiz_title}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-xs font-medium text-slate-600">
                  {exam.correct} <span className="text-slate-300">/</span> {exam.total}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-sm font-black ${exam.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {exam.score}%
                  </span>
                  <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${exam.passed ? 'bg-emerald-500' : 'bg-red-500'}`} 
                      style={{ width: `${exam.score}%` }} 
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                  {exam.date}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Экзамены еще не сданы
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
    </main>
  );
};

export default StudentDashboard;