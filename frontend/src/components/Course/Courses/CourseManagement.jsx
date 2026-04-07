import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, BookOpen, Layers, GraduationCap, 
  ChevronRight, Loader2, Trash2, Edit2, X, 
  CheckCircle2, Clock, PlayCircle, BarChart3,
  ArrowRight, Filter, MoreVertical, Globe,
  User
} from 'lucide-react';
import api from '../../../api/axios';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const StatCard = ({ icon: Icon, label, value, colorClass, description, isPrimary, unit = "ед." }) => (
  <div className={`bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md ${isPrimary ? 'ring-1 ring-blue-600/10' : ''}`}>
    <div className={`absolute top-0 left-0 w-1 h-full ${isPrimary ? 'bg-blue-600' : 'bg-slate-200'}`} />
    <div className="flex justify-between items-start mb-3 md:mb-4">
      <div className="space-y-1 text-left">
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
        </div>
      </div>
      <div className={`p-2 md:p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={16} className="md:w-[18px] md:h-[18px]" />
      </div>
    </div>
    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight text-left leading-tight">{description}</p>
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-[120px] bg-white border border-slate-100 rounded-2xl w-full" />
    ))}
  </div>
);

// --- ОСНОВНОЙ КОМПОНЕНТ ---

const CourseManagement = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({ total: 0, active: 0, drafts: 0, students_count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [options, setOptions] = useState({ categories: [], teachers: [] });
  
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '', user_id: '',
    level: 'beginner', status: 'draft', price: 0, image: null
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/courses', {
        params: { page: currentPage, search: searchTerm, category: selectedCategory }
      });
      if (response.data.status === 'success') {
        setCourses(response.data.data);
        setMeta(response.data.meta);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/admin/helpers/options'); // Используем ваш HelperController
      setOptions({
        categories: res.data.categories,
        teachers: res.data.teachers || [] // Если добавите список ППС в хелпер
      });
    } catch (e) { console.error(e); }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', category_id: '', user_id: '', level: 'beginner', status: 'draft', price: 0 });
    setIsModalOpen(true);
    fetchOptions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить курс и все связанные материалы?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingId ? `/admin/courses/${editingId}` : `/admin/courses`;
      const method = editingId ? 'put' : 'post';
      await api[method](url, formData);
      setIsModalOpen(false);
      fetchCourses();
    } catch (e) {
      alert(e.response?.data?.message || "Ошибка сохранения");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto px-4 md:px-10 py-6 md:py-10 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10 text-left">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tighter uppercase">Управление курсами</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Создание и модерация образовательного контента</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={18} />
          Создать курс
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard label="Всего курсов" value={stats.total} icon={BookOpen} colorClass="bg-slate-100 text-slate-600" description="Общий объем" unit="кур." />
        <StatCard label="Активные" value={stats.active} icon={PlayCircle} colorClass="bg-emerald-50 text-emerald-600" description="Опубликовано" isPrimary={true} unit="кур." />
        <StatCard label="Черновики" value={stats.drafts} icon={Clock} colorClass="bg-amber-50 text-amber-600" description="В разработке" unit="кур." />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по названию или автору..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-[260px]">
           <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <select 
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none shadow-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            {options.categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" size={16} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative">
        {loading && courses.length === 0 ? (
          <ListSkeleton />
        ) : courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                       {course.image ? (
                         <img src={course.image} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <BookOpen size={24} className="text-slate-300" />
                       )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${course.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {course.status === 'published' ? 'Опубликован' : 'Черновик'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          ID: {course.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tighter truncate leading-tight">{course.title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <span className="flex items-center gap-1.5"><Layers size={12}/> {course.category_name}</span>
                        <span className="flex items-center gap-1.5"><User size={12}/> {course.author_name}</span>
                        <span className="flex items-center gap-1.5"><BarChart3 size={12}/> {course.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Студентов</p>
                      <p className="text-sm font-black text-slate-900">{course.students_count || 0}</p>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                      <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(course.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
            <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="font-bold text-slate-400 uppercase text-xs">Курсы не найдены</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl max-h-[95vh] rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative text-left">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-10 p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={20} />
            </button>

            <div className="p-6 md:p-8 pb-4 border-b border-slate-50">
              <h3 className="text-xl font-bold text-slate-900 tracking-tighter uppercase">
                {editingId ? 'Редактирование курса' : 'Новый учебный курс'}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Заполнение основной информации</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Название курса</label>
                  <input 
                    type="text" required 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Категория</label>
                    <select 
                      required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      value={formData.category_id}
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      <option value="">Выберите категорию...</option>
                      {options.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Уровень</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      value={formData.level}
                      onChange={e => setFormData({...formData, level: e.target.value})}
                    >
                      <option value="beginner">Начальный</option>
                      <option value="intermediate">Средний</option>
                      <option value="advanced">Продвинутый</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Описание курса</label>
                  <textarea 
                    rows="4"
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none resize-none focus:bg-white focus:border-blue-500"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Отмена</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>{editingId ? 'Обновить данные' : 'Создать курс'} <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CourseManagement;