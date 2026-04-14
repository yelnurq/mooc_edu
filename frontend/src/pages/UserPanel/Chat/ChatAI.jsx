import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, BookOpen, MessageSquare, 
  GraduationCap, RotateCcw, ShieldCheck, User, Bot, 
  Loader2, Maximize2, Minimize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios'; 

const AIChat = () => {
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'assistant', 
      content: "Привет! Я твой академический помощник КазУТБ им. К. Кулажанова. Выбери дисциплину или просто задай вопрос по обучению." 
    }
  ]);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await api.get('/user/courses/active');
        setCourses(response.data);
      } catch (err) {
        setError("Ошибка загрузки курсов");
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

// АВТОПРОКРУТКА: Исправленная версия для всех режимов
  useEffect(() => {
    const scrollToBottom = () => {
      if (isFullScreen) {
        // В полноэкранном режиме скроллим само окно браузера
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      } else if (scrollRef.current) {
        // В обычном режиме скроллим внутренний контейнер чата
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    // Небольшая задержка, чтобы React успел отрендерить новый DOM-узл сообщения
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chatHistory, loading, isFullScreen]);
  const handleSend = async () => {
    if (!message.trim() && !selectedCourse) return;
    
    const userMessage = {
      role: 'user',
      content: message,
      courseName: selectedCourse?.title
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        content: currentMessage,
        course_id: selectedCourse?.id
      });

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: response.data.reply
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Произошла ошибка соединения." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`transition-all duration-500 flex flex-col font-sans ${
      isFullScreen 
      ? 'fixed inset-0 z-[9999] bg-[#f8fafc] overflow-y-auto' 
      : 'max-w-[1400px] mx-auto px-6 py-8 bg-[#f8fafc] min-h-screen'
    }`}>
      
      {/* HEADER */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8 mb-8 shrink-0 ${isFullScreen ? 'px-8 pt-8' : ''}`}>
        <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Помощник</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
                Интеллектуальная поддержка студентов 24/7. <br/>
                Помощь в освоении учебных модулей и проверке знаний перед тестами.
            </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-600"
          >
            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 ${isFullScreen ? 'px-8 pb-12' : ''}`}>
        
        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className={`${isFullScreen ? 'sticky top-8' : ''} space-y-4`}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-blue-600" /> Ваши курсы
              </p>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {coursesLoading ? (
                  [1, 2, 3].map(i => <div key={i} className="w-full h-12 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />)
                ) : courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      selectedCourse?.id === course.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-blue-50/30'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-tight truncate block">{course.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-600 rounded-2xl text-left text-white shadow-lg relative overflow-hidden">
               <p className="text-xs font-bold leading-relaxed relative z-10">
                 Проходите модули и тесты для доступа к экзамену.
               </p>
               <GraduationCap size={80} className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12" />
            </div>
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className={`lg:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${
          !isFullScreen ? 'max-h-[700px]' : ''
        }`}>
          
          <div className={`${isFullScreen ? '' : 'overflow-y-auto h-[500px]'} p-6 md:p-8 space-y-8 bg-[#fcfdfe] scroll-smooth`} style={{paddingBottom:1}}>
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                    {msg.courseName && (
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 px-2">
                        {msg.courseName}
                      </span>
                    )}
                    <div className={`p-5 rounded-2xl text-[13px] font-medium leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <div className="flex gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Bot size={18} className="animate-spin" /></div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                </div>
              </div>
            )}
            <div ref={scrollRef} className="w-full" />
          </div>

          <div className="p-6 md:p-8 bg-white border-t border-slate-100 mt-auto">
            {selectedCourse && (
              <div className="flex items-center gap-2 mb-4 bg-slate-900 w-fit px-3 py-1.5 rounded-lg shadow-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Контекст: {selectedCourse.title}</span>
                <button onClick={() => setSelectedCourse(null)} className="ml-2 text-white/40 hover:text-white transition-colors">×</button>
              </div>
            )}
            
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Задайте вопрос по обучению..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 pr-20 text-[14px] font-medium text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all resize-none min-h-[100px]"
              />
              <div className="absolute right-4 bottom-4">
                <button 
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="p-4 bg-blue-600 text-white rounded-xl hover:bg-slate-900 disabled:opacity-20 transition-all shadow-xl active:scale-95"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </main>
  );
};

export default AIChat;