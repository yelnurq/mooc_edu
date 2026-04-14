import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, Loader2, Search, 
  MessageCircle, Phone, Video, MoreVertical,
  CheckCheck, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MentorsChat = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  
  // Фейковые данные кураторов
  const mentors = [
    {
      id: 1,
      name: "Ахметов Данияр",
      role: "Куратор по Web-разработке",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniyar",
      status: "online",
      lastMessage: "Проверь 4-й модуль в Laravel",
      unread: 2
    },
    {
      id: 2,
      name: "Елена Иванова",
      role: "Преподаватель высшей математики",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
      status: "offline",
      lastMessage: "Завтра консультация в 14:00",
      unread: 0
    },
    {
      id: 3,
      name: "Арман Сериков",
      role: "Куратор курса Python/Django",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arman",
      status: "online",
      lastMessage: "Отличная работа над API!",
      unread: 0
    }
  ];

  const [chatHistory, setChatHistory] = useState([
    { id: 1, role: 'mentor', content: "Здравствуйте! Как продвигается работа над Lumina CRM?", time: "10:30" },
    { id: 2, role: 'user', content: "Добрый день! Почти закончил с интеграцией Green API.", time: "10:32" },
    { id: 3, role: 'mentor', content: "Отлично. Если возникнут трудности с вебхуками — пишите.", time: "10:35" },
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatHistory, loading]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
    
    // Имитация ответа куратора
    setLoading(true);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: 'mentor',
        content: "Принял! Посмотрю в течение часа.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setLoading(false);
    }, 1500);
  };

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-8 bg-[#f8fafc] h-screen flex flex-col">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Чат с кураторами</h1>
          <p className="text-sm text-slate-500 font-medium">Прямая связь с наставниками ваших курсов</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden min-h-0">
        
        {/* SIDEBAR: Список кураторов */}
        <div className="lg:col-span-1 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Поиск куратора..."
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {filteredMentors.map(mentor => (
              <button
                key={mentor.id}
                onClick={() => setSelectedMentor(mentor)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all mb-1 ${
                  selectedMentor?.id === mentor.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={mentor.avatar} alt="" className="w-12 h-12 rounded-xl bg-slate-100" />
                  {mentor.status === 'online' && (
                    <div className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-slate-900 text-sm truncate">{mentor.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">12:45</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate leading-tight">{mentor.role}</p>
                </div>
                {mentor.unread > 0 && (
                  <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {mentor.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {selectedMentor ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <img src={selectedMentor.avatar} className="w-10 h-10 rounded-xl" alt="" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-none mb-1">{selectedMentor.name}</h3>
                    <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">
                      {selectedMentor.status === 'online' ? 'В сети' : 'Был недавно'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><Phone size={18} /></button>
                  <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><Video size={18} /></button>
                  <div className="w-px h-6 bg-slate-100 mx-1" />
                  <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfdfe] custom-scrollbar">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${msg.role === 'user' ? 'flex flex-row-reverse gap-3' : 'flex gap-3'}`}>
                      <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {msg.content}
                        <div className={`flex items-center gap-1 mt-1.5 ${msg.role === 'user' ? 'justify-end text-slate-400' : 'text-slate-400'}`}>
                          <span className="text-[9px] font-bold">{msg.time}</span>
                          {msg.role === 'user' && <CheckCheck size={12} className="text-blue-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 items-center text-slate-400 animate-pulse">
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs font-bold">Печатает...</div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative flex items-center gap-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Напишите куратору..."
                    className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-medium focus:border-blue-500 focus:bg-white outline-none transition-all resize-none min-h-[56px] max-h-32"
                    rows={1}
                  />
                  <button 
                    onClick={handleSend}
                    className="shrink-0 p-4 bg-blue-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                <MessageCircle size={40} className="text-slate-200" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Выберите чат</h3>
              <p className="text-sm max-w-[240px]">Нажмите на куратора слева, чтобы начать переписку по вашим курсам</p>
            </div>
          )}
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

export default MentorsChat;