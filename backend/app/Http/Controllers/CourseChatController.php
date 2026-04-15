<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CourseChatController extends Controller 
{
    // Список всех диалогов пользователя
public function index() 
{
    $userId = Auth::id();

    // 1. Получаем все курсы, на которые подписан пользователь и которые ОДОБРЕНЫ
    $myEnrolledCourses = DB::table('course_user')
        ->where('user_id', $userId)
        ->where('status', 'approved')
        ->pluck('course_id');

    // 2. Загружаем эти курсы с их авторами
    $courses = Course::whereIn('id', $myEnrolledCourses)
        ->with('author:id,name')
        ->get();

    // 3. Получаем существующие комнаты для этих курсов, чтобы знать, где уже есть переписка
    $existingRooms = ChatRoom::where('student_id', $userId)
        ->withCount(['messages' => function($query) use ($userId) {
            $query->where('is_read', false)->where('sender_id', '!=', $userId);
        }])
        ->get()
        ->keyBy('course_id');

    // 4. Формируем единый список для фронтенда
    $chatList = $courses->map(function($course) use ($existingRooms) {
        $room = $existingRooms->get($course->id);
        
        return [
            'course_id' => $course->id,
            'course_title' => $course->title,
            'author_name' => $course->author->name ?? $course->custom_author_name ?? 'Автор',
            'author_id' => $course->author_id,
            'chat_room_id' => $room ? $room->id : null, // Если null - чат еще не начат
            'unread_count' => $room ? $room->messages_count : 0,
            'last_message_at' => $room ? $room->last_message_at : null,
        ];
    })->sortByDesc('last_message_at')->values();

    return response()->json([
        'chats' => $chatList
    ]);
}
    // Инициализация чата через курс
    public function startChat(Request $request) 
    {
        $request->validate(['course_id' => 'required|exists:courses,id']);
        
        $course = Course::findOrFail($request->course_id);

        if (!$course->author_id) {
            return response()->json(['message' => 'Автор курса не найден'], 404);
        }

        // Если студент пытается написать самому себе (если он автор)
        if ($course->author_id === Auth::id()) {
            return response()->json(['message' => 'Вы являетесь автором этого курса'], 400);
        }

        $room = ChatRoom::firstOrCreate([
            'course_id' => $course->id,
            'student_id' => Auth::id(),
            'author_id' => $course->author_id
        ]);

        return response()->json($room->load(['course', 'author']));
    }

    // История сообщений
    public function getMessages($roomId) 
    {
        $room = ChatRoom::findOrFail($roomId);
        $userId = Auth::id();
        
        if ($userId !== $room->student_id && $userId !== $room->author_id) {
            return response()->json(['message' => 'Нет доступа к этому чату'], 403);
        }

        // Помечаем как прочитанные
        ChatMessage::where('chat_room_id', $roomId)
            ->where('sender_id', '!=', $userId)
            ->update(['is_read' => true]);

        return ChatMessage::where('chat_room_id', $roomId)
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    // Отправка сообщения
    public function sendMessage(Request $request) 
    {
        $request->validate([
            'chat_room_id' => 'required|exists:chat_rooms,id',
            'content' => 'required|string|max:5000'
        ]);

        $room = ChatRoom::findOrFail($request->chat_room_id);
        $userId = Auth::id();

        if ($userId !== $room->student_id && $userId !== $room->author_id) {
            return response()->json(['message' => 'Ошибка доступа'], 403);
        }

        $message = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_id' => $userId,
            'content' => $request->content
        ]);

        $room->update(['last_message_at' => now()]);

        return response()->json($message->load('sender:id,name'));
    }
    
}