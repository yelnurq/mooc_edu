import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Bot,
  Maximize2, Minimize2, CheckCheck, Loader2, Smile, Sparkles, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

// Компонент сообщения, идентичный MentorsChat
const AIChatMessage = React.memo(({ msg, isOwn, time }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-start gap-3 mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`p-2 rounded-xl shrink-0 shadow-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
      {isOwn ? <User size={16} /> : <Bot size={16} />}
    </div>
    
    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
      {msg.courseName && (
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 px-1">
          {msg.courseName}
        </span>
      )}
      <div className={`p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
        isOwn 
        ? 'bg-blue-600 text-white rounded-tr-none' 
        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
      }`}>
        <div className="whitespace-pre-wrap">{msg.content}</div>
        <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
          {time}
          {isOwn && <CheckCheck size={12} className="text-sky-300" />}
        </div>
      </div>
    </div>
  </motion.div>
));

const AIChat = () => {
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'assistant', 
      content: "Привет! Я твой академический помощник. Выбери курс слева, чтобы я мог отвечать точнее, или просто задай любой вопрос.",
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
    if (!message.trim() && !selectedCourse) return;
    
    const userMessage = {
      role: 'user',
      content: message,
      courseName: selectedCourse?.title,
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
        content: "Произошла ошибка соединения с AI-сервером.",
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
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* 1. SIDEBAR (Курсы вместо чатов) */}
      <div className="w-[380px] flex flex-col border-r border-slate-200 bg-white z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight">AI Контекст</h2>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск по дисциплинам..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-[14px] font-medium focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30 custom-scrollbar">
          {coursesLoading ? (
             [1,2,3].map(i => <div key={i} className="h-20 bg-white/50 animate-pulse rounded-[20px]" />)
          ) : filteredCourses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(selectedCourse?.id === course.id ? null : course)}
              className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all ${
                selectedCourse?.id === course.id 
                ? 'bg-white shadow-md ring-1 ring-slate-200' 
                : 'hover:bg-white hover:shadow-sm opacity-80'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                selectedCourse?.id === course.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <BookOpen size={22} />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <span className="text-[14px] font-bold text-slate-900 block truncate">{course.title}</span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">
                  {selectedCourse?.id === course.id ? 'Выбрано' : 'Использовать контекст'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Header */}
        <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
              <Bot size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-slate-900 leading-tight">Academic AI Assistant</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Система активна</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages with Pattern */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-100 relative chat-pattern-bg">
          <div className="max-w-4xl mx-auto relative z-10">
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
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 shadow-sm">
                  <Bot size={16} className="animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100 z-10">
          <div className="max-w-4xl mx-auto">
            {selectedCourse && (
              <div className="flex items-center gap-2 mb-3 bg-blue-600 text-white w-fit px-3 py-1.5 rounded-full shadow-lg animate-in slide-in-from-bottom-2 duration-300">
                <Sparkles size={12} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tight">Контекст: {selectedCourse.title}</span>
                <button onClick={() => setSelectedCourse(null)} className="ml-1 hover:text-red-200">×</button>
              </div>
            )}
            
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[28px] border border-slate-200 shadow-inner">
              <button className="p-3 text-slate-400 hover:text-slate-600 transition-colors ml-2"><Smile size={24} /></button>
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Спросите ИИ о чем угодно..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-800 px-2"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="p-4 bg-blue-600 text-white rounded-[22px] hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-100"
              >
                {loading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

  <style jsx>{`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 20px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

    .chat-pattern-bg {
      background-color: #f1f5f9; /* slate-100 */
      position: relative;
      z-index: 1;
    }

   
  `}</style>
    </div>
  );
};

export default AIChat;