import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Video, FileText, GripVertical, Trash2, 
  ArrowLeft, Loader2, X, Eye, Link as LinkIcon, 
  ChevronRight, Layers, MonitorPlay, BookOpen, User, Clock
} from 'lucide-react';
import api from '../../../../api/axios';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const fetchCourseStructure = useCallback(async () => {
    try {
      const res = await api.get(`/admin/courses/${id}/structure`);
      setCourse(res.data.course);
      setModules(res.data.modules || []);
      setResources(res.data.resources || []);
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCourseStructure(); }, [fetchCourseStructure]);

  const getFileUrl = (path) => `http://localhost:8000/storage/${path}`;
  
  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await api.post(`/admin/courses/${id}/modules`, { title: newModuleTitle });
      setModules([...modules, { ...res.data, lessons: [] }]);
      setNewModuleTitle('');
      setIsAddingModule(false);
    } catch (e) { alert("Ошибка при создании модуля"); }
  };

  const saveLesson = async (moduleId, data) => {
    try {
      const res = await api.post(`/admin/modules/${moduleId}/lessons`, data);
      setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), res.data] } : m));
    } catch (e) { alert("Ошибка сохранения урока"); }
  };

  const addLesson = async (moduleId, type) => {
    const title = prompt(`Название ${type === 'video' ? 'видео-урока' : 'лекции (PDF)'}:`);
    if (!title) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);

    if (type === 'video') {
      const url = prompt("Введите ссылку на YouTube:");
      if (!url) return;
      formData.append('video_url', url);
      await saveLesson(moduleId, formData);
    } else {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf';
      fileInput.onchange = async (e) => {
        if (e.target.files[0]) {
          formData.append('file', e.target.files[0]);
          await saveLesson(moduleId, formData);
        }
      };
      fileInput.click();
    }
  };

  const saveResource = async (data) => {
    try {
      const res = await api.post(`/admin/courses/${id}/resources`, data);
      setResources(prev => [...prev, res.data]);
    } catch (e) { alert("Ошибка при добавлении ресурса"); }
  };

const addResource = async (type) => {
  const title = prompt("Название ресурса:");
  if (!title) return;

  // Спрашиваем, является ли этот ресурс промо-роликом
  const isPromo = type === 'video' 
    ? window.confirm("Сделать это видео основным промо-роликом курса?") 
    : false;

  const formData = new FormData();
  formData.append('title', title);
  formData.append('type', type);
  formData.append('is_promo', isPromo ? '1' : '0'); // Передаем как строку для FormData

  if (type === 'video') {
    const url = prompt("Ссылка на видео:");
    if (!url) return;
    formData.append('video_url', url);
    await saveResource(formData);
    // Опционально: перезагружаем структуру, чтобы обновить флаги у других ресурсов
    if (isPromo) fetchCourseStructure(); 
  } else {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e) => {
      if (e.target.files[0]) {
        formData.append('file', e.target.files[0]);
        await saveResource(formData);
      }
    };
    fileInput.click();
  }
};
const togglePromo = async (e, resourceId) => {
  e.stopPropagation(); // Чтобы не открылся предпросмотр
  try {
    await api.patch(`/admin/resources/${resourceId}/promo`);
    fetchCourseStructure(); // Обновляем данные
  } catch (e) {
    alert("Ошибка при обновлении статуса промо");
  }
};
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f8fafc]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
  return (
    <div className="mx-auto px-4 md:px-10 py-6 md:py-10 bg-[#f8fafc] min-h-screen font-sans text-left">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION (Style from CourseManagement Header) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate(-1)} 
              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tighter uppercase leading-none">
                {course?.title || 'Редактор курса'}
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Конструктор учебной программы
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddingModule(true)} 
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> Добавить модуль
          </button>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Автор */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><User size={18} /></div>
            <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Автор программы</p>
            <p className="text-sm font-black text-slate-900 uppercase">{course?.author || 'Не назначен'}</p>
            </div>
        </div>

        {/* Модули */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600"><Layers size={18} /></div>
            <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Структура</p>
            <p className="text-sm font-black text-slate-900 uppercase">{modules.length} Модулей</p>
            </div>
        </div>

        {/* Лекции (Вместо статуса) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600"><MonitorPlay size={18} /></div>
            <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Контент</p>
            <div className="flex items-baseline gap-1">
                <p className="text-sm font-black text-slate-900 uppercase">{totalLessons}</p>
                <span className="text-[9px] font-bold text-slate-400 uppercase">лекц.</span>
            </div>
            </div>
        </div>
        </div>
        <div className="grid grid-cols-12 gap-8">
          {/* MAIN CONTENT: MODULES */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {isAddingModule && (
              <div className="bg-white border-2 border-blue-600 p-6 rounded-2xl flex gap-3 shadow-xl animate-in fade-in slide-in-from-top-4">
                <input 
                  autoFocus
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                  placeholder="НАЗВАНИЕ НОВОГО МОДУЛЯ..."
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                />
                <button onClick={handleAddModule} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors">Создать</button>
                <button onClick={() => setIsAddingModule(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
              </div>
            )}

            <div className="space-y-4">
              {modules.length > 0 ? (
                modules.map((module, mIndex) => (
                  <div key={module.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md border-l-4 border-l-transparent hover:border-l-blue-600">
                    {/* Module Header */}
                    <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 w-8 h-8 flex items-center justify-center rounded-lg border border-blue-100">
                          {String(mIndex + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tighter">{module.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => addLesson(module.id, 'video')} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Добавить видео"><Video size={16} /></button>
                        <button onClick={() => addLesson(module.id, 'pdf')} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Добавить PDF"><FileText size={16} /></button>
                      </div>
                    </div>

                    {/* Lessons List */}
                    <div className="p-2 space-y-1">
                      {module.lessons?.length > 0 ? module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group transition-all">
                          <div className="flex items-center gap-4">
                            <GripVertical size={14} className="text-slate-200 group-hover:text-slate-400 cursor-grab" />
                            <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {lesson.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setPreviewItem(lesson)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><Eye size={16}/></button>
                            <button className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      )) : (
                        <div className="py-8 text-center">
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Материалы не добавлены</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Программа пуста</h3>
                  <button 
                    onClick={() => setIsAddingModule(true)}
                    className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all"
                  >
                    Создать первый модуль
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR: RESOURCES (Style from Management Sidebar elements) */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-10 space-y-6 text-left">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Доп. ресурсы</h2>
                  <div className="flex gap-1">
                    <button onClick={() => addResource('pdf')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Plus size={16} /></button>
                    <button onClick={() => addResource('video')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><LinkIcon size={16} /></button>
                  </div>
                </div>

                <div className="space-y-2">
                  {resources.length > 0 ? resources.map(res => (
                    <div 
                      key={res.id} 
                      className={`bg-slate-50 border p-3 rounded-xl flex items-center justify-between group hover:bg-white transition-all cursor-pointer ${res.is_promo ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'}`} 
                      onClick={() => setPreviewItem(res)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg bg-white shadow-sm flex-shrink-0 ${res.type === 'video' ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {res.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-slate-700 truncate uppercase tracking-tight">
                            {res.title}
                          </span>
                          {res.is_promo && (
                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                              <MonitorPlay size={8} /> Промо-ролик
                            </span>
                          )}
                        </div>
                      </div>
                      {res.type === 'video' && !res.is_promo && (
  <button 
    onClick={(e) => togglePromo(e, res.id)}
    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition-all mr-1"
    title="Сделать промо"
  >
    <MonitorPlay size={14} />
  </button>
)}
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </div>
                  )) : (
                    <div className="py-10 border border-dashed border-slate-100 rounded-xl flex items-center justify-center">
                       <p className="text-[9px] font-bold text-slate-300 uppercase">Нет материалов</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Tips / Help Card */}
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Совет</p>
                <p className="text-xs font-bold leading-relaxed uppercase">Используйте Drag-and-Drop для изменения порядка уроков внутри модулей.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW DRAWER (Slide over from Management style) */}
      {previewItem && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setPreviewItem(null)} />
          <div className="relative w-full max-w-5xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${previewItem.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {previewItem.type === 'video' ? <Video size={20}/> : <FileText size={20}/>}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-tight">{previewItem.title}</h3>
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Предпросмотр контента</span>
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 transition-all border border-slate-100"><X size={20}/></button>
            </div>
            
            <div className="flex-1 bg-slate-900 overflow-hidden relative">
              {previewItem.type === 'video' ? (
                <iframe 
                  className="w-full h-full"
                  src={getYoutubeEmbed(previewItem.video_url)}
                  title={previewItem.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <iframe 
                  src={getFileUrl(previewItem.file_path)} 
                  className="w-full h-full"
                  title="PDF Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;