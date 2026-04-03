import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LogOut, User as UserIcon, Bell, Search, Menu, X, 
  ChevronRight, LayoutDashboard, Globe, Github, 
  Twitter, Instagram, Mail, Phone, MapPin
} from 'lucide-react';
import allSearchItems, { sidebarMenuItems } from './menu';

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      
      {/* 1. СЛУЖЕБНЫЙ ТОПБАР — Используем bg-slate-50 для контраста */}
      <div className="hidden md:block bg-slate-50/80 border-b border-slate-200 py-2 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+77172697060" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
              <Phone size={12} className="text-slate-400" />
              <span className="text-[10px] font-bold">+7 7172 69-70-60</span>
            </a>
            <a href="mailto:info@kaztbu.edu.kz" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
              <Mail size={12} className="text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">info@kaztbu.edu.kz</span>
            </a>
          </div>
          
          <div className="flex items-center gap-5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Приемная комиссия 2026</span>
            <div className="h-3 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2">
               <Globe size={12} className="text-slate-400" />
               <select className="bg-transparent text-[10px] font-bold text-slate-600 uppercase focus:outline-none cursor-pointer">
                 <option>RU</option>
                 <option>KZ</option>
                 <option>EN</option>
               </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ОСНОВНОЙ ХЕДЕР — Чисто белый, с тенями и эффектом стекла */}
      <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center sticky top-0 z-[60] shadow-sm shadow-slate-200/50">
        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex items-center justify-between">
          
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10">
                <img src="images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tighter text-slate-800 uppercase">
                  KAZ<span className="text-blue-600">TBU</span>
                </span>
                <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em] ml-0.5">education</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {['Курсы', 'О нас', 'Новости'].map((item, idx) => (
                <Link 
                  key={idx} 
                  to={`/${item === 'Курсы' ? 'courses' : item === 'О нас' ? 'about' : 'news'}`}
                  className="text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Box */}
            <div className="relative hidden md:block" ref={searchRef}>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-inner transition-all group">
                <Search size={16} className="text-slate-400 group-focus-within:text-blue-500" />
                <input 
                  type="text" 
                  placeholder="Поиск курса..." 
                  className="bg-transparent border-none text-[11px] font-bold focus:outline-none w-40 lg:w-56"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                />
              </div>
              {/* Результаты поиска (абсолютный блок) */}
              {showResults && searchQuery && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                   {/* ... (ваш код filteredResults) */}
                </div>
              )}
            </div>

            {/* Profile / Login */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              {user ? (
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                  </button>
                  <Link to="/dashboard" className="flex items-center gap-2 p-1 pr-4 bg-slate-900 hover:bg-blue-700 text-white rounded-full transition-all">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-black">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Панель</span>
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all">
                  Войти
                </Link>
              )}
              
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Section */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10">
                  <img src="images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <span className="font-black text-xl tracking-tighter text-slate-800 uppercase">
                  KAZ<span className="text-blue-600">UTB</span>
                </span>
              </Link>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Образовательная платформа нового поколения. Развиваем навыки будущего вместе с вами.
              </p>
              <div className="flex items-center gap-4">
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 mb-8">Платформа</h4>
              <ul className="space-y-4">
                <FooterLink label="Все курсы" path="/courses" />
                <FooterLink label="О проекте" path="/about" />
                <FooterLink label="Менторство" path="/mentors" />
                <FooterLink label="Цены" path="/pricing" />
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 mb-8">Поддержка</h4>
              <ul className="space-y-4">
                <FooterLink label="Помощь" path="/help" />
                <FooterLink label="Конфиденциальность" path="/privacy" />
                <FooterLink label="Условия использования" path="/terms" />
                <FooterLink label="Новости" path="/news" />
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 mb-8">Контакты</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-500">
                  <MapPin size={18} className="text-blue-600 shrink-0" />
                  <span className="text-sm font-medium">Астана, ул. Кажымукана 7</span>
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                  <Phone size={18} className="text-blue-600 shrink-0" />
                  <span className="text-sm font-medium">+7 (707) 123 45 67</span>
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                  <Mail size={18} className="text-blue-600 shrink-0" />
                  <span className="text-sm font-medium">info@kazutb.edu</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center md:text-left">
              © 2026 KAZUTB LMS. Все права защищены. <br className="md:hidden" /> 
              Сделано с ❤️ для студентов.
            </p>
            <div className="flex items-center gap-8">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">KZ</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">RU</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest cursor-pointer underline underline-offset-4">EN</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Вспомогательные компоненты для футера
const FooterLink = ({ label, path }) => (
  <li>
    <Link to={path} className="text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors flex items-center group">
      <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
      {label}
    </Link>
  </li>
);

const SocialIcon = ({ icon }) => (
  <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm">
    {icon}
  </button>
);

export default MainLayout;