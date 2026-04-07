import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, UserPlus, Mail, Building2, Filter, 
  ChevronRight, Loader2, Trash2, Edit2, X, 
  ShieldCheck, Users, GraduationCap,
  Phone, ArrowRight, Shield, User, School, UserCheck, UserMinus
} from 'lucide-react';
import api from '../../../api/axios';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (Дизайн из StaffManagement) ---

const StatCard = ({ icon: Icon, label, value, colorClass, description, isPrimary, unit = "чел." }) => (
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
      <div key={i} className="h-[120px] md:h-[100px] bg-white border border-slate-100 rounded-2xl w-full" />
    ))}
  </div>
);

// --- ОСНОВНОЙ КОМПОНЕНТ ---

const UsersManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [apiStats, setApiStats] = useState({ total: 0, teachers: 0, students: 0, admins: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });

  // Состояние модалки и формы
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [options, setOptions] = useState({ faculties: [], departments: [], positions: [], degrees: [] });
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '',
    password: '', password_confirmation: '',
    faculty_id: '', department_id: '', position_id: '', academic_degree_id: '',
    role: 'student'
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: { page: currentPage, search: searchTerm, role: selectedRole }
      });
      if (response.data.status === 'success') {
        setUsers(response.data.data || []);
        setMeta(response.data.meta);
        setApiStats(response.data.stats);
      }
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedRole]);

  // Блокировка скролла
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isModalOpen]);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/admin/helpers/options');
      setOptions(res.data);
    } catch (e) { console.error(e); }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '', email: '', mobile: '', password: '', password_confirmation: '',
      faculty_id: '', department_id: '', position_id: '', academic_degree_id: '',
      role: 'student'
    });
    setIsModalOpen(true);
    fetchOptions();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Удалить пользователя навсегда?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingId ? `/admin/users/${editingId}` : `/admin/users`;
      const method = editingId ? 'put' : 'post';
      await api[method](url, formData);
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Ошибка сохранения");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto px-4 md:px-10 py-6 md:py-10 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10">
        <div className="text-left">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tighter uppercase">Пользователи системы</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Централизованное управление учетными записями</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <UserPlus size={18} />
          Добавить пользователя
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard label="Всего" value={apiStats.total} icon={Users} colorClass="bg-slate-100 text-slate-600" description="База данных" />
        <StatCard label="ППС" value={apiStats.teachers} icon={GraduationCap} colorClass="bg-blue-50 text-blue-600" description="Преподаватели" isPrimary={true} />
        <StatCard label="Студенты" value={apiStats.students} icon={School} colorClass="bg-emerald-50 text-emerald-600" description="Обучающиеся" />
        <StatCard label="Админы" value={apiStats.admins} icon={ShieldCheck} colorClass="bg-amber-50 text-amber-600" description="Доступ к управлению" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по имени, email или телефону..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-[260px]">
           <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <select 
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none shadow-sm"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">Все категории</option>
            <option value="teacher">Преподаватели</option>
            <option value="student">Студенты</option>
            <option value="super_admin">Администраторы</option>
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" size={16} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative">
        {loading && users.length === 0 ? (
          <ListSkeleton />
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-bold text-lg md:text-xl shrink-0 ${user.role === 'super_admin' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
                      {user.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tighter truncate">{user.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${user.role === 'super_admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <span className="flex items-center gap-1.5"><Mail size={12}/> {user.email}</span>
                        {user.mobile && <span className="flex items-center gap-1.5"><Phone size={12}/> {user.mobile}</span>}
                        <span className="flex items-center gap-1.5"><Building2 size={12}/> {user.faculty_short || 'Университет'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-left lg:text-right min-w-[120px]">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.position || 'Пользователь'}</p>
                      <p className="text-[11px] font-bold text-slate-700">{user.academic_degree || (user.role === 'student' ? 'Студент' : 'Без степени')}</p>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                      <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
            <Users size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="font-bold text-slate-400 uppercase text-xs">Пользователи не найдены</p>
          </div>
        )}
      </div>

      {/* PAGINATION (Как в StaffManagement) */}
      {meta.last_page > 1 && (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Страница {currentPage} из {meta.last_page}</p>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="flex-1 md:flex-none px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase text-slate-600 hover:bg-slate-100 disabled:opacity-50">Назад</button>
            <button disabled={currentPage === meta.last_page} onClick={() => setCurrentPage(p => p + 1)} className="flex-1 md:flex-none px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase text-slate-600 hover:bg-slate-100 disabled:opacity-50">Вперед</button>
          </div>
        </div>
      )}

      {/* MODAL (Точная копия дизайна StaffManagement) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl max-h-[95vh] rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-10 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={20} />
            </button>

            <div className="p-6 md:p-8 pb-4 text-left border-b border-slate-50">
              <h3 className="text-xl font-bold text-slate-900 tracking-tighter">
                {editingId ? 'Редактирование' : 'Новый пользователь'}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Параметры доступа и профиля</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar text-left">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ROLE SELECTION */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Тип пользователя</label>
                  <select 
                    required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none appearance-none"
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="student">Студент</option>
                    <option value="teacher">Преподаватель</option>
                    <option value="super_admin">Администратор</option>
                  </select>
                </div>

                {/* PERSONAL INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">ФИО</label>
                    <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Email</label>
                    <input type="email" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                {/* ACADEMIC DATA (Скрываем для простых админов, если нужно) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Факультет</label>
                    <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold outline-none" value={formData.faculty_id} onChange={e => setFormData({...formData, faculty_id: e.target.value})}>
                      <option value="">Выберите...</option>
                      {options.faculties?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Кафедра</label>
                    <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold outline-none" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
                      <option value="">Выберите...</option>
                      {options.departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Пароль</label>
                    <input type="password" required={!editingId} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Подтверждение</label>
                    <input type="password" required={!editingId || formData.password !== ''} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Отмена</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>{editingId ? 'Обновить' : 'Сохранить'} <ArrowRight size={16} /></>}
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

export default UsersManagement;