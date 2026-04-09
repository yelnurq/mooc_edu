<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'option_text',
        'is_correct',
    ];

    // Приведение типов (чтобы в JS приходило true/false, а не 1/0)
    protected $casts = [
        'is_correct' => 'boolean',
    ];

    /**
     * Вариант принадлежит конкретному вопросу
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}