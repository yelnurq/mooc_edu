import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Check, AlertCircle, Loader2, 
  Users, BookOpen, ArrowRight, ShieldCheck,
  ChevronDown
} from 'lucide-react';
import api from '../../../../api/axios';

const AdminEnrollment = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Загрузка данных с защитой от "not a function"
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/courses')
        ]);

        // Пытаемся найти массив в uRes.data, uRes.data.data или uRes.data.users
        const userData = Array.isArray(uRes.data) ? uRes.data : (uRes.data.data || uRes.data.users || []);
        const courseData = Array.isArray(cRes.data) ? cRes.data : (cRes.data.data || cRes.data.courses || []);

        setUsers(userData);
        setCourses(courseData);
      } catch (err) {
        console.error("Ошибка при получении данных:", err);
        setStatus({ type: 'error', msg: 'Не удалось загрузить списки пользователей или курсов' });
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedCourse) return;

    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await api.post('/admin/enroll', {
        user_id: selectedUser,
        course_id: selectedCourse
      });
      
      setStatus({ type: 'success', msg: 'Доступ успешно предоставлен!' });
      setSelectedUser('');
      setSelectedCourse('');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.message || 'Ошибка при подключении курса' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#f8fafc] font-sans">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden relative group">
        {/* Декоративная полоса */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
        
        <div className="p-10 relative z-10 text-left">
          {/* HEADER */}
          <div className="flex items-center gap-5 mb-10">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20 group-hover:scale-105 transition-transform duration-500">
              <ShieldCheck size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
                Управление доступом
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                  Система выдачи прав на обучение
                </p>
              </div>
            </div>
          </div>

          {dataLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Синхронизация реестров...</span>
            </div>
          ) : (
            <form onSubmit={handleEnroll} className="space-y-8">
              {/* СЕЛЕКТ СТУДЕНТА */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 ml-1">
                  <Users size={12} className="text-blue-500" /> Студент (Пользователь)
                </label>
                <div className="relative group">
                  <select 
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-4 pl-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-900 appearance-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none cursor-pointer"
                    required
                  >
                    <option value="">Выберите из списка...</option>
                    {(users || []).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.email ? `(${u.email})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-slate-500 transition-colors" size={16} />
                </div>
              </div>

              {/* СЕЛЕКТ КУРСА */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 ml-1">
                  <BookOpen size={12} className="text-indigo-500" /> Образовательная программа
                </label>
                <div className="relative group">
                  <select 
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-4 pl-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-900 appearance-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none cursor-pointer"
                    required
                  >
                    <option value="">Выберите курс...</option>
                    {(courses || []).map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-slate-500 transition-colors" size={16} />
                </div>
              </div>

              {/* СТАТУС */}
              {status.msg && (
                <div className={`p-5 rounded-2xl flex items-center gap-4 border animate-in fade-in slide-in-from-top-2 duration-300 ${
                  status.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                    : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                  <div className={`p-2 rounded-xl shadow-sm ${status.type === 'success' ? 'bg-white text-emerald-500' : 'bg-white text-red-500'}`}>
                    {status.type === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight">{status.msg}</span>
                </div>
              )}

              {/* КНОПКА ОТПРАВКИ */}
              <button 
                type="submit"
                disabled={loading || !selectedUser || !selectedCourse}
                className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                  loading || !selectedUser || !selectedCourse
                  ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-200 shadow-slate-200'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Открыть доступ <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
        
        {/* FOOTER */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Security Protocol Active • 2026 Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollment;