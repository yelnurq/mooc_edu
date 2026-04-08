import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, Check, LayoutGrid, FilterX, 
  ChevronRight, Tag, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

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
  const [allCoursesBackup, setAllCoursesBackup] = useState([]);

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

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

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
        
   

        {/* HEADER */}
        <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 style={{fontWeight:500}} className="text-5xl md:text-5xl text-slate-900 tracking-tighter mb-4 ">
              Направления обучения
            </h1>
            <p className="text-slate-500 font-medium max-w-md leading-relaxed border-l-4 border-blue-600 pl-4">
              Выберите подходящую специализацию и начните профессиональный путь уже сегодня.
            </p>
          </div>
          
          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ПОИСК ПО НАЗВАНИЮ..." 
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-xl focus:ring-0 focus:border-blue-600 transition-all font-bold text-xs shadow-sm uppercase tracking-wider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-12">
          
          {/* SIDEBAR */}
          <aside className="w-full xl:w-80 shrink-0">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} className="text-blue-600" />
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Категории</h3>
                </div>
                {(selectedCategory !== 'Все' || searchQuery !== '') && (
                  <button onClick={resetFilters} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Сброс</button>
                )}
              </div>

              <div className="relative mb-6">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="ФИЛЬТР..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold outline-none focus:border-blue-200 transition-all uppercase tracking-widest"
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
                      style={{fontWeight:500}}
                      className={`text-left font-sans w-full flex items-center justify-between px-4 py-4 rounded-xl text-[13px] transition-all group ${
                        selectedCategory === catName 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Tag size={14} className={selectedCategory === catName ? 'text-blue-200' : 'text-slate-300 group-hover:text-blue-400'} />
                        {catName}
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
              <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
                <div className={`w-3 h-3 rounded-sm ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[12px] font-black text-slate-500">
                  {courses.length} программ доступно
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Сортировка:</span>
                <select 
                  className="bg-white border border-slate-200 rounded-xl px-6 py-3 text-[11px] font-black uppercase outline-none cursor-pointer hover:border-blue-600 transition-all appearance-none shadow-sm"
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
                  <div key={i} className="h-[480px] bg-white rounded-2xl animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : (
              <>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode='popLayout'>
                    {courses.slice(0, visibleCount).map((course) => (
                      <motion.div
                        layout
                        variants={itemVariants}
                        exit={{ opacity: 0, scale: 0.98 }}
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
                </motion.div>

                {/* Empty State */}
                {!loading && courses.length === 0 && (
                  <div className="space-y-16 py-10">
                    <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm px-10 max-w-4xl mx-auto">
                      <FilterX size={48} className="mx-auto mb-8 text-slate-200" />
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Ничего не найдено</h3>
                      <p className="text-slate-400 mt-4 font-medium max-w-xs mx-auto">Попробуйте изменить параметры запроса или категорию обучения</p>
                      <button onClick={resetFilters} className="mt-10 bg-blue-600 text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Сбросить всё</button>
                    </div>

                    {allCoursesBackup.length > 0 && (
                      <div className="space-y-10">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 shrink-0 bg-blue-50 px-5 py-3 rounded-lg border border-blue-100">
                            <Sparkles size={16} className="text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Популярные направления</span>
                          </div>
                          <div className="h-px w-full bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
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
                  className="group relative inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl"
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