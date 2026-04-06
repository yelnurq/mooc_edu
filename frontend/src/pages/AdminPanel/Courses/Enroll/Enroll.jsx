import React, { useState, useEffect } from 'react';
import { UserPlus, Check, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../../../api/axios';

const AdminEnrollment = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  // Загружаем списки при открытии
  useEffect(() => {
    const fetchData = async () => {
      const [uRes, cRes] = await Promise.all([
        api.get('/admin/users'), // эндпоинт для получения всех юзеров
        api.get('/courses')      // эндпоинт всех курсов
      ]);
      setUsers(uRes.data);
      setCourses(cRes.data);
    };
    fetchData();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
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
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Ошибка сервера' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Управление доступом</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Открыть курс для студента</p>
        </div>
      </div>

      <form onSubmit={handleEnroll} className="space-y-6">
        {/* Выбор студента */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-4">Студент</label>
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 ring-blue-500 transition-all outline-none"
            required
          >
            <option value="">Выберите пользователя...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </div>

        {/* Выбор курса */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-4">Курс</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 ring-blue-500 transition-all outline-none"
            required
          >
            <option value="">Выберите курс...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        {/* Статус */}
        {status.msg && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {status.type === 'success' ? <Check size={18}/> : <AlertCircle size={18}/>}
            <span className="text-xs font-black uppercase tracking-tight">{status.msg}</span>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Подключить доступ"}
        </button>
      </form>
    </div>
  );
};

export default AdminEnrollment;