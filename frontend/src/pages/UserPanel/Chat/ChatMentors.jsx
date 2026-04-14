import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Send, User, Search, MessageCircle, Video,
  MoreVertical, CheckCheck, Loader2, Star, 
  Paperclip, Image, Smile, Heart, Bell, 
  ChevronDown,Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';

const ChatMessage = React.memo(({ msg, isOwn, time, isRead }) => (
  <motion.div 
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-end gap-3 mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`w-10 h-10 shrink-0 border border-slate-200`}>
      <img 
        src={isOwn ? "/images/avatars/user.jpg" : `https://ui-avatars.com/api/?name=Mentor&background=f1f5f9&color=64748b`} 
        className="w-full h-full object-cover" 
        alt="" 
      />
    </div>
    
    <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className={`px-4 py-3 shadow-sm ${
        isOwn 
        ? 'bg-[#3b82f6] text-white' 
        : 'bg-white text-slate-700 border border-slate-100'
      }`}>
        <div className="text-[14px] leading-relaxed font-medium">{msg.content}</div>
        <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isOwn ? 'text-blue-100/70' : 'text-slate-400'}`}>
          {time}
          {isOwn && <CheckCheck size={12} className={isRead ? "text-white" : "text-blue-200"} />}
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
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR (CHATS) */}
      <div className="w-[360px] bg-white flex flex-col border-r border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Messages</h2>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 tracking-widest uppercase">6 Running</span>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full bg-slate-50 border-none py-3.5 pl-12 pr-4 text-[13px] placeholder:text-slate-400 focus:ring-0 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {roomsLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="w-full h-20 bg-slate-50/50 animate-pulse border-b border-slate-100" />)
          ) : (
            filteredActive.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full flex items-center gap-4 p-5 transition-all border-b border-slate-100 relative ${
                  selectedRoom?.id === room.id 
                  ? 'bg-slate-50' 
                  : 'hover:bg-slate-50/50'
                }`}
              >
                {selectedRoom?.id === room.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                <div className="relative shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${room.author.name}&background=random&size=100`} className="w-12 h-12 object-cover border border-slate-200" alt="" />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[14px] font-bold text-slate-800 truncate">
                        {room.author.name}
                    </span>
                    <span className="text-[10px] text-slate-400">12:45</span>
                  </div>
                  <p className="text-[12px] truncate font-medium text-slate-500">
                    {room.course.title}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. CENTER CHAT AREA */}
      <div className="flex-1 bg-[#F8FAFC] flex flex-col relative min-w-0">
        {selectedRoom ? (
          <>
            {/* Top Header */}
            <div className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-4">
                <img src={`https://ui-avatars.com/api/?name=${selectedRoom.author.name}&background=3b82f6&color=fff&size=100`} className="w-10 h-10 border border-slate-200" alt="" />
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">{selectedRoom.author.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-all"><Search size={18} /></button>
                <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-all"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex justify-center mb-10">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] border-b border-slate-200 pb-1">Today</span>
              </div>
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
              <div ref={scrollRef} className="h-2" />
            </div>

            {/* Bottom Input Area */}
            <div className="p-6 bg-white border-t border-slate-200">
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                        <Smile size={20} />
                    </button>
                    <input 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Write a message..."
                        className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-slate-700 py-2"
                    />
                    <div className="flex items-center gap-3">
                        <button className="text-slate-400 hover:text-slate-600"><Paperclip size={18} /></button>
                        <button 
                            onClick={handleSend}
                            className="bg-slate-900 text-white px-6 py-2.5 text-[12px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <>Send <Send size={14} /></>}
                        </button>
                    </div>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <MessageCircle size={48} className="mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Conversation</p>
          </div>
        )}
      </div>

      {/* 3. RIGHT SIDEBAR (PROFILE) */}
      <div className="hidden xl:flex w-[320px] bg-white flex-col border-l border-slate-200 overflow-y-auto custom-scrollbar">
        {selectedRoom ? (
          <div className="flex flex-col">
            <div className="p-8 border-b border-slate-100 flex flex-col items-center">
              <div className="w-32 h-32 mb-6 border border-slate-200 p-1">
                <img src={`https://ui-avatars.com/api/?name=${selectedRoom.author.name}&background=3b82f6&color=fff&size=200`} className="w-full h-full object-cover" alt="" />
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-1 text-center uppercase tracking-tight">
                  {selectedRoom.author.name}
              </h3>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-8">
                  Senior Mentor
              </p>

              <div className="grid grid-cols-2 w-full border border-slate-200">
                <button className="flex flex-col items-center gap-2 py-4 border-r border-slate-200 hover:bg-slate-50 transition-all text-slate-600">
                  <Phone size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Call</span>
                </button>
                <button className="flex flex-col items-center gap-2 py-4 hover:bg-slate-50 transition-all text-slate-600">
                  <Video size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Video</span>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
               <div>
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Information</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-slate-400">Course</span>
                        <span className="text-[12px] font-bold text-slate-700">{selectedRoom.course.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-slate-400">Role</span>
                        <span className="text-[12px] font-bold text-slate-700">Lead Instructor</span>
                    </div>
                  </div>
               </div>

               <div>
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Media Attachments</h5>
                  <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200">
                    {['PDF', 'Video', 'MP3', 'Image'].map(item => (
                        <div key={item} className="bg-white p-4 flex flex-col items-center gap-2 hover:bg-slate-50 cursor-pointer transition-all">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{item}</span>
                        </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center opacity-10">
            <User size={80} />
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default CourseMentorsChat;