import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, PlayCircle, CheckCircle, X, Check, 
  Award, Info, Maximize2, Minimize2, RefreshCw,
  Rocket, Book, PenTool, User, MessageSquare, Download, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

// --- КОМПОНЕНТ ТЕСТА (Встроенный в плеер) ---
const QuizView = ({ quiz, selectedAnswers, setSelectedAnswers, handleFinishTest, testResult, setTestStarted, completing, viewOnly }) => {
  const displayResult = testResult || quiz?.user_result;

  if (viewOnly || testResult) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full bg-white p-8 text-center overflow-y-auto custom-scrollbar">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${displayResult?.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {displayResult?.passed ? <Award size={40} /> : <Info size={40} />}
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-slate-900">
          {displayResult?.passed ? 'Тест пройден' : 'Результаты теста'}
        </h2>
        <p className="text-slate-500 mb-8 font-medium">
          Ваш результат: <span className="text-slate-900 font-bold">{displayResult?.score}%</span> 
        </p>
        <button onClick={() => setTestStarted(false)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">
          Вернуться к видео
        </button>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        <div className="text-center mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Тестирование</h3>
            <h2 className="text-xl font-bold text-slate-900">{quiz?.title}</h2>
        </div>
        {quiz?.questions?.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-800 mb-4">{idx + 1}. {q.question_text}</p>
            <div className="grid gap-2">
              {q.options?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left text-xs font-bold ${selectedAnswers[q.id] === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAnswers[q.id] === opt.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                    {selectedAnswers[q.id] === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  {opt.option_text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-white border-t flex justify-center">
        <button 
          disabled={completing || !quiz?.questions || Object.keys(selectedAnswers).length < quiz.questions.length}
          onClick={handleFinishTest}
          className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center gap-2"
        >
          {completing ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
          Отправить ответы
        </button>
      </div>
    </div>
  );
};

const CourseAppPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        const data = response.data;
        setCourse(data);
        setCompletedLessons((data.completed_lessons_ids || []).map(id => Number(id)));
        const allLessons = data.modules?.flatMap(m => m.lessons) || [];
        setActiveLesson(allLessons[0]);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCourseData();
  }, [id]);

  // Данные для сайдбара
  const modulesWithResults = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.map(module => {
      const result = course.quiz_results?.find(r => Number(r.quiz_id) === Number(module.quiz?.id));
      return { ...module, quiz: module.quiz ? { ...module.quiz, user_result: result || null } : null };
    });
  }, [course]);

  const courseExam = useMemo(() => {
    if (!course?.quiz) return null;
    const result = course.quiz_results?.find(r => Number(r.quiz_id) === Number(course.quiz.id));
    return { ...course.quiz, user_result: result || null };
  }, [course]);

  const activeModule = useMemo(() => {
    return modulesWithResults.find(m => m.lessons.some(l => Number(l.id) === Number(activeLesson?.id)));
  }, [modulesWithResults, activeLesson]);

  const currentQuiz = useMemo(() => {
    if (!testStarted) return null;
    return (activeLesson && activeModule?.quiz) ? activeModule.quiz : courseExam;
  }, [testStarted, activeLesson, activeModule, courseExam]);

  const handleCompleteLesson = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      await api.post(`/lessons/${activeLesson.id}/complete`);
      setCompletedLessons(prev => [...new Set([...prev, Number(activeLesson.id)])]);
    } catch (err) { console.error(err); } finally { setCompleting(false); }
  };

  const handleFinishTest = async () => {
    if (!currentQuiz || completing) return;
    setCompleting(true);
    try {
      const resp = await api.post(`/quizzes/${currentQuiz.id}/submit`, { answers: selectedAnswers });
      setTestResult(resp.data);
      setCourse(prev => ({
        ...prev,
        quiz_results: [...(prev.quiz_results || []), { quiz_id: currentQuiz.id, ...resp.data }]
      }));
      if (resp.data.passed && activeLesson) handleCompleteLesson();
    } catch (err) { console.error(err); } finally { setCompleting(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 tracking-widest">ЗАГРУЗКА...</div>;

  return (
    <div className="h-screen w-full flex bg-[#F0F2F9] overflow-hidden font-sans">
      
      {/* 1. ГЛОБАЛЬНЫЙ САЙДБАР (Слева) */}
      <aside className="w-[75px] bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-10 shrink-0">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Rocket size={24} />
        </div>
        <nav className="flex flex-col gap-8 text-slate-300">
          <Book size={22} className="text-indigo-600" />
          <PenTool size={22} className="hover:text-slate-400 transition-colors cursor-pointer" />
          <User size={22} className="hover:text-slate-400 transition-colors cursor-pointer" />
          <MessageSquare size={22} className="hover:text-slate-400 transition-colors cursor-pointer" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. HEADER */}
        <header className="h-[80px] px-10 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Урок {activeLesson ? (course?.modules?.flatMap(m=>m.lessons).findIndex(l=>l.id===activeLesson.id)+1) : 'Экзамен'}</span>
            <h1 className="text-lg font-bold text-slate-900">{testStarted ? 'Тестирование' : activeLesson?.title}</h1>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Преподаватель</p>
                    <p className="text-xs font-bold text-slate-900">Алексей Ширяев</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=Алексей+Ширяев&background=6366f1&color=fff`} alt="avatar" />
                </div>
             </div>
          </div>
        </header>

        {/* 3. ОСНОВНОЙ КОНТЕНТ */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1500px] mx-auto space-y-8">
            
           {/* ВЕРХНИЙ РЯД (ПЛЕЕР + САЙДБАР) */}
{/* ОСНОВНОЙ КОНТЕЙНЕР: xl:h-[750px] для больших, h-auto для маленьких */}
<div className="flex flex-col xl:flex-row gap-8 items-stretch h-auto xl:h-[750px]"> 
  
  {/* ЛЕВАЯ КОЛОНКА: ПЛЕЕР */}
  {/* На мобилках используем aspect-video, на больших — h-full (750px) */}
  <div className="flex-[2.5] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-[6px] md:border-[10px] border-white relative aspect-video xl:aspect-auto xl:h-full">
    {testStarted ? (
       <QuizView /* ...props */ />
    ) : (
      <iframe 
        src={activeLesson?.video_url ? `https://www.youtube.com/embed/${activeLesson.video_url.split('v=')[1]}?rel=0&modestbranding=1` : ''} 
        className="w-full h-full bg-slate-900" 
        allowFullScreen 
      />
    )}
  </div>

  {/* ПРАВАЯ КОЛОНКА: СПИСОК */}
  {/* На маленьких экранах задаем max-height, чтобы список не уходил в бесконечность */}
  <div className="flex-1 bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col h-[500px] xl:h-full overflow-hidden border border-white/50">
    
    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2 shrink-0">
      Программа обучения
    </h3>
    
    {/* ВНУТРЕННИЙ СКРОЛЛ */}
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 h-0">
      {modulesWithResults.map((module, mIdx) => (
        <div key={module.id} className="space-y-3">
          <div className="px-2">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Модуль {mIdx + 1}</p>
            <h4 className="text-[11px] font-bold text-slate-800 uppercase">{module.title}</h4>
          </div>

          <div className="space-y-1">
            {module.lessons.map((lesson) => (
              <button 
                key={lesson.id}
                onClick={() => { setActiveLesson(lesson); setTestStarted(false); setTestResult(null); }}
                className={`w-full group flex items-start gap-3 p-3 rounded-2xl transition-all ${activeLesson?.id === lesson.id && !testStarted ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'}`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${completedLessons.includes(Number(lesson.id)) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                  {completedLessons.includes(Number(lesson.id)) ? <Check size={10} strokeWidth={4} /> : <div className="w-1 h-1 bg-slate-300 rounded-full" />}
                </div>
                <span className={`text-[12px] font-bold text-left leading-tight ${activeLesson?.id === lesson.id && !testStarted ? 'text-indigo-900' : 'text-slate-500'}`}>{lesson.title}</span>
              </button>
            ))}

            {module.quiz && (
              <button 
                onClick={() => { setActiveLesson(module.lessons[0]); setTestStarted(true); setTestResult(null); }}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl border-2 border-dashed transition-all mt-3 ${testStarted && activeModule?.id === module.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50'}`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-lg flex items-center justify-center ${testStarted && activeModule?.id === module.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Award size={12} />
                </div>
                <div className="text-left">
                  <p className={`text-[10px] font-black uppercase tracking-tight ${testStarted && activeModule?.id === module.id ? 'text-white' : 'text-indigo-600'}`}>Тест модуля</p>
                  {module.quiz.user_result && <p className="text-[9px] font-bold opacity-70">Результат: {module.quiz.user_result.score}%</p>}
                </div>
              </button>
            )}
          </div>
        </div>
      ))}
      {/* ... (остальной код с экзаменом) */}
    </div>
    
    <button 
      onClick={handleCompleteLesson}
      className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-lg shadow-indigo-100 shrink-0"
    >
      {completedLessons.includes(Number(activeLesson?.id)) ? 'Урок завершен' : 'Завершить урок'}
    </button>
  </div>
</div>

            {/* НИЖНИЙ РЯД (ОПИСАНИЕ + ФАЙЛЫ) */}
            {/* НИЖНИЙ РЯД (ОПИСАНИЕ + ФАЙЛЫ) */}
<div className="grid lg:grid-cols-3 gap-8 pb-20 items-start">
  
  <div className="lg:col-span-2 space-y-6">
    <div className="bg-white/70 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white shadow-sm text-left">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Описание занятия</h3>
        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-wrap text-left">
          {/* Приоритет: описание текущего урока, если нет — общее описание курса */}
          {activeLesson?.description || course?.description || "Описание для этого материала не предоставлено."}
        </div>
    </div>
    
    <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-indigo-200">
       <div className="text-left">
          <h4 className="text-lg font-bold mb-1">Нужна помощь?</h4>
          <p className="text-indigo-200 text-xs">Напишите куратору, если у вас возникли вопросы по материалу.</p>
       </div>
       <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shrink-0">
          Открыть чат
       </button>
    </div>
  </div>

  <div className="space-y-6">
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
         <Download size={16} /> Материалы
       </h3>
       <div className="space-y-4">
          {/* Рендерим ресурсы курса из API */}
          {course?.course_resources && course.course_resources.length > 0 ? (
            course.course_resources.map((resource, i) => (
              <a 
                key={resource.id || i} 
                href={resource.file_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <FileText size={20} />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate">{resource.name || 'Документ'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{resource.size || 'Просмотреть'}</p>
                </div>
              </a>
            ))
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Файлы отсутствуют</p>
            </div>
          )}
       </div>
    </div>
  </div>

</div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default CourseAppPage;