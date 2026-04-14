import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, BookOpen, MessageSquare, 
  GraduationCap, RotateCcw, ShieldCheck, User, Bot 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Фейковые данные курсов
const FAKE_COURSES = [
  { id: 1, name: "Разработка на Laravel", description: "Backend разработка и архитектура API" },
  { id: 2, name: "React & Современный Frontend", description: "SPA, Hooks, State Management" },
  { id: 3, name: "Алгоритмы и структуры данных", description: "Подготовка к Competitive Programming" },
  { id: 4, name: "Администрирование Windows Server", description: "Active Directory и сетевая безопасность" }
];

const AIChat = () => {
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'assistant', 
      content: "Привет! Я твой академический помощник. Выбери учебную дисциплину слева или просто задай любой вопрос по учебе." 
    }
  ]);
  
  const scrollRef = useRef(null);

  // Автопрокрутка вниз при новых сообщениях
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!message.trim() && !selectedCourse) return;
    
    const userMessage = {
      role: 'user',
      content: message,
      courseName: selectedCourse?.name
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    // Имитация ответа сервера
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: selectedCourse 
          ? `По курсу "${selectedCourse.name}" я рекомендую обратить внимание на ключевые концепции. На твой вопрос "${userMessage.content}" отвечу так: это базовая тема, которая часто встречается в экзаменационных билетах.`
          : `Интересный вопрос! Если рассматривать это в контексте общей программы обучения, то стоит изучить дополнительные материалы в библиотеке курса. Чем еще я могу помочь?`
      };
      setChatHistory(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
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
          <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Персонализированное обучение на основе ваших курсов</p>
        </div>
        
        <div className="hidden md:flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
             Student Session: 2026_ACTIVE
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        
        {/* SIDEBAR: COURSES */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-blue-600" /> Ваши дисциплины
              </p>
              <div className="space-y-2">
                {FAKE_COURSES.map(course => (
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
                      <span className="text-[11px] font-black uppercase tracking-tight">{course.name}</span>
                      {selectedCourse?.id === course.id && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-600 rounded-2xl text-left text-white shadow-lg shadow-blue-200 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Контекст обучения</p>
                <p className="text-xs font-bold leading-relaxed">
                  Выбор темы курса позволяет ИИ анализировать ваши лабораторные и лекционные материалы для точного ответа.
                </p>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12">
                <GraduationCap size={120} />
             </div>
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
                  <div className={`p-2.5 rounded-xl shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}>
                    {msg.courseName && (
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">
                        Тема: {msg.courseName}
                      </span>
                    )}
                    <div className={`p-5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm transition-all ${
                      msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Bot size={18} className="animate-pulse" /></div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
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
            {selectedCourse && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 mb-4 bg-slate-900 w-fit px-3 py-1.5 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Фокус: {selectedCourse.name}</span>
                <button onClick={() => setSelectedCourse(null)} className="ml-2 text-white/40 hover:text-white transition-colors text-xs">×</button>
              </motion.div>
            )}
            
            <div className="relative group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={selectedCourse ? `Спросите по теме ${selectedCourse.name}...` : "Задайте вопрос или выберите курс..."}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 pr-20 text-[14px] font-medium text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all resize-none min-h-[120px] shadow-inner"
              />
              
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <button 
                  onClick={handleSend}
                  disabled={loading || (!message.trim() && !selectedCourse)}
                  className="p-4 bg-blue-600 text-white rounded-xl hover:bg-slate-900 disabled:opacity-20 transition-all shadow-xl hover:shadow-blue-200"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
               <div className="flex items-center gap-4">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck size={12} className="text-emerald-500" /> Secure Academic Line
                 </p>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <MessageSquare size={12} /> GPT-4 Turbo Enabled
                 </p>
               </div>
               
               <button 
                 onClick={() => setChatHistory([])}
                 className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all flex items-center gap-1.5 opacity-50 hover:opacity-100"
               >
                 <RotateCcw size={12} /> Сбросить диалог
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AIChat;