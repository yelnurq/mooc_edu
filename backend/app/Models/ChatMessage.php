<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model {
    protected $fillable = ['chat_room_id', 'sender_id', 'content', 'is_read'];
    protected $casts = [
        'content' => 'encrypted', // Laravel сам зашифрует при записи и расшифрует при чтении
    ];    public function room() {
        return $this->belongsTo(ChatRoom::class, 'chat_room_id');
    }

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
}