import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../api/axios';
import { 
  MessageSquare, Search, Plus, X, 
  Clock, Eye, MessageCircle, TrendingUp, 
  ChevronRight, ShieldCheck, Filter, 
  AlertTriangle, PlusCircle, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Компонент карточки статистики (в стиле MyCourses)
const StatCard = ({ icon: Icon, label, value, colorClass, description, onClick }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className={`w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition-all text-left group 
      ${onClick ? 'hover:border-blue-400 hover:shadow-md cursor-pointer' : ''}`}
  >
    <div className={`absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-blue-600 transition-colors`} />
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{description}</p>
  </button>
);

const ForumPage = () => {
  const navigate = useNavigate();
  
  // States
  const [topics, setTopics] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("Все");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', selectedTags: [] });

  const fetchForumData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const tagsRes = await api.get('/forum/tags');
      setTags(tagsRes.data);

      const params = { page, search: searchTerm };
      if (viewMode === 'my') params.my_topics = true;
      if (activeTag !== "Все") params.tag = activeTag;

      const topicsRes = await api.get('/forum/topics', { params });
      setTopics(topicsRes.data.data || []); 
      setCurrentPage(topicsRes.data.current_page || 1);
      setLastPage(topicsRes.data.last_page || 1);
    } catch (error) {
      console.error("Ошибка API:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTag, searchTerm, viewMode]);

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
    if (newTopic.selectedTags.length === 0) return alert("Выберите категорию");
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

  const statusOptions = [
    { id: 'all', label: 'Весь форум' },
    { id: 'my', label: 'Мои вопросы' }
  ];

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-10 bg-[#f8fafc] font-sans text-slate-900 min-h-screen">
      
      {/* HEADER (Как в MyCourses) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8 mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Форум сообщества</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Задавайте вопросы экспертам, участвуйте в академических дискуссиях <br/> и обменивайтесь опытом в едином цифровом пространстве.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <PlusCircle size={14} /> Создать тему
          </button>
          
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setViewMode(opt.id)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  viewMode === opt.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR (Как в MyCourses) */}
        <aside className="lg:col-span-1 space-y-6 text-left">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="ПОИСК ПО ТЕМАМ..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold uppercase outline-none focus:border-blue-500 shadow-sm transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Категории</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag("Все")}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                    activeTag === "Все" ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  Все
                </button>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setActiveTag(tag.name)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                      activeTag === tag.name ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <StatCard 
            label="Безопасность" 
            value="AI Guard" 
            icon={ShieldCheck} 
            colorClass="bg-blue-50 text-blue-600" 
            description="Контент модерируется системой KazUTB для чистоты дискуссий" 
          />
        </aside>

        {/* MAIN FEED */}
        <div className="lg:col-span-3 text-left">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
            </div>
          ) : topics.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence mode='popLayout'>
                {topics.map((topic) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    key={topic.id}
                    onClick={() => navigate(`/app/forum/topic/${topic.id}`)}
                    className={`group relative bg-white p-6 rounded-xl border transition-all cursor-pointer shadow-sm hover:border-blue-400 hover:shadow-lg flex flex-col justify-between ${
                      topic.is_bad ? 'border-orange-200 ring-1 ring-orange-50' : 'border-slate-200'
                    }`}
                  >
                    {/* Акцентная линия как в StatCard */}
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                        topic.is_pinned ? 'bg-amber-400' : topic.is_bad ? 'bg-orange-400' : 'bg-slate-200 group-hover:bg-blue-600'
                    }`} />

                    <div className="flex justify-between items-start gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          {topic.is_pinned && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded uppercase tracking-tighter">Закреплено</span>
                          )}
                          {topic.is_bad && (
                             <span className="text-[8px] font-black px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded uppercase tracking-tighter flex items-center gap-1">
                               <AlertTriangle size={10} /> Модерация
                             </span>
                          )}
                          <div className="flex gap-1">
                            {topic.tags?.map(tag => (
                              <span key={tag.id} className="text-[9px] font-bold text-blue-600/70 uppercase tracking-widest">
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                          {topic.title}
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-slate-900 rounded flex items-center justify-center text-[9px] text-white font-black">
                                    {topic.author?.name?.charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{topic.author?.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 uppercase text-[9px] font-bold tracking-tighter">
                                <Clock size={12} /> {topic.time_ago}
                            </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-4 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <MessageCircle size={14} className="text-slate-400" />
                                <span className="text-[11px] font-black">{topic.replies_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <Eye size={14} className="text-slate-400" />
                                <span className="text-[11px] font-black">{topic.views || 0}</span>
                            </div>
                        </div>
                        <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                            <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {lastPage > 1 && (
                <div className="flex justify-center gap-2 pt-8">
                  {[...Array(lastPage)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => fetchForumData(i + 1)}
                      className={`w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        currentPage === i + 1 ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                <PieChart size={32} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">Тем не найдено</h3>
              <p className="text-[11px] font-medium text-slate-400 max-w-[240px] leading-relaxed mb-8 uppercase text-center">
                По вашему запросу ничего не найдено. Начните обсуждение первым, задав актуальный вопрос.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all shadow-lg"
              >
                Новая тема
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL (В стиле MyCourses) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
              <div className="p-8 flex justify-between items-center border-b border-slate-50 text-left">
                <div>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase tracking-widest">Создание</span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Новое обсуждение</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateTopic} className="p-8 space-y-6 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Заголовок темы</label>
                  <input 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                    placeholder="КРАТКО И ЯСНО..."
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Выберите теги</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                          newTopic.selectedTags.includes(tag.id)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Суть вопроса</label>
                  <textarea 
                    required
                    rows="4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-blue-500 transition-all resize-none"
                    placeholder="ПОДРОБНОЕ ОПИСАНИЕ..."
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all shadow-lg"
                >
                  {isSubmitting ? 'Публикация...' : 'Запустить обсуждение'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-left mt-16 pt-8 border-t border-slate-200 uppercase">
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed tracking-wider">
          Форум KazUTB — это официальная площадка. Пожалуйста, соблюдайте нормы академической этики. 
          Ваш вклад помогает формировать качественную базу знаний университета.
        </p>
      </div>
    </main>
  );
};

export default ForumPage;