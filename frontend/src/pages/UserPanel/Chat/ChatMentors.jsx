import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Phone, 
  MoreVertical, CheckCheck, Loader2, BookOpen,
  Maximize2, Minimize2, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

const ChatMessage = React.memo(({ msg, isOwn, time, isRead, courseTitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-start gap-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    {/* Avatar Block */}
    <div className={`p-2.5 rounded-xl shrink-0 ${isOwn ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'}`}>
      {isOwn ? <User size={18} /> : <Bot size={18} />}
    </div>
    
    <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end text-right' : 'items-start text-left'}`}>
      {/* Course Context Label */}
      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 px-2">
        {courseTitle}
      </span>

      <div className={`p-5 rounded-2xl text-[13px] font-medium leading-relaxed ${
        isOwn 
        ? 'bg-slate-900 text-white rounded-tr-none shadow-lg shadow-slate-200' 
        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
      }`}>
        <div className="whitespace-pre-wrap">{msg.content}</div>
        
        <div className={`flex items-center gap-1 mt-2 opacity-60 text-[10px] ${isOwn ? 'justify-end text-slate-300' : 'text-slate-500'}`}>
          {time}
          {isOwn && <CheckCheck size={12} className={isRead ? "text-blue-400" : "text-slate-400"} />}
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
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const scrollRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/course-chats');
      setActiveRooms(response.data.active_rooms || []);
      setAvailableCourses(response.data.available_courses || []);
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
      
      {/* HEADER (Style from AIChat) */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8 mb-8 shrink-0 ${isFullScreen ? 'px-8 pt-8' : ''}`}>
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Чат с кураторами</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
            Прямая связь с наставниками и экспертами. <br/>
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
        
        {/* SIDEBAR (Style from AIChat) */}
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
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              />
            </div>

            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {roomsLoading ? (
                [1, 2].map(i => <div key={i} className="w-full h-14 bg-slate-50 animate-pulse rounded-xl" />)
              ) : (
                filteredActive.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      selectedRoom?.id === room.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' 
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-blue-50/30'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-tight block truncate">{room.author.name}</span>
                    <span className={`text-[9px] mt-1 block truncate font-medium ${selectedRoom?.id === room.id ? 'text-blue-400' : 'text-slate-400'}`}>
                      {room.course.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MAIN CHAT (Style from AIChat) */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
          {selectedRoom ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#fcfdfe] custom-scrollbar scroll-smooth">
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
                    <div className="bg-slate-900 text-white p-4 rounded-2xl rounded-tr-none opacity-50 text-xs">Отправка...</div>
                  </div>
                )}
                <div ref={scrollRef} className="h-2" />
              </div>

              {/* Input Area (Style from AIChat) */}
              <div className="p-6 md:p-8 bg-white border-t border-slate-100">
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                <Bot size={40} className="text-slate-200" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1 tracking-tight text-xl">Центр связи с наставниками</h3>
              <p className="text-sm max-w-[280px] font-medium leading-relaxed">
                Выберите активный диалог из списка слева, чтобы продолжить обсуждение ваших проектов.
              </p>
            </div>
          )}
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