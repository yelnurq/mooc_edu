import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { 
  Users, BookOpen, ShieldCheck, Loader2, 
  ArrowRight, Mail, UserMinus, CheckCircle2, 
  XCircle, Database, X, Clock, Phone, Check, AlertCircle
} from 'lucide-react';
import api from '../../../../api/axios';

// --- СТИЛИ SELECT ---
const customSelectStyles = {
  control: (base) => ({
    ...base,
    padding: '6px',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    boxShadow: 'none',
    fontSize: '14px',
    fontWeight: '600',
    '&:hover': { border: '#cbd5e1' }
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? '#0f172a' : isFocused ? '#f1f5f9' : 'white',
    color: isSelected ? 'white' : '#1e293b',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  })
};

const StatCard = ({ icon: Icon, label, value, colorClass, description }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md text-left">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{description}</p>
  </div>
);

const formatOptionLabel = ({ label, email }) => (
  <div className="flex flex-col text-left">
    <span className="font-bold text-sm text-slate-900">{label}</span>
    {email && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{email}</span>}
  </div>
);

const AdminEnrollment = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, waiting: 0, programs: 0, pending_requests: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'all' | 'pending'

  const fetchData = async () => {
    try {
      const [cRes, eRes] = await Promise.all([
        api.get('/courses'),
        api.get('/admin/enrollments')
      ]);
      setCourses(cRes.data.data || cRes.data || []);
      if (eRes.data.status === 'success') {
        setEnrollments(eRes.data.enrollments || []);
        setStats(eRes.data.stats);
      }
    } catch (err) { console.error(err); } 
    finally { setDataLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Блокировка скролла при открытой модалке
  useEffect(() => {
    if (selectedStudent) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalStyle; };
    }
  }, [selectedStudent]);

  const loadUserOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const response = await api.get(`/admin/users?search=${inputValue}`);
      const users = response.data.data || response.data || [];
      return users.map(u => ({ value: u.id, label: u.name, email: u.email }));
    } catch (err) { return []; }
  };

  const handleEnroll = async (e, userId = null, courseId = null) => {
    if (e) e.preventDefault();
    const uId = userId || selectedUser?.value;
    const cId = courseId || selectedCourse?.value;
    if (!uId || !cId) return;

    setLoading(true);
    try {
      await api.post('/admin/enroll', { user_id: uId, course_id: cId, status: 'approved' });
      await fetchData();
      if (!userId) { setSelectedUser(null); setSelectedCourse(null); }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleApprove = async (userId, courseId) => {
    try {
      await api.post('/admin/enroll/approve', { user_id: userId, course_id: courseId });
      await fetchData();
      // Обновляем данные в открытой модалке, если она есть
      if (selectedStudent && selectedStudent.user_id === userId) {
        const updatedSubs = selectedStudent.subscriptions.map(s => 
          s.course_id === courseId ? { ...s, status: 'approved' } : s
        );
        setSelectedStudent({ ...selectedStudent, subscriptions: updatedSubs, hasPending: updatedSubs.some(s => s.status === 'pending') });
      }
    } catch (err) { console.error(err); }
  };

  const handleUnroll = async (userId, courseId) => {
    if (!window.confirm("Удалить доступ или отклонить заявку?")) return;
    try {
      await api.delete(`/admin/enroll/${userId}/${courseId}`);
      await fetchData();
      if (selectedStudent) {
        const updatedSubs = selectedStudent.subscriptions.filter(s => s.course_id !== courseId);
        if (updatedSubs.length === 0) setSelectedStudent(null);
        else setSelectedStudent({ ...selectedStudent, subscriptions: updatedSubs });
      }
    } catch (err) { console.error(err); }
  };

  const groupedEnrollments = enrollments.reduce((acc, curr) => {
    if (!acc[curr.user_id]) {
      acc[curr.user_id] = { 
        user_id: curr.user_id, 
        user_name: curr.user_name, 
        user_email: curr.user_email, 
        subscriptions: [],
        hasPending: false 
      };
    }
    acc[curr.user_id].subscriptions.push({ 
      course_id: curr.course_id, 
      course_title: curr.course_title,
      status: curr.status 
    });
    if (curr.status === 'pending') acc[curr.user_id].hasPending = true;
    return acc;
  }, {});

  const courseOptions = courses.map(c => ({ value: c.id, label: c.title }));
  const displayList = activeTab === 'all' 
    ? Object.values(groupedEnrollments) 
    : Object.values(groupedEnrollments).filter(g => g.hasPending);

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Загрузка системы</span>
      </div>
    );
  }

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen text-slate-900">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tighter">Управление Доступами</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">Панель управления обучением</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-400 shadow-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          V2.9 • LIVE MODE
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        <StatCard label="Студенты" value={stats.total} icon={Users} colorClass="bg-slate-100 text-slate-600" description="Всего пользователей" />
        <StatCard label="Активные" value={stats.active} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" description="Одобренные доступы" />
        <StatCard label="Заявки" value={stats.pending_requests} icon={Clock} colorClass="bg-orange-100 text-orange-600" description="Ожидают проверки" />
        <StatCard label="Ожидание" value={stats.waiting} icon={UserMinus} colorClass="bg-amber-100 text-amber-600" description="Без курсов" />
        <StatCard label="Программы" value={stats.programs} icon={BookOpen} colorClass="bg-blue-100 text-blue-600" description="Доступно курсов" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR FORM */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-10 text-left">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-slate-600">
              <ShieldCheck size={18} className="text-blue-500" /> Ручная выдача
            </h3>
            
            <form onSubmit={handleEnroll} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Студент</label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadUserOptions}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="Поиск по имени/email..."
                  styles={customSelectStyles}
                  formatOptionLabel={formatOptionLabel}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Программа</label>
                <Select
                  options={courseOptions}
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  placeholder="Выберите курс..."
                  styles={customSelectStyles}
                />
              </div>

              <button 
                disabled={loading || !selectedUser || !selectedCourse} 
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <>Выдать доступ <ArrowRight size={14}/></>}
              </button>
            </form>
          </div>
        </div>

        {/* LIST */}
        <div className="lg:col-span-8 space-y-6">
          {/* TABS */}
          <div className="flex gap-8 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'all' ? 'text-blue-600' : 'text-slate-400'}`}
            >
              Все студенты
              {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === 'pending' ? 'text-orange-500' : 'text-slate-400'}`}
            >
              Заявки на доступ
              {stats.pending_requests > 0 && (
                <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                  {stats.pending_requests}
                </span>
              )}
              {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {displayList.length > 0 ? (
              displayList.map((group) => (
                <div 
                  key={group.user_id} 
                  onClick={() => setSelectedStudent(group)}
                  className={`bg-white p-4 rounded-2xl border flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer group shadow-sm ${group.hasPending ? 'border-orange-200 bg-orange-50/20' : 'border-slate-200'}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[10px] ${group.hasPending ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                      {group.user_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">{group.user_name}</h4>
                        {group.hasPending && <AlertCircle size={14} className="text-orange-500" />}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{group.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Подписки</p>
                        <p className="text-xs font-bold text-slate-700">
                          {group.subscriptions.filter(s => s.status === 'approved').length} активных
                        </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                        <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                 <Database size={40} className="mx-auto text-slate-200 mb-4" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ничего не найдено</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: COURSES MANAGEMENT */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className={`absolute top-0 left-0 w-2 h-full ${selectedStudent.hasPending ? 'bg-orange-500' : 'bg-blue-600'}`} />
            
            <div className="p-8 border-b border-slate-100 bg-white">
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${selectedStudent.hasPending ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      {selectedStudent.hasPending ? 'Требует одобрения' : 'Студент системы'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {selectedStudent.user_id}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{selectedStudent.user_name}</h3>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail size={12} />
                    <span className="text-xs font-bold">{selectedStudent.user_email}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
              <div className="space-y-6 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Управление подписками</p>
                <div className="grid gap-3">
                  {selectedStudent.subscriptions.map((sub) => (
                    <div key={sub.course_id} className={`bg-white border p-5 rounded-2xl flex justify-between items-center shadow-sm group transition-all ${sub.status === 'pending' ? 'border-orange-200' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${sub.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{sub.course_title}</p>
                          {sub.status === 'pending' ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1.5 uppercase text-orange-600 bg-orange-100 mt-1 w-fit">
                              <Clock size={10} /> Ожидает подтверждения
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1.5 uppercase text-emerald-600 bg-emerald-50 mt-1 w-fit">
                              <CheckCircle2 size={10} /> Доступ активен
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.status === 'pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleApprove(selectedStudent.user_id, sub.course_id); }}
                            className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 text-[10px] font-bold uppercase px-4"
                          >
                            <Check size={16} /> Одобрить
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUnroll(selectedStudent.user_id, sub.course_id); }}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Назначить новый курс</p>
                    <div className="bg-white border border-slate-200 p-2 rounded-2xl">
                         <Select
                            placeholder="Добавить программу..."
                            styles={customSelectStyles}
                            options={courseOptions.filter(opt => !selectedStudent.subscriptions.some(s => s.course_id === opt.value))}
                            onChange={(opt) => handleEnroll(null, selectedStudent.user_id, opt.value)}
                            value={null}
                        />
                    </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 grid grid-cols-2 gap-4">
               <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <Phone size={14} className="text-blue-500" />
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Связь</p>
                        <p className="text-[10px] font-bold text-slate-700">WhatsApp / Call</p>
                    </div>
               </div>
               <button 
                onClick={() => setSelectedStudent(null)}
                className="w-full py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminEnrollment;