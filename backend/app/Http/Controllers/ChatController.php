<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use OpenAI;

class ChatController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'course_id' => 'nullable|integer',
        ]);

        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'API Key not found'], 500);
        }

        $client = OpenAI::client($apiKey);
        $userMessage = $request->input('content');
        $courseId = $request->input('course_id');

    // 1. Системный контекст (Полная база знаний MOOC КазУТБ)
$systemContext = "
    РОЛЬ: Ты — официальный AI-помощник MOOC-платформы Казахского университета технологии и бизнеса (КазУТБ) имени К. Кулажанова.
    
    ПРОЦЕСС ОБУЧЕНИЯ (БИЗНЕС-ЛОГИКА):
    1. РЕГИСТРАЦИЯ: Студент выбирает курс и отправляет заявку.
    2. МОДЕРАЦИЯ: Заявку последовательно одобряют Деканат и Учебный отдел. Только после этого открывается доступ.
    3. СТРУКТУРА: Курсы состоят из Модулей. В каждом модуле есть Лекции и один итоговый Тест.
    4. ФИНАЛ: После прохождения всех модулей сдается Экзамен.
    5. СЕРТИФИКАЦИЯ: При успешной сдаче генерируется сертификат, который сохраняется в профиле.
    6. ВЕРИФИКАЦИЯ: На сайте есть отдельный сервис для проверки подлинности сертификатов.

    ФУНКЦИОНАЛ ПЛАТФОРМЫ:
    - Раздел 'Мои курсы': Здесь хранятся все активные и завершенные дисциплины.
    - Форум: Площадка для обсуждения материалов курса с другими студентами и преподавателями.
    - Личный кабинет: Хранилище полученных сертификатов.

    БАЗА ЗНАНИЙ (FAQ):
    - 'Почему курс не открывается?': Проверьте статус заявки. Она должна быть одобрена Деканатом и Учебным отделом.
    - 'Где найти тест?': Тест доступен в конце каждого модуля после изучения всех лекций этого модуля.
    - 'Как получить сертификат?': Нужно успешно сдать финальный экзамен после прохождения всех модулей.
    - 'Как проверить сертификат?': Воспользуйтесь специальным сервисом проверки на главной странице сайта, введя уникальный код сертификата.
    - 'Где задать вопрос преподавателю?': Вы можете написать в соответствующую ветку на Форуме курса.

    ПРАВИЛА ОТВЕТОВ:
    - Будь вежливым академическим ассистентом.
    - Стиль: Официальный, помогающий.
    - Если студент спрашивает про конкретный курс, делай упор на то, что нужно пройти все тесты модулей, чтобы быть допущенным к экзамену.
";

        // 2. Добавляем информацию о выбранном курсе, если он есть
        if ($courseId) {
            $course = $request->user()->courses()->where('courses.id', $courseId)->first();
            if ($course) {
                $systemContext .= "\nТЕКУЩИЙ КОНТЕКСТ: Студент спрашивает в рамках курса '{$course->title}'.";
            }
        }

        // 3. Работа с историей через сессию (как в твоем примере)
        $messages = Session::get('chat_history', [
            ['role' => 'system', 'content' => $systemContext]
        ]);

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        try {
            // 4. Запрос к OpenAI (используем gpt-4o-mini, так как он быстрее и дешевле)
            $response = $client->chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
                'temperature' => 0.7,
            ]);

            $answer = $response->choices[0]->message->content;

            // 5. Обновляем историю
            $messages[] = ['role' => 'assistant', 'content' => $answer];

            // Ограничиваем историю (последние 10 сообщений + системный промпт)
            if (count($messages) > 12) {
                $messages = array_merge([$messages[0]], array_slice($messages, -10));
            }

            Session::put('chat_history', $messages);

            return response()->json([
                'reply' => $answer
            ]);

        } catch (\Exception $e) {
            Log::error('OpenAI Error: ' . $e->getMessage());
            return response()->json(['error' => 'Ошибка AI: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Получение курсов для сайдбара
     */
    public function getStudentCourses(Request $request)
    {
        $courses = $request->user()->courses()
            ->where('course_user.status', 'approved')
            ->select('courses.id', 'courses.title', 'courses.description')
            ->get();

        return response()->json($courses);
    }

    /**
     * Очистка чата
     */
    public function clearHistory()
    {
        Session::forget('chat_history');
        return response()->json(['status' => 'cleared']);
    }
}