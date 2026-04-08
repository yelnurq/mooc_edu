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
use Illuminate\Support\Facades\Validator;
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
public function getStructure(Course $course)
{
    $structure = $course->load([
        'resources', // Загружаем ресурсы курса
        'modules' => function($query) {
            $query->with(['lessons' => function($q) {
                $q->orderBy('order', 'asc');
            }])->orderBy('order', 'asc');
        }
    ]);

    return response()->json([
        'status' => 'success',
        'course' => [
            'id' => $course->id,
            'title' => $course->title,
            'image' => $course->image,
            'description' => $course->description,
            'author' => $course->getAuthorDisplayNameAttribute(),
        ],
        'resources' => $structure->resources, // Передаем ресурсы
        'modules' => $structure->modules
    ]);
}
public function getEnrollmentData()
{
    try {
        // 1. Проверяем существование таблицы пивота
        if (!\Schema::hasTable('course_user')) {
            return response()->json([
                'status' => 'success',
                'enrollments' => [],
                'stats' => $this->calculateFallbackStats()
            ]);
        }

        // 2. Получаем данные (убираем created_at, если не уверены, что он есть)
        $enrollments = \DB::table('course_user')
            ->join('users', 'course_user.user_id', '=', 'users.id')
            ->join('courses', 'course_user.course_id', '=', 'courses.id')
            ->select(
                'users.id as user_id', 
                'users.name as user_name', 
                'courses.id as course_id', 
                'courses.title as course_title'
            )
            ->get();

        // 3. Считаем статистику через модели
        $totalUsers = \App\Models\User::count();
        $totalCourses = \App\Models\Course::count();
        $activeCount = $enrollments->count();
        
        // Безопасный подсчет "ожидающих" (те, у кого нет курсов)
        $usersWithNoCourses = 0;
        if (method_exists(\App\Models\User::class, 'courses')) {
            $usersWithNoCourses = \App\Models\User::whereDoesntHave('courses')->count();
        }

        return response()->json([
            'status' => 'success',
            'enrollments' => $enrollments,
            'stats' => [
                'total' => $totalUsers,
                'active' => $activeCount,
                'waiting' => $usersWithNoCourses,
                'programs' => $totalCourses,
            ]
        ], 200);

    } catch (\Exception $e) {
        // Если упало — возвращаем ошибку в JSON, чтобы CORS пропустил ответ
        return response()->json([
            'status' => 'error',
            'message' => 'PHP Error: ' . $e->getMessage(),
            'line' => $e->getLine()
        ], 500);
    }
}

// Вспомогательный метод для пустых статов
private function calculateFallbackStats() {
    return [
        'total' => \App\Models\User::count(),
        'active' => 0,
        'waiting' => \App\Models\User::count(),
        'programs' => \App\Models\Course::count(),
    ];
}
public function myCourses()
{
    $user = auth()->user();

    $courses = $user->courses()
        ->with([
            'category', // Загружаем связанную модель категории
            'modules' => function($query) {
                $query->select('id', 'course_id')->withCount('lessons');
            }
        ])
        ->get()
        ->map(function ($course) {
            $totalLessons = $course->modules->sum('lessons_count');
            
            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'image' => $course->image ? asset('storage/' . $course->image) : null,
                'lessons_count' => $totalLessons,
                'modules_count' => $course->modules->count(),
                'status' => $course->pivot->status ?? 'pending',
                // БЕРЕМ ИЗ БД: если есть связь category, берем name, иначе дефолт
                'category' => $course->category->name ?? 'Общее', 
                'pivot' => [
                    'progress' => $course->pivot->progress ?? 0,
                    'last_accessed' => $course->pivot->updated_at,
                ],
            ];
        });

    return response()->json($courses);
}
/**
 * Обновленный метод show с проверкой доступа
 */
public function enroll(Request $request, $courseId)
{
    // 1. Находим курс или выдаем 404
    $course = Course::findOrFail($courseId);
    $user = $this->getAuthenticatedUser($request);

    // 2. Проверяем, нет ли уже записи (любой: и ожидания, и одобренной)
    $existingEnrollment = $user->courses()->where('course_id', $courseId)->first();

    if ($existingEnrollment) {
        // Если запись уже есть, проверяем её статус для более точного ответа
        $status = $existingEnrollment->pivot->status;
        
        if ($status === 'pending') {
            return response()->json(['message' => 'Ваша заявка уже находится на рассмотрении'], 400);
        }
        
        return response()->json(['message' => 'Вы уже зачислены на этот курс'], 400);
    }

    // 3. Привязываем пользователя со статусом 'pending'
    $user->courses()->attach($courseId, [
        'status' => 'pending',
        'progress' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return response()->json([
        'message' => "Заявка на курс «{$course->title}» успешно отправлена. Ожидайте подтверждения модератором.",
        'status' => 'pending'
    ], 201);
}
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
    $user = $this->getAuthenticatedUser($request);
    $course = \App\Models\Course::with(['modules.lessons', 'resources'])->find($id);

    if (!$course) {
        return response()->json(['message' => 'Курс не найден'], 404);
    }

    // --- ОБНОВЛЕННАЯ ЛОГИКА ПРОВЕРКИ СТАТУСА ---
    $enrollment = null;
    if ($user) {
        // Получаем запись из связующей таблицы
        $enrollment = \Illuminate\Support\Facades\DB::table('course_user')
            ->where('user_id', $user->id)
            ->where('course_id', $id)
            ->first();
    }

    // Определяем статус для фронтенда
    $enrollmentStatus = $enrollment ? $enrollment->status : null; // 'pending', 'approved', etc.
    $isApproved = ($enrollmentStatus === 'approved');

    // 4. РЕСУРСЫ (без изменений)
    $course->resources->transform(function ($resource) {
        if ($resource->file_path) {
            $resource->file_url = asset('storage/' . $resource->file_path);
        }
        return $resource;
    });

    // 5. УРОКИ — используем $isApproved вместо $isEnrolled
    $course->modules->each(function ($module) use ($isApproved) {
        $module->lessons->transform(function ($lesson) use ($isApproved) {
            if (!$isApproved) {
                $lesson->makeHidden(['file_path', 'video_url', 'content']);
                $lesson->file_url = null;
                $lesson->is_locked = true; 
            } else {
                if ($lesson->type === 'pdf' && $lesson->file_path) {
                    $lesson->file_url = asset('storage/' . $lesson->file_path);
                }
                $lesson->is_locked = false;
            }
            return $lesson;
        });
    });

    // 6. Добавляем статус в ответ
    $course->user_status = $enrollmentStatus; // Передаем 'pending' или 'approved'
    $course->is_enrolled = (bool)$enrollment;
    
    // ... остальная логика прогресса ...
    
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

public function index(Request $request)
{
    try {
        $query = Course::with(['category', 'modules.lessons'])
            ->withCount(['modules', 'lessons']);

        // --- ФИЛЬТРАЦИЯ ---

        // Поиск по названию
        $query->when($request->search, function ($q, $search) {
            $q->where('title', 'like', "%{$search}%");
        });

        // Фильтр по категории (по имени категории)
        $query->when($request->category, function ($q, $categoryName) {
            $q->whereHas('category', function ($q) use ($categoryName) {
                $q->where('name', $categoryName);
            });
        });

        // --- СОРТИРОВКА ---
        
        switch ($request->sort) {
            case 'new':
                $query->latest();
                break;
            case 'duration':
                // Если есть колонка с длительностью
                $query->orderBy('duration', 'desc'); 
                break;
            case 'popular':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $courses = $query->get();

        // Дополнительная обработка данных (URL и ручной подсчет уроков)
        $courses->each(function ($course) {
            // Ручной подсчет, если связь lessons не прямая
            if (!$course->lessons_count) {
                $course->lessons_count = $course->modules->pluck('lessons')->flatten()->count();
            }

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
public function indexCourses(Request $request)
{
    try {
        // 1. Формируем основной запрос с подсчетом связанных записей
        $query = Course::with(['category', 'user']) // 'user' - если это автор курса
            ->withCount([
                'modules', // Добавит поле modules_count
                'lessons', // Добавит поле lessons_count (если связь Lesson прописана напрямую в Course)
                'users as students_count' // Добавит поле students_count из таблицы course_user
            ]);

        // 2. Фильтрация (Поиск)
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // 3. Пагинация
        $courses = $query->latest()->paginate(10);

        // 4. Общая статистика для всего раздела (Top Cards)
        $globalStats = [
            'total' => Course::count(),
            'active' => Course::count(), 
            'total_students' => \DB::table('course_user')->distinct('user_id')->count(),
            'total_lessons' => \App\Models\Lesson::count(), // Если есть такая модель
        ];

        // 5. Формируем ответ, добавляя данные об авторе и структуре в каждый курс
        $formattedData = collect($courses->items())->map(function ($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'category' => $course->category->name ?? 'Без категории',
                'author' => $course->getAuthorDisplayNameAttribute() ?? 'Администратор', // Автор курса
                'modules_count' => $course->modules_count,
                'lessons_count' => $course->lessons_count,
                'students_count' => $course->students_count,
                'created_at' => $course->created_at->format('d.m.Y'),
                // Можно добавить статус или цену, если они есть в БД
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedData,
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'total' => $courses->total(),
            ],
            'stats' => $globalStats
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}

public function store(Request $request)
{
    // 1. Предварительная очистка: превращаем пустые строки в реальный null
    // Это важно для работы правил 'exists' и 'required_if'
    $data = $request->all();
    foreach ($data as $key => $value) {
        if ($value === 'null' || $value === '') {
            $data[$key] = null;
        }
    }

    $validated = Validator::make($data, [
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'category_id' => 'nullable|exists:categories,id',
        'author_type' => 'required|in:user,custom',
        'author_id' => 'required_if:author_type,user|nullable|exists:users,id',
        'custom_author_name' => 'required_if:author_type,custom|nullable|string|max:255',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ])->validate();

    // 2. Обработка изображения
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('courses', 'public');
        $validated['image'] = $path;
    } else {
        $validated['image'] = null;
    }

    // 3. Создание записи
    $course = Course::create([
        'title'              => $validated['title'],
        'description'        => $validated['description'],
        'category_id'        => $validated['category_id'],
        'author_id'          => $validated['author_type'] === 'user' ? $validated['author_id'] : null,
        'custom_author_name' => $validated['author_type'] === 'custom' ? $validated['custom_author_name'] : null,
        'author_type'        => $validated['author_type'],
        'image'              => $validated['image'],
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Курс успешно создан',
        'data' => $course
    ], 201);
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