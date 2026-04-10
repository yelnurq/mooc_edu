<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizResult;
use App\Models\Token;
use App\Models\User;
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
public function show($id)
{
    // Загружаем тест вместе с вопросами И их вариантами
    $quiz = Quiz::with(['questions.options'])->findOrFail($id);
    return response()->json($quiz);
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
    private function getAuthenticatedUser(Request $request)
    {
        $bearerToken = $request->bearerToken();
        if (!$bearerToken) return null;

        $tokenRecord = Token::where("token", $bearerToken)->first();
        if (!$tokenRecord) return null;

        return User::find($tokenRecord->user_id);
    }

public function submit(Request $request, Quiz $quiz)
{
    // 1. Валидация
    $validated = $request->validate([
        'answers' => 'required|array',
    ]);

    $userAnswers = $validated['answers'];
    $correctCount = 0;

    // Подгружаем вопросы
    $questions = $quiz->questions()->with('options')->get();

    foreach ($questions as $question) {
        $submittedOptionId = $userAnswers[$question->id] ?? null;
        $correctOption = $question->options->where('is_correct', true)->first();

        if ($submittedOptionId == $correctOption?->id) {
            $correctCount++;
        }
    }

    $total = $questions->count();
    $score = $total > 0 ? round(($correctCount / $total) * 100) : 0;
    
    $passed = $score >= 80;
    $user = $this->getAuthenticatedUser($request);

    // Используем транзакцию, чтобы данные сохранялись корректно
    return \DB::transaction(function () use ($user, $quiz, $score, $correctCount, $total, $passed) {
        
        // Сохраняем результат теста
        $result = \App\Models\QuizResult::updateOrCreate(
            ['user_id' => $user->id, 'quiz_id' => $quiz->id],
            [
                'score' => $score,
                'correct_answers' => $correctCount,
                'total_questions' => $total,
                'passed' => $passed,
            ]
        );

        $certificateCreated = false;

        // Выдаем сертификат только если пройдено (passed) и это тест КУРСА
        if ($passed && $quiz->quizable_type === 'App\Models\Course') {
            $courseId = $quiz->quizable_id;

            // Обновляем прогресс
            $user->courses()->updateExistingPivot($courseId, ['progress' => 100]);

            // Исправлено название модели: Certificate вместо Certificates
            // Убедитесь, что модель называется именно так
            $certificate = \App\Models\Certificate::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'course_id' => $courseId
                ],
                [
                    'certificate_number' => 'CERT-' . strtoupper(bin2hex(random_bytes(4))),
                    'issued_at' => now()
                ]
            );
            
            $certificateCreated = $certificate->wasRecentlyCreated;
        }

        return response()->json([
            'passed' => $passed,
            'score' => $score,
            'correct_count' => $correctCount,
            'total_count' => $total,
            'result_id' => $result->id,
            'certificate_issued' => $certificateCreated
        ]);
    });
}
}