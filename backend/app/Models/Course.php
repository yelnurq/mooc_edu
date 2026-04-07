<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model {
    protected $fillable = ['title', 'image', 'description'];
    protected $appends = ['author_display_name'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function getAuthorDisplayNameAttribute()
    {
        if ($this->author_type === 'user' && $this->author) {
            return $this->author->name;
        }
        
        return $this->custom_author_name ?? 'Анонимный автор';
    }
    public function modules() {
        return $this->hasMany(Module::class)->orderBy('order');
    }
    public function students()
    {
        return $this->belongsToMany(User::class)->withPivot('progress')->withTimestamps();
    }
    public function users()
    {
        return $this->belongsToMany(User::class, 'course_user')
                    ->withPivot('progress')
                    ->withTimestamps();
    }
public function lessons()
{
    return $this->hasManyThrough(Lesson::class, Module::class);
}
    public function resources() { return $this->hasMany(CourseResource::class)->orderBy('order'); }
}