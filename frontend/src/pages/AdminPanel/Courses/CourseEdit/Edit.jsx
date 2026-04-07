import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Video, FileText, GripVertical, Trash2, 
  Save, ArrowLeft, Loader2, X, Eye, Link as LinkIcon, ChevronRight
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
      setModules(res.data.modules);
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
      setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, res.data] } : m));
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
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);

    if (type === 'video') {
      const url = prompt("Ссылка на видео:");
      if (!url) return;
      formData.append('video_url', url);
      await saveResource(formData);
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

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="mx-auto px-4 md:px-10 py-10 bg-[#f8fafc] min-h-screen font-sans border rounded-lg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ЗАГОЛОВОК И ОСНОВНАЯ ИНФО */}
<div className="bg-white border border-slate-200 rounded-[2rem] p-8 mb-10 shadow-sm relative overflow-hidden">
  {/* Декоративный фон для картинки (опционально) */}
  <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
    {course?.image && (
      <img 
        src={getFileUrl(course.image)} 
        alt="" 
        className="object-cover w-full h-full grayscale"
      />
    )}
  </div>

  <div className="relative z-10">
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Изображение курса */}
      <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
        {course?.image ? (
          <img 
            src={getFileUrl(course.image)} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Video size={32} />
          </div>
        )}
      </div>

      {/* Текстовая информация */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors border border-slate-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">
              {course?.title}
            </h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
              Автор: {course?.author || 'Не указан'}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
          {course?.description || 'Описание курса еще не заполнено.'}
        </p>
      </div>

    </div>
  </div>
</div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Учебный план</h2>
              {!isAddingModule && (
                <button onClick={() => setIsAddingModule(true)} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                  <Plus size={16} /> Добавить модуль
                </button>
              )}
            </div>

            {isAddingModule && (
              <div className="bg-white border border-blue-200 p-4 rounded-2xl flex gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                <input 
                  autoFocus
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Название модуля..."
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                />
                <button onClick={handleAddModule} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Создать</button>
                <button onClick={() => setIsAddingModule(false)} className="text-slate-400 p-2 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>
            )}

            <div className="space-y-4">
              {modules.map((module, mIndex) => (
                <div key={module.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden transition-all hover:border-slate-300">
                  <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[11px] font-black text-slate-400">{mIndex + 1}</div>
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{module.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => addLesson(module.id, 'video')} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Video size={18} /></button>
                      <button onClick={() => addLesson(module.id, 'pdf')} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><FileText size={18} /></button>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    {module.lessons?.length > 0 ? module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl group transition-all">
                        <div className="flex items-center gap-4">
                          <GripVertical size={16} className="text-slate-200 group-hover:text-slate-400 cursor-grab" />
                          <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {lesson.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                          </div>
                          <span className="text-xs font-bold text-slate-600 tracking-tight">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => setPreviewItem(lesson)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"><Eye size={16}/></button>
                          <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    )) : (
                      <div className="py-4 text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">Уроков нет</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <section className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Материалы</h2>
                  <div className="flex gap-1">
                    <button onClick={() => addResource('pdf')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Файл"><Plus size={16} /></button>
                    <button onClick={() => addResource('video')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Видео"><LinkIcon size={16} /></button>
                  </div>
                </div>

                <div className="space-y-3">
                  {resources.length > 0 ? resources.map(res => (
                    <div key={res.id} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between group hover:border-blue-100 hover:bg-white transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white shadow-sm ${res.type === 'video' ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {res.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{res.title}</span>
                      </div>
                      <button onClick={() => setPreviewItem(res)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <ChevronRight size={16}/>
                      </button>
                    </div>
                  )) : (
                    <div className="py-6 border-2 border-dashed border-slate-100 rounded-2xl text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">Пусто</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setPreviewItem(null)} />
          <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${previewItem.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {previewItem.type === 'video' ? <Video size={20}/> : <FileText size={20}/>}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">{previewItem.title}</h3>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{previewItem.type} asset</span>
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 bg-slate-100 overflow-hidden relative">
              {previewItem.type === 'video' ? (
                <iframe 
                  className="w-full h-full"
                  src={getYoutubeEmbed(previewItem.video_url)}
                  title={previewItem.title}
                  frameBorder="0"
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