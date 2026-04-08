import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  BookOpen, LayoutDashboard, Zap, ArrowUpRight, 
  ShieldCheck, Clock, Settings, TrendingUp, User,
  Eye, EyeOff, Award, CheckCircle2, Star, Flame,
  FileText, BarChart3, Target, ChevronRight
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Данные для визуализации
  const fakeRecentTests = [
    { id: 1, title: 'Основы PHP & Laravel', score: 92, date: 'Сегодня', color: 'bg-emerald-50 text-emerald-600' },
    { id: 2, title: 'React Hooks & State', score: 78, date: 'Вчера', color: 'bg-indigo-50 text-indigo-600' },
  ];

  const userStats = { points: 1250, streak: 5, rank: 'Top 10%', totalHours: 124 };

  const [passLoading, setPassLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: '', new_password: '', new_password_confirmation: '',
  });

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
    
    const fetchSummary = async () => {
      try {
        const response = await api.get('/my-courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [location.state]);

  const approvedCourses = useMemo(() => courses.filter(c => c.status === 'approved'), [courses]);

  const totalProgress = useMemo(() => {
    if (approvedCourses.length === 0) return 0;
    const total = approvedCourses.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0);
    return Math.round(total / approvedCourses.length);
  }, [approvedCourses]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto p-6 md:p-10 space-y-12 bg-white min-h-screen text-left">
      
      {/* HEADER: В СТИЛЕ СЕРТИФИКАТОВ */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
             <LayoutDashboard size={12} /> Zeynoalla Intelligence
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Панель управления</h1>
          <p className="text-slate-400 font-medium max-w-md">Добро пожаловать обратно! Твой прогресс вырос на 12% за неделю.</p>
        </div>

        {/* ПЕРЕКЛЮЧАТЕЛЬ ТАБОВ КАК ПРЕМИУМ-ЭЛЕМЕНТ */}
        <div className="flex bg-slate-50 p-1.5 rounded-[1.5rem] w-fit border border-slate-100 shadow-inner">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Обзор
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Настройки
          </button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* ЛЕВАЯ КОЛОНКА (ОСНОВНАЯ) */}
          <div className="xl:col-span-8 space-y-12">
            
            {/* GRID STATS: СТИЛЬ СЕРТИФИКАТОВ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <StatCard label="Общий прогресс" value={`${totalProgress}%`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
               <StatCard label="Очки опыта" value={userStats.points} icon={Star} color="text-amber-500" bg="bg-amber-50" />
               <StatCard label="Ударный режим" value={`${userStats.streak} дн.`} icon={Flame} color="text-orange-500" bg="bg-orange-50" />
            </div>

            {/* ГЕРОЙ-КУРС: ГЛАВНЫЙ ФОКУС */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2">Продолжить обучение</h3>
              {approvedCourses.length > 0 ? (
                <MainCourseHero course={approvedCourses[0]} />
              ) : (
                <div className="p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Курсы не найдены</p>
                </div>
              )}
            </section>

            {/* ТЕСТЫ: СПИСОК С ТЕНЯМИ */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-2">Результаты тестов</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fakeRecentTests.map(test => (
                  <div key={test.id} className="bg-white border border-slate-100 p-5 rounded-[2rem] flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${test.color} shadow-sm transition-transform group-hover:scale-110`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">{test.title}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-1">{test.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 tracking-tighter">{test.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ПРАВАЯ КОЛОНКА (САЙДБАР) */}
          <aside className="xl:col-span-4 space-y-10">
            
            {/* КАРТОЧКА ПРОФИЛЯ: ТЕМНАЯ / ПРЕМИУМ */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/30 rounded-full blur-[80px]" />
               <div className="relative z-10 space-y-8">
                 <div className="space-y-2">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black shadow-xl mb-4">
                     ZY
                   </div>
                   <h4 className="text-2xl font-black tracking-tight">Zeynoalla Yelnur</h4>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Fullstack Developer</p>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Уровень 12</span>
                      <span>{userStats.points} / 1500 XP</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[75%] rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                    </div>
                 </div>

                 <Link to="/app/my-courses" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                   Начать обучение <ChevronRight size={14} />
                 </Link>
               </div>
            </div>

            {/* АКТИВНОСТЬ: ГРАФИК */}
            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 space-y-6 shadow-sm">
               <div className="flex justify-between items-center px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Активность</h4>
                  <BarChart3 size={16} className="text-indigo-500" />
               </div>
               <div className="flex items-end justify-between h-32 px-2">
                  {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                    <div key={i} className={`w-3 rounded-full transition-all duration-1000 ${i === 3 ? 'bg-indigo-500 shadow-lg shadow-indigo-100' : 'bg-slate-100 hover:bg-slate-200'}`} style={{ height: `${h}%` }} />
                  ))}
               </div>
               <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase px-1">
                  <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
               </div>
            </div>

          </aside>
        </div>
      ) : (
          <></>
)}
    </div>
  );
};

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (В СТИЛЕ СЕРТИФИКАТОВ) ---

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white border border-slate-100 p-7 rounded-[2.5rem] flex items-center gap-6 group hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500">
    <div className={`w-14 h-14 rounded-[1.5rem] ${bg} ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div className="text-left">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  </div>
);

const MainCourseHero = ({ course }) => (
  <div className="group bg-white border border-slate-100 rounded-[3rem] p-6 md:p-8 flex flex-col lg:flex-row gap-10 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
    <div className="relative w-full lg:w-[320px] aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-slate-100 shrink-0">
      <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
         <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${course.pivot?.progress || 0}%` }} />
         </div>
      </div>
    </div>

    <div className="flex-1 flex flex-col justify-center space-y-6 py-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded">{course.category || 'Professional'}</span>
          <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1"><Clock size={12}/> В процессе</span>
        </div>
        <h4 className="text-3xl font-black text-slate-900 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h4>
      </div>

      <div className="flex items-center gap-8">
        <div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Прогресс</p>
           <p className="text-xl font-black text-slate-800">{course.pivot?.progress || 0}%</p>
        </div>
        <div className="w-px h-10 bg-slate-100" />
        <div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">След. урок</p>
           <p className="text-sm font-bold text-slate-600">Основные Middleware</p>
        </div>
      </div>

      <Link to={`/app/courses/${course.id}`} className="w-fit px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all group/btn">
        Продолжить <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Link>
    </div>
  </div>
);

