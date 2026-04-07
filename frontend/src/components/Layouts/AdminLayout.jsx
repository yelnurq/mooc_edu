import React, { useState, useEffect } from 'react';
import { 
  Link, 
  useLocation, 
  Outlet, 
  useNavigate 
} from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  LogOut,
  FileSearch,
  School2Icon,
  CopyCheckIcon,
  MonitorDotIcon,
  Menu,
  X,
  Logs,
  Users2,
  LayoutDashboard
} from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation(); 
  const navigate = useNavigate();

  // 1. Массив всех пунктов меню
  const allMenuItems = [
    { id: 'dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Дэшборд' },
    { id: 'enroll', path: '/admin/enroll', icon: <CopyCheckIcon size={20} />, label: 'Управление доступами' },
    { id: 'users', path: '/admin/users', icon: <Users size={20} />, label: 'Пользователи' },
    { id: 'ldap', path: '/admin/users/ldap', icon: <Users2 size={20} />, label: 'LDAP Пользователи' },
    { id: 'logs', path: '/admin/logs', icon: <Logs size={20} />, label: 'Логи' },
    { id: 'settings', path: '/admin/settings', icon: <Settings size={20} />, label: 'Настройки' },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(savedUser));
    // Проверка прав доступа (currentItem.roles) удалена, чтобы пускало на все страницы
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Теперь filteredMenuItems просто равен всем пунктам, без фильтрации по ролям
  const filteredMenuItems = allMenuItems;

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className={`
        ${isSidebarOpen ? 'w-72' : 'w-20'} 
        bg-slate-900 border-r border-white/5 flex flex-col fixed h-full transition-all duration-300 z-50 shadow-2xl
      `}>
        <div className={`flex items-center border-white/5 bg-slate-950/50 h-20 transition-all duration-300 ${isSidebarOpen ? 'px-6 gap-3' : 'px-0 justify-center'}`}>
          <div className="w-11 h-11">
            <img src="/images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter text-white uppercase">KAZ<span className="text-blue-400">UTB</span><span className='italic text-[13px]'>mooc</span></span>}
        </div>

        <nav className="flex-1 p-3 space-y-2 mt-4 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.id} to={item.path} className={`w-full flex items-center rounded-2xl transition-all duration-300 ${isSidebarOpen ? 'px-4 py-3.5 gap-4' : 'justify-center py-3.5'} ${isActive ? 
                'bg-blue-600 text-white shadow-lg shadow-blue-900/20' :
                   'text-slate-400 hover:bg-white/5 hover:text-white'}`}>

                <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                {isActive && !isSidebarOpen && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ADMIN PROFILE */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-4 bg-slate-950/30">
          <div className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${isSidebarOpen ? 'bg-white/5' : 'bg-transparent justify-center'}`}>
            <div className="min-w-[40px] h-10 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-white/10 shadow-sm font-black text-xs uppercase">
              {user.name?.substring(0, 2) || 'AD'}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 text-left">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">
                  {user.name}
                </p>
                <p className="text-[9px] text-blue-400 font-bold truncate uppercase tracking-widest">
                  {(() => {
                    const role = user.role?.toLowerCase();
                    if (role === 'super_admin') return 'Администратор';
                    if (role === 'head_of_dept') return user.department?.title || 'Заведующий кафедрой';
                    if (role === 'dean') return 'Декан факультета';
                    if (role === 'academic_office') return 'Академический офис';
                    return 'Сотрудник';
                  })()}
                </p>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Выйти из панели</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300`}>
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Console</span>
               <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                 {allMenuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
               </h1>
            </div>
          </div>
        </header>

        <div className="min-h-[calc(100vh-80px)] p-8">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;