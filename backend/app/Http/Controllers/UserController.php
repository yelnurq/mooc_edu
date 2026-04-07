<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Получение списка пользователей с фильтрацией и пагинацией
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Поиск по имени, почте или телефону
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('mobile', 'like', "%{$request->search}%");
            });
        }

        // Фильтр по роли
        if ($request->role && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
            'stats' => [
                'total' => User::count(),
                'teachers' => User::where('role', 'teacher')->count(),
                'students' => User::where('role', 'student')->count(),
                'admins' => User::where('role', 'super_admin')->count(),
            ]
        ]);
    }

    /**
     * Создание нового пользователя
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'nullable|string',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,teacher,dean,head_of_dept,academic_office,super_admin',
            'faculty_id' => 'nullable|exists:faculties,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        
        $user = User::create($validated);

        return response()->json(['status' => 'success', 'user' => $user]);
    }

    /**
     * Обновление данных пользователя
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'mobile' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:student,teacher,dean,head_of_dept,academic_office,super_admin',
            'faculty_id' => 'nullable|exists:faculties,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        // Если пароль пришел пустым — не обновляем его
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json(['status' => 'success', 'user' => $user]);
    }

    /**
     * Удаление пользователя
     */
    public function destroy(User $user)
    {
        // Защита от удаления самого себя
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Нельзя удалить свой аккаунт'], 403);
        }

        $user->delete();
        return response()->json(['status' => 'success']);
    }
}