const SettingsForm = ({ passwords, setPasswords, handlePasswordChange, passLoading, showPasswords, setShowPasswords }) => (
  <div className="max-w-2xl mx-auto py-10 animate-in slide-in-from-bottom-8 duration-500">
    <form onSubmit={handlePasswordChange} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100 space-y-8">
      <div className="flex items-center gap-6 mb-4">
        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
          <ShieldCheck size={32} />
        </div>
        <div className="text-left">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Безопасность</h3>
          <p className="text-xs text-slate-400 font-medium">Обновите ваши учетные данные</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <InputGroup label="Текущий пароль" type={showPasswords ? "text" : "password"} onChange={(val) => setPasswords({...passwords, current_password: val})} />
        <InputGroup label="Новый пароль" type={showPasswords ? "text" : "password"} onChange={(val) => setPasswords({...passwords, new_password: val})} />
        <InputGroup label="Подтверждение" type={showPasswords ? "text" : "password"} onChange={(val) => setPasswords({...passwords, new_password_confirmation: val})} />
        
        <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase hover:text-indigo-500 transition-colors px-1">
          {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />} {showPasswords ? 'Скрыть' : 'Показать'} пароли
        </button>
      </div>

      <button type="submit" disabled={passLoading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50">
        {passLoading ? 'Обработка...' : 'Сохранить новый пароль'}
      </button>
    </form>
  </div>
);

const InputGroup = ({ label, type, onChange }) => (
  <div className="space-y-2 text-left">
    <label className="text-[10px] font-black text-slate-300 uppercase px-2 tracking-widest">{label}</label>
    <input 
      type={type} 
      className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 outline-none transition-all text-sm font-bold" 
      onChange={(e) => onChange(e.target.value)} 
      required
    />
  </div>
);

export default Dashboard;