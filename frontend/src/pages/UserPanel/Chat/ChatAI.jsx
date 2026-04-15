import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, Bot,
  CheckCheck, Loader2, Smile, BookOpen, Info,
  Sparkles, ChevronRight, MoreVertical, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

// Используем тот же стиль сообщений, что и в CourseMentorsChat
const AIChatMessage = React.memo(({ msg, isOwn, time }) => (
  <motion.div 
    initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex items-start gap-4 mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black border ${
      isOwn ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'
    }`}>
      {isOwn ? 'Я' : <Bot size={18} />}
    </div>
    
    <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`relative p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm border ${
        isOwn 
          ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' 
          : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
      }`}>
        <div className="whitespace-pre-wrap">{msg.content}</div>
        <div className={`flex items-center gap-1.5 mt-2 text-[9px] font-black uppercase tracking-tighter ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
          <Clock size={10} /> {time}
          {isOwn && <CheckCheck size={12} className="text-sky-300" />}
        </div>
      </div>
    </div>
  </motion.div>
));

const AIChat = () => {
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'assistant', 
      content: "Привет! Я твой академический помощник. Выбери курс слева для контекста или просто задай вопрос.",
      created_at: new Date().toISOString()
    }
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/user/courses/active');
        setCourses(response.data);
      } catch (err) { console.error(err); } 
      finally { setCoursesLoading(false); }
    };
    fetchMyCourses();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    const userMessage = {
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
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
        content: response.data.reply,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Ошибка AI-сервера.",
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => 
    courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [courses, searchQuery]
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      
      {/* 1. LEFT SIDEBAR (Style: Forum Aside) */}
      <div className="w-[340px] flex flex-col border-r border-slate-200 bg-white z-20">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI Ассистент</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">LMS Intelligence</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} />
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="ВЫБОР КОНТЕКСТА..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-[10px] font-black uppercase tracking-wider outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {coursesLoading ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)
          ) : filteredCourses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
              className={`group w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden border ${
                selectedCourse?.id === course.id 
                  ? 'bg-white shadow-xl border-slate-200' 
                  : 'bg-white border-slate-50 hover:border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                selectedCourse?.id === course.id ? 'bg-blue-600' : 'bg-transparent'
              }`} />

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                selectedCourse?.id === course.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                <BookOpen size={20} />
              </div>

              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-black text-slate-900 truncate uppercase tracking-tight">{course.title}</span>
                </div>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block truncate">
                  {selectedCourse?.id === course.id ? 'Контекст активен' : 'Использовать курс'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CENTER CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white relative">
        <header className="h-24 px-10 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-5 text-left">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white border-4 border-slate-50 shadow-lg">
              <Bot size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">AI Assistant</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Online Intelligence</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowInfo(!showInfo)} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                showInfo 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Info size={14}/> {showInfo ? 'Скрыть ИИ-панель' : 'ИИ Инфо'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, idx) => (
                <AIChatMessage 
                  key={idx} 
                  msg={msg} 
                  isOwn={msg.role === 'user'}
                  time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
              ))}
            </AnimatePresence>

            {loading && (
              <div className="flex items-start gap-4 mb-6">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                   <div className="flex gap-1.5">
                     <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                     <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                     <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            {selectedCourse && (
               <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                 <Sparkles size={12}/> Использование контекста: {selectedCourse.title}
               </div>
            )}
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-500 transition-all">
              <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><Smile size={22} /></button>
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="ЗАДАЙТЕ ВОПРОС ПО КУРСУ..."
                className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 px-2 uppercase tracking-tight placeholder:text-slate-300"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 disabled:opacity-20 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Отправить</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT INFO SIDEBAR */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-slate-200 flex flex-col z-20 relative overflow-hidden"
          >
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar text-left">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-slate-50">
                    <Bot size={48} className="text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl border-4 border-white shadow-lg">
                    <CheckCheck size={16} className="text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">KazUTB AI Intelligence</h4>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-3">GPT-1.0</p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                   <p className="text-[9px] font-black uppercase opacity-60 mb-2 tracking-widest">Статус системы</p>
                   <p className="text-sm font-bold">Готов к анализу ваших курсов и помощи с кодом.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Доступные функции</p>
                  <ul className="space-y-2">
                    {['Объяснение терминов', 'Решение задач', 'Анализ контекста'].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-700">
                        <div className="w-1 h-1 bg-blue-600 rounded-full" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.2em] leading-none">
                KazUTB Neural Core v.4.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
};

export default AIChat;