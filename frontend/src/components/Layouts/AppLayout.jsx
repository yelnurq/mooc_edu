import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Bell, LogOut, LayoutGrid, 
  Sparkles, BookOpen, User, Settings, GraduationCap 
} from 'lucide-react';

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Функция для проверки активной ссылки (подсветка в меню)
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="h-screen flex font-sans flex-col bg-white overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-white z-[70]">
        
        {/* Левая часть: Назад + Логотип */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="group p-2.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-all duration-300"
          >
            <ArrowLeft size={18} className="group-active:-translate-x-1 transition-transform" />
          </button>
          
          <div className="h-6 w-px bg-slate-100" />
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
              <Sparkles size={16} className="text-white fill-white" />
            </div>
            <span className="font-black text-base tracking-tighter uppercase text-slate-900">
              KAZ<span className="text-blue-600">TBU</span>
            </span>
          </Link>
        </div>

        {/* ЦЕНТРАЛЬНАЯ НАВИГАЦИЯ (ОСНОВНЫЕ ССЫЛКИ) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <Link 
            to="/courses" 
            className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              isActive('/courses') 
              ? 'bg-white text-blue-600 shadow-sm shadow-slate-200' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Все курсы
          </Link>
          <Link 
            to="/dashboard" 
            className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              isActive('/dashboard') 
              ? 'bg-white text-blue-600 shadow-sm shadow-slate-200' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Моё обучение
          </Link>
        </nav>

        {/* ПРАВАЯ ЧАСТЬ: УВЕДОМЛЕНИЯ + ПРОФИЛЬ */}
        <div className="flex items-center gap-4">
          <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          
          <div className="group relative">
            <button className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xs font-black text-white uppercase hover:ring-4 ring-slate-100 transition-all overflow-hidden border-2 border-transparent group-hover:border-blue-100">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </button>
            
            {/* DROP-DOWN MENU */}
            <div className="absolute right-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/60 p-2.5">
                
                {/* Информация о юзере */}
                <div className="px-4 py-4 border-b border-slate-50 mb-1.5 bg-slate-50/50 rounded-t-[1.5rem]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Студент</p>
                  <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Пользователь'}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user?.email || 'student@kaztbu.kz'}</p>
                </div>

                {/* Ссылки внутри меню */}
                <div className="space-y-1">
                  <Link to="/dashboard" className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group/item">
                    <div className="flex items-center gap-3">
                      <GraduationCap size={16} className="text-blue-600" />
                      <span className="text-[11px] font-black uppercase tracking-tight text-slate-600 group-hover/item:text-slate-900">Мои курсы</span>
                    </div>
                    <span className="w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md text-[9px] font-black">12</span>
                  </Link>

                  <Link to="/profile/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group/item">
                    <Settings size={16} className="text-slate-400 group-hover/item:text-slate-900" />
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-600 group-hover/item:text-slate-900">Настройки</span>
                  </Link>

                  <div className="h-px bg-slate-50 mx-2 my-1" />

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 rounded-xl transition-all"
                  >
                    <LogOut size={16} />
                    <span className="text-[11px] font-black uppercase tracking-tight">Выйти из системы</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* КОНТЕНТ (Outlet) */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;