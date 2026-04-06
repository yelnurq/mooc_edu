<?php

namespace App\Http\Middleware;

use App\Models\Token;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Не забудь импорт!
use Symfony\Component\HttpFoundation\Response;

class TokenCheck
{
    public function handle(Request $request, Closure $next): Response
    {
        $tokenStr = $request->bearerToken();
        
        // 1. Ищем токен в твоей таблице вместе с пользователем
        $tokenData = Token::where("token", $tokenStr)->with('user')->first();

        if (!$tokenStr || !$tokenData || !$tokenData->user) {
            return response()->json([
                "status" => "error",
                "message" => "Unauthorized"
            ], 401);
        }

        // 2. ВАЖНЫЙ МОМЕНТ: Принудительно логиним юзера в контейнер Laravel
        // Теперь Auth::user() в контроллерах не будет null!
        Auth::login($tokenData->user);

        return $next($request);
    }
}