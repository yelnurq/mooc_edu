import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Search, Menu, X, ChevronRight, 
  Sparkles, GraduationCap 
} from 'lucide-react';
// Импортируем данные (убедись, что пути верны)
import allSearchItems, { sidebarMenuItems } from './menu'; 

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [lastCourseId, setLastCourseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef(null);
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

  // 3. Обработка клика вне поиска
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Логика поиска
  const filteredResults = allSearchItems?.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isSettingsActive = location.state?.activeTab === 'settings';

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* SIDEBAR (Светлый стиль) */}
      <aside className={`
        ${isSidebarOpen ? 'w-72' : 'w-20'} 
        bg-white border-r border-slate-200 flex flex-col fixed h-full transition-all duration-300 z-50
      `}>
        {/* LOGO */}
        <div className={`flex items-center border-b border-slate-50 h-20 transition-all duration-300 ${isSidebarOpen ? 'px-6 gap-3' : 'px-0 justify-center'}`}>
          <div className="w-11 h-11 shrink-0">
            <img src="/images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          {isSidebarOpen && (
            <span className="font-black text-xl tracking-tighter text-slate-800 uppercase">
              KAZ<span className="text-blue-600">UTB</span>
            </span>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-2 mt-4 overflow-y-auto">
          {sidebarMenuItems.map((item) => {
            // Улучшенная логика активности (поддерживает вложенность и state)
            const isActive = item.id === 'settings' ? isSettingsActive : 
                           item.id === 'dashboard' ? (location.pathname === '/app/dashboard' && !isSettingsActive) :
                           location.pathname.includes(item.path);

            return (
              <Link 
                key={item.id} 
                to={item.path} 
                state={item.id === 'settings' ? { activeTab: 'settings' } : (item.id === 'dashboard' ? { activeTab: 'overview' } : null)}
                className={`w-full flex items-center rounded-2xl transition-all duration-300 ${isSidebarOpen ? 'px-4 py-3.5 gap-4' : 'justify-center py-3.5'} 
                  ${isActive ? 
                    'bg-slate-900 text-white shadow-xl shadow-slate-200' : 
                    'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
              </Link>
            );
          })}

          {/* Специальная кнопка "Продолжить" */}
          {lastCourseId && isSidebarOpen && (
            <div className="pt-4 animate-in fade-in slide-in-from-left-2">
                <p className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Продолжить</p>
                <Link 
                    to={`/app/courses/${lastCourseId}`}
                    className="w-full flex items-center px-4 py-3.5 gap-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all group"
                >
                    <GraduationCap size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-sm tracking-tight truncate">Мой курс</span>
                </Link>
            </div>
          )}
        </nav>

        {/* PROFILE & LOGOUT */}
        <div className="p-4 mt-auto border-t border-slate-50 space-y-2">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-800 border border-slate-200 font-black text-xs uppercase overflow-hidden shrink-0">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.substring(0, 2)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-800 truncate uppercase">{user.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Студент</p>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300 flex flex-col`}>
        {/* HEADER (Светлый с поиском) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-600 animate-pulse" />
                <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {sidebarMenuItems.find(i => i.path === location.pathname)?.label || 'Обучение'}
                </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* ПОИСК */}
            <div className="relative hidden md:block" ref={searchRef}>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Поиск по системе..." 
                  className="bg-transparent border-none text-xs font-bold focus:outline-none w-48 text-slate-700"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                />
              </div>

              {showResults && searchQuery && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-96 overflow-y-auto p-2">
                    {filteredResults.length > 0 ? (
                      filteredResults.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.type === 'route') { navigate(item.path); setShowResults(false); setSearchQuery(''); }
                          }}
                          className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors group text-left"
                        >
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">Перейти в раздел</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 self-center" />
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Ничего не найдено</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* УВЕДОМЛЕНИЯ */}
            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Outlet /> 
          </div>
        </div>
      </main>

    </div>
  );
};

export default AppLayout;