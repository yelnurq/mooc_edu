import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Save, CheckCircle2, Circle, X, AlertCircle } from 'lucide-react';
import api from '../../../../api/axios';
import _ from 'lodash';

// Мемоизированный компонент вопроса, чтобы не перерендеривать весь список
const QuestionItem = memo(({ q, index, updateQuestionText, deleteQuestion, addOption, updateOptionText, toggleCorrect, deleteOption }) => (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4 flex-1">
                <span className="w-8 h-8 bg-slate-900 text-white text-[10px] flex items-center justify-center rounded-xl font-bold">{index + 1}</span>
                <input 
                    className="bg-transparent font-bold text-slate-800 uppercase text-sm outline-none border-b border-transparent focus:border-blue-500 pb-1 w-full"
                    defaultValue={q.question_text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                />
            </div>
            <button onClick={() => deleteQuestion(q.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
        </div>

        <div className="ml-12 space-y-3">
            {q.options?.map((opt) => (
                <div key={opt.id} className="flex items-center gap-3 group">
                    <button onClick={() => toggleCorrect(q.id, opt.id)} className={`transition-colors ${opt.is_correct ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}>
                        {opt.is_correct ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <input 
                        className={`flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none transition-all ${opt.is_correct ? 'border-emerald-200 bg-emerald-50/30' : 'focus:border-blue-500'}`}
                        defaultValue={opt.option_text}
                        onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                    />
                    <button onClick={() => deleteOption(q.id, opt.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1"><X size={14} /></button>
                </div>
            ))}
            <button onClick={() => addOption(q.id)} className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest p-2 hover:bg-blue-50 rounded-lg">
                <Plus size={14} /> Добавить вариант
            </button>
        </div>
    </div>
));

const QuizEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

const [error, setError] = useState(null); // Состояние для ошибки

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/admin/quizzes/${id}`);
                setQuiz(res.data);
                setQuestions(res.data.questions || []);
                setError(null);
            } catch (e) {
                console.error(e);
                if (e.response && e.response.status === 404) {
                    setError("Тест не найден. Возможно, он был удален.");
                } else {
                    setError("Произошла ошибка при загрузке данных.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);
    // Дебаунс сохранения
    const debouncedSave = useCallback(_.debounce(async (url, data) => {
        await api.patch(url, data);
    }, 1000), []);

    const updateQuizTitle = (title) => {
        setQuiz(prev => ({ ...prev, title }));
        debouncedSave(`/admin/quizzes/${id}`, { title });
    };

    const updateQuestionText = useCallback((qId, text) => {
        debouncedSave(`/admin/questions/${qId}`, { question_text: text });
    }, [debouncedSave]);

    const updateOptionText = useCallback((qId, optId, text) => {
        debouncedSave(`/admin/options/${optId}`, { option_text: text });
    }, [debouncedSave]);

    const addQuestion = async () => {
        setIsSaving(true);
        try {
            // Теперь бэкенд возвращает вопрос сразу с 4 опциями
            const res = await api.post(`/admin/quizzes/${id}/questions`);
            setQuestions(prev => [...prev, res.data]);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteQuestion = useCallback(async (qId) => {
        if (!window.confirm("Удалить вопрос?")) return;
        await api.delete(`/admin/questions/${qId}`);
        setQuestions(prev => prev.filter(q => q.id !== qId));
    }, []);

    const toggleCorrect = useCallback(async (qId, optId) => {
        setQuestions(prev => prev.map(q => q.id === qId ? {
            ...q, options: q.options.map(o => ({ ...o, is_correct: o.id === optId }))
        } : q));
        await api.patch(`/admin/options/${optId}/correct`);
    }, []);

    const addOption = async (qId) => {
        const res = await api.post(`/admin/questions/${qId}/options`, { option_text: "Новый вариант" });
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...q.options, res.data] } : q));
    };

    const deleteOption = async (qId, optId) => {
        await api.delete(`/admin/options/${optId}`);
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.filter(o => o.id !== optId) } : q));
    };

if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="animate-spin text-slate-400" size={40} />
            <div className="text-center font-black text-slate-400 uppercase tracking-widest text-xs">Загрузка данных...</div>
        </div>
    );// ЭКРАН ОШИБКИ
    if (error) return (
        <div className="max-w-4xl mx-auto py-20 px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 text-red-500 rounded-3xl mb-6">
                <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">{error}</h1>
            <p className="text-slate-500 text-sm mb-8">Проверьте правильность ссылки или вернитесь в панель управления.</p>
            <button 
                onClick={() => navigate('/admin/courses')} // Укажи здесь свой путь к списку тестов
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
                <ArrowLeft size={16} /> Вернуться к списку
            </button>
        </div>
    );
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-900">
                <ArrowLeft size={20} /> <span className="text-[10px] font-bold uppercase tracking-widest">Назад</span>
            </button>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <input 
                    className="text-2xl font-black text-slate-900 uppercase tracking-tighter w-full outline-none border-b-2 border-transparent focus:border-blue-600 pb-2 mb-8"
                    defaultValue={quiz?.title || ''}
                    onChange={(e) => updateQuizTitle(e.target.value)}
                />

                <div className="space-y-8">
                    {questions.map((q, index) => (
                        <QuestionItem 
                            key={q.id} 
                            q={q} 
                            index={index} 
                            updateQuestionText={updateQuestionText}
                            deleteQuestion={deleteQuestion}
                            addOption={addOption}
                            updateOptionText={updateOptionText}
                            toggleCorrect={toggleCorrect}
                            deleteOption={deleteOption}
                        />
                    ))}
                </div>

                <button disabled={isSaving} onClick={addQuestion} className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Добавить вопрос
                </button>
            </div>
        </div>
    );
};

export default QuizEditor;