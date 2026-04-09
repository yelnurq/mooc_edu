<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Quiz extends Model {
    protected $fillable = ['title', 'description', 'quizable_id', 'quizable_type'];

    /**
     * Получить родительскую модель (Course или Module).
     */
    public function quizable(): MorphTo {
        return $this->morphTo();
    }
    public function questions() {
    return $this->hasMany(Question::class);
}
}