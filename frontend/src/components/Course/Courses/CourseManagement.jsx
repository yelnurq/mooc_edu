import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, BookOpen, Layers, GraduationCap, 
  ChevronRight, Loader2, Trash2, Edit2, X, 
  Clock, PlayCircle, ArrowRight, Filter, 
  User, Image as ImageIcon, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../../../api/axios';
import { Link } from 'react-router-dom';

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
    title: '', 
    description: '', 
    category_id: '', 
    user_id: '',
    level: 'beginner', 
    status: 'draft', 
    price: 0, 
    image: null
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
      const res = await api.get('/admin/helpers/options');
      setOptions({
        categories: res.data.categories || [],
        teachers: res.data.teachers || [] 
      });
    } catch (e) { console.error(e); }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ 
      title: '', description: '', category_id: '', 
      user_id: '', level: 'beginner', status: 'draft', 
      price: 0, image: null 
    });
    setIsModalOpen(true);
    fetchOptions();
  };

  const handleOpenEditModal = async (course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      category_id: course.category_id || '',
      user_id: course.user_id || '',
      level: course.level || 'beginner',
      status: course.status || 'draft',
      price: course.price || 0,
      image: null // Картинку не предзаполняем файлом, только если юзер выберет новую
    });
    setIsModalOpen(true);
    await fetchOptions();
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

    const data = new FormData();
    // Добавляем все поля в FormData
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (editingId) {
        // Laravel требует _method=PUT для multipart/form-data через POST
        data.append('_method', 'PUT');
        await api.post(`/admin/courses/${editingId}`, data);
      } else {
        await api.post(`/admin/courses`, data);
      }
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
        <StatCard label="Активные" value={stats.active} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" description="Опубликовано" isPrimary={true} unit="кур." />
        <StatCard label="Черновики" value={stats.drafts} icon={Clock} colorClass="bg-amber-50 text-amber-600" description="В разработке" unit="кур." />
        <StatCard label="Студенты" value={stats.students_count} icon={GraduationCap} colorClass="bg-purple-50 text-purple-600" description="Всего учеников" unit="чел." />
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
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      {course.image_url ? (
                        <img src={course.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <ImageIcon size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${course.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {course.status === 'active' ? 'Активен' : 'Черновик'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          ID: {course.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tighter truncate leading-tight">{course.title}</h4>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-slate-600 font-bold tracking-tighter uppercase"><Layers size={12} className="text-blue-500"/> {course.category?.name || course.category}</span>
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-slate-600 font-bold tracking-tighter uppercase"><User size={12} className="text-purple-500"/> {course.author?.name || course.author}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12}/> {course.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-4 md:gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-left lg:text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Сложность</p>
                      <p className="text-[10px] font-black text-slate-900 uppercase">{course.level}</p>
                    </div>
                    
                    <div className="text-left lg:text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Студентов</p>
                      <p className="text-xs font-black text-slate-900 flex items-center gap-1 justify-start lg:justify-center">
                        <GraduationCap size={10} className="text-slate-400"/> {course.students_count || 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 border-l border-slate-100 pl-4 md:pl-6 ml-2">
                      <button 
                        onClick={() => handleOpenEditModal(course)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <Link 
                        to={`/admin/courses/${course.id}/edit`} 
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Конструктор модулей"
                      >
                        <Layers size={16}/>
                      </Link>
                      <button 
                        onClick={() => handleDelete(course.id)} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16}/>
                      </button>
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

      {/* ПАГИНАЦИЯ */}
      {meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({length: meta.last_page}, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}


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
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Заполнение основной информации и медиа</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ЗАГРУЗКА ИЗОБРАЖЕНИЯ */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Обложка курса</label>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl hover:bg-white transition-all">
                    <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-400">
                      {formData.image ? (
                        <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <ImageIcon size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="text-[10px] font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-blue-600 file:text-white cursor-pointer"
                        onChange={e => setFormData({...formData, image: e.target.files[0]})}
                      />
                      <p className="text-[8px] text-slate-400 uppercase mt-2">Рекомендуется: 16:9, до 2МБ</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Название курса</label>
                  <input 
                    type="text" required 
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                    placeholder="Напр: Основы веб-разработки"
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Категория</label>
                    <select 
                      required className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      value={formData.category_id}
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      <option value="">Выберите категорию...</option>
                      {options.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Преподаватель (ППС)</label>
                    <select 
                      required className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      value={formData.user_id}
                      onChange={e => setFormData({...formData, user_id: e.target.value})}
                    >
                      <option value="">Выберите автора...</option>
                      {options.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Уровень</label>
                    <select 
                      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      value={formData.level}
                      onChange={e => setFormData({...formData, level: e.target.value})}
                    >
                      <option value="beginner">Начальный</option>
                      <option value="intermediate">Средний</option>
                      <option value="advanced">Продвинутый</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Статус</label>
                    <select 
                      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="draft">Черновик</option>
                      <option value="active">Активен</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Цена (₸)</label>
                    <input 
                      type="number"
                      className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Описание курса</label>
                  <textarea 
                    rows="4"
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none resize-none focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="Краткая информация о курсе..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Отмена</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>{editingId ? 'Сохранить изменения' : 'Создать новый курс'} <ArrowRight size={16} /></>}
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