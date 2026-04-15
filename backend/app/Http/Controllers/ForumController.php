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
    // 1. Инициализация запроса со всеми нужными счетчиками
    $query = Topic::with(['author', 'tags'])
        ->withCount([
            'positiveLikes as upvotes_count', 
            'negativeLikes as downvotes_count', 
            'replies as replies_count'
        ]);

    // 2. Базовые фильтры
    if ($request->boolean('my_topics')) {
        $query->where('user_id', auth()->id());
    }

    if ($request->filled('tag') && $request->tag !== 'Все') {
        $query->whereHas('tags', function($q) use ($request) {
            $q->where('name', $request->tag);
        });
    }

    if ($request->filled('search')) {
        // Поиск ведем по clean_title, чтобы не палить мат в поиске для юзеров
        $query->where('clean_title', 'like', '%' . $request->search . '%');
    }

    // 3. Логика сортировки и спец. фильтры
    $sort = $request->get('sort', 'latest');

    // Сначала всегда учитываем закрепленные темы
    $query->orderByDesc('is_pinned');

    switch ($sort) {
        case 'unanswered':
            // ФИЛЬТР: Только те темы, где количество ответов ровно 0
            $query->has('replies', '=', 0);
            $query->latest(); // Сортируем новые без ответов в начале
            break;

        case 'popular':
            $query->orderByRaw('(upvotes_count - downvotes_count) DESC');
            break;

        case 'discussed':
            $query->orderByDesc('replies_count');
            break;

        case 'latest':
        default:
            $query->latest();
            break;
    }

    // 4. Выполнение запроса с пагинацией
    $topics = $query->paginate(10);

    // 5. Трансформация данных (Модерация и роли)
    $isAdmin = auth()->user() && auth()->user()->role === 'admin';

    $topics->getCollection()->transform(function ($topic) use ($isAdmin) {
        // Определяем "плохой" контент
        $topic->is_bad = ($topic->title !== $topic->clean_title) || ($topic->content !== $topic->clean_content);

        if (!$isAdmin) {
            // Обычный юзер видит только чистую версию
            $topic->title = $topic->clean_title;
            $topic->content = $topic->clean_content;
        } else {
            // Админ видит оригинал, если там есть мат — добавляем метку
            if ($topic->is_bad) {
                $topic->title = "[⚠️ MODERATION] " . $topic->title;
            }
        }

        // Скрываем технические поля из API ответа
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
        'tags' => 'required|array', 
    ]);

    $originalTitle = $request->title;
    $originalContent = $request->content;

    // Получаем структурированный ответ от ИИ
    $censoredData = $this->censorWithAI($originalTitle, $originalContent);
    
    $cleanTitle = $censoredData['title'] ?? $originalTitle;
    $cleanContent = $censoredData['content'] ?? $originalContent;

    // ПРОВЕРКА: Если заголовок или контент изменились после цензуры — ставим true
    $isBad = ($originalTitle !== $cleanTitle) || ($originalContent !== $cleanContent);

    // 1. Создаем топик с полем is_bad
    $topic = Topic::create([
        'user_id' => auth()->id(),
        'title' => $originalTitle,
        'content' => $originalContent,
        'clean_title' => $cleanTitle,
        'clean_content' => $cleanContent,
        'is_bad' => $isBad, // Сохраняем результат проверки
    ]);

    // 2. СОХРАНЯЕМ ТЕГИ
    if ($request->has('tags')) {
        $topic->tags()->sync($request->tags);
    }

    // Подгружаем связи
    $topic->load(['tags', 'author']);

    // Для фронтенда подменяем данные на "чистые" (или оставляем как есть, если вы Admin)
    $isAdmin = auth()->user() && auth()->user()->role === 'admin';
    
    if (!$isAdmin) {
        $topic->title = $topic->clean_title;
        $topic->content = $topic->clean_content;
    }

    // Удаляем технические поля перед отправкой
    unset($topic->clean_title);
    unset($topic->clean_content);

    return response()->json($topic);
}
public function vote($id, Request $request)
{
    // Валидируем значение: 1 (лайк) или -1 (дизлайк)
    $value = $request->input('value') == 1 ? 1 : -1;
    $topic = Topic::findOrFail($id);
    $userId = auth()->id();

    // Ищем существующую оценку (любую: и лайк, и дизлайк)
    $existingVote = $topic->likes()->where('user_id', $userId)->first();

    if ($existingVote) {
        if ($existingVote->value == $value) {
            // Если нажал на ту же кнопку второй раз — отменяем оценку полностью
            $existingVote->delete();
            $status = 'removed';
        } else {
            // Если нажал на противоположную кнопку — меняем 1 на -1 или наоборот
            $existingVote->update(['value' => $value]);
            $status = 'changed';
        }
    } else {
        // Если оценки не было — создаем новую
        $topic->likes()->create([
            'user_id' => $userId,
            'value' => $value
        ]);
        $status = 'added';
    }

    return response()->json([
        'status' => $status,
        'rating' => $topic->likes()->sum('value'), // Возвращаем актуальный баланс
        'user_vote' => $status === 'removed' ? 0 : $value // Чтобы фронт знал, что подсветить
    ]);
}
}