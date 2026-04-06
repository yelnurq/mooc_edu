import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Bell, LogOut, Sparkles, 
  Settings, GraduationCap, User, LayoutGrid
} from 'lucide-react';

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const [lastCourseId, setLastCourseId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedLastCourse = localStorage.getItem('last_course_id');
    if (savedLastCourse) setLastCourseId(savedLastCourse);
  }, []);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length === 4 && pathParts[2] === 'courses') {
      const courseId = pathParts[3];
      if (courseId && courseId !== 'dashboard' && courseId !== 'admin') {
        localStorage.setItem('last_course_id', courseId);
        setLastCourseId(courseId);
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isSettingsActive = location.state?.activeTab === 'settings';

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-white z-[70]">
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-8 w-px bg-slate-100 hidden md:block" />
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
              <Sparkles size={18} className="text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 uppercase">
              KAZ<span className="text-blue-600">TBU</span>
            </span>
          </Link>
        </div>

        {/* CENTER NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <Link 
            to="/app/dashboard" 
            state={{ activeTab: 'overview' }}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              isActive('/app/dashboard') && !isSettingsActive
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
          >
            <LayoutGrid size={14} className={isActive('/app/dashboard') && !isSettingsActive ? 'text-blue-600' : 'text-slate-400'} /> 
            Кабинет
          </Link>

          <Link 
            to="/app/dashboard" 
            state={{ activeTab: 'settings' }} 
            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              isSettingsActive 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
          >
            <Settings size={14} className={isSettingsActive ? 'text-blue-600' : 'text-slate-400'} /> 
            Настройки
          </Link>

          {lastCourseId && (
            <>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <Link 
                to={`/app/courses/${lastCourseId}`} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  location.pathname === `/app/courses/${lastCourseId}`
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <GraduationCap size={15} /> Последний курс
              </Link>
            </>
          )}
        </nav>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="group relative ml-2">
            <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-bold text-slate-900 border border-slate-200 hover:border-slate-900 transition-all overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </button>
            
            <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-[100]">
              <div className="w-64 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl p-2">
                <div className="px-4 py-3 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Аккаунт</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Студент'}</p>
                </div>
                <div className="space-y-1">
                  <Link 
                    to="/app/dashboard" 
                    state={{ activeTab: 'settings' }} 
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Settings size={16} className="text-slate-400" />
                    <span className="text-[11px] font-bold uppercase text-slate-600">Настройки</span>
                  </Link>
                  <div className="h-px bg-slate-50 mx-2 my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors">
                    <LogOut size={16} /> <span className="text-[11px] font-bold uppercase">Выйти</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;