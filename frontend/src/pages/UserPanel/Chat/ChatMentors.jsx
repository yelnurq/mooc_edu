import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Video,Star,
  MoreVertical, CheckCheck, Loader2, Smile, Phone, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

const ChatMessage = React.memo(({ msg, isOwn, time, isRead }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-start gap-3 mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`p-2 rounded-xl shrink-0 shadow-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
      {isOwn ? <User size={16} /> : <Bot size={16} />}
    </div>
    
    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
        isOwn 
        ? 'bg-blue-600 text-white rounded-tr-none' 
        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
      }`}>
        <div className="whitespace-pre-wrap">{msg.content}</div>
        <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
          {time}
          {isOwn && <CheckCheck size={12} className={isRead ? "text-sky-300" : "text-blue-300"} />}
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
  }, [messages]);

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
    activeRooms.filter(r => r.course.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [activeRooms, searchQuery]
  );


return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <div className="w-[380px] flex flex-col border-r border-slate-200 bg-white z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Сообщения</h2>
            <button className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
              <MessageCircle size={22} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск ментора или курса..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-[14px] font-medium focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
          {activeRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all ${
                selectedRoom?.id === room.id 
                ? 'bg-white shadow-md ring-1 ring-slate-200' 
                : 'hover:bg-white hover:shadow-sm grayscale-[0.5] opacity-80'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                selectedRoom?.id === room.id ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <User size={28} />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[16px] font-bold text-slate-900 truncate">{room.author.name}</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">12:45</span>
                </div>
                <p className="text-[13px] text-slate-600 font-bold uppercase tracking-tight truncate">
                  {room.course.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN CHAT */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                  <User size={24} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 leading-tight">{selectedRoom.author.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">На связи</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><Phone size={20}/></button>
                 <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><Star size={20}/></button>
              </div>
            </div>

            {/* Messages Area with Pattern */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-100 relative chat-pattern-bg">
              <div className="max-w-4xl mx-auto relative z-10">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      msg={msg} 
                      isOwn={msg.sender_id === selectedRoom.student_id}
                      isRead={msg.is_read}
                      time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                  ))}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[28px] border border-slate-200">
                    <button className="p-3 text-slate-400 hover:text-slate-600 transition-colors ml-2"><Smile size={24} /></button>
                    <input 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Напишите сообщение..."
                        className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-800 px-2"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className="p-4 bg-slate-600 text-white rounded-[22px] hover:bg-slate-700 disabled:opacity-30 transition-all shadow-lg shadow-slate-200"
                    >
                        {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                    </button>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-300">
            <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center shadow-xl border border-slate-100 mb-6">
                <MessageCircle size={48} className="text-slate-100" />
            </div>
            <p className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-400">Выберите диалог для общения</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

        /* Бесконечный паттерн логотипа */
        .chat-pattern-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.04; /* Очень слабая видимость, чтобы не мешать тексту */
          background-image: url('/images/lcons/logo.png');
          background-repeat: repeat;
          background-size: 80px; /* Размер одной иконки в паттерне */
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
    </div>
);
};
export default CourseMentorsChat;