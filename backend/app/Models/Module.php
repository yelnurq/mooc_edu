<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model {
    protected $fillable = ['course_id', 'title', 'order'];

    public function lessons() {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }
}
