import React, { useState } from 'react';
import { 
  MessageSquare, Search, Plus, Filter, 
  ChevronRight, User, Clock, Eye, 
  MessageCircle, TrendingUp, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';

const FORUM_DATA = [
  {
    id: 1,
    title: "Как подготовиться к дипломной работе по веб-разработке?",
    author: "Zeynolla Yelnur",
    category: "Учеба",
    replies: 15,
    views: 124,
    time: "2 часа назад",
    tags: ["React", "Laravel", "Diploma"],
    isPinned: true
  },
  {
    id: 2,
    title: "Проблема с настройкой LDAP в корпоративной сети",
    author: "Admin_KazUTB",
    category: "Техподдержка",
    replies: 8,
    views: 89,
    time: "5 часов назад",
    tags: ["LDAP", "AD", "Server"],
    isPinned: false
  },
  {
    id: 3,
    title: "Обсуждение стартапа 'Tour Mangystau' — ищем партнеров",
    author: "Startup_Hub",
    category: "Проекты",
    replies: 42,
    views: 567,
    time: "1 день назад",
    tags: ["Startup", "Kazakhstan", "Tourism"],
    isPinned: false
  },
  {
    id: 4,
    title: "Какие БАДы лучше для набора мышечной массы при сидячей работе?",
    author: "FitnessDev",
    category: "Спорт",
    replies: 23,
    views: 210,
    time: "2 дня назад",
    tags: ["Gym", "Nutrition", "Health"],
    isPinned: false
  }
];

const CATEGORIES = ["Все", "Учеба", "Проекты", "Техподдержка", "Спорт", "Курилка"];

const ForumPage = () => {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTopics = FORUM_DATA.filter(topic => {
    const matchesCategory = activeCategory === "Все" || topic.category === activeCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Форум KazUTB</h1>
              <p className="text-slate-500 text-[14px] font-medium">Общайтесь, делитесь опытом и создавайте проекты вместе.</p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-[14px] transition-all shadow-lg shadow-blue-100 uppercase tracking-wider">
              <Plus size={18} /> Создать тему
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Поиск по темам форума..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl text-[14px] focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-3 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Filter size={14} /> Последние обсуждения
            </h2>
          </div>

          {filteredTopics.map((topic) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={topic.id}
              className="group bg-white border border-slate-200 p-5 rounded-[24px] hover:border-blue-400 transition-all hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer"
            >
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${topic.isPinned ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                  {topic.isPinned ? <TrendingUp size={24} /> : <MessageSquare size={24} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                      {topic.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {topic.time}
                    </span>
                  </div>
                  
                  <h3 className="text-left text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                    {topic.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {topic.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-100">
                        <Hash size={10} /> {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User size={14} className="text-slate-400" />
                        <span className="text-[12px] font-bold">{topic.author}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        <span className="text-[12px] font-bold">{topic.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span className="text-[12px] font-bold">{topic.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats Box */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-[18px] font-black mb-6">Статистика</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-black italic">1.2k</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Темы</div>
                </div>
                <div>
                  <div className="text-2xl font-black italic">8.5k</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ответы</div>
                </div>
              </div>
            </div>
            <MessageSquare className="absolute -right-6 -bottom-6 opacity-10 rotate-12" size={140} />
          </div>

          {/* Top Contributors */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6">
            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 px-2">
              <TrendingUp size={14} /> Топ авторов
            </h3>
            <div className="space-y-5">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Пользователь_{i+100}</div>
                      <div className="text-[11px] text-slate-400 font-medium">128 ответов</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines Snippet */}
          <div className="bg-blue-50 rounded-[32px] p-6 border border-blue-100">
             <h4 className="text-[14px] font-black text-blue-900 mb-3 flex items-center gap-2">
                📢 Правила
             </h4>
             <ul className="space-y-2">
                {['Будьте вежливы', 'Без спама', 'Темы в нужные разделы'].map((rule, idx) => (
                  <li key={idx} className="text-[12px] font-bold text-blue-700/70 flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full" /> {rule}
                  </li>
                ))}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForumPage;