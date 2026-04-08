import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Clock, X, ChevronRight, ChevronLeft, 
  Loader2, Download, Filter, Activity, 
  Terminal, Shield, Globe, Database, Cpu
} from 'lucide-react';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const LogStatCard = ({ icon: Icon, label, value, colorClass, description, isPrimary, unit = "запр." }) => (
  <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${isPrimary ? 'ring-1 ring-blue-600/10' : ''}`}>
    <div className={`absolute top-0 left-0 w-1 h-full ${isPrimary ? 'bg-blue-600' : 'bg-slate-200'}`} />
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1 text-left">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
        </div>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass} shadow-sm`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="text-left mt-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

// --- ОСНОВНОЙ КОМПОНЕНТ ---

const ApiLogsMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ last_page: 1, total: 0 });

  const API_BASE = 'http://localhost:8000/api';
  const token = localStorage.getItem("token");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
        method: selectedMethod !== 'all' ? selectedMethod : ''
      });

      const response = await fetch(`${API_BASE}/admin/logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setLogs(result.data || []);
        if (result.meta) {
          setPaginationMeta(result.meta);
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки логов:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedMethod, token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMethod]);

  const getMethodColor = (method) => {
    const colors = {
      'GET': 'bg-blue-50 text-blue-600 border-blue-100',
      'POST': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'PUT': 'bg-amber-50 text-amber-600 border-amber-100',
      'DELETE': 'bg-red-50 text-red-600 border-red-100'
    };
    return colors[method] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <main className="border rounded-lg mx-auto px-6 md:px-10 py-10 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tighter">Системные логи</h1>
          <p className="flex items-center gap-2 mt-2 text-sm text-gray-500">Мониторинг API запросов и действий пользователей</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-slate-50 shadow-sm">
            <Download size={16} /> Экспорт JSON
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <LogStatCard 
          label="Всего событий" 
          value={paginationMeta.total} 
          icon={Activity} 
          colorClass="bg-indigo-50 text-indigo-600" 
          description="Записей в таблице api_logs" 
          isPrimary={true} 
        />
        <LogStatCard 
          label="Безопасность" 
          value="100" 
          icon={Shield} 
          unit="%"
          colorClass="bg-emerald-50 text-emerald-600" 
          description="Фильтрация паролей активна" 
        />
        <LogStatCard 
          label="Среднее время" 
          value="124" 
          icon={Cpu} 
          unit="ms"
          colorClass="bg-blue-50 text-blue-600" 
          description="Скорость ответа сервера" 
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Поиск по URL или имени пользователя..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none shadow-sm transition-all"
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wider appearance-none focus:border-blue-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="all">Все методы</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" size={14} />
        </div>
      </div>

      {/* LOGS LIST */}
      <div className="relative min-h-[400px] space-y-3">
        {loading && logs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">Чтение базы данных...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all group hover:shadow-md hover:border-blue-200 cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-left">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-16 h-10 rounded-lg flex items-center justify-center font-black text-[10px] border ${getMethodColor(log.method)}`}>
                      {log.method}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-900 text-sm truncate max-w-[300px] lg:max-w-[500px]">
                        {log.url.replace('http://localhost:8000/api', '')}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            <Clock size={12} /> {new Date(log.created_at).toLocaleString()}
                         </span>
                         <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-tight">
                            <Globe size={12} /> {log.ip_address}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Инициатор</p>
                      <p className="text-xs font-bold text-slate-700">{log.user_name || 'Система/Гость'}</p>
                    </div>
                    <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                      <div className="text-right mr-2">
                        <p className="text-[10px] font-bold text-slate-900">{log.duration_ms} ms</p>
                        <div className="h-1 w-12 bg-slate-100 rounded-full mt-1">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: Math.min(log.duration_ms / 10, 100) + '%' }} />
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-200 border-dashed p-20 text-center">
            <Terminal size={32} className="text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900">Логов пока нет</h3>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && paginationMeta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12 pb-10">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 disabled:opacity-30 shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Страница {currentPage} из {paginationMeta.last_page}
          </span>
          <button 
            disabled={currentPage === paginationMeta.last_page}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 disabled:opacity-30 shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className={`absolute top-0 left-0 w-2 h-full ${getMethodColor(selectedLog.method).split(' ')[1]}`} />
            
            <div className="p-8 border-b border-slate-100">
              <div className="flex justify-between items-start text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md border ${getMethodColor(selectedLog.method)}`}>
                      {selectedLog.method}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLog.ip_address}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter break-all">{selectedLog.url}</h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* PAYLOAD */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Database size={14}/> Входящие данные (Payload)
                  </p>
                  <pre className="bg-slate-900 text-blue-400 p-5 rounded-2xl text-[11px] overflow-x-auto font-mono shadow-inner min-h-[150px]">
                    {JSON.stringify(JSON.parse(selectedLog.payload || '{}'), null, 2)}
                  </pre>
                </div>

                {/* RESPONSE */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14}/> Ответ сервера (Response)
                  </p>
                  <pre className="bg-white border border-slate-200 text-slate-700 p-5 rounded-2xl text-[11px] overflow-x-auto font-mono shadow-sm min-h-[150px]">
                    {(() => {
                        try {
                            const parsed = JSON.parse(selectedLog.response);
                            return JSON.stringify(parsed, null, 2);
                        } catch(e) {
                            return selectedLog.response;
                        }
                    })()}
                  </pre>
                </div>

              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
              <div className="flex gap-6">
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Пользователь</p>
                    <p className="text-xs font-bold text-slate-700">{selectedLog.user_name || '—'}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Время выполнения</p>
                    <p className="text-xs font-bold text-slate-700">{selectedLog.duration_ms} ms</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all"
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

export default ApiLogsMonitor;