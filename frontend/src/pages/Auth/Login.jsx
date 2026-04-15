import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Zap, Globe, 
  ChevronLeft, Mail, Lock, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  // --- ЛОГИКА ИЗ СТАРОГО КОМПОНЕНТА ---
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let formattedEmail = email.trim();
    if (formattedEmail && !formattedEmail.includes('@')) {
      formattedEmail = `${formattedEmail}@kaztbu.edu.kz`;
    }

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: formattedEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const role = data.user.role;
        const adminRoles = ['super_admin', 'academic_office', 'dean', 'head_of_dept'];

        const origin = location.state?.from;
        const autoEnroll = location.state?.autoEnroll;

        if (origin) {
          navigate(origin, { state: { autoEnroll: autoEnroll } });
        } else {
          if (adminRoles.includes(role)) {
            navigate('/admin');
          } else {
            navigate('/app/dashboard');
          }
        }
      } else {
        setError(data.message || 'Ошибка авторизации.');
      }
    } catch (err) {
      setError('Не удалось связаться с сервером.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* --- ЛЕВАЯ ЧАСТЬ (БРЕНД) --- */}
      <div className="hidden md:flex md:w-1/2 bg-[#0F172A] relative p-16 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-16 hover:text-white transition-colors group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
          </Link>

          <div className="mb-14 text-left">
            <h2 className="text-white font-black text-xl tracking-tighter mb-8 italic">
              KAZUTB <span className="text-blue-500 underline decoration-2 underline-offset-4">MOOC</span>
            </h2>
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter mb-6 uppercase">
              С возвращением <br /> 
              <span className="text-blue-500">в систему</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xs font-medium leading-relaxed">
              Ваш персональный кабинет управления обучением и форум сообщества.
            </p>
          </div>

          <div className="space-y-3 max-w-xs">
            {[
              { icon: <Zap className="text-blue-400" size={18}/>, title: "AI-КУРАТОР", desc: "Автоматическая помощь" },
              { icon: <ShieldCheck className="text-slate-400" size={18}/>, title: "БЕЗОПАСНОСТЬ", desc: "Данные под защитой" },
              { icon: <Globe className="text-slate-400" size={18}/>, title: "NETWORKING", desc: "Доступ к форуму 24/7" }
            ].map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl"
              >
                <div className="shrink-0">{item.icon}</div>
                <div>
                  <h4 className="text-white font-black text-[9px] uppercase tracking-widest">{item.title}</h4>
                  <p className="text-slate-500 text-[11px] font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/5">
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
            Kazakhstan University of Technology and Business
          </p>
        </div>
      </div>

      {/* --- ПРАВАЯ ЧАСТЬ (ФОРМА) --- */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-left"
        >
          <div className="mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Авторизация</h3>
            <p className="text-[13px] text-slate-500 font-medium">
              Нет аккаунта? <Link to="/register" className="text-blue-600 font-bold hover:text-slate-900 transition-colors">Создать бесплатно</Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 flex items-center gap-2">
              <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Электронная почта</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="USERNAME ИЛИ EMAIL"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Пароль</label>
                <Link to="/reset" className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-slate-900">Забыли?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 disabled:bg-slate-400 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Войти в кабинет <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-12">
            <div className="relative mb-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <span className="relative bg-white px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Или через</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-wider text-slate-600">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4" alt="google" /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-wider text-slate-600">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="h-4" alt="fb" /> FB
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;