import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Sparkles, ShieldCheck, 
  Zap, Globe, ChevronLeft, Mail, Lock 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden">
      
      {/* --- ЛЕВАЯ ЧАСТЬ: БРЕНД И ПРЕИМУЩЕСТВА (MOOC STYLE) --- */}
      <div className="hidden md:flex md:w-1/2 bg-[#0F172A] relative p-16 flex-col justify-between overflow-hidden">
        
        {/* Декоративные элементы как на Home */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.05]" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm mb-12 hover:text-blue-300 transition-colors group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Вернуться на главную
          </Link>

          <div className="mb-14">
            <h2 className="text-white font-black text-2xl tracking-tighter mb-8">
              KAZUTB <span className="text-blue-500">OPEN</span>
            </h2>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-6">
              С ВОЗВРАЩЕНИЕМ <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                В БУДУЩЕЕ
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">
              Твой ИИ-куратор уже подготовил новые материалы для обучения.
            </p>
          </div>

          {/* Инфо-карточки (MOOC Features) */}
          <div className="space-y-4 max-w-md">
            {[
              { icon: <Zap className="text-amber-400" size={20}/>, title: "AI-Ассистент 24/7", desc: "Бесплатная помощь в решении задач" },
              { icon: <ShieldCheck className="text-blue-400" size={20}/>, title: "Сертификация", desc: "Твои достижения сохраняются в профиле" },
              { icon: <Globe className="text-emerald-400" size={20}/>, title: "Сообщество", desc: "Обсуждай уроки на форуме" }
            ].map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex items-center gap-5 p-4 bg-white/[0.03] backdrop-blur-md rounded-[24px] border border-white/5"
              >
                <div className="p-3 bg-slate-800 rounded-xl">{item.icon}</div>
                <div>
                  <h4 className="text-white font-bold text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="relative z-10 flex items-center gap-4 border-t border-white/5 pt-8">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <img key={i} className="w-8 h-8 rounded-full border-2 border-[#0F172A]" src={`https://ui-avatars.com/api/?name=U${i}&background=random`} alt="user" />
            ))}
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Присоединяйся к 50k+ студентов
          </p>
        </div>
      </div>

      {/* --- ПРАВАЯ ЧАСТЬ: ФОРМА ВХОДА --- */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Войти в аккаунт</h3>
            <p className="text-slate-500 font-medium">Нет аккаунта? <Link to="/register" className="text-blue-600 font-bold hover:underline">Создать бесплатно</Link></p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Электронная почта</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Пароль</label>
                <Link to="/reset" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700">Забыли пароль?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 group">
              Войти в кабинет <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="bg-white px-4">Или войти через</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5" alt="google" /> Google
              </button>
              <button className="flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="h-5" alt="fb" /> Facebook
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;