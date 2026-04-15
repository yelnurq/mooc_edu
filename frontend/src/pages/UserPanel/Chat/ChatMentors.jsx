import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, Star, 
  CheckCheck, Loader2, Smile, BookOpen, Info,
  GraduationCap, ShieldCheck, Layout, ChevronRight,
  MoreVertical, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

const ChatMessage = React.memo(({ msg, isOwn, time, isRead }) => (
  <motion.div 
    initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex items-start gap-4 mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black border ${
      isOwn ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'
    }`}>
      {isOwn ? 'Я' : <User size={16} />}
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
  const [chats, setChats] = useState([]); // Единый список курсов/чатов
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const scrollRef = useRef(null);

  // 1. Загрузка списка чатов и доступных курсов
  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/course-chats');
      setChats(response.data.chats || []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setRoomsLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. Загрузка сообщений (только если есть chat_room_id)
  const fetchMessages = useCallback(async (roomId) => {
    if (!roomId) return;
    try {
      const response = await api.get(`/course-chats/${roomId}/messages`);
      setMessages(prev => JSON.stringify(prev) !== JSON.stringify(response.data) ? response.data : prev);
    } catch (err) { 
      console.error("Messages fetch error:", err); 
    }
  }, []);

  useEffect(() => {
    if (!selectedChat?.chat_room_id) {
      setMessages([]); // Очищаем экран, если это новый чат без истории
      return;
    };
    
    fetchMessages(selectedChat.chat_room_id);
    const interval = setInterval(() => fetchMessages(selectedChat.chat_room_id), 5000);
    return () => clearInterval(interval);
  }, [selectedChat?.chat_room_id, fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Отправка сообщения
  const handleSend = async () => {
    if (!message.trim() || !selectedChat || sending) return;
    
    const tempText = message;
    setMessage('');
    setSending(true);

    // Если чат уже существует, шлем chat_room_id, если нет — course_id
    const payload = selectedChat.chat_room_id 
      ? { chat_room_id: selectedChat.chat_room_id, content: tempText }
      : { course_id: selectedChat.course_id, content: tempText };

    try {
      const response = await api.post('/course-chats/messages', payload);
      
      // Если это был первый запуск чата, бэкенд вернет объект сообщения с данными о комнате
      if (!selectedChat.chat_room_id && response.data.chat_room_id) {
        const newRoomId = response.data.chat_room_id;
        setSelectedChat(prev => ({ ...prev, chat_room_id: newRoomId }));
        // Обновляем общий список, чтобы проставить ID комнаты
        setChats(prev => prev.map(c => c.course_id === selectedChat.course_id ? { ...c, chat_room_id: newRoomId } : c));
      }

      setMessages(prev => [...prev, response.data]);
    } catch (err) { 
      setMessage(tempText); 
      console.error("Send error:", err);
    } finally { 
      setSending(false); 
    }
  };

  const filteredChats = useMemo(() => 
    chats.filter(c => 
      c.course_title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [chats, searchQuery]
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-[340px] flex flex-col border-r border-slate-200 bg-white z-20">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Мессенджер</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">LMS Platform</p>
            </div>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">K</div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="ПОИСК КУРСА ИЛИ МЕНТОРА..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-[10px] font-black uppercase tracking-wider outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {roomsLoading ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />)
          ) : filteredChats.map(chat => (
            <button
              key={chat.course_id}
              onClick={() => setSelectedChat(chat)}
              className={`group w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden border ${
                selectedChat?.course_id === chat.course_id 
                  ? 'bg-white shadow-xl border-slate-200' 
                  : 'bg-white border-slate-50 hover:border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                selectedChat?.course_id === chat.course_id ? 'bg-blue-600' : 'bg-transparent'
              }`} />

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                selectedChat?.course_id === chat.course_id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                <User size={22} />
              </div>

              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-black text-slate-900 truncate uppercase tracking-tight">{chat.author_name}</span>
                  {chat.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black">{chat.unread_count}</span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block truncate">
                  {chat.course_title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CENTER CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedChat ? (
          <>
            <header className="h-24 px-10 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-5 text-left">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white border-4 border-slate-50 shadow-lg">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">{selectedChat.author_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">На связи</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 text-slate-400 hover:text-slate-900 transition-all"><MoreVertical size={20}/></button>
                <button 
                  onClick={() => setShowInfo(!showInfo)} 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    showInfo 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Info size={14}/> {showInfo ? 'Скрыть детали' : 'Инфо'}
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#F8FAFC]">
              <div className="max-w-4xl mx-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Smile size={48} className="mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-widest">История сообщений пуста. Начните диалог первым!</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <ChatMessage 
                        key={msg.id} 
                        msg={msg} 
                        isOwn={msg.sender_id !== selectedChat.author_id} // Если отправитель не автор, значит студент (вы)
                        isRead={msg.is_read}
                        time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        />
                    ))}
                    </AnimatePresence>
                )}
                <div ref={scrollRef} />
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100">
              <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-500 transition-all">
                <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><Smile size={22} /></button>
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="НАПИШИТЕ СООБЩЕНИЕ МЕНТОРУ..."
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 px-2 uppercase tracking-tight placeholder:text-slate-300"
                />
                <button 
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 disabled:opacity-20 transition-all shadow-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Отправить</>}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] text-center px-10">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-100 mb-8">
              <GraduationCap size={40} className="text-slate-900" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Образовательный хаб</h3>
            <p className="text-[11px] font-bold text-slate-400 max-w-xs leading-relaxed uppercase tracking-[0.1em]">
              Выберите курс в левой панели, чтобы связаться с наставником и получить помощь в обучении
            </p>
          </div>
        )}
      </div>

      {/* 3. RIGHT INFO SIDEBAR */}
      <AnimatePresence>
        {showInfo && selectedChat && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-slate-200 flex flex-col z-20 relative overflow-hidden"
          >
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar text-left">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-slate-100 shadow-inner">
                    <User size={48} className="text-slate-300" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-xl border-4 border-white shadow-lg">
                    <ShieldCheck size={16} className="text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">{selectedChat.author_name}</h4>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-3">Verified Mentor</p>
                
                <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                  <button className="py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black hover:bg-blue-600 transition-all uppercase tracking-widest shadow-md">
                    Профиль
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-white text-slate-600 rounded-xl text-[9px] font-black border border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest">
                    <Star size={12}/> 4.9
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full -mr-12 -mt-12" />
                  <p className="text-[9px] font-black uppercase opacity-60 mb-2 tracking-widest">Инфо о курсе</p>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-xl font-black italic max-w-full truncate">{selectedChat.course_title}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[100%]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm shrink-0 border border-slate-100">
                      <BookOpen size={18}/>
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900 leading-none">КОНСУЛЬТАЦИИ</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Доступны 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.2em] leading-none">
                  KazUTB Security Protocol v.2
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

export default CourseMentorsChat;