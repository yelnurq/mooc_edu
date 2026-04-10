<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    protected $guarded =[];
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
