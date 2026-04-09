import React from 'react';
import { 
  BookOpen, GraduationCap, Clock, Award, 
  ChevronRight, FileText, ArrowUpRight,
  Zap, Star, Layout, Trophy, Target, ExternalLink
} from 'lucide-react';

const MiniStat = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
  </div>
);

const StudentDashboard = () => {
  const courses = [
    { id: 1, title: 'Web Frameworks (React/Laravel)', progress: 65, grade: 'A', instructor: 'Online Module' },
    { id: 2, title: 'Software Architecture', progress: 40, grade: 'B+', instructor: 'Video Course' },
  ];

  const recentTests = [
    { id: 1, name: 'Unit Testing Basics', score: 98, date: 'Сегодня', color: 'text-emerald-600' },
    { id: 2, name: 'Laravel Eloquent', score: 85, date: 'Вчера', color: 'text-blue-600' },
    { id: 3, name: 'React Hooks Deep Dive', score: 92, date: '2 дня назад', color: 'text-emerald-600' },
  ];

  const certificates = [
    { id: 1, title: 'Full-stack Architect', issueDate: 'Март 2026', platform: 'Internal' },
    { id: 2, title: 'Database Expert', issueDate: 'Февраль 2026', platform: 'Verified' },
  ];

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-600 text-[9px] font-black text-white uppercase rounded-full tracking-[0.2em]">Student Pro</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Дашборд обучения</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-tight flex items-center gap-2">
            <Layout size={14} /> Твоя активность за последние 30 дней
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900 p-2 pr-6 rounded-2xl shadow-xl shadow-slate-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl border border-white/10">ZE</div>
          <div className="text-left text-white">
            <p className="text-[10px] font-black text-blue-400 leading-none uppercase tracking-widest">Зейнолла Елнұр</p>
            <p className="text-xs font-bold mt-1">Lvl 24 Developer</p>
          </div>
        </div>
      </div>

      {/* STAT BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
        <MiniStat icon={Zap} label="Пройдено курсов" value="38 / 42" trend="+2 в этом мес." color="bg-blue-600" />
        <MiniStat icon={Star} label="Средний балл" value="94.2" trend="Top 5%" color="bg-amber-500" />
        <MiniStat icon={Clock} label="Часов в обучении" value="124.5" trend="Live" color="bg-purple-600" />
        <MiniStat icon={Award} label="Сертификатов" value="12" trend="Verified" color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          
          {/* СЕКЦИЯ: ПОСЛЕДНИЕ ТЕСТЫ */}
          <section className="text-left">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <Target size={14} className="text-blue-600" /> Результаты последних модулей
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentTests.map((test) => (
                <div key={test.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 transition-all shadow-sm">
                  <p className="text-xs font-black text-slate-800 leading-tight mb-4">{test.name}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{test.date}</p>
                      <p className={`text-xl font-black tracking-tighter ${test.color}`}>{test.score}%</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* СЕКЦИЯ: ТЕКУЩИЙ ПРОГРЕСС */}
          <section className="text-left">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <Zap size={14} className="text-blue-600" /> Активные курсы
            </h2>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white p-6 rounded-[24px] border border-slate-200 hover:shadow-lg transition-all group flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm tracking-tight">{course.title}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{course.instructor}</p>
                    </div>
                  </div>
                  <div className="w-full md:w-40">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-slate-900">{course.progress}%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Progress</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* СЕКЦИЯ: ПОСЛЕДНИЕ СЕРТИФИКАТЫ */}
          <section className="text-left">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <Trophy size={14} className="text-emerald-500" /> Недавние сертификаты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-slate-900 p-5 rounded-2xl flex items-center justify-between group overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                    <Award size={80} color="white" />
                  </div>
                  <div className="relative z-10 text-left">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">{cert.platform}</p>
                    <h4 className="text-white font-bold text-sm tracking-tight">{cert.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{cert.issueDate}</p>
                  </div>
                  <button className="relative z-10 p-3 bg-white/10 rounded-xl text-white hover:bg-emerald-500 transition-all">
                    <ExternalLink size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-left sticky top-10">
            <div className="mb-8 pb-8 border-b border-slate-50">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Аналитика прогресса</h4>
                <div className="flex items-end gap-3 mb-4">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">91%</span>
                    <span className="text-xs font-bold text-emerald-600 pb-2 flex items-center gap-1">
                        <ArrowUpRight size={14} /> +2.4%
                    </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(37,99,235,0.2)]" style={{ width: '91%' }} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 leading-tight uppercase tracking-tighter">
                    Осталось всего 4 модуля. Ты идешь быстрее 85% студентов потока.
                </p>
            </div>

            <div className="space-y-4 mb-10 text-[10px] font-black uppercase tracking-widest">
                <div className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500">Завершено</span>
                    <span className="text-slate-900">38 Курсов</span>
                </div>
                <div className="flex justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <span className="text-blue-600">В процессе</span>
                    <span className="text-blue-900">3 Модуля</span>
                </div>
            </div>

            <button className="w-full py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
              <FileText size={16} /> Выгрузить транскрипт
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentDashboard;