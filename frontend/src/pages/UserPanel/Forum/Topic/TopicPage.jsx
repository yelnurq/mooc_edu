import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { 
  User, Clock, MessageSquare, ArrowLeft, 
  Send, MoreHorizontal, Hash, Calendar, 
  Heart, Eye, Share2
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

      api.post(`/forum/topics/${id}/view`).catch(() => {});
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
      await api.post(`/forum/topics/${id}/like`);
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
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
      alert("Ошибка при отправке ответа");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    return sortBy === 'newest' 
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at);
  });

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  if (!topic) return <div className="p-20 text-center font-bold">Тема не найдена</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Navigation Header */}
      <div className="bg-white border-b border-slate-200 py-6 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/forum')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-sm"
          >
            <ArrowLeft size={18} /> Назад к списку
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><Share2 size={18} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><MoreHorizontal size={18} /></button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        {/* Topic Header Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-200 shadow-sm mb-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {topic.tags?.map(tag => (
              <span key={tag.id} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-100">
                #{tag.name}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8 tracking-tight italic">
            {topic.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <User size={24} />
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg">{topic.author?.name}</div>
                <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  <span className="flex items-center gap-1"><Clock size={14} /> {topic.time_ago}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1 text-blue-500"><Eye size={14} /> {topic.views || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all border ${
                  liked 
                  ? 'bg-red-50 border-red-100 text-red-500 shadow-md shadow-red-100' 
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Heart size={20} fill={liked ? "currentColor" : "none"} />
                {likesCount}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-200 shadow-sm mb-12">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium">
              {topic.content}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              Ответы <span className="text-sm bg-slate-900 text-white px-3 py-1 rounded-full">{comments.length}</span>
            </h3>
            
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
              <button 
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${sortBy === 'newest' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
              >НОВЫЕ</button>
              <button 
                onClick={() => setSortBy('oldest')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${sortBy === 'oldest' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
              >СТАРЫЕ</button>
            </div>
          </div>

          {/* New Comment Form */}
          <div className="bg-white border-2 border-slate-100 rounded-[32px] p-2 shadow-sm focus-within:border-blue-500 transition-all">
            <form onSubmit={handleSendComment} className="relative">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Что вы думаете об этом?"
                className="w-full bg-slate-50/50 rounded-[28px] p-6 pr-16 text-sm font-medium focus:outline-none min-h-[120px] resize-none"
              />
              <button 
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="absolute bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-30"
              >
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Send size={20} />}
              </button>
            </form>
          </div>

          {/* Comments Feed */}
          <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {sortedComments.length > 0 ? (
                sortedComments.map((comment, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    key={comment.id}
                    className="group bg-white border border-slate-200 p-6 md:p-8 rounded-[32px] shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 border border-slate-200">
                          {comment.author?.name?.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-black text-sm text-slate-900">{comment.author?.name}</span>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Студент KazUTB</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Calendar size={12} /> {comment.time_ago}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[16px] leading-relaxed font-medium pl-1">
                      {comment.content}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-slate-300">
                  <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Обсуждение еще не началось</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopicPage;