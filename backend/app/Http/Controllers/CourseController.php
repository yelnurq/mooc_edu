<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Token;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
class CourseController extends Controller
{


    private function getAuthenticatedUser(Request $request)
    {
        $bearerToken = $request->bearerToken();
        if (!$bearerToken) return null;

        $tokenRecord = Token::where("token", $bearerToken)->first();
        if (!$tokenRecord) return null;

        return User::find($tokenRecord->user_id);
    }
public function adminEnroll(Request $request)
{
    // Проверка прав админа (предположим, у тебя есть middleware 'admin')
    $request->validate([
        'user_id'   => 'required|exists:users,id',
        'course_id' => 'required|exists:courses,id',
    ]);

    $course = Course::findOrFail($request->course_id);
    $user = User::findOrFail($request->user_id);

    // Проверяем, не записан ли уже
    if ($user->courses()->where('course_id', $request->course_id)->exists()) {
        return response()->json(['message' => 'Студент уже записан на этот курс'], 400);
    }

    // Привязываем
    $user->courses()->attach($request->course_id);

    return response()->json([
        'message' => "Студент {$user->name} успешно зачислен на курс {$course->title}"
    ], 200);
}
public function myCourses()
{
    $user = auth()->user();

    $courses = $user->courses()
        ->with(['modules' => function($query) {
            $query->select('id', 'course_id')->withCount('lessons');
        }])
        ->get()
        ->map(function ($course) {
            // Считаем общее количество уроков во всех модулях
            $totalLessons = $course->modules->sum('lessons_count');
            
            // Имитация прогресса (если у вас нет таблицы lesson_user для трекинга)
            // В реальном проекте здесь должен быть расчет выполненных уроков юзером
            $progress = $course->pivot->progress ?? 0;

            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'image' => $course->image_url ?? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800',
                'lessons_count' => $totalLessons,
                'modules_count' => $course->modules->count(),
                // Данные для прогресс-бара в React
                'pivot' => [
                    'progress' => $progress,
                    'last_accessed' => $course->pivot->updated_at ?? now(),
                ],
                // Дополнительные мета-данные для бейджиков
                'is_premium' => true, 
                'category' => 'Web Development',
            ];
        });

    return response()->json($courses);
}
/**
 * Обновленный метод show с проверкой доступа
 */
public function show(Request $request, $id)
{
    // 1. Получаем юзера через твой кастомный метод
    $user = $this->getAuthenticatedUser($request);
    
    // 2. Если юзер не найден — сразу 401
    if (!$user) {
        return response()->json(['message' => 'Пользователь не авторизован'], 401);
    }

    // 3. Загружаем курс со всеми связями
    $course = \App\Models\Course::with(['modules.lessons', 'resources'])->find($id);
    
    if (!$course) {
        return response()->json(['message' => 'Курс не найден'], 404);
    }

    // 4. ПРОВЕРКА ПОДПИСКИ (теперь $user точно объект)
    $isEnrolled = $user->courses()->where('course_id', $id)->exists();

    if (!$isEnrolled) {
        return response()->json([
            'message' => 'Доступ запрещен. Вы не подписаны на этот курс.',
            'is_enrolled' => false
        ], 403);
    }

    // 5. Если дошли сюда — юзер подписан. Собираем прогресс.
    // Вытягиваем ID всех уроков курса
    $courseLessonIds = $course->modules->flatMap(function($module) {
        return $module->lessons->pluck('id');
    })->toArray();

    // Получаем пройденные уроки именно этого курса для этого юзера
    $completedLessonsIds = \Illuminate\Support\Facades\DB::table('lesson_user')
        ->where('user_id', $user->id)
        ->whereIn('lesson_id', $courseLessonIds)
        ->pluck('lesson_id')
        ->map(fn($id) => (int)$id) // Принудительно в число для React
        ->values()
        ->toArray();

    // 6. Обработка путей (PDF и видео)
    $course->resources->transform(function ($resource) {
        if ($resource->type === 'pdf' && $resource->file_path) {
            $resource->file_url = asset('storage/' . $resource->file_path);
        }
        return $resource;
    });

    $course->modules->each(function ($module) {
        $module->lessons->transform(function ($lesson) {
            if ($lesson->type === 'pdf' && $lesson->file_path) {
                $lesson->file_url = asset('storage/' . $lesson->file_path);
            }
            return $lesson;
        });
    });

    // 7. Добавляем мета-данные в ответ
    $course->is_enrolled = true;
    $course->completed_lessons_ids = $completedLessonsIds;

    return response()->json($course);
}
public function showPublic(Request $request, $id)
{
    // 1. Пытаемся получить юзера (через ваш кастомный метод)
    $user = $this->getAuthenticatedUser($request);

    // 2. Загружаем курс со всеми связями
    $course = \App\Models\Course::with(['modules.lessons', 'resources'])->find($id);

    if (!$course) {
        return response()->json(['message' => 'Курс не найден'], 404);
    }

    // 3. Проверка подписки
    $isEnrolled = $user ? $user->courses()->where('course_id', $id)->exists() : false;

    // 4. РЕСУРСЫ (course_resources) — показываем ВСЕМ
    // Эти файлы доступны даже гостю
    $course->resources->transform(function ($resource) {
        if ($resource->file_path) {
            $resource->file_url = asset('storage/' . $resource->file_path);
        }
        // Если в таблице есть video_url, он тоже пройдет
        return $resource;
    });

    // 5. УРОКИ (lessons) — только названия для неподписанных
    $course->modules->each(function ($module) use ($isEnrolled) {
        $module->lessons->transform(function ($lesson) use ($isEnrolled) {
            if (!$isEnrolled) {
                // ДЛЯ ВСЕХ (Публично): удаляем всё, кроме метаданных
                $lesson->makeHidden(['file_path', 'video_url', 'content']); // Прячем поля модели
                $lesson->file_url = null; // Ссылка не генерируется
                $lesson->is_locked = true; 
            } else {
                // ДЛЯ ПОДПИСАННЫХ: генерируем ссылки
                if ($lesson->type === 'pdf' && $lesson->file_path) {
                    $lesson->file_url = asset('storage/' . $lesson->file_path);
                }
                $lesson->is_locked = false;
            }
            return $lesson;
        });
    });

    // 6. Доп. данные для фронтенда
    $course->is_enrolled = $isEnrolled;
    
    // Прогресс считаем только если есть подписка
    if ($isEnrolled && $user) {
        $courseLessonIds = $course->modules->flatMap(fn($m) => $m->lessons->pluck('id'))->toArray();
        
        $course->completed_lessons_ids = \Illuminate\Support\Facades\DB::table('lesson_user')
            ->where('user_id', $user->id)
            ->whereIn('lesson_id', $courseLessonIds)
            ->pluck('lesson_id')
            ->map(fn($id) => (int)$id)
            ->values();
    } else {
        $course->completed_lessons_ids = [];
    }

    return response()->json($course);
}
// Новый метод для добавления общего ресурса
public function completeLesson($lessonId)
{
    $user = Auth::user();

    // 1. Загружаем урок вместе с модулем, чтобы достать course_id
    $lesson = Lesson::with('module')->find($lessonId);

    if (!$lesson || !$lesson->module) {
        return response()->json(['message' => 'Урок или модуль не найден'], 404);
    }

    $courseId = $lesson->module->course_id;

    // 2. Отмечаем урок как пройденный (таблица lesson_user)
    // Используем syncWithoutDetaching, чтобы не дублировать записи
    $user->completedLessons()->syncWithoutDetaching([$lessonId]);

    // 3. Считаем общий прогресс курса
    // Получаем все ID уроков этого курса
    $allLessonIds = Lesson::whereHas('module', function($query) use ($courseId) {
        $query->where('course_id', $courseId);
    })->pluck('id');

    $totalLessonsCount = $allLessonIds->count();

    // Считаем, сколько из этих уроков прошел юзер
    $completedLessonsCount = $user->completedLessons()
        ->whereIn('lesson_id', $allLessonIds)
        ->count();

    // Вычисляем процент
    $progressPercent = ($totalLessonsCount > 0) 
        ? round(($completedLessonsCount / $totalLessonsCount) * 100) 
        : 0;

    // 4. Обновляем прогресс в сводной таблице course_user
    $user->courses()->updateExistingPivot($courseId, [
        'progress' => $progressPercent
    ]);

    return response()->json([
        'status' => 'success',
        'progress' => $progressPercent,
        'completed_lessons_count' => $completedLessonsCount
    ]);
}

public function addResource(Request $request, $courseId)
{
    $request->validate([
        'title' => 'required|string',
        'type'  => 'required|in:pdf,video',
        'file'  => 'required_if:type,pdf|file|mimes:pdf|max:20480',
        'video_url' => 'required_if:type,video|url',
    ]);

    $course = Course::findOrFail($courseId);
    $data = $request->only(['title', 'type', 'video_url', 'order']);

    if ($request->hasFile('file') && $request->type === 'pdf') {
        $data['file_path'] = $request->file('file')->store('courses/resources', 'public');
    }

    $resource = $course->resources()->create($data);
    return response()->json($resource, 201);
}
    /**
     * Получить список всех курсов
     */
public function index()
{
    try {
        $courses = Course::with(['category','modules.lessons']) // Загружаем категорию и вложенности
            ->withCount([
                'modules', 
                'lessons' 
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Добавляем URL и проверяем подсчет уроков
        $courses->each(function ($course) {
            // Если withCount('lessons') выдает 0 из-за отсутствия прямой связи, 
            // считаем вручную из уже загруженных данных:
            if ($course->lessons_count === 0 || $course->lessons_count === null) {
                $course->lessons_count = $course->modules->pluck('lessons')->flatten()->count();
            }

            // Генерируем URL для силлабуса
            if ($course->syllabus_path) {
                $course->syllabus_url = asset('storage/' . $course->syllabus_path);
            }
        });

        return response()->json($courses, 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Ошибка при получении списка курсов',
            'debug' => $e->getMessage()
        ], 500);
    }
}

    // Создать курс (с поддержкой промо и силлабуса)
    public function store(Request $request)
    {
        $v = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'promo_video_url' => 'nullable|url',
            'syllabus_file' => 'nullable|file|mimes:pdf|max:10240', // PDF до 10Мб
        ]);

        $data = $request->only(['title', 'description', 'promo_video_url']);

        // Загрузка силлабуса (общего PDF курса)
        if ($request->hasFile('syllabus_file')) {
            $data['syllabus_path'] = $request->file('syllabus_file')->store('courses/syllabus', 'public');
        }

        $course = Course::create($data);

        return response()->json($course, 201);
    }

    // Обновить существующий курс (например, добавить промо позже)
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $v = $request->validate([
            'title' => 'sometimes|required',
            'promo_video_url' => 'nullable|url',
            'syllabus_file' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $data = $request->only(['title', 'description', 'promo_video_url']);

        if ($request->hasFile('syllabus_file')) {
            // Удаляем старый файл, если он был
            if ($course->syllabus_path) {
                Storage::disk('public')->delete($course->syllabus_path);
            }
            $data['syllabus_path'] = $request->file('syllabus_file')->store('courses/syllabus', 'public');
        }

        $course->update($data);
        return response()->json($course);
    }

    // Добавить модуль в курс
    public function addModule(Request $request, $courseId)
    {
        $v = $request->validate(['title' => 'required', 'order' => 'integer']);
        $course = Course::findOrFail($courseId);
        return response()->json($course->modules()->create($v), 201);
    }

    // Добавить урок
    public function addLesson(Request $request, $moduleId)
    {
        $request->validate([
            'title' => 'required|string',
            'type'  => 'required|in:pdf,video',
            'file'  => 'required_if:type,pdf|file|mimes:pdf|max:20480',
            'video_url' => 'required_if:type,video|nullable|url',
        ]);

        $module = Module::findOrFail($moduleId);
        $data = $request->only(['title', 'type', 'video_url', 'order']);

        if ($request->hasFile('file') && $request->type === 'pdf') {
            $data['file_path'] = $request->file('file')->store('lessons', 'public');
        }

        $lesson = $module->lessons()->create($data);
        
        // Для ответа сразу формируем URL
        if ($lesson->file_path) {
            $lesson->file_url = asset('storage/' . $lesson->file_path);
        }

        return response()->json($lesson, 201);
    }
}