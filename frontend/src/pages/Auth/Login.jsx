import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Состояния для полей
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ЛОГИКА АВТОПОДСТАНОВКИ ДОМЕНА
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
        localStorage.setItem('token', data.access_token.token);
        localStorage.setItem('user', JSON.stringify(data.user));
     
        const role = data.user.role;

        // Список ролей, которые имеют доступ к админ-панели
        const adminRoles = ['super_admin', 'academic_office', 'dean', 'head_of_dept'];

        if (adminRoles.includes(role)) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Ошибка авторизации. Проверьте данные.');
      }
      
    } catch (err) {
      setError('Не удалось связаться с сервером. Проверьте соединение.');
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

          {/* БЛОК БЫСТРОГО ВХОДА — УДАЛИ ПЕРЕД ДЕПЛОЕМ */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase text-center tracking-widest">
              Dev Mode: Быстрый доступ
            </p>
            
            {/* Деканы */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'ТФ', email: 'dean.tf@kpi.test' },
                { label: 'ФЭиБ', email: 'dean.feb@kpi.test' },
                { label: 'ФИиИТ', email: 'dean.fiit@kpi.test' }
              ].map((dean) => (
                <button key={dean.email} type="button" onClick={() => { setEmail(dean.email); setPassword('password123'); }}
                  className="py-2 bg-blue-50/50 hover:bg-blue-100 text-[9px] font-bold text-blue-600 rounded-lg transition-all uppercase">
                  {dean.label}
                </button>
              ))}
            </div>

            {/* Академ. отдел и Админ */}
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setEmail('academic.study@kpi.test'); setPassword('password123'); }}
                className="py-2 bg-slate-50 hover:bg-slate-100 text-[9px] font-bold text-slate-500 rounded-lg transition-all uppercase">
                Учебная работа
              </button>
              <button type="button" onClick={() => { setEmail('academic.study@kpi.test1'); setPassword('password123'); }}
                className="py-2 bg-slate-50 hover:bg-slate-100 text-[9px] font-bold text-slate-500 rounded-lg transition-all uppercase">
                Орг-метод
              </button>
              <button type="button" onClick={() => { setEmail('test@kpi.test'); setPassword('test@kpi.test'); }}
                className="py-2 bg-emerald-50 hover:bg-emerald-100 text-[9px] font-bold text-emerald-600 rounded-lg transition-all uppercase">
                Yelnur Z
              </button>
              <button type="button" onClick={() => { setEmail('admin@kpi.test'); setPassword('admin@kpi.test'); }}
                className="py-2 bg-rose-50 hover:bg-rose-100 text-[9px] font-bold text-rose-600 rounded-lg transition-all uppercase">
                Admin
              </button>
            </div>
          </div>
          {/* КОНЕЦ БЛОКА БЫСТРОГО ВХОДА */}

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <a href="#" className="text-[10px] font-bold text-slate-400 uppercase hover:text-blue-600 transition-colors tracking-widest">
              Забыли пароль?
            </a>
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