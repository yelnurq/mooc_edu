<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reply extends Model
{
    protected $fillable = ['content', 'topic_id', 'user_id'];

    // К какой теме относится комментарий
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    // Кто написал комментарий
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Аксессор для времени комментария
    protected $appends = ['time_ago'];
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}