<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model {
    protected $fillable = ['course_id', 'student_id', 'author_id', 'last_message_at'];

    public function messages() {
        return $this->hasMany(ChatMessage::class);
    }

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function author() {
        return $this->belongsTo(User::class, 'author_id');
    }
}