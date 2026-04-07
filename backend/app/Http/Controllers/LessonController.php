<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function store(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf',
            'video_url' => 'nullable|string|url',
            'file' => 'nullable|file|mimes:pdf|max:10240', // до 10МБ для PDF
        ]);

        $maxOrder = $module->lessons()->max('order') ?? 0;

        $lessonData = [
            'title' => $validated['title'],
            'type' => $validated['type'],
            'order' => $maxOrder + 1,
        ];

        // Логика обработки видео
        if ($validated['type'] === 'video') {
            $lessonData['video_url'] = $request->video_url;
        }

        // Логика загрузки PDF (если передали файл)
        if ($validated['type'] === 'pdf' && $request->hasFile('file')) {
            $path = $request->file('file')->store('lessons/files', 'public');
            $lessonData['file_path'] = $path;
        }

        $lesson = $module->lessons()->create($lessonData);

        return response()->json($lesson, 201);
    }
}
