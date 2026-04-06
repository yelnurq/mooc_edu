import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, Check, LayoutGrid, FilterX, 
  ChevronRight, Sparkles, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  const categories = [
    'Все', 'Backend', 'Frontend', 'System Admin', 'Design', 'Mobile', 
    'DevOps', 'Data Science', 'Marketing', 'Cybersecurity', 'QA Testing', 
    'GameDev', 'Project Management', 'Soft Skills', 'Blockchain'
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get('/courses'); 
        const dataFromDb = response.data.map(course => ({
          ...course,
          category: course.category || 'Backend',
          rating: course.rating || '5.0',
          lessons_count: course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
          author: course.author || { name: 'Администратор', avatar: 'https://i.pravatar.cc/150?u=admin' },
          image: course.image || `https://picsum.photos/seed/${course.id}/800/600`
        }));
        setCourses(dataFromDb);
      } catch (error) {
        console.error("Ошибка:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  const filteredCourses = useMemo(() => {
    let result = courses.filter(course => {
      const title = course.title || '';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Все' || course.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortBy === 'duration') result.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    if (sortBy === 'new') result.sort((a, b) => b.id - a.id);
    
    return result;
  }, [courses, searchQuery, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('Все');
    setSearchQuery('');
    setCategorySearch('');
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    /* Цвет фона: slate-50 (очень светлый серо-голубой) */
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
            
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Главная</span>
          <ChevronRight size={12} />
          <span className="text-slate-900">Каталог курсов</span>
        </nav>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>

      <h1 className="text-5xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4 text-left">
        Направления
      </h1>
      <p className="text-1xl text-slate-500 font-medium max-w-md leading-relaxed text-left">
        Выберите подходящую специализацию и начните обучение с экспертами индустрии уже сегодня.
      </p>
    </div>
          
          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Какой навык хотите освоить?" 
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200/50 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all font-bold text-sm shadow-sm placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-12">
          
          {/* --- SMART SIDEBAR --- */}
          <aside className="w-full xl:w-80 shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 sticky top-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} className="text-indigo-600" />
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Категории</h3>
                </div>
                {selectedCategory !== 'Все' && (
                  <button onClick={resetFilters} className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-all">
                    Сброс
                  </button>
                )}
              </div>

              <div className="relative mb-6">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Быстрый поиск..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>

              {/* Скролл-зона категорий */}
              <div className="max-h-[460px] overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black transition-all group ${
                      selectedCategory === cat 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Tag size={14} className={selectedCategory === cat ? 'text-indigo-200' : 'text-slate-300 group-hover:text-indigo-400'} />
                      {cat}
                    </span>
                    {selectedCategory === cat && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-200/50 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {filteredCourses.length} курсов найдено
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Сортировка</span>
                <select 
                  className="bg-white border border-slate-200 rounded-2xl px-6 py-3 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer shadow-sm hover:border-indigo-200 transition-all appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Популярные</option>
                  <option value="new">Новинки</option>
                  <option value="duration">Длительность</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[480px] bg-white/50 rounded-[3rem] animate-pulse border border-slate-200/60" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                  {filteredCourses.slice(0, visibleCount).map((course) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={course.id}
                    >
                      <CourseCard 
                        course={course} 
                        toggleFavorite={toggleFavorite} 
                        isFavorite={favorites.includes(course.id)} 
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Load More */}
            {filteredCourses.length > visibleCount && (
              <div className="mt-20 text-center">
                <button 
                  onClick={() => setVisibleCount(v => v + 12)}
                  className="group relative inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-600 hover:-translate-y-1 transition-all shadow-xl shadow-slate-200"
                >
                  Показать еще
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredCourses.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-200/60 shadow-sm px-10">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <FilterX size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ничего не нашлось</h3>
                <p className="text-slate-400 mt-4 font-medium max-w-xs mx-auto">Попробуйте изменить категорию или поисковый запрос</p>
                <button onClick={resetFilters} className="mt-10 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Сбросить фильтры</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;