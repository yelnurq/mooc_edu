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
// 2. Активные курсы
$activeCourses = $userCourses
    // Фильтруем коллекцию через callback, чтобы залезть в pivot
    ->filter(function($course) {
        return $course->pivot->status === 'approved' && $course->pivot->progress < 100;
    })
    // Сортируем по дате обновления в pivot таблице
    ->sortByDesc('pivot.updated_at')
    ->take(5)
    ->values()
    ->map(function($course) {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'category' => $course->category, 
            'progress' => $course->pivot->progress,
            'instructor' => $course->author_display_name,
            'status' => $course->pivot->status // Берем статус из pivot
        ];
    });
$totalLessons = \App\Models\Lesson::whereHas('module', function ($query) use ($userCourseIds) {
    $query->whereIn('course_id', $userCourseIds);
})->count();

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
$completedCourses = $userCourses->where('pivot.progress', 100)
    ->sortByDesc('pivot.updated_at')
    ->values()
    ->map(function($course) {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'instructor' => $course->author_display_name,
            // Добавляем проверку на null перед форматированием
            'completed_at' => $course->pivot->updated_at 
                ? $course->pivot->updated_at->format('d.m.Y') 
                : 'Не указано'
        ];
    });
// 2. Считаем успешно сданные тесты (score >= 50)
$completedQuizzes = \App\Models\QuizResult::where('user_id', $user->id)
    ->where('score', '>=', 50)
    ->distinct('quiz_id')
    ->count();
$approvedCourseIds = $user->courses()
    ->wherePivot('status', 'approved')
    ->pluck('courses.id'); // Явно указываем таблицу, чтобы не было конфликтов имен
   
    $totalModules = \App\Models\Module::whereIn('course_id', $approvedCourseIds)->count();
    
    return response()->json([
        'user' => [
            'name' => $user->name,
            'role' => $user->role,
            'faculty' => $user->faculty->title ?? 'Не указан',
            'department' => $user->department->title ?? 'Не указана',
            'specialization' => $user->specialization ?? 'Студент',
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
            'total_modules' => $totalModules,
            'hours' => $user->learning_hours ?? 0,
        ],
        'active_courses' => $activeCourses,
        'recent_tests' => $recentTests,
        'completed_courses_list' => $completedCourses, 
    ]);
}
}