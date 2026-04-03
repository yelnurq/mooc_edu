import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Play, Code2, Database, ShieldCheck, Cpu, 
  Sparkles, GraduationCap, Users, BookOpen, Star, 
  Palette,
  Compass,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard } from '../../../components/Course/CourseCard/CourseCard';

// 9 Курсов для сочной сетки
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
  },
  {
    id: 4,
    title: "Fullstack Next.js 14 & Prisma",
    category: "Frontend",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=2070&auto=format&fit=crop",
    rating: 4.9,
    duration: 50,
    lessons: 32,
    author: { name: "Sarah Connor", avatar: "https://ui-avatars.com/api/?name=S+C&background=ec4899&color=fff" }
  },
  {
    id: 5,
    title: "Docker & Kubernetes for Developers",
    category: "DevOps",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2006&auto=format&fit=crop",
    rating: 4.6,
    duration: 20,
    lessons: 15,
    author: { name: "Linus Tech", avatar: "https://ui-avatars.com/api/?name=L+T&background=10b981&color=fff" }
  },
  {
    id: 6,
    title: "PostgreSQL: Advanced Optimization",
    category: "Backend",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop",
    rating: 4.8,
    duration: 15,
    lessons: 10,
    author: { name: "Michael Stone", avatar: "https://ui-avatars.com/api/?name=M+S&background=3b82f6&color=fff" }
  },
  {
    id: 7,
    title: "Modern UI/UX Design Fundamentals",
    category: "Design",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    rating: 4.9,
    duration: 30,
    lessons: 22,
    author: { name: "Jane Doe", avatar: "https://ui-avatars.com/api/?name=J+D&background=f59e0b&color=fff" }
  },
  {
    id: 8,
    title: "Ethical Hacking & Network Security",
    category: "DevOps",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    rating: 4.7,
    duration: 45,
    lessons: 28,
    author: { name: "Anonymous", avatar: "https://ui-avatars.com/api/?name=X&background=000&color=fff" }
  },
  {
    id: 9,
    title: "React Native: iOS & Android Apps",
    category: "Frontend",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
    rating: 4.8,
    duration: 38,
    lessons: 21,
    author: { name: "Steve Jobless", avatar: "https://ui-avatars.com/api/?name=S+J&background=8b5cf6&color=fff" }
  }
];

const HomePage = ({ courses = FAKE_COURSES, toggleFavorite, favorites = [] }) => {
  const [activeTab, setActiveTab] = useState('All');

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
      {/* --- 1. HERO SECTION WITH VIBRANT BACKGROUND --- */}
     <section className="relative pt-24 pb-44 overflow-hidden bg-indigo-700">
  {/* --- СЛОИ УЗОРОВ И ФОНА --- */}
  <div className="absolute inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-700 to-blue-800" />
    
    {/* Сетка и точки (универсальный технологичный стиль) */}
    <div className="absolute inset-0 opacity-10" 
         style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
                  backgroundSize: '40px 40px' }} />
    <div className="absolute inset-0 opacity-20" 
         style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' }} />

    {/* Динамические пятна */}
    <motion.div 
      animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-48 -left-48 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[140px]" 
    />
  </div>

  {/* --- КОНТЕНТ --- */}
  <div className="max-w-[1440px] mx-auto px-8 relative z-10">
    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
      
      <motion.div className="flex-[1.2] text-center lg:text-left" variants={containerVars} initial="hidden" animate="visible">
        <motion.div variants={itemVars} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl mb-8">
          <Sparkles size={16} className="text-yellow-400" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Образовательная экосистема</span>
        </motion.div>

        <motion.h1 variants={itemVars} className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
          Твой путь к <br /> <span className="text-yellow-400 italic drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]">мастерству.</span>
        </motion.h1>

        <motion.p variants={itemVars} className="text-lg text-blue-100 font-medium max-w-xl mb-12 mx-auto lg:mx-0 leading-relaxed opacity-90">
          От программирования и системного администрирования до истории, туризма и культуры. Получай актуальные знания в любой сфере.
        </motion.p>

        {/* Stats Block */}
        <motion.div variants={itemVars} className="flex flex-wrap justify-center lg:justify-start gap-10 mb-12">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-white">25+</span>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em]">Направлений</span>
          </div>
          <div className="w-px h-12 bg-white/20 hidden sm:block" />
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-white">120+</span>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em]">Курсов</span>
          </div>
          <div className="w-px h-12 bg-white/20 hidden sm:block" />
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-white">4.9</span>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em]">Рейтинг</span>
          </div>
        </motion.div>

        <motion.div variants={itemVars} className="flex flex-wrap justify-center lg:justify-start gap-4">
          <Link to="/courses" className="px-10 py-5 bg-white text-indigo-700 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-yellow-400 hover:text-indigo-900 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center gap-3 group">
            Начать обучение <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-10 py-5 bg-white/5 border border-white/20 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-white/10 backdrop-blur-sm transition-all flex items-center gap-3">
            <BookOpen size={18} /> База знаний
          </button>
        </motion.div>
      </motion.div>

      {/* Правая часть — теперь категории более общие */}
      <motion.div className="flex-1 relative" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
        <div className="grid grid-cols-2 gap-6 relative">
          <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-[100px] -z-10" />
          
          <div className="space-y-6 pt-12">
             {/* Вместо кода — разработка, вместо базы данных — аналитика или история */}
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400 rounded-[2.5rem] shadow-[0_20px_50px_rgba(250,204,21,0.5)] flex items-center justify-center p-6 z-10 border-[6px] border-indigo-700 cursor-pointer"
          >
             <GraduationCap size={64} className="text-indigo-900" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
</section>

      {/* --- 2. COURSES SECTION --- */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Популярные курсы</h2>
              <p className="text-slate-500 font-medium italic">Выбирай направление и начни обучение сегодня</p>
            </div>
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12"
          >
            {displayCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                toggleFavorite={toggleFavorite} 
                isFavorite={favorites?.includes(course.id)} 
              />
            ))}
          </motion.div>

          <div className="mt-24 text-center">
            <Link to="/courses" className="inline-flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-[0.2em] hover:text-indigo-600 transition-colors group">
              Смотреть все курсы <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Вспомогательный компонент для карточек технологий в Hero
const TechCard = ({ icon, title, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 flex flex-col items-center gap-4 text-center group hover:bg-white/20 transition-all shadow-2xl"
  >
    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-inner">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <span className="text-sm font-black text-white uppercase tracking-tighter">{title}</span>
  </motion.div>
);

export default HomePage;