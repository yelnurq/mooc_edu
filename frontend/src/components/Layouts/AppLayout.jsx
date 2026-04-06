import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, User, LogOut, Settings, LayoutGrid } from 'lucide-react';

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-screen flex font-sans flex-col bg-white overflow-hidden">
      {/* Минималистичный хедер для приложения */}
      <header className="h-14 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white z-[70]">
        <div className="flex items-center gap-4">
          <Link to="/courses" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <Link to="/" className="flex items-center gap-2">
             <span className="font-black text-sm tracking-tighter uppercase">
               KAZ<span className="text-blue-600">TBU</span>
             </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
            <Bell size={18} />
          </button>
          
          <div className="group relative">
            <button className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black text-white uppercase">
              {user?.name?.charAt(0) || 'U'}
            </button>
            
            {/* Выпадающее меню при наведении */}
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2">
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 transition-colors">
                  <LayoutGrid size={14} /> Личный кабинет
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 text-red-500 rounded-xl text-[11px] font-bold transition-colors"
                >
                  <LogOut size={14} /> Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Контент приложения (CourseAppPage зарендерится здесь) */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;