<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model {
    protected $fillable = ['title', 'description'];

    public function modules() {
        return $this->hasMany(Module::class)->orderBy('order');
    }
    public function students()
    {
        return $this->belongsToMany(User::class)->withPivot('progress')->withTimestamps();
    }
public function lessons()
{
    return $this->hasManyThrough(Lesson::class, Module::class);
}
    public function resources() { return $this->hasMany(CourseResource::class)->orderBy('order'); }
}