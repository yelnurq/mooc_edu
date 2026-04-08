import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  BookOpen, ChevronRight, LayoutDashboard, 
  Zap, Star, ArrowUpRight, Lock, Eye, EyeOff, 
  ShieldCheck, Search, Clock, Settings, Flame,
  TrendingUp, GraduationCap, User
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [passLoading, setPassLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/my-courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const approvedCourses = useMemo(() => 
    courses.filter(c => c.status === 'approved'), [courses]
  );

  const pendingCourses = useMemo(() => 
    courses.filter(c => c.status === 'pending'), [courses]
  );

  const filteredCourses = useMemo(() => {
    return approvedCourses.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [approvedCourses, searchQuery]);

  const totalProgress = useMemo(() => {
    if (approvedCourses.length === 0) return 0;
    const total = approvedCourses.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0);
    return Math.round(total / approvedCourses.length);
  }, [approvedCourses]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password_confirmation) {
        alert("Пароли не совпадают!");
        return;
    }
    setPassLoading(true);
    try {
      await api.post('/user/change-password', passwords);
      alert('Пароль успешно обновлен');
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      alert('Ошибка при обновлении пароля.');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {activeTab === 'settings' ? 'Настройки безопасности' : 'Личный кабинет студента'}
          </h2>
          <p className="text-slate-500 text-sm">Управляйте своим обучением и личными данными</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            label="Обзор" 
          />
          <TabButton 
            active={activeTab === 'courses'} 
            onClick={() => setActiveTab('courses')} 
            label="Мои курсы" 
          />
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            label="Настройки" 
          />
        </div>
      </div>

      {activeTab === 'settings' ? (
        <SettingsSection 
          passwords={passwords} 
          setPasswords={setPasswords} 
          handlePasswordChange={handlePasswordChange}
          passLoading={passLoading}
          showPasswords={showPasswords}
          setShowPasswords={setShowPasswords}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT CONTENT */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <StatCard title="Общий прогресс" value={`${totalProgress}%`} icon={<TrendingUp size={18} />} color="text-indigo-600" />
               <StatCard title="В процессе" value={approvedCourses.length} icon={<BookOpen size={18} />} color="text-emerald-600" />
               <StatCard title="Ожидают" value={pendingCourses.length} icon={<Clock size={18} />} color="text-amber-600" />
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-8">
                <section>
                  <SectionHeader title="Продолжить обучение" />
                  <div className="mt-4">
                    {approvedCourses.length > 0 ? (
                      <ActiveCourseHero course={approvedCourses[0]} />
                    ) : (
                      <EmptyState />
                    )}
                  </div>
                </section>

                {pendingCourses.length > 0 && (
                  <section>
                    <SectionHeader title="Заявки на рассмотрении" />
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingCourses.map(course => <PendingCard key={course.id} course={course} />)}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <SectionHeader title="Все мои курсы" />
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Поиск курсов..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 ring-indigo-500/20 outline-none w-64 transition-all"
                      />
                   </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                   {filteredCourses.length > 0 ? (
                     filteredCourses.map(course => <CourseRowItem key={course.id} course={course} />)
                   ) : (
                     <div className="p-12 text-center text-slate-400 text-sm">Курсы не найдены</div>
                   )}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="xl:col-span-4 space-y-6">
            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-800 rounded-lg">
                    <User size={20} className="text-indigo-200" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Статус студента</h4>
                    <p className="text-indigo-300 text-xs uppercase tracking-wider">Академический профиль</p>
                  </div>
               </div>
               <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                 Ваша академическая активность за последнюю неделю выросла на 12%. Продолжайте в том же темпе!
               </p>
               <button className="w-full py-3 bg-white text-indigo-900 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
                  Открыть журнал
               </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
               <h4 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                 <Clock size={16} className="text-slate-400" /> Последняя активность
               </h4>
               <div className="space-y-5">
                 {approvedCourses.slice(0, 3).map(c => (
                   <div key={c.id} className="flex items-start gap-3">
                     <div className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                     <div>
                       <p className="text-sm font-semibold text-slate-700 line-clamp-1">{c.title}</p>
                       <p className="text-xs text-slate-400 mt-0.5">Прогресс: {c.pivot?.progress}%</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

/* --- REUSABLE COMPONENTS --- */

const TabButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2 text-sm font-medium transition-all rounded-lg ${
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className={`p-2 rounded-lg bg-slate-50 ${color}`}>{icon}</span>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
  </div>
);

const SectionHeader = ({ title }) => (
  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
    {title}
    <div className="h-px bg-slate-200 flex-1 ml-2" />
  </h3>
);

const ActiveCourseHero = ({ course }) => (
  <div className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-slate-100 shrink-0">
        <img src={course.image} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{course.category || 'Курс'}</span>
          <h4 className="text-xl font-bold text-slate-800 mt-1">{course.title}</h4>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <Link to={`/app/courses/${course.id}`} className="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2">
            Продолжить <ArrowUpRight size={16} />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Пройдено</span>
            <span className="text-sm font-bold text-slate-700">{course.pivot?.progress || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CourseRowItem = ({ course }) => (
  <Link to={`/app/courses/${course.id}`} className="flex items-center gap-4 py-4 px-6 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
      <img src={course.image} className="w-full h-full object-cover" alt="" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-slate-800 text-sm truncate">{course.title}</h4>
      <p className="text-[10px] text-slate-400 font-medium">{course.category}</p>
    </div>
    <div className="hidden sm:block w-32 shrink-0">
       <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-500">{course.pivot?.progress || 0}%</span>
       </div>
       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${course.pivot?.progress || 0}%` }} />
       </div>
    </div>
    <ChevronRight size={18} className="text-slate-300" />
  </Link>
);

const PendingCard = ({ course }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="w-12 h-12 rounded-lg overflow-hidden grayscale opacity-50 bg-slate-200 shrink-0">
          <img src={course.image} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-700 text-xs truncate uppercase tracking-tight">{course.title}</h4>
          <div className="flex items-center gap-1.5 mt-1">
              <Clock size={12} className="text-amber-500" />
              <span className="text-[9px] font-bold uppercase text-amber-600 tracking-wider">Ожидает проверки</span>
          </div>
      </div>
      <Lock size={14} className="text-slate-300 shrink-0" />
  </div>
);

const SettingsSection = ({ passwords, setPasswords, handlePasswordChange, passLoading, showPasswords, setShowPasswords }) => (
  <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" size={24} />
          <div>
            <h3 className="font-bold text-slate-800">Безопасность аккаунта</h3>
            <p className="text-xs text-slate-500">Смените пароль для обеспечения безопасности вашего профиля</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handlePasswordChange} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 ml-1">Текущий пароль</label>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"}
                value={passwords.current_password}
                onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all" 
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Новый пароль</label>
              <input 
                type={showPasswords ? "text" : "password"}
                value={passwords.new_password}
                onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all" 
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Подтверждение</label>
              <input 
                type={showPasswords ? "text" : "password"}
                value={passwords.new_password_confirmation}
                onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all" 
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={passLoading}
            className="w-full mt-4 bg-indigo-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-800 transition-all disabled:opacity-50"
          >
            {passLoading ? 'Обновление...' : 'Обновить пароль'}
          </button>
      </form>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
       <LayoutDashboard size={20} className="text-slate-300" />
    </div>
    <h3 className="font-bold text-slate-800">Учебный план пуст</h3>
    <p className="text-slate-500 mt-1 text-sm max-w-xs mx-auto">Здесь появятся ваши курсы, когда вы начнете обучение.</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="max-w-[1400px] mx-auto space-y-8 p-8 animate-pulse">
     <div className="h-12 w-full bg-slate-100 rounded-xl" />
     <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
     </div>
     <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 h-96 bg-slate-100 rounded-2xl" />
        <div className="col-span-4 h-96 bg-slate-100 rounded-2xl" />
     </div>
  </div>
);

export default Dashboard;