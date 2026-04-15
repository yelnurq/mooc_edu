<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reply;
use App\Models\Topic;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ForumController extends Controller {
    
  public function index(Request $request) {
    $query = Topic::with(['author', 'tags'])->withCount('replies');

    // Фильтр: Только мои вопросы
    if ($request->boolean('my_topics')) {
        // Убедись, что поле в БД называется user_id или author_id
        $query->where('user_id', auth()->id());
    }

    // Фильтр по тегам
    if ($request->filled('tag')) {
        $query->whereHas('tags', function($q) use ($request) {
            $q->where('name', $request->tag);
        });
    }

    // Поиск по заголовку
    if ($request->filled('search')) {
        $query->where('title', 'like', '%' . $request->search . '%');
    }

    // Сначала закрепленные, потом новые
    return response()->json(
        $query->orderBy('is_pinned', 'desc')
              ->latest()
              ->paginate(10)
    );
}

    public function getTags() {
        // Возвращаем все теги
        return response()->json(Tag::all());
    }
public function show($id)
{
    $topic = Topic::with('author', 'tags')->findOrFail($id);
    $comments = $topic->comments()->with('author')->get(); // Убедись, что связь создана
    
    // Если нужно обновить просмотры
    $topic->increment('views');

    return response()->json([
        'topic' => $topic,
        'comments' => $comments
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
public function store(Request $request)
{
    $validated = $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'required|string',
        'tags'    => 'required|array', // Массив ID тегов
    ]);

    // Создаем тему
    $topic = Topic::create([
        'title'   => $validated['title'],
        'content' => $validated['content'],
        'user_id' => Auth::id(), // Берем ID из токена (интерцептор его передает)
    ]);

    // Привязываем теги в таблицу tag_topic
    $topic->tags()->attach($validated['tags']);

    return response()->json([
        'message' => 'Тема успешно создана',
        'topic'   => $topic->load('tags')
    ], 201);
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