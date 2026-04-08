import React, { useState, useEffect } from 'react';
import { 
  Link, 
  useLocation, 
  Outlet, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  GraduationCap,
  Menu,
  X, Search, MessageCircle, Award, HelpCircle,
  User,
  Bell,
  Sparkles,
  BookOpen
} from 'lucide-react';

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [lastCourseId, setLastCourseId] = useState(null);
  const location = useLocation(); 
  const navigate = useNavigate();

  // 1. Загрузка данных пользователя и последнего курса
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(savedUser));
    
    const savedLastCourse = localStorage.getItem('last_course_id');
    if (savedLastCourse) setLastCourseId(savedLastCourse);
  }, [navigate]);

  // 2. Трекинг последнего посещенного курса
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length === 4 && pathParts[2] === 'courses') {
      const courseId = pathParts[3];
      if (courseId && courseId !== 'dashboard') {
        localStorage.setItem('last_course_id', courseId);
        setLastCourseId(courseId);
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Определяем активную вкладку для логики Dashboard
  const isSettingsActive = location.state?.activeTab === 'settings';


const menuItems = [
  { 
    id: 'dashboard', 
    path: '/app/dashboard', 
    state: { activeTab: 'overview' },
    icon: <LayoutDashboard size={20} />, 
    label: 'Главная',
    activeCondition: location.pathname === '/app/dashboard' && !isSettingsActive
  },
  { 
    id: 'courses', 
    path: '/app/my-courses', 
    icon: <BookOpen size={20} />, 
    label: 'Мои курсы',
    activeCondition: location.pathname.includes('/app/my-courses')
  },
  { 
    id: 'catalog', 
    path: '/app/catalog', 
    icon: <Search size={20} />, 
    label: 'Каталог',
    activeCondition: location.pathname === '/app/catalog'
  },
  { 
    id: 'messages', 
    path: '/app/messages', 
    icon: <MessageCircle size={20} />, 
    label: 'Чат с куратором',
    activeCondition: location.pathname === '/app/messages'
  },
  { 
    id: 'certificates', 
    path: '/app/certificates', 
    icon: <Award size={20} />, 
    label: 'Сертификаты',
    activeCondition: location.pathname === '/app/certificates'
  },
  { 
    id: 'support', 
    path: '/app/support', 
    icon: <HelpCircle size={20} />, 
    label: 'Помощь',
    activeCondition: location.pathname === '/app/support'
  },
  { 
    id: 'settings', 
    path: '/app/dashboard', 
    state: { activeTab: 'settings' },
    icon: <Settings size={20} />, 
    label: 'Настройки',
    activeCondition: isSettingsActive
  },
];
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-900">
      
      {/* SIDEBAR (Тёмная тема как в Admin) */}
      <aside className={`
        ${isSidebarOpen ? 'w-72' : 'w-20'} 
        bg-slate-900 border-r border-white/5 flex flex-col fixed h-full transition-all duration-300 z-50 shadow-2xl
      `}>
        {/* LOGO SECTION */}
        <div className={`flex items-center border-white/5 bg-slate-950/50 h-20 transition-all duration-300 ${isSidebarOpen ? 'px-6 gap-3' : 'px-0 justify-center'}`}>
          <div className="w-10 h-10 shrink-0">
            <img src="/images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          {isSidebarOpen && (
            <span className="font-black text-xl tracking-tighter text-white uppercase">
              KAZ<span className="text-blue-400">UTB</span><span className='italic text-[13px] lowercase ml-1'>edu</span>
            </span>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.id} 
              to={item.path} 
              state={item.state}
              className={`w-full flex items-center rounded-2xl transition-all duration-300 ${isSidebarOpen ? 'px-4 py-3.5 gap-4' : 'justify-center py-3.5'} 
                ${item.activeCondition ? 
                  'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 
                  'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className={`${item.activeCondition ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                {item.icon}
              </span>
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            </Link>
          ))}

          {/* Специальная кнопка "Последний курс" */}
          {lastCourseId && (
            <div className={`pt-4 ${!isSidebarOpen && 'hidden'}`}>
                <p className="px-4 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Продолжить</p>
                <Link 
                    to={`/app/courses/${lastCourseId}`}
                    className="w-full flex items-center px-4 py-3.5 gap-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                >
                    <GraduationCap size={20} />
                    <span className="font-bold text-sm tracking-tight truncate">Мой курс</span>
                </Link>
            </div>
          )}
        </nav>

        {/* USER PROFILE SECTION */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-4 bg-slate-950/30">
          <div className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${isSidebarOpen ? 'bg-white/5' : 'bg-transparent justify-center'}`}>
            <div className="min-w-[40px] h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white ring-1 ring-white/10 overflow-hidden">
                {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                    <span className="font-black text-xs uppercase">{user.name?.substring(0, 2)}</span>
                )}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden text-left">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">
                  {user.name}
                </p>
                <p className="text-[9px] text-slate-400 font-bold truncate uppercase tracking-widest">
                  Студент
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Выйти</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300 flex flex-col`}>
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-600" />
                <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {isSettingsActive ? 'Настройки профиля' : 'Обучающая платформа'}
                </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1600px] mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Outlet /> 
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;