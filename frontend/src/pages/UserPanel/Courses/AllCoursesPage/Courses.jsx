import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, Check, LayoutGrid, FilterX, 
  ChevronRight, Tag, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  // Рекомендованные курсы (первые 3 из общего списка для Empty State)
  const [allCoursesBackup, setAllCoursesBackup] = useState([]);

  // 1. Загрузка категорий при старте
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setDbCategories(res.data);
      } catch (err) {
        console.error("Ошибка категорий:", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Основная функция загрузки данных
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/courses', {
        params: {
          search: searchQuery || null,
          category: selectedCategory !== 'Все' ? selectedCategory : null,
          sort: sortBy
        }
      });
      setCourses(response.data);
      
      // Сохраняем копию для рекомендаций, если поиск пустой
      if (selectedCategory === 'Все' && !searchQuery && allCoursesBackup.length === 0) {
        setAllCoursesBackup(response.data.slice(0, 3));
      }
      
      setVisibleCount(12);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, allCoursesBackup.length]);

  // 3. Дебаунс для поиска
  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  // Фильтрация списка категорий в сайдбаре (локальная)
  const filteredCategoriesSidebar = useMemo(() => {
    const list = ['Все', ...dbCategories.map(c => c.name)];
    return list.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categorySearch, dbCategories]);

  const resetFilters = () => {
    setSelectedCategory('Все');
    setSearchQuery('');
    setCategorySearch('');
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-[1640px] mx-auto px-6 lg:px-12 py-12">
        
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Главная</span>
          <ChevronRight size={12} />
          <span className="text-slate-900">Каталог курсов</span>
        </nav>

        {/* HEADER */}
        <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">
              Направления
            </h1>
            <p className="text-slate-500 font-medium max-w-md leading-relaxed">
              Выберите подходящую специализацию и начните обучение уже сегодня.
            </p>
          </div>
          
          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Поиск по названию курса..." 
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200/50 rounded-[2rem] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all font-bold text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-12">
          
          {/* SIDEBAR */}
          <aside className="w-full xl:w-80 shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 sticky top-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} className="text-blue-600" />
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Отделения</h3>
                </div>
                {(selectedCategory !== 'Все' || searchQuery !== '') && (
                  <button onClick={resetFilters} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-all">Сброс</button>
                )}
              </div>

              <div className="relative mb-6">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Найти отделение..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>

              <div className="max-h-[460px] overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredCategoriesSidebar.map(catName => {
                  const categoryObj = dbCategories.find(c => c.name === catName);
                  const count = catName === 'Все' ? (allCoursesBackup.length || courses.length) : (categoryObj?.courses_count || 0);

                  return (
                    <button
                      key={catName}
                      onClick={() => setSelectedCategory(catName)}
                      className={`text-left w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black transition-all group ${
                        selectedCategory === catName 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Tag size={14} className={selectedCategory === catName ? 'text-blue-200' : 'text-slate-300 group-hover:text-blue-400'} />
                        {catName}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-[9px] ${
                        selectedCategory === catName ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-200/50 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {courses.length} курсов найдено
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Сортировка</span>
                <select 
                  className="bg-white border border-slate-200 rounded-2xl px-6 py-3 text-[11px] font-black uppercase outline-none cursor-pointer hover:border-blue-200 transition-all appearance-none shadow-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Популярные</option>
                  <option value="new">Новинки</option>
                  <option value="duration">Длительность</option>
                </select>
              </div>
            </div>

            {loading && courses.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[480px] bg-white/50 rounded-[3rem] animate-pulse border border-slate-200/60" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                  <AnimatePresence mode='popLayout'>
                    {courses.slice(0, visibleCount).map((course) => (
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

                {/* Empty State + Рекомендации */}
                {!loading && courses.length === 0 && (
                  <div className="space-y-16 py-10">
                    <div className="py-24 text-center bg-white rounded-[4rem] border border-slate-200/60 shadow-sm px-10 max-w-4xl mx-auto">
                      <FilterX size={48} className="mx-auto mb-8 text-slate-200" />
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ничего не нашлось</h3>
                      <p className="text-slate-400 mt-4 font-medium max-w-xs mx-auto">Попробуйте изменить параметры поиска или категорию</p>
                      <button onClick={resetFilters} className="mt-10 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Сбросить всё</button>
                    </div>

                    {allCoursesBackup.length > 0 && (
                      <div className="space-y-10">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 shrink-0 bg-blue-50 px-5 py-2 rounded-full">
                            <Sparkles size={16} className="text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Возможно, вам понравится</span>
                          </div>
                          <div className="h-px w-full bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
                          {allCoursesBackup.map(course => (
                            <CourseCard key={`rec-${course.id}`} course={course} toggleFavorite={toggleFavorite} isFavorite={favorites.includes(course.id)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Load More */}
            {!loading && courses.length > visibleCount && (
              <div className="mt-20 text-center">
                <button 
                  onClick={() => setVisibleCount(v => v + 12)}
                  className="group relative inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-xl shadow-slate-200"
                >
                  Показать еще
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;