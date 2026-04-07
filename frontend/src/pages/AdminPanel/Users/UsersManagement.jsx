import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, UserPlus, Mail, Building2, Filter, 
  ChevronRight, Loader2, Trash2, Edit2, X, 
  ShieldCheck, Users, GraduationCap,
  Phone, ArrowRight, School, Shield
} from 'lucide-react';
import api from '../../../api/axios';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---
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

const UsersManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [apiStats, setApiStats] = useState({ total: 0, teachers: 0, students: 0, admins: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [options, setOptions] = useState({ faculties: [], departments: [] });

  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '',
    password: '', password_confirmation: '',
    faculty_id: '', department_id: '',
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
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [currentPage, searchTerm, selectedRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
      faculty_id: '', department_id: '', role: 'student'
    });
    setIsModalOpen(true);
    fetchOptions();
  };

  // ФУНКЦИЯ РЕДАКТИРОВАНИЯ
  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role: user.role || 'student',
      faculty_id: user.faculty_id || '',
      department_id: user.department_id || '',
      password: '', // Оставляем пустыми, если не меняем
      password_confirmation: ''
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
      
      // Если пароль пустой при редактировании, удаляем его из отправки
      const dataToSend = { ...formData };
      if (editingId && !dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.password_confirmation;
      }

      if (editingId) {
        await api.put(url, dataToSend);
      } else {
        await api.post(url, dataToSend);
      }

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10 text-left">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tighter uppercase">Пользователи</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Управление учетными записями</p>
        </div>
        <button onClick={handleOpenCreateModal} className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all">
          <UserPlus size={18} /> Добавить
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard label="Всего" value={apiStats.total} icon={Users} colorClass="bg-slate-100 text-slate-600" description="В системе" />
        <StatCard label="ППС" value={apiStats.teachers} icon={GraduationCap} colorClass="bg-blue-50 text-blue-600" description="Преподаватели" isPrimary={true} />
        <StatCard label="Студенты" value={apiStats.students} icon={School} colorClass="bg-emerald-50 text-emerald-600" description="Обучающиеся" />
        <StatCard label="Админы" value={apiStats.admins} icon={ShieldCheck} colorClass="bg-amber-50 text-amber-600" description="Доступ" />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Поиск..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-[260px]">
           <select className="w-full pl-6 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase outline-none appearance-none cursor-pointer" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="all">Все роли</option>
            <option value="student">Студенты</option>
            <option value="teacher">ППС</option>
            <option value="super_admin">Админы</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {loading && users.length === 0 ? <ListSkeleton /> : users.map(user => (
          <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">{user.name?.charAt(0)}</div>
                <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase truncate">{user.name}</h4>
                    <div className="flex flex-wrap gap-4 mt-1 text-[10px] font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1.5"><Mail size={12}/> {user.email}</span>
                        {user.mobile && <span className="flex items-center gap-1.5"><Phone size={12}/> {user.mobile}</span>}
                    </div>
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end gap-6">
                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase">{user.role}</span>
                <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                    <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden flex flex-col relative text-left">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <div className="p-8 border-b border-slate-50">
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">{editingId ? 'Редактировать профиль' : 'Новый пользователь'}</h3>
            </div>
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">ФИО</label>
                        <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Email</label>
                        <input required type="email" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Телефон</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Роль</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="student">Студент</option>
                            <option value="teacher">Преподаватель</option>
                            <option value="head_of_dept">Зав. кафедрой</option>
                            <option value="dean">Декан</option>
                            <option value="super_admin">Администратор</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400">Факультет</label>
                        <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" value={formData.faculty_id} onChange={e => setFormData({...formData, faculty_id: e.target.value})}>
                            <option value="">Не выбрано</option>
                            {options.faculties?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400">Кафедра</label>
                        <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
                            <option value="">Не выбрано</option>
                            {options.departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">{editingId ? 'Новый пароль' : 'Пароль'}</label>
                        <input required={!editingId} type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Подтверждение</label>
                        <input required={!editingId || formData.password} type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-bold text-slate-400 uppercase">Отмена</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <>{editingId ? 'Обновить' : 'Создать'} <ArrowRight size={16}/></>}
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