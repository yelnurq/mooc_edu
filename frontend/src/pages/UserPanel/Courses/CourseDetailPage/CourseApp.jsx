import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, PlayCircle, ChevronDown, 
  ChevronUp, CheckCircle, Menu, X, 
  ChevronRight, Lock, Check, BookOpen,
  Download, MessageSquare, Info,
  Maximize2, Minimize2, ArrowRight, Share2, 
  Award, RefreshCw, ExternalLink, FileArchive, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api/axios';

// --- КОМПОНЕНТ ТЕСТА ---
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
        <p className="text-slate-500 mb-8 font-medium max-w-xs">
          Ваш результат: <span className="text-slate-900 font-bold">{displayResult?.score}%</span> 
          <br /> 
          Правильных ответов: {displayResult?.correct_answers || displayResult?.correct_count} из {displayResult?.total_questions || displayResult?.total_count}
        </p>

        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8 w-full max-w-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Статус доступа</p>
            <p className="text-xs font-bold text-slate-700">Повторное прохождение заблокировано системой.</p>
        </div>

        <button 
          onClick={() => setTestStarted(false)}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          Вернуться к материалам
        </button>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
        <div className="max-w-2xl mx-auto mb-8 text-center">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Тестирование</h3>
            <h2 className="text-xl font-bold text-slate-900">{quiz?.title}</h2>
        </div>

        {quiz?.questions?.map((q, idx) => (
          <div key={q.id} className="max-w-2xl mx-auto bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
            <div className="flex gap-4 mb-6">
              <span className="shrink-0 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
              <p className="text-base font-bold text-slate-800 leading-tight pt-1">{q.question_text}</p>
            </div>
            <div className="grid gap-2">
              {q.options?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedAnswers[q.id] === opt.id 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                    : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAnswers[q.id] === opt.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {selectedAnswers[q.id] === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-xs font-bold">{opt.option_text}</span>
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
          className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-20 flex items-center gap-3"
        >
          {completing ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [openModules, setOpenModules] = useState([0]);

  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/courses/${id}`);
        const data = response.data;
        setCourse(data);
        setCompletedLessons((data.completed_lessons_ids || []).map(id => Number(id)));
        
        const allLessons = data.modules?.flatMap(m => m.lessons) || [];
        const nextToComplete = allLessons.find(l => !data.completed_lessons_ids.includes(Number(l.id)));
        setActiveLesson(nextToComplete || allLessons[0]);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  // Склеиваем модули с их результатами
  const modulesWithResults = useMemo(() => {
    if (!course || !course.modules) return [];
    return course.modules.map(module => {
      if (!module.quiz) return module;
      const result = course.quiz_results?.find(r => Number(r.quiz_id) === Number(module.quiz.id));
      return { ...module, quiz: { ...module.quiz, user_result: result || null } };
    });
  }, [course]);

  // Итоговый экзамен курса (полиморфная связь Course -> Quiz)
  const courseExam = useMemo(() => {
    if (!course || !course.quiz) return null;
    const result = course.quiz_results?.find(r => Number(r.quiz_id) === Number(course.quiz.id));
    return { ...course.quiz, user_result: result || null };
  }, [course]);

  const activeModule = useMemo(() => {
    if (!modulesWithResults.length || !activeLesson) return null;
    return modulesWithResults.find(m => 
      m.lessons.some(l => Number(l.id) === Number(activeLesson.id))
    );
  }, [modulesWithResults, activeLesson]);

  // Определение текущего квиза: либо модуль, либо курс
  const currentQuiz = useMemo(() => {
    if (!testStarted) return null;
    if (activeLesson && activeModule?.quiz) return activeModule.quiz;
    return courseExam;
  }, [testStarted, activeLesson, activeModule, courseExam]);

  const flatLessons = useMemo(() => course?.modules?.flatMap(m => m.lessons) || [], [course]);
  const progressPercentage = useMemo(() => {
    if (!flatLessons.length) return 0;
    return Math.round((completedLessons.length / flatLessons.length) * 100);
  }, [flatLessons, completedLessons]);

  const handleCompleteLesson = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      await api.post(`/lessons/${activeLesson.id}/complete`);
      setCompletedLessons(prev => Array.from(new Set([...prev, Number(activeLesson.id)])));
    } catch (err) { console.error(err); } 
    finally { setCompleting(false); }
  };

  const handleFinishTest = async () => {
    if (!currentQuiz || completing) return;
    setCompleting(true);
    try {
      const response = await api.post(`/quizzes/${currentQuiz.id}/submit`, {
        answers: selectedAnswers
      });
      setTestResult(response.data);
      
      setCourse(prev => ({
          ...prev,
          quiz_results: [...(prev.quiz_results || []), { 
              quiz_id: currentQuiz.id, 
              ...response.data 
          }]
      }));

      if (response.data.passed && activeLesson) handleCompleteLesson();
    } catch (err) {
      console.error("Ошибка теста:", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black uppercase tracking-widest text-slate-400">Загрузка...</div>;

  return (
    <div className={`h-screen w-full flex bg-white overflow-hidden relative font-sans ${isFocusMode ? 'focus-mode' : ''}`}>
      
      {/* SIDEBAR */}
      {!isFocusMode && (
        <aside className={`h-full bg-slate-50 border-r transition-all duration-300 flex-shrink-0 z-[60] relative ${isSidebarOpen ? 'w-[320px]' : 'w-[80px]'}`}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 h-[81px] border-b flex justify-between items-center bg-white shrink-0">
                <h2 className="font-black text-[11px] uppercase tracking-widest text-slate-900">Программа</h2>
                {isSidebarOpen && <button onClick={() => setIsSidebarOpen(false)}><X size={18} className="text-slate-400"/></button>}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {modulesWithResults.map((module, mIdx) => (
                <div key={module.id} className="space-y-2">
                  <button 
                    onClick={() => setOpenModules(prev => prev.includes(mIdx) ? prev.filter(i => i !== mIdx) : [...prev, mIdx])}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
                  >
                    <span className="font-bold text-[11px] text-slate-700 uppercase truncate">{module.title}</span>
                    <ChevronDown size={14} className={openModules.includes(mIdx) ? 'rotate-180' : ''} />
                  </button>
                  
                  {openModules.includes(mIdx) && (
                    <div className="ml-2 pl-2 border-l-2 border-slate-100 space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLesson(lesson); setTestStarted(false); setTestResult(null); setSelectedAnswers({}); }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-[11px] font-semibold transition-all ${Number(activeLesson?.id) === Number(lesson.id) && !testStarted ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}
                        >
                          {completedLessons.includes(Number(lesson.id)) ? <Check size={14} className="text-green-500"/> : <PlayCircle size={14}/>}
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      ))}

                      {module.quiz && (
                        <button
                          onClick={() => { setActiveLesson(module.lessons[0]); setTestStarted(true); setTestResult(null); setSelectedAnswers({}); }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl border border-dashed mt-2 ${testStarted && activeModule?.id === module.id ? 'bg-slate-900 text-white' : 'text-blue-600 border-blue-200 bg-blue-50/50'}`}
                        >
                          {module.quiz.user_result ? <CheckCircle size={14} className="text-emerald-500" /> : <Award size={14} />}
                          <div className="flex flex-col text-left">
                              <span className="text-[10px] font-black uppercase">Тест модуля</span>
                              <span className="text-[9px] opacity-70">{module.quiz.user_result ? `Результат: ${module.quiz.user_result.score}%` : 'Пройти проверку'}</span>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* ЭКЗАМЕН КУРСА */}
              {courseExam && (
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <p className="px-3 text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Итоговая аттестация</p>
                  <button
                    onClick={() => { setActiveLesson(null); setTestStarted(true); setTestResult(null); setSelectedAnswers({}); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all ${testStarted && !activeLesson ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${testStarted && !activeLesson ? 'bg-white/10' : 'bg-emerald-100'}`}>
                        <Award size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] font-black uppercase leading-none mb-1">Экзамен курса</span>
                        <span className="text-[10px] opacity-70 font-bold">
                          {courseExam.user_result ? `Пройден: ${courseExam.user_result.score}%` : 'Начать финал'}
                        </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t shrink-0">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Прогресс курса</span>
                    <span className="text-xs font-bold text-blue-600">{progressPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <header className="h-[81px] px-8 flex items-center justify-between border-b bg-white shrink-0 z-30">
            <h2 className="text-sm font-bold text-slate-900 truncate">
                {testStarted 
                  ? (activeLesson ? `Тест модуля: ${activeModule?.title}` : `Итоговый экзамен курса`) 
                  : activeLesson?.title}
            </h2>
            <div className="flex gap-4">
                <button onClick={() => setIsFocusMode(!isFocusMode)} className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-xl flex items-center justify-center border">
                    {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                {!testStarted && activeLesson && (
                    <button onClick={handleCompleteLesson} disabled={completing || completedLessons.includes(Number(activeLesson?.id))} className={`h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${completedLessons.includes(Number(activeLesson?.id)) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600'}`}>
                        {completedLessons.includes(Number(activeLesson?.id)) ? 'Урок пройден' : 'Завершить урок'}
                    </button>
                )}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className={`w-full flex justify-center transition-all duration-500 ${isFocusMode ? 'p-0 h-[85vh]' : 'p-4 md:p-12'}`}>
            <div className={`w-full max-w-6xl aspect-video bg-black shadow-2xl overflow-hidden relative ${isFocusMode ? 'h-full' : 'rounded-[3rem] border-[8px] border-white'}`}>
              
              {testStarted ? (
                <QuizView 
                    quiz={currentQuiz}
                    selectedAnswers={selectedAnswers}
                    setSelectedAnswers={setSelectedAnswers}
                    handleFinishTest={handleFinishTest}
                    testResult={testResult}
                    setTestStarted={setTestStarted}
                    completing={completing}
                    viewOnly={!!currentQuiz?.user_result}
                />
              ) : (
                <iframe 
                  src={activeLesson?.type === 'pdf' ? activeLesson.file_url : `https://www.youtube.com/embed/${activeLesson?.video_url?.split('v=')[1]}?rel=0&modestbranding=1`} 
                  className="w-full h-full border-none bg-white" 
                  allowFullScreen 
                />
              )}
            </div>
          </div>

          {!testStarted && activeLesson && (
            <div className="max-w-4xl mx-auto w-full p-12 pb-32">
                <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
                    <button className="flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-600">
                        <Info size={16} /> Инструкции к уроку
                    </button>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 text-sm whitespace-pre-wrap leading-loose">
                    {activeLesson?.description || "Для этого урока нет дополнительных инструкций."}
                </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CourseAppPage;