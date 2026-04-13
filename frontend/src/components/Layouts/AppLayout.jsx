import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Search, Menu, X, ChevronRight, 
  Sparkles, GraduationCap 
} from 'lucide-react';
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

  // Режим обучения: если true, сайдбар будет всегда закрыт (w-20)
  const isCourseLearningPage = /^\/app\/courses\/[^/]+$/.test(location.pathname);

  // Эффективное состояние ширины сайдбара
  // Если мы на странице курса — всегда false (закрыт)
  const effectiveSidebarOpen = isCourseLearningPage ? false : isSidebarOpen;

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

  const filteredResults = allSearchItems?.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* GLOBAL SIDEBAR - Теперь отображается всегда */}
      <aside className={`
        ${effectiveSidebarOpen ? 'w-72' : 'w-20'} 
        bg-white border-r border-slate-200 flex flex-col fixed h-full transition-all duration-300 z-50
      `}>
        <div className={`flex items-center border-b border-slate-50 h-20 transition-all duration-300 ${effectiveSidebarOpen ? 'px-6 gap-3' : 'px-0 justify-center'}`}>
          <div className="w-11 h-11 shrink-0">
            <img src="/images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          {effectiveSidebarOpen && (
            <span className="font-black text-xl tracking-tighter text-slate-800 uppercase">
              KAZ<span className="text-blue-600">UTB</span>
            </span>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-2 mt-4 overflow-y-auto">
  {sidebarMenuItems.map((item) => {
    // 1. Стандартная проверка: совпадает ли путь
    const isPathActive = location.pathname.includes(item.path);

    // 2. Специальная проверка: если мы внутри курса, 
    // подсвечиваем пункт "Курсы" (предположим, его ID или часть пути 'courses')
    const isLearningActive = isCourseLearningPage && item.path.includes('courses');

    const isActive = isPathActive || isLearningActive;

    return (
      <Link 
        key={item.id} 
        to={item.path} 
        className={`w-full flex items-center rounded-2xl transition-all duration-300 
          ${effectiveSidebarOpen ? 'px-4 py-3.5 gap-4' : 'justify-center py-3.5'} 
          ${isActive 
            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
      >
        <span className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
          {item.icon}
        </span>
        {effectiveSidebarOpen && (
          <span className="font-bold text-sm tracking-tight">{item.label}</span>
        )}
      </Link>
    );
  })}
</nav>

        <div className="p-4 mt-auto border-t border-slate-50">
          <button onClick={handleLogout} className={`w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest ${!effectiveSidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {effectiveSidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 transition-all duration-300 flex flex-col 
        ${effectiveSidebarOpen ? 'ml-72' : 'ml-20'}
      `}>
        
        {/* GLOBAL HEADER - Скрывается только на странице обучения */}
        {!isCourseLearningPage && (
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Система Обучения</h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative hidden md:block" ref={searchRef}>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  <Search size={16} className="text-slate-400" />
                  <input type="text" placeholder="Поиск..." className="bg-transparent border-none text-xs font-bold focus:outline-none w-48" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <button className="p-2.5 text-slate-400 relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>
        )}

   {/* Контейнер Outlet */}
<div className={`flex-1 flex flex-col ${!isCourseLearningPage ? 'p-8 w-full' : 'h-screen w-full overflow-hidden'}`}>
  <Outlet /> 
</div>
      </main>
    </div>
  );
};

export default AppLayout;