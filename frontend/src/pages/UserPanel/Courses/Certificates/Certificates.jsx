import React, { useState, useMemo } from 'react';
import { 
  Trophy, Download, ExternalLink, Search, 
  Award, Calendar, ShieldCheck, Share2, Eye,
  Star, FileText, ChevronRight
} from 'lucide-react';

const Certificates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  // ФЕЙКОВЫЕ ДАННЫЕ
  const fakeCertificates = [
    {
      id: 1,
      course_title: "Laravel & React: Построение Enterprise систем",
      category: "Fullstack Development",
      issue_date: "12.03.2026",
      cert_number: "CERT-LX-99281",
      image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=2000&auto=format&fit=crop",
      grade: "A+",
      instructor: "Alexander Dev"
    },
    {
      id: 2,
      course_title: "Архитектура баз данных: PostgreSQL и MySQL",
      category: "Backend",
      issue_date: "28.02.2026",
      cert_number: "CERT-DB-11029",
      image: "https://images.unsplash.com/photo-1629904853716-f0bc54eea481?q=80&w=2000&auto=format&fit=crop",
      grade: "A",
      instructor: "Sarah Postgres"
    },
    {
      id: 3,
      course_title: "Продвинутый UI/UX для SaaS платформ",
      category: "Design",
      issue_date: "15.01.2026",
      cert_number: "CERT-UI-88374",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop",
      grade: "A+",
      instructor: "Mika UX"
    }
  ];

  const filteredCerts = useMemo(() => 
    fakeCertificates.filter(c => c.course_title.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-12 bg-white min-h-screen text-left">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            <Award size={12} /> Ваши достижения
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Сертификаты</h1>
          <p className="text-slate-400 font-medium max-w-md">Здесь хранятся официальные подтверждения ваших навыков и завершенных курсов.</p>
        </div>

        <div className="relative group w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Найти по названию..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] text-sm focus:ring-4 ring-indigo-500/5 outline-none transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatMiniCard label="Всего" value={fakeCertificates.length} color="text-indigo-600" />
        <StatMiniCard label="С отличием" value="2" color="text-amber-500" />
        <StatMiniCard label="Верифицировано" value="100%" color="text-emerald-500" />
        <StatMiniCard label="Курсов в работе" value="4" color="text-slate-400" />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCerts.map((cert) => (
          <div key={cert.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-4 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
            
            {/* CERTIFICATE IMAGE / PREVIEW */}
            <div 
              className="relative aspect-[1.4/1] rounded-[2rem] overflow-hidden bg-slate-100 mb-6 cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <img src={cert.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-xl">
                  <Eye size={20} />
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-indigo-600 shadow-sm">
                  Grade {cert.grade}
                </span>
              </div>
            </div>

            {/* INFO */}
            <div className="px-2 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{cert.category}</span>
                  <span className="text-[10px] font-bold text-slate-300">{cert.cert_number}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                  {cert.course_title}
                </h3>
              </div>

              <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400">
                <div className="flex items-center gap-2"><Calendar size={14} /> {cert.issue_date}</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Verfied</div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex gap-3">
                <button className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                  <Download size={14} /> Скачать PDF
                </button>
                <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PREVIEW */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl transition-all">
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedCert(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:rotate-90 transition-transform"
            >
              ✕
            </button>
            
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 bg-slate-50 p-8 lg:p-12 flex items-center justify-center">
                <img src={selectedCert.image} className="w-full shadow-2xl rounded-lg border-8 border-white" alt="Certificate Preview" />
              </div>
              <div className="w-full lg:w-80 p-8 lg:p-10 space-y-8 border-l border-slate-50">
                <div className="space-y-2 text-left">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">{selectedCert.course_title}</h4>
                  <p className="text-xs text-slate-400 font-medium">Выдан на имя: Zeynoalla Yelnur</p>
                </div>

                <div className="space-y-4">
                  <DetailRow label="Номер" value={selectedCert.cert_number} />
                  <DetailRow label="Дата" value={selectedCert.issue_date} />
                  <DetailRow label="Инструктор" value={selectedCert.instructor} />
                  <DetailRow label="Результат" value="98/100" />
                </div>

                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                  Верифицировать в LinkedIn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// MINI HELPERS
const StatMiniCard = ({ label, value, color }) => (
  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[2rem] text-left hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
    <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-3 text-left">
    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{label}</span>
    <span className="text-xs font-black text-slate-700">{value}</span>
  </div>
);

export default Certificates;