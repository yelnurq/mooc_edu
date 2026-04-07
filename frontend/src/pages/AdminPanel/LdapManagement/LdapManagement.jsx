import React, { useState, useEffect, useCallback } from 'react';
// Импортируем ваш настроенный axios
import api from '../../../api/axios';
import { 
  Search, Users, Loader2, RefreshCw, 
  UserPlus, Mail, Building2, Shield, 
  CheckCircle2, Globe, Database, ArrowRight, UserCheck
} from 'lucide-react';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---
const StatCard = ({ icon: Icon, label, value, colorClass, description }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1 text-left">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight text-left">{description}</p>
  </div>
);

const LdapManagement = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importingEmail, setImportingEmail] = useState(null); 
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, inLdap: 0, imported: 0 });

  // Получение пользователей из LDAP
  const fetchLdapUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Используем api.get (базовый URL и токен уже в axios.js)
      const response = await api.get('/admin/ldap/users');
      const result = response.data;
      
      if (result.status === 'success') {
        setUsers(result.users || []);
        setStats(prev => ({ 
          ...prev, 
          total: result.total_found, 
          inLdap: result.total_found 
        }));
      }
    } catch (error) {
      console.error("Ошибка LDAP:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLdapUsers(); }, [fetchLdapUsers]);

  // Импорт ОДНОГО пользователя
  const handleImportSingle = async (user) => {
    setImportingEmail(user.email);
    try {
      // Используем api.post
      const response = await api.post('/admin/ldap/import-single', { 
        email: user.email, 
        name: user.name 
      });
      
      if (response.status === 200 || response.status === 201) {
        alert(`Пользователь ${user.name} успешно добавлен в систему!`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Ошибка импорта";
      alert(errorMsg);
    } finally {
      setImportingEmail(null);
    }
  };

  // Синхронизация всех (если понадобится разблокировать)
  const handleSyncAll = async () => {
    if (!window.confirm("Начать синхронизацию всех пользователей?")) return;
    setSyncing(true);
    try {
      await api.post('/admin/ldap/sync-all');
      alert("Синхронизация завершена успешно");
    } catch (error) {
      alert("Ошибка при синхронизации");
    } finally {
      setSyncing(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userPrincipalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen font-sans border rounded-lg">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tighter">Active Directory (LDAP)</h1>
          <p className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Globe size={14} className="text-blue-500" /> 
            Университетский сервер: 10.0.1.30
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={fetchLdapUsers} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Обновить
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Найдено в AD" value={stats.total} icon={Database} colorClass="bg-slate-100 text-slate-600" description="Всего записей" />
        <StatCard label="Результаты поиска" value={filteredUsers.length} icon={Users} colorClass="bg-blue-100 text-blue-600" description="Отфильтровано" />
        <StatCard label="Статус сервера" value="Online" icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" description="Соединение установлено" />
      </div>

      {/* SEARCH */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Поиск по ФИО или Email в LDAP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none shadow-sm"
        />
      </div>

      {/* LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Загрузка данных из AD...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user, idx) => (
              <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 border border-slate-100 group-hover:border-blue-100 group-hover:text-blue-500 transition-colors">
                    {user.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase mt-1">
                      <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300"/> {user.userPrincipalName || user.email}</span>
                      {user.company && <span className="flex items-center gap-1.5"><Building2 size={12} className="text-slate-300"/> {user.company}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.title || user.position || 'Сотрудник'}</p>
                    <p className="text-[9px] text-slate-400 font-medium">{user.mobile || 'Нет номера'}</p>
                  </div>
                  <button 
                    onClick={() => handleImportSingle(user)}
                    disabled={importingEmail === user.email}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase hover:bg-blue-600 transition-all disabled:opacity-50 shadow-sm active:scale-95"
                  >
                    {importingEmail === user.email ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    Импорт
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <Users size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">Пользователи не найдены</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default LdapManagement;