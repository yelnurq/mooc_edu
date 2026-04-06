<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model {
    protected $fillable = ['module_id', 'title', 'type', 'file_path', 'video_url', 'order'];
    
    // Добавляем виртуальное поле file_url для фронтенда
    protected $appends = ['file_url'];

    public function getFileUrlAttribute() {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }
}
