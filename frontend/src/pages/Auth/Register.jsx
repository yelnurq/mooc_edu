import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, Eye, 
  EyeOff, Loader2, UserPlus, ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError('');

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
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const origin = location.state?.from;
        const autoEnroll = location.state?.autoEnroll;

        if (origin) {
          navigate(origin, { state: { autoEnroll: autoEnroll } });
        } else {
          navigate('/app/dashboard');
        }
        
      } else if (response.status === 422) {
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        
        <Link 
          to="/login" 
          state={location.state}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-10 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Вернуться ко входу
        </Link>

        <div className="mb-10 text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded">Новый профиль</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Регистрация</h1>
          <p className="text-slate-500 text-[13px] font-medium mt-2">
            Присоединяйтесь к экосистеме <span className="text-slate-900 font-bold">KAZUTB MOOC</span>
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-900" />
          
          {serverError && (
            <div className="mb-8 p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 text-left">
            
            {/* NAME */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Полное имя (ФИО)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="name"
                  type="text" 
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none ring-1 ${errors.name ? 'ring-rose-500/50' : 'ring-slate-100 focus:ring-blue-500/20 focus:bg-white'}`}
                  placeholder="ИВАНОВ ИВАН"
                  required
                />
              </div>
              {errors.name && <p className="text-[9px] text-rose-500 font-black uppercase tracking-tighter ml-1">{errors.name[0]}</p>}
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Логин / Почта</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="email"
                  type="text" 
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none ring-1 ${errors.email ? 'ring-rose-500/50' : 'ring-slate-100 focus:ring-blue-500/20 focus:bg-white'}`}
                  placeholder="I.IVANOV"
                  required
                />
              </div>
            </div>

            {/* MOBILE */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Телефон</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="mobile"
                  type="text" 
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                  placeholder="+7 (707) 000-0000"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Пароль</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-12 text-sm font-bold transition-all outline-none ring-1 ${errors.password ? 'ring-rose-500/50' : 'ring-slate-100 focus:ring-blue-500/20 focus:bg-white'}`}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Подтверждение</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/10 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Создать аккаунт'}
                {!loading && <UserPlus size={16} className="group-hover:scale-110 transition-transform" />}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-12 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">
          Kazakhstan University of Technology and Business © 2026
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;