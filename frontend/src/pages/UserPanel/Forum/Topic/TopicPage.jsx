import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { 
  User, MessageSquare, ArrowLeft, Send, 
  Calendar, Eye, Heart, 
  Share2, ShieldCheck, 
  TrendingUp, Info, 
  MessageSquarePlus, CheckCircle2,
  ChevronRight
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

  const fetchTopicDetails = async () => {
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
  };

  useEffect(() => { fetchTopicDetails(); }, [id]);

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
    alert("Ссылка скопирована в буфер обмена");
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
      alert("Ошибка отправки сообщения");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    return sortBy === 'newest' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at);
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Синхронизация Digital Sign...</p>
    </div>
  );

  if (!topic) return <div className="p-20 text-center font-black uppercase text-slate-400 min-h-screen bg-[#f8fafc]">Тема не найдена</div>;

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] text-slate-900 min-h-screen">
      
      {/* HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left w-full md:w-auto">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
             <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate('/app/forum')}>Форум</span>
             <ChevronRight size={10} />
             <span className="text-blue-600 italic">Обсуждение #{topic.id}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight italic uppercase leading-none mb-4">
            {topic.title}
          </h1>

          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
               <Calendar size={12} className="text-blue-500" /> {topic.time_ago}
             </span>
             <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
               <Eye size={12} className="text-blue-500" /> {topic.views || 0} просмотров
             </span>
          </div>
        </div>

        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={handleLike}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${liked ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} /> {likesCount}
          </button>
          <button 
            onClick={handleShare}
            className="p-3 hover:bg-slate-50 text-slate-400 rounded-xl transition-all border border-transparent"
            title="Скопировать ссылку"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR (LEFT) */}
        <div className="lg:col-span-1 space-y-6 text-left">
          
          {/* AUTHOR CARD */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 relative">Автор публикации</p>
            
            <div className="flex items-center gap-4 relative">
              <div className="relative">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <User size={28} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="В сети"></div>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 tracking-tight leading-tight">{topic.author?.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                   <CheckCircle2 size={12} className="text-blue-500" />
                   <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Verified Student</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap gap-2">
               {topic.tags?.length > 0 ? topic.tags.map(tag => (
                 <span key={tag.id} className="text-[9px] font-black px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg uppercase">
                   #{tag.name}
                 </span>
               )) : (
                 <span className="text-[9px] font-black px-2.5 py-1 bg-slate-50 text-slate-300 border border-slate-100 rounded-lg uppercase italic">#no_tags</span>
               )}
            </div>
          </div>

          {/* STATS BLOCK */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl text-white space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="flex items-center justify-between relative">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Активность</p>
                <TrendingUp size={18} className="text-blue-400" />
             </div>
             <div className="space-y-4 relative">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Всего ответов</span>
                   <span className="text-2xl font-black italic">{comments.length}</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '75%' }} 
                    className="bg-blue-500 h-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                   />
                </div>
             </div>
          </div>

          {/* RULES BLOCK */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2">
              <Info size={14} className="text-blue-500" /> Правила сообщества
            </h4>
            <ul className="space-y-4">
              {[
                'Соблюдайте этику общения',
                'Аргументируйте свою позицию',
                'Избегайте дублирования тем'
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-500 leading-tight uppercase tracking-tighter">
                  <span className="text-blue-500 font-black">0{i+1}.</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MAIN CONTENT (RIGHT) */}
        <div className="lg:col-span-3 text-left space-y-8">
          
{/* MAIN POST BODY - Сделали компактнее */}
<motion.div 
  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 relative overflow-hidden"
>
  {/* Декоративная полоса слева для акцента на контенте */}
  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600/20" />
  
  <div className="prose prose-slate max-w-none">
    <p className="text-[15px] md:text-base text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
      {topic.content}
    </p>
  </div>
</motion.div>

          {/* DISCUSSION HEADER */}
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <MessageSquare size={18} className="text-blue-600" /> Сообщения участников
              </h3>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <button onClick={() => setSortBy('newest')} className={`px-5 py-2 rounded-lg transition-all ${sortBy === 'newest' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Новые</button>
                <button onClick={() => setSortBy('oldest')} className={`px-5 py-2 rounded-lg transition-all ${sortBy === 'oldest' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Старые</button>
              </div>
            </div>

            {/* INPUT FIELD */}
        {/* INPUT FIELD - Теперь в едином стиле с основным контентом */}
<div className="bg-white rounded-3xl border border-slate-200 shadow-sm focus-within:border-blue-500/50 transition-all group overflow-hidden">
  <form onSubmit={handleSendComment} className="relative">
    <textarea 
      value={newComment} 
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Напишите ваш ответ..."
      className="w-full bg-transparent p-6 text-[15px] font-medium text-slate-700 focus:outline-none min-h-[120px] resize-none placeholder:text-slate-300 tracking-tight"
    />
    
    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Markdown поддерживается
      </p>
      
      <button 
        type="submit" 
        disabled={isSubmitting || !newComment.trim()}
        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 disabled:bg-slate-200 shadow-sm transition-all flex items-center gap-2 active:scale-95"
      >
        {isSubmitting ? "Отправка..." : <>Опубликовать <Send size={12} /></>}
      </button>
    </div>
  </form>
</div>

            {/* COMMENTS LOOP */}
            <div className="space-y-5 pt-4">
               {sortedComments.length > 0 ? (
                 sortedComments.map((comment, index) => (
                   <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                    key={comment.id}
                    className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
                   >
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black text-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             {comment.author?.name?.charAt(0)}
                           </div>
                           <div>
                              <p className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">{comment.author?.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <ShieldCheck size={10} className="text-emerald-500" /> Идентификатор подтвержден
                              </p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                          {comment.time_ago}
                        </span>
                     </div>
                     <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium pl-2 border-l-2 border-slate-50 group-hover:border-blue-500 transition-colors">
                        {comment.content}
                     </p>
                   </motion.div>
                 ))
               ) : (
                 <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2rem] py-24 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <MessageSquarePlus size={36} className="text-slate-200" />
                    </div>
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">История обсуждения пуста</p>
                    <p className="text-[10px] font-medium text-slate-300 uppercase mt-2">Будьте первым, кто оставит свой след</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER SYSTEM INFO */}
      <footer className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck size={18} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-widest">
            Конфиденциальность данных защищена <br/> протоколами KazUTB.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Digital Sign Platform</p>
          <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Version 4.0.26 — Community Edition</p>
        </div>
      </footer>
    </main>
  );
};

export default TopicPage;