import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, MoreVertical, 
  CheckCheck, Loader2, Maximize2, Minimize2, 
  Bot, Star, BookOpen, GraduationCap, Sparkles, ShieldCheck, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

const ChatMessage = React.memo(({ msg, isOwn, time, isRead, courseTitle }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`p-2.5 rounded-2xl shrink-0 shadow-sm ${
      isOwn 
      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
      : 'bg-white text-blue-600 border border-blue-50'
    }`}>
      {isOwn ? <User size={16} /> : <Bot size={16} />}
    </div>
    
    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 px-1">
        {isOwn ? 'Вы' : courseTitle}
      </span>

      <div className={`relative p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-sm transition-all ${
        isOwn 
        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-100' 
        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
      }`}>
        <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
        
        <div className={`flex items-center gap-1 mt-2 text-[10px] ${isOwn ? 'justify-end text-blue-100' : 'text-slate-400'}`}>
          {time}
          {isOwn && <CheckCheck size={12} className={isRead ? "text-blue-200" : "opacity-40"} />}
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
    } catch (err) { 
      setMessage(tempText); 
    } finally { 
      setSending(false); 
    }
  };

  const filteredActive = useMemo(() => 
    activeRooms.filter(r => r.course.title.toLowerCase().includes(searchQuery)),
    [activeRooms, searchQuery]
  );

  return (
    <main className={`transition-all duration-700 ease-in-out flex flex-col font-sans ${
      isFullScreen 
      ? 'fixed inset-0 z-[9999] bg-[#fdfeff]' 
      : 'max-w-[1440px] mx-auto px-6 py-8 bg-[#f8fafc] min-h-screen'
    }`}>
      
      {/* HEADER */}
      <div className={`flex flex-col md:flex-row justify-between items-center gap-6 mb-8 shrink-0 ${isFullScreen ? 'px-8 pt-6' : ''}`}>
        <div className="text-left w-full md:w-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
              <Sparkles size={18} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mentor Space</h1>
          </div>
          <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
            Ваша экспертная поддержка в реальном времени
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-all text-slate-500 hover:text-blue-600"
          >
            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden ${isFullScreen ? 'px-8 pb-8' : ''}`}>
        
        {/* SIDEBAR */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/50 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Найти курс..."
                className="w-full bg-slate-100/50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              />
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {roomsLoading ? (
                [1, 2, 3].map(i => <div key={i} className="w-full h-16 bg-slate-50 animate-pulse rounded-2xl" />)
              ) : (
                filteredActive.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group relative ${
                      selectedRoom?.id === room.id 
                      ? 'bg-white shadow-md border border-blue-100 scale-[1.02]' 
                      : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {selectedRoom?.id === room.id && (
                      <motion.div layoutId="activeTab" className="absolute left-0 top-4 bottom-4 w-1 bg-blue-600 rounded-full" />
                    )}
                    <span className={`text-[12px] font-bold block truncate ${selectedRoom?.id === room.id ? 'text-blue-600' : 'text-slate-700'}`}>
                      {room.author.name}
                    </span>
                    <span className="text-[10px] mt-0.5 block truncate font-medium text-slate-400 group-hover:text-slate-500">
                      {room.course.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="lg:col-span-6 flex flex-col bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden relative">
          {selectedRoom ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar scroll-smooth bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [background-position:center]">
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
                <div ref={scrollRef} className="h-2" />
              </div>

              <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100">
                <div className="relative flex items-end gap-3 bg-slate-50 rounded-[1.5rem] p-2 border border-slate-100 focus-within:border-blue-200 focus-within:bg-white transition-all shadow-inner">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Напишите сообщение..."
                    className="w-full bg-transparent border-none rounded-2xl px-4 py-3 text-[14px] font-medium text-slate-800 focus:ring-0 outline-none resize-none min-h-[45px] max-h-32"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-20 transition-all shadow-lg shadow-blue-200 active:scale-90 shrink-0"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                <MessageCircle size={40} className="text-blue-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Выберите диалог</h3>
              <p className="text-sm text-slate-400 max-w-[240px] font-medium">Ваш наставник готов ответить на любые вопросы</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-3 hidden lg:flex flex-col gap-6">
          {selectedRoom ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-32 h-32 rounded-[3rem] overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100">
                   <img 
                    src={`https://ui-avatars.com/api/?name=${selectedRoom.author.name}&background=eff6ff&color=2563eb&size=256`} 
                    alt="mentor" 
                    className="w-full h-full object-cover scale-105" 
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white w-7 h-7 rounded-full shadow-lg" />
              </div>

              <h3 className="text-lg font-black text-slate-900 tracking-tight">{selectedRoom.author.name}</h3>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1 mb-8">Куратор дисциплины</p>

              <div className="w-full space-y-4">
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 text-left">
                  <div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-black uppercase">
                    <BookOpen size={12} /> Контекст курса
                  </div>
                  <h4 className="text-[13px] font-bold text-slate-800 leading-snug">{selectedRoom.course.title}</h4>
                </div>
                
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 active:scale-95">
                  План обучения
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-3">
               <User size={32} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Профиль</span>
            </div>
          )}
          
          <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-[14px] font-bold leading-tight mb-2">Центр поддержки</p>
               <p className="text-[11px] text-blue-100 font-medium leading-relaxed">Задавайте технические вопросы и отправляйте отчеты по задачам.</p>
             </div>
             <GraduationCap size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </main>
  );
};

export default CourseMentorsChat;