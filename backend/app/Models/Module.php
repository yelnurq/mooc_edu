<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model {
    protected $fillable = ['course_id', 'title', 'order'];

    public function lessons() {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }
    public function quiz() {
        return $this->morphOne(Quiz::class, 'quizable');
    }
    public function course() {
    return $this->belongsTo(Course::class);
}
}
