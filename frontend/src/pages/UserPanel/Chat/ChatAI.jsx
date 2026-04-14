import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, BookOpen, MessageSquare, 
  GraduationCap, RotateCcw, ShieldCheck, User, Bot, 
  Loader2, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios'; // Убедись, что путь к твоему инстансу axios верный

const AIChat = () => {
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'assistant', 
      content: "Привет! Я твой академический помощник. Выбери учебную дисциплину слева, чтобы я мог отвечать с учетом твоей программы, или просто задай вопрос." 
    }
  ]);
  
  const scrollRef = useRef(null);

  // 1. Загрузка реальных курсов студента из БД
  useEffect(() => {
    const fetchMyCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await api.get('/user/courses/active');
        setCourses(response.data);
      } catch (err) {
        console.error("Ошибка загрузки курсов:", err);
        setError("Не удалось загрузить список курсов");
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  // 2. Автопрокрутка вниз
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // 3. Отправка сообщения на бэкенд (OpenAI)
  const handleSend = async () => {
    if (!message.trim() && !selectedCourse) return;
    setError(null);
    
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

      const aiResponse = {
        role: 'assistant',
        content: response.data.reply
      };
      
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error("AI Error:", err);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Извини, произошла ошибка при соединении с нейросетью. Проверь API ключ или подключение." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-8 bg-[#f8fafc] min-h-screen flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg">
              <Sparkles size={20} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">AI Mentor <span className="text-blue-600">v2.0</span></h1>
          </div>
          <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Интеллектуальная поддержка на основе ваших дисциплин</p>
        </div>
        
        <div className="hidden md:flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             System Online: 2026_PROD
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        
        {/* SIDEBAR: REAL COURSES */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <BookOpen size={14} className="text-blue-600" /> Ваши курсы (Approved)
            </p>
            
            <div className="space-y-2">
              {coursesLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="w-full h-12 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />
                ))
              ) : courses.length > 0 ? (
                courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                      selectedCourse?.id === course.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-1' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-tight truncate pr-2">{course.title}</span>
                      {selectedCourse?.id === course.id && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shrink-0" />}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Нет активных курсов</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-blue-600 rounded-2xl text-left text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Контекстный режим</p>
                <p className="text-xs font-bold leading-relaxed">
                  ИИ проанализирует описание выбранного курса и ваш текущий прогресс для подготовки ответа.
                </p>
             </div>
             <GraduationCap size={120} className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* MAIN CHAT WINDOW */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden min-h-[650px]">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fcfdfe]">
            <AnimatePresence>
              {chatHistory.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white shadow-md' : 'bg-blue-50 text-blue-600'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                    {msg.courseName && (
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 px-2">
                        Дисциплина: {msg.courseName}
                      </span>
                    )}
                    <div className={`p-5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm transition-all ${
                      msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Bot size={18} className="animate-spin" /></div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Action/Input Bar */}
          <div className="p-8 bg-white border-t border-slate-100">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {selectedCourse && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 mb-4 bg-slate-900 w-fit px-3 py-1.5 rounded-lg shadow-lg"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">В контексте: {selectedCourse.title}</span>
                <button onClick={() => setSelectedCourse(null)} className="ml-2 text-white/40 hover:text-white transition-colors text-xs">×</button>
              </motion.div>
            )}
            
            <div className="relative group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={selectedCourse ? `Задайте вопрос по "${selectedCourse.title}"...` : "Выберите дисциплину или просто напишите вопрос..."}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 pr-20 text-[14px] font-medium text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all resize-none min-h-[120px] shadow-inner"
              />
              
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <button 
                  onClick={handleSend}
                  disabled={loading || (!message.trim() && !selectedCourse)}
                  className="p-4 bg-blue-600 text-white rounded-xl hover:bg-slate-900 disabled:opacity-20 transition-all shadow-xl hover:shadow-blue-300 active:scale-95"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
               <div className="flex items-center gap-4">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck size={12} className="text-emerald-500" /> AES-256 Encryption
                 </p>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <MessageSquare size={12} /> GPT-4 Academic Model
                 </p>
               </div>
               
               <button 
                 onClick={() => {
                   setChatHistory([]);
                   setSelectedCourse(null);
                 }}
                 className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all flex items-center gap-1.5 opacity-50 hover:opacity-100"
               >
                 <RotateCcw size={12} /> Очистить контекст
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AIChat;