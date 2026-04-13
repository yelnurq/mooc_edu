import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, Award, Download, FileText, Calendar, 
  ShieldCheck, Trophy, Share2, RefreshCw, PieChart,
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (СТИЛЬ КАК В КУРСАХ) ---

const ProgressCircle = ({ progress }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
        <motion.circle
          cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="text-blue-600"
        />
      </svg>
      <span className="absolute text-[9px] font-black text-slate-900">{progress}%</span>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, colorClass, description }) => (
  <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all text-left group">
    <div className={`absolute top-0 left-0 w-1 h-full ${colorClass.split(' ')[1].replace('text-', 'bg-')}`} />
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
const CertificateCard = ({ cert, onDownload, isDownloading }) => {
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white rounded-2xl border border-slate-200 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:border-blue-400 hover:shadow-lg"
    >
      {/* ВЕРХНЯЯ ЧАСТЬ (Header) */}
      <div className="relative h-28 w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none uppercase font-black text-[32px] leading-none break-all select-none">
          {cert.uuid}
        </div>
        
        <div className="relative z-10 w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Award size={24} className="text-blue-600" />
        </div>

        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[8px] font-black uppercase tracking-wider">
            <ShieldCheck size={10} /> Verified
          </div>
        </div>
      </div>

      <div className="p-5 text-left flex-grow">
        {/* КУРС И АВТОР */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-grow bg-slate-100"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Certificate of Completion
            </span>
            <div className="h-px flex-grow bg-slate-100"></div>
          </div>
          
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem] mb-1">
            {cert.course_title}
          </h3>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-medium">Автор:</span>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
              {cert.author_name || 'Educational Platform'}
            </span>
          </div>
        </div>

        {/* ДЕТАЛИ ВЫДАЧИ */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed border-slate-200">
           <div className="space-y-0.5">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Выдано</p>
              <p className="text-[10px] font-black text-slate-800 italic uppercase">
                {cert.issue_date}
              </p>
           </div>
           <div className="space-y-0.5 text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">ID Документа</p>
              <p className="text-[10px] font-bold text-slate-800 truncate" title={cert.uuid}>
                #{cert.uuid}
              </p>
           </div>
        </div>
      </div>

      {/* КНОПКА СКАЧАТЬ */}
      <button 
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isDownloading ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : (
          <>
            <Download size={14} /> 
            Download PDF
          </>
        )}
      </button>
    </motion.div>
  );
};
// --- ОСНОВНОЙ КОМПОНЕНТ ---

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/my-certificates');
      setCertificates(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  const handleDownload = async (cert) => {
    if (!cert.uuid) return;
    setDownloadingId(cert.id);
    try {
      const response = await api.get(`/certificates/${cert.uuid}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${cert.uuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Ошибка при загрузке");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => 
      c.course_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [certificates, searchQuery]);

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Достижения</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Официальные документы и квалификации, полученные за <br/> успешное прохождение учебных дисциплин.
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-900 text-white shadow-lg">
             Все сертификаты
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-6 text-left">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="ПОИСК ПО ID ИЛИ НАЗВАНИЮ..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold uppercase outline-none focus:border-blue-500 shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Статус</p>
                  <p className="text-xl font-black text-slate-900 tracking-tight">Подлинность</p>
               </div>
               <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={24} /></div>
            </div>
            <div className="pt-4 border-t border-slate-50">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
                 Все документы верифицированы и имеют уникальный цифровой след.
               </p>
            </div>
          </div>

          <StatCard 
            label="Всего наград" 
            value={certificates.length} 
            icon={Trophy} 
            colorClass="bg-blue-50 text-blue-600" 
            description="Подтвержденные достижения" 
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 text-left">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
            </div>
          ) : filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredCertificates.map((cert) => (
                  <CertificateCard 
                    key={cert.id} 
                    cert={cert} 
                    onDownload={() => handleDownload(cert)}
                    isDownloading={downloadingId === cert.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                  <Award size={32} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">Наград пока нет</h3>
              <p className="text-[11px] font-medium text-slate-400 max-w-[240px] leading-relaxed uppercase">
                Завершите любой курс на 100% и успешно сдайте финальный экзамен, чтобы получить сертификат.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      {!loading && (
        <div className="text-left mt-16 pt-8 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            Выданные документы соответствуют образовательным стандартам платформы.
          </p>
        </div>
      )}
    </main>
  );
};

export default MyCertificates;