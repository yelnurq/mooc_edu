import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Video,
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
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR (Светло-серый фон для контраста с чатом) */}
      <div className="w-[320px] flex flex-col border-r border-slate-200 bg-[#F1F5F9]/50">
        <div className="p-5 border-b border-slate-200 bg-white/50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Чаты</h2>
            <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
               {activeRooms.length}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Поиск..."
              className="w-full bg-slate-200/50 border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs focus:bg-white focus:border-blue-500/30 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {roomsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="w-full h-16 bg-slate-200/40 animate-pulse rounded-xl" />)
          ) : (
            filteredActive.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedRoom?.id === room.id 
                  ? 'bg-white shadow-sm border border-slate-200' 
                  : 'hover:bg-slate-200/50 border border-transparent text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${selectedRoom?.id === room.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`}>
                  <Bot size={16} />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <span className={`text-[13px] font-bold block truncate ${selectedRoom?.id === room.id ? 'text-blue-600' : 'text-slate-700'}`}>
                    {room.author.name}
                  </span>
                  <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-tighter tracking-wide">
                    {room.course.title}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. CENTER CHAT AREA (Самый светлый блок для фокуса на тексте) */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedRoom ? (
          <>
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                        <User size={20} className="text-slate-400" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 leading-none mb-1">{selectedRoom.author.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">В сети</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                 <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Phone size={18}/></button>
                 <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><MoreVertical size={18}/></button>
              </div>
            </div>

            {/* Фон сообщений с легким паттерном или просто чистый белый */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F8FAFC]">
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

            <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Smile size={20} /></button>
                    <input 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Сообщение..."
                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-900 px-2"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-20 transition-all shadow-md shadow-blue-200"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-[#F8FAFC] text-slate-300">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <MessageCircle size={32} className="text-slate-200" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Выберите диалог</p>
          </div>
        )}
      </div>

      {/* 3. RIGHT SIDEBAR (Белый фон как в центре, но с четкой границей) */}
      {selectedRoom && (
        <div className="hidden xl:flex w-[280px] flex-col border-l border-slate-200 bg-white">
            <div className="p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-4 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                    <User size={32} />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">{selectedRoom.author.name}</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Mentor</p>
            </div>

            <div className="px-6 py-2 space-y-5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Информация о курсе</h5>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-800 leading-tight">{selectedRoom.course.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-bold uppercase tracking-tighter">Активен</div>
                            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-bold uppercase tracking-tighter">Premium</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default CourseMentorsChat;