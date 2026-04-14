import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Phone, Star, 
  CheckCheck, Loader2, Smile, BookOpen, Info, ExternalLink,
  Mail, Calendar, GraduationCap, ShieldCheck
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
      <User size={16} />
    </div>
    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
        isOwn ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
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
  const [showInfo, setShowInfo] = useState(true); // Состояние правого сайдбара
  
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

  const filteredRooms = useMemo(() => 
    activeRooms.filter(r => 
      r.course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [activeRooms, searchQuery]
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-[350px] flex flex-col border-r border-slate-200 bg-white z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Менторы</h2>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MessageCircle size={20} />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-[13px] font-medium focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30 custom-scrollbar">
          {roomsLoading ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-white/50 animate-pulse rounded-[20px]" />)
          ) : filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all ${
                selectedRoom?.id === room.id ? 'bg-white shadow-md ring-1 ring-slate-200' : 'hover:bg-white hover:shadow-sm opacity-80'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                selectedRoom?.id === room.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <User size={20} />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[13px] font-bold text-slate-900 truncate">{room.author.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Active</span>
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter block truncate">
                  {room.course.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CENTER CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedRoom ? (
          <>
            <header className="h-20 px-8 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                  <User size={22} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 leading-tight">{selectedRoom.author.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl transition-all ${showInfo ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                   <Info size={20}/>
                 </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-100 relative chat-pattern-bg">
              <div className="max-w-3xl mx-auto relative z-10">
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

            <div className="p-6 bg-white border-t border-slate-100 z-10">
              <div className="max-w-3xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-[28px] border border-slate-200">
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
                  className="p-4 bg-blue-600 text-white rounded-[22px] hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-100"
                >
                  {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                </button>
              </div>
            </div>
          </>
        ) : (
         <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Декоративные фоновые элементы */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center max-w-sm text-center px-6"
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-blue-200/50">
            <MessageCircle size={40} className="text-blue-600" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-4 border-slate-50" 
          />
        </div>

        <h3 className="text-[22px] font-black text-slate-900 mb-3 tracking-tight">
          Центр связи с менторами
        </h3>
        
        <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-8">
          Выберите диалог из списка слева, чтобы задать вопрос по курсу или получить консультацию от эксперта.
        </p>

        {/* Сетка с быстрыми подсказками */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm flex flex-col items-center">
            <ShieldCheck size={20} className="text-emerald-500 mb-2" />
            <span className="text-[11px] font-bold text-slate-700 uppercase">Безопасно</span>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm flex flex-col items-center">
            <Star size={20} className="text-yellow-500 mb-2" />
            <span className="text-[11px] font-bold text-slate-700 uppercase">Экспертно</span>
          </div>
        </div>

        {/* Цитата или статус внизу */}
        <div className="mt-12 flex items-center gap-3 px-4 py-2 bg-slate-200/50 rounded-full">
          <Info size={14} className="text-slate-500" />
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">
            Все менторы онлайн и готовы помочь
          </span>
        </div>
      </motion.div>
    </div>
  )}
</div>

{/* 3. RIGHT INFO SIDEBAR */}
<div className="w-[380px] bg-white border-l border-slate-200 flex flex-col z-20 overflow-hidden shadow-sm">
  <AnimatePresence mode="wait">
    {selectedRoom && showInfo ? (
      // РЕАЛЬНЫЙ КОНТЕНТ (отображается при выбранном чате)
      <motion.div 
        key="info-content"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        className="flex flex-col h-full"
      >
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Профиль Ментора */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center border-4 border-white shadow-xl">
                <User size={40} className="text-blue-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 rounded-2xl border-4 border-white">
                <ShieldCheck size={16} className="text-white" />
              </div>
            </div>
            <h4 className="text-[18px] font-black text-slate-900 tracking-tight">{selectedRoom.author.name}</h4>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1">Верифицированный Ментор</p>
            
            <div className="flex gap-2 mt-6 w-full">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[12px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                <Mail size={16}/> Email
              </button>
              <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
                <Star size={18}/>
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase tracking-[0.15em] font-black text-[10px]">
                <BookOpen size={14}/> Обучающий Курс
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 relative overflow-hidden group">
                <h5 className="text-[14px] font-black text-slate-900 leading-snug">{selectedRoom.course.title}</h5>
                <div className="flex items-center gap-3 mt-4">
                  <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-500 uppercase">12 Модулей</div>
                  <div className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black text-white uppercase tracking-tighter shadow-md shadow-blue-100">Active</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar size={18} className="text-slate-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Начало</p>
                <p className="text-[12px] font-black text-slate-900 uppercase">12.02.2026</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Star size={18} className="text-yellow-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Рейтинг</p>
                <p className="text-[12px] font-black text-slate-900 uppercase">4.9 / 5.0</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
           <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
             Ваш диалог с ментором защищен <br/> шифрованием KAZUTB Security
           </p>
        </div>
      </motion.div>
    ) : (
      // СКЕЛЕТОН (отображается когда ничего не выбрано)
      <motion.div 
        key="skeleton"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full p-8"
      >
        <div className="flex flex-col items-center animate-pulse mb-10">
          <div className="w-24 h-24 bg-slate-100 rounded-[32px] mb-4" />
          <div className="h-5 w-32 bg-slate-100 rounded-lg mb-2" />
          <div className="h-3 w-48 bg-slate-50 rounded-lg" />
          
          <div className="flex gap-2 mt-8 w-full">
            <div className="flex-1 h-12 bg-slate-100 rounded-2xl" />
            <div className="w-12 h-12 bg-slate-50 rounded-2xl" />
          </div>
        </div>

        <div className="space-y-8 animate-pulse">
          <div>
            <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
            <div className="h-28 bg-slate-50 rounded-3xl border border-slate-100" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100" />
            <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100" />
          </div>
        </div>

        <div className="mt-auto pt-8 opacity-40">
           <div className="flex flex-col items-center gap-2">
             <div className="h-2 w-40 bg-slate-100 rounded" />
             <div className="h-2 w-32 bg-slate-100 rounded" />
           </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }

      `}</style>
    </div>
  );
};

export default CourseMentorsChat;