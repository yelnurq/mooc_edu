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
// 2. Последние дисциплины (Активные + Недавно завершенные)
$latestDisciplines = $userCourses
    ->filter(function($course) {
        // Берем только одобренные курсы
        return $course->pivot->status === 'approved';
    })
    ->sortByDesc('pivot.updated_at') // Самые свежие действия сверху
    ->take(4) // Берем топ-4 для сетки
    ->values()
    ->map(function($course) {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'progress' => (int)$course->pivot->progress,
            'instructor' => $course->author_display_name,
            'completed_at' => $course->pivot->progress == 100 && $course->pivot->updated_at 
                ? $course->pivot->updated_at->format('d.m.Y') 
                : null
        ];
    });

// В return response()->json[...] замените 'active_courses' на:
// 'active_courses' => $latestDisciplines,
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
    ->whereHas('quiz', function($query) {
        // Фильтруем только тесты, привязанные к модулям
        $query->where('quizable_type', \App\Models\Module::class);
    })
    ->with(['quiz.quizable.course']) // Загружаем цепочку: Тест -> Модуль -> Курс
    ->latest()
    ->take(3)
    ->get()
    ->map(function ($result) {
        $quiz = $result->quiz;
        $module = $quiz->quizable; // Это точно будет Module благодаря фильтру выше

        return [
            'id' => $result->id,
            'name' => $quiz->title,
            'course' => $module->course->title ?? 'Курс',
            'module' => $module->title,
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
    // --- ГЕНЕРАЦИЯ ГРАФИКА АКТИВНОСТИ (7 ДНЕЙ) ---
$chartData = [];
for ($i = 6; $i >= 0; $i--) {
    $date = \Carbon\Carbon::now()->subDays($i);
    $dateString = $date->toDateString(); // YYYY-MM-DD
    $dayName = $date->locale('ru')->minDayName; // Пн, Вт...

    // Считаем пройденные лекции за этот день
    $lessonsCount = \DB::table('lesson_user')
        ->where('user_id', $user->id)
        ->whereDate('created_at', $dateString)
        ->count();

    // Считаем пройденные тесты за этот день
    $quizzesCount = \App\Models\QuizResult::where('user_id', $user->id)
        ->whereDate('created_at', $dateString)
        ->count();

    $chartData[] = [
        'day' => $dayName,
        'fullDate' => $date->format('d.m'),
        'lessons' => $lessonsCount,
        'quizzes' => $quizzesCount,
    ];
}
$exams = \App\Models\QuizResult::where('user_id', $user->id)
    ->whereHas('quiz', function($query) {
        $query->where('quizable_type', \App\Models\Course::class);
    })
    ->with(['quiz.quizable'])
    ->latest()
    ->get()
    ->map(function ($result) {
        return [
            'id' => $result->id,
            'quiz_title' => $result->quiz->title,
            'course_title' => $result->quiz->quizable->title ?? 'Курс',
            'score' => $result->score,
            'correct' => $result->correct_answers,
            'total' => $result->total_questions,
            'date' => $result->created_at->format('d.m.Y'),
            'passed' => $result->passed
        ];
    });

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
        'active_courses' => $latestDisciplines,
        'recent_tests' => $recentTests,
        'chart_data' => $chartData,
        'exams' => $exams,
        'completed_courses_list' => $completedCourses, 
    ]);
}
}