import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, Award, Download, FileText, Calendar, 
  ShieldCheck, CheckCircle2, Trophy, Share2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

const CertificateCard = ({ cert, onDownload, isDownloading }) => {
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white rounded-2xl border border-slate-200 transition-all flex flex-col overflow-hidden shadow-sm hover:border-blue-400 hover:shadow-lg"
    >
      {/* ПРЕВЬЮ СЕРТИФИКАТА */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
        {cert.preview_image ? (
          <img 
            src={cert.preview_image} 
            alt={cert.course_title}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
             <Award size={40} className="text-blue-500 mb-3 opacity-50" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Official Certificate</p>
          </div>
        )}
        
        {/* Бейдж верификации */}
        <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white rounded-full shadow-xl">
                <ShieldCheck size={12} />
                <span className="text-[9px] font-black uppercase tracking-wider">Verified</span>
            </div>
        </div>
      </div>

      <div className="p-6 text-left flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              {cert.category || 'Сертификация'}
            </p>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-snug line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">
              {cert.course_title}
            </h3>
          </div>

          <div className="flex items-center gap-4 py-3 border-y border-slate-50">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-600 uppercase italic">
                {cert.issue_date}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-600 uppercase">
                ID: {cert.uuid?.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button 
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
          >
            {isDownloading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <><Download size={14} /> Скачать</>
            )}
          </button>
          <button 
            className="px-4 py-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
            title="Поделиться"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

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
  // Проверяем наличие номера сертификата (uuid в твоем стейте)
  if (!cert.uuid) {
    console.error("Certificate number (uuid) is missing");
    return;
  }

  setDownloadingId(cert.id);
  try {
    // URL теперь соответствует новому роуту /certificates/{number}/download
    const response = await api.get(`/certificates/${cert.uuid}/download`, {
      responseType: 'blob',
    });

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
    console.error("Download Error:", err);
    alert("Ошибка при загрузке файла");
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
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] min-h-screen text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Достижения и сертификаты</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Официальные документы, подтверждающие успешное прохождение дисциплин.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="ПОИСК ПО НАЗВАНИЮ..." 
              className="bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-[11px] font-bold uppercase outline-none focus:border-blue-500 shadow-sm transition-all w-[240px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Trophy size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Всего получено</p>
               <p className="text-2xl font-black text-slate-900">{certificates.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Верифицировано</p>
               <p className="text-2xl font-black text-slate-900">{certificates.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-slate-900 text-white rounded-xl"><ShieldCheck size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус системы</p>
               <p className="text-[14px] font-black uppercase mt-1 tracking-tight">Активна</p>
            </div>
         </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">Сертификаты не найдены</h3>
          <p className="text-[11px] font-medium text-slate-400 max-w-[280px] leading-relaxed uppercase">
              Завершите обучение на 100%, чтобы получить документ.
          </p>
        </div>
      )}

      {/* FOOTER */}
      {!loading && (
        <div className="text-left mt-16 pt-8 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-wide max-w-4xl">
            Все выданные сертификаты являются именными и содержат уникальный номер.
          </p>
        </div>
      )}
    </main>
  );
};

export default MyCertificates;