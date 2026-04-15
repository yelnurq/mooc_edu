import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { 
  MessageSquare, Search, Plus, X, 
  User, Clock, Eye, 
  MessageCircle, TrendingUp, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForumPage = () => {
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("Все");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Состояния для создания темы
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', selectedTags: [] });

  // 1. Загрузка данных
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

  useEffect(() => {
    fetchForumData();
  }, [activeTag, searchTerm]);

  // 2. Логика формы
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
      fetchForumData(); // Обновляем список
    } catch (error) {
      console.error("Ошибка при создании темы:", error);
      alert("Не удалось создать тему. Проверьте авторизацию.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Форум KazUTB</h1>
              <p className="text-slate-500 text-[14px] font-medium">Общайтесь по тегам и интересам.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-[14px] transition-all shadow-lg shadow-blue-100 uppercase tracking-wider"
            >
              <Plus size={18} /> Создать тему
            </button>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Поиск по темам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-[14px] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTag("Все")}
                className={`px-5 py-3 rounded-xl text-[13px] font-bold transition-all ${activeTag === "Все" ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
              >
                Все
              </button>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.name)}
                  className={`px-5 py-3 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
                    activeTag === tag.name ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {isLoading ? (
             <div className="p-20 text-center text-slate-400 font-bold">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p>Загрузка обсуждений...</p>
             </div>
          ) : topics.length > 0 ? (
            topics.map((topic) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={topic.id}
                className="group bg-white border border-slate-200 p-5 rounded-[24px] hover:border-blue-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${topic.is_pinned ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                    {topic.is_pinned ? <TrendingUp size={24} /> : <MessageSquare size={24} />}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-left text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3 italic">
                      {topic.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {topic.tags?.map(tag => (
                        <span key={tag.id} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-200">
                          <Hash size={10} /> {tag.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-4 text-slate-500">
                        <span className="flex items-center gap-1.5 text-[12px] font-bold">
                          <User size={14} className="text-slate-400" /> {topic.author?.name || 'Пользователь'}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <Clock size={12} /> {topic.time_ago}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          <span className="text-[12px] font-bold">{topic.replies_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span className="text-[12px] font-bold">{topic.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[24px] border border-dashed border-slate-300 text-slate-400 font-medium">
              Тем пока нет. Будьте первым!
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[18px] font-black mb-6 uppercase tracking-widest">Статистика</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-black italic">{topics.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Активных тем</div>
                </div>
              </div>
            </div>
            <MessageSquare className="absolute -right-6 -bottom-6 opacity-10 rotate-12 text-white" size={140} />
          </div>
        </div>
      </main>

      {/* Modal Create Topic */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-900 uppercase">Новое обсуждение</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTopic} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Заголовок темы</label>
                  <input 
                    required
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Например: Как выучить React за месяц?"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Выберите категории</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                          newTopic.selectedTags.includes(tag.id)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Сообщение</label>
                  <textarea 
                    required
                    rows="5"
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Опишите ваш вопрос или предложение..."
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Публикация...' : 'Создать обсуждение'}
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