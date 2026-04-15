import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { 
  MessageSquare, Search, Plus, X, 
  Clock, Eye, MessageCircle, TrendingUp, 
  Hash, ChevronRight, Info, ShieldCheck,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForumPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("Все");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', selectedTags: [] });

  const fetchForumData = async () => {
    setIsLoading(true);
    try {
      const tagsRes = await api.get('/forum/tags');
      setTags(tagsRes.data);

      const params = {};
      if (activeTag !== "Все") params.tag = activeTag;
      if (searchTerm) params.search = searchTerm;

      const topicsRes = await api.get('/forum/topics', { params });
      setTopics(topicsRes.data.data); 
    } catch (error) {
      console.error("Ошибка API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchForumData(); }, [activeTag, searchTerm]);

  const toggleTagSelection = (tagId) => {
    setNewTopic(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (newTopic.selectedTags.length === 0) return alert("Выберите хотя бы один тег");
    setIsSubmitting(true);
    try {
      await api.post('/forum/topics', {
        title: newTopic.title,
        content: newTopic.content,
        tags: newTopic.selectedTags
      });
      setIsModalOpen(false);
      setNewTopic({ title: '', content: '', selectedTags: [] });
      fetchForumData();
    } catch (error) {
      alert("Ошибка при создании темы");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      
      {/* HEADER SECTION - Чистый и сфокусированный */}
      <header className="bg-white border-b border-slate-200 pt-12 pb-10 px-6 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Community Hub</p>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">Форум KazUTB</h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">Цифровое пространство для обмена опытом</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
               {/* Search перемещен в хедер для быстрого доступа */}
               <div className="relative group min-w-[300px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input 
                    type="text"
                    placeholder="ПОИСК..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-tight focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                  />
               </div>
               <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] active:scale-95"
               >
                <Plus size={16} /> Создать тему
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* TOPICS LIST */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
               <div className="w-1 h-1 bg-blue-500 rounded-full" /> Последние обновления
            </h3>
            <span className="text-[10px] font-black text-slate-300 uppercase italic">Найдено: {topics.length}</span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Синхронизация данных...</p>
            </div>
          ) : topics.length > 0 ? (
            topics.map((topic) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={topic.id}
                onClick={() => navigate(`/app/forum/topic/${topic.id}`)}
                className="group bg-white border border-slate-200 p-6 rounded-3xl hover:border-blue-300 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${topic.is_pinned ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    {topic.is_pinned ? <TrendingUp size={20} /> : <MessageSquare size={20} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="text-left text-[17px] font-black text-slate-900 group-hover:text-blue-600 transition-colors italic uppercase leading-snug tracking-tight">
                        {topic.title}
                      </h3>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {topic.tags?.map(tag => (
                        <span key={tag.id} className="text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg uppercase border border-slate-100 transition-colors">
                          #{tag.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-[10px] text-white font-black uppercase shadow-sm">
                            {topic.author?.name?.charAt(0)}
                          </div>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{topic.author?.name}</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                          <Clock size={12} /> {topic.time_ago}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-slate-300 group-hover:text-slate-400 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={14} />
                          <span className="text-[11px] font-black">{topic.replies_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye size={14} />
                          <span className="text-[11px] font-black">{topic.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Обсуждения не найдены</p>
            </div>
          )}
        </div>

        {/* SIDEBAR (RIGHT) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* ТЭГИ - ТЕПЕРЬ ТУТ */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-black mb-6 uppercase tracking-[0.3em] text-slate-900 flex items-center gap-2">
              <Filter size={14} className="text-blue-500" /> Категории
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag("Все")}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTag === "Все" ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-transparent hover:border-slate-200'}`}
              >
                Все темы
              </button>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.name)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTag === tag.name ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-transparent hover:border-slate-200'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* КОМПАКТНАЯ СТАТИСТИКА */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Всего обсуждений</p>
                <div className="text-5xl font-black italic tracking-tighter">{topics.length}</div>
              </div>
              <TrendingUp size={40} className="text-white/10" />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-black mb-6 uppercase tracking-[0.3em] text-slate-900 flex items-center gap-2">
              <Info size={14} className="text-blue-500" /> Информация
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left leading-tight">
                  Все темы проходят автоматическую <br/> модерацию KazUTB AI.
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                  Уважайте участников сообщества и придерживайтесь академической этики.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* MODAL CREATE TOPIC (БЕЗ ИЗМЕНЕНИЙ) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Новый топик</h2>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-2">Создание цифрового обсуждения</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTopic} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Заголовок обсуждения</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:bg-white outline-none transition-all uppercase placeholder:normal-case"
                    placeholder="Тема вашего вопроса..."
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Классификация (Тэги)</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          newTopic.selectedTags.includes(tag.id)
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xl'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Содержание поста</label>
                  <textarea 
                    required
                    rows="6"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-[15px] font-medium focus:ring-4 focus:ring-blue-500/5 focus:bg-white outline-none resize-none transition-all"
                    placeholder="Подробно опишите суть темы..."
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Протокол выполняется...' : 'Опубликовать на платформе'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForumPage;