import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { 
  User, MessageSquare, ArrowLeft, Send, 
  Calendar, Eye, Heart, 
  Share2, ShieldCheck, 
  Info, MessageSquarePlus, CheckCircle2,
  ChevronRight, Clock, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchTopicDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/forum/topics/${id}`);
      setTopic(res.data.topic);
      setComments(res.data.comments);
      setLikesCount(res.data.topic.likes_count || 0);
      setLiked(res.data.topic.is_liked || false);
    } catch (err) {
      console.error("Ошибка загрузки темы", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTopicDetails(); }, [fetchTopicDetails]);

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    try {
      const res = await api.post(`/forum/topics/${id}/like`);
      if (res.data.likes_count !== undefined) setLikesCount(res.data.likes_count);
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Ссылка скопирована");
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/forum/topics/${id}/comments`, { content: newComment });
      setComments([res.data.comment, ...comments]);
      setNewComment("");
    } catch (err) {
      alert("Ошибка отправки");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    return sortBy === 'newest' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at);
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Синхронизация данных...</p>
    </div>
  );

  if (!topic) return <div className="p-20 text-center font-black uppercase text-slate-400 min-h-screen bg-[#f8fafc]">Тема не найдена</div>;

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] text-slate-900 min-h-screen font-sans">
      
      {/* HEADER / BREADCRUMBS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate('/app/forum')}>Форум</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Обсуждение #{topic.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight max-w-3xl leading-tight">
            {topic.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleLike}
              className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2 border shadow-sm ${
                liked ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300'
              }`}
            >
              <Heart size={14} fill={liked ? "currentColor" : "none"} /> {likesCount}
            </button>
            <button 
              onClick={handleShare}
              className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
            >
              <Share2 size={16} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <aside className="lg:col-span-1 space-y-6 text-left">
          {/* AUTHOR CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Автор публикации</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 font-black text-lg shrink-0">
                {topic.author?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black text-slate-900 truncate uppercase tracking-tight">{topic.author?.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldCheck size={12} className="text-blue-500" />
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Студент KazUTB</p>
                </div>
              </div>
            </div>
          </div>

          {/* STATS CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className="flex items-center gap-1.5"><Clock size={12}/> Опубликовано</span>
               <span className="text-slate-900">{topic.time_ago}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span className="flex items-center gap-1.5"><Eye size={12}/> Просмотры</span>
               <span className="text-slate-900">{topic.views || 0}</span>
            </div>
            <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                {topic.tags?.map(tag => (
                  <span key={tag.id} className="text-[9px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase tracking-wider">
                    #{tag.name}
                  </span>
                ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-8 text-left">
          
          {/* TOPIC CONTENT */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
            <div className="text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap selection:bg-blue-100">
              {topic.content}
            </div>
          </motion.div>

          {/* COMMENTS SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" /> Ответы ({comments.length})
              </h3>
              
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {[
                  { id: 'newest', label: 'Новые' },
                  { id: 'oldest', label: 'Старые' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)} 
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      sortBy === opt.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT FIELD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all overflow-hidden">
              <form onSubmit={handleSendComment}>
                <textarea 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Напишите аргументированный ответ..."
                  className="w-full bg-transparent p-6 text-sm font-medium text-slate-700 focus:outline-none min-h-[120px] resize-none placeholder:text-slate-300"
                />
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Соблюдайте этику общения</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-300 shadow-lg transition-all flex items-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? "Отправка..." : <>Опубликовать <Send size={12} /></>}
                  </button>
                </div>
              </form>
            </div>

            {/* COMMENTS LIST */}
            <div className="space-y-4">
               <AnimatePresence mode='popLayout'>
                {sortedComments.length > 0 ? (
                  sortedComments.map((comment, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={comment.id}
                      className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-blue-500 transition-colors" />
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                              {comment.author?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">
                                {comment.author?.name}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Award size={10} className="text-emerald-500" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Академическая активность</span>
                              </div>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          {comment.time_ago}
                        </span>
                      </div>
                      <div className="text-[14px] text-slate-600 leading-relaxed font-medium pl-1">
                        {comment.content}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                       <MessageSquarePlus size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Ваш ответ может быть первым</p>
                  </div>
                )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-200 text-left">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          KazUTB Digital Ecosystem &copy; 2026 — Модерируемое пространство
        </p>
      </footer>
    </main>
  );
};

export default TopicPage;