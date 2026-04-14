import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Phone, Video,
  MoreVertical, CheckCheck, Loader2, Maximize2, Minimize2, 
  Bot, Paperclip, Camera, Smile, Heart, Bell, ShieldCheck, 
  Star, BookOpen, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

const ChatMessage = React.memo(({ msg, isOwn, time, isRead, courseTitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-start gap-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    {/* Иконка: вместо slate-900 используем blue-600 для своих */}
    <div className={`p-2.5 rounded-xl shrink-0 ${isOwn ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
      {isOwn ? <User size={18} /> : <Bot size={18} />}
    </div>
    
    <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end text-right' : 'items-start text-left'}`}>
      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 px-2">
        {courseTitle}
      </span>

      {/* Тело сообщения: синий градиент или blue-600 вместо черного */}
      <div className={`p-5 rounded-2xl text-[13px] font-medium leading-relaxed ${
        isOwn 
        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100' 
        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
      }`}>
        <div className="whitespace-pre-wrap">{msg.content}</div>
        
        <div className={`flex items-center gap-1 mt-2 opacity-80 text-[10px] ${isOwn ? 'justify-end text-blue-100' : 'text-slate-400'}`}>
          {time}
          {isOwn && <CheckCheck size={12} className={isRead ? "text-white" : "text-blue-300"} />}
        </div>
      </div>
    </div>
  </motion.div>
));

const CourseMentorsChat = () => {
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const scrollRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/course-chats');
      setActiveRooms(response.data.active_rooms || []);
    } catch (err) { console.error(err); } finally { setRoomsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchMessages = useCallback(async (roomId) => {
    try {
      const response = await api.get(`/course-chats/${roomId}/messages`);
      setMessages(prev => JSON.stringify(prev) !== JSON.stringify(response.data) ? response.data : prev);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (!selectedRoom?.id) return;
    fetchMessages(selectedRoom.id);
    const interval = setInterval(() => fetchMessages(selectedRoom.id), 5000);
    return () => clearInterval(interval);
  }, [selectedRoom?.id, fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    if (!message.trim() || !selectedRoom || sending) return;
    const tempText = message;
    setMessage('');
    setSending(true);
    try {
      const response = await api.post('/course-chats/messages', {
        chat_room_id: selectedRoom.id,
        content: tempText
      });
      setMessages(prev => [...prev, response.data]);
    } catch (err) { setMessage(tempText); } finally { setSending(false); }
  };

  const filteredActive = useMemo(() => 
    activeRooms.filter(r => r.course.title.toLowerCase().includes(searchQuery)),
    [activeRooms, searchQuery]
  );

  return (
    <main className={`transition-all duration-500 flex flex-col font-sans ${
      isFullScreen 
      ? 'fixed inset-0 z-[9999] bg-[#f8fafc] overflow-hidden' 
      : 'max-w-[1400px] mx-auto px-6 py-8 bg-[#f8fafc] min-h-screen'
    }`}>
      
      {/* HEADER (Стиль AIChat) */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8 mb-8 shrink-0 ${isFullScreen ? 'px-8 pt-8' : ''}`}>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Чат с кураторами</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
            Прямая связь с наставниками и экспертами по вашим дисциплинам. <br/>
            Задавайте технические вопросы и получайте обратную связь по проектам.
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

      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden ${isFullScreen ? 'px-8 pb-8' : ''}`}>
        
        {/* SIDEBAR: Диалоги (Стиль AIChat) */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <MessageCircle size={14} className="text-blue-600" /> Активные диалоги
            </p>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Поиск..."
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              />
            </div>

            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {roomsLoading ? (
                [1, 2].map(i => <div key={i} className="w-full h-14 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />)
              ) : (
                filteredActive.map(room => (
                    <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 border transition-all duration-300 ${
                        selectedRoom?.id === room.id 
                        ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm scale-[1.02]' 
                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                    >
                    <span className={`text-[11px] font-black uppercase tracking-tight block truncate ${selectedRoom?.id === room.id ? 'text-blue-700' : ''}`}>
                        {room.author.name}
                    </span>
                    <span className={`text-[9px] mt-1 block truncate font-medium ${selectedRoom?.id === room.id ? 'text-blue-500' : 'text-slate-400'}`}>
                        {room.course.title}
                    </span>
                    </button>
                ))
              )}
            </div>
          </div>

          <div className="p-6 bg-blue-600 rounded-2xl text-left text-white shadow-lg relative overflow-hidden shrink-0">
             <p className="text-xs font-bold leading-relaxed relative z-10">
               Ваши вопросы помогают улучшать учебные материалы.
             </p>
             <GraduationCap size={60} className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12" />
          </div>
        </div>

        {/* MAIN CHAT + RIGHT PROFILE */}
        <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Chat Area */}
          <div className={`xl:col-span-2 flex flex-col border-r border-slate-100 bg-[#fcfdfe] ${selectedRoom ? '' : 'justify-center items-center'}`}>
            {selectedRoom ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar scroll-smooth">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <ChatMessage 
                        key={msg.id} 
                        msg={msg} 
                        isOwn={msg.sender_id === selectedRoom.student_id}
                        isRead={msg.is_read}
                        courseTitle={selectedRoom.course.title}
                        time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                    ))}
                  </AnimatePresence>
                  {sending && (
                    <div className="flex gap-4 flex-row-reverse">
                      <div className="p-2.5 bg-slate-900 text-white rounded-xl"><User size={18} className="animate-pulse" /></div>
                      <div className="bg-slate-900 text-white p-4 rounded-2xl rounded-tr-none opacity-50 text-[13px] font-medium">Отправка...</div>
                    </div>
                  )}
                  <div ref={scrollRef} className="h-2" />
                </div>

                {/* Input Area (Стиль AIChat) */}
                <div className="p-6 md:p-8 bg-white border-t border-slate-100 mt-auto">
                  <div className="relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Напишите технический вопрос..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 pr-20 text-[14px] font-medium text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition-all resize-none min-h-[100px] max-h-40"
                    />
                    <div className="absolute right-4 bottom-4">
                      <button 
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className="p-4 bg-blue-600 text-white rounded-xl hover:bg-slate-900 disabled:opacity-20 transition-all shadow-xl active:scale-95"
                      >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-slate-400 p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                  <Bot size={40} className="text-slate-200" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1 tracking-tight text-xl">Центр связи</h3>
                <p className="text-sm max-w-[280px] font-medium leading-relaxed">
                  Выберите активный диалог слева для связи с наставником.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Profile (Как на фото, но в стиле AIChat) */}
          <div className="hidden xl:flex flex-col p-8 bg-white overflow-y-auto custom-scrollbar">
            {selectedRoom ? (
              <div className="flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Профиль ментора</h3>
                    <MoreVertical size={18} className="text-slate-300 cursor-pointer" />
                </div>

                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-[40px] overflow-hidden border-[6px] border-[#f8fafc] shadow-2xl rotate-3 group hover:rotate-0 transition-all duration-500">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${selectedRoom.author.name}&background=1e293b&color=fff&size=200`} 
                          alt="profile" 
                          className="w-full h-full object-cover scale-110" 
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-2xl shadow-lg">
                        <Star size={14} fill="currentColor" />
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedRoom.author.name}</h3>
                <p className="text-[11px] text-blue-500 font-black uppercase tracking-wider mb-8 text-center">Куратор дисциплины</p>

                <div className="grid grid-cols-2 gap-3 w-full mb-10">
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 transition-colors cursor-pointer group">
                        <MessageCircle size={18} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Чат</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 transition-colors cursor-pointer group">
                        <Video size={18} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Звонок</span>
                    </div>
                </div>

                <div className="w-full space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <BookOpen size={12} /> Контекст курса
                        </p>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-[12px] font-bold text-slate-700 leading-tight">{selectedRoom.course.title}</h4>
                            <div className="mt-3 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-green-500" />
                                <span className="text-[10px] text-slate-500 font-medium">Верифицированный ментор</span>
                            </div>
                        </div>
                    </div>
                    
                    <button className="w-full py-4 border-2 border-slate-100 rounded-2xl text-[11px] font-black text-slate-400 uppercase hover:border-blue-500 hover:text-blue-500 transition-all active:scale-95">
                        Учебный план
                    </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <User size={48} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </main>
  );
};

export default CourseMentorsChat;