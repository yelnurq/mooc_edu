<?php

namespace App\Http\Middleware;

use App\Models\Token;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TokenCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if(!$token || !Token::where("token", $token)->exists()) {
            return response()->json([
                "status"=>"unsuccess",
                "message"=>401
            ], 401);
        }
        return $next($request);
    }
}
