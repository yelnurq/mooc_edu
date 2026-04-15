<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseChatController extends Controller 
{
    // Список всех диалогов пользователя
 public function index() 
{
    $userId = Auth::id();

    // 1. Получаем существующие активные чаты
    $activeRooms = ChatRoom::with(['course:id,title', 'author:id,name', 'student:id,name'])
        ->where('student_id', $userId)
        ->orWhere('author_id', $userId)
        ->withCount(['messages' => function($query) use ($userId) {
            $query->where('is_read', false)->where('sender_id', '!=', $userId);
        }])
        ->orderBy('last_message_at', 'desc')
        ->get();

    // 2. Получаем курсы, на которые записан студент (если у тебя есть таблица course_user или аналогичная)
    // Если логика простая: студент видит все курсы, где он не автор:
    $availableCourses = Course::where('author_id', '!=', $userId)
        ->with('author:id,name')
        ->get();

    return response()->json([
        'active_rooms' => $activeRooms,
        'available_courses' => $availableCourses
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
    // 1. Получить курсы, на которые студент подписан, но по которым еще НЕТ чата
public function getAvailableCourses() {
    $studentId = auth()->id();
    
    // Предположим, подписки хранятся в таблице course_student
    $courses = Course::whereHas('students', function($q) use ($studentId) {
            $q->where('user_id', $studentId);
        })
        ->whereDoesntHave('chatRooms', function($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })
        ->with('author:id,name') // Загружаем ментора
        ->get()
        ->map(function($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'mentor_name' => $course->author->name
            ];
        });

    return response()->json($courses);
}

// 2. Создать комнату
public function createRoom(Request $request) {
    $course = Course::findOrFail($request->course_id);
    
    // Создаем или находим комнату
    $room = ChatRoom::firstOrCreate([
        'course_id' => $course->id,
        'student_id' => auth()->id(),
        'author_id' => $course->user_id // ID ментора (автора курса)
    ]);

    // Возвращаем комнату со связями для фронтенда
    return response()->json($room->load(['author', 'course']));
}
}