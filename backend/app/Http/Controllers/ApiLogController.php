<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApiLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 50);
            
            // Начинаем запрос к таблице api_logs
            $query = DB::table('api_logs')
                ->leftJoin('users', 'api_logs.user_id', '=', 'users.id')
                ->select(
                    'api_logs.*',
                    'users.name as user_name',
                    'users.role as user_role'
                );

            // Фильтр по методу (GET, POST и т.д.)
            if ($request->filled('method')) {
                $query->where('api_logs.method', $request->method);
            }

            // Поиск по URL или имени пользователя
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('api_logs.url', 'like', "%{$search}%")
                      ->orWhere('users.name', 'like', "%{$search}%");
                });
            }

            $logs = $query->orderBy('api_logs.created_at', 'desc')
                          ->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $logs->items(),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'total' => $logs->total(),
                    'per_page' => $logs->perPage(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // Метод для просмотра деталей конкретного лога (например, большого JSON ответа)
    public function show($id)
    {
        $log = DB::table('api_logs')
            ->leftJoin('users', 'api_logs.user_id', '=', 'users.id')
            ->select('api_logs.*', 'users.name as user_name')
            ->where('api_logs.id', $id)
            ->first();

        if (!$log) {
            return response()->json(['message' => 'Лог не найден'], 404);
        }

        // Декодируем JSON для удобства фронтенда
        $log->payload = json_decode($log->payload);
        $log->response = json_decode($log->response) ?: $log->response;

        return response()->json(['status' => 'success', 'data' => $log]);
    }
}