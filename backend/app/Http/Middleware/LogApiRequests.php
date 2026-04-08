<?php

namespace App\Http\Middleware;

use App\Models\Token;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequests
{
    private function getAuthenticatedUser(Request $request)
    {
        $bearerToken = $request->bearerToken();
        if (!$bearerToken) return null;

        $tokenRecord = Token::where("token", $bearerToken)->first();
        if (!$tokenRecord) return null;

        // Возвращаем только ID, чтобы не тянуть весь объект в память
        return $tokenRecord->user_id;
    }    
public function handle(Request $request, Closure $next): Response
{
    $startTime = microtime(true);
    $userId = $this->getAuthenticatedUser($request);

    $response = $next($request);

    $duration = round((microtime(true) - $startTime) * 1000); 

    // Получаем контент
    $content = $response->getContent();

    // ПРОВЕРКА: Если ответ слишком большой, не режем строку, а создаем новый объект
    if (mb_strlen($content) > 5000) {
        $safeResponse = json_encode([
            'message' => 'Response truncated (too large)',
            'original_size' => mb_strlen($content),
            // Берем чуть-чуть для превью, но через json_encode, чтобы не сломать кодировку
            'preview' => mb_substr($content, 0, 500) . '...'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        // Проверяем, является ли контент валидным JSON
        json_decode($content);
        if (json_last_error() === JSON_ERROR_NONE) {
            $safeResponse = $content;
        } else {
            // Если это не JSON (например, HTML ошибка), принудительно кодируем в JSON
            $safeResponse = json_encode(['raw_body' => mb_substr($content, 0, 5000)], JSON_UNESCAPED_UNICODE);
        }
    }

    // Вставляем в базу
    try {
        DB::table('api_logs')->insert([
            'user_id'     => $userId,
            'method'      => $request->method(),
            'url'         => $request->fullUrl(),
            'payload'     => json_encode($request->except(['password', 'password_confirmation']), JSON_UNESCAPED_UNICODE), 
            'response'    => $safeResponse,
            'ip_address'  => $request->ip(),
            'duration_ms' => $duration,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    } catch (\Exception $e) {
        // Если лог не записался, не ломаем основную работу приложения
        \Illuminate\Support\Facades\Log::error('API Log failed: ' . $e->getMessage());
    }

    return $response;
}
}