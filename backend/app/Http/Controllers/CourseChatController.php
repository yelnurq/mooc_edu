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
        'content' => 'required|string',
        'chat_room_id' => 'required_without:course_id|nullable',
        'course_id' => 'required_without:chat_room_id|nullable',
    ]);

    $userId = Auth::id();
    $roomId = $request->chat_room_id;

    if (!$roomId) {
        $course = Course::findOrFail($request->course_id);
        
        // ВАЖНО: Проверяем, как называется колонка автора. 
        // Если author_id пустой, пробуем взять user_id
        $authorId = $course->author_id ?? $course->user_id;

        if (!$authorId) {
            return response()->json([
                'message' => "Ошибка: У курса #{$course->id} не найден ID автора. Проверьте поле author_id или user_id в таблице courses."
            ], 422);
        }

        // Ищем существующую комнату или создаем новую
        $room = ChatRoom::where('course_id', $course->id)
                        ->where('student_id', $userId)
                        ->first();

        if (!$room) {
            $room = ChatRoom::create([
                'course_id'       => $course->id,
                'student_id'      => $userId,
                'author_id'       => $authorId, 
                'last_message_at' => now(),
            ]);
        }
        $roomId = $room->id;
    }

    // Создаем сообщение (используем ChatMessage, как в вашей модели)
    $message = ChatMessage::create([
        'chat_room_id' => $roomId,
        'sender_id'    => $userId,
        'content'      => $request->content,
        'is_read'      => false
    ]);

    ChatRoom::where('id', $roomId)->update(['last_message_at' => now()]);

    return response()->json(array_merge($message->toArray(), [
        'chat_room_id' => $roomId
    ]));
}  
}