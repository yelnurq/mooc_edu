<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
public function index(Request $request)
{
    $query = User::query();

    // Фильтрация (оставляем как есть...)
    if ($request->filled('search')) {
        $s = $request->search;
        $query->where(function($q) use ($s) {
            $q->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%");
        });
    }

    // Пагинация
    $users = $query->latest()->paginate(10);

    // СТАТИСТИКА (Важно: считаем её здесь!)
    $stats = [
        'total'    => User::count(),
        'teachers' => User::whereIn('role', ['teacher', 'head_of_dept', 'dean'])->count(),
        'students' => User::where('role', 'student')->count(),
        'admins'   => User::where('role', 'super_admin')->count(),
    ];

    // ВНИМАНИЕ: Возвращаем структуру, которую ждет фронтенд
    return response()->json([
        'status' => 'success',
        'data'   => $users->items(), // Массив пользователей
        'meta'   => [
            'current_page' => $users->currentPage(),
            'last_page'    => $users->lastPage(),
            'total'        => $users->total(),
        ],
        'stats'  => $stats // Объект статистики
    ]);
}
}
