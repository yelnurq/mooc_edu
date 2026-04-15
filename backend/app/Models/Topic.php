<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    protected $fillable = ['clean_title','clean_content','title', 'content', 'user_id', 'is_pinned', 'views', 'is_bad'];

    // Автоматически добавляем эти поля в JSON ответ
    protected $appends = ['time_ago', 'is_liked', 'likes_count'];

    // Связь с автором (пользователем)
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
public function likes()
{
    return $this->morphMany(Like::class, 'likeable');
}

// Проверка, лайкнул ли текущий юзер
public function getIsLikedAttribute()
{
    return $this->likes()->where('user_id', auth()->id())->exists();
}

// Количество лайков
public function getLikesCountAttribute()
{
    return $this->likes()->count();
}

// Не забудь добавить в $appends, чтобы эти поля улетали во фронтенд
    // Связь с тегами (Многие-ко-многим)
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    // Связь с комментариями (Один-ко-многим)
    public function comments(): HasMany
    {
        return $this->hasMany(Reply::class);
    }
      public function replies(): HasMany
    {
        return $this->hasMany(Reply::class);
    }


    // Аксессор для вывода даты как "2 часа назад" или "1 день назад"
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}