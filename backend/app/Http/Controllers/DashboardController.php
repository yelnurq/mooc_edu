<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\QuizResult;

class DashboardController extends Controller
{
public function getStudentStats()
{
    $user = \App\Models\User::with(['faculty', 'department'])->find(Auth::id());
    
    // 1. Загружаем курсы пользователя
    $userCourses = $user->courses()->get();
    $userCourseIds = $userCourses->pluck('id');
    
    $totalCourses = $userCourses->count();
    $completedCoursesCount = $userCourses->where('pivot.progress', 100)->count();
    
    $avgProgress = $totalCourses > 0 
        ? round($userCourses->avg('pivot.progress'), 1) 
        : 0;

    // 2. Активные курсы
    $activeCourses = $userCourses->where('pivot.progress', '<', 100)
        ->sortByDesc('pivot.updated_at')
        ->take(5)
        ->values()
        ->map(function($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'progress' => $course->pivot->progress,
                'instructor' => $course->author_display_name
            ];
        });

    
$totalLessons = \App\Models\Lesson::whereHas('module', function ($query) use ($userCourseIds) {
    $query->whereIn('course_id', $userCourseIds);
})->count();

// 2. Считаем, сколько из этих уроков пользователь реально завершил
// (есть запись в таблице lesson_user)
$completedLessons = \DB::table('lesson_user')
    ->where('user_id', $user->id)
    ->whereIn('lesson_id', function($query) use ($userCourseIds) {
        $query->select('id')
            ->from('lessons')
            ->whereIn('module_id', function($q) use ($userCourseIds) {
                $q->select('id')->from('modules')->whereIn('course_id', $userCourseIds);
            });
    })
    ->count();

    // --- ПОСЛЕДНИЕ ТЕСТЫ ---
    $recentTests = \App\Models\QuizResult::where('user_id', $user->id)
        ->with(['quiz.quizable'])
        ->latest()
        ->take(3)
        ->get()
        ->map(function ($result) {
            $quiz = $result->quiz;
            $parent = $quiz->quizable;
            
            $courseTitle = 'Общий';
            $moduleTitle = 'Тест';

            if ($parent instanceof \App\Models\Course) {
                $courseTitle = $parent->title;
                $moduleTitle = 'Экзамен курса';
            } elseif ($parent instanceof \App\Models\Module) {
                $moduleTitle = $parent->title;
                $courseTitle = $parent->course->title ?? 'Курс';
            }

            return [
                'id' => $result->id,
                'name' => $quiz->title,
                'course' => $courseTitle,
                'module' => $moduleTitle,
                'score' => $result->score,
                'date' => $result->created_at->diffForHumans(),
                'color' => $result->score >= 80 ? 'text-emerald-600' : 'text-blue-600'
            ];
        });
$totalQuizzes = \App\Models\Quiz::where(function($query) use ($userCourseIds) {
    // Тесты модулей
    $query->where(function($q) use ($userCourseIds) {
        $q->where('quizable_type', \App\Models\Module::class)
          ->whereIn('quizable_id', function($sub) use ($userCourseIds) {
              $sub->select('id')->from('modules')->whereIn('course_id', $userCourseIds);
          });
    })
    // И финальные тесты самих курсов
    ->orWhere(function($q) use ($userCourseIds) {
        $q->where('quizable_type', \App\Models\Course::class)
          ->whereIn('quizable_id', $userCourseIds);
    });
})->count();

// 2. Считаем успешно сданные тесты (score >= 50)
$completedQuizzes = \App\Models\QuizResult::where('user_id', $user->id)
    ->where('score', '>=', 50)
    ->distinct('quiz_id')
    ->count();
    return response()->json([
        'user' => [
            'name' => $user->name,
            'role' => $user->role,
            'faculty' => $user->faculty->title ?? 'Не указан',
            'department' => $user->department->title ?? 'Не указана',
            'specialization' => $user->specialization ?? 'Студент', // проверь если есть поле
        ],
        'stats' => [
            'total' => $totalCourses,
            'completed' => $completedCoursesCount,
            'avg_progress' => $avgProgress,
            'certificates_count' => $completedCoursesCount,
            'total_lessons' => $totalLessons,
    'completed_lessons' => $completedLessons,
    'total_quizzes' => $totalQuizzes,
    'completed_quizzes' => $completedQuizzes,
            'hours' => $user->learning_hours ?? 0, // если ведешь учет времени
        ],
        'active_courses' => $activeCourses,
        'recent_tests' => $recentTests,
    ]);
}
}