import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { 
  MessageSquare, Search, Plus, X, 
  Clock, Eye, MessageCircle, TrendingUp, 
  ChevronRight, Info, ShieldCheck,
  Filter, Sparkles, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForumPage = () => {
  const navigate = useNavigate();
  
  // States
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("Все");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'my'
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state (для работы с Laravel paginate)
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', selectedTags: [] });

  // Fetch Data
  const fetchForumData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // 1. Получаем теги (можно вынести в отдельный useEffect, чтобы не грузить каждый раз)
      const tagsRes = await api.get('/forum/tags');
      setTags(tagsRes.data);

      // 2. Формируем параметры для Laravel index метода
      const params = {
        page,
        search: searchTerm,
      };

      if (viewMode === 'my') {
        params.my_topics = true; // Laravel считает это через $request->boolean('my_topics')
      }
      
      if (activeTag !== "Все") {
        params.tag = activeTag;
      }

      const topicsRes = await api.get('/forum/topics', { params });
      
      // Laravel paginate возвращает объект с полем data
      setTopics(topicsRes.data.data); 
      setCurrentPage(topicsRes.data.current_page);
      setLastPage(topicsRes.data.last_page);
    } catch (error) {
      console.error("Ошибка API:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTag, searchTerm, viewMode]);

  // Сброс страницы при смене фильтров
  useEffect(() => {
    fetchForumData(1);
  }, [activeTag, searchTerm, viewMode, fetchForumData]);

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
    if (newTopic.selectedTags.length === 0) return alert("Выберите тег");
    setIsSubmitting(true);
    try {
      await api.post('/forum/topics', {
        title: newTopic.title,
        content: newTopic.content,
        tags: newTopic.selectedTags
      });
      setIsModalOpen(false);
      setNewTopic({ title: '', content: '', selectedTags: [] });
      fetchForumData(1);
    } catch (error) {
      alert("Ошибка при создании");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 pt-12 pb-10 px-6 sticky top-0 z-30 backdrop-blur-md bg-white/90">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Social Protocol</p>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase leading-none">Форум KazUTB</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="ПОИСК ПО ЗАГОЛОВКУ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:min-w-[320px] pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-tight focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                />
             </div>
             <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] active:scale-95"
             >
              <Plus size={16} /> Создать тему
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TABS SWITCHER */}
          <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={14} /> Все обсуждения
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'my' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <User size={14} /> Мои вопросы
            </button>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Reading database...</p>
              </div>
            ) : topics.length > 0 ? (
              <>
                {topics.map((topic) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={topic.id}
                    onClick={() => navigate(`/app/forum/topic/${topic.id}`)}
                    className="group bg-white border border-slate-200 p-6 rounded-[2.5rem] hover:border-blue-300 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-blue-500/5"
                  >
                    <div className="flex items-start gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${topic.is_pinned ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6'}`}>
                        {topic.is_pinned ? <TrendingUp size={24} /> : <MessageSquare size={24} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h3 className="text-[18px] font-black text-slate-900 group-hover:text-blue-600 transition-colors italic uppercase leading-tight tracking-tight">
                            {topic.title}
                          </h3>
                          <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {topic.tags?.map(tag => (
                            <span key={tag.id} className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase border border-slate-100">
                              #{tag.name}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] text-white font-black uppercase shadow-lg shadow-slate-200">
                                {topic.author?.name?.charAt(0)}
                              </div>
                              <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{topic.author?.name}</span>
                            </div>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                              <Clock size={14} /> {topic.time_ago}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-5 text-slate-300 group-hover:text-slate-400 transition-colors">
                            <div className="flex items-center gap-2">
                              <MessageCircle size={16} />
                              <span className="text-[12px] font-black">{topic.replies_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye size={16} />
                              <span className="text-[12px] font-black">{topic.views || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* SIMPLE PAGINATION CONTROLS */}
                {lastPage > 1 && (
                  <div className="flex justify-center gap-2 pt-6">
                    {[...Array(lastPage)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => fetchForumData(i + 1)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-900'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 shadow-sm">
                <MessageSquare size={48} className="mx-auto mb-6 opacity-10" />
                <p className="text-[12px] font-black uppercase tracking-[0.4em]">Ничего не найдено</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-black mb-6 uppercase tracking-[0.3em] text-slate-900 flex items-center gap-2">
              <Filter size={14} className="text-blue-500" /> Навигация категорий
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag("Все")}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTag === "Все" ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-400 border border-transparent hover:border-slate-200 hover:bg-white'}`}
              >
                Все потоки
              </button>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.name)}
                  className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTag === tag.name ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-400 border border-transparent hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mb-20 -mr-20" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Активность</p>
                <div className="text-6xl font-black italic tracking-tighter">{topics.length}</div>
              </div>
              <TrendingUp size={48} className="text-white/10" />
            </div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Safety Protocol</h3>
             </div>
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                Все публикации проходят через KazUTB Moderation AI для поддержания академической среды.
             </p>
          </div>
        </aside>
      </main>

      {/* MODAL (без изменений) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 40, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase italic leading-none">Инициация темы</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-100 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTopic} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Заголовок обсуждения</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-base font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all uppercase placeholder:normal-case"
                    placeholder="Тема вашего вопроса..."
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Классификация (Тэги)</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          newTopic.selectedTags.includes(tag.id)
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                          : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Содержание поста</label>
                  <textarea 
                    required
                    rows="4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-base font-medium outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                    placeholder="Подробно опишите суть темы..."
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Выполнение протокола...' : 'Опубликовать на платформе'}
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