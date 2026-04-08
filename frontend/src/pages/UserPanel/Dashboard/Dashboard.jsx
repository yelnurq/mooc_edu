import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  BookOpen, LayoutDashboard, Zap, ArrowUpRight, 
  ShieldCheck, Clock, Settings, TrendingUp, User,
  Eye, EyeOff
} from 'lucide-react';
import api from '../../../api/axios';

const Dashboard = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [passLoading, setPassLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: '', new_password: '', new_password_confirmation: '',
  });

  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  useEffect(() => {
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
  }, []);

  const approvedCourses = useMemo(() => courses.filter(c => c.status === 'approved'), [courses]);
  const pendingCourses = useMemo(() => courses.filter(c => c.status === 'pending'), [courses]);

  const totalProgress = useMemo(() => {
    if (approvedCourses.length === 0) return 0;
    const total = approvedCourses.reduce((acc, c) => acc + (c.pivot?.progress || 0), 0);
    return Math.round(total / approvedCourses.length);
  }, [approvedCourses]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password_confirmation) return alert("Пароли не совпадают!");
    setPassLoading(true);
    try {
      await api.post('/user/change-password', passwords);
      alert('Пароль успешно обновлен');
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) { alert('Ошибка при обновлении пароля.'); } 
    finally { setPassLoading(false); }
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Загрузка дашборда...</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500 text-left">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {activeTab === 'settings' ? 'Настройки безопасности' : 'Личный кабинет'}
          </h2>
          <p className="text-slate-500 text-sm">Ваш прогресс и личные данные</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('overview')} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Обзор</button>
          <button onClick={() => setActiveTab('settings')} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Настройки</button>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <SettingsForm passwords={passwords} setPasswords={setPasswords} handlePasswordChange={handlePasswordChange} passLoading={passLoading} showPasswords={showPasswords} setShowPasswords={setShowPasswords} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <StatCard title="Прогресс" value={`${totalProgress}%`} icon={<TrendingUp size={18}/>} color="text-indigo-600" />
               <StatCard title="Мои курсы" value={approvedCourses.length} icon={<BookOpen size={18}/>} color="text-emerald-600" />
               <StatCard title="Заявки" value={pendingCourses.length} icon={<Clock size={18}/>} color="text-amber-600" />
            </div>

            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Продолжить обучение</h3>
              {approvedCourses.length > 0 ? (
                <ActiveCourseHero course={approvedCourses[0]} />
              ) : (
                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                   <p className="text-slate-400 text-sm">У вас пока нет активных курсов</p>
                   <Link to="/app/catalog" className="text-indigo-600 font-bold text-xs uppercase mt-2 inline-block">Перейти в каталог</Link>
                </div>
              )}
            </section>
          </div>

          <aside className="xl:col-span-4 space-y-6">
            <div className="bg-indigo-900 rounded-2xl p-6 text-white">
               <h4 className="font-bold mb-2 flex items-center gap-2"><Zap size={18}/> Статус</h4>
               <p className="text-indigo-200 text-sm mb-4">Вы молодец! Ваш прогресс стабилен.</p>
               <Link to="/app/my-courses" className="block text-center py-3 bg-white text-indigo-900 rounded-xl text-sm font-bold">Моя библиотека</Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

// Вспомогательные компоненты для Dashboard
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
    <div className="flex items-center justify-between mb-2">
      <span className={`p-2 rounded-lg bg-slate-50 ${color}`}>{icon}</span>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
  </div>
);

const ActiveCourseHero = ({ course }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row gap-6 text-left">
    <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-slate-100 shrink-0">
      <img src={course.image} className="w-full h-full object-cover" alt="" />
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h4 className="text-lg font-bold text-slate-800">{course.title}</h4>
        <p className="text-xs text-slate-400 mt-1">{course.category}</p>
      </div>
      <Link to={`/app/courses/${course.id}`} className="mt-4 w-fit bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all">
        Продолжить <ArrowUpRight size={16} />
      </Link>
    </div>
  </div>
);

const SettingsForm = ({ passwords, setPasswords, handlePasswordChange, passLoading, showPasswords, setShowPasswords }) => (
  <div className="max-w-xl mx-auto py-8">
    <form onSubmit={handlePasswordChange} className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 text-left">
      <h3 className="font-bold text-slate-800 mb-4">Смена пароля</h3>
      <div className="space-y-4">
        <input type={showPasswords ? "text" : "password"} placeholder="Текущий пароль" className="w-full p-3 border rounded-xl" onChange={(e) => setPasswords({...passwords, current_password: e.target.value})} required/>
        <input type={showPasswords ? "text" : "password"} placeholder="Новый пароль" className="w-full p-3 border rounded-xl" onChange={(e) => setPasswords({...passwords, new_password: e.target.value})} required/>
        <input type={showPasswords ? "text" : "password"} placeholder="Повторите пароль" className="w-full p-3 border rounded-xl" onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})} required/>
        <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-xs text-slate-400 font-bold uppercase">{showPasswords ? 'Скрыть' : 'Показать'} пароли</button>
      </div>
      <button type="submit" disabled={passLoading} className="w-full py-4 bg-indigo-900 text-white rounded-xl font-bold mt-4">
        {passLoading ? 'Сохранение...' : 'Обновить пароль'}
      </button>
    </form>
  </div>
);

export default Dashboard;