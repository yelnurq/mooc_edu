import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Phone, 
  MoreVertical, CheckCheck, BookOpen, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

// Отдельный компонент для сообщения, чтобы не ререндерить весь список
const ChatMessage = React.memo(({ msg, isOwn, time, isRead }) => (
  <motion.div 
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
  >
    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
      isOwn ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
    }`}>
      {msg.content}
      <div className={`flex items-center justify-end gap-1 mt-1 opacity-60 text-[10px] ${isOwn ? 'text-slate-300' : 'text-slate-500'}`}>
        {time}
        {isOwn && <CheckCheck size={12} className={isRead ? "text-blue-400" : "text-slate-400"} />}
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
  
  const scrollRef = useRef(null);

  // Оптимизированная загрузка данных
  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/course-chats');
      setActiveRooms(response.data.active_rooms || []);
      setAvailableCourses(response.data.available_courses || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Загрузка сообщений (Polling)
  const fetchMessages = useCallback(async (roomId) => {
    try {
      const response = await api.get(`/course-chats/${roomId}/messages`);
      setMessages(prev => JSON.stringify(prev) !== JSON.stringify(response.data) ? response.data : prev);
    } catch (err) {
      console.error("Messages Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    if (!selectedRoom?.id) return;
    
    fetchMessages(selectedRoom.id);
    const interval = setInterval(() => fetchMessages(selectedRoom.id), 5000);
    return () => clearInterval(interval);
  }, [selectedRoom?.id, fetchMessages]);

  // Плавный скролл при новых сообщениях
  const scrollToBottom = (behavior = 'smooth') => {
    scrollRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Обработка начала чата
  const handleStartChat = useCallback(async (courseId) => {
    try {
      const res = await api.post('/course-chats/start', { course_id: courseId });
      const room = res.data;
      if (!activeRooms.find(r => r.id === room.id)) {
        setActiveRooms(prev => [room, ...prev]);
      }
      setSelectedRoom(room);
      setMessages([]);
    } catch (err) {
      console.error("Start Chat Error", err);
    }
  }, [activeRooms]);

  // Отправка сообщения
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
      setMessage(tempText); // Возвращаем текст в случае ошибки
    } finally {
      setSending(false);
    }
  };

  // Мемоизированные списки для исключения лишних фильтраций
  const filteredActive = useMemo(() => 
    activeRooms.filter(r => r.course.title.toLowerCase().includes(searchQuery)),
    [activeRooms, searchQuery]
  );

  const filteredNew = useMemo(() => 
    availableCourses.filter(c => 
      !activeRooms.some(r => r.course_id === c.id) && 
      c.title.toLowerCase().includes(searchQuery)
    ), [availableCourses, activeRooms, searchQuery]
  );

  return (
    <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-8 bg-[#f8fafc] h-screen flex flex-col font-sans">
      <header className="mb-6 shrink-0">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mentors <span className="text-blue-600">Connect</span></h1>
        <p className="text-sm text-slate-500 font-medium">Консультации по проектам: Lumina CRM, Argymaq и другие</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-slate-50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Поиск по курсам..."
                className="w-full bg-slate-50/80 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-transparent focus:ring-blue-500/20 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
            {roomsLoading ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredActive.length > 0 && (
                  <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase px-3 mb-3 tracking-[0.15em]">Активные чаты</h2>
                    {filteredActive.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl mb-1.5 transition-all duration-300 ${
                          selectedRoom?.id === room.id ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' : 'hover:bg-slate-50 active:scale-95'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${selectedRoom?.id === room.id ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                          <BookOpen size={20} />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className={`text-[10px] font-bold uppercase tracking-wider truncate mb-0.5 ${selectedRoom?.id === room.id ? 'text-blue-400' : 'text-blue-600'}`}>
                            {room.course.title}
                          </p>
                          <p className="text-sm font-bold truncate leading-none">{room.author.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredNew.length > 0 && (
                  <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase px-3 mb-3 tracking-[0.15em]">Доступные авторы</h2>
                    {filteredNew.map(course => (
                      <button
                        key={course.id}
                        onClick={() => handleStartChat(course.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-md hover:ring-1 hover:ring-slate-100 transition-all active:scale-95 border border-dashed border-slate-200 mb-2 group"
                      >
                        <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
                          <MessageCircle size={20} />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{course.title}</p>
                          <p className="text-sm font-bold text-slate-800 truncate leading-none">{course.author.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CHAT MAIN */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/60 overflow-hidden relative">
          {selectedRoom ? (
            <>
              <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <User size={24}/>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-none tracking-tight">{selectedRoom.author.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-md tracking-tighter">
                        Курс: {selectedRoom.course.title}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase">Онлайн</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors"><Phone size={20}/></button>
                   <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors"><MoreVertical size={20}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar">
                <AnimatePresence mode="popLayout">
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
                <div ref={scrollRef} className="h-2" />
              </div>

              <div className="p-6 bg-white border-t border-slate-50">
                <div className="flex items-end gap-3 bg-slate-50 p-3 rounded-[1.5rem] ring-1 ring-slate-200/50 focus-within:ring-blue-500/30 focus-within:bg-white transition-all">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Задайте технический вопрос..."
                    className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm font-medium resize-none max-h-32 min-h-[44px] custom-scrollbar"
                    rows={1}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-blue-200 active:scale-95 shrink-0"
                  >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/10">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center mb-6"
              >
                <MessageCircle size={40} className="text-blue-100" />
              </motion.div>
              <h3 className="text-slate-900 font-black text-xl mb-2">Центр поддержки курсов</h3>
              <p className="text-sm max-w-[280px] text-center font-medium leading-relaxed">Выберите наставника в левой панели, чтобы получить помощь по урокам или коду.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </main>
  );
};

export default CourseMentorsChat;