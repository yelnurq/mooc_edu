<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
class CourseController extends Controller
{


/**
 * Получить курсы текущего студента (для Dashboard)
 */


/**
 * Метод для АДМИНА: связать студента с курсом
 */
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
    $user = Auth::user();
    $courses = $user->courses()->withCount(['modules as lessons_count' => function($query) {
        $query->join('lessons', 'modules.id', '=', 'lessons.module_id');
    }])->get();

    return response()->json($courses);
}

/**
 * Обновленный метод show с проверкой доступа
 */
public function show($id)
{
    $user = Auth::user();
    
    // Загружаем курс
    $course = Course::with(['modules.lessons', 'resources'])->find($id);
    if (!$course) return response()->json(['message' => 'Курс не найден'], 404);

    // Проверяем, записан ли текущий юзер
    $isEnrolled = false;
    if ($user) {
        $isEnrolled = $user->courses()->where('course_id', $id)->exists();
    }

    // Обработка путей для ресурсов
    $course->resources->transform(function ($resource) {
        if ($resource->type === 'pdf') {
            $resource->file_url = asset('storage/' . $resource->file_path);
        }
        return $resource;
    });

    // Обработка путей для уроков внутри модулей
    $course->modules->each(function ($module) use ($isEnrolled) {
        $module->lessons->transform(function ($lesson) use ($isEnrolled) {
            if ($lesson->type === 'pdf' && $lesson->file_path) {
                $lesson->file_url = asset('storage/' . $lesson->file_path);
            }
            
            // Если юзер НЕ записан, можно скрыть чувствительные данные (например, прямые ссылки)
            if (!$isEnrolled) {
                $lesson->video_url = null; 
                $lesson->file_url = null;
            }
            return $lesson;
        });
    });

    // Добавляем флаг доступа в ответ
    $course->is_enrolled = $isEnrolled;

    return response()->json($course);
}

// Новый метод для добавления общего ресурса
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
            $courses = Course::with(['modules.lessons'])
                ->orderBy('created_at', 'desc')
                ->get();

            $courses->transform(function ($course) {
                // Считаем уроки
                $course->lessons_count = $course->modules->sum(function ($module) {
                    return $module->lessons->count();
                });

                // Генерируем URL для силлабуса, если он есть
                if ($course->syllabus_path) {
                    $course->syllabus_url = asset('storage/' . $course->syllabus_path);
                }

                return $course;
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