<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseResourceController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf',
            'video_url' => 'nullable|string|url',
            'file' => 'nullable|file|mimes:pdf,doc,docx,zip|max:20480', // до 20МБ
        ]);

        $resourceData = [
            'title' => $validated['title'],
            'type' => $validated['type'],
        ];

        if ($validated['type'] === 'video') {
            $resourceData['video_url'] = $request->video_url;
        }

        if ($request->hasFile('file')) {
            // Сохраняем файл в папку course_resources
            $path = $request->file('file')->store('course_resources', 'public');
            $resourceData['file_path'] = $path;
        }

        $resource = $course->resources()->create($resourceData);

        return response()->json($resource, 201);
    }
}
