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
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const scrollRef = useRef(null);

 const fetchData = useCallback(async () => {
  try {
    const response = await api.get('/course-chats');
    // Теперь мы сохраняем единый массив chats
    setActiveRooms(response.data.chats || []);
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
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      
      {/* 1. LEFT SIDEBAR (STYLE: FORUM ASIDE) */}
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
              placeholder="ПОИСК ПО МЕНТОРАМ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-[10px] font-black uppercase tracking-wider outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {roomsLoading ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />)
          ) : filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`group w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative overflow-hidden border ${
                selectedRoom?.id === room.id 
                  ? 'bg-white shadow-xl border-slate-200' 
                  : 'bg-white border-slate-50 hover:border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                selectedRoom?.id === room.id ? 'bg-blue-600' : 'bg-transparent'
              }`} />

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                selectedRoom?.id === room.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                <User size={22} />
              </div>

              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-black text-slate-900 truncate uppercase tracking-tight">{room.author.name}</span>
                  {selectedRoom?.id === room.id && <ChevronRight size={14} className="text-blue-600" />}
                </div>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block truncate">
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
            <header className="h-24 px-10 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-5 text-left">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white border-4 border-slate-50 shadow-lg">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase">{selectedRoom.author.name}</h3>
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

            <div className="p-8 bg-white border-t border-slate-100">
              <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-500 transition-all">
                <button className="p-3 text-slate-300 hover:text-blue-600 transition-colors"><Smile size={22} /></button>
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="НАПИШИТЕ СООБЩЕНИЕ..."
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
              Выберите наставника в левой панели для получения консультации по курсу
            </p>
          </div>
        )}
      </div>

      {/* 3. RIGHT INFO SIDEBAR (STYLE: FORUM STATS) */}
      <AnimatePresence>
        {showInfo && selectedRoom && (
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
                <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">{selectedRoom.author.name}</h4>
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
                  <p className="text-[9px] font-black uppercase opacity-60 mb-2 tracking-widest">Прогресс по курсу</p>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-black italic">64%</span>
                    <span className="text-[10px] mb-1.5 opacity-60 font-black uppercase">Complete</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[64%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm shrink-0 border border-slate-100">
                      <BookOpen size={18}/>
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900 leading-none">24 ЛЕКЦИИ</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Доступный контент</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm shrink-0 border border-slate-100">
                      <Layout size={18}/>
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900 leading-none">12 МОДУЛЕЙ</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Текущая программа</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">План обучения</h5>
                    <div className="h-[1px] flex-1 bg-slate-100 ml-4" />
                  </div>
                  <div className="space-y-2">
                    {['Архитектура приложений', 'Масштабирование'].map((topic, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 transition-all cursor-default">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'}`} />
                          <span className={`text-[11px] font-black uppercase tracking-tight ${i === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{topic}</span>
                        </div>
                      </div>
                    ))}
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