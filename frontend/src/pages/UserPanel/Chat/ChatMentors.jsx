import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Star, 
  CheckCheck, Loader2, Smile, BookOpen, Info,
  Mail, GraduationCap, ShieldCheck, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

const ChatMessage = React.memo(({ msg, isOwn, time, isRead }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-start gap-3 mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`p-2 rounded-xl shrink-0 ${isOwn ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200 shadow-sm'}`}>
      <User size={16} />
    </div>
    <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`p-3.5 rounded-2xl text-[14px] font-medium leading-normal shadow-sm ${
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
  const [showInfo, setShowInfo] = useState(true);
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
      <div className="w-[320px] flex flex-col border-r border-slate-200 bg-white z-20">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">K</div>
            <div>
              <h2 className="text-[14px] font-black text-slate-900 leading-none">KazUTB</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">LMS Chat</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Поиск ментора..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30 custom-scrollbar">
          {roomsLoading ? (
            [1,2,3].map(i => <div key={i} className="h-16 bg-white animate-pulse rounded-xl" />)
          ) : filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedRoom?.id === room.id ? 'bg-white shadow-md border border-slate-100' : 'hover:bg-white opacity-80'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                selectedRoom?.id === room.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <User size={20} />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[13px] font-bold text-slate-900 truncate">{room.author.name}</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase">Live</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase truncate block">
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
            <header className="h-20 px-8 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <User size={22} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{selectedRoom.author.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">В сети</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowInfo(!showInfo)} className={`p-2.5 rounded-xl transition-all ${showInfo ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                <Info size={18}/>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#F8FAFC]">
              <div className="max-w-3xl mx-auto">
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

            <div className="p-6 bg-white border-t border-slate-100">
              <div className="max-w-3xl mx-auto flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <button className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors ml-1"><Smile size={20} /></button>
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Введите сообщение..."
                  className="flex-1 bg-transparent border-none outline-none text-[14px] text-slate-800 px-1"
                />
                <button 
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-sm"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] text-center px-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 mb-5">
              <GraduationCap size={32} className="text-blue-600" />
            </div>
            <h3 className="text-[20px] font-bold text-slate-900 mb-2">Мессенджер KazUTB</h3>
            <p className="text-[13px] text-slate-500 max-w-xs leading-relaxed">
              Выберите чат из списка слева, чтобы начать общение с наставником курса.
            </p>
          </div>
        )}
      </div>

      {/* 3. RIGHT INFO SIDEBAR */}
      {showInfo && selectedRoom && (
        <div className="w-[300px] bg-white border-l border-slate-200 flex flex-col z-20">
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg">
                  <User size={40} className="text-blue-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-lg border-2 border-white shadow-sm">
                  <ShieldCheck size={14} className="text-white" />
                </div>
              </div>
              <h4 className="text-[16px] font-bold text-slate-900 tracking-tight">{selectedRoom.author.name}</h4>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1">Ментор</p>
              
              <div className="flex gap-2 mt-6 w-full">
                <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wider">
                  Профиль
                </button>
                <button className="p-2.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200">
                  <Star size={16}/>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
                <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Прогресс обучения</p>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-2xl font-bold italic">64%</span>
                  <span className="text-[11px] mb-1 opacity-80 font-medium">готово</span>
                </div>
                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[64%]" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                    <BookOpen size={18}/>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-900 leading-none">24 лекции</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Видеоуроки</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                    <Layout size={18}/>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-900 leading-none">12 модулей</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Программа</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Текущие темы</h5>
                <div className="space-y-1.5">
                  {['Архитектура приложений', 'Масштабирование'].map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                        <span className={`text-[12px] font-semibold ${i === 0 ? 'text-slate-900' : 'text-slate-500'}`}>{topic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-none">
                KazUTB Messenger Security
              </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default CourseMentorsChat;