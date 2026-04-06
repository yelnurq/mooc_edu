<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // Получить курс со всеми модулями и уроками (Дерево)
    public function show($id)
    {
        $course = Course::with('modules.lessons')->find($id);
        
        if (!$course) return response()->json(['message' => 'Не найден'], 404);
        return response()->json($course);
    }

    // Создать курс
    public function store(Request $request)
    {
        $v = $request->validate(['title' => 'required', 'description' => 'nullable']);
        return response()->json(Course::create($v), 201);
    }

    // Добавить модуль в курс
    public function addModule(Request $request, $courseId)
    {
        $v = $request->validate(['title' => 'required', 'order' => 'integer']);
        $course = Course::findOrFail($courseId);
        return response()->json($course->modules()->create($v), 201);
    }

    // Добавить урок (загрузка PDF или ссылка на видео)
    public function addLesson(Request $request, $moduleId)
    {
        $request->validate([
            'title' => 'required|string',
            'type'  => 'required|in:pdf,video',
            'file'  => 'required_if:type,pdf|file|mimes:pdf|max:20480', // PDF до 20Мб
            'video_url' => 'required_if:type,video|nullable|url',
        ]);

        $module = Module::findOrFail($moduleId);
        $data = $request->only(['title', 'type', 'video_url', 'order']);

        if ($request->hasFile('file') && $request->type === 'pdf') {
            // Сохраняем файл в storage/app/public/lessons
            $data['file_path'] = $request->file('file')->store('lessons', 'public');
        }

        $lesson = $module->lessons()->create($data);
        return response()->json($lesson, 201);
    }
}