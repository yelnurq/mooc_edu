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
        try {
            // Валидируем данные
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'mobile' => 'nullable|string',
                'faculty_id' => 'nullable|exists:faculties,id',
                'department_id' => 'nullable|exists:departments,id',
            ]);

            // Создаем пользователя, хэшируя пароль отдельно
            $userData = $request->only(['name', 'email', 'mobile', 'faculty_id', 'department_id']);
            $userData['password'] = Hash::make($request->password);

            $user = User::create($userData);
            return response()->json([
                'status'  => 'success',
                'message' => 'Сотрудник успешно создан',
                'user'    => $user
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Внутренняя ошибка сервера',
                'debug'   => $e->getMessage(),
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