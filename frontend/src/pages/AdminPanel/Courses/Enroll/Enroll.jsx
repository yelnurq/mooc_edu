import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { 
  Users, BookOpen, ShieldCheck, Loader2, 
  ArrowRight, Activity, Mail,
  UserMinus, CheckCircle2, AlertCircle, XCircle, Plus
} from 'lucide-react';
import api from '../../../../api/axios';

const customSelectStyles = {
  control: (base) => ({
    ...base,
    padding: '4px',
    borderRadius: '1rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    boxShadow: 'none',
    '&:hover': { border: '#cbd5e1' }
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? '#0f172a' : isFocused ? '#f1f5f9' : 'white',
    color: isSelected ? 'white' : '#1e293b',
    cursor: 'pointer'
  })
};

// Функция для красивого отображения строки в поиске (Имя + Почта)
const formatOptionLabel = ({ label, email }) => (
  <div className="flex flex-col text-left">
    <span className="font-bold text-sm">{label}</span>
    {email && <span className="text-[10px] text-slate-400 font-medium -mt-1">{email}</span>}
  </div>
);

const AdminEnrollment = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [uRes, cRes, eRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/courses'),
        api.get('/admin/enrollments').catch(() => ({ data: { enrollments: [] } }))
      ]);
      setUsers(uRes.data.data || uRes.data || []);
      setCourses(cRes.data.data || cRes.data || []);
      setEnrollments(eRes.data.enrollments || []);
    } catch (err) {
      console.error("Sync Error", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Теперь в опции добавляем email
  const userOptions = users.map(u => ({ 
    value: u.id, 
    label: u.name, 
    email: u.email // Передаем email для поиска и отображения
  }));
  
  const courseOptions = courses.map(c => ({ value: c.id, label: c.title }));

  const groupedEnrollments = enrollments.reduce((acc, curr) => {
    if (!acc[curr.user_id]) {
      // Ищем email пользователя в общем списке users, если API его не вернул в enrollments
      const userFull = users.find(u => u.id === curr.user_id);
      acc[curr.user_id] = { 
        user_id: curr.user_id, 
        user_name: curr.user_name, 
        user_email: curr.user_email || userFull?.email, // Проверь, приходит ли email с бэкенда
        subscriptions: [] 
      };
    }
    acc[curr.user_id].subscriptions.push({ course_id: curr.course_id, course_title: curr.course_title });
    return acc;
  }, {});

  const handleEnroll = async (e, userId = null, courseId = null) => {
    if (e) e.preventDefault();
    const uId = userId || selectedUser?.value;
    const cId = courseId || selectedCourse?.value;
    if (!uId || !cId) return;

    setLoading(true);
    try {
      await api.post('/admin/enroll', { user_id: uId, course_id: cId });
      fetchData();
      if (!userId) { setSelectedUser(null); setSelectedCourse(null); }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnroll = async (userId, courseId) => {
    if (!window.confirm("Отозвать доступ?")) return;
    try {
      await api.delete(`/admin/enroll/${userId}/${courseId}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (dataLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 uppercase tracking-[0.3em]">Синхронизация...</div>;

  return (
    <main className="mx-auto px-10 py-10 bg-[#f8fafc] min-h-screen text-slate-900">
      <div className="flex justify-between items-end mb-10">
        <h1 className="text-2xl font-bold tracking-tighter">Управление Доступами</h1>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-400">ADMIN V2.4</div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-left">
        <StatWidget label="Студенты" value={users.length} icon={Users} colorClass="bg-slate-100 text-slate-600" description="Зарегистрировано" />
        <StatWidget label="Активные" value={Object.keys(groupedEnrollments).length} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" description="С доступом" />
        <StatWidget label="Ожидают" value={users.length - Object.keys(groupedEnrollments).length} icon={UserMinus} colorClass="bg-amber-100 text-amber-600" description="Без подписок" />
        <StatWidget label="Курсы" value={courses.length} icon={BookOpen} colorClass="bg-blue-100 text-blue-600" description="Всего программ" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* FORM */}
        <div className="lg:col-span-4 text-left">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><ShieldCheck size={20}/> Назначение прав</h3>
            <form onSubmit={handleEnroll} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Поиск пользователя</label>
                <Select
                  options={userOptions}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="Имя или email..."
                  styles={customSelectStyles}
                  formatOptionLabel={formatOptionLabel}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Программа</label>
                <Select
                  options={courseOptions}
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  placeholder="Выберите курс..."
                  styles={customSelectStyles}
                />
              </div>
              <button disabled={loading || !selectedUser || !selectedCourse} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={16}/> : <>Открыть доступ <ArrowRight size={16}/></>}
              </button>
            </form>
          </div>
        </div>

        {/* GROUPED LIST */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
            Реестр подписок <div className="h-px bg-slate-200 flex-1"></div>
          </h2>

          <div className="space-y-4">
            {Object.values(groupedEnrollments).map((group) => (
              <div key={group.user_id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-200 transition-all">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border rounded-2xl flex items-center justify-center font-bold text-slate-400 shadow-sm text-xs">
                      {group.user_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{group.user_name}</h4>
                      <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                        <Mail size={10} />
                        <span className="text-[10px] font-bold tracking-tight uppercase">{group.user_email || 'Нет email'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-blue-100">
                    Активно курсов: {group.subscriptions.length}
                  </span>
                </div>

                <div className="p-6 space-y-3 bg-white">
                  {group.subscriptions.map((sub) => (
                    <div key={sub.course_id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><BookOpen size={14}/></div>
                        <span className="text-sm font-bold text-slate-700">{sub.course_title}</span>
                      </div>
                      <button onClick={() => handleUnroll(group.user_id, sub.course_id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <XCircle size={18} />
                      </button>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Select
                      placeholder="Добавить еще один курс..."
                      styles={customSelectStyles}
                      options={courseOptions.filter(opt => !group.subscriptions.some(s => s.course_id === opt.value))}
                      onChange={(opt) => handleEnroll(null, group.user_id, opt.value)}
                      value={null}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminEnrollment;