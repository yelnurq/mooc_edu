<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reply;
use App\Models\Topic;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class ForumController extends Controller {
    
private function censorWithAI($title, $content) {
    try {
        $response = Http::withToken(env('OPENAI_API_KEY'))
            ->timeout(10) // Добавляем таймаут на всякий случай
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system', 
                        'content' => 'Ты — модератор. Проверь заголовок и контент на маты и оскорбления. Замени их на "***". Верни ответ СТРОГО в формате JSON: {"title": "...", "content": "..."}. Не пиши ничего, кроме JSON.'
                    ],
                    [
                        'role' => 'user', 
                        'content' => "Title: $title \nContent: $content"
                    ]
                ],
                'response_format' => ['type' => 'json_object'], // Форсируем JSON режим (для моделей 4o/4o-mini)
                'temperature' => 0
            ]);

        $data = $response->json('choices.0.message.content');
        return json_decode($data, true); // Превращаем строку JSON в массив PHP
    } catch (\Exception $e) {
        // Если API упало, возвращаем оригиналы
        return [
            'title' => $title,
            'content' => $content
        ];
    }
}
public function index(Request $request) {
    $query = Topic::with(['author', 'tags'])->withCount('replies');

    // Фильтр: Только мои вопросы
    if ($request->boolean('my_topics')) {
        $query->where('user_id', auth()->id());
    }

    // Фильтр по тегам
    if ($request->filled('tag')) {
        $query->whereHas('tags', function($q) use ($request) {
            $q->where('name', $request->tag);
        });
    }

    // Поиск по зацензуренному заголовку
    if ($request->filled('search')) {
        $query->where('clean_title', 'like', '%' . $request->search . '%');
    }

    // Получаем пагинацию
    $topics = $query->orderBy('is_pinned', 'desc')
                    ->latest()
                    ->paginate(10);

    // Проверяем, является ли пользователь админом
    // (Замени на свою логику проверки ролей, например $user->hasRole('admin'))
    $isAdmin = auth()->user() && auth()->user()->role === 'admin';

    // Трансформируем коллекцию
    $topics->getCollection()->transform(function ($topic) use ($isAdmin) {
        if (!$isAdmin) {
            // Если НЕ админ: подменяем оригинальные поля зацензуренными
            $topic->title = $topic->clean_title;
            $topic->content = $topic->clean_content;
        } else {
            // Если админ: можно добавить префикс или оставить как есть
            $topic->title = "[ORG] " . $topic->title;
        }

        // Скрываем служебные поля clean_ из JSON ответа, чтобы не дублировать данные
        unset($topic->clean_title);
        unset($topic->clean_content);

        return $topic;
    });

    return response()->json($topics);
}
    public function getTags() {
        // Возвращаем все теги
        return response()->json(Tag::all());
    }
public function show($id)
{
    // Загружаем тему со всеми связями
    $topic = Topic::with(['author', 'tags', 'comments.author'])->findOrFail($id);
    
    // Увеличиваем просмотры
    $topic->increment('views');

    // Проверка прав (админ или нет)
    $isAdmin = auth()->user() && auth()->user()->role === 'admin';

    // 1. Обработка основной темы
    if (!$isAdmin) {
        // Подменяем оригинал на чистую версию для студента
        $topic->title = $topic->clean_title;
        $topic->content = $topic->clean_content;
    }

    // Удаляем технические поля из JSON
    unset($topic->clean_title);
    unset($topic->clean_content);

    // 2. Обработка комментариев (если в них тоже есть цензура)
    $topic->comments->each(function ($comment) use ($isAdmin) {
        if (!$isAdmin && isset($comment->clean_content)) {
            $comment->content = $comment->clean_content;
        }
        
        // Прячем техническое поле
        unset($comment->clean_content);
    });

    return response()->json([
        'topic' => $topic,
        'comments' => $topic->comments // Используем уже загруженную и обработанную коллекцию
    ]);
}
public function storeComment(Request $request, $id)
{
    $validated = $request->validate(['content' => 'required|string']);

    $comment = Reply::create([
        'content' => $validated['content'],
        'topic_id' => $id,
        'user_id' => auth()->id()
    ]);

    return response()->json([
        'comment' => $comment->load('author')
    ], 201);
}
public function store(Request $request) {
    $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'tags' => 'required|array', // Добавляем валидацию массива тегов
    ]);

    $originalTitle = $request->title;
    $originalContent = $request->content;

    // Получаем структурированный ответ от ИИ
    $censoredData = $this->censorWithAI($originalTitle, $originalContent);
    
    $cleanTitle = $censoredData['title'] ?? $originalTitle;
    $cleanContent = $censoredData['content'] ?? $originalContent;

    // 1. Создаем топик
    $topic = Topic::create([
        'user_id' => auth()->id(),
        'title' => $originalTitle,
        'content' => $originalContent,
        'clean_title' => $cleanTitle,
        'clean_content' => $cleanContent,
    ]);

    // 2. СОХРАНЯЕМ ТЕГИ (Привязываем ID тегов к топику)
    if ($request->has('tags')) {
        // Метод sync() запишет ID тегов в промежуточную таблицу topic_tag
        $topic->tags()->sync($request->tags);
    }

    // Подгружаем теги для ответа фронтенду, чтобы они сразу отобразились
    $topic->load('tags');

    // Для фронтенда подменяем данные на "чистые"
    $topic->title = $topic->clean_title;
    $topic->content = $topic->clean_content;

    return response()->json($topic);
}
public function toggleLike($id)
{
    $topic = Topic::findOrFail($id);
    // Используем auth()->id(), чтобы не дергать весь объект User
    $userId = auth()->id(); 

    $like = $topic->likes()->where('user_id', $userId)->first();

    if ($like) {
        $like->delete();
        return response()->json([
            'status' => 'unliked', 
            'likes_count' => $topic->likes()->count()
        ]);
    } else {
        $topic->likes()->create(['user_id' => $userId]);
        return response()->json([
            'status' => 'liked', 
            'likes_count' => $topic->likes()->count()
        ]);
    }
}
}