import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Video, FileText, GripVertical, Trash2, 
  Save, ArrowLeft, Loader2, Edit2, X, Eye, Download, Link as LinkIcon
} from 'lucide-react';
import api from '../../../../api/axios';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);

  // Загрузка данных
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

  // --- МЕТОДЫ ДЛЯ МОДУЛЕЙ ---
  const addModule = async () => {
    const title = prompt("Название нового модуля:");
    if (!title) return;
    try {
      const res = await api.post(`/admin/courses/${id}/modules`, { title });
      setModules([...modules, { ...res.data, lessons: [] }]);
    } catch (e) { alert("Ошибка при создании модуля"); }
  };

  // --- МЕТОДЫ ДЛЯ УРОКОВ ---
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
      return;
    }
    await saveLesson(moduleId, formData);
  };

  const saveLesson = async (moduleId, data) => {
    try {
      const res = await api.post(`/admin/modules/${moduleId}/lessons`, data);
      setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, res.data] } : m));
    } catch (e) { alert("Ошибка сохранения урока"); }
  };

  // --- МЕТОДЫ ДЛЯ РЕСУРСОВ КУРСА ---
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
      return;
    }
    await saveResource(formData);
  };

  const saveResource = async (data) => {
    try {
      const res = await api.post(`/admin/courses/${id}/resources`, data);
      setResources([...resources, res.data]);
    } catch (e) { alert("Ошибка при добавлении ресурса"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-left">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-[100]">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter text-slate-900">{course?.title}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Конструктор курса</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg">
            <Save size={16} /> Сохранить
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-10">
        
        {/* РЕСУРСЫ КУРСА */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Материалы курса (Resources)</h2>
            <div className="flex gap-2">
              <button onClick={() => addResource('pdf')} className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all">
                <Plus size={14} /> Файл
              </button>
              <button onClick={() => addResource('video')} className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all">
                <Plus size={14} /> Видео
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.length > 0 ? resources.map(res => (
              <div key={res.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${res.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {res.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{res.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreviewItem(res)} className="p-2 text-slate-400 hover:text-blue-600"><Eye size={16}/></button>
                  <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            )) : (
              <div className="col-span-2 py-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Нет общих материалов</div>
            )}
          </div>
        </section>

        {/* МОДУЛИ И УРОКИ */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Учебный план</h2>
          <button onClick={addModule} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"><Plus size={16} /> Добавить модуль</button>
        </div>

        <div className="space-y-6">
          {modules.map((module, mIndex) => (
            <div key={module.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-5 py-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[11px] font-black text-slate-400">{mIndex + 1}</div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{module.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => addLesson(module.id, 'video')} className="p-2 text-slate-400 hover:text-blue-600" title="Добавить видео"><Video size={18} /></button>
                  <button onClick={() => addLesson(module.id, 'pdf')} className="p-2 text-slate-400 hover:text-emerald-600" title="Добавить PDF"><FileText size={18} /></button>
                </div>
              </div>

              <div className="p-2 space-y-1">
                {module.lessons?.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group transition-all">
                    <div className="flex items-center gap-4">
                      <GripVertical size={16} className="text-slate-200 group-hover:text-slate-400" />
                      <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {lesson.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                      </div>
                      <span className="text-xs font-bold text-slate-600 tracking-tight">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setPreviewItem(lesson)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-all"><Eye size={16}/></button>
                      <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL PREVIEW --- */}
      {previewItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{previewItem.type} view</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tighter">{previewItem.title}</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            
            <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
              {previewItem.type === 'video' ? (
                <iframe 
                  className="w-full h-full"
                  src={getYoutubeEmbed(previewItem.video_url)}
                  title={previewItem.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                <iframe 
                  src={getFileUrl(previewItem.file_path)} 
                  className="w-full h-full"
                  title="PDF Preview"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;