import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, CheckCircle, Check, Award, Info, RefreshCw, Lock,
  Rocket, Book, PenTool, User, MessageSquare, AlertTriangle, 
  Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../api/axios';
import ReactPlayer from 'react-player';

// --- КОМПОНЕНТ ТЕСТА (LOCKDOWN MODE) ---
const QuizView = ({ quiz, selectedAnswers, setSelectedAnswers, handleFinishTest, testResult, setTestStarted, completing, viewOnly }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const displayResult = testResult || quiz?.user_result;
  const isFinishedRef = useRef(!!displayResult);
  const isStartedRef = useRef(false);

  useEffect(() => {
    isFinishedRef.current = !!displayResult;
  }, [displayResult]);

  useEffect(() => {
    const timer = setTimeout(() => {
      isStartedRef.current = true;
    }, 1000);

    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
      if (isStartedRef.current && !isFinishedRef.current && !viewOnly && quiz?.id && !displayResult) {
        api.post(`/quizzes/${quiz.id}/submit`, { 
          answers: {}, 
          is_abandoned: true 
        }).catch(err => console.error("Auto-submit failed:", err));
      }
    };
  }, [quiz?.id, viewOnly, displayResult]);

  useEffect(() => {
    if (displayResult || viewOnly) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [displayResult, viewOnly]);

  if (viewOnly || displayResult) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[50] bg-white flex flex-col items-center justify-center p-8 text-center rounded-[1.5rem]">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-emerald-100 text-emerald-600">
          <Award size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-slate-900">Тест завершен</h2>
        <p className="text-slate-500 mb-8 font-medium">Ваш результат зафиксирован: <span className="text-slate-900 font-bold">{displayResult?.score || 0}%</span></p>
        <button 
          onClick={() => {
            setTestStarted(false);
            document.body.style.overflow = 'auto';
          }} 
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
        >
          Вернуться к материалам
        </button>
      </motion.div>
    );
  }

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="absolute inset-0 z-[50] flex flex-col bg-slate-50 overflow-hidden rounded-[1.5rem]">
      <div className="bg-white px-8 py-4 border-b flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg"><AlertTriangle size={16} /></div>
          <div className="text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Режим тестирования</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase">При выходе результат будет 0%</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] font-black text-slate-900">Вопрос {currentQuestionIndex + 1} / {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= currentQuestionIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center custom-scrollbar">
        <div className="max-w-3xl w-full">
          <motion.div key={currentQuestionIndex} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
            <p className="text-xl md:text-2xl font-bold text-slate-800 mb-10 leading-tight">{currentQuestion?.question_text}</p>
            <div className="grid gap-4">
              {currentQuestion?.options?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.id }))}
                  className={`flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all text-left text-base font-bold 
                    ${selectedAnswers[currentQuestion.id] === opt.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAnswers[currentQuestion.id] === opt.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {selectedAnswers[currentQuestion.id] === opt.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                  {opt.option_text}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-8 bg-white border-t flex items-center justify-between px-12">
        <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all flex items-center gap-2">
          <ChevronLeft size={18} /> Назад
        </button>
        {!isLastQuestion ? (
          <button disabled={!selectedAnswers[currentQuestion?.id]} onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
            Следующий вопрос <ChevronRight size={18} />
          </button>
        ) : (
          <button disabled={completing || Object.keys(selectedAnswers).length < questions.length} onClick={handleFinishTest} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 disabled:opacity-30 transition-all flex items-center gap-2 shadow-xl shadow-blue-200">
            {completing ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            Завершить тестирование
          </button>
        )}
      </div>
    </div>
  );
};

// --- МОДАЛКА ПРЕДУПРЕЖДЕНИЯ ---
const QuizIntroModal = ({ onStart, onCancel, title }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white max-w-md w-full rounded-[1.5rem] p-10 shadow-2xl text-center">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">{title}</h3>
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3 text-left bg-slate-50 p-4 rounded-2xl">
          <Info className="mt-1 text-blue-600" size={16}/><p className="text-xs font-bold text-slate-600 leading-relaxed">Экран будет заблокирован. Если вы покинете страницу, результат будет 0%.</p>
        </div>
        <div className="flex items-start gap-3 text-left bg-slate-50 p-4 rounded-2xl">
          <Lock className="mt-1 text-amber-500" size={16}/><p className="text-xs font-bold text-slate-600 leading-relaxed">Не обновляйте страницу и не переключайтесь на другие уроки.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={onStart} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Начать тестирование</button>
        <button onClick={onCancel} className="w-full py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all">Я еще не готов</button>
      </div>
    </motion.div>
  </motion.div>
);

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
  const [showQuizIntro, setShowQuizIntro] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState(null);
  const [canComplete, setCanComplete] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);

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

 useEffect(() => {
  if (activeLesson) {
    const isAlreadyDone = completedLessons.includes(Number(activeLesson.id));
    setCanComplete(isAlreadyDone);
    setWatchProgress(0);

    // Страховочный таймер для видео
    if (activeLesson.video_url && !isAlreadyDone) {
      const safetyTimer = setTimeout(() => {
        setCanComplete(true);
      }, 60000); // 60 секунд как пример

      return () => clearTimeout(safetyTimer);
    }

    // Логика для PDF (у тебя уже была)
    if (!activeLesson.video_url && activeLesson.file_url && !isAlreadyDone) {
      const timer = setTimeout(() => setCanComplete(true), 30000);
      return () => clearTimeout(timer);
    }
  }
}, [activeLesson, completedLessons]);
  const handleVideoProgress = (state) => {
    const progress = Math.round(state.played * 100);
    setWatchProgress(progress);
    if (progress >= 85 && !canComplete) {
      setCanComplete(true);
    }
  };

  const allLessonsFlat = useMemo(() => course?.modules?.flatMap(m => m.lessons) || [], [course]);
  const progressPercentage = useMemo(() => !allLessonsFlat.length ? 0 : Math.round((completedLessons.length / allLessonsFlat.length) * 100), [completedLessons, allLessonsFlat]);
  const isExamAccessible = useMemo(() => progressPercentage === 100, [progressPercentage]);

  const modulesWithResults = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.map(module => {
      const result = course.quiz_results?.find(r => Number(r.quiz_id) === Number(module.quiz?.id));
      return { ...module, quiz: module.quiz ? { ...module.quiz, user_result: result || null } : null };
    });
  }, [course]);

  const activeModule = useMemo(() => modulesWithResults.find(m => m.lessons.some(l => Number(l.id) === Number(activeLesson?.id))), [modulesWithResults, activeLesson]);

  const currentQuiz = useMemo(() => {
    if (!testStarted) return null;
    if (activeLesson && activeModule?.quiz) return activeModule.quiz;
    if (!activeLesson && course?.quiz) {
        const res = course.quiz_results?.find(r => Number(r.quiz_id) === Number(course.quiz.id));
        return { ...course.quiz, user_result: res || null };
    }
    return null;
  }, [testStarted, activeLesson, activeModule, course]);

  const isLessonLocked = (lessonId) => {
    const index = allLessonsFlat.findIndex(l => l.id === lessonId);
    return index === 0 ? false : !completedLessons.includes(Number(allLessonsFlat[index - 1].id));
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson || completing || completedLessons.includes(Number(activeLesson.id))) return;
    setCompleting(true);
    try {
      await api.post(`/lessons/${activeLesson.id}/complete`);
      setCompletedLessons(prev => [...new Set([...prev, Number(activeLesson.id)])]);
    } catch (err) { console.error(err); } finally { setCompleting(false); }
  };

  const handlePrepareTest = (type, module = null) => {
    setPendingQuiz({ type, module });
    setShowQuizIntro(true);
  };
const downloadCertificate = async () => {
  // 1. Находим результат финального экзамена, чтобы получить номер сертификата (certNumber)
  const examResult = course.quiz_results?.find(r => Number(r.quiz_id) === Number(course.quiz?.id));
  
  // Берем certificate_number из результата теста (убедитесь, что бэкенд его возвращает в quiz_results)
  // Если в результатах теста его нет, можно попробовать взять из другого места или передать uuid
  const certNumber = examResult?.certificate_number;

  if (!certNumber) {
    console.error("Номер сертификата не найден");
    alert("Ошибка: Номер сертификата не найден. Попробуйте обновить страницу.");
    return;
  }

  setCompleting(true);
  try {
    // 2. Делаем запрос по НОВОМУ адресу: /certificates/{number}/download
    const response = await api.get(`/certificates/${certNumber}/download`, {
      responseType: 'blob', // Обязательно для PDF
    });

    // 3. Создаем ссылку и скачиваем
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    // Используем номер в названии файла
    link.setAttribute('download', `Certificate-${certNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Чистим память
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Ошибка при скачивании сертификата:", err);
    alert("Не удалось скачать сертификат. Пожалуйста, обратитесь в поддержку.");
  } finally {
    setCompleting(false);
  }
};
  const handleStartTest = () => {
    if (pendingQuiz.type === 'module') setActiveLesson(pendingQuiz.module.lessons[0]);
    else setActiveLesson(null);
    setTestStarted(true);
    setTestResult(null);
    setSelectedAnswers({});
    setShowQuizIntro(false);
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

  const navigateLesson = (direction) => {
    const currentIndex = allLessonsFlat.findIndex(l => l.id === activeLesson?.id);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    const targetLesson = allLessonsFlat[nextIndex];
    if (targetLesson && (direction === 'prev' || !isLessonLocked(targetLesson.id))) {
      setActiveLesson(targetLesson);
      setTestStarted(false);
      setTestResult(null);
      setSelectedAnswers({});
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 tracking-widest uppercase">Загрузка...</div>;

  return (
    <div className="h-screen w-full flex bg-[#F0F2F9] overflow-hidden font-sans">
      {showQuizIntro && (
        <QuizIntroModal 
          title={pendingQuiz?.type === 'module' ? "Тест модуля" : "Итоговый экзамен"} 
          onStart={handleStartTest} 
          onCancel={() => setShowQuizIntro(false)} 
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[80px] px-10 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                  {testStarted && !activeLesson ? 'ФИНАЛ' : `Урок ${activeLesson ? allLessonsFlat.findIndex(l=>l.id===activeLesson.id)+1 : '1'}`}
                </span>
                <h1 className="text-lg font-bold text-slate-900">{testStarted ? (activeLesson ? 'Тест модуля' : 'Итоговый экзамен') : activeLesson?.title}</h1>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-6 border-l pl-6 border-slate-200">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-blue-600" />
                </div>
                <span className="text-[10px] font-black text-slate-400">{progressPercentage}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
             <div><p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Преподаватель</p><p className="text-xs font-bold text-slate-900">Алексей Ширяев</p></div>
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden"><img src={`https://ui-avatars.com/api/?name=Alexey&background=6366f1&color=fff`} alt="ava" /></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1500px] mx-auto space-y-8">
            <div className="flex flex-col xl:flex-row gap-8 items-stretch xl:h-[700px]"> 
              <div className="flex flex-col flex-[2.5] gap-4">
                <div className="flex-1 bg-white rounded-[1.5rem] overflow-hidden shadow-2xl border-[6px] md:border-[10px] border-white relative min-h-[400px]">
                    {testStarted && currentQuiz ? (
                       <div className="fixed inset-0 z-[100] bg-white">
                        <QuizView 
                          quiz={currentQuiz} 
                          selectedAnswers={selectedAnswers} 
                          setSelectedAnswers={setSelectedAnswers} 
                          handleFinishTest={handleFinishTest} 
                          testResult={testResult} 
                          setTestStarted={setTestStarted} 
                          completing={completing} 
                        />
                      </div>
                    ) : (
                        <div className="w-full h-full">
{activeLesson?.video_url ? (
  <div className="absolute inset-0 bg-black overflow-hidden rounded-[1rem]"> 
    {/* Контейнер должен быть absolute inset-0, чтобы заполнил всё пространство родителя */}
<ReactPlayer
  key={activeLesson.id}
  // Используйте url, но убедитесь, что ссылка корректная
  src={activeLesson.video_url.includes('http') 
    ? activeLesson.video_url 
    : `https://www.youtube.com/watch?v=${activeLesson.video_url}`}
  width="100%"
  height="100%"
  controls 
  playing={false}
  onProgress={handleVideoProgress} // Теперь прогресс будет считаться точно
  onEnded={() => setCanComplete(true)}
  config={{
    youtube: {
      playerVars: { 
        modestbranding: 1, 
        rel: 0, 
        origin: window.location.origin 
      }
    }
  }}
  style={{ position: 'absolute', top: 0, left: 0 }}
/>

  </div>
                        ) : activeLesson?.file_url ? (
                          <iframe key={`pdf-${activeLesson?.id}`} src={`${activeLesson.file_url}#toolbar=0`} className="w-full h-full bg-white border-none" title={activeLesson?.title} />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-10 text-center">
                            <FileText size={48} className="text-slate-300 mb-4 opacity-50" />
                            <p className="text-slate-500 font-bold">Материалов нет</p>
                          </div>
                        )}
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between px-4">
                    <button onClick={() => navigateLesson('prev')} disabled={allLessonsFlat.findIndex(l => l.id === activeLesson?.id) <= 0} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all"><ChevronLeft size={18} /> Назад</button>
                    <button onClick={() => navigateLesson('next')} disabled={!activeLesson || allLessonsFlat.findIndex(l => l.id === activeLesson?.id) >= allLessonsFlat.length - 1 || isLessonLocked(allLessonsFlat[allLessonsFlat.findIndex(l => l.id === activeLesson?.id) + 1]?.id)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all">Вперед <ChevronRight size={18} /></button>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-[1.5rem] p-6 shadow-xl shadow-slate-200/50 flex flex-col h-[600px] xl:h-full overflow-hidden border border-white/50 ">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2 shrink-0 text-left">Программа обучения</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 h-0 text-left">
                  {modulesWithResults.map((module, mIdx) => (
                    <div key={module.id} className="space-y-3">
                      <div className="px-2"><p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Модуль {mIdx + 1}</p><h4 className="text-[11px] font-bold text-slate-800 uppercase">{module.title}</h4></div>
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => {
                          const locked = isLessonLocked(lesson.id);
                          const active = activeLesson?.id === lesson.id && !testStarted;
                          return (
                            <button key={lesson.id} disabled={locked} onClick={() => { setActiveLesson(lesson); setTestStarted(false); }} className={`w-full group flex items-start gap-3 p-3 rounded-2xl transition-all ${active ? 'bg-blue-50 shadow-sm' : 'hover:bg-slate-50 disabled:opacity-50'}`}>
                              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${completedLessons.includes(Number(lesson.id)) ? 'bg-emerald-500 border-emerald-500 text-white' : locked ? 'bg-slate-100 border-slate-200 text-slate-400' : 'border-slate-200'}`}>
                                {completedLessons.includes(Number(lesson.id)) ? <Check size={10} strokeWidth={4} /> : locked ? <Lock size={8} /> : <div className="w-1 h-1 bg-slate-300 rounded-full" />}
                              </div>
                              <span className={`text-left text-[12px] font-bold leading-tight ${active ? 'text-blue-900' : 'text-slate-500'}`}>{lesson.title}</span>
                            </button>
                          );
                        })}
                        {module.quiz && (() => {
                          const res = course.quiz_results?.find(r => Number(r.quiz_id) === Number(module.quiz.id));
                          const taken = !!res;
                          const current = testStarted && Number(currentQuiz?.id) === Number(module.quiz.id);
                          return (
                            <button disabled={taken} onClick={() => handlePrepareTest('module', module)} className={`w-full flex items-start gap-3 p-3 rounded-2xl border-2 border-dashed transition-all mt-3 ${current ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : taken ? 'border-emerald-100 bg-emerald-50 cursor-default' : 'border-blue-100 bg-blue-50/30 hover:bg-blue-50'}`}>
                              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-lg flex items-center justify-center ${taken ? 'bg-emerald-500 text-white' : current ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                {taken ? <Check size={12} /> : <Award size={12} />}
                              </div>
                              <div><p className={`text-[10px] font-black uppercase tracking-tight ${current ? 'text-white' : taken ? 'text-emerald-700' : 'text-blue-600'}`}>{taken ? 'Тест пройден' : 'Тест модуля'}</p>{res && <p className="text-[9px] font-bold opacity-70 text-left">Результат: {res.score}%</p>}</div>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                  {course?.quiz && (() => {
                    const res = course.quiz_results?.find(r => Number(r.quiz_id) === Number(course.quiz.id));
                    const taken = !!res;
                    return (
                      <div className="mt-10 pt-6 border-t border-slate-100">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 px-2">Финальный этап</p>
                        <button disabled={!isExamAccessible || taken} onClick={() => handlePrepareTest('exam')} className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 transition-all ${!isExamAccessible ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' : taken ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-600 border-blue-600 text-white shadow-lg'}`}>
                          <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${taken ? 'bg-emerald-500 text-white' : isExamAccessible ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {taken ? <Check size={14} strokeWidth={3} /> : <Rocket size={14} />}
                          </div>
                          <div><p className={`text-[10px] font-black uppercase tracking-tight ${!isExamAccessible || taken ? 'text-slate-600' : 'text-white'}`}>{taken ? 'Экзамен сдан' : 'Итоговый экзамен'}</p>{!isExamAccessible && <p className="text-[8px] font-bold text-slate-400 mt-1">Доступен при 100% курса</p>}{taken && <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1 text-left">Результат: {res.score}%</p>}</div>
                        </button>
                      </div>
                    );
                  })()}
                </div>
       <div className="mt-6 flex gap-3 shrink-0">
  {/* Кнопка НАЗАД */}
  <button 
    onClick={() => navigateLesson('prev')} 
    disabled={allLessonsFlat.findIndex(l => l.id === activeLesson?.id) <= 0}
    className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-20 transition-all shadow-sm"
  >
    <ChevronLeft size={16} /> Назад
  </button>

{/* Кнопка ДЕЙСТВИЯ / СТАТУС ЭКЗАМЕНА / СКАЧАТЬ СЕРТИФИКАТ */}
{(() => {
  const isLastLesson = allLessonsFlat.findIndex(l => l.id === activeLesson?.id) === allLessonsFlat.length - 1;
  const isLastLessonDone = completedLessons.includes(Number(activeLesson?.id));
  const examResult = course.quiz_results?.find(r => Number(r.quiz_id) === Number(course.quiz?.id));

// 1. КУРС ЗАВЕРШЕН — ПОКАЗЫВАЕМ КНОПКУ СЕРТИФИКАТА
if (isLastLesson && isLastLessonDone && examResult && examResult.passed) {
  return (
    <button 
      onClick={downloadCertificate} // Теперь вызываем твою функцию
      disabled={completing}         // Блокируем кнопку во время загрузки
      className="flex-[2] py-5 bg-amber-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] hover:bg-amber-600 transition-all shadow-xl shadow-amber-200 disabled:opacity-50"
    >
      {completing ? (
        <RefreshCw className="animate-spin" size={16} />
      ) : (
        <>Скачать сертификат <Download size={16} /></>
      )}
    </button>
  );
}

  // 2. ПОСЛЕДНИЙ УРОК ПРОЙДЕН — ПЕРЕХОД К ЭКЗАМЕНУ
  if (isLastLesson && isLastLessonDone && !examResult) {
    return (
      <button 
        onClick={() => handlePrepareTest('exam')}
        className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
      >
        Перейти к экзамену <Rocket size={16} />
      </button>
    );
  }

  // 3. СТАНДАРТНАЯ ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ)
  return (
    <button 
      onClick={() => {
        if (!completedLessons.includes(Number(activeLesson?.id))) {
          handleCompleteLesson();
        } else {
          navigateLesson('next');
        }
      }} 
      disabled={
        completing || 
        (!canComplete && !completedLessons.includes(Number(activeLesson?.id)))
      }
      className={`flex-[2] py-5 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-xl
        ${completedLessons.includes(Number(activeLesson?.id)) 
          ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' 
          : canComplete 
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70 shadow-none'}`}
    >
      {completing ? (
        <RefreshCw className="animate-spin" size={16} />
      ) : completedLessons.includes(Number(activeLesson?.id)) ? (
        <>Следующий урок <ChevronRight size={16} /></>
      ) : canComplete ? (
        <>Подтвердить прохождение <Check size={16} /></>
      ) : (
        <>Материал изучается <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse" /></>
      )}
    </button>
  );
})()}
</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 pb-20 items-start">
              <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-10 rounded-[1.5rem] border border-white shadow-sm text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Описание занятия</h3>
                  <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{activeLesson?.description || course?.description || "Описание отсутствует."}</div>
              </div>
              <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-white text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2"><Download size={16} /> Материалы</h3>
                  <div className="space-y-4">
                    {(course?.course_resources || activeLesson?.resources)?.length > 0 ? (
                      (course?.course_resources || activeLesson?.resources).map((resource, i) => (
                        <a key={resource.id || i} href={resource.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><FileText size={20} /></div>
                          <div className="overflow-hidden"><p className="text-xs font-bold text-slate-800 truncate">{resource.title || 'Документ'}</p><p className="text-[10px] text-slate-400 font-black uppercase">Открыть файл</p></div>
                        </a>
                      ))
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 uppercase px-2 italic">Дополнительных материалов нет</p>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default CourseAppPage;