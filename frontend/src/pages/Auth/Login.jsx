import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation(); // Добавили для получения пути возврата

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

        // --- ЛОГИКА УМНОГО РЕДИРЕКТА ---
        const origin = location.state?.from;
        const autoEnroll = location.state?.autoEnroll;

        if (origin) {
          // Если пользователь пришел с конкретной страницы (например, курса),
          // возвращаем его назад и прокидываем флаг для авто-записи
          navigate(origin, { state: { autoEnroll: autoEnroll } });
        } else {
          // Стандартная логика перенаправления по ролям
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <div className="min-w-[45px] h-20 flex items-center justify-center overflow-hidden">
            <img src="images/icons/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tighter text-slate-900">
            KAZ<span className="text-blue-400">UTB</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Система управления эффективностью</p>
        </div>

        {/* CARD */}
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Email или Логин</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-300"
                  placeholder="name (домен добавится сам)"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Пароль</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:bg-slate-400 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Войти в систему'}
              {!loading && <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col items-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">Нет аккаунта?</p>
            <Link 
              to="/register" 
              className="flex items-center gap-2 text-slate-900 hover:text-blue-600 font-black text-xs uppercase tracking-tighter transition-colors group"
            >
              <UserPlus size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
              Создать аккаунт сотрудника
            </Link>
          </div>
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-50">
          © 2026 KAZUTB — Department of IT
        </p>
      </div>
    </div>
  );
};

export default LoginPage;