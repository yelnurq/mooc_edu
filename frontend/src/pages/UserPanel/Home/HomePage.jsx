import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Sparkles, BookOpen, 
  LayoutGrid, ChevronRight, GraduationCap,
  Globe, Palette, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard } from '../../../components/Course/CourseCard/CourseCard';

const FAKE_COURSES = [
  // --- РАЗРАБОТКА (3 курса) ---
  {
    id: 1,
    title: "Mastering Laravel Enterprise Architecture",
    category: "Разработка",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
    rating: 4.9,
    duration: 42,
    lessons: 24,
    author: { name: "Elnur Zeinolla", avatar: "https://ui-avatars.com/api/?name=E+Z&background=0D8ABC&color=fff" }
  },
  {
    id: 101,
    title: "React & Next.js: Построение высоконагруженных систем",
    category: "Разработка",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070",
    rating: 4.8,
    duration: 38,
    lessons: 20,
    author: { name: "Алексей Иванов", avatar: "https://ui-avatars.com/api/?name=A+I&background=6366f1&color=fff" }
  },
  {
    id: 102,
    title: "Python для Data Science и анализа данных",
    category: "Разработка",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070",
    rating: 4.7,
    duration: 56,
    lessons: 32,
    author: { name: "Мария Кюри", avatar: "https://ui-avatars.com/api/?name=M+C&background=10b981&color=fff" }
  },

  // --- ДИЗАЙН (3 курса) ---
  {
    id: 4,
    title: "Промышленный дизайн: от эскиза до прототипа",
    category: "Дизайн",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=2070",
    rating: 5.0,
    duration: 30,
    lessons: 15,
    author: { name: "Арман Кумар", avatar: "https://ui-avatars.com/api/?name=A+K&background=f43f5e&color=fff" }
  },
  {
    id: 401,
    title: "UI/UX Стратегия: Проектирование сложных интерфейсов",
    category: "Дизайн",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2070",
    rating: 4.9,
    duration: 45,
    lessons: 22,
    author: { name: "Лиза Ветрова", avatar: "https://ui-avatars.com/api/?name=L+V&background=8b5cf6&color=fff" }
  },
  {
    id: 402,
    title: "Брендинг и типографика: Современный подход",
    category: "Дизайн",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?q=80&w=2070",
    rating: 4.8,
    duration: 25,
    lessons: 12,
    author: { name: "Игорь Графика", avatar: "https://ui-avatars.com/api/?name=I+G&background=ec4899&color=fff" }
  },

  // --- ИСТОРИЯ (3 курса) ---
  {
    id: 5,
    title: "История кочевников Великой степи",
    category: "История",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2070",
    rating: 4.9,
    duration: 20,
    lessons: 10,
    author: { name: "Данияр Касымов", avatar: "https://ui-avatars.com/api/?name=D+K&background=6366f1&color=fff" }
  },
  {
    id: 501,
    title: "Архитектура античного мира: От Греции до Рима",
    category: "История",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1515542641795-03e2231c5d73?q=80&w=2070",
    rating: 4.8,
    duration: 18,
    lessons: 8,
    author: { name: "Елена Антика", avatar: "https://ui-avatars.com/api/?name=E+A&background=94a3b8&color=fff" }
  },
  {
    id: 502,
    title: "Эпоха Возрождения: Искусство и Философия",
    category: "История",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1543857182-68106299b6b2?q=80&w=2070",
    rating: 5.0,
    duration: 34,
    lessons: 14,
    author: { name: "Сандро Ботичелли", avatar: "https://ui-avatars.com/api/?name=S+B&background=d97706&color=fff" }
  },

  // --- DEVOPS (3 курса) ---
  {
    id: 3,
    title: "Windows Server 2026 & Active Directory",
    category: "DevOps",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2026",
    rating: 4.7,
    duration: 28,
    lessons: 12,
    author: { name: "Dmitry Adminov", avatar: "https://ui-avatars.com/api/?name=D+A&background=fbbf24&color=fff" }
  },
  {
    id: 301,
    title: "Kubernetes в продакшене: Zero Downtime",
    category: "DevOps",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1667372333374-0d7018328219?q=80&w=2070",
    rating: 4.9,
    duration: 40,
    lessons: 18,
    author: { name: "Серик Кубер", avatar: "https://ui-avatars.com/api/?name=S+K&background=0284c7&color=fff" }
  },
  {
    id: 302,
    title: "Terraform: Инфраструктура как код (IaC)",
    category: "DevOps",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
    rating: 4.8,
    duration: 22,
    lessons: 10,
    author: { name: "Ivan Cloud", avatar: "https://ui-avatars.com/api/?name=I+C&background=4f46e5&color=fff" }
  }
];

const HomePage = ({ courses = FAKE_COURSES, toggleFavorite, favorites = [] }) => {
  const { scrollY } = useScroll();
  const yPos = useTransform(scrollY, [0, 500], [0, 100]);

  // Список категорий для отображения на главной
  const categoryConfig = [
    { name: 'Разработка', icon: <Zap size={20} /> },
    { name: 'История', icon: <Globe size={20} /> },
    { name: 'Дизайн', icon: <Palette size={20} /> },
    { name: 'DevOps', icon: <LayoutGrid size={20} /> }
  ];

  const groupedCourses = categoryConfig.map(cat => ({
    ...cat,
    items: courses.filter(c => c.category === cat.name).slice(0, 3)
  }));

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-24 pb-60 overflow-hidden bg-blue-700">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-800" />
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
            <motion.div className="flex-[1.2] text-center lg:text-left" variants={containerVars} initial="hidden" animate="visible">
              <motion.div variants={itemVars} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-[0.7rem] border border-white/20 shadow-xl mb-8">
                <GraduationCap size={16} className="text-yellow-400" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Мультидисциплинарная платформа</span>
              </motion.div>

              <motion.h1 variants={itemVars} className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                Знания без <br /> <span className="text-yellow-400 italic drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]">границ.</span>
              </motion.h1>

              <motion.p variants={itemVars} className="text-lg text-blue-100 font-medium max-w-xl mb-12 mx-auto lg:mx-0 leading-relaxed opacity-90">
                Исследуйте мир — от фундаментальной истории до передовых технологий. Мы объединили лучшие курсы для всестороннего развития личности.
              </motion.p>

              <motion.div variants={itemVars} className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link to="/courses" className="px-10 py-5 bg-white text-blue-700 rounded-[1rem] font-black uppercase text-xs tracking-widest hover:bg-yellow-400 hover:text-blue-900 transition-all shadow-2xl flex items-center gap-3 group">
                  Начать учиться <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-10 py-5 bg-white/5 border border-white/20 text-white rounded-[1rem] font-black uppercase text-xs tracking-widest hover:bg-white/10 backdrop-blur-sm transition-all flex items-center gap-3">
                  <BookOpen size={18} /> Публичная библиотека
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          style={{ y: yPos }}
          className="absolute left-[50%] bottom-[20px] -translate-x-1/2 hidden xl:block z-10 pointer-events-none"
        >
          <img 
            src="/images/back.png" 
            alt="3D Student"
            className="w-[800px] h-auto drop-shadow-[0_45px_45px_rgba(0,0,0,0.5)]"
          />
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-30">
          <svg className="relative block w-full h-[120px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.11,1200,0V120H0Z" fill="#F8FAFC"></path>
          </svg>
        </div>
      </section>

      {/* --- 2. COURSES SECTION BY CATEGORY --- */}
{/* --- 2. COURSES SECTION BY CATEGORY --- */}
<section className="relative py-24 bg-[#F8FAFC]">
  <div className="max-w-[1440px] mx-auto px-8">
    
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-20"
    >
   
      <h2 className="text-5xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
        Чему вы научитесь сегодня?
      </h2>
      <div className="flex justify-center flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-blue-900 font-black uppercase text-[10px] tracking-widest">
            В каталоге доступно более 1000 курсов
          </p>
        </div>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest ml-2">
          • 24 образовательных направления
        </p>
      </div>
    </motion.div>

    {/* Основные группы с карточками */}
    <div className="space-y-16">
      {groupedCourses.map((group) => (
        group.items.length > 0 && (
          <div key={group.name} className="relative">
            <div className="flex items-center justify-between mb-10 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
                    {group.icon}
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {group.name}
                </h3>
              </div>
              <Link 
                to={`/courses?category=${group.name}`} 
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
              >
                Каталог раздела <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.items.map((course) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  key={course.id}
                >
                  <CourseCard 
                    course={course} 
                    toggleFavorite={toggleFavorite} 
                    isFavorite={favorites?.includes(course.id)} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>


  </div>
</section>
    <section className="relative">
      {/* 1. Сетка дополнительных категорий */}
  {/* 1. Сетка дополнительных категорий */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        /* max-w-[1440px] — ограничиваем ширину как у остального контента
           mx-auto — центрируем блок
           px-8 или px-12 — создаем отступ от краев экрана на мобилках и десктопе
           mb-16 — отступ до синего CTA блока
        */
        className="max-w-[1440px] mx-auto px-8 mb-16"
      >
        {/* Внутренняя обертка с фоном или просто структура */}
        <div className="bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-1 bg-blue-600 rounded-full" />
                <span className="text-blue-600 font-black uppercase text-[10px] tracking-[0.2em]">Разнообразие</span>
              </div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tight">И еще десятки направлений</h4>
            </div>
            <p className="text-slate-500 font-medium max-w-md md:text-right">
              Найдите свою нишу среди сотен узкоспециализированных тем, от квантовой физики до кулинарного искусства.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[
              'Маркетинг', 'Бизнес', 'Музыка', 'Фотография', 
              'Языки', 'Психология', 'Финансы', 'Кулинария',
              'Менеджмент', 'Архитектура', 'Право', 'Биология',
              'Кинематограф', 'Социология', 'Физика'
            ].map((cat) => (
              <Link 
                key={cat}
                to={`/courses?category=${cat}`}
                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              >
                <span className="font-bold text-slate-600 text-xs group-hover:text-blue-600">{cat}</span>
                <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
            
            <Link 
              to="/courses"
              className="flex items-center justify-center p-4 bg-slate-900 rounded-2xl hover:bg-blue-600 transition-all group"
            >
              <span className="font-bold text-white text-xs mr-2">Все категории</span>
              <LayoutGrid size={14} className="text-white/50 group-hover:rotate-90 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* --- 2. Акцентный CTA блок --- */}
<motion.div 
  initial={{ opacity: 0, scale: 0.95 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}

  className="relative bg-blue-600 rounded-t-[6rem] rounded-b-none p-12 lg:p-20 overflow-hidden shadow-2xl"
>
  {/* --- ДОБАВЛЕННЫЙ СЛОЙ С УЗОРОМ (как в Hero) --- */}
  <div 
    className="absolute inset-0 z-0 opacity-10" 
    style={{ 
      backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
      backgroundSize: '40px 40px' // Размер ячейки сетки
    }} 
  />
  {/* ---------------------------------------------- */}

  {/* Декоративные пятна (светящиеся круги) */}
  {/* z-10, чтобы быть поверх сетки */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse z-10" />
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -ml-32 -mb-32 z-10" />
  
  {/* Контентный блок */}
  {/* Убедитесь, что здесь стоит z-20 или выше, чтобы контент был поверх всего */}
  <div className="relative z-20 flex flex-col items-center text-center max-w-3xl mx-auto">
    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8">
      <span className="text-white text-[10px] font-black uppercase tracking-widest">Присоединяйтесь к сообществу</span>
    </div>
    
    <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
      Готовы совершить <br /> 
      <span className="text-yellow-400 italic">интеллектуальный прыжок?</span>
    </h2>
    
    <p className="text-blue-100 mb-12 text-lg opacity-90 font-medium leading-relaxed">
      Присоединяйтесь к 50,000+ студентов со всего мира. Начните обучение сегодня и получите доступ к закрытому чату экспертов.
    </p>
    
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
      <Link 
        to="/register" 
        className="w-full sm:w-auto px-12 py-6 bg-yellow-400 text-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:scale-105 transition-all shadow-xl shadow-black/10"
      >
        Создать аккаунт бесплатно
      </Link>
      <Link 
        to="/courses" 
        className="w-full sm:w-auto px-12 py-6 bg-blue-700/50 text-white border border-blue-400/30 backdrop-blur-sm rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all"
      >
        В каталог курсов
      </Link>
    </div>

    {/* Блок с аватарами */}
    <div className="mt-10 flex items-center gap-4">
      <div className="flex -space-x-3">
        {[1,2,3,4].map(i => (
          <img 
            key={i}
            className="w-8 h-8 rounded-full border-2 border-blue-600" 
            src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} 
            alt="Student" 
          />
        ))}
      </div>
      <span className="text-blue-200 text-xs font-bold tracking-tight">
        +42 человека присоединились сегодня
      </span>
    </div>
  </div>
</motion.div>
    </section>
    </div>
  );
};

export default HomePage;