<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        // Определяем порядковый номер (последний + 1)
        $maxOrder = $course->modules()->max('order') ?? 0;

        $module = $course->modules()->create([
            'title' => $validated['title'],
            'order' => $maxOrder + 1,
        ]);

        return response()->json($module, 201);
    }
}