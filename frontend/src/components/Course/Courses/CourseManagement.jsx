import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, BookOpen, Layers, GraduationCap, 
  ChevronRight, Loader2, Trash2, Edit2, X, 
  Clock, PlayCircle, ArrowRight, Filter, 
  User, UserPlus, Image as ImageIcon
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
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '', 
    author_id: '', custom_author_name: '', author_type: 'user', 
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
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/admin/helpers/options/teachers');
      setOptions({
        categories: res.data.categories || [],
        teachers: res.data.teachers || []
      });
    } catch (e) { console.error(e); }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setImagePreview(null);
    setFormData({ title: '', description: '', category_id: '', author_id: '', custom_author_name: '', author_type: 'user', image: null });
    setIsModalOpen(true);
    fetchOptions();
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setImagePreview(course.image_url);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      category_id: course.category_id || '',
      author_type: course.author_type || 'user',
      author_id: course.author_id || '',
      custom_author_name: course.custom_author_name || '',
      image: null
    });
    setIsModalOpen(true);
    fetchOptions();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить этот курс и все связанные материалы?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description || '');
    data.append('category_id', formData.category_id);
    data.append('author_type', formData.author_type);
    
    if (formData.author_type === 'user') {
        data.append('author_id', formData.author_id);
    } else {
        data.append('custom_author_name', formData.custom_author_name);
    }

    if (formData.image instanceof File) {
        data.append('image', formData.image);
    }

    try {
      const url = editingId ? `/admin/courses/${editingId}` : `/admin/courses`;
      if (editingId) data.append('_method', 'PUT'); // Важно для Laravel при работе с FormData
      
      await api.post(url, data); 
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
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Реестр образовательных программ</p>
        </div>
        <button onClick={handleOpenCreateModal} className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95">
          <Plus size={18} /> Создать курс
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard label="Всего" value={stats.total} icon={BookOpen} colorClass="bg-slate-100 text-slate-600" description="В базе данных" unit="кур." />
        <StatCard label="Активные" value={stats.active} icon={PlayCircle} colorClass="bg-emerald-50 text-emerald-600" description="Опубликовано" isPrimary={true} unit="кур." />
        <StatCard label="Черновики" value={stats.drafts} icon={Clock} colorClass="bg-amber-50 text-amber-600" description="В разработке" unit="кур." />
        <StatCard label="Студенты" value={stats.students_count} icon={GraduationCap} colorClass="bg-purple-50 text-purple-600" description="Общий охват" unit="чел." />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Поиск по названию или автору..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-[260px]">
          <select 
            className="w-full pl-6 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer"
            value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            {options.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" size={16} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative">
        {loading && courses.length === 0 ? <ListSkeleton /> : (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="flex items-center gap-4 text-left flex-1">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                        {course.image_url ? <img src={course.image_url} alt="" className="w-full h-full object-cover" /> : <BookOpen size={24} className="text-slate-200"/>}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tighter truncate">{course.title}</h4>
                      <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md"><Layers size={12} className="text-blue-500"/> {course.category || 'Без категории'}</span>
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md"><User size={12} className="text-purple-500"/> {course.author_type === 'custom' ? course.custom_author_name : (course.author || 'Не указан')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="flex gap-6 text-center">
                        <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Модулей</p>
                            <p className="text-xs font-black text-slate-900">{course.modules_count || 0}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Лекций</p>
                            <p className="text-xs font-black text-slate-900">{course.lessons_count || 0}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Студентов</p>
                            <p className="text-xs font-black text-slate-900">{course.students_count || 0}</p>
                        </div>
                    </div>
            
                    <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 justify-end">
                      <button onClick={() => handleEdit(course)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={18}/></button>
                    <Link to={`/admin/courses/${course.id}/edit`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Layers size={16}/></Link>
                    <button onClick={() => handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl max-h-[95vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative text-left">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 z-10 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={20} /></button>

            <div className="p-8 pb-4 border-b border-slate-50">
              <h3 className="text-xl font-bold text-slate-900 tracking-tighter uppercase">{editingId ? 'Изменить курс' : 'Новый учебный курс'}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Обложка курса</label>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <div className="w-16 h-12 bg-white rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                       {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt=""/> : <ImageIcon size={18} className="text-slate-300"/>}
                    </div>
                    <input type="file" accept="image/*" className="text-[10px] font-bold text-slate-500 cursor-pointer" onChange={handleImageChange} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Название курса</label>
                  <input type="text" required className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Категория</label>
                    <select required className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                      <option value="">Выбрать...</option>
                      {options.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Автор</label>
                      <button type="button" onClick={() => setFormData({...formData, author_type: formData.author_type === 'user' ? 'custom' : 'user'})} className="text-[8px] font-black text-blue-600 uppercase">
                        {formData.author_type === 'user' ? 'Свое имя' : 'Из списка'}
                      </button>
                    </div>
                    {formData.author_type === 'user' ? (
                      <select required className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={formData.author_id} onChange={e => setFormData({...formData, author_id: e.target.value})}>
                        <option value="">Выберите преподавателя...</option>
                        {options.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    ) : (
                      <input type="text" required placeholder="ФИО автора..." className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={formData.custom_author_name} onChange={e => setFormData({...formData, custom_author_name: e.target.value})} />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400">Описание</label>
                  <textarea rows="3" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none resize-none focus:bg-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Отмена</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>{editingId ? 'Сохранить' : 'Создать'} <ArrowRight size={16} /></>}
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