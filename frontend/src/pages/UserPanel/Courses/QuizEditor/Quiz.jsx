import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Save } from 'lucide-react';
import api from '../../../../api/axios';
import _ from 'lodash'; // Убедись, что lodash установлен: npm install lodash

const QuizEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Загрузка данных
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/admin/quizzes/${id}`);
                setQuiz(res.data);
                setQuestions(res.data.questions || []);
            } catch (e) {
                console.error("Ошибка загрузки теста:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    // Функция сохранения заголовка теста
    const updateQuizTitle = async (newTitle) => {
        setQuiz(prev => ({ ...prev, title: newTitle }));
        debouncedSaveQuiz(newTitle);
    };

    const debouncedSaveQuiz = useCallback(
        _.debounce(async (title) => {
            try {
                await api.patch(`/admin/quizzes/${id}`, { title });
                console.log("Заголовок сохранен");
            } catch (e) {
                console.error("Ошибка сохранения заголовка");
            }
        }, 1000),
        [id]
    );

    // Функция сохранения вопроса
    const updateQuestionText = (qId, newText) => {
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, question_text: newText } : q));
        debouncedSaveQuestion(qId, newText);
    };

    const debouncedSaveQuestion = useCallback(
        _.debounce(async (qId, text) => {
            try {
                await api.patch(`/admin/questions/${qId}`, { question_text: text });
                console.log("Вопрос сохранен");
            } catch (e) {
                console.error("Ошибка сохранения вопроса");
            }
        }, 1000),
        []
    );

    const addQuestion = async () => {
        setIsSaving(true);
        try {
            const res = await api.post(`/admin/quizzes/${id}/questions`, {
                question_text: "НОВЫЙ ВОПРОС",
                points: 1
            });
            setQuestions([...questions, { ...res.data, options: [] }]);
        } catch (e) {
            alert("Ошибка при добавлении");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteQuestion = async (qId) => {
        if (!window.confirm("Удалить этот вопрос?")) return;
        try {
            await api.delete(`/admin/questions/${qId}`);
            setQuestions(questions.filter(q => q.id !== qId));
        } catch (e) {
            alert("Ошибка при удалении");
        }
    };

    if (loading) return <div className="p-10 text-center uppercase font-black text-slate-400">Загрузка...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 text-left">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-900 transition-colors">
                <ArrowLeft size={20} /> 
                <span className="text-[10px] font-bold uppercase tracking-widest">Назад к курсу</span>
            </button>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                {/* РЕДАКТИРОВАНИЕ ЗАГОЛОВКА ТЕСТА */}
                <div className="mb-8">
                    <input 
                        className="text-2xl font-black text-slate-900 uppercase tracking-tighter w-full outline-none border-b-2 border-transparent focus:border-blue-600 pb-2 transition-all"
                        value={quiz?.title || ''}
                        onChange={(e) => updateQuizTitle(e.target.value)}
                        placeholder="НАЗВАНИЕ ТЕСТА"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                        <Save size={12} /> Изменения сохраняются автоматически
                    </p>
                </div>

                {/* СПИСОК ВОПРОСОВ */}
                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="w-8 h-8 bg-slate-900 text-white text-[10px] flex items-center justify-center rounded-xl font-bold">
                                        {index + 1}
                                    </span>
                                    <input 
                                        className="bg-transparent font-bold text-slate-800 uppercase text-sm outline-none border-b border-transparent focus:border-blue-500 pb-1 w-full transition-all"
                                        value={q.question_text}
                                        onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                        placeholder="ВВЕДИТЕ ТЕКСТ ВОПРОСА..."
                                    />
                                </div>
                                <button 
                                    onClick={() => deleteQuestion(q.id)}
                                    className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            {/* ЗАГЛУШКА ДЛЯ ВАРИАНТОВ */}
                            <div className="ml-12 p-4 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={12} /> Добавить варианты ответов
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    disabled={isSaving}
                    onClick={addQuestion}
                    className="mt-8 w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Добавить новый вопрос
                </button>
            </div>
        </div>
    );
};

export default QuizEditor;