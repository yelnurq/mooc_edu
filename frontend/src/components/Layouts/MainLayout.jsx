import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Bell, Search, Menu, X, ChevronRight, LayoutDashboard, Globe } from 'lucide-react';
import allSearchItems, { sidebarMenuItems } from './menu';

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Для главной страницы лучше закрыт по умолчанию
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  
  const location = useLocation(); 
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredResults = allSearchItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* TOPBAR */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-[60]">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10">
              <img src="images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-800 uppercase hidden sm:block">
              KAZ<span className="text-blue-600">UTB</span>
            </span>
          </Link>

          {/* Главное меню навигации (для десктопа) */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/courses" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Курсы</Link>
            <Link to="/about" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">О нас</Link>
            <Link to="/news" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider">Новости</Link>
          </nav>
        </div>

        {/* Right Section: Search & Profile */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* SEARCH */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 focus-within:border-blue-200 transition-all">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Найти курс..." 
                className="bg-transparent border-none text-xs font-bold focus:outline-none w-40 lg:w-64"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
              />
            </div>
            {showResults && searchQuery && (
               <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-50">
                  <div className="max-h-96 overflow-y-auto p-2">
                    {filteredResults.length > 0 ? filteredResults.map(item => (
                      <button key={item.id} onClick={() => { navigate(item.path); setShowResults(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl text-left">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{item.icon}</div>
                        <div>
                           <p className="text-xs font-bold text-slate-700">{item.label}</p>
                           <p className="text-[10px] text-slate-400 uppercase">Перейти</p>
                        </div>
                      </button>
                    )) : <div className="p-4 text-center text-xs font-bold text-slate-400">Ничего не найдено</div>}
                  </div>
               </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3 border-l border-slate-100 pl-4 md:pl-6">
            {user ? (
              <>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <Link to="/dashboard" className="hidden sm:flex items-center gap-3 p-1 pr-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-md">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-bold tracking-wide">Панель</span>
                </Link>
              </>
            ) : (
              <Link to="/login" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                Войти
              </Link>
            )}
            
            {/* Mobile Menu Toggle */}
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden" onClick={() => setSidebarOpen(false)}>
          <aside className="w-72 bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
               <span className="font-black text-xl text-slate-800">МЕНЮ</span>
               <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
            </div>
            <nav className="space-y-4">
              {sidebarMenuItems.map(item => (
                <Link key={item.id} to={item.path} className="flex items-center gap-4 p-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setSidebarOpen(false)}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
            {user && (
              <button onClick={handleLogout} className="mt-auto flex items-center gap-4 p-3 text-red-500 font-bold">
                <LogOut size={20} /> Выйти
              </button>
            )}
          </aside>
        </div>
      )}

      {/* CONTENT AREA */}
      <main>
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;