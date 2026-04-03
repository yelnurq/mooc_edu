import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Play, Users, Star, 
  Code2, Database, ShieldCheck, Cpu, 
  Sparkles, GraduationCap, Search, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard } from '../../../components/Course/CourseCard/CourseCard';

const HomePage = ({ courses, toggleFavorite, favorites }) => {
  const [activeTab, setActiveTab] = useState('All');

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // Фильтруем топ-3 или топ-6 для главной
  const categories = ['All', 'Frontend', 'Backend', 'DevOps'];
  const displayCourses = activeTab === 'All' 
    ? courses.slice(0, 3) 
    : courses.filter(c => c.category === activeTab).slice(0, 3);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-indigo-100/50 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div className="flex-1 text-center lg:text-left" variants={containerVars} initial="hidden" animate="visible">
              <motion.div variants={itemVars} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Платформа нового поколения</span>
              </motion.div>

              <motion.h1 variants={itemVars} className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                Развивай навыки <br /> <span className="text-blue-600 italic">быстрее.</span>
              </motion.h1>

              <motion.p variants={itemVars} className="text-lg text-slate-500 font-medium max-w-xl mb-12 mx-auto lg:mx-0 leading-relaxed">
                От архитектуры Laravel до высоконагруженных систем на React. Практические курсы от экспертов индустрии.
              </motion.p>

              <motion.div variants={itemVars} className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link to="/courses" className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 group">
                  Каталог курсов <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3">
                  <Play size={18} className="fill-slate-900" /> Промо
                </button>
              </motion.div>
            </motion.div>

            <motion.div className="flex-1 relative" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
              <div className="grid grid-cols-2 gap-6 relative">
                <div className="space-y-6 pt-12">
                   <TechCard icon={<Code2 />} title="Frontend" color="bg-blue-500" delay={0.2} />
                   <TechCard icon={<Database />} title="Backend" color="bg-emerald-500" delay={0.4} />
                </div>
                <div className="space-y-6">
                   <TechCard icon={<ShieldCheck />} title="DevOps" color="bg-indigo-600" delay={0.6} />
                   <TechCard icon={<Cpu />} title="Sys Admin" color="bg-rose-500" delay={0.8} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center p-6 z-10">
                   <GraduationCap size={60} className="text-blue-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 2. STATS SECTION --- */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <StatItem icon={<Users />} count="15,000+" label="Студентов" />
            <StatItem icon={<Star />} count="4.9/5" label="Средний рейтинг" />
            <StatItem icon={<Code2 />} count="120+" label="Курсов" />
            <StatItem icon={<GraduationCap />} count="95%" label="Трудоустройство" />
          </div>
        </div>
      </section>

      {/* --- 3. COURSES SECTION --- */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Популярные курсы</h2>
              <p className="text-slate-500 font-medium italic">Наведи на карточку, чтобы посмотреть превью</p>
            </div>
            
            {/* Табы фильтрации */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Сетка курсов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                toggleFavorite={toggleFavorite} 
                isFavorite={favorites.includes(course.id)} 
              />
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link to="/courses" className="inline-flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-[0.2em] hover:text-blue-600 transition-colors group">
              Смотреть все курсы <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Вспомогательные компоненты (оставляем без изменений)
const TechCard = ({ icon, title, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center gap-4 text-center group hover:border-blue-200 transition-all"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{title}</span>
  </motion.div>
);

const StatItem = ({ icon, count, label }) => (
  <div className="flex flex-col items-center text-center gap-3">
    <div className="text-blue-600 bg-blue-50 p-4 rounded-2xl mb-2">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="text-3xl font-black text-slate-900 tracking-tighter">{count}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

export default HomePage;