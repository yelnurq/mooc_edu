<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseResource; // Не забудь импортировать модель
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseResourceController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf',
            'video_url' => 'nullable|string|url',
            'file' => 'nullable|file|mimes:pdf,doc,docx,zip|max:20480',
            'is_promo' => 'nullable|boolean', // Валидация нашей галочки
        ]);

        // Используем транзакцию, чтобы данные оставались согласованными
        $resource = DB::transaction(function () use ($request, $course, $validated) {
            
            // Если этот ресурс помечен как промо, сбрасываем флаг у всех остальных ресурсов этого курса
            if ($request->boolean('is_promo')) {
                $course->resources()->update(['is_promo' => false]);
            }

            $resourceData = [
                'title' => $validated['title'],
                'type' => $validated['type'],
                'is_promo' => $request->boolean('is_promo'),
                'video_url' => $validated['type'] === 'video' ? $request->video_url : null,
            ];

            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('course_resources', 'public');
                $resourceData['file_path'] = $path;
            }

            return $course->resources()->create($resourceData);
        });

        return response()->json($resource, 201);
    }
}