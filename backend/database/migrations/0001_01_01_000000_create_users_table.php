<?php

namespace App\Http\Controllers;

use App\Models\Token;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    /**
     * Регистрация нового сотрудника
     */
    public function register(Request $request)
    {
        // 1. Валидация ДО блока try-catch
        // Если она не пройдет, Laravel сам вернет 422 ошибку со списком полей
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'faculty_id' => 'nullable|exists:faculties,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        try {
            // 2. Только логика создания в блоке try
            $user = User::create([
                'name' => $validated['name'],
                'mobile' => $validated['mobile'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'faculty_id' => $validated['faculty_id'],
                'department_id' => $validated['department_id'],
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Сотрудник успешно создан',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            // Здесь ловим только реальные ошибки БД или сервера
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при сохранении в базу данных',
                'debug' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Авторизация
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // 1. Поиск пользователя
        $user = User::where("email", $validated['email'])->first();

        // 2. Проверка существования и пароля (ВАЖНО!)
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                "status"  => "error",
                "message" => "Неверный логин или пароль",
            ], 401);
        }

        try {
            // 3. Удаляем старые токены (если нужна только одна активная сессия)
            Token::where('user_id', $user->id)->delete(); 

            // 4. Генерация нового токена
            $tokenValue = Str::random(60);
            $token = Token::create([
                "token"   => $tokenValue,
                "user_id" => $user->id,    
            ]);

            return response()->json([
                "status"       => "success",
                "access_token" => $tokenValue,
                "user"         => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "status"  => "error", 
                "message" => "Ошибка при создании сессии",
                "debug"   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Выход из системы
     */
    public function logout(Request $request)
    {
        try {
            $bearerToken = $request->bearerToken();
            
            if ($bearerToken) {
                Token::where("token", $bearerToken)->delete();
            }

            return response()->json([
                "status"  => "success",
                "message" => "Вы успешно вышли из системы",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "status"  => "error",
                "message" => "Ошибка при выходе",
                "debug"   => $e->getMessage(),
            ], 500);
        }
    }
}