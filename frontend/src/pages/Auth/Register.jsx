import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Состояния полей
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Очищаем ошибку поля при вводе
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError('');

    // Форматирование email (как в логине)
    let formattedEmail = formData.email.trim();
    if (formattedEmail && !formattedEmail.includes('@')) {
      formattedEmail = `${formattedEmail}@kaztbu.edu.kz`;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: formattedEmail
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешная регистрация
        navigate('/login', { state: { message: 'Регистрация прошла успешно! Теперь вы можете войти.' } });
      } else if (response.status === 422) {
        // Ошибки валидации от Laravel
        setErrors(data.errors);
      } else {
        setServerError(data.message || 'Произошла ошибка при регистрации.');
      }
    } catch (err) {
      setServerError('Не удалось связаться с сервером.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg">
        
        {/* BACK TO LOGIN */}
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-8 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад к входу
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Создать аккаунт</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Регистрация нового сотрудника KAZUTB</p>
        </div>

        {/* CARD */}
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">
              {serverError}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NAME */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">ФИО полностью</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  name="name"
                  type="text" 
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 transition-all outline-none ${errors.name ? 'ring-2 ring-red-500/20' : 'focus:ring-blue-500/20'}`}
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>
              {errors.name && <p className="text-[9px] text-red-500 font-bold ml-4 uppercase">{errors.name[0]}</p>}
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Email / Логин</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  name="email"
                  type="text" 
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 transition-all outline-none ${errors.email ? 'ring-2 ring-red-500/20' : 'focus:ring-blue-500/20'}`}
                  placeholder="i.ivanov"
                  required
                />
              </div>
              {errors.email && <p className="text-[9px] text-red-500 font-bold ml-4 uppercase">{errors.email[0]}</p>}
            </div>

            {/* MOBILE */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Телефон</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Phone size={18} />
                </div>
                <input 
                  name="mobile"
                  type="text" 
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  placeholder="+7 (___) ___"
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 transition-all outline-none ${errors.password ? 'ring-2 ring-red-500/20' : 'focus:ring-blue-500/20'}`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Повтор</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  name="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:bg-slate-400 transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Зарегистрироваться'}
                {!loading && <UserPlus size={18} className="group-hover:scale-110 transition-transform" />}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-50">
          © 2026 KAZUTB — Department of IT
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;