<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenAI;
use App\Models\Course;

class ChatController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'course_id' => 'nullable|exists:courses,id',
        ]);

        $user = $request->user();
        $client = OpenAI::client(env('OPENAI_API_KEY'));

        $userMessage = $request->input('content');
        $courseId = $request->input('course_id');

        // Базовый системный промпт
        $systemPrompt = "Ты — AI-ментор в личном кабинете студента. " .
                        "Отвечай четко, структурированно, используя Markdown. " .
                        "Если вопрос касается кода, пиши его чисто и с комментариями.";

        // Если выбран курс, вытягиваем его данные для контекста
        if ($courseId) {
            // Проверяем, что студент реально записан на этот курс
            $course = $user->courses()
                ->where('course_id', $courseId)
                ->where('course_user.status', 'approved')
                ->first();

            if ($course) {
                $systemPrompt .= "\n\nКОНТЕКСТ ДИСЦИПЛИНЫ: " .
                                 "Студент задает вопрос в рамках курса '{$course->name}'. " .
                                 "Описание курса: {$course->description}. " .
                                 "Текущий прогресс студента: {$course->pivot->progress}%. " .
                                 "Отвечай, исходя из специфики этой дисциплины.";
            }
        }

        try {
            $response = $client->chat()->create([
                'model' => 'gpt-4-turbo-preview',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage],
                ],
                'temperature' => 0.7,
            ]);

            return response()->json([
                'reply' => $response->choices[0]->message->content
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка AI'], 500);
        }
    }

    /**
     * Метод для получения списка курсов студента (для фронтенда)
     */
    public function getStudentCourses(Request $request)
    {
        // Берем только одобренные курсы
        $courses = $request->user()->courses()
            ->where('course_user.status', 'approved')
            ->select('courses.id', 'courses.name', 'courses.description')
            ->get();

        return response()->json($courses);
    }
}