<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class TagTopic extends Pivot
{
    protected $table = 'tag_topic';
    
    // Если вы добавили инкрементный ID или кастомные поля
    public $timestamps = false;
    
}