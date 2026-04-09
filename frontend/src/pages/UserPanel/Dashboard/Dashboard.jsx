import React, { useState } from 'react';
import { 
  BookOpen, GraduationCap, Clock, Award, 
  ChevronRight, Calendar, FileText, TrendingUp,
  Bell, Book, BarChart3, CheckCircle2, 
  Trophy, Target, ArrowUpRight
} from 'lucide-react';

// Карточка статистики (без изменений в стиле)
const StatCard = ({ icon: Icon, label, value, subValue, colorClass, description }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110 ${colorClass.split(' ')[0]}`} />
    <div className="flex justify-between items-start relative z-10">
      <div className="space-y-1 text-left">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
          {subValue && <span className="text-xs font-bold text-slate-400">{subValue}</span>}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase leading-relaxed text-left">{description}</p>
  </div>
);

const StudentDashboard = () => {
  const courses = [
    { id: 1, title: 'Web Frameworks (React/Laravel)', grade: 95, credits: 5, instructor: 'Dr. Smith', attendance: '92%' },
    { id: 2, title: 'Software Architecture', grade: 88, credits: 4, instructor: 'Prof. Johnson', attendance: '85%' },
    { id: 3, title: 'Higher Mathematics (Calculus)', grade: 92, credits: 3, instructor: 'Dr. Alan', attendance: '100%' },
  ];

  const recentGrades = [
    { subject: 'Database Design', type: 'Exam', score: 98, date: '05.04.2026' },
    { subject: 'Network Security', type: 'Quiz', score: 85, date: '02.04.2026' },
  ];

  return (
    <main className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 text-left">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
              <GraduationCap size={20} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Личный кабинет</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Казахский университет технологии и бизнеса • 4 курс</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 pr-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold">ZE</div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-900 leading-none">ЗЕЙНОЛЛА Е.</p>
            <p className="text-[9px] font-bold text-blue-600 uppercase mt-1">Full-stack Developer</p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="GPA" value="3.84" subValue="/ 4.0" icon={TrendingUp} colorClass="bg-blue-50 text-blue-600" description="Текущий семестр" />
        <StatCard label="ECTS" value="142" subValue="Кредитов" icon={BookOpen} colorClass="bg-emerald-50 text-emerald-600" description="Общий прогресс обучения" />
        <StatCard label="Посещаемость" value="94%" icon={Clock} colorClass="bg-amber-50 text-amber-600" description="Март — Апрель" />
        <StatCard label="Награды" value="12" icon={Award} colorClass="bg-purple-50 text-purple-600" description="KPI и достижения" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {/* ПОСЛЕДНИЕ ОЦЕНКИ */}
          <section className="text-left">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" /> Последние результаты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentGrades.map((grade, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-blue-400 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                      <Target size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{grade.subject}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{grade.type} • {grade.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-600 tracking-tighter">{grade.score}</span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Баллов</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* КУРСЫ */}
          <section className="text-left">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Book size={14} className="text-blue-600" /> Текущие дисциплины
              </h2>
            </div>
            <div className="grid gap-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all group flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">{course.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{course.instructor} • {course.credits} ECTS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Посещение</p>
                      <p className="text-xs font-black text-slate-900">{course.attendance}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">{course.grade}</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Балл</p>
                      </div>
                      <button className="p-2 bg-slate-50 rounded-lg text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-left sticky top-10">
            
            {/* ЕДИНЫЙ БЛОК СТАТИСТИКИ КУРСОВ */}
            <div className="mb-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-600" /> Статистика обучения
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[20px] font-black text-slate-900 leading-none mb-1">42</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">Всего курсов за 4 года</p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-[20px] font-black text-blue-600 leading-none mb-1">38</p>
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter leading-tight">Завершено успешно</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Прогресс диплома</span>
                    <span className="text-lg font-black text-slate-900 tracking-tighter">90%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ДЕДЛАЙНЫ */}
            <div className="pt-8 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-5 tracking-widest">Ближайшие события</span>
              <div className="space-y-5">
                {[
                  { title: 'Защита практики', date: 'Завтра, 11:30', type: 'Work' },
                  { title: 'Экзамен: Cloud Systems', date: '18 Апреля', type: 'Exam' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 tracking-tight">{item.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.date}</p>
                    </div>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95">
              Выгрузить транскрипт
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudentDashboard;