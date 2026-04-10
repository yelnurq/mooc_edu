<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\QuizResult;

class DashboardController extends Controller
{
    public function getStudentStats()
    {
        $user = Auth::user();

        // 1. Загружаем курсы пользователя с данными из pivot таблицы (course_user)
        $userCourses = $user->courses()->get();
        
        $totalCourses = $userCourses->count();
        $completedCoursesCount = $userCourses->where('pivot.progress', 100)->count();
        
        // Средний прогресс по всем курсам
        $avgProgress = $totalCourses > 0 
            ? round($userCourses->avg('pivot.progress'), 1) 
            : 0;

        // 2. Активные курсы (где прогресс меньше 100%)
        $activeCourses = $userCourses->where('pivot.progress', '<', 100)
            ->sortByDesc('pivot.updated_at')
            ->take(5)
            ->values()
            ->map(function($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'progress' => $course->pivot->progress,
                    'instructor' => $course->author_display_name // Используем твой appends атрибут
                ];
            });

        // 3. Последние тесты (из QuizResult)
        $recentTests = QuizResult::where('user_id', $user->id)
            ->with('quiz:id,title') // Связь с моделью Quiz
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($result) {
                return [
                    'id' => $result->id,
                    'name' => $result->quiz->title ?? 'Тест удален',
                    'score' => $result->score, 
                    'date' => $result->created_at->diffForHumans(),
                    'color' => $result->score >= 80 ? 'text-emerald-600' : 'text-blue-600'
                ];
            });

        return response()->json([
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'stats' => [
                'total' => $totalCourses,
                'completed' => $completedCoursesCount,
                'avg_progress' => $avgProgress,
                'certificates_count' => $completedCoursesCount // Пока считаем по закрытым курсам
            ],
            'active_courses' => $activeCourses,
            'recent_tests' => $recentTests
        ]);
    }
}