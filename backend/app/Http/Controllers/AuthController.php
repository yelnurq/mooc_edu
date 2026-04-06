<?php

namespace App\Http\Controllers;

use App\Models\Token;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'mobile' => 'nullable|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'faculty_id' => 'nullable|exists:faculties,id',
                'department_id' => 'nullable|exists:departments,id',
            ]);

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
            return response()->json([
                'status' => 'error',
                'message' => 'Внутренняя ошибка сервера',
                "debug" => $e->getMessage(),
            ], 422);
        }
    }
    public function login(Request $request)
{
    $rules = [
        "email"    => "required|string", 
        "password" => "required|string",
    ];  

    $validator = Validator::make($request->all(), $rules);
    if ($validator->fails()) {
        return response()->json(["status" => "error", "errors" => $validator->errors()], 422);
    }

 


    $user = User::where("email", $request->email)->first();


    if (!$user) {
        return response()->json([
            "status"  => "error",
            "message" => "Неверный логин или пароль",
        ], 401);
    }

    // --- 4. ГЕНЕРАЦИЯ ТОКЕНА ---
    try {
        Token::where('user_id', $user->id)->delete(); 
        $tokenValue = Str::random(60);
        $token = Token::create([
            "token"   => $tokenValue,
            "user_id" => $user->id,    
        ]);

        return response()->json([
            "status"       => "success",
            "access_token" => $token,
            "user"         => $user
        ]);
    } catch (\Exception $e) {
        return response()->json(["status" => "error", "message" => "Ошибка авторизации"], 500);
    }
}
    public function logout(Request $request)
    {
        try {
            $tokenRecord = $request->bearerToken();
            $token = Token::where("token", $tokenRecord)->first();
            $token->delete();

            return response()->json([
                "status" => "success",
                "message" => "Вы успешно вышли из системы",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Ошибка при выходе",
                "debug"=>$e->getMessage(),
            ], 500);
        }
    }
}
