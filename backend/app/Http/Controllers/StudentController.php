<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class StudentController extends Controller
{
    /**
     * Получение данных для страницы настроек
     */
    public function settings(Request $request)
    {
        $user = $request->user()->load(['faculty', 'department', 'courses']);

        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $user->mobile,
                'faculty' => $user->faculty?->name ?? 'Не указан',
                'department' => $user->department?->name ?? 'Не указана',
                'specialization' => $user->academic_specialization ?? 'Студент',
                'role' => $user->role,
            ],
            // Форматируем историю курсов (транзакции)
            'transactions' => $user->courses->map(function ($course) {
                return [
                    'id' => $course->id,
                    'course' => $course->title,
                    'date' => $course->pivot->created_at->format('d.m.Y'),
                    'type' => $course->pivot->status === 'approved' ? 'Активация' : 'Заявка: ' . $course->pivot->status,
                    'status' => $course->pivot->status
                ];
            })
        ]);
    }

    /**
     * Обновление разрешенных данных профиля
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'mobile' => 'nullable|string|max:20',
            'current_password' => 'nullable|required_with:new_password',
            'new_password' => ['nullable', Password::min(8)],
        ]);

        // Обновляем почту и телефон
        $user->email = $validated['email'];
        $user->mobile = $validated['mobile'];

        // Если пользователь хочет сменить пароль
        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Текущий пароль введен неверно'], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->save();

        return response()->json(['message' => 'Настройки успешно сохранены']);
    }


}