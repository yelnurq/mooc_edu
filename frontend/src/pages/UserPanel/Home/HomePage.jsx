import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Sparkles, GraduationCap, BookOpen, 
  Cpu, Palette, Compass, History, Star 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard } from '../../../components/Course/CourseCard/CourseCard';

const FAKE_COURSES = [
  {
    id: 1,
    title: "Mastering Laravel Enterprise Architecture",
    category: "Backend",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    rating: 4.9,
    duration: 42,
    lessons: 24,
    author: { name: "Elnur Zeinolla", avatar: "https://ui-avatars.com/api/?name=E+Z&background=0D8ABC&color=fff" }
  },
  {
    id: 2,
    title: "React & Framer Motion: Ultra UI",
    category: "Frontend",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
    rating: 4.8,
    duration: 35,
    lessons: 18,
    author: { name: "Alexander Smith", avatar: "https://ui-avatars.com/api/?name=A+S&background=6366f1&color=fff" }
  },
  {
    id: 3,
    title: "Windows Server 2026 & Active Directory",
    category: "DevOps",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2026&auto=format&fit=crop",
    rating: 4.7,
    duration: 28,
    lessons: 12,
    author: { name: "Dmitry Adminov", avatar: "https://ui-avatars.com/api/?name=D+A&background=f43f5e&color=fff" }
  }
];

const HomePage = ({ courses = FAKE_COURSES, toggleFavorite, favorites = [] }) => {
  const [activeTab, setActiveTab] = useState('All');
  const { scrollY } = useScroll();
  
  // Параллакс эффект для персонажа
  const yPos = useTransform(scrollY, [0, 500], [0, 100]);

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const categories = ['All', 'Frontend', 'Backend', 'DevOps'];
  const displayCourses = activeTab === 'All' 
    ? courses.slice(0, 9) 
    : courses.filter(c => c.category === activeTab).slice(0, 9);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-24 pb-60 overflow-hidden bg-indigo-700">
        {/* Фновые слои */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-700 to-blue-800" />
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
                        backgroundSize: '40px 40px' }} />
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-48 -left-48 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[140px]" 
          />
        </div>

        <div className="max-w-[1440px] mx-auto px-8 relative z-20">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative">
            
            {/* Текстовый контент */}
            <motion.div className="flex-[1.2] text-center lg:text-left" variants={containerVars} initial="hidden" animate="visible">
              <motion.div variants={itemVars} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl mb-8">
                <Sparkles size={16} className="text-yellow-400" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Образовательная экосистема</span>
              </motion.div>

              <motion.h1 variants={itemVars} className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                Твой путь к <br /> <span className="text-yellow-400 italic drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]">мастерству.</span>
              </motion.h1>

              <motion.p variants={itemVars} className="text-lg text-blue-100 font-medium max-w-xl mb-12 mx-auto lg:mx-0 leading-relaxed opacity-90">
                От программирования и системного администрирования до истории и культуры. Получай актуальные знания в одной экосистеме.
              </motion.p>

              <motion.div variants={itemVars} className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link to="/courses" className="px-10 py-5 bg-white text-indigo-700 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-yellow-400 hover:text-indigo-900 transition-all shadow-2xl flex items-center gap-3 group">
                  Начать обучение <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-10 py-5 bg-white/5 border border-white/20 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-white/10 backdrop-blur-sm transition-all flex items-center gap-3">
                  <BookOpen size={18} /> База знаний
                </button>
              </motion.div>
            </motion.div>

            {/* Правая часть (Tech Cards) */}
            <motion.div className="flex-1 relative" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="space-y-6 pt-12">
                   <TechCard icon={<Cpu />} title="Технологии" delay={0.2} />
                   <TechCard icon={<Palette />} title="Дизайн" delay={0.4} />
                </div>
                <div className="space-y-6">
                   <TechCard icon={<Compass />} title="Туризм" delay={0.6} />
                   <TechCard icon={<History />} title="Культура" delay={0.8} />
                </div>
                <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400 rounded-[2.5rem] shadow-[0_20px_50px_rgba(250,204,21,0.5)] flex items-center justify-center p-6 z-40 border-[6px] border-indigo-700"
                >
                   <GraduationCap size={64} className="text-indigo-900" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ПЕРСОНАЖ (Z-10 — между фоном и контентом для глубины) */}
        <motion.div 
          style={{ y: yPos }}
          className="absolute left-[45%] bottom-[-50px] -translate-x-1/2 hidden xl:block z-10 pointer-events-none"
        >
          <img 
            src="/images/back.png" 
            alt="3D Student"
            className="w-[650px] h-auto drop-shadow-[0_45px_45px_rgba(0,0,0,0.5)]"
          />
        </motion.div>

        {/* ПЕРЕХОД: SVG Wave / Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-30">
          <svg className="relative block w-full h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.11,1200,0V120H0Z" fill="#F8FAFC"></path>
          </svg>
        </div>
      </section>

      {/* --- 2. COURSES SECTION --- */}
      <section className="relative py-24 bg-[#F8FAFC]">
        <div className="max-w-[1440px] mx-auto px-8">
          {/* Хедер секции с анимацией появления при скролле */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8"
          >
            <div className="relative">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '80px' }}
                className="h-1.5 bg-indigo-600 mb-6 rounded-full"
              />
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                Популярные курсы
              </h2>
              <div className="flex items-center gap-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <span className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />)}
                </span>
                более 2000 активных студентов
              </div>
            </div>
            
            <div className="flex bg-white shadow-xl shadow-indigo-100 p-2 rounded-[2rem] self-start border border-slate-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === cat 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                      : 'text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Сетка курсов */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16"
          >
            {displayCourses.map((course) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={course.id}
              >
                <CourseCard 
                  course={course} 
                  toggleFavorite={toggleFavorite} 
                  isFavorite={favorites?.includes(course.id)} 
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Футер секции */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-28 p-12 bg-indigo-50 rounded-[3rem] border border-indigo-100 flex flex-col items-center text-center"
          >
            <h3 className="text-2xl font-black text-indigo-900 mb-4">Не нашли подходящий курс?</h3>
            <p className="text-indigo-600/70 font-medium mb-8 max-w-lg">
              Наша библиотека обновляется каждую неделю. Подпишитесь, чтобы первыми узнавать о новых направлениях.
            </p>
            <Link to="/courses" className="inline-flex items-center gap-4 bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 group">
              Весь каталог <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const TechCard = ({ icon, title, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 flex flex-col items-center gap-4 text-center group hover:bg-indigo-500/30 transition-all shadow-2xl hover:-translate-y-2"
  >
    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-inner group-hover:bg-yellow-400 group-hover:text-indigo-900 transition-colors">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <span className="text-sm font-black text-white uppercase tracking-tighter">{title}</span>
  </motion.div>
);

export default HomePage;