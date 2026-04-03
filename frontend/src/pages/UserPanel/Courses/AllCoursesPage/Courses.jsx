import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, BookOpen, Clock, ArrowRight, Check, 
  LayoutGrid, Heart, Star, Flame, FilterX 
} from 'lucide-react';
import api from '../../../../api/axios';
import { CourseCard } from '../../../../components/Course/CourseCard/CourseCard';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedLevel, setSelectedLevel] = useState('Все');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  const categories = ['Все', 'Backend', 'Frontend', 'System Admin', 'Design', 'Mobile', 'DevOps'];
  const levels = ['Все', 'Новичок', 'Средний', 'Продвинутый'];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get('/courses'); 
        setCourses(response.data);
      } catch (error) {
        // Фоллбек на мок-данные
        const mockData = Array.from({ length: 48 }).map((_, i) => ({
          id: i,
          title: [
            'Mastering Laravel 11: Архитектура систем',
            'React + Next.js: Полный гид по SSR',
            'Администрирование Linux & Docker',
            'UI/UX Design: От вайрфреймов до прототипа',
            'Golang для высоконагруженных систем',
            'Python & Django: Построение API'
          ][i % 6],
          category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
          level: levels[Math.floor(Math.random() * (levels.length - 1)) + 1],
          duration: Math.floor(Math.random() * 60) + 5,
          lessons: Math.floor(Math.random() * 40) + 10,
          rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1),
          isHot: i % 7 === 0,
          isNew: i % 10 === 0,
          author: {
            name: ['Зейнолла Елнұр', 'Арман Ибраев', 'Алиса Власова'][i % 3],
            avatar: `https://i.pravatar.cc/150?u=${i}`
          },
          image: `https://picsum.photos/seed/${i + 50}/800/600`
        }));
        setCourses(mockData);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Все' || course.category === selectedCategory;
      const matchesLvl = selectedLevel === 'Все' || course.level === selectedLevel;
      return matchesSearch && matchesCat && matchesLvl;
    });

    if (sortBy === 'duration') result.sort((a, b) => b.duration - a.duration);
    if (sortBy === 'new') result.sort((a, b) => b.isNew - a.isNew);
    
    return result;
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy]);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const resetFilters = () => {
    setSelectedCategory('Все');
    setSelectedLevel('Все');
    setSearchQuery('');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 py-8">
        
        {/* Заголовок страницы и быстрый поиск */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 text-left">Каталог курсов</h1>
            <p className="text-slate-500 font-medium">Выбирайте направление и прокачивайте свои навыки</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Найти курс..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-600/20 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-10">
          
          {/* --- SIDEBAR FILTERS --- */}
          <aside className="w-full xl:w-72 shrink-0">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200/60 sticky top-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Настройка выдачи</h3>
                {(selectedCategory !== 'Все' || selectedLevel !== 'Все' || searchQuery !== '') && (
                  <button onClick={resetFilters} className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
                    <FilterX size={14} /> Сброс
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-10">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm text-[11px] uppercase tracking-wider">
                  <LayoutGrid size={14} className="text-blue-600" /> Направления
                </h4>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                      {selectedCategory === cat && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <h4 className="font-bold text-slate-900 mb-4 text-[11px] uppercase tracking-wider">Уровень сложности</h4>
                <div className="grid grid-cols-1 gap-2">
                  {levels.map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                        selectedLevel === lvl ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredCourses.length} курсов найдено</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase">Сортировать:</span>
                <select 
                  className="text-xs font-black bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-50 cursor-pointer shadow-sm"
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
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[460px] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredCourses.slice(0, visibleCount).map((course) => (
                    <CourseCard 
                    key={course.id} 
                    course={course} 
                    toggleFavorite={toggleFavorite} 
                    isFavorite={favorites.includes(course.id)} 
                    />
                ))}
                </div>

                {/* Load More */}
                {filteredCourses.length > visibleCount && (
                  <div className="mt-16 text-center">
                    <button 
                      onClick={() => setVisibleCount(v => v + 12)}
                      className="px-10 py-4 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-900 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                    >
                      Показать еще
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && filteredCourses.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                <Search size={48} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-900">Ничего не найдено</h3>
                <p className="text-slate-400 mt-2 font-medium">Попробуйте сбросить фильтры</p>
                <button onClick={resetFilters} className="mt-8 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">Сбросить всё</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;