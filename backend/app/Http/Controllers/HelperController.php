<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HelperController extends Controller
{
    public function getOptions()
    {
        try {
            return response()->json([
                'faculties' => \App\Models\Faculty::select('id', 'title as name', 'short_name', 'short_title', 'dean')
                    ->orderBy('title')
                    ->get(),
                
                'departments' => \App\Models\Department::select('id', 'title as name', 'short_name', 'faculty_id', 'leader')
                    ->orderBy('title')
                    ->get(),
        
                'categories' => \App\Models\Category::select('id', 'name') // Используем title as name для унификации на фронте
                    ->orderBy('title')
                    ->get(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Внутренняя ошибка сервера'], 500);
        }
    }

public function postOptions(Request $request)
{
    try {
        $type = $request->input('type');
        $models = [
            'categories'  => \App\Models\Category::class,
            'faculties'   => \App\Models\Faculty::class,
            'departments' => \App\Models\Department::class,
        ];

        if (!isset($models[$type])) {
            return response()->json(['message' => 'Неверный тип справочника'], 400);
        }

        $modelClass = $models[$type];
        $item = new $modelClass();
        $name = $request->input('name');

        if ($type === 'categories') {
            $item->name = $name;
            // Генерируем slug из имени
            $item->slug = Str::slug($name); 
        } else {
            $item->title = $name;
        }

        switch ($type) {
            case 'faculties':
                $item->short_name = $request->input('short_name', '');
                $item->short_title = $request->input('short_title', '');
                $item->dean = $request->input('dean', 'Не назначен');
                break;

            case 'departments':
                $item->short_name = $request->input('short_name', '');
                $item->leader = $request->input('leader', 'Не назначен');
                $item->faculty_id = $request->input('faculty_id');
                break;
        }

        $item->save();
        return response()->json(['status' => 'success', 'item' => $item], 201);

    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

public function updateOption(Request $request, $id)
{
    try {
        $type = $request->input('type');
        $models = [
            'categories'  => \App\Models\Category::class,
            'faculties'   => \App\Models\Faculty::class,
            'departments' => \App\Models\Department::class,
        ];

        $item = $models[$type]::findOrFail($id);
        $name = $request->input('name');

        if ($type === 'categories') {
            $item->name = $name;
            // Обновляем slug при изменении имени
            $item->slug = Str::slug($name);
        } else {
            $item->title = $name;
        }

        // ... остальная часть метода updateOption без изменений ...
        if ($type === 'faculties') {
            $item->short_name = $request->input('short_name');
            $item->short_title = $request->input('short_title');
            $item->dean = $request->input('dean');
        }

        if ($type === 'departments') {
            $item->short_name = $request->input('short_name');
            $item->leader = $request->input('leader');
            $item->faculty_id = $request->input('faculty_id');
        }

        $item->save();
        return response()->json(['status' => 'success', 'item' => $item]);

    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}
    public function deleteOption(Request $request, $id)
    {
        try {
            $type = $request->query('type');
            $models = [
                'categories'  => \App\Models\Category::class,
                'faculties'   => \App\Models\Faculty::class,
                'departments' => \App\Models\Department::class,
            ];

            if (!isset($models[$type])) return response()->json(['message' => 'Тип не найден'], 400);

            $item = $models[$type]::findOrFail($id);
            $item->delete();

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}