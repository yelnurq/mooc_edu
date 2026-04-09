<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuizController extends Controller
{
    /**
     * Универсальный метод создания теста
     */
    public function store(Request $request)
    {
        // 1. Валидация входных данных
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            // Указываем, к какому типу привязан тест: 'course' или 'module'
            'quizable_type' => 'required|in:course,module',
            // ID этого курса или модуля
            'quizable_id'   => 'required|integer',
        ]);

        // 2. Определяем родительскую модель
        $modelType = $validated['quizable_type'];
        $modelId = $validated['quizable_id'];

        // Ищем объект (Курс или Модуль)
        $parentModel = $modelType === 'course' 
            ? Course::find($modelId) 
            : Module::find($modelId);

        if (!$parentModel) {
            return response()->json(['message' => 'Родительская сущность не найдена'], 404);
        }

        // 3. Создаем или обновляем тест (так как у нас morphOne, тест обычно один)
        // updateOrCreate гарантирует, что у модуля/курса не будет 10 разных тестов
        $quiz = $parentModel->quiz()->updateOrCreate(
            ['quizable_id' => $modelId, 'quizable_type' => get_class($parentModel)],
            [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Тест успешно привязан к ' . $modelType,
            'data' => $quiz
        ], 201);
    }

    /**
     * Получить тест конкретной сущности
     */
    public function show(Quiz $quiz)
{
    // Загружаем вопросы и саму модель, к которой привязан тест (курс или модуль)
    return response()->json($quiz->load(['questions', 'quizable']));
}
public function update(Request $request, Quiz $quiz)
{
    $quiz->update($request->only('title'));
    return response()->json($quiz);
}
public function structure(Course $course)
{
    // Загружаем курс со всеми вложенными связями
    $course->load([
        'quiz',               // Тест самого курса
        'modules' => function($query) {
            $query->orderBy('order'); // Сортируем модули
        },
        'modules.lessons' => function($query) {
            $query->orderBy('order'); // Сортируем уроки внутри модулей
        },
        'modules.quiz',       // Тесты внутри модулей
        'resources'           // Доп. ресурсы курса
    ]);

    return response()->json([
        'status' => 'success',
        'course' => [
            'id' => $course->id,
            'title' => $course->title,
            'author' => $course->custom_author_name ?? $course->author?->name,
            'quiz' => $course->quiz, // Финальный тест курса
        ],
        'modules' => $course->modules,
        'resources' => $course->resources
    ]);
}
